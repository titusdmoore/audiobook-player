import { ItemDb } from "../db/schema";
import { Playable } from "./playable";

export class DbPlayable extends Playable {
	#localImagePath: string;
	#remoteId: string;
	#name: string;

	get imagePath(): string {
		return this.#localImagePath;
	}
	get name(): string {
		return this.#name;
	}
	get id(): string {
		return this.#remoteId;
	}

	constructor(dbItem: ItemDb) {
		super();

		this.#localImagePath = dbItem.local_image_path ?? '';
		this.#remoteId = dbItem.id;
		this.#name = dbItem.name;
	}

	getPlayableUri(): string {
		return '';
	}

	isPlayable(): boolean {

	}
}
