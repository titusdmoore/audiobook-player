import { PALETTE } from "@/utils/colors";
import Slider from "@react-native-community/slider";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
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
					<View style={styles.headerContainer}>
						<View>
							<Text style={styles.headerText}>Playback Rate</Text>
							<Text style={styles.modalSubtitle}>Adjust listening speed</Text>
						</View>
						<Text style={styles.playbackRateDisplay}>{playbackRate.toFixed(2).toString()}x</Text>
					</View>
					<View style={styles.sliderContainer}>
						<View style={styles.sliderLabelContainer}>
							<Text style={styles.sliderLabel}>0.5x</Text>
							<Text style={styles.sliderLabel}>3.5x</Text>
						</View>
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
						<View style={styles.playbackRateControlsContainer}>
							<TouchableOpacity style={styles.defaultPlaybackRateButton} onPress={() => { }}>
								<FontAwesome6Pro name='minus' iconStyle="solid" size={16} color={PALETTE.primary} />
								<Text style={styles.playbackRateButtonText}>Slower</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.defaultPlaybackRateButton} onPress={() => { }}>
								<FontAwesome6Pro name='rotate-left' iconStyle="solid" size={16} color={PALETTE.primary} />
								<Text style={styles.playbackRateButtonText}>Reset</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.defaultPlaybackRateButton} onPress={() => { }}>
								<FontAwesome6Pro name='plus' iconStyle="solid" size={16} color={PALETTE.primary} />
								<Text style={styles.playbackRateButtonText}>Faster</Text>
							</TouchableOpacity>
						</View>
					</View>
					<View style={styles.quickPresetContainer}>
						<TouchableOpacity style={styles.defaultQuickPresetButton} onPress={() => { }}>
							<Text style={styles.quickPresetButtonText}>0.75x</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.defaultQuickPresetButton} onPress={() => { }}>
							<Text style={styles.quickPresetButtonText}>1.0x</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.defaultQuickPresetButton} onPress={() => { }}>
							<Text style={styles.quickPresetButtonText}>1.5x</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.defaultQuickPresetButton} onPress={() => { }}>
							<Text style={styles.quickPresetButtonText}>2.0x</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity style={styles.cancelButton} onPress={() => setIsOpen(!isOpen)}>
						<Text style={styles.cancelButtonText}>Dismiss</Text>
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
		backgroundColor: 'rgba(10, 10, 15, .9)'
	},
	modalView: {
		width: '80%',
		margin: 20,
		backgroundColor: PALETTE.backgroundLight,
		borderRadius: 20,
		padding: 16,
		alignItems: 'center',
		shadowColor: PALETTE.primary,
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 5,
	},
	headerText: {
		color: PALETTE.text,
		fontSize: 18,
	},
	modalSubtitle: {
		color: PALETTE.textOffWhite
	},
	headerContainer: {
		flexDirection: 'row',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 24,
	},
	playbackRateDisplay: {
		color: PALETTE.primary,
		backgroundColor: 'rgba(139, 92, 246, .2)',
		paddingVertical: 14,
		paddingHorizontal: 18,
		fontSize: 16,
		fontWeight: '700',
		borderRadius: 10
	},
	sliderContainer: {
		borderBottomWidth: 1,
		borderBottomColor: PALETTE.grey,
		paddingBottom: 24,
		marginBottom: 24,
	},
	sliderLabelContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	sliderLabel: {
		color: PALETTE.textOffWhite,
	},
	playbackRateControlsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		gap: 12,
		flexWrap: 'wrap',
	},
	defaultPlaybackRateButton: {
		paddingVertical: 18,
		flex: 1,
		flexBasis: '25%',
		backgroundColor: PALETTE.background,
		borderRadius: 10,
		flexDirection: 'row',
		gap: 8,
		justifyContent: 'center',
		alignItems: 'center'
	},
	playbackRateButtonText: {
		color: PALETTE.textWhite,
	},
	quickPresetContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		gap: 12,
	},
	defaultQuickPresetButton: {
		paddingVertical: 8,
		flex: 1,
		backgroundColor: PALETTE.background,
		borderRadius: 10,
		gap: 8,
		justifyContent: 'center',
		alignItems: 'center'
	},
	quickPresetButtonText: {
		color: PALETTE.textWhite,
	},
	cancelButton: {
		backgroundColor: 'rgba(238, 68, 68, .2)',
		paddingVertical: 12,
		borderRadius: 10,
		width: '100%',
		marginTop: 12,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 6,
	},
	cancelButtonText: {
		color: PALETTE.redLight,
		fontSize: 16,
		fontWeight: '500'
	}
});
