import { getItemAsync, setItemAsync } from "expo-secure-store";
import { BookProvider } from "./book-provider";
import { useAppDispatch } from "@/utils/hooks";
import { setDropboxInitialized, setDropboxTokens } from "@/utils/slices/book-provider-slice";
import { BookDb } from "../db/schema";
import { addBook, addBookChapter, setBookThumbnail } from "../db/db";
import { SQLiteDatabase } from "expo-sqlite";
import { getAudiobookDir, safeEncodeFileName } from "../file-system";
import { Directory, File } from "expo-file-system";
import FileExplorerEntry from "@/components/atoms/FileExplorerEntry";
import { fetch as expoFetch } from 'expo/fetch';

const dropboxRootApiUrl = 'https://api.dropboxapi.com/2';
const dropboxContentApiUrl = 'https://content.dropboxapi.com/2';

export type DropboxDirEntry = {
	'.tag': string,
	client_modified: string,
	content_hash: string,
	file_lock_info: {
		created: string,
		is_lockholder: boolean,
		lockholder_name: string,
	},
	has_explicit_shared_members: boolean,
	id: string,
	is_downloadable: boolean,
	name: string,
	path_display: string,
	path_lower: string,
	property_groups: any[],
	rev: string,
	server_modified: string,
	sharing_info: any,
	size: number
};

export type ListFolderResponse = {
	cursor: string,
	entries: DropboxDirEntry[],
	has_more: boolean,
}

export class DropboxProvider extends BookProvider {
	private accessToken?: string;
	private refreshToken?: string;
	private initialized: boolean = false;

	constructor(accessToken?: string, refreshToken?: string) {
		super();

		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}

	public static async init(): Promise<DropboxProvider> {
		console.log("init ran")
		let tokens = await this.fetchStoreToken();

		let dbp = new DropboxProvider(tokens.accessToken, tokens.refreshToken);
		// await dbp.verifyConnection(true);

		return dbp;
	}

	public static async verifyConnection(accessToken: string, initialize?: boolean): Promise<boolean> {
		let response = await DropboxProvider.fetchDropboxEndpoint('/check/user', {
			method: 'POST',
			body: JSON.stringify({ query: 'ping' }),
		}, accessToken);

		if (response.ok && response.status == 200) {
			let parsedMessage = await response.json();

			return parsedMessage.result === 'ping';
		}

		return false;
	}

	public static async listEntriesForDir(accessToken: string, path: string) {

		let response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
			method: 'POST',
			body: JSON.stringify({
				"include_deleted": false,
				"include_has_explicit_shared_members": false,
				"include_media_info": false,
				"include_mounted_folders": true,
				"include_non_downloadable_files": true,
				"path": path,
				"recursive": false
			}),
			headers: new Headers({
				'Authorization': 'Bearer ' + accessToken,
				// 'Authorization': 'Basic ' + btoa(process.env.EXPO_PUBLIC_DROPBOX_APP_KEY + ':' + process.env.EXPO_PUBLIC_DROPBOX_APP_SECRET),
				'Content-Type': 'application/json',
			})
		});

		// console.log(response)

		if (response.ok && response.status == 200) {
			return await response.json();
		}

		if (response.status == 401) {
			let body = await response.json();

			if (body.error && body.error_summary == 'expired_access_token/') {
				setItemAsync('dropbox-auth', '');
			}
		}
	}

	public isInitialized(): boolean {
		return this.initialized;
	}

	public static async fetchBooksInDir(accessToken: string, path: string, db: SQLiteDatabase) {
		const bookEntriesResponse: ListFolderResponse = await DropboxProvider.listEntriesForDir(accessToken, path);
		console.log(bookEntriesResponse)

		for (const bookEntry of bookEntriesResponse.entries) {
			// We don't want to handle non-dir entries
			if (bookEntry[".tag"] !== 'folder') continue;

			let book: BookDb = {
				title: bookEntry.name,
				local_path: '',
				provider_path: bookEntry.path_lower,
				downloaded: 0, // false
				thumbnail_path: null,
				duration: null,
				author: null,
				provider_id: 1,
			};
			console.log("path", book.provider_path)
			let chapterEntriesResponse: ListFolderResponse = await DropboxProvider.listEntriesForDir(accessToken, book.provider_path!);
			let newBookResponse = await addBook(db, book);
			let audiobookDir = getAudiobookDir(book.title, true);

			for (const chapterEntry of chapterEntriesResponse.entries) {
				if (chapterEntry[".tag"] == 'file') {
					let _tmpSplit = chapterEntry.name.split(".");
					let fileType = _tmpSplit[_tmpSplit.length - 1];

					switch (fileType) {
						case "m4b":
						case "mp3":
							await addBookChapter(db, {
								title: chapterEntry.name,
								duration: null,
								local_path: null,
								remote_path: chapterEntry.path_lower,
								downloaded: 0,
								chapter_order: null,
								book_id: newBookResponse.lastInsertRowId,
							});
							break;
						case "jpg":
						case "jpeg":
						case "png":
							let downloadedFile = await DropboxProvider.downloadFile(accessToken, chapterEntry, audiobookDir);

							console.log("hi here", chapterEntry.name, downloadedFile);

							if (downloadedFile) {
								await setBookThumbnail(db, downloadedFile.uri, newBookResponse.lastInsertRowId);
							}
							// set thumbnail
							break;
					}
				}
			}
		}

		// fetch initial path (this path is a container for audiobook titles)
		// add all paths that are dirs as audiobook title contenders
		// check if book exists (maybe validate that chapters haven't changed) time may be helpful
		// add chapters
	}

	public static async downloadFile(accessToken: string, fileEntry: DropboxDirEntry, dest: Directory): Promise<File | null> {
		let fileResponse = await expoFetch(dropboxContentApiUrl + '/files/download', {
			method: 'POST',
			headers: new Headers({
				'Authorization': 'Bearer ' + accessToken,
				'Dropbox-API-Arg': JSON.stringify({ path: fileEntry.id })
			}),
		});

		if (fileResponse.ok) {
			let file = new File(dest, safeEncodeFileName(fileEntry.name));

			file.write(await fileResponse.bytes());

			return file;
		} else {
			console.log(await fileResponse.text())
		}

		return null;
	}

	public static async fetchStoreToken(): Promise<{ accessToken: string, refreshToken: string }> {
		try {
			let dropboxAuthRaw = await getItemAsync('dropbox-auth');

			if (!dropboxAuthRaw) {
				throw new Error('No dropbox token found');
			}

			return JSON.parse(dropboxAuthRaw);
		} catch (error) {
			console.error(error);
			return { accessToken: '', refreshToken: '' };
		}
	}

	public static async fetchDropboxEndpoint(endpoint: string, options: RequestInit, accessToken: string) {
		return await fetch(dropboxRootApiUrl + endpoint, {
			...options,
			headers: new Headers({
				...options.headers,
				'Authorization': 'Bearer ' + accessToken,
				'Content-Type': 'application/json',
			}),
		});
	}

	public async validateAccessToken(): Promise<boolean> {
		// let response = await this.fetchDropboxEndpoint()
		return true;
	}
} 
