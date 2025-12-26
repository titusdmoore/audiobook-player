import { PALETTE } from "@/utils/colors";
import { TextInput as RnTextInput, StyleSheet, TextInputAndroidProps, TextInputIOSProps } from "react-native";

export type TextInputProps = {
	value: string;
	onChangeText: any;
}

export default function TextInput({ value, onChangeText }: TextInputProps) {
	return (
		<RnTextInput style={styles.input} autoCapitalize="none" placeholder="Domain" value={value} onChangeText={onChangeText} />
	);
}

const styles = StyleSheet.create({
	input: {
		backgroundColor: '#3d3d51',
		borderBottomColor: PALETTE.primary,
		borderBottomWidth: 3,
		borderRadius: 4,
		marginBottom: 8
	}
});
