import { TouchableOpacity, View } from "react-native";
import { FontAwesome6Pro } from "@react-native-vector-icons/fontawesome6-pro";
import { pauseCurrentTrack, playCurrentTrack } from "@/utils/audio-player";
import { Event, useIsPlaying } from "react-native-track-player";
import { PALETTE } from "@/utils/colors";

export default function AudioControls() {
	const isPlaying = useIsPlaying();

	return (
		<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
			<FontAwesome6Pro name="backward-step" size={30} color={PALETTE.primary} />
			<FontAwesome6Pro name="backward" size={20} color={PALETTE.primary} />
			{!isPlaying.playing
				? (<TouchableOpacity onPress={playCurrentTrack}>
					<FontAwesome6Pro name="circle-play" size={50} color={PALETTE.primary} />
				</TouchableOpacity>)
				: (<TouchableOpacity onPress={pauseCurrentTrack}>
					<FontAwesome6Pro name="circle-pause" size={50} color={PALETTE.primary} />
				</TouchableOpacity>)}
			<FontAwesome6Pro name="forward" size={20} color={PALETTE.primary} />
			<FontAwesome6Pro name="forward-step" size={30} color={PALETTE.primary} />
		</View>
	);
}
