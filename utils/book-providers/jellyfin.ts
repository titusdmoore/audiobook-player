// import { fetch } from "expo/fetch";

import { SQLiteDatabase } from "expo-sqlite";
import { convertToValidFilename, encodeObjectToQueryParams, getPlayableById } from "..";
import { getAudiobookDir, mimeToExtension, ROOT_AUDIOBOOK_DIR } from "../file-system";
import { File } from "expo-file-system";
import { createItem } from "../db/db";

export type AuthenticateUserByNameResponse = {
	user: any | null;
	accessToken: string | null;
	errors?: { message: string };
};

export async function verifyApiKey(domain: string, accessToken: string): Promise<boolean> {
	let systemResponse = await fetch(`${domain}/System/Info`, {
		headers: new Headers({
			'accept': 'application/json',
			'Authorization': `MediaBrowser Token="${accessToken}"`
		})
	});

	return systemResponse.ok;
}

export async function fetchUser(domain: string, accessToken: string) {
	let userResponse = await fetch(`${domain}/Users/Me`, {
		headers: new Headers({
			'accept': 'application/json',
			'Authorization': `MediaBrowser Token="${accessToken}"`
		})
	});

	return userResponse;
}

export async function authenticateUserByName(domain: string, username: string, password: string) {
	try {
		let authResponse = await fetch(`${domain}/Users/AuthenticateByName`, {
			method: 'POST',
			body: JSON.stringify({ Username: username, Pw: password }),
			headers: new Headers({
				'accept': 'application/json',
				'Content-Type': 'application/json',
				'x-emby-authorization': 'Mediabrowser Client="audiobook-player", Device="mydevice", DeviceId="myid", Version="1.0.0"'
			}),
		});

		if (authResponse && authResponse.ok) {
			let { User, AccessToken } = await authResponse.json();
			return { user: User, accessToken: AccessToken };
		}

		return { user: null, errors: { message: 'Something went wrong with logging in.' } };
	} catch (error: any) {
		// Return error instead of throwing
		return { user: null, errors: { message: `Fetch failed: ${error.message}` } };
	}
}

export async function fetchItem(domain: string, accessToken: string, userId: string, id: string) {
	let response = await fetch(`${domain}/Users/${userId}/Items/${id}`, {
		headers: new Headers({
			'accept': 'application/json',
			'Authorization': `MediaBrowser Token="${accessToken}"`
		})
	});

	return response;
}

export async function getUserById(domain: string, id: string, accessToken: string) {
	let response = await fetch(`${domain}/Users/${id}`, {
		headers: new Headers({
			'accept': 'application/json',
			'Authorization': `MediaBrowser Token="${accessToken}"`
		})
	});

	return response;
}

export type FetchAudiobookOptions = {
	parentId?: string;
	limit?: number;
	startIndex?: number;
	enableTotalRecordCount?: boolean;
	enableImages?: boolean;
	sortBy?: string;
	excludeItemIds?: string[];
	searchTerm?: string;
};

export async function fetchAudiobooks(domain: string, accessToken: string, options?: FetchAudiobookOptions) {
	const defaultOptions: FetchAudiobookOptions = {
		parentId: '4e985111ed7f570b595204d82adb02f3',
		limit: 14,
		startIndex: 0,
	};

	let mergedOptions = {
		...defaultOptions,
		...options
	};

	console.log("params", encodeObjectToQueryParams(mergedOptions))
	console.log(accessToken)

	let response = await fetch(`${domain}/Items?${encodeObjectToQueryParams(mergedOptions)}`, {
		method: 'GET',
		headers: new Headers({
			'accept': 'application/json',
			'Authorization': `MediaBrowser Token="${accessToken}"`
		})
	});

	return response;
}

// Position is in Ticks which are Microseconds
export async function reportItemPlaying(domain: string, accessToken: string, userId: string, itemId: string, position: number) {
	let response = await fetch(`${domain}/Sessions/Playing`, {
		method: 'POST',
		body: JSON.stringify({ userId, ItemId: itemId }),
		headers: new Headers({
			'accept': 'application/json',
			'Authorization': `MediaBrowser Token="${accessToken}"`
		})
	});

	console.log('res', response)
	console.log(await response.json())
}

