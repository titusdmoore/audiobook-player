import { PALETTE } from "@/utils/colors";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { cloneElement, ReactElement, ReactNode } from "react";

export default function Button({ children, ...props }: { children: ReactElement }) {
	return (
		<TouchableOpacity style={[styles.buttonRoot, styles.chapterListButton]} {...props}>
			{children && cloneElement(children, { style: [styles.buttonText] })}
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
