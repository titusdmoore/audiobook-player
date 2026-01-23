import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function TitleHeader({ navigation, route }: any) {
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.titleContainer, { paddingTop: insets.top + 6, }]}>
			<TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
				<FontAwesome6Pro name="arrow-left" iconStyle="solid" size={16} color={PALETTE.textWhite} />
			</TouchableOpacity>
			<View style={{ flexDirection: 'row', gap: 6 }}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
					<FontAwesome6Pro name="share-nodes" size={16} color={PALETTE.textWhite} />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
					<FontAwesome6Pro name="heart" size={16} color={PALETTE.textWhite} />
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'transparent',
		paddingBottom: 6,
		paddingHorizontal: 24,
		justifyContent: 'space-between'
	},
	headerButton: {
		backgroundColor: 'rgba(107, 114, 128, .15)',
		backdropFilter: 'blur(10px)',
		borderRadius: '100%',
		width: 35,
		height: 35,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		fontFamily: 'Inter_600SemiBold',
		fontSize: 20,
		color: PALETTE.textWhite,
	},
});
