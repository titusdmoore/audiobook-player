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
		<View style={{ paddingTop: insets.top, height: 60 + insets.top }}>
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: '100%', paddingHorizontal: 24 }}>
				<Text style={{ color: PALETTE.textWhite, fontSize: 20, fontWeight: '600' }}>{options.title == 'Home' ? 'ABP' : options.title}</Text>
			</View>
		</View>
	);
}
