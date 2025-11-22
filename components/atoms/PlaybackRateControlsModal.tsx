import { PALETTE } from "@/utils/colors";
import Slider from "@react-native-community/slider";
import { Dispatch, SetStateAction } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";

type PlaybackRateControlsModalProps = {
	isOpen: boolean
	setIsOpen: Dispatch<SetStateAction<boolean>>;
	playbackRate: number,
	setPlaybackRate: any;
};

export default function PlaybackRateControlsModal({ isOpen, setIsOpen, playbackRate, setPlaybackRate }: PlaybackRateControlsModalProps) {
	return (
		<Modal
			visible={isOpen}
			transparent={true}
		>
			<View style={styles.centeredView}>
				<View style={styles.modalView}>
					<Text>{playbackRate.toFixed(2).toString()}</Text>
					<Slider
						style={{ width: 300, height: 50 }}
						minimumValue={.5}
						maximumValue={3.50}
						step={.05}
						value={playbackRate}
						minimumTrackTintColor={PALETTE.primary}
						maximumTrackTintColor={PALETTE.text}
						thumbTintColor={PALETTE.primary}
						onValueChange={async (value) => {
							await setPlaybackRate(value);
						}}
					/>
					<TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
						<Text>Dismiss</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalView: {
		margin: 20,
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 35,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
});
