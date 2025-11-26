import PlaybackControls from "@/components/molecules/PlaybackControls";
import { useEffect } from "react";
import { Directory, Paths, File } from "expo-file-system";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAppSelector } from "@/utils/hooks";
import TrackPlayer, { PitchAlgorithm, State, Track, TrackType, useActiveTrack } from "react-native-track-player";
import { Image } from "expo-image";
import { PALETTE } from "@/utils/colors";
import { reportItemPlaying } from "@/utils/book-providers/jellyfin";

export default function Modal() {
  const downloadableUrl = "https://www.dropbox.com/scl/fi/qfznbgt45q9xhfvk5zr6q/Reforming-Marriage-B0DTLF3Y45-03-Introduction.m4b?rlkey=9o4lyhguz4gotsri5rnyr1fp2&e=1&st=51erbmbw&dl=1"
  const fileDest = new Directory(Paths.document, "Audiobooks");
  const audioPlayer = useAppSelector(state => state.audioPlayer);
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const activeTrack = useActiveTrack();

  // console.log("user", jellyfinProvider.jellyfinUser, console.log(activeTrack))

  useEffect(() => {
    console.log('active track', activeTrack)
  }, [activeTrack]);

  // console.log(audioPlayer)
  // const testing = async () => {
  //   // await reportItemPlaying(jellyfinProvider.jellyfinDomain, jellyfinProvider.jellyfinAccessToken, jellyfinProvider.jellyfinUser?.Id, activeTrack.id, 135)
  // }

  return (
    <View style={styles.rootContainer}>
      {audioPlayer.activeTitle && (<Image source={`${jellyfinProvider.jellyfinDomain}/Items/${(audioPlayer.activeTitle as any).Id}/Images/Primary`} style={styles.image} />)}
      {(activeTrack && activeTrack.title) && (<Text style={styles.title}>{activeTrack?.title}</Text>)}
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

});
