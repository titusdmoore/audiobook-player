import { useAppDispatch, useAppSelector } from '@/utils/hooks';
import { DropboxProvider } from './book-providers/dropbox';
import { setDropboxInitialized, setDropboxTokens } from './slices/book-provider-slice';
import TrackPlayer from 'react-native-track-player';
import { setInitialized } from './slices/audio-player-slice';
import { Playable } from './classes/playable';
import { SQLiteDatabase } from 'expo-sqlite';
import { getChaptersForTitle, getDownloadedTitleById } from './db/db';
import { DbPlayable } from './classes/db-playable';
import { fetchAudiobooks, fetchItem, Item } from './book-providers/jellyfin';
import { JellyPlayable } from './classes/jelly-playable';

export default async function startup(dispatch: any, audioPlayer: any, bookProvider: any) {
	console.log("hello, world");
}

export function convertToValidFilename(input: string): string {
	return (input.replace(/[\/|\\:*?"\ <>]/g, ""));
}

export function encodeObjectToQueryParams(object: { [key: string]: any }): string {
	var str = [];
	for (var property in object) {
		if (object.hasOwnProperty(property)) {
			str.push(encodeURIComponent(property) + "=" + encodeURIComponent(Array.isArray(object[property]) ? object[property].join(',') : object[property]));
		}
	}

	return str.join("&");
}

export type FetchItemOptions = {
	domain: string,
	accessToken: string,
	userId: string,
};

export async function getPlayableById(id: string, fetchOptions: FetchItemOptions, db: SQLiteDatabase): Promise<Playable | null> {
	let title = await getDownloadedTitleById(db, id);
	if (title) {
		return new DbPlayable(title);
	}

	let jellyTitleRes = await fetchItem(fetchOptions.domain, fetchOptions.accessToken, fetchOptions.userId, id);
	if (jellyTitleRes.ok) {
		let res = await jellyTitleRes.json();

		return new JellyPlayable(res, fetchOptions);
	}

	return null;
}

export async function fetchChildrenPlayables(playable: Playable, db: SQLiteDatabase, config: FetchItemOptions): Promise<Playable[]> {
	try {
		// if (!playable.isParentPlayable()) { return []; }

		if (playable.isDownloaded()) {
			let dbChildrenItems = await getChaptersForTitle(db, (playable as DbPlayable).dbId().toString());

			return dbChildrenItems?.map((item) => new DbPlayable(item)) ?? [];
		}

		let chaptersRes = await fetchAudiobooks(config.domain, config.accessToken, { limit: 100, startIndex: 0, parentId: playable.id });
		if (chaptersRes && chaptersRes.ok) {
			let chaptersResParsed: { Items: Item[] } = await chaptersRes.json();

			return chaptersResParsed.Items.map((item) => new JellyPlayable({ ...item, ParentId: playable.id }, config));
		}

		return [];
	} catch (e) {
		console.error(e);
		return [];
	}
}
