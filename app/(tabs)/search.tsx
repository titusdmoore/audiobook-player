import TitleListCardHorizontal from "@/components/molecules/TitleListCardHorizontal";
import { debounce } from "@/utils";
import { fetchAudiobooks, getSearchHints, Item } from "@/utils/book-providers/jellyfin";
import { JellyPlayable } from "@/utils/classes/jelly-playable";
import { PALETTE } from "@/utils/colors";
import { getAppOption, setAppOption } from "@/utils/db/db";
import { useAppSelector } from "@/utils/hooks";
import { useLazyEffect } from "@/utils/hooks/useLazyEffect";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { useFocusEffect, useLocalSearchParams, router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import { Text, TextInput, View, StyleSheet, ScrollView, TouchableOpacity, TextInputComponent, FlatList } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function Tab() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [hints, setHints] = useState<{ itemId: string, name: string }[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [audiobooks, setAudiobooks] = useState<JellyPlayable[]>([]);
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const [inputIsFocused, setInputIsFocused] = useState<boolean>(false);
  const inputRef = useRef<TextInput | null>(null);
  const db = useSQLiteContext();
  const { shouldFocus } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  let jellyConfig = {
    domain: jellyfinProvider.jellyfinDomain ?? '',
    accessToken: jellyfinProvider.jellyfinAccessToken ?? '',
    userId: jellyfinProvider.jellyfinUser?.Id
  };

  const handleSearch = async () => {
    console.log('hitting here (dumb state)')
    if (searchInput == '') return;
    console.log('after')

    const audiobooksRes = await fetchAudiobooks(jellyConfig.domain, jellyConfig.accessToken, {
      searchTerm: searchInput,
      includeItemTypes: ['Folder'],
      recursive: true,
      parentId: '97c7e3234c2ebe649f4efa07860482a2'
    });

    // TODO: Better error handling
    if (audiobooksRes.status !== 200) return;

    let audiobooks = await audiobooksRes.json()
    setAudiobooks(audiobooks.Items.map((item: Item) => new JellyPlayable(item, jellyConfig)))

    let newRecentArr = [searchInput, ...recentSearches.filter((term) => term != searchInput)];
    setRecentSearches(newRecentArr);
    await setAppOption(db, 'recentSearches', JSON.stringify(newRecentArr));
  };
  // await setAppOption(db, 'jellyfinAccessToken', userResponse.accessToken);
  // await getAppOption(db, 'jellyfinUsername')

  const handleSearchInput = () => {
    (async () => {
      if (!searchInput) return;
      const hintResponse = await getSearchHints(jellyConfig.domain, jellyConfig.accessToken, searchInput);

      if (hintResponse.status !== 200) return;

      let { SearchHints: searchHints } = await hintResponse.json();
      setHints(searchHints.map((hint: any) => ({ itemId: hint.ItemId, name: hint.Name })));

    })().then(() => { });
  };

  useLazyEffect(handleSearchInput, [searchInput], 3000);

  useFocusEffect(() => {
    setTimeout(() => {
      if (inputRef && inputRef.current && shouldFocus == 'true') {
        (inputRef.current as any).focus();
        router.setParams({ shouldFocus: 'false' });
      }
    }, 50)
  });

  useEffect(() => {
    // setInputIsFocused(inputRef.current && inputRef.current.isFocused());
  }, [inputRef.current])

  useEffect(() => {
    (async () => {
      let rawDbRecentSearches = await getAppOption(db, 'recentSearches');
      setRecentSearches(rawDbRecentSearches && rawDbRecentSearches.option_value ? JSON.parse(rawDbRecentSearches.option_value) : []);
    })().then(() => { });
  }, []);

  return (
    <View style={[styles.searchContainer, {
      flex: 1,
    }]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholderTextColor={PALETTE.textOffWhite}
          placeholder="Search your library..."
          value={searchInput}
          autoFocus={shouldFocus && shouldFocus == 'true' ? true : false}
          returnKeyType="search"
          returnKeyLabel=""
          clearButtonMode="while-editing"
          onSubmitEditing={async () => await handleSearch()}
          onChangeText={setSearchInput}
          ref={inputRef}
        />
        <FontAwesome6Pro name="magnifying-glass" iconStyle="solid" size={16} color={inputIsFocused ? PALETTE.primary : PALETTE.textOffWhite} style={styles.inputIcon} />
        <TouchableOpacity style={styles.inputIconClose} onPress={() => setSearchInput('')}>
          <FontAwesome6Pro name="x" iconStyle="solid" size={12} color={inputIsFocused ? PALETTE.primary : PALETTE.textOffWhite} />
        </TouchableOpacity>
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
              <Text style={styles.filterButtonText}>Fiction</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Non-Fiction</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Religion</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Fantasy</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      {recentSearches.length > 0 && (
        <View style={[styles.sectionContainer, { marginBottom: 16 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity style={styles.sectionActionButton}>
              <Text style={styles.sectionActionButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          {recentSearches.slice(0, 5).map((recentSearch: string, index: number) => (
            <View style={styles.recentTermContainer} key={index}>
              <TouchableOpacity onPress={async () => {
                setSearchInput(recentSearch);
                await handleSearch();
              }} style={styles.recentTermSearchAgainButton}>
                <FontAwesome6Pro name="clock-rotate-left" iconStyle="solid" color={PALETTE.textOffWhite} size={18} />
                <Text style={styles.recentTermSearchAgainButtonText}>{recentSearch}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => {
                let newRecentArr = [...recentSearches.filter((_, i) => index != i)];
                setRecentSearches(newRecentArr);
                await setAppOption(db, 'recentSearches', JSON.stringify(newRecentArr));
              }}>
                <FontAwesome6Pro name="x" color={PALETTE.textOffWhite} iconStyle="solid" size={14} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      {audiobooks.length > 0 && (
        <View style={{ flex: 1 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{audiobooks.length} results found</Text>
            <TouchableOpacity style={styles.sectionActionButton}>
              <FontAwesome6Pro name="arrow-down-wide-short" color={PALETTE.primary} iconStyle="solid" size={14} />
              <Text style={styles.sectionActionButtonText}>Sort</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={audiobooks}
            style={{
              gap: 12,
              flex: 1
            }}
            onEndReachedThreshold={.7}
            renderItem={(props) => (<TitleListCardHorizontal {...props} />)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 12
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
    borderColor: PALETTE.grey,
    borderRadius: 10,
    borderWidth: 1,
  },
  inputFocused: {
    borderColor: PALETTE.primary,
  },
  inputIcon: {
    position: 'absolute',
    top: '50%',
    left: 10,
    transform: 'translateY(-8%)'
  },
  inputIconClose: {
    position: 'absolute',
    top: '50%',
    right: 16,
    transform: 'translateY(-12%)',
    backgroundColor: PALETTE.grey,
    width: 25,
    height: 25,
    borderRadius: '100%',
    justifyContent: 'center',
    alignItems: 'center'
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
  sectionContainer: {

  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12
  },
  sectionTitle: {
    color: PALETTE.textOffWhite,
    fontSize: 16,
    fontWeight: 500,
  },
  sectionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  sectionActionButtonText: {
    color: PALETTE.primary
  },
  recentTermContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 8
  },
  recentTermSearchAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  recentTermSearchAgainButtonText: {
    color: PALETTE.textWhite,
    fontSize: 14
  },
})
