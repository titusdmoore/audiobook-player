import { View, Text, useWindowDimensions } from "react-native";
import Slider from '@react-native-community/slider';
import { useActiveTrack, useProgress } from "react-native-track-player";
import { useEffect } from "react";
import { PALETTE } from "@/utils/colors";
import { formatAudioProgressTime, seekToTrackPosition } from "@/utils/audio-player";

export default function TrackSlider() {
	const progress = useProgress();
	const activeTrack = useActiveTrack();
	const { height, width } = useWindowDimensions();

	return (
		<View style={{ flexDirection: 'row', alignItems: 'center' }}>
			<Text style={{ color: PALETTE.text }}>{formatAudioProgressTime(progress.position)}</Text>
			<Slider
				style={{ width: width * .70, height: 50, margin: 'auto' }}
				minimumValue={0}
				value={progress.position}
				maximumValue={progress.duration}
				minimumTrackTintColor={PALETTE.primary}
				maximumTrackTintColor={PALETTE.text}
				thumbTintColor={PALETTE.primary}
				onValueChange={async (value) => {
					await seekToTrackPosition(value);
				}}
			/>
			<Text style={{ color: PALETTE.text }}>{formatAudioProgressTime(activeTrack?.duration ?? 0 - progress.position)}</Text>
		</View>
	);
}
