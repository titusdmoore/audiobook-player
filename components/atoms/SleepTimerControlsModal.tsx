import { PALETTE } from "@/utils/colors";
import Slider from "@react-native-community/slider";
import { Dispatch, SetStateAction, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";

type SleepTimerControlsModalProps = {
	isOpen: boolean
	setIsOpen: Dispatch<SetStateAction<boolean>>;
	sleepTimer: number | null,
	setSleepTimer: any;
};

export default function SleepTimerControlsModal({ isOpen, setIsOpen, sleepTimer, setSleepTimer }: SleepTimerControlsModalProps) {
	const [customAmount, setCustomAmount] = useState<number>(0);

	const handleSetCustomAmount = () => {
		handleTimerSet(customAmount);
	};

	const handleTimerSet = (amount: number | null) => {
		setSleepTimer(amount);
		setIsOpen(!isOpen);
	}

	return (
		<Modal
			visible={isOpen}
			transparent={true}
		>
			<View style={styles.centeredView}>
				<View style={styles.modalView}>
					<View>
						<Text>Custom Amount:</Text>
						<TextInput
							style={styles.input}
							placeholder="Timer"
							value={customAmount.toString()}
							onChangeText={(text) => setCustomAmount(parseInt((text ?? '0').replace(/[^0-9]/g, '')))}
						/>
						<TouchableOpacity onPress={handleSetCustomAmount}>
							<Text>Set Amount</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity onPress={() => handleTimerSet(5)}>
						<Text>5 Minutes</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => handleTimerSet(10)}>
						<Text>10 Minutes</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => handleTimerSet(30)}>
						<Text>30 Minutes</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => handleTimerSet(60)}>
						<Text>1 Hour</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => handleTimerSet(null)}>
						<Text>Clear Timer</Text>
					</TouchableOpacity>
					<View>
						<TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
							<Text>Dismiss</Text>
						</TouchableOpacity>
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
	},
	input: {
		borderColor: PALETTE.primary,
		borderWidth: 1,
		borderRadius: 12,
		padding: 6,
		color: PALETTE.text
	},
	modalView: {
		margin: 20,
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 35,
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
});
