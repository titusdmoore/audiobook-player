import TrackPlayer from "react-native-track-player";

// export async function getCurrentTrackPlayer(): TrackPlayer {
//
// }
//
export async function playCurrentTrack() {
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

