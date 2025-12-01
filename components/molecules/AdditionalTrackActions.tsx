import { PALETTE } from "@/utils/colors";
import { useEffect, useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import PlaybackRateControlsModal from "../atoms/PlaybackRateControlsModal";
import { setTrackPlaybackRate } from "@/utils/audio-player";
import TrackPlayer from "react-native-track-player";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import SleepTimerControlsModal from "../atoms/SleepTimerControlsModal";
import { useSQLiteContext } from "expo-sqlite";
import { getAppOption, setAppOption } from "@/utils/db/db";
import moment from "moment";
// import { useTrackPlayerEvents, Event, State } from "react-native-track-player";


export default function AdditionalTrackActions() {
	// TODO: This value should be stored in the db, and read
	const [playbackRate, setPlaybackRate] = useState<number>(1.00);
	const [readyToUpdateDb, setReadyToUpdateDb] = useState<boolean>(false);
	const [sleepTimer, setSleepTimer] = useState<number | null>(null);
	const [playbackRateModalIsOpen, setPlaybackRateModalIsOpen] = useState<boolean>(false);
	const [sleepTimerModalOpen, setSleepTimerModalOpen] = useState<boolean>(false);
	const db = useSQLiteContext();

	useEffect(() => {
		(async () => {
			if (!sleepTimer) {
				await setAppOption(db, "sleep_timer", "");
				return;
			}

			var newDateObj = moment(new Date()).add(sleepTimer, 'm').toDate();
			await setAppOption(db, "sleep_timer", newDateObj.getTime().toString());
		})().then(() => { });
	}, [sleepTimer]);

	useEffect(() => {
		setTrackPlaybackRate(playbackRate).then(() => { });
		if (readyToUpdateDb) {
			setAppOption(db, "playback_rate", playbackRate.toString()).then(() => { });
		}
	}, [playbackRate]);


	useEffect(() => {
		getAppOption(db, 'playback_rate').then(result => {
			if (result && result.option_name) {
				setPlaybackRate(parseFloat(result.option_value!));
			}

			setReadyToUpdateDb(true);
		});
	}, []);

	return (
		<View style={styles.additionalControlsContainer}>
			<TouchableOpacity onPress={() => setPlaybackRateModalIsOpen(!playbackRateModalIsOpen)}>
				<Text style={styles.playbackRateSpeedText}>{playbackRate.toFixed(2).toString()}x</Text>
				<Text style={styles.playbackRateSpeedHelperText}>Speed</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => setSleepTimerModalOpen(!sleepTimerModalOpen)}>
				<FontAwesome6Pro name="alarm-snooze" size={30} color={PALETTE.text} />
			</TouchableOpacity>
			<PlaybackRateControlsModal
				playbackRate={playbackRate}
				setPlaybackRate={setPlaybackRate}
				isOpen={playbackRateModalIsOpen}
				setIsOpen={setPlaybackRateModalIsOpen}
			/>
			<SleepTimerControlsModal
				sleepTimer={sleepTimer}
				setSleepTimer={setSleepTimer}
				isOpen={sleepTimerModalOpen}
				setIsOpen={setSleepTimerModalOpen}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	additionalControlsContainer: {
		flexDirection: 'row',
		gap: 12,
		alignItems: 'center',
		justifyContent: 'space-evenly',
		paddingTop: 12,
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
