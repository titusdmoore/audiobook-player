import PlaybackControls from "@/components/molecules/PlaybackControls";
import { useEffect, useState } from "react";
import { Directory, Paths, File } from "expo-file-system";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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

export function TitleImage({ sleepTimer, activeTitle }: { sleepTimer: number | null, activeTitle?: Playable }) {
  if (sleepTimer !== null) {
    console.log('sleep timer', sleepTimer)
    return (
      <View style={styles.titleImageContainer}>
        <View style={styles.sleepTimerContainer}>
          <Text style={styles.sleepTimerText}>{formatAudioProgressTime(sleepTimer)}</Text>
        </View>
        <Image source={activeTitle?.imagePath} style={styles.image} />
      </View>
    );
  }

  return (
    <>
      {activeTitle && (<Image source={activeTitle.imagePath} style={styles.image} />)}
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
  const downloadableUrl = "https://www.dropbox.com/scl/fi/qfznbgt45q9xhfvk5zr6q/Reforming-Marriage-B0DTLF3Y45-03-Introduction.m4b?rlkey=9o4lyhguz4gotsri5rnyr1fp2&e=1&st=51erbmbw&dl=1"
  const fileDest = new Directory(Paths.document, "Audiobooks");
  const audioPlayer = useAppSelector(state => state.audioPlayer);
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const activeTrack = useActiveTrack();
  // TODO: convert to context
  const [remainingSleepTimer, setRemainingSleepTimer] = useState<number | null>(null);
  const db = useSQLiteContext();
  const [chapterPlayable, setChapterPlayable] = useState<Playable | null>(null);
  const [titlePlayable, setTitlePlayable] = useState<Playable | null>(null);

  let jellyConfig = {
    domain: jellyfinProvider.jellyfinDomain ?? '',
    accessToken: jellyfinProvider.jellyfinAccessToken ?? '',
    userId: jellyfinProvider.jellyfinUser?.Id
  };

  const handleSleepTimerDisplay = () => {
    if (jellyfinProvider.sleepTimer) {
      const timerInterval = setInterval(() => {
        setRemainingSleepTimer((prevTime) => {
          console.log('prev time', prevTime)
          if (prevTime === 0) {
            clearInterval(timerInterval);
            // Perform actions when the timer reaches zero
            console.log('Countdown complete!');
            return null;
          } else if (prevTime == null) {
            if (jellyfinProvider.sleepTimer) {
              let timerDate = new Date(jellyfinProvider.sleepTimer);
              let now = new Date();

              return Math.round((timerDate.getTime() - now.getTime()) / 1000);
            }

            return null;
          } else {
            return prevTime - 1;
          }
        });
      }, 1000);

      // Cleanup the interval when the component unmounts
      return () => clearInterval(timerInterval);
    }
  };

  useEffect(() => {
    (async () => {
      let titlePlayableRes = await getPlayableById(activeTrack?.parentItemId as string, jellyConfig, db)
      setTitlePlayable(titlePlayableRes);

      let chapterPlayableRes = await getPlayableById(activeTrack?.id, jellyConfig, db)
      setChapterPlayable(chapterPlayableRes);
    })().then(() => { });

    handleSleepTimerDisplay();
  }, [jellyfinProvider.sleepTimer]);

  useEffect(() => {
    if (!remainingSleepTimer) {
      handleSleepTimerDisplay();
    }
  }, []);

  return (
    <View style={styles.rootContainer}>
      {remainingSleepTimer && (<Text style={{ color: PALETTE.text }}>{formatAudioProgressTime(remainingSleepTimer)}</Text>)}
      <TitleImage sleepTimer={remainingSleepTimer} activeTitle={audioPlayer.activeTitle as any} />
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
    width: 335,
    height: 335,
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
    backgroundColor: 'rgba(0,0,0,0,.6)',
    zIndex: 99,
  },
  sleepTimerText: {
    color: PALETTE.text,
    fontSize: 24,
  }
});