export async function downloadTitle(db: SQLiteDatabase, domain: string, accessToken: string, userId: string, titleId: string) {
	console.log(ROOT_AUDIOBOOK_DIR.info())
	if (!ROOT_AUDIOBOOK_DIR.info() && !ROOT_AUDIOBOOK_DIR.info().exists) {
		return;
	}

	try {
		let parentTitleRes = await fetchItem(domain, accessToken, userId, titleId);
		if (!parentTitleRes || !parentTitleRes.ok) {
			throw new Error('Unable to fetch audiobook title');
		}

		let parentTitle = await parentTitleRes.json();
		let titleDir = getAudiobookDir(parentTitle.Name, true);

		if (!titleDir) {
			throw new Error('Unable to create audiobook directory');
		}

		let imageRes = await File.downloadFileAsync(`${domain}/Items/${titleId}/Images/Primary?format=Jpg`, titleDir, { idempotent: true });

		let titleDbRes = await createItem(db, {
			name: parentTitle.Name,
			server_id: parentTitle.ServerId,
			etag: parentTitle.Etag,
			date_created: parentTitle.DateCreated ?? new Date().toUTCString(),
			date_last_media_added: parentTitle.DateLastMediaAdded,
			can_delete: parentTitle.CanDelete == 'true' ? 1 : 0,
			can_download: parentTitle.CanDownload == 'true' ? 1 : 0,
			parent_id: parentTitle.ParentId,
			id: parentTitle.Id,
			duration: 0,
			sort_name: parentTitle.SortName,
			remote_path: parentTitle.Path ?? '',
			local_path: titleDir.uri,
			local_image_path: imageRes.uri,
			downloaded: 1,
			parent_db_id: null,
			artist: null,
		});

		let audiobooksRes = await fetchAudiobooks(domain, accessToken, { parentId: titleId, limit: parentTitle.RecursiveItemCount });
		if (!audiobooksRes || !audiobooksRes.ok) {
			throw new Error('Unable to fetch audiobook chapters.');
		}

		let audioBookData = await audiobooksRes.json();

		console.log(audioBookData.Items, titleDbRes)
		for (const audiobookChapter of audioBookData.Items) {

			let chapterFileRes = await File.downloadFileAsync(
				`${domain}/Audio/${audiobookChapter.Id}/universal?TranscodingProtocol=hls&Container=m4b`,
				titleDir,
				{
					idempotent: true,
					headers: {
						'Authorization': `MediaBrowser Token="${accessToken}"`
					}
				}
			);

			// Expo Downloads to universal.m4a, so we need to rename to chapter to prevent same track from being repeatedly played.
			let currentFileName = chapterFileRes.uri.split('/').pop();
			let fileExtension = currentFileName?.split('.').pop();
			chapterFileRes.move(new File(titleDir, convertToValidFilename(audiobookChapter.Name) + `.${fileExtension}`));

			console.log("testing audiobook", audiobookChapter)
			let chapterDbRes = await createItem(db, {
				name: audiobookChapter.Name,
				server_id: audiobookChapter.ServerId,
				etag: audiobookChapter.Etag,
				date_created: audiobookChapter.DateCreated ?? new Date().toUTCString(),
				date_last_media_added: audiobookChapter.DateLastMediaAdded,
				can_delete: audiobookChapter.CanDelete == 'true' ? 1 : 0,
				can_download: audiobookChapter.CanDownload == 'true' ? 1 : 0,
				parent_id: titleId,
				id: audiobookChapter.Id,
				duration: audiobookChapter.RunTimeTicks,
				sort_name: audiobookChapter.SortName,
				remote_path: audiobookChapter.Path ?? '',
				local_path: chapterFileRes.uri,
				local_image_path: imageRes.uri,
				downloaded: 1,
				artist: audiobookChapter.AlbumArtist,

				parent_db_id: titleDbRes.lastInsertRowId,
			});
		}


		// console.log(await parentTitle.json())
		// Check if title is downloaded or dir exists
		// Create db entry for parent book title item
		// Create dir for new title
		// Get chapter ids
		// download chapters

	} catch (error) {
		console.error(error)
		// TODO: cleanup dir if created
		// cleanup db if changed
	}
}

export async function searchForBooks(searchTerm: string, domain: string, accessToken: string) {
	let searchRes = await fetch(`${domain}/Items/RemoteSearch/Book`, {
		method: 'POST',
		body: JSON.stringify({ SearchInfo: { Name: searchTerm } }),
		headers: new Headers({
			'accept': 'application/json',
			'Content-Type': 'application/json',
			'x-emby-authorization': 'Mediabrowser Client="audiobook-player", Device="mydevice", DeviceId="myid", Version="1.0.0"'
		}),
	});
}

export default async function removeTitleFromDevice(db: SQLiteDatabase, titleId: string) {
	try {
		let titlePlayable = await getPlayableById(titleId, null, db);

		if (titlePlayable) {
			let titleDir = getAudiobookDir(titlePlayable?.name, true);
		}

	} catch (e) {
		console.error(e);
	}
}

export type Item = {
	Name: string;
	ServerId: string;
	Id: string;
	Etag: any;
	DateCreated: any,
	DateLastMediaAdded: any;
	CanDelete: any;
	CanDownload: any;
	SortName: string;
	ExternalUrls: any;
	ProductionLocations: any;
	Path: any;
	EnableMediaSourceDisplay: any;
	ChannelId: any;
	Taglines: any;
	Genres: any;
	PlayAccess: any;
	RemoteTrailers: any;
	ProviderIds: any;
	IsFolder: any;
	ParentId: any;
	Type: any;
	People: any;
	Studios: any;
	GenreItems: any;
	LocalTrailerCount: any;
	UserData: any;
	RecursiveItemCount: any;
	ChildCount: any;
	SpecialFeatureCount: any;
	DisplayPreferencesId: any;
	Tags: any[];
	PrimaryImageAspectRatio: any;
	ImageTags: any;
	BackdropImageTags: any;
	ImageBlurHashes: any;
	LocationType: any;
	MediaType: any;
	LockedFields: any;
	LockData: any;
	AlbumArtist: string;
}
