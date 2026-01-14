import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { Text, StyleSheet } from "react-native";
import { GestureResponderEvent, TouchableOpacity } from "react-native";

export default function AdditionalControlsButton({ name, valueText, icon, onPress }: { name: string, valueText: string, icon: string, onPress: (event: GestureResponderEvent) => void }) {
	return (
		<TouchableOpacity onPress={onPress} style={styles.container}>
			<FontAwesome6Pro name={icon as any} style={{ marginBottom: 6 }} iconStyle="solid" size={25} color={PALETTE.primary} />
			<Text style={styles.value}>{valueText}</Text>
			<Text style={styles.name}>{name}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: PALETTE.backgroundLight,
		borderRadius: 10,
		paddingVertical: 12,
		alignItems: 'center',
		width: 105
	},
	value: {
		color: PALETTE.textWhite,
		fontFamily: 'Inter_400Regular',
		marginBottom: 6,
	},
	name: {
		color: PALETTE.textOffWhite,
		fontFamily: 'Inter_400Regular',
		fontSize: 12
	},
});
