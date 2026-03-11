import { Playable } from "@/utils/classes/playable";
import { PALETTE } from "@/utils/colors";
import { Dispatch, SetStateAction } from "react";
import { Modal, View, StyleSheet, Text, ScrollView } from "react-native";
import ChapterListItem from "../atoms/ChapterListItem";

type ChaptersListModalProps = {
	chapters: Playable[],
	isOpen: boolean
	setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export default function ChaptersListModal({ chapters, isOpen, setIsOpen }: ChaptersListModalProps) {
	return (
		<Modal
			visible={isOpen}
			transparent={true}
		>
			<View style={styles.centeredView}>
				<View style={styles.modalView}>
					<View style={styles.headerContainer}>
						<View>
							<Text style={styles.headerText}>Chapters</Text>
						</View>
					</View>
					<View style={{ flex: 1 }}>
						<ScrollView style={{}}>
							{chapters.map((chapter, index) => (<ChapterListItem key={index} chapter={chapter} index={index} />))}
						</ScrollView>
					</View>
				</View>
			</View>
		</Modal>
	);
}


const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(10, 10, 15, .9)'
	},
	modalView: {
		width: '80%',
		margin: 20,
		backgroundColor: PALETTE.backgroundLight,
		borderRadius: 20,
		padding: 16,
		alignItems: 'center',
		shadowColor: PALETTE.primary,
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 5,
	},
	headerContainer: {
		flexDirection: 'row',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 24,
	},
	headerText: {
		color: PALETTE.text,
		fontSize: 18,
	},
});
