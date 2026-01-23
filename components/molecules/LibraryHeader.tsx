import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { StyleSheet, View, Text, TouchableOpacity, } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LibraryHeader({ navigation, route }: any) {
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.headerContainer, { paddingTop: insets.top + 8, }]}>
			<Text style={styles.headerTitle}>My Library</Text>
			<View style={{ flexDirection: 'row', gap: 6 }}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
					<FontAwesome6Pro name="arrow-down-wide-short" iconStyle="solid" size={16} color={PALETTE.primary} />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
					<FontAwesome6Pro name="filter" iconStyle="solid" size={16} color={PALETTE.primary} />
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	headerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingBottom: 8,
		paddingHorizontal: 24,
		justifyContent: 'space-between',
		backgroundColor: 'transparent'
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
})
