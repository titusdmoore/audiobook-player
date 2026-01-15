import { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View, Text, TextInput, ScrollView, Touchable } from "react-native";
import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import { ListTitleCardJelly } from "@/components/molecules/ListTitleCard";
import { authenticateUserByName, fetchAudiobooks, Item } from "@/utils/book-providers/jellyfin";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { setAccessToken, setJellyfinUser } from "@/utils/slices/book-provider-slice";
import { useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import { Storage } from "expo-sqlite/kv-store";
import { getAppOption } from "@/utils/db/db";
import { useSQLiteContext } from "expo-sqlite";
import { JellyPlayable } from "@/utils/classes/jelly-playable";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { PALETTE } from "@/utils/colors";
import TitleListCardHorizontal from "@/components/molecules/TitleListCardHorizontal";
import { getPlayableById } from "@/utils";
import { Playable } from "@/utils/classes/playable";
import { calculateNewStiffnessToMatchDuration } from "react-native-reanimated/lib/typescript/animation/spring";

export function LibraryHeader({ navigation, route, options, back }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: insets.top + 8, paddingBottom: 8, paddingHorizontal: 24, justifyContent: 'space-between', backgroundColor: 'transparent' }}>
      <Text style={styles.headerTitle}>My Library</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <FontAwesome6Pro name="arrow-down-wide-short" iconStyle="solid" size={16} color={PALETTE.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <FontAwesome6Pro name="filter" iconStyle="solid" size={16} color={PALETTE.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Tab() {
  const [booksJelly, setBooksJelly] = useState<any[]>([]);
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const dispatch = useAppDispatch();
  const { searchTerm } = useLocalSearchParams();
  const [searchInput, setSearchInput] = useState<string>('');
  const db = useSQLiteContext();

  const jellyConfig = {
    domain: jellyfinProvider.jellyfinDomain ?? '',
    accessToken: jellyfinProvider.jellyfinAccessToken ?? '',
    userId: jellyfinProvider.jellyfinUser?.Id
  };
  // const global = useGlobalSearchParams();


  const fetchMoreBooks = async () => {
    let booksResponse = await fetchAudiobooks(jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '', { limit: 14, startIndex: booksJelly.length - 1 });

    if (booksResponse && booksResponse.ok) {
      let additionalBooks = await booksResponse.json();
      let newPlayables: Playable[] = await Promise.all(additionalBooks.Items.map(async (item: Item) => await getPlayableById(item.Id, jellyConfig, db)));
      newPlayables = newPlayables.filter((item) => item);

      let joinedPlayables = booksJelly.concat(newPlayables);
      setBooksJelly(joinedPlayables);
    }
  };

  useEffect(() => {
    (async () => {
      // console.log('local', local);
      let booksResponse = await fetchAudiobooks(jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '', searchTerm ? { searchTerm: searchTerm as string } : {});

      if (booksResponse && booksResponse.ok) {
        let parsedResponse = await booksResponse.json();

        let playables: Playable[] = await Promise.all(parsedResponse.Items.map(async (item: Item) => await getPlayableById(item.Id, jellyConfig, db)));
        playables = playables.filter((item) => item);

        setBooksJelly(playables);
      } else if (booksResponse && booksResponse.status == 401) {
        if (jellyfinProvider.jellyfinAccessToken) {
          let userResponse = await authenticateUserByName(
            (await getAppOption(db, 'jellyfinDomain'))?.option_value ?? '',
            (await getAppOption(db, 'jellyfinUsername'))?.option_value ?? '',
            (await getAppOption(db, 'jellyfinPassword'))?.option_value ?? ''
          );

          if (userResponse.errors) {
            console.log(userResponse.errors)
            await Storage.setItem('jellyfinAccessToken', '');
            return;
          }

          await Storage.setItem('jellyfinAccessToken', userResponse.accessToken);
          dispatch(setAccessToken(userResponse.accessToken));
          dispatch(setJellyfinUser(userResponse.user));
        }
      }
    })().then(() => { });
  }, [jellyfinProvider.jellyfinAccessToken]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 12
      }}
    >
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholderTextColor={PALETTE.textOffWhite} placeholder="Search your library..." value={searchTerm as any} onChangeText={setSearchInput} />
        <FontAwesome6Pro name="magnifying-glass" iconStyle="solid" size={16} color={PALETTE.textOffWhite} style={styles.inputIcon} />
      </View>
      <View style={{ height: 60 }}>
        <ScrollView horizontal={true} style={styles.filtersContainer} contentContainerStyle={{ alignItems: 'center' }}>
          <View>
            <TouchableOpacity style={[styles.filterButton, styles.filterButtonActive]}>
              <Text style={styles.filterButtonText}>All</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>In Progress</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Downloaded</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Finished</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      <View style={{ marginBottom: 12 }}>
        <View style={styles.infoItemsContainer}>
          <View style={styles.infoContainer}>
            <Text style={styles.infoValue}>24</Text>
            <Text style={styles.infoLabel}>Total Books</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoValue}>156h</Text>
            <Text style={styles.infoLabel}>Listened</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoValue}>18</Text>
            <Text style={styles.infoLabel}>Finished</Text>
          </View>
        </View>
      </View>
      <View style={styles.listInfoContainer}>
        <Text style={styles.listInfoCount}>{booksJelly.length} audiobooks</Text>
        <TouchableOpacity style={styles.listInfoButton}>
          <View style={styles.listInfoButtonContent}>
            <FontAwesome6Pro name="circle-info" size={16} color={PALETTE.primary} style={{}} />
            <Text style={styles.listInfoButtonText}>Grid</Text>
          </View>
        </TouchableOpacity>
      </View>
      <FlatList
        data={booksJelly}
        style={{
          gap: 12,
        }}
        onEndReached={fetchMoreBooks}
        onEndReachedThreshold={.7}
        renderItem={(props) => (<TitleListCardHorizontal {...props} />)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    backgroundColor: 'rgba(107, 114, 128, .15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '100%',
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: PALETTE.textWhite,
  },
  infoItemsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  infoContainer: {
    backgroundColor: PALETTE.backgroundLight,
    paddingVertical: 8,
    borderRadius: 10,
    flexBasis: '30%',
  },
  infoValue: {
    color: PALETTE.primary,
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  infoLabel: {
    color: PALETTE.textOffWhite,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
  },
  input: {
    backgroundColor: PALETTE.backgroundLight,
    paddingLeft: 36,
    padding: 8,
    paddingVertical: 12,
    width: '100%',
    color: PALETTE.textWhite,
    borderRadius: 10,
    borderColor: '#252530',
    borderWidth: 1,
  },
  inputIcon: {
    position: 'absolute',
    top: '50%',
    left: 10,
    transform: 'translateY(-8%)'
  },
  filtersContainer: {
    height: 50,
    gap: 6,
  },
  filterButton: {
    backgroundColor: PALETTE.backgroundLight,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 24,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: PALETTE.primary,
  },
  filterButtonText: {
    color: PALETTE.textWhite,
    fontFamily: 'Inter_400Regular',
  },
  listInfoContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingTop: 6
  },
  listInfoCount: {
    color: PALETTE.textOffWhite,
  },
  listInfoButton: {
  },
  listInfoButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  listInfoButtonText: {
    color: PALETTE.primary,
  },
});
