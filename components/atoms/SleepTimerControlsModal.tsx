import { PALETTE } from "@/utils/colors";
import Slider from "@react-native-community/slider";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { Dispatch, SetStateAction, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";

type SleepTimerControlsModalProps = {
	isOpen: boolean
	setIsOpen: Dispatch<SetStateAction<boolean>>;
	sleepTimer: number | null,
	setSleepTimer: any;
};

export default function SleepTimerControlsModal({ isOpen, setIsOpen, sleepTimer, setSleepTimer }: SleepTimerControlsModalProps) {
	const [customAmountMinutes, setCustomAmountMinutes] = useState<number>(0);
	const [customAmountHours, setCustomAmountHours] = useState<number>(0);

	const handleSetCustomAmount = () => {
		handleTimerSet((customAmountHours * 60) + customAmountMinutes);
	};

	const handleTimerSet = (amount: number | null) => {
		setSleepTimer(amount);
		setIsOpen(!isOpen);
	}

	const handleNumericChange = (text: string, stateAmount: number, stateChangeHandler: any) => {
		let newValue = stateAmount;
		if (text == "") {
			newValue = 0;
			stateChangeHandler(0);
			return;
		}

		newValue = parseInt(text);
		stateChangeHandler(newValue);
	};

	return (
		<Modal
			visible={isOpen}
			transparent={true}
		>
			<View style={styles.centeredView}>
				<View style={styles.modalView}>
					<View style={styles.headerContainer}>
						<Text style={styles.headerText}>Sleep Timer</Text>
						<TouchableOpacity style={{ padding: 4 }} onPress={() => setIsOpen(!isOpen)}>
							<FontAwesome6Pro name='x' size={16} color={PALETTE.text} />
						</TouchableOpacity>
					</View>
					<View style={styles.customAmountContainer}>
						<Text style={styles.customAmountHelperText}>Custom Amount:</Text>
						<View style={styles.customAmountInputContainer}>
							<View style={styles.inputContainer}>
								<TextInput
									style={styles.input}
									placeholder="Timer"
									keyboardType="numeric"
									value={customAmountHours.toString()}
									onChangeText={(text) => handleNumericChange(text, customAmountHours, setCustomAmountHours)}
								/>
								<Text style={styles.inputHelperText}>Hours</Text>
							</View>
							<View style={styles.inputContainer}>
								<TextInput
									style={styles.input}
									placeholder="Timer"
									keyboardType="numeric"
									value={customAmountMinutes.toString()}
									onChangeText={(text) => handleNumericChange(text, customAmountMinutes, setCustomAmountMinutes)}
								/>
								<Text style={styles.inputHelperText}>Minutes</Text>
							</View>
						</View>
						<TouchableOpacity onPress={handleSetCustomAmount} style={styles.customAmountSetButton}>
							<Text style={styles.customAmountButtonText}>Set Amount</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity style={styles.defaultTimeSetButton} onPress={() => handleTimerSet(5)}>
						<Text style={styles.timeSetButton}>5 Minutes</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.defaultTimeSetButton} onPress={() => handleTimerSet(10)}>
						<Text style={styles.timeSetButton}>10 Minutes</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.defaultTimeSetButton} onPress={() => handleTimerSet(30)}>
						<Text style={styles.timeSetButton}>30 Minutes</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.defaultTimeSetButton} onPress={() => handleTimerSet(60)}>
						<Text style={styles.timeSetButton}>1 Hour</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.defaultTimeSetButton} onPress={() => handleTimerSet(null)}>
						<Text style={styles.timeSetButton}>Clear Timer</Text>
					</TouchableOpacity>
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
	customAmountContainer: {
		width: '100%',
		paddingVertical: 12,
	},
	customAmountHelperText: {
		color: PALETTE.text,
		fontSize: 14,
	},
	customAmountInputContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	customAmountSetButton: {
		paddingVertical: 5,
		paddingHorizontal: 15,
		backgroundColor: PALETTE.primary,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 5,
		marginTop: 12,
	},
	input: {
		borderColor: PALETTE.primary,
		borderBottomWidth: 1,
		borderRadius: 12,
		padding: 6,
		color: PALETTE.text,
		minWidth: 40,
		textAlign: 'right',
		paddingHorizontal: 12,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	defaultTimeSetButton: {
		paddingVertical: 4,
	},
	inputHelperText: {
		color: PALETTE.text,
	},
	timeSetButton: {
		color: PALETTE.text,
	},
	modalView: {
		width: '80%',
		margin: 20,
		backgroundColor: PALETTE.background,
		borderRadius: 20,
		padding: 15,
		alignItems: 'center',
		shadowColor: '#fff',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	customAmountButtonText: {
		color: PALETTE.text,
	},
	headerContainer: {
		flexDirection: 'row',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	headerText: {
		color: PALETTE.text,
		fontSize: 18,
	}
});
