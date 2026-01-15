import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export type CardListItemProps = {
	title: string;
	subtitle?: string;
	iconBackgroundColor?: string;
	iconContent?: any;
};

//:				<Text style={{ color: PALETTE.textOffWhite, fontSize: 18, fontFamily: 'Inter_400Regular' }}>hello</Text>

export default function CardListItem({ title, subtitle, iconBackgroundColor, iconContent }: CardListItemProps) {
	return (
		<View style={styles.container}>
			<View style={{ width: 40, height: 40, backgroundColor: iconBackgroundColor || PALETTE.background, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
				{iconContent}
			</View>
			<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, alignItems: 'center' }}>
				<View style={{ maxWidth: '75%' }}>
					<Text style={{ fontFamily: 'Inter_400Regular', color: PALETTE.textWhite, fontSize: 14, wordWrap: 'break-word' }}>{title}</Text>
					<Text style={{ fontFamily: 'Inter_300Light', color: PALETTE.textOffWhite, }}>something else</Text>
				</View>
				<TouchableOpacity>
					<FontAwesome6Pro name='ellipsis-vertical' iconStyle="solid" size={20} color={PALETTE.textWhite} />
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		borderBottomWidth: 1,
		borderColor: '#252530',
		flexDirection: 'row',
	},
});
