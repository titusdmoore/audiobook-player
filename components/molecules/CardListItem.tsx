import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export type CardListItemProps = {
	title: string;
	subtitle?: string;
	iconBackgroundColor?: string;
	iconContent?: any;
	actionContent?: any;
};

//:				<Text style={{ color: PALETTE.textOffWhite, fontSize: 18, fontFamily: 'Inter_400Regular' }}>hello</Text>

export default function CardListItem({ title, subtitle, iconBackgroundColor, iconContent, actionContent: ActionContent }: CardListItemProps) {
	return (
		<View style={styles.container}>
			<View
				style={{ width: 40, height: 40, backgroundColor: iconBackgroundColor || PALETTE.background, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
				{iconContent}
			</View>
			<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, alignItems: 'center' }}>
				<View style={{ maxWidth: '75%' }}>
					<Text style={{ fontFamily: 'Inter_400Regular', color: PALETTE.textWhite, fontSize: 14, wordWrap: 'break-word' }}>{title}</Text>
					{subtitle && (<Text style={{ fontFamily: 'Inter_300Light', color: PALETTE.textOffWhite, }}>{subtitle}</Text>)}
				</View>
				{ActionContent && (<ActionContent />)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		borderBottomWidth: 1,
		borderColor: '#252530',
		flexDirection: 'row',
		padding: 12
	},
});
