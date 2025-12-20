import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Button, FlatList, StyleSheet, ScrollView } from "react-native";
import TrackPlayer, { PitchAlgorithm, State, Track } from "react-native-track-player";
import { Directory, Paths, File } from "expo-file-system";
import PlaybackControls from "@/components/molecules/PlaybackControls";
import { Link, useNavigation, usePathname } from "expo-router";
import { PALETTE } from "@/utils/colors";
import * as SecureStore from 'expo-secure-store';
import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import { getBooks, getDownloadedTitles } from "@/utils/db/db";
import { useSQLiteContext } from "expo-sqlite";
import ListTitleCard, { ListTitleCardJelly } from "@/components/molecules/ListTitleCard";
import { authenticateUserByName, fetchAudiobooks, fetchItem, Item } from "@/utils/book-providers/jellyfin";
import { SafeAreaView } from "react-native-safe-area-context";
import { setAccessToken, setJellyfinUser } from "@/utils/slices/book-provider-slice";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";

// source = { require('@/assets/images/react-logo.png') }
export default function Tab() {
  const [inProgressIds, setInProgressIds] = useState<{ title_id: string }[]>([]);
  const [inProgressBooks, setInProgressBooks] = useState<Item[]>([]);
  const [recentBooks, setRecentBooks] = useState<Item[]>([]);
  const navigation = usePathname();
  const [booksJelly, setBooksJelly] = useState<any[]>([]);
  const [downloadedBooks, setDownloadedBooks] = useState<any[]>([]);
  const db = useSQLiteContext();
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const dispatch = useAppDispatch();


  useEffect(() => {
    (async () => {
      let inProgressIdsDb = await db.getAllAsync('SELECT title_id FROM jellyfin_book_progress LIMIT 10;');
      let testing = await db.getAllAsync('SELECT * FROM items WHERE parent_db_id IS NULL;');
      console.log(testing, "new 2")
      let downloadedBooks = await getDownloadedTitles(db);
      setDownloadedBooks(downloadedBooks);
      console.log(downloadedBooks, "new")

      if (JSON.stringify(inProgressIdsDb) != JSON.stringify(inProgressIds)) {
        let books: any[] = [];
        for (const progressId of inProgressIdsDb) {
          let bookRes = await fetchItem(jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '', jellyfinProvider.jellyfinUser?.Id, (progressId as any).title_id);

          if (bookRes && bookRes.ok) {
            books.push(await bookRes.json());
          } else {
            // console.log(await bookRes.text())
          }
        }

        if (books.length > 0) {
          setInProgressBooks(books);
          setInProgressIds(inProgressIdsDb as any);
        }
      }

      if (recentBooks.length == 0) {
        let booksResponse = await fetchAudiobooks(
          jellyfinProvider.jellyfinDomain ?? '',
          jellyfinProvider.jellyfinAccessToken ?? '',
          { limit: 10, sortBy: 'DateCreated', excludeItemIds: inProgressIds.map(({ title_id }) => (title_id)) }
        );

        if (booksResponse && booksResponse.ok) {
          let books = await booksResponse.json();
          setRecentBooks(books.Items);
        }
      }
    })().then(() => { });
  }, [navigation])

  return (
    <SafeAreaView style={styles.sectionContainer}>
      <View style={styles.sectionTitleContainer}>
        <TouchableOpacity style={styles.sectionTitleLink}>
          <Text style={styles.sectionTitle}>Books In Progress</Text>
          <FontAwesome6Pro name="angle-right" size={20} color={PALETTE.text} />
        </TouchableOpacity>
        <FlatList horizontal={true} data={inProgressBooks} renderItem={(props) => (<ListTitleCardJelly {...props} horizontal={true} />)} />
      </View>
      <View style={styles.sectionTitleContainer}>
        <TouchableOpacity style={styles.sectionTitleLink}>
          <Text style={styles.sectionTitle}>Recently Added Titles</Text>
          <FontAwesome6Pro name="angle-right" size={20} color={PALETTE.text} />
        </TouchableOpacity>
        <FlatList horizontal={true} data={recentBooks} renderItem={(props) => (<ListTitleCardJelly {...props} horizontal={true} />)} />
      </View>
      <View style={styles.sectionTitleContainer}>
        <TouchableOpacity style={styles.sectionTitleLink}>
          <Text style={styles.sectionTitle}>Downloaded Titles</Text>
          <FontAwesome6Pro name="angle-right" size={20} color={PALETTE.text} />
          <FlatList horizontal={true} data={downloadedBooks} renderItem={(props) => (<ListTitleCardJelly {...props} horizontal={true} />)} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 12,
  },
  sectionTitleContainer: {
    marginBottom: 24
  },
  sectionTitle: {
    color: PALETTE.text,
    fontSize: 20,
  },
  sectionTitleLink: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});
