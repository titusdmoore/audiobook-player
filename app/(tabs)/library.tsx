import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import { ListTitleCardJelly } from "@/components/molecules/ListTitleCard";
import { authenticateUserByName, fetchAudiobooks } from "@/utils/book-providers/jellyfin";
import { SafeAreaView } from "react-native-safe-area-context";
import { setAccessToken, setJellyfinUser } from "@/utils/slices/book-provider-slice";
import { useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import { Storage } from "expo-sqlite/kv-store";
import { getAppOption } from "@/utils/db/db";
import { useSQLiteContext } from "expo-sqlite";

export default function Tab() {
  const [booksJelly, setBooksJelly] = useState<any[]>([]);
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const dispatch = useAppDispatch();
  const { searchTerm } = useLocalSearchParams();
  const db = useSQLiteContext();
  // const global = useGlobalSearchParams();


  const fetchMoreBooks = async () => {
    let booksResponse = await fetchAudiobooks(jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '', { limit: 14, startIndex: booksJelly.length - 1 });

    if (booksResponse && booksResponse.ok) {
      let additionalBooks = await booksResponse.json();
      setBooksJelly([...booksJelly, ...additionalBooks.Items]);
    }
  };

  useEffect(() => {
    (async () => {
      // console.log('local', local);
      let booksResponse = await fetchAudiobooks(jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '', searchTerm ? { searchTerm: searchTerm as string } : {});

      if (booksResponse && booksResponse.ok) {
        let parsedResponse = await booksResponse.json();
        setBooksJelly(parsedResponse.Items)
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
  }, [jellyfinProvider.jellyfinAccessToken, searchTerm])

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
