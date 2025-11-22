import { useEffect, useState } from "react";
import { Button, FlatList, View } from "react-native";
import FileExplorerEntry from "../atoms/FileExplorerEntry";
import { DropboxProvider } from "@/utils/book-providers/dropbox";
import { useAppSelector } from '@/utils/hooks';
import { PALETTE } from "@/utils/colors";
import { addBookProvider } from "@/utils/db/db";
import { useSQLiteContext } from "expo-sqlite";

export type FileEntry = {
	".tag": string,
}

export type FileExplorerProps = {
	initialPath: string
}

export default function FileExplorer({ initialPath }: FileExplorerProps) {
	const bookProvider = useAppSelector(state => state.bookProvider);
	const db = useSQLiteContext();

	const [activePath, setActivePath] = useState<string>(initialPath);
	const [fileEntries, setFileEntries] = useState([]);
	const [activeCursor, setActiveCursor] = useState<string | null>(null);
	const [selectedPaths, setSelectedPaths] = useState<number[]>([]);

	useEffect(() => {
		setFileEntries([]);
		(async () => {
			// console.log('initial path', initialPath)
			let fileResponse = await DropboxProvider.listEntriesForDir(bookProvider.dropboxAccessToken ?? '', initialPath);

			if (fileResponse) {
				setActiveCursor(fileResponse.cursor);
				setFileEntries(fileResponse.entries);
			}
		})().then(() => { });
		// Empty path is root
		// await DropboxProvider.listEntriesForDir(bookProvider.dropboxAccessToken ?? '', '');
	}, [activePath]);

	const loadMore = async () => {

	};

	return (
		<View>
			<FlatList
				data={fileEntries}
				renderItem={(props) => <FileExplorerEntry
					{...props}
					selectedPaths={selectedPaths}
					setSelectedPaths={setSelectedPaths}
					setActivePath={setActivePath}
				/>}
				onEndReached={loadMore}
				onEndReachedThreshold={100}
			/>
			<Button
				title="Use Paths"
				disabled={selectedPaths.length == 0}
				color={PALETTE.primary}
				onPress={async () => {
					for (const path of selectedPaths) {
						let fileEntry: any = fileEntries[path];
						console.log(fileEntry)
						await addBookProvider(db, { name: 'Dropbox: ' + fileEntry.name, remotePath: fileEntry.path_lower })
					}
				}}
			/>
		</View>
	);
}
