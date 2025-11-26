import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Button, FlatList } from "react-native";
import TrackPlayer, { PitchAlgorithm, State, Track } from "react-native-track-player";
import { Directory, Paths, File } from "expo-file-system";
import PlaybackControls from "@/components/molecules/PlaybackControls";
import { Link } from "expo-router";
import { PALETTE } from "@/utils/colors";
import * as SecureStore from 'expo-secure-store';
import { useAppSelector } from "@/utils/hooks";
import { getBooks } from "@/utils/db/db";
import { useSQLiteContext } from "expo-sqlite";
import ListTitleCard, { ListTitleCardJelly } from "@/components/molecules/ListTitleCard";
import { fetchAudiobooks } from "@/utils/book-providers/jellyfin";
import { SafeAreaView } from "react-native-safe-area-context";

// source = { require('@/assets/images/react-logo.png') }
export default function Tab() {
  const [books, setBooks] = useState<any[]>([]);
  const [booksJelly, setBooksJelly] = useState<any[]>([]);
  const db = useSQLiteContext();
  const jellyfinProvider = useAppSelector(state => state.bookProvider);

  const fetchMoreBooks = async () => {
    let booksResponse = await fetchAudiobooks(jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '', 14, booksJelly.length - 1);

    if (booksResponse && booksResponse.ok) {
      let additionalBooks = await booksResponse.json();
      setBooksJelly([...booksJelly, ...additionalBooks.Items]);
    }
  };

  useEffect(() => {
    getBooks(db).then((value) => setBooks(value));
  }, []);

  useEffect(() => {
    (async () => {
      let booksResponse = await fetchAudiobooks(jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '');

      if (booksResponse && booksResponse.ok) {
        let parsedResponse = await booksResponse.json();
        setBooksJelly(parsedResponse.Items)
      }
    })().then(() => { });
  }, [jellyfinProvider.jellyfinAccessToken])

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FlatList
        data={booksJelly}
        style={{
          rowGap: 12,
          columnGap: 12
        }}
        numColumns={2}
        onEndReached={fetchMoreBooks}
        onEndReachedThreshold={.7}
        renderItem={(item) => <ListTitleCardJelly {...item} />}
      />
    </SafeAreaView>
  );
}
