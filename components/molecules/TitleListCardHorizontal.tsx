import { Playable } from "@/utils/classes/playable";
import { PALETTE } from "@/utils/colors";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";

export default function TitleListCardHorizontal({ index, item }: { index: number, item: Playable }) {
	console.log(index, item.name)
	return (
		<View style={styles.container} key={index}>
			<Link href={{
				pathname: '/[titleId]',
				params: { titleId: item.id }
			}}>
				<View style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
					<Image source={item.imagePath} style={styles.titleImage} />
					<View style={styles.metaContainer}>
						<View style={styles.meta}>
							<Text style={{ color: PALETTE.textWhite, fontSize: 14, wordWrap: 'break-word', width: '75%' }} numberOfLines={2}>{item.name}</Text>
							<Text style={{ color: PALETTE.textOffWhite, fontSize: 12, marginBottom: 6 }}>{item.getArtist() || 'Eric Metaxas'}</Text>
							<Text style={{ color: PALETTE.primary, fontSize: 12 }}>42% Complete</Text>
							<View style={styles.durationContainer}>
								{item.isDownloaded()
									? (<FontAwesome6Pro name="download" iconStyle="solid" size={12} color={PALETTE.success} />)
									: (<FontAwesome6Pro name="cloud" iconStyle="solid" size={12} color={PALETTE.textOffWhite} />)}
								<Text style={{ color: PALETTE.text, fontSize: 12 }}>12h 10m</Text>
							</View>
						</View>
						<TouchableOpacity style={styles.playButton}>
							<FontAwesome6Pro name="play" iconStyle="solid" size={15} color={PALETTE.textWhite} />
						</TouchableOpacity>
					</View>
				</View>
			</Link>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: PALETTE.backgroundLight,
		borderRadius: 10,
		padding: 12,
		width: '100%',
		marginBottom: 12,
	},
	titleImage: {
		width: 85,
		height: 85,
		borderRadius: 10,
	},
	metaContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginLeft: 12,
		flex: 1,
	},
	meta: {
		flex: 1,
	},
	playButton: {
		backgroundColor: PALETTE.primary,
		borderRadius: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		width: 35,
		height: 35,
	},
	durationContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6
	}
});
