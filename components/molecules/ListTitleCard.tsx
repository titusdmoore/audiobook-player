import { PALETTE } from "@/utils/colors";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
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

export function ListTitleCardJelly({ index, item, horizontal }: any) {
	const jellyfinProvider = useAppSelector(state => state.bookProvider);

	return (
		<View style={horizontal ? styles.horizontalContainer : styles.verticalContainer} key={index}>
			<Link href={{
				pathname: '/[titleId]',
				params: { titleId: item.Id }
			}}>
				<View style={{ justifyContent: 'center', alignItems: 'center' }}>
					<Image source={`${jellyfinProvider.jellyfinDomain}/Items/${item.Id}/Images/Primary`} style={{ width: 125, height: 125 }} />
					<Text style={{ color: PALETTE.text, fontSize: 16, textAlign: 'center', paddingTop: 6 }}>{item.Name}</Text>
				</View>
			</Link>
		</View>
	);
}

const styles = StyleSheet.create({
	verticalContainer: {
		width: '50%',
		marginBottom: 18,
		justifyContent: 'center',
		alignItems: 'center',
	},
	horizontalContainer: {
		width: 125,
		alignItems: 'center',
		marginHorizontal: 10,
	},
})
