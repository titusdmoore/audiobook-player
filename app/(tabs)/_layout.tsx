import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Link, Tabs } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useAppSelector } from "@/utils/hooks";
import AudioControls, { ControlsType } from "@/components/atoms/AudioControls";
import { useEffect, useState } from "react";
import TrackPlayer from "react-native-track-player";
import HeaderBar from "@/components/molecules/HeaderBar";
import { Playable } from "@/utils/classes/playable";

function GlobalAudioControls({ title }: { title: Playable }) {
  const jellyfinProvider = useAppSelector(state => state.bookProvider);
  const [activeTrack, setActiveTrack] = useState<any>();

  useEffect(() => {
    (async () => {
      let track = await TrackPlayer.getActiveTrack();

      if (track) {
        setActiveTrack(track)
      }
    })().then(() => { });
  }, []);

  return (
    <Link href="/player">
      <View style={{ width: '100%', borderColor: 'red', borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Image source={title.imagePath} style={{ width: 50, height: 50 }} />
          <View style={{ maxWidth: '70%' }}>
            <Text style={{ color: PALETTE.text, fontSize: 16 }}>{title.name}</Text>
            {activeTrack && (<Text style={{ color: PALETTE.text, fontSize: 12 }}>{activeTrack.title}</Text>)}
          </View>
        </View>
        <AudioControls scale={.75} type={ControlsType.SMALL} />
      </View>
    </Link>
  );
}

export default function Layout() {
  const audioPlayerProvider = useAppSelector(state => state.audioPlayer);

  return (
    <>
      <Tabs screenOptions={{
        tabBarActiveTintColor: 'blue',
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
            href: { pathname: '/library', params: { searchTerm: '' } },
            tabBarIcon: ({ color }) => <FontAwesome6Pro name="books" size={24} color={color} />,
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
