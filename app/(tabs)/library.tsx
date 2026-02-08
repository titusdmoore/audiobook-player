import { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View, Text, TextInput, ScrollView } from "react-native";
import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import { authenticateUserByName, fetchAudiobooks, Item } from "@/utils/book-providers/jellyfin";
import { setAccessToken, setJellyfinUser } from "@/utils/slices/book-provider-slice";
import { Link, useLocalSearchParams } from "expo-router";
import { Storage } from "expo-sqlite/kv-store";
import { getAppOption } from "@/utils/db/db";
import { useSQLiteContext } from "expo-sqlite";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { PALETTE } from "@/utils/colors";
import TitleListCardHorizontal from "@/components/molecules/TitleListCardHorizontal";
import { getPlayableById } from "@/utils";
import { Playable } from "@/utils/classes/playable";

export default function Tab() {
  const [booksJelly, setBooksJelly] = useState<any[]>([]);
  const [totalBooks, setTotalBooks] = useState<number>(0);
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const dispatch = useAppDispatch();
  const { searchTerm } = useLocalSearchParams();
  const [searchInput, setSearchInput] = useState<string>(searchTerm as string ?? '');
  const db = useSQLiteContext();

  const jellyConfig = {
    domain: jellyfinProvider.jellyfinDomain ?? '',
    accessToken: jellyfinProvider.jellyfinAccessToken ?? '',
    userId: jellyfinProvider.jellyfinUser?.Id
  };

  const fetchMoreBooks = async () => {
    let booksResponse = await fetchAudiobooks(
      jellyfinProvider.jellyfinDomain ?? '',
      jellyfinProvider.jellyfinAccessToken ?? '',
      { limit: 14, startIndex: booksJelly.length - 1 }
    );

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
      let booksResponse = await fetchAudiobooks(jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '', searchTerm ? { searchTerm: searchTerm as string } : {});

      if (booksResponse && booksResponse.ok) {
        let parsedResponse = await booksResponse.json();

        setTotalBooks(parsedResponse.TotalRecordCount);

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
        <Link
          style={styles.input}
          href={{ pathname: '/search', params: { shouldFocus: 'true' } }}
        >
          <Text style={{ color: PALETTE.textOffWhite }}>Search your library...</Text>
        </Link>
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
            <Text style={styles.infoValue}>{totalBooks}</Text>
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
    borderColor: PALETTE.grey,
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
