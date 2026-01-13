import { Text, TouchableOpacity, View } from "react-native";
import TrackSlider from "../atoms/TrackSlider";
import AudioControls from "../atoms/AudioControls";
import TrackPlayer from "react-native-track-player";
import AdditionalTrackActions from "./AdditionalTrackActions";

export default function PlaybackControls() {
	return (
		<View>
			<TrackSlider />
			<AudioControls />
			<AdditionalTrackActions />
		</View>
	);
}
