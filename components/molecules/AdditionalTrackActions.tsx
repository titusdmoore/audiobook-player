import { PALETTE } from "@/utils/colors";
import { useEffect, useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import PlaybackRateControlsModal from "../atoms/PlaybackRateControlsModal";
import { setTrackPlaybackRate } from "@/utils/audio-player";
// import { useTrackPlayerEvents, Event, State } from "react-native-track-player";


export default function AdditionalTrackActions() {
	// TODO: This value should be stored in the db, and read
	const [playbackRate, setPlaybackRate] = useState<number>(1.00);
	const [playbackRateModalIsOpen, setPlaybackRateModalIsOpen] = useState<boolean>(false);

	useEffect(() => {
		setTrackPlaybackRate(playbackRate).then(() => { });
	}, [playbackRate]);


	return (
		<View style={styles.additionalControlsContainer}>
			<TouchableOpacity onPress={() => setPlaybackRateModalIsOpen(!playbackRateModalIsOpen)}>
				<Text style={styles.playbackRateSpeedText}>{playbackRate.toFixed(2).toString()}x</Text>
				<Text style={styles.playbackRateSpeedHelperText}>Speed</Text>
			</TouchableOpacity>
			<PlaybackRateControlsModal
				playbackRate={playbackRate}
				setPlaybackRate={setPlaybackRate}
				isOpen={playbackRateModalIsOpen}
				setIsOpen={setPlaybackRateModalIsOpen}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	additionalControlsContainer: {
		flexDirection: 'row',
	},
	playbackRateButton: {

	},
	playbackRateSpeedText: {
		color: PALETTE.text,
		fontSize: 18,
	},
	playbackRateSpeedHelperText: {
		color: PALETTE.text,
		fontSize: 15,
		textAlign: 'center'
	}
});
