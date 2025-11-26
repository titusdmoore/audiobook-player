import { fetchAudiobooks, fetchItem } from "@/utils/book-providers/jellyfin";
import { PALETTE } from "@/utils/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import { Button } from "@react-navigation/elements";
import TrackPlayer, { PitchAlgorithm, Track } from "react-native-track-player";
import { useLoadedAuthRequest } from "expo-auth-session";
import { setActiveTitle } from "@/utils/slices/audio-player-slice";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchPlayerDuration } from "@/utils/db/db";
import { useSQLiteContext } from "expo-sqlite";

function runTimeTicksToDuration(ticks: number): number {
  return Math.floor(ticks / 1e6);
}

export default function TitleView() {
  const { titleId } = useLocalSearchParams();
  const [chapters, setChapters] = useState<any[]>([]);
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const dispatch = useAppDispatch();
  const db = useSQLiteContext();

  const [title, setTitle] = useState<any>(null);
  const router = useRouter();

  const loadTracksForTitle = async (startChapterIndex?: number) => {
    await TrackPlayer.reset();


    if (!startChapterIndex) {
      let duration = await fetchPlayerDuration(db, titleId as string);
      if (duration) {
        startChapterIndex = chapters.findIndex((chapter) => chapter.id == duration.chapter_id);
      } else {
        startChapterIndex = 0;
      }
    }

    for (const chapter of chapters.slice(startChapterIndex)) {
      // console.log('duration', chapter.RunTimeTicks, runTimeTicksToDuration(chapter.RunTimeTicks))
      let track: Track = {
        id: chapter.Id,
        url: `${jellyfinProvider.jellyfinDomain}/Audio/${chapter.Id}/stream`,
        headers: {
          'Authorization': `MediaBrowser Token="${jellyfinProvider.jellyfinAccessToken}"`
        },
        title: chapter.Name,
        artist: chapter.AlbumArtist,
        // type: TrackType.HLS,
        pitchAlgorithm: PitchAlgorithm.Voice,
        duration: runTimeTicksToDuration(chapter.RunTimeTicks),
        parentItemId: titleId,
      };

      await TrackPlayer.add(track);
    }

    dispatch(setActiveTitle(title))
    router.navigate("/player");
  };

  useEffect(() => {
    (async () => {
      let chaptersRaw = await fetchAudiobooks(jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '', 100, 0, titleId as string);
      let titleRes = await fetchItem(jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '', jellyfinProvider.jellyfinUser?.Id, titleId as string);

      if (titleRes.ok) {
        setTitle(await titleRes.json());
      }

      if (chaptersRaw && chaptersRaw.ok) {
        let chaptersParsed = await chaptersRaw.json();
        setChapters(chaptersParsed.Items);
      }
    })().then(() => { });
  }, []);

  return (
    <SafeAreaView style={{ paddingBottom: 24 }}>
      <FlatList data={chapters} renderItem={(props) => {
        return (
          <TouchableOpacity onPress={() => loadTracksForTitle(props.index)}>
            <Text style={{ color: PALETTE.text }}>{(props.item as any).Name}</Text>
          </TouchableOpacity>
        );
      }} />
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ color: PALETTE.text }}>{titleId}</Text>
        <TouchableOpacity onPress={() => loadTracksForTitle()}>
          <Text style={{ color: PALETTE.text }}>Play Book</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
