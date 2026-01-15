import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Link, Tabs } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useAppSelector } from "@/utils/hooks";
import AudioControls, { ControlsType, PlayButton } from "@/components/atoms/AudioControls";
import { useEffect, useState } from "react";
import TrackPlayer from "react-native-track-player";
import HeaderBar from "@/components/molecules/HeaderBar";
import { Playable } from "@/utils/classes/playable";
import { LibraryHeader } from "./library";

function GlobalAudioControls({ title }: { title: Playable }) {
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const [activeTrack, setActiveTrack] = useState<any>();

  useEffect(() => {
    (async () => {
      let track = await TrackPlayer.getActiveTrack();

      if (track) {
        setActiveTrack(track);
      }
    })().then(() => { });
  }, []);

  return (
    <Link href="/player">
      <View style={{ width: '100%', backgroundColor: PALETTE.backgroundLight, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={title.imagePath} style={{ width: 70, height: 70, borderRadius: 10 }} />
          <View style={{ maxWidth: '70%' }}>
            <Text style={{ color: PALETTE.text, fontSize: 16 }}>{title.name}</Text>
            {activeTrack && (<Text style={{ color: PALETTE.text, fontSize: 12 }}>{activeTrack.title}</Text>)}
          </View>
        </View>
        <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={() => { }} style={styles.jumpBackButton}>
            <FontAwesome6Pro name="arrow-rotate-left" iconStyle="solid" size={18} color={PALETTE.textOffWhite} />
          </TouchableOpacity>
          <PlayButton scale={.5} style={styles.compactAudioControlsPlay} />
        </View>
      </View>
    </Link>
  );
}

export default function Layout() {
  const audioPlayerProvider = useAppSelector(state => state.audioPlayer);

  return (
    <>
      <Tabs screenOptions={{
        tabBarActiveTintColor: PALETTE.primary,
        header: (props) => <HeaderBar {...props} />,
      }} tabBar={(props) => (
        <View>
          {audioPlayerProvider.activeTitle && (<GlobalAudioControls title={audioPlayerProvider.activeTitle} />)}
          <BottomTabBar {...props} />
        </View>
      )}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome6Pro name="house" size={24} color={color} />
          }} />
        <Tabs.Screen
          name='library'
          options={{
            title: 'Library',
            header: (props) => <LibraryHeader {...props} />,
            href: { pathname: '/library', params: { searchTerm: '' } },
            tabBarIcon: ({ color }) => <FontAwesome6Pro name="books" size={24} color={color} />,
          }} />
        <Tabs.Screen
          name='search'
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => <FontAwesome6Pro name="magnifying-glass" size={24} color={color} />,
          }} />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <FontAwesome6Pro name="gear" size={24} color={color} />
          }} />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  compactAudioControlsPlay: {
    width: 50,
    height: 50,
    borderRadius: "100%",
    backgroundColor: PALETTE.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jumpBackButton: {
    backgroundColor: PALETTE.background,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '100%',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  }
});
