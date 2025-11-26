import { TouchableOpacity, View } from "react-native";
import { FontAwesome6Pro } from "@react-native-vector-icons/fontawesome6-pro";
import { pauseCurrentTrack, playCurrentTrack } from "@/utils/audio-player";
import { Event, useIsPlaying } from "react-native-track-player";
import { PALETTE } from "@/utils/colors";

export enum ControlsType {
	FULL,
	SMALL,
}

export default function AudioControls({ scale = 1, type = ControlsType.FULL }: { scale?: number, type?: ControlsType }) {
	const isPlaying = useIsPlaying();

	return (
		<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
			<FontAwesome6Pro name="backward-step" size={30 * scale} color={PALETTE.primary} />
			{type == ControlsType.FULL && (<FontAwesome6Pro name="backward" size={20 * scale} color={PALETTE.primary} />)}
			{!isPlaying.playing
				? (<TouchableOpacity onPress={playCurrentTrack}>
					<FontAwesome6Pro name="circle-play" size={50 * scale} color={PALETTE.primary} />
				</TouchableOpacity>)
				: (<TouchableOpacity onPress={pauseCurrentTrack}>
					<FontAwesome6Pro name="circle-pause" size={50 * scale} color={PALETTE.primary} />
				</TouchableOpacity>)}
			{type == ControlsType.FULL && (<FontAwesome6Pro name="forward" size={20 * scale} color={PALETTE.primary} />)}

			<FontAwesome6Pro name="forward-step" size={30 * scale} color={PALETTE.primary} />
		</View>
	);
}
