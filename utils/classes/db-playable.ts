import { SQLiteDatabase } from "expo-sqlite";
import { ItemDb } from "../db/schema";
import { Playable } from "./playable";
import { runTimeTicksToDuration } from "../audio-player";
import { PitchAlgorithm, Track } from "react-native-track-player";

export class DbPlayable extends Playable {
	#dbItem: ItemDb

	get imagePath(): string {
		return this.#dbItem.local_image_path ?? '';
	}
	get name(): string {
		return this.#dbItem.name;
	}
	get id(): string {
		return this.#dbItem.id;
	}

	constructor(dbItem: ItemDb) {
		super();

		this.#dbItem = dbItem;
	}

	getPlayableUri(): string {
		return this.#dbItem.local_path ?? '';
	}

	isDownloaded(): boolean {
		return this.#dbItem.downloaded;
	}

	isParentPlayable(): boolean {
		return this.#dbItem.parent_db_id == null;
	}

	getParentId(): string | null {
		return this.#dbItem.parent_id;
	}

	getArtist(): string {
		return '';
	}

	getDuration(): number {
		return runTimeTicksToDuration(this.#dbItem.duration ?? 0);
	}

	toTrack(): Track {
		return {
			id: this.id,
			url: this.getPlayableUri(),
			title: this.name,
			artist: this.getArtist(),
			pitchAlgorithm: PitchAlgorithm.Voice,
			duration: this.getDuration(),
			parentItemId: this.getParentId(),
		};
	}

	dbId(): number {
		return this.#dbItem.db_id!;
	}

	// isPlayable(): boolean {
	//
	// }
}
