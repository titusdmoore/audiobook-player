import { PALETTE } from "@/utils/colors";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function Button() {
	return (
		<TouchableOpacity style={[styles.buttonRoot, styles.chapterListButton]} onPress={() => { }}>
			<Text style={styles.buttonText}>View Chapters</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	chapterListButton: {
		backgroundColor: PALETTE.primary,
	},
	buttonRoot: {
		borderRadius: 24,
		paddingVertical: 8,
		paddingHorizontal: 24,
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonText: {
		color: PALETTE.text,
	},
})
