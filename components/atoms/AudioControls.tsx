import { Animated, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { FontAwesome6Pro } from "@react-native-vector-icons/fontawesome6-pro";
import { pauseCurrentTrack, playCurrentTrack, safeSkipNext, safeSkipPrev, seekByWithTracks } from "@/utils/audio-player";
import TrackPlayer, { Event, State, useIsPlaying, usePlaybackState } from "react-native-track-player";
import { PALETTE } from "@/utils/colors";
import { useRef } from "react";

export enum ControlsType {
	FULL,
	SMALL,
}

export function PlayButton({ scale, style }: { scale: number, style?: ViewStyle }) {
	const playerState = usePlaybackState();
	const rotateAnimValue = useRef(new Animated.Value(0)).current;
	const LoadingIcon = Animated.createAnimatedComponent(() => (<FontAwesome6Pro name="loader" style={{}} iconStyle="duotone" size={50 * scale} color={PALETTE.primary} />))

	Animated.loop(
		Animated.timing(rotateAnimValue, {
			toValue: 1,
			duration: 400,
			useNativeDriver: true
		})
	).start();

	const spin = rotateAnimValue.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg']
	});


	switch (playerState.state) {
		case State.Playing:
			return (
				<TouchableOpacity onPress={pauseCurrentTrack} style={style || styles.playPauseButton}>
					<FontAwesome6Pro name="pause" iconStyle="solid" size={40 * scale} color={PALETTE.textWhite} />
				</TouchableOpacity>
			);
		case State.Loading:
		case State.Buffering:
			return (
				<Animated.View style={{ transform: [{ rotate: spin }], width: 50, height: 64 }}>
					<FontAwesome6Pro name="loader" style={{}} iconStyle="duotone" size={40 * scale} color={PALETTE.primary} />
				</Animated.View>
			)
		case State.Error:
			// TrackPlayer.play().then(() => { });
			return (
				<Animated.View style={{ transform: [{ rotate: spin }], width: 50, height: 64 }}>
					<FontAwesome6Pro name="hose" style={{}} iconStyle="duotone" size={40 * scale} color={PALETTE.primary} />
				</Animated.View>
			)

		default:
			return (
				<TouchableOpacity onPress={playCurrentTrack} style={style || styles.playPauseButton}>
					<FontAwesome6Pro name="play" iconStyle="solid" size={40 * scale} color={PALETTE.textWhite} />
				</TouchableOpacity>
			);
	}
}

export default function AudioControls({ scale = 1, type = ControlsType.FULL }: { scale?: number, type?: ControlsType }) {
	return (
		<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 24, height: 137 * scale }}>
			<TouchableOpacity style={styles.controlButton} onPress={async () => await safeSkipPrev()}>
				<FontAwesome6Pro name="backward-step" size={25 * scale} color={PALETTE.textWhite} />
			</TouchableOpacity>
			{type == ControlsType.FULL && (
				<TouchableOpacity onPress={async () => await seekByWithTracks(-30)} style={styles.controlButton}>
					<FontAwesome6Pro name="rotate-left" size={20 * scale} color={PALETTE.textWhite} />
				</TouchableOpacity>
			)}
			<PlayButton scale={scale} />
			{type == ControlsType.FULL && (
				<TouchableOpacity onPress={async () => await seekByWithTracks(30)} style={styles.controlButton}>
					<FontAwesome6Pro name="rotate-right" iconStyle="solid" size={20 * scale} color={PALETTE.textWhite} />
				</TouchableOpacity>
			)}
			<TouchableOpacity style={styles.controlButton} onPress={async () => await safeSkipNext()}>
				<FontAwesome6Pro name="forward-step" size={25 * scale} color={PALETTE.textWhite} />
			</TouchableOpacity>
		</View>
	);
}


const styles = StyleSheet.create({
	controlButton: {
		backgroundColor: PALETTE.backgroundLight,
		paddingHorizontal: 10,
		paddingVertical: 18,
		borderRadius: 22
	},
	playPauseButton: {
		backgroundColor: 'linear-gradient(rgba(108, 92, 231, 1), rgba(108, 92, 231, .2))',
		paddingHorizontal: 10,
		paddingVertical: 24,
		borderRadius: 32
	},
});
