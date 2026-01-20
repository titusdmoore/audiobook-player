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
	const [customAmount, setCustomAmount] = useState<string>('0');

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
						<View>
							<Text style={styles.headerText}>Sleep Timer</Text>
							<Text style={styles.modalSubtitle}>Auto-pause after duration</Text>
						</View>
						<TouchableOpacity style={{ padding: 4 }} onPress={() => setIsOpen(!isOpen)}>
							<FontAwesome6Pro name='x' size={16} color={PALETTE.text} />
						</TouchableOpacity>
					</View>
					<View style={styles.defaultTimeSetButtonContainer}>
						<TouchableOpacity style={styles.defaultTimeSetButton} onPress={() => handleTimerSet(5)}>
							<FontAwesome6Pro name='clock' iconStyle="solid" size={16} color={PALETTE.primary} />
							<Text style={styles.timeSetButton}>5m</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.defaultTimeSetButton} onPress={() => handleTimerSet(10)}>
							<FontAwesome6Pro name='clock' iconStyle="solid" size={16} color={PALETTE.primary} />
							<Text style={styles.timeSetButton}>10m</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.defaultTimeSetButton} onPress={() => handleTimerSet(15)}>
							<FontAwesome6Pro name='clock' iconStyle="solid" size={16} color={PALETTE.primary} />
							<Text style={styles.timeSetButton}>15m</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.defaultTimeSetButton} onPress={() => handleTimerSet(30)}>
							<FontAwesome6Pro name='clock' iconStyle="solid" size={16} color={PALETTE.primary} />
							<Text style={styles.timeSetButton}>30m</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.defaultTimeSetButton} onPress={() => handleTimerSet(45)}>
							<FontAwesome6Pro name='clock' iconStyle="solid" size={16} color={PALETTE.primary} />
							<Text style={styles.timeSetButton}>45m</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.defaultTimeSetButton} onPress={() => handleTimerSet(60)}>
							<FontAwesome6Pro name='clock' iconStyle="solid" size={16} color={PALETTE.primary} />
							<Text style={styles.timeSetButton}>1h</Text>
						</TouchableOpacity>
						<TouchableOpacity style={[styles.defaultTimeSetButton, styles.chapterTimeSetButton]} onPress={() => handleTimerSet(15)}>
							<FontAwesome6Pro name='book-open' iconStyle="solid" size={16} color={PALETTE.primary} />
							<Text style={styles.timeSetButton}>End of chapter</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.customAmountContainer}>
						<View style={styles.customAmountHeader}>
							<Text style={styles.customAmountHeaderText}>Custom time (minutes)</Text>
							<TextInput keyboardType="number-pad" style={styles.customAmountInput} selectTextOnFocus={true} value={customAmount} onChangeText={setCustomAmount} />
						</View>
						<View style={styles.sliderContainer}>
							<Slider
								style={{ flex: 1, height: 20 }}
								minimumValue={0}
								value={parseInt(customAmount)}
								maximumValue={100}
								minimumTrackTintColor={PALETTE.primary}
								maximumTrackTintColor={PALETTE.text}
								thumbTintColor={PALETTE.primary}
								step={1}
								onValueChange={value => setCustomAmount(value.toString())}
							/>
							<TouchableOpacity
								style={styles.customAmountSetButton}
								onPress={() => handleTimerSet(parseInt(customAmount))}
							>
								<Text style={styles.customAmountButtonText}>Set</Text>
							</TouchableOpacity>
						</View>
					</View>
					<TouchableOpacity style={styles.cancelButton} onPress={() => handleTimerSet(null)}>
						<FontAwesome6Pro name='x' iconStyle="solid" size={16} color={PALETTE.redLight} />
						<Text style={styles.cancelButtonText}>Cancel Timer</Text>
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
		backgroundColor: 'rgba(10, 10, 15, .9)'
	},
	customAmountContainer: {
		width: '100%',
		paddingVertical: 12,
		backgroundColor: PALETTE.background,
		borderRadius: 10,
		marginTop: 12,
		padding: 12
	},
	customAmountHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	customAmountHeaderText: {
		color: PALETTE.textWhite,
		fontFamily: 'Inter_400Regular',
		flex: 1,
	},
	customAmountInputContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	customAmountInput: {
		color: PALETTE.primary
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
	modalSubtitle: {
		color: PALETTE.textOffWhite
	},
	defaultTimeSetButtonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		gap: 12,
		flexWrap: 'wrap',
	},
	defaultTimeSetButton: {
		paddingVertical: 18,
		flex: 1,
		flexBasis: '25%',
		backgroundColor: PALETTE.background,
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center'
	},
	chapterTimeSetButton: {
		paddingVertical: 14,
		flexDirection: 'row',
		gap: 8,
		alignItems: 'center'
	},
	inputHelperText: {
		color: PALETTE.text,
	},
	timeSetButton: {
		color: PALETTE.textWhite,
	},
	modalView: {
		width: '80%',
		margin: 20,
		backgroundColor: PALETTE.backgroundLight,
		borderRadius: 20,
		padding: 15,
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
	customAmountButtonText: {
		color: PALETTE.text,
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
	sliderContainer: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	cancelButton: {
		backgroundColor: 'rgba(238, 68, 68, .2)',
		paddingVertical: 12,
		borderRadius: 10,
		width: '100%',
		marginTop: 12,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		gap: 6,
	},
	cancelButtonText: {
		color: PALETTE.redLight,
		fontSize: 16,
		fontWeight: '500'
	}
});
