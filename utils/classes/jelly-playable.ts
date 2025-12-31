import { Item } from "../book-providers/jellyfin";
import { Playable } from "./playable";

export class JellyPlayable extends Playable {
	#jellyDomain: string;
	#jellyItemId: string;
	#jellyName: string;

	get imagePath(): string {
		console.log('image path', `${this.#jellyDomain}/Items/${this.#jellyItemId}/Images/Primary`)
		return `${this.#jellyDomain}/Items/${this.#jellyItemId}/Images/Primary`;
	}
	get id(): string {
		return this.#jellyItemId;
	}
	get name(): string {
		return this.#jellyName;
	}

	// Takes in Jellyfin API Item Object
	constructor(jellyItem: Item, jellyDomain: string) {
		super();

		this.#jellyDomain = jellyDomain;
		this.#jellyItemId = jellyItem.Id ?? '';
		this.#jellyName = jellyItem.Name;
	}

	getPlayableUri(): string {
		return '';
	}

} 
