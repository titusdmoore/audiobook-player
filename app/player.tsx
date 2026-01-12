import PlaybackControls from "@/components/molecules/PlaybackControls";
import { useEffect, useState } from "react";
import { Directory, Paths, File } from "expo-file-system";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAppSelector } from "@/utils/hooks";
import TrackPlayer, { PitchAlgorithm, State, Track, TrackType, useActiveTrack } from "react-native-track-player";
import { Image } from "expo-image";
import { PALETTE } from "@/utils/colors";
import { reportItemPlaying } from "@/utils/book-providers/jellyfin";
import { formatAudioProgressTime } from "@/utils/audio-player";
import { Playable } from "@/utils/classes/playable";

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

export default function Modal() {
  const downloadableUrl = "https://www.dropbox.com/scl/fi/qfznbgt45q9xhfvk5zr6q/Reforming-Marriage-B0DTLF3Y45-03-Introduction.m4b?rlkey=9o4lyhguz4gotsri5rnyr1fp2&e=1&st=51erbmbw&dl=1"
  const fileDest = new Directory(Paths.document, "Audiobooks");
  const audioPlayer = useAppSelector(state => state.audioPlayer);
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const activeTrack = useActiveTrack();
  const [remainingSleepTimer, setRemainingSleepTimer] = useState<number | null>(null);

  useEffect(() => {
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
  }, [jellyfinProvider.sleepTimer]);

  return (
    <View style={styles.rootContainer}>
      {remainingSleepTimer && (<Text style={{ color: PALETTE.text }}>{formatAudioProgressTime(remainingSleepTimer)}</Text>)}
      <TitleImage sleepTimer={remainingSleepTimer} activeTitle={audioPlayer.activeTitle as any} />
      {(activeTrack && activeTrack.name) && (<Text style={styles.title}>{activeTrack?.name}</Text>)}
      <PlaybackControls />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: '100%',
  },
  title: {
    color: PALETTE.text,
    fontSize: 20,
  },
  image: {
    width: 225,
    height: 225,
    marginBottom: 12
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
