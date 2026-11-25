import { Platform } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { LayoutGrid, User } from 'lucide-react-native';
import { GlassTabBar } from '@/components/ui';

/** Host mode — mobile version of the desktop sidebar's "Host Mode" nav. */
export default function HostLayout() {
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
        options={{ title: 'My kitchen', tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
