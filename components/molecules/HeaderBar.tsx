import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { BottomTabHeaderProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, TextInputKeyPressEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HeaderBar({ layout, options, route, navigation }: BottomTabHeaderProps) {
	const insets = useSafeAreaInsets();
	const [searchIsOpen, setSearchIsOpen] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const inputRef = useRef(null);
	const router = useRouter();

	const handleSubmission = async () => {
		router.navigate({ pathname: '/library', params: { searchTerm } });
		setSearchTerm('');
		setSearchIsOpen(false);
	}

	return (
		<View style={{ paddingTop: insets.top, height: 60 + insets.top, backgroundColor: PALETTE.backgroundDark }}>
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: '100%', paddingHorizontal: 24 }}>
				<Text style={{ color: PALETTE.text, fontSize: 20, fontWeight: '600' }}>{options.title == 'Home' ? 'ABP' : options.title}</Text>
				<TextInput
					style={!searchIsOpen ? { display: 'none' } : { color: PALETTE.text }}
					placeholder="Search for Title"
					ref={inputRef}
					value={searchTerm}
					onSubmitEditing={handleSubmission}
					onChangeText={setSearchTerm}
				/>
				<TouchableOpacity style={searchIsOpen ? { display: 'none' } : {}} onPress={() => {
					setSearchIsOpen(!searchIsOpen);
					setTimeout(() => {
						(inputRef.current as any).focus();
					}, 100)
				}}>
					<FontAwesome6Pro name="magnifying-glass" color={PALETTE.text} size={20} />
				</TouchableOpacity>
			</View>
		</View>
	);
}
