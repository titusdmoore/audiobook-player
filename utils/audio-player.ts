import TrackPlayer, { Event, PlaybackActiveTrackChangedEvent, PlaybackProgressUpdatedEvent, PlaybackState, State } from "react-native-track-player";

// export async function getCurrentTrackPlayer(): TrackPlayer {
//
// }
//
export async function playCurrentTrack() {
	await TrackPlayer.play();
}

export async function seekByWithTracks(seekBy: number) {
	let progress = await TrackPlayer.getProgress();

	// Ensure that our seek is within track duration bounds
	if (progress.position + seekBy <= progress.duration && progress.position + seekBy >= 0) {
		await TrackPlayer.seekBy(seekBy);
	} else {
		let queue = await TrackPlayer.getQueue();
		let activeIndex = await TrackPlayer.getActiveTrackIndex();

		// If less than zero it means we must go track back, otherwise track forward.
		if (progress.position + seekBy < 0) {
			// If we aren't at zero, we can assume that there is a track previous we can seek to.
			if (activeIndex !== 0) {
				await TrackPlayer.skipToPrevious();

				let remaining = progress.position + seekBy;
				progress = await TrackPlayer.getProgress();
				await TrackPlayer.seekTo(progress.duration + remaining);
				return;
			}

			// We don't have a track to seek to, so we just jump to beginning of track. We just set to zero because math is hard.
			await TrackPlayer.seekTo(0);
		} else {
			if (activeIndex !== undefined && activeIndex < queue.length) {
				await TrackPlayer.skipToNext();

				let remaining = progress.position + seekBy - progress.position;
				progress = await TrackPlayer.getProgress();
				await TrackPlayer.seekTo(progress.duration + remaining);
				return;
			}

			// Set to end of track and pause.
			await TrackPlayer.seekTo(progress.duration);
			await TrackPlayer.pause();
		}
	}
}

export async function safeSkipPrev() {
	let activeIndex = await TrackPlayer.getActiveTrackIndex();

	if (activeIndex !== 0) {
		await TrackPlayer.skipToPrevious();
	}
}

export async function safeSkipNext() {
	let queue = await TrackPlayer.getQueue();
	let activeIndex = await TrackPlayer.getActiveTrackIndex();

	if (activeIndex && activeIndex < queue.length) {
		await TrackPlayer.skipToNext();
	}
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
