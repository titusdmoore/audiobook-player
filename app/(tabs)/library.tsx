import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import { ListTitleCardJelly } from "@/components/molecules/ListTitleCard";
import { authenticateUserByName, fetchAudiobooks } from "@/utils/book-providers/jellyfin";
import { SafeAreaView } from "react-native-safe-area-context";
import { getItemAsync, setItemAsync } from "expo-secure-store";
import { setAccessToken, setJellyfinUser } from "@/utils/slices/book-provider-slice";

export default function Tab() {
  const [booksJelly, setBooksJelly] = useState<any[]>([]);
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const dispatch = useAppDispatch();

  const fetchMoreBooks = async () => {
    let booksResponse = await fetchAudiobooks(jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '', { limit: 14, startIndex: booksJelly.length - 1 });

    if (booksResponse && booksResponse.ok) {
      let additionalBooks = await booksResponse.json();
      setBooksJelly([...booksJelly, ...additionalBooks.Items]);
    }
  };

  useEffect(() => {
    (async () => {
      let booksResponse = await fetchAudiobooks(jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '');

      if (booksResponse && booksResponse.ok) {
        let parsedResponse = await booksResponse.json();
        setBooksJelly(parsedResponse.Items)
      } else if (booksResponse && booksResponse.status == 401) {
        if (jellyfinProvider.jellyfinAccessToken) {
          let userResponse = await authenticateUserByName(await getItemAsync('jellyfinDomain') ?? '', await getItemAsync('jellyfinUsername') ?? '', await getItemAsync('jellyfinPassword') ?? '');

          if (userResponse.errors) {
            await setItemAsync('jellyfinAccessToken', '');
            return;
          }

          await setItemAsync('jellyfinAccessToken', userResponse.accessToken);
          dispatch(setAccessToken(userResponse.accessToken));
          dispatch(setJellyfinUser(userResponse.user));
        }
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
