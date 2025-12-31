export abstract class Playable {
	abstract imagePath: string;
	abstract id: string;
	abstract name: string;

	// Constructor
	constructor() { }

	// get chapters

	// get title
	// get duration
	//

	abstract getPlayableUri(): string;

	// handle db playback operations (duration)
}
