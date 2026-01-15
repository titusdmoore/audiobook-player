import { DimensionValue, StyleSheet, View } from "react-native";

export type ProgressBarProps = {
	value: number;
	progressColor: string;
	baseColor: string;
	rounded?: boolean;
	endValue?: number;
	startValue?: number;
};

export default function ProgressBar({ value, progressColor, baseColor, endValue, startValue, rounded }: ProgressBarProps) {
	let actualEndValue = endValue || 1;
	let actualStartValue = startValue || 0;
	let rawValue = value < 1 ? value : Math.round(actualEndValue / value);
	let valuePercent: DimensionValue = ((rawValue * 100).toString() + '%' as DimensionValue);

	return (
		<View style={styles.progressContainer}>
			<View style={{ backgroundColor: baseColor, width: '100%', height: 6, borderRadius: rounded ? 10 : 0 }} />
			<View style={{
				backgroundColor: progressColor,
				width: valuePercent,
				height: 6,
				position: 'absolute',
				top: 0,
				left: 0,
				borderRadius: rounded ? 10 : 0
			}} />
		</View>
	);
}

const styles = StyleSheet.create({
	progressContainer: {
		position: 'relative',
		height: 4,
		flex: 1,
		borderRadius: 50
	},
});
