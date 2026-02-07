import PlaybackControls from "@/components/molecules/PlaybackControls";
import { useCallback, useEffect, useState } from "react";
import { Directory, Paths, File } from "expo-file-system";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppSelector } from "@/utils/hooks";
import TrackPlayer, { PitchAlgorithm, State, Track, TrackType, useActiveTrack } from "react-native-track-player";
import { Image } from "expo-image";
import { PALETTE } from "@/utils/colors";
import { reportItemPlaying } from "@/utils/book-providers/jellyfin";
import { formatAudioProgressTime } from "@/utils/audio-player";
import { Playable } from "@/utils/classes/playable";
import { getAppOption } from "@/utils/db/db";
import { useSQLiteContext } from "expo-sqlite";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { getPlayableById } from "@/utils";
import { useSelector } from "react-redux";
import useRemainingSleepTime from "@/utils/hooks/useRemainingSleepTime";
import { useFocusEffect } from "expo-router";

export function TitleImage({ activeTitle }: { activeTitle: Playable | null }) {
  const { width } = useWindowDimensions();
  const endTime = useAppSelector(state => state.audioPlayer.sleepTimerEndTime);
  const remainingSeconds = useRemainingSleepTime(endTime);

  if (remainingSeconds !== null && remainingSeconds !== 0) {
    return (
      <View style={styles.titleImageContainer}>
        <View style={[styles.sleepTimerContainer, styles.image, { width: width * .65, height: width * .65 }]}>
          <Text style={styles.sleepTimerText}>{formatAudioProgressTime(remainingSeconds)}</Text>
        </View>
        <Image source={activeTitle?.imagePath} style={[styles.image, { width: width * .65, height: width * .65 }]} />
      </View>
    );
  }

  return (
    <>
      {activeTitle && (<Image source={activeTitle.imagePath} style={[styles.image, { width: width * .65, height: width * .65 }]} />)}
    </>
  );
}

export function PlayerHeader({ navigation, route, options, back }: any) {
  return (
    <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 24, justifyContent: 'space-between' }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
        <FontAwesome6Pro name="angle-down" iconStyle="solid" size={16} color={PALETTE.textWhite} />
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <FontAwesome6Pro name="list" iconStyle="solid" size={16} color={PALETTE.textWhite} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <FontAwesome6Pro name="ellipsis-vertical" iconStyle="solid" size={16} color={PALETTE.textWhite} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function Modal() {
  const fileDest = new Directory(Paths.document, "Audiobooks");
  const audioPlayer = useAppSelector(state => state.audioPlayer);
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const activeTrack = useActiveTrack();
  const db = useSQLiteContext();
  const [chapterPlayable, setChapterPlayable] = useState<Playable | null>(null);
  const [titlePlayable, setTitlePlayable] = useState<Playable | null>(null);

  let jellyConfig = {
    domain: jellyfinProvider.jellyfinDomain ?? '',
    accessToken: jellyfinProvider.jellyfinAccessToken ?? '',
    userId: jellyfinProvider.jellyfinUser?.Id
  };

  /* useFocusEffect((
    useCallback(() => {
      (async () => {
        if (activeTrack) {
          console.log('hello, world', activeTrack)
          let titlePlayableRes = await getPlayableById(activeTrack?.parentItemId as string, jellyConfig, db)
          setTitlePlayable(titlePlayableRes);

          let chapterPlayableRes = await getPlayableById(activeTrack?.id, jellyConfig, db)
          setChapterPlayable(chapterPlayableRes);
        }
      })().then(() => { });
    }, [activeTrack])
  )); */

  useEffect(() => {
    (async () => {
      if (activeTrack) {
        let titlePlayableRes = await getPlayableById(activeTrack?.parentItemId as string, jellyConfig, db)
        setTitlePlayable(titlePlayableRes);

        let chapterPlayableRes = await getPlayableById(activeTrack?.id, jellyConfig, db)
        setChapterPlayable(chapterPlayableRes);
      }
    })().then(() => { });
  }, [activeTrack]);

  return (
    <View style={styles.rootContainer}>
      <TitleImage activeTitle={titlePlayable} />
      <View style={styles.metaContainer}>
        <Text style={styles.title}>{titlePlayable?.name}</Text>
        {/* TODO: Remove Eric */}
        <Text style={styles.author}>{chapterPlayable?.getArtist() || 'Eric Metaxas'}</Text>
        {(activeTrack && activeTrack.title) && (<Text style={styles.chapterTitle}>{chapterPlayable?.name}</Text>)}
      </View>
      <PlaybackControls />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    height: '100%',
    backgroundColor: PALETTE.background,
    paddingHorizontal: 24,
  },
  headerButton: {
    backgroundColor: 'rgba(107, 114, 128, .15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '100%',
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: PALETTE.textWhite,
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold'
  },
  author: {
    color: PALETTE.textOffWhite,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginBottom: 14
  },
  chapterTitle: {
    color: PALETTE.textOffWhite,
    fontSize: 12,
    fontFamily: 'Inter_400Regular'
  },
  metaContainer: {
    paddingVertical: 20
  },
  image: {
    borderRadius: 20,
    marginBottom: 12,
    marginHorizontal: 'auto',
  },
  titleImageContainer: {
    position: 'relative',
  },
  sleepTimerContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,.7)',
    elevation: 10,
    zIndex: 99,
    left: '50%',
    transform: 'translateX(-135%)',
  },
  sleepTimerText: {
    color: PALETTE.text,
    fontSize: 24,
  }
});
