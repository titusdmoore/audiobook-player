import TrackPlayer, { Event, PlaybackActiveTrackChangedEvent, PlaybackProgressUpdatedEvent, PlaybackState, State } from "react-native-track-player";
import { fetchPlayerDuration, setAppOption } from "./db/db";
import { SQLiteDatabase } from "expo-sqlite";
import { setActiveTitle } from "./slices/audio-player-slice";
import { router } from "expo-router";
import { Playable } from "./classes/playable";
import { fetchChildrenPlayables, FetchItemOptions, getPlayableById } from ".";

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

function parseDisplayTimeSegments(time: number): number[] {
	let timeComponents = [];
	let timeShadow = time;

	while (true) {
		if (timeShadow >= 60) {
			timeComponents.push(timeShadow % 60);
			timeShadow = Math.floor(timeShadow / 60);
			continue;
		}

		timeComponents.push(timeShadow);
		break;
	}


	return timeComponents.reverse();
}
function displayTimeSegments(timeSegments: number[]): string {
	let shadowedTimeSegments = timeSegments.length <= 1 ? ["00", ...timeSegments] : timeSegments;

	return shadowedTimeSegments.map((segment, index) => ((index !== 0) ? segment.toString().padStart(2, "0") : segment)).join(":");
}

export function formatAudioProgressTime(time: number): string {
	return displayTimeSegments(parseDisplayTimeSegments(time));
}

export function runTimeTicksToDuration(ticks: number): number {
	let ms = Math.floor(ticks / 10000);
	let seconds = Math.floor(ms / 1000);

	return seconds;
}

export type loadTracksOptionalParameters = {
	startChapterIndex?: number,
	chapterList?: Playable[],
	afterLoadCallback?: CallableFunction,
}
export async function loadTracksForTitle(db: SQLiteDatabase, titleId: string, jellyConfig: FetchItemOptions, optionalParams: loadTracksOptionalParameters) {
	await TrackPlayer.reset();
	let chapters: Playable[] = [];
	let shadowedStartIndex = optionalParams.startChapterIndex ?? 0;

	if (optionalParams.hasOwnProperty('chapterList')) {
		chapters = optionalParams.chapterList!;
	} else {
		let playableRes = await getPlayableById(titleId as string, jellyConfig, db)

		if (playableRes) {
			chapters = await fetchChildrenPlayables(playableRes, db, jellyConfig);
		}
	}

	if (!optionalParams.startChapterIndex) {
		let duration = await fetchPlayerDuration(db, titleId as string);
		if (duration) {
			shadowedStartIndex = chapters.findIndex((chapter) => chapter.id == duration.chapter_id);
		}
	}

	for (const chapter of chapters.slice(shadowedStartIndex)) {
		let track = chapter.toTrack();
		await TrackPlayer.add(track);
	}

	await setAppOption(db, "new_title_loaded", "true");

	if (optionalParams.afterLoadCallback) optionalParams.afterLoadCallback();
	router.navigate("/player");
};
