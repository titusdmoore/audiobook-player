import { PALETTE } from "@/utils/colors";
import { View, Text, TouchableOpacity } from "react-native";
import { useAppSelector } from "@/utils/hooks";
import { Image } from "expo-image";
import { useEffect } from "react";
import { getInfoAsync } from "expo-file-system";
import { Link } from "expo-router";

export default function ListTitleCard({ index, item }: any) {
	// console.log(index, item)

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

export function ListTitleCardJelly({ index, item }: any) {
	// console.log(index, item)
	const jellyfinProvider = useAppSelector(state => state.bookProvider);

	return (
		<View style={{ width: '50%', marginBottom: 24, justifyContent: 'center', alignItems: 'center' }} key={index}>
			<Link href={{
				pathname: '/[titleId]',
				params: { titleId: item.Id }
			}}>
				<View style={{ justifyContent: 'center', alignItems: 'center' }}>
					<Image source={`${jellyfinProvider.jellyfinDomain}/Items/${item.Id}/Images/Primary`} style={{ width: 125, height: 125 }} />
					<Text style={{ color: PALETTE.text, fontSize: 16, textAlign: 'center' }}>{item.Name}</Text>
				</View>
			</Link>
		</View>
	);
}
