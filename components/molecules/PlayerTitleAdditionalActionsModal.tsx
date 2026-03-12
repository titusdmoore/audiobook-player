import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { Link } from "expo-router";
import { Dispatch, SetStateAction } from "react";
import { Modal, View, StyleSheet, Text, ScrollView, TouchableOpacity, Pressable } from "react-native";

type TitleActionsListModalProps = {
	isOpen: boolean
	setIsOpen: Dispatch<SetStateAction<boolean>>;
	titleId: string;
};

export default function PlayerTitleAdditionalActionsModal({ titleId, isOpen, setIsOpen }: TitleActionsListModalProps) {
	return (
		<Modal
			visible={isOpen}
			transparent={true}
		>
			<Pressable style={styles.centeredView} onPress={() => setIsOpen(!isOpen)}>
				<View style={styles.modalView}>
					<Link href={{
						pathname: '/[titleId]',
						params: { titleId: '' }
					}}
					>
						<View style={styles.menuItemContainer}>https://github.com/immich-app/immich/discussions/20479
							<FontAwesome6Pro name="book" size={16} style={{ marginRight: 8 }} color={PALETTE.textWhite} />
							<Text style={styles.menuItem}>Title Details</Text>
						</View>
					</Link>
					<TouchableOpacity style={styles.menuItemContainer}>
						<FontAwesome6Pro name="books" iconStyle="solid" style={{ marginRight: 8 }} size={16} color={PALETTE.textWhite} />
						<Text style={styles.menuItem}>View in Library</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.menuItemContainer}>
						<FontAwesome6Pro name="badge-check" style={{ marginRight: 8 }} size={16} color={PALETTE.textWhite} />
						<Text style={styles.menuItem}>Mark as Finished</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.menuItemContainer}>
						<FontAwesome6Pro name="gear" style={{ marginRight: 8 }} size={16} color={PALETTE.textWhite} />
						<Text style={styles.menuItem}>Player Settings</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.menuItemContainer}>
						<FontAwesome6Pro name="file" style={{ marginRight: 8 }} size={16} color={PALETTE.textWhite} />
						<Text style={styles.menuItem}>Listen Log</Text>
					</TouchableOpacity>
				</View>
			</Pressable>
		</Modal>
	)
}

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'flex-end',
		paddingTop: 55
	},
	modalView: {
		margin: 20,
		backgroundColor: PALETTE.backgroundLight,
		borderRadius: 20,
		padding: 16,
		shadowColor: PALETTE.primary,
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 5,
	},
	menuItemContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 5,
		paddingHorizontal: 8,
	},
	menuItem: {
		color: PALETTE.textWhite,
		fontSize: 15
	},
});
