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
import { useAppDispatch } from "@/utils/hooks";
import { setSleepTimer as setStoreSleepTimer } from "@/utils/slices/book-provider-slice";
import AdditionalControlsButton from "../atoms/AdditionalControlsButton";
import { initializeSleepTimer } from "@/utils/slices/audio-player-slice";
import Button from "../atoms/Button";
// import { useTrackPlayerEvents, Event, State } from "react-native-track-player";


export default function AdditionalTrackActions() {
	// TODO: This value should be stored in the db, and read
	const [playbackRate, setPlaybackRate] = useState<number>(1.00);
	const [readyToUpdateDb, setReadyToUpdateDb] = useState<boolean>(false);
	const [sleepTimer, setSleepTimer] = useState<number | null>(null);
	const [playbackRateModalIsOpen, setPlaybackRateModalIsOpen] = useState<boolean>(false);
	const [sleepTimerModalOpen, setSleepTimerModalOpen] = useState<boolean>(false);
	const db = useSQLiteContext();
	const dispatch = useAppDispatch();

	useEffect(() => {
		(async () => {
			if (!sleepTimer) {
				await setAppOption(db, "sleep_timer", "");
				dispatch(setStoreSleepTimer(undefined));
				return;
			}

			var newDateObj = moment(new Date()).add(sleepTimer, 'm').toDate();
			await setAppOption(db, "sleep_timer", newDateObj.getTime().toString());
			dispatch(initializeSleepTimer(newDateObj.getTime()));
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

	const debugPlayer = async () => {
		console.log("before")
		let queue = await TrackPlayer.getQueue();
		console.log(queue);
		console.log(queue.length);
		console.log(await TrackPlayer.getActiveTrackIndex());
		console.log('after')
	};

	return (
		<>
			<View style={styles.additionalControlsContainer}>
				<AdditionalControlsButton
					icon='gauge-high'
					name='Speed'
					valueText={playbackRate.toFixed(2).toString() + 'x'}
					onPress={() => setPlaybackRateModalIsOpen(!playbackRateModalIsOpen)}
				/>
				<AdditionalControlsButton
					icon='moon'
					name='Timer'
					valueText='Off'
					onPress={() => setSleepTimerModalOpen(!sleepTimerModalOpen)}
				/>
				<AdditionalControlsButton
					icon='bookmark'
					name='Bookmark'
					valueText='Save'
					onPress={() => { }}
				/>
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
			<View style={{ marginTop: 12 }}>
				<Button onPress={async () => await debugPlayer()}>
					<Text>Debug</Text>
				</Button>
			</View>
		</>
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
