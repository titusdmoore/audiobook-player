import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import CardBody from "../atoms/CardBody";
import CardHeader from "../atoms/CardHeader";
import { PALETTE } from "@/utils/colors";

export type CardStyles = typeof defaultCardStyles;

export type CardProps = {
	children: ReactNode
	title: string
	styles?: CardStyles
};

export default function Card({ title, children, styles }: CardProps) {
	const unifiedStyles = { ...defaultCardStyles, ...styles };
	return (
		<View style={unifiedStyles.cardContainer}>
			<CardHeader styles={unifiedStyles} title={title} />
			<CardBody styles={unifiedStyles}>{children}</CardBody>
		</View>
	);
}

const defaultCardStyles = StyleSheet.create({
	cardContainer: {
		padding: 5,
		backgroundColor: PALETTE.backgroundDark,
		margin: 8,
		borderRadius: 8,
	},
	headerContainer: {

	},
	headerText: {
		color: PALETTE.text,
		fontSize: 24,
	},
	cardBodyContainer: {

	}
});
