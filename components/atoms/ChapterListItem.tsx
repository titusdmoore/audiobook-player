import { Playable } from "@/utils/classes/playable";
import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { View, Text, TouchableOpacity } from "react-native";

export default function ChapterListItem({ index, item: chapter, playButtonAction }: { index: number, item: Playable, playButtonAction: any }) {
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 45, width: '100%', paddingHorizontal: 10 }}>
			<Text style={{ color: PALETTE.text, flexBasis: '85%' }}>{chapter.name}</Text>
			<TouchableOpacity style={{}} onPress={() => playButtonAction(index)}>
				<FontAwesome6Pro name="circle-play" size={20} color={PALETTE.text} />
			</TouchableOpacity>
		</View>
	);
}
