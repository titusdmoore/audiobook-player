import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Button, FlatList, StyleSheet, ScrollView } from "react-native";
import TrackPlayer, { PitchAlgorithm, State, Track } from "react-native-track-player";
import { Directory, Paths, File } from "expo-file-system";
import PlaybackControls from "@/components/molecules/PlaybackControls";
import { Link } from "expo-router";
import { PALETTE } from "@/utils/colors";
import * as SecureStore from 'expo-secure-store';
import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import { getBooks } from "@/utils/db/db";
import { useSQLiteContext } from "expo-sqlite";
import ListTitleCard, { ListTitleCardJelly } from "@/components/molecules/ListTitleCard";
import { authenticateUserByName, fetchAudiobooks, fetchItem } from "@/utils/book-providers/jellyfin";
import { SafeAreaView } from "react-native-safe-area-context";
import { getItemAsync, setItemAsync } from "expo-secure-store";
import { setAccessToken, setJellyfinUser } from "@/utils/slices/book-provider-slice";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";

// source = { require('@/assets/images/react-logo.png') }
export default function Tab() {
  const [inProgressBooks, setInProgressBooks] = useState<any[]>([]);
  const [booksJelly, setBooksJelly] = useState<any[]>([]);
  const db = useSQLiteContext();
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const dispatch = useAppDispatch();


  useEffect(() => {
    (async () => {
      let inProgressIds = await db.getAllAsync('SELECT title_id FROM jellyfin_book_progress;');
      console.log("ids", inProgressIds)
      inProgressIds.forEach(async (dbObj: any) => {
        let bookRes = await fetchItem(jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '', jellyfinProvider.jellyfinUser?.Id, dbObj.title_id);

        if (bookRes && bookRes.ok) {
          setInProgressBooks([...inProgressBooks, await bookRes.json()]);
        }
      });
      // let booksResponse = await fetchAudiobooks(jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '');

      // if (booksResponse && booksResponse.ok) {
      //   let parsedResponse = await booksResponse.json();
      //   setBooksJelly(parsedResponse.Items)
      // } else if (booksResponse && booksResponse.status == 401) {
      //   if (jellyfinProvider.jellyfinAccessToken) {
      //     let userResponse = await authenticateUserByName(await getItemAsync('jellyfinDomain') ?? '', await getItemAsync('jellyfinUsername') ?? '', await getItemAsync('jellyfinPassword') ?? '');
      //
      //     if (userResponse.errors) {
      //       await setItemAsync('jellyfinAccessToken', '');
      //       return;
      //     }
      //
      //     await setItemAsync('jellyfinAccessToken', userResponse.accessToken);
      //     dispatch(setAccessToken(userResponse.accessToken));
      //     dispatch(setJellyfinUser(userResponse.user));
      //   }
      // }
    })().then(() => { });
  }, [])

  return (
    <SafeAreaView style={styles.sectionContainer}>
      <View style={styles.sectionTitleContainer}>
        <TouchableOpacity style={styles.sectionTitleLink}>
          <Text style={styles.sectionTitle}>Books In Progress</Text>
          <FontAwesome6Pro name="angle-right" size={20} color={PALETTE.text} />
        </TouchableOpacity>
        <ScrollView horizontal={true}>
          {inProgressBooks.map((book, index) => (
            <ListTitleCardJelly index={index} item={book} key={index} />
          ))}
        </ScrollView>
      </View>
      <View style={styles.sectionTitleContainer}>
        <TouchableOpacity style={styles.sectionTitleLink}>
          <Text style={styles.sectionTitle}>Recently Added Titles</Text>
          <FontAwesome6Pro name="angle-right" size={20} color={PALETTE.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.sectionTitleContainer}>
        <TouchableOpacity style={styles.sectionTitleLink}>
          <Text style={styles.sectionTitle}>Downloaded Titles</Text>
          <FontAwesome6Pro name="angle-right" size={20} color={PALETTE.text} />
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
  },
});
