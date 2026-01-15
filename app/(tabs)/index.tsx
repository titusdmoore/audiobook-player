import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Button, FlatList, StyleSheet, ScrollView } from "react-native";
import TrackPlayer, { PitchAlgorithm, State, Track } from "react-native-track-player";
import { Directory, Paths, File } from "expo-file-system";
import PlaybackControls from "@/components/molecules/PlaybackControls";
import { Link, useNavigation, usePathname } from "expo-router";
import { PALETTE, PALETTE_OLD } from "@/utils/colors";
import * as SecureStore from 'expo-secure-store';
import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import { getBooks, getDownloadedTitles } from "@/utils/db/db";
import { useSQLiteContext } from "expo-sqlite";
import ListTitleCard, { ListTitleCardJelly } from "@/components/molecules/ListTitleCard";
import { authenticateUserByName, fetchAudiobooks, fetchItem, Item } from "@/utils/book-providers/jellyfin";
import { SafeAreaView } from "react-native-safe-area-context";
import { setAccessToken, setJellyfinUser } from "@/utils/slices/book-provider-slice";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { JellyPlayable } from "@/utils/classes/jelly-playable";
import { DbPlayable } from "@/utils/classes/db-playable";
import { ItemDb } from "@/utils/db/schema";
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from "expo-image";
import ProgressBar from "@/components/molecules/ProgresBar";
import { PlayButton } from "@/components/atoms/AudioControls";

// source = { require('@/assets/images/react-logo.png') }
export default function Tab() {
  const [inProgressIds, setInProgressIds] = useState<{ title_id: string }[]>([]);
  const [inProgressBooks, setInProgressBooks] = useState<JellyPlayable[]>([]);
  const [recentBooks, setRecentBooks] = useState<JellyPlayable[]>([]);
  const navigation = usePathname();
  const [booksJelly, setBooksJelly] = useState<any[]>([]);
  const [downloadedBooks, setDownloadedBooks] = useState<DbPlayable[]>([]);
  const db = useSQLiteContext();
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  // const dispatch = useAppDispatch();


  useEffect(() => {
    (async () => {
      let inProgressIdsDb = await db.getAllAsync('SELECT title_id FROM jellyfin_book_progress LIMIT 10;');
      let downloadedBooks = await getDownloadedTitles(db);

      setDownloadedBooks((downloadedBooks as ItemDb[]).map((book: ItemDb) => new DbPlayable(book)));
      let config = {
        domain: jellyfinProvider.jellyfinDomain ?? '',
        accessToken: jellyfinProvider.jellyfinAccessToken ?? '',
        userId: jellyfinProvider.jellyfinUser?.Id,
      };

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
          setInProgressBooks(books.map((item: Item) => new JellyPlayable(item, config)));
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
          setRecentBooks(books.Items.map((item: Item) => new JellyPlayable(item, config)));
        }
      }
    })().then(() => { });
  }, [navigation, jellyfinProvider.jellyfinDomain, jellyfinProvider.jellyfinAccessToken])
  return (
    <SafeAreaView style={{}}>
      <ScrollView contentContainerStyle={styles.sectionContainer}>
        <View style={{ marginBottom: 24 }}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Continue Listening</Text>
            <TouchableOpacity>
              <Text style={styles.sectionSeeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <LinearGradient
            colors={['rgba(108, 92, 231, 1)', '#A29BFE']}
            end={{ x: 1, y: 1 }}
            style={styles.lastPlayedContainer}
          >
            <View style={styles.lastPlayedMetaContainer}>
              <Image source={downloadedBooks[0]?.imagePath} style={styles.lastPlayedTitleImage} />
              <View style={{ flex: 1, paddingHorizontal: 12, justifyContent: 'center' }}>
                <Text style={styles.lastPlayedTitle}>{downloadedBooks[0]?.name}</Text>
                <Text style={styles.lastPlayedTitleAuthor}>{downloadedBooks[0]?.getArtist() || 'Eric Metaxas'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
                  <ProgressBar value={.42} baseColor="rgba(255, 255, 255, .25)" progressColor={PALETTE.textWhite} rounded={true} />
                  <Text style={{ color: PALETTE.textWhite, fontFamily: 'Inter_400Regular', flex: 1 }}>42%</Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', paddingTop: 24, paddingBottom: 6, alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: PALETTE.textWhite, fontFamily: 'Inter_400Regular' }}>2h 14m Left</Text>
              <View style={styles.compactAudioControlsPlay}>
                <Link href={{
                  pathname: '/[titleId]',
                  params: { titleId: downloadedBooks[0]?.id }
                }}>
                  <FontAwesome6Pro name="play" iconStyle="solid" size={20} color={PALETTE.primary} />
                </Link>
              </View>
            </View>
          </LinearGradient>
        </View>
        <View>
          <View style={styles.sectionTitleContainer}>
            <TouchableOpacity style={styles.sectionTitleLink}>
              <Text style={styles.sectionTitle}>Books Progress</Text>
            </TouchableOpacity>
          </View>
          <FlatList horizontal={true} data={inProgressBooks} renderItem={(props) => (<ListTitleCardJelly {...props} horizontal={true} />)} />
        </View>

        <View>
          <View style={styles.sectionTitleContainer}>
            <TouchableOpacity style={styles.sectionTitleLink}>
              <Text style={styles.sectionTitle}>New Releases</Text>
              <FontAwesome6Pro name="angle-right" size={20} color={PALETTE.text} />
            </TouchableOpacity>
          </View>
          <FlatList horizontal={true} data={recentBooks} renderItem={(props) => (<ListTitleCardJelly {...props} horizontal={true} />)} />
        </View>
        <View>
          <View style={styles.sectionTitleContainer}>
            <TouchableOpacity style={styles.sectionTitleLink}>
              <Text style={styles.sectionTitle}>Downloaded Titles</Text>
              <FontAwesome6Pro name="angle-right" size={20} color={PALETTE.text} />
            </TouchableOpacity>
          </View>
          <FlatList horizontal={true} data={downloadedBooks} renderItem={(props) => (<ListTitleCardJelly {...props} horizontal={true} />)} />
        </View>
      </ScrollView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    color: PALETTE.textWhite,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    flex: 1,
  },
  sectionTitleLink: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionSeeAllText: {
    color: PALETTE.primary,
    fontFamily: 'Inter_400Regular',
  },
  lastPlayedContainer: {
    borderRadius: 10,
    padding: 12
  },
  lastPlayedTitle: {
    color: PALETTE.textWhite,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  lastPlayedTitleAuthor: {
    color: PALETTE.textOffWhite,
    fontFamily: 'Inter_400Regular',
  },
  lastPlayedTitleImage: {
    width: 75,
    height: 75,
    borderRadius: 10
  },
  lastPlayedMetaContainer: {
    flexDirection: 'row',
  },
  compactAudioControlsPlay: {
    width: 50,
    height: 50,
    borderRadius: "100%",
    backgroundColor: PALETTE.textWhite,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
