import FontAwesome6Pro from "@react-native-vector-icons/fontawesome6-pro";
import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <FontAwesome6Pro name="books" size={24} color={color} />
        }} />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome6Pro name="gear" size={24} color={color} />
        }} />
    </Tabs>
  );
}
