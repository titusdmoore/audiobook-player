import { PitchAlgorithm, Track } from "react-native-track-player";
import { FetchItemOptions } from "..";
import { runTimeTicksToDuration } from "../audio-player";
import { Item } from "../book-providers/jellyfin";
import { Playable } from "./playable";

export class JellyPlayable extends Playable {
	#jellyConfig: FetchItemOptions;
	#jellyItem: Item;

	get imagePath(): string {
		return `${this.#jellyConfig.domain}/Items/${this.#jellyItem.Id}/Images/Primary`;
	}
	get id(): string {
		return this.#jellyItem.Id;
	}
	get name(): string {
		return this.#jellyItem.Name;
	}

	// Takes in Jellyfin API Item Object
	constructor(jellyItem: Item, config: FetchItemOptions) {
		super();

		this.#jellyConfig = config;
		this.#jellyItem = jellyItem;
	}

	isDownloaded(): boolean {
		return false;
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
			headers: {
				'Authorization': `MediaBrowser Token="${this.#jellyConfig.accessToken}"`
			},
		};
	}

	isParentPlayable(): boolean {
		return false;
	}

	getPlayableUri(): string {
		return `${this.#jellyConfig.domain}/Audio/${this.id}/universal?TranscodingProtocol=hls&Container=m4b`;
	}

	getArtist(): string {
		return this.#jellyItem.AlbumArtist;
	}

	getParentId(): string | null {
		return this.#jellyItem.ParentId ?? null;
	}

	getDuration(): number {
		return runTimeTicksToDuration((this.#jellyItem as any).RunTimeTicks ?? 0);
	}

} 
