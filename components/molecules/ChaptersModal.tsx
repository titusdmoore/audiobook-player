import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { Modal, SafeAreaView, View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import ChapterListItem from "../atoms/ChapterListItem";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function ChaptersModal({ chapters, isOpen, setIsOpen, chapterSelect }: { chapters: any[], isOpen: boolean, setIsOpen: any, chapterSelect: any }) {
	const insets = useSafeAreaInsets();

	return (
		<Modal visible={isOpen} transparent={true}>
			<SafeAreaView style={styles.centeredView}>
				<View style={styles.modalView}>
					<View style={styles.modalHeader}>
						<Text style={styles.modalHeaderText}>Chapters</Text>
						<TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
							<FontAwesome6Pro name="x" size={15} color={PALETTE.text} />
						</TouchableOpacity>
					</View>
					<FlatList
						data={chapters}
						style={{ rowGap: 5, width: '100%' }}
						renderItem={(props) => (<ChapterListItem {...props} playButtonAction={chapterSelect} />)}
					/>
				</View>
			</SafeAreaView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalView: {
		margin: 20,
		backgroundColor: PALETTE.background,
		borderRadius: 20,
		paddingTop: 15,
		paddingHorizontal: 15,
		paddingBottom: 15,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingBottom: 15,
		width: '100%',
	},
	modalHeaderText: {
		color: PALETTE.text,
		fontSize: 18,
	},
});
