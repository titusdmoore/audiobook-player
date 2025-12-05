import { useAppDispatch, useAppSelector } from '@/utils/hooks';
import { DropboxProvider } from './book-providers/dropbox';
import { setDropboxInitialized, setDropboxTokens } from './slices/book-provider-slice';
import TrackPlayer from 'react-native-track-player';
import { setInitialized } from './slices/audio-player-slice';

export default async function startup(dispatch: any, audioPlayer: any, bookProvider: any) {
	console.log("hello, world");
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
