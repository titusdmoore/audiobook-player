import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Button, FlatList, StyleSheet, ScrollView } from "react-native";
import TrackPlayer, { PitchAlgorithm, State, Track } from "react-native-track-player";
import { Directory, Paths, File } from "expo-file-system";
import PlaybackControls from "@/components/molecules/PlaybackControls";
import { Link, useNavigation, usePathname } from "expo-router";
import { PALETTE, PALETTE_OLD } from "@/utils/colors";
import * as SecureStore from 'expo-secure-store';
import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import { _debugProgress, getBooks, getDownloadedTitles } from "@/utils/db/db";
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
import { loadTracksForTitle } from "@/utils/audio-player";

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
  const dispatch = useAppDispatch();

  const jellyConfig = {
    domain: jellyfinProvider.jellyfinDomain ?? '',
    accessToken: jellyfinProvider.jellyfinAccessToken ?? '',
    userId: jellyfinProvider.jellyfinUser?.Id
  };

  const handlePlayClick = async () => await loadTracksForTitle(
    db,
    item.id,
    jellyConfig,
    {
      afterLoadCallback: () => dispatch(setActiveTitle({ name: item.name, imagePath: item.imagePath })),
    }
  );


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
    <View style={{}}>
      <ScrollView contentContainerStyle={styles.sectionsContainer}>
        {(recentBooks && recentBooks.length > 0) && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Continue Listening</Text>
              <TouchableOpacity>
                <View>
                  <Text style={styles.sectionSeeAllText}>See All</Text>
                </View>
              </TouchableOpacity>
            </View>
            <LinearGradient
              colors={['rgba(108, 92, 231, 1)', '#A29BFE']}
              end={{ x: 1, y: 1 }}
              style={styles.lastPlayedContainer}
            >
              <View style={styles.lastPlayedMetaContainer}>
                <Image source={recentBooks[0]?.imagePath} style={styles.lastPlayedTitleImage} />
                <View style={{ flex: 1, paddingHorizontal: 12, justifyContent: 'center' }}>
                  <Text style={styles.lastPlayedTitle}>{recentBooks[0]?.name}</Text>
                  <Text style={styles.lastPlayedTitleAuthor}>{recentBooks[0]?.getArtist() || 'Eric Metaxas'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, flex: 1 }}>
                    <ProgressBar value={.42} baseColor="rgba(255, 255, 255, .25)" progressColor={PALETTE.textWhite} rounded={true} />
                    <Text style={{ color: PALETTE.textWhite, /* fontFamily: 'Inter_400Regular' */ }}>42%</Text>
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: 'row', paddingTop: 24, paddingBottom: 6, alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: PALETTE.textWhite, fontFamily: 'Inter_400Regular' }}>2h 14m Left</Text>
                <View style={styles.compactAudioControlsPlay}>
                  <Link href={{
                    pathname: '/[titleId]',
                    params: { titleId: recentBooks[0]?.id }
                  }}>
                    <FontAwesome6Pro name="play" iconStyle="solid" size={20} color={PALETTE.primary} />
                  </Link>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}
        {(inProgressBooks && inProgressBooks.length > 0) && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionTitleContainer}>
              <TouchableOpacity style={styles.sectionTitleLink}>
                <Text style={styles.sectionTitle}>Books Progress</Text>
              </TouchableOpacity>
            </View>
            <FlatList horizontal={true} data={inProgressBooks} renderItem={(props) => (<ListTitleCardJelly {...props} horizontal={true} />)} />
          </View>
        )}

        {(recentBooks && recentBooks.length > 0) && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>New Releases</Text>
              <TouchableOpacity>
                <View>
                  <Text style={styles.sectionSeeAllText}>See All</Text>
                </View>
              </TouchableOpacity>
            </View>
            <FlatList horizontal={true} data={recentBooks} renderItem={(props) => (<ListTitleCardJelly {...props} horizontal={true} />)} />
          </View>
        )}

        {(downloadedBooks && downloadedBooks.length > 0) && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Downloaded Titles</Text>
              <TouchableOpacity>
                <View>
                  <Text style={styles.sectionSeeAllText}>See All</Text>
                </View>
              </TouchableOpacity>
            </View>
            <FlatList horizontal={true} data={downloadedBooks} renderItem={(props) => (<ListTitleCardJelly {...props} horizontal={true} />)} />
          </View>
        )}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
          </View>
          <View style={styles.categoriesContainer}>
            <LinearGradient
              colors={['#9333EA', '#6B21A8']}
              end={{ x: 1, y: 1 }}
              style={styles.categoryContainer}>
              <FontAwesome6Pro name="brain" iconStyle="solid" size={25} color={PALETTE.textWhite} />
              <Text style={styles.categoryTitle}>Self-Help</Text>
              <Text style={styles.categorySubTitle}>145 Titles</Text>
            </LinearGradient>
            <LinearGradient
              colors={['#2563EB', '#1E40AF']}
              end={{ x: 1, y: 1 }}
              style={styles.categoryContainer}>
              <FontAwesome6Pro name="rocket" iconStyle="solid" size={25} color={PALETTE.textWhite} />
              <Text style={styles.categoryTitle}>Sci-Fi</Text>
              <Text style={styles.categorySubTitle}>221 Titles</Text>
            </LinearGradient>
            <LinearGradient
              colors={['#16A34A', '#166534']}
              end={{ x: 1, y: 1 }}
              style={styles.categoryContainer}>
              <FontAwesome6Pro name="cross" iconStyle="solid" size={25} color={PALETTE.textWhite} />
              <Text style={styles.categoryTitle}>Religion</Text>
              <Text style={styles.categorySubTitle}>98 Titles</Text>
            </LinearGradient>
            <LinearGradient
              colors={['#DB2777', '#9D174D']}
              end={{ x: 1, y: 1 }}
              style={styles.categoryContainer}>
              <FontAwesome6Pro name="sword" iconStyle="solid" size={25} color={PALETTE.textWhite} />
              <Text style={styles.categoryTitle}>Fantasy</Text>
              <Text style={styles.categorySubTitle}>176 Titles</Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionsContainer: {
    paddingHorizontal: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    flex: 1,
  },
  sectionTitle: {
    color: PALETTE.textWhite,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
  },
  sectionTitleLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionSeeAllText: {
    color: PALETTE.primary,
    // fontFamily: 'Inter_400Regular',
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
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  categoryContainer: {
    flexBasis: '45%',
    flex: 1,
    borderRadius: 10,
    padding: 12,
  },
  categoryTitle: {
    color: PALETTE.textWhite,
    fontSize: 18,
    marginTop: 8,
    marginBottom: 2
  },
  categorySubTitle: {
    color: PALETTE.textOffWhite,
  }
});
