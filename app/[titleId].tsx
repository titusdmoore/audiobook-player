import { downloadTitle, fetchAudiobooks, fetchItem } from "@/utils/book-providers/jellyfin";
import { PALETTE } from "@/utils/colors";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { useAppDispatch, useAppSelector } from "@/utils/hooks";
import { Button } from "@react-navigation/elements";
import TrackPlayer, { PitchAlgorithm, Track } from "react-native-track-player";
import { useLoadedAuthRequest } from "expo-auth-session";
import { setActiveTitle } from "@/utils/slices/audio-player-slice";
import { SafeAreaView } from "react-native-safe-area-context";
import { /* callableWithDb, */ fetchPlayerDuration, setAppOption } from "@/utils/db/db";
import { useSQLiteContext } from "expo-sqlite";
import { formatAudioProgressTime } from "@/utils/audio-player";
import { Image } from "expo-image";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { encodeObjectToQueryParams, getPlayableById, fetchChildrenPlayables } from "@/utils";
import { Playable } from "@/utils/classes/playable";


function ChapterListItem({ index, item: chapter, playButtonAction }: { index: number, item: any, playButtonAction: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 45, width: '100%', paddingHorizontal: 10 }}>
      <Text style={{ color: PALETTE.text, flexBasis: '85%' }}>{chapter.Name}</Text>
      <TouchableOpacity style={{}} onPress={() => playButtonAction(index)}>
        <FontAwesome6Pro name="circle-play" size={20} color={PALETTE.text} />
      </TouchableOpacity>
    </View>
  );
}

function ChaptersModal({ chapters, isOpen, setIsOpen, chapterSelect }: { chapters: any[], isOpen: boolean, setIsOpen: any, chapterSelect: any }) {
  return (
    <Modal visible={isOpen} transparent={true}>
      <SafeAreaView style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Chapters</Text>
            <TouchableOpacity onPress={() => setIsOpen(!isOpen)}>
              <FontAwesome6Pro name="x" size={15} color={PALETTE.text} />
            </TouchableOpacity>
          </View>
          <FlatList data={chapters} style={{ rowGap: 5, width: '100%' }} renderItem={(props) => (<ChapterListItem {...props} playButtonAction={chapterSelect} />)} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default function TitleView() {
  const { titleId } = useLocalSearchParams();
  const [chapters, setChapters] = useState<Playable[]>([]);
  const [chaptersModalOpen, setChaptersModalOpen] = useState<boolean>(false);
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const dispatch = useAppDispatch();
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const [playable, setPlayable] = useState<Playable | null>(null);
  const router = useRouter();

  const handleDowloadTitleClick = async () => {
    downloadTitle(db, jellyfinProvider.jellyfinDomain ?? '', jellyfinProvider.jellyfinAccessToken ?? '', jellyfinProvider.jellyfinUser?.Id, titleId as string)
  };

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
      // let track: Track = {
      //   id: chapter.Id,
      //   url: `${jellyfinProvider.jellyfinDomain}/Audio/${chapter.Id}/universal?TranscodingProtocol=hls&Container=m4b`,
      //   headers: {
      //     'Authorization': `MediaBrowser Token="${jellyfinProvider.jellyfinAccessToken}"`
      //   },
      //   title: chapter.Name,
      //   artist: chapter.AlbumArtist,
      //   // type: TrackType.HLS,
      //   pitchAlgorithm: PitchAlgorithm.Voice,
      //   duration: runTimeTicksToDuration(chapter.RunTimeTicks),
      //   parentItemId: titleId,
      // };
      //
      let track = chapter.toTrack();
      console.log("track", track)
      await TrackPlayer.add(track);
    }

    await setAppOption(db, "new_title_loaded", "true");
    dispatch(setActiveTitle({ name: playable?.name, imagePath: playable?.imagePath }))
    router.navigate("/player");
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: playable?.name
    })
  }, [navigation, playable]);

  useEffect(() => {
    (async () => {
      let jellyConfig = {
        domain: jellyfinProvider.jellyfinDomain ?? '',
        accessToken: jellyfinProvider.jellyfinAccessToken ?? '',
        userId: jellyfinProvider.jellyfinUser?.Id
      };
      let playableRes = await getPlayableById(titleId as string, jellyConfig, db)
      setPlayable(playableRes);

      if (playableRes) {
        let chapters = await fetchChildrenPlayables(playableRes, db, jellyConfig);
        setChapters(chapters);
      }
    })().then(() => { });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Image source={playable?.imagePath} style={{ width: 225, height: 225 }} />
      <View style={styles.metaContainer}>
        <Text style={styles.titleText}>{playable?.name}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.buttonRoot, styles.chapterListButton]} onPress={() => setChaptersModalOpen(!chaptersModalOpen)}>
            <Text style={styles.chapterListButtonText}>View Chapters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonRoot, styles.playTitleButton]} onPress={() => loadTracksForTitle()}>
            <Text style={styles.playTitleButtonText}>Play Title</Text>
          </TouchableOpacity>
        </View>
        {playable?.isDownloaded() ? (
          <TouchableOpacity style={[styles.buttonRoot, styles.chapterListButton]} onPress={handleDowloadTitleClick}>
            <Text style={styles.playTitleButtonText}>Remove from Device</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.buttonRoot, styles.chapterListButton]} onPress={handleDowloadTitleClick}>
            <Text style={styles.playTitleButtonText}>Download Title</Text>
          </TouchableOpacity>
        )}
      </View>
      <ChaptersModal chapters={chapters} isOpen={chaptersModalOpen} setIsOpen={setChaptersModalOpen} chapterSelect={loadTracksForTitle} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  metaContainer: {
    justifyContent: 'center',
    paddingTop: 25,
    // alignItems: ''
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  titleText: {
    color: PALETTE.text,
    fontSize: 20,
    textAlign: 'center',
  },
  buttonRoot: {
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTitleButton: {
    backgroundColor: PALETTE.primary,
  },
  playTitleButtonText: {
    color: PALETTE.text,
  },
  chapterListButton: {
    backgroundColor: PALETTE.secondary,
  },
  chapterListButtonText: {
    color: PALETTE.text,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: PALETTE.background,
    borderRadius: 20,
    paddingTop: 15,
    paddingHorizontal: 15,
    paddingBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    width: '100%',
  },
  modalHeaderText: {
    color: PALETTE.text,
    fontSize: 18,
  },
});
