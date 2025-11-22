import PlaybackControls from "@/components/molecules/PlaybackControls";
import { useEffect } from "react";
import { Directory, Paths, File } from "expo-file-system";
import { View, Text } from "react-native";
import { useAppSelector } from "@/utils/hooks";
import TrackPlayer, { PitchAlgorithm, State, Track } from "react-native-track-player";

export default function Modal() {
  const downloadableUrl = "https://www.dropbox.com/scl/fi/qfznbgt45q9xhfvk5zr6q/Reforming-Marriage-B0DTLF3Y45-03-Introduction.m4b?rlkey=9o4lyhguz4gotsri5rnyr1fp2&e=1&st=51erbmbw&dl=1"
  const fileDest = new Directory(Paths.document, "Audiobooks");
  const audioPlayer = useAppSelector(state => state.audioPlayer);

  useEffect(() => {
    if (audioPlayer.playerInitialized) {
      (async () => {
        console.log(fileDest)
        let audiobookSegment = null;
        if (!fileDest.exists) {
          try {
            fileDest.create();
            audiobookSegment = await File.downloadFileAsync(downloadableUrl, fileDest);
          } catch (error) {
            console.error(error);
          }
        } else {
          let contents = fileDest.list();
          audiobookSegment = contents[0];
        }


        if (audiobookSegment) {
          let track: Track = {
            url: audiobookSegment.uri,
            title: 'Reforming Marriage',
            artist: 'Douglas Wilson',
            pitchAlgorithm: PitchAlgorithm.Voice,
          };

          await TrackPlayer.add(track);
        }
      })().then(() => { });
    }
  }, [audioPlayer]);

  return (
    <View>
      <PlaybackControls />
    </View>
  );
}
