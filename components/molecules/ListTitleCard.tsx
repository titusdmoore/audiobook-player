import { PALETTE } from "@/utils/colors";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { useEffect } from "react";
import { getInfoAsync } from "expo-file-system";

export default function ListTitleCard({ index, item }: any) {
	console.log(index, item)

	return (
		<View style={{ flexDirection: 'row', }} key={index}>
			{item.thumbnail_path && (
				<Image source={{ uri: item.thumbnail_path }} style={{ width: 50, height: 75, flex: 1 }} />
			)}
			<Text style={{ color: PALETTE.text, fontSize: 16 }}>{item.title}</Text>
			{item.author && (<Text style={{ color: PALETTE.text }}>{item.author}</Text>)}
			<View>
			</View>
		</View>
	);
}
