import { ReactNode } from "react";
import { View } from "react-native";
import { CardStyles } from "../molecules/Card";

export type CardBodyProps = {
	children: ReactNode
	styles: CardStyles
};

export default function CardBody({ children, styles }: CardBodyProps) {
	return (
		<View style={styles.cardBodyContainer}>
			{children}
		</View>
	);
}
