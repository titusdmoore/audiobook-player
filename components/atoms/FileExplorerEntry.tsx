import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { Text, TouchableOpacity, View } from "react-native";

export default function FileExplorerEntry({ index, item, selectedPaths, setSelectedPaths, setActivePath }: any) {
	const isDir = item[".tag"] == 'folder';
	const isActive = selectedPaths.includes(index);

	const handleFilePathPress = () => {
		if (isActive) {
			setSelectedPaths(selectedPaths.filter((i: number) => i != index));
			return;
		}


		setSelectedPaths([...selectedPaths, index]);
	};

	return (
		<TouchableOpacity
			disabled={!isDir}
			key={index}
			style={{
				flexDirection: 'row',
				gap: 4,
				paddingVertical: 6,
				paddingHorizontal: 4,
				backgroundColor: isActive ? PALETTE.primary : 'transparent',
				alignItems: 'center',
			}}
			onPress={handleFilePathPress}
		>
			{
				isDir ? (<FontAwesome6Pro name="folder" size={15} color={isActive ? PALETTE.text : PALETTE.primary} iconStyle="solid" />)
					: (<FontAwesome6Pro name="file" size={15} color={isActive ? PALETTE.text : PALETTE.primary} iconStyle="solid" />)}

			<Text style={{ color: PALETTE.text }}>{item.name}</Text>
		</TouchableOpacity>
	);
}
