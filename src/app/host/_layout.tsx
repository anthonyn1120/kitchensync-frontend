import { Platform } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { BarChart3, LayoutGrid, MessageSquare, Settings } from 'lucide-react-native';
import { GlassTabBar } from '@/components/ui';
import { useAppState } from '@/store/AppState';

/** Host mode — mobile version of the desktop sidebar's "Host Mode" nav. */
export default function HostLayout() {
  const { conversations } = useAppState();
  const unread = conversations.host.reduce((n, c) => n + c.unread, 0);

  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      // Scenes are transparent so <Background /> shows through. Native detaches inactive tabs,
      // but on web they stay mounted and would show through each other, so hide them there.
      screenOptions={({ navigation }) => ({
        headerShown: false,
        sceneStyle: [{ backgroundColor: 'transparent' }, Platform.OS === 'web' && !navigation.isFocused() && { display: 'none' }],
      })}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ title: 'Analytics', tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarBadge: unread || undefined,
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }}
      />
    </Tabs>
  );
}
