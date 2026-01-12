import TrackPlayer, { Event, PlaybackActiveTrackChangedEvent, PlaybackProgressUpdatedEvent, PlaybackState, State } from "react-native-track-player";

// export async function getCurrentTrackPlayer(): TrackPlayer {
//
// }
//
export async function playCurrentTrack() {
	console.log("here", await TrackPlayer.getQueue());
	await TrackPlayer.play();
}

export async function pauseCurrentTrack() {
	await TrackPlayer.pause();
}

export async function seekToTrackPosition(position: number) {
	await TrackPlayer.seekTo(position);
}

export async function setTrackPlaybackRate(playbackRate: number) {
	await TrackPlayer.setRate(playbackRate);
}

export function formatAudioProgressTime(time: number): string {
	return Math.floor(time / 60).toString() + ":" + Math.floor(time % 60).toString().padStart(2, '0');
}

export function runTimeTicksToDuration(ticks: number): number {
	let ms = Math.floor(ticks / 10000);
	let seconds = Math.floor(ms / 1000);

	return seconds;
}
