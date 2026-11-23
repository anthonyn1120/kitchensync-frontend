import { Platform } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { CalendarDays, MapPin, MessageSquare, Settings } from 'lucide-react-native';
import { GlassTabBar } from '@/components/ui';
import { useAppState } from '@/store/AppState';

/** Renter mode — mobile version of the desktop sidebar's "Renter Mode" nav. */
export default function RenterLayout() {
  const { conversations } = useAppState();
  const unread = conversations.renter.reduce((n, c) => n + c.unread, 0);

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
        name="find-space"
        options={{ title: 'Find Space', tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} /> }}
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
        name="bookings"
        options={{ title: 'Bookings', tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }}
      />
    </Tabs>
  );
}
