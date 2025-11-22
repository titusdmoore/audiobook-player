import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Button, FlatList } from "react-native";
import TrackPlayer, { PitchAlgorithm, State, Track } from "react-native-track-player";
import { Directory, Paths, File } from "expo-file-system";
import PlaybackControls from "@/components/molecules/PlaybackControls";
import { Link } from "expo-router";
import { PALETTE } from "@/utils/colors";
import * as SecureStore from 'expo-secure-store';
import { useAppSelector } from "@/utils/hooks";
import { getBooks } from "@/utils/db/db";
import { useSQLiteContext } from "expo-sqlite";
import ListTitleCard from "@/components/molecules/ListTitleCard";

// source = { require('@/assets/images/react-logo.png') }
export default function Tab() {
  const [books, setBooks] = useState<any[]>([]);
  const db = useSQLiteContext();

  useEffect(() => {
    getBooks(db).then((value) => setBooks(value));
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FlatList
        data={books}
        renderItem={(item) => <ListTitleCard {...item} />}
      />
      <TouchableOpacity onPress={async () => { console.log(await TrackPlayer.getPlaybackState()); }}>
        <Text style={{ color: PALETTE.text }}>State</Text>
      </TouchableOpacity>
      <Link href="/player">
        <Text style={{ color: PALETTE.text }}>Player Modal</Text>
      </Link>
    </View>
  );
}
