import { Text, View } from "react-native";
import { CardStyles } from "../molecules/Card";

export type CardHeaderProps = {
	title: string
	styles: CardStyles
};

export default function CardHeader({ title, styles }: CardHeaderProps) {
	return (
		<View style={styles.headerContainer}>
			<Text style={styles.headerText}>{title}</Text>
		</View>
	);
}
