import { SQLiteDatabase } from "expo-sqlite";
import { getChaptersForTitle } from "../db/db";
import { DbPlayable } from "./db-playable";
import { fetchAudiobooks, Item } from "../book-providers/jellyfin";
import { FetchItemOptions } from "..";
import { JellyPlayable } from "./jelly-playable";
import { PitchAlgorithm, Track } from "react-native-track-player";

export abstract class Playable {
	abstract imagePath: string;
	abstract id: string;
	abstract name: string;

	// Constructor
	constructor() { }

	abstract getPlayableUri(): string;
	abstract isDownloaded(): boolean;
	abstract getParentId(): string | null;
	abstract getArtist(): string;


	/*
	 *
	 * Playing Playable Logic
	 * 
	 */
	// Since I am using the same object for Titles and Chapters I need a way to tell the difference. 
	// Parent playables are titles and need to get chapters before they can be played.
	abstract isParentPlayable(): boolean;
	abstract getDuration(): number;
	abstract toTrack(): Track;
	// abstract fetchChildrenPlayables(): Playable[];

	// handle db playback operations (duration)
}

