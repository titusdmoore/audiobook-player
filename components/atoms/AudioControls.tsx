import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { FontAwesome6Pro } from "@react-native-vector-icons/fontawesome6-pro";
import { pauseCurrentTrack, playCurrentTrack } from "@/utils/audio-player";
import { Event, State, useIsPlaying, usePlaybackState } from "react-native-track-player";
import { PALETTE } from "@/utils/colors";
import { useRef } from "react";

export enum ControlsType {
	FULL,
	SMALL,
}

function PlayButton({ scale }: { scale: number }) {
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
				<TouchableOpacity onPress={pauseCurrentTrack}>
					<FontAwesome6Pro name="circle-pause" size={50 * scale} color={PALETTE.primary} />
				</TouchableOpacity>
			);
		case State.Loading:
		case State.Buffering:
		case State.Error:
			return (
				<Animated.View style={{ transform: [{ rotate: spin }] }}>
					<FontAwesome6Pro name="loader" style={{}} iconStyle="duotone" size={50 * scale} color={PALETTE.primary} />
				</Animated.View>
			)
		default:
			return (
				<TouchableOpacity onPress={playCurrentTrack}>
					<FontAwesome6Pro name="circle-play" size={50 * scale} color={PALETTE.primary} />
				</TouchableOpacity>
			);
	}
}

export default function AudioControls({ scale = 1, type = ControlsType.FULL }: { scale?: number, type?: ControlsType }) {

	return (
		<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
			<FontAwesome6Pro name="backward-step" size={30 * scale} color={PALETTE.primary} />
			{type == ControlsType.FULL && (<FontAwesome6Pro name="backward" size={20 * scale} color={PALETTE.primary} />)}
			<PlayButton scale={scale} />
			{type == ControlsType.FULL && (<FontAwesome6Pro name="forward" size={20 * scale} color={PALETTE.primary} />)}
			<FontAwesome6Pro name="forward-step" size={30 * scale} color={PALETTE.primary} />
		</View>
	);
}

