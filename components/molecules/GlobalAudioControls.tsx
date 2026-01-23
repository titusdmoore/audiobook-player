import { Playable } from "@/utils/classes/playable";
import { useAppSelector } from "@/utils/hooks";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import TrackPlayer from "react-native-track-player";
import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { PlayButton } from "../atoms/AudioControls";

export default function GlobalAudioControls({ title }: { title: Playable }) {
	const jellyfinProvider = useAppSelector(state => state.bookProvider);
	const [activeTrack, setActiveTrack] = useState<any>();

	useEffect(() => {
		(async () => {
			let track = await TrackPlayer.getActiveTrack();

			if (track) {
				setActiveTrack(track);
			}
		})().then(() => { });
	}, []);

	return (
		<Link href="/player">
			<View style={{ width: '100%', backgroundColor: PALETTE.backgroundLight, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
				<View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
					<Image source={title.imagePath} style={{ width: 70, height: 70, borderRadius: 10 }} />
					<View style={{ maxWidth: '70%' }}>
						<Text style={{ color: PALETTE.text, fontSize: 16 }}>{title.name}</Text>
						{activeTrack && (<Text style={{ color: PALETTE.text, fontSize: 12 }}>{activeTrack.title}</Text>)}
					</View>
				</View>
				<View style={styles.controlsContainer}>
					<TouchableOpacity onPress={() => { }} style={styles.jumpBackButton}>
						<FontAwesome6Pro name="arrow-rotate-left" iconStyle="solid" size={18} color={PALETTE.textOffWhite} />
					</TouchableOpacity>
					<PlayButton scale={.5} style={styles.compactAudioControlsPlay} />
				</View>
			</View>
		</Link>
	);
}

const styles = StyleSheet.create({
	compactAudioControlsPlay: {
		width: 50,
		height: 50,
		borderRadius: "100%",
		backgroundColor: PALETTE.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
	jumpBackButton: {
		backgroundColor: PALETTE.background,
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: '100%',
	},
	controlsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8
	}
});
