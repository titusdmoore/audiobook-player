import { formatAudioProgressTime } from "@/utils/audio-player";
import { Playable } from "@/utils/classes/playable";
import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function ChapterListItem({ chapter, index }: { chapter: Playable, index: number }) {
	return (
		<View style={styles.chapterContainer} key={index}>
			<View style={{ width: 40, height: 40, backgroundColor: PALETTE.background, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
				<Text style={{ color: PALETTE.textOffWhite, fontSize: 18, fontFamily: 'Inter_400Regular' }}>{index + 1}</Text>
			</View>
			<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, alignItems: 'center' }}>
				<View style={{ maxWidth: '75%' }}>
					<Text style={{ fontFamily: 'Inter_400Regular', color: PALETTE.textWhite, fontSize: 14, wordWrap: 'break-word' }} numberOfLines={2}>{chapter.name}</Text>
					<Text style={{ fontFamily: 'Inter_300Light', color: PALETTE.textOffWhite, }}>{formatAudioProgressTime(chapter.getDuration())}</Text>
				</View>
				<TouchableOpacity>
					<FontAwesome6Pro name='ellipsis-vertical' iconStyle="solid" size={20} color={PALETTE.textWhite} />
				</TouchableOpacity>
			</View>
		</View>
	);
}


const styles = StyleSheet.create({
	chapterContainer: {
		padding: 16,
		borderBottomWidth: 1,
		borderColor: '#252530',
		flexDirection: 'row',
	},
});
