import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { BottomTabHeaderProps } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
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
			<View style={{ flexDirection: 'row', alignItems: 'center', height: '100%', paddingHorizontal: 24, gap: 6 }}>
				{(options.title && options.title == 'Home') && (<Image source={require('../../assets/images/audifin.png')} style={{ height: 30, width: 35 }} />)}
				<Text style={{ color: PALETTE.textWhite, fontSize: 20, fontWeight: '600' }}>{options.title == 'Home' ? 'Audifin' : options.title}</Text>
			</View>
		</View>
	);
}
