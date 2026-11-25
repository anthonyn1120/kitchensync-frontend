import { Platform } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { CalendarDays, ClipboardCheck, MapPin, User } from 'lucide-react-native';
import { GlassTabBar } from '@/components/ui';

/** Renter mode — mobile version of the desktop sidebar's "Renter Mode" nav. */
export default function RenterLayout() {
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
        options={{ title: 'Kitchens', tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="bookings"
        options={{ title: 'Requests', tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="ready"
        options={{ title: 'Permits', tabBarIcon: ({ color, size }) => <ClipboardCheck color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
