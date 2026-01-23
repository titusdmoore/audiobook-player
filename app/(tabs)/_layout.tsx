import { PALETTE } from "@/utils/colors";
import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useAppSelector } from "@/utils/hooks";
import HeaderBar from "@/components/molecules/HeaderBar";
import GlobalAudioControls from "@/components/molecules/GlobalAudioControls";
import LibraryHeader from "@/components/molecules/LibraryHeader";

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

