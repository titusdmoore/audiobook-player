import { PALETTE } from "@/utils/colors";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { cloneElement, ReactElement, ReactNode } from "react";

export default function Button({ children }: { children: ReactElement }) {
	return (
		<TouchableOpacity style={[styles.buttonRoot, styles.chapterListButton]} onPress={() => { }}>
			{cloneElement(children, { style: [styles.buttonText] })}
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
