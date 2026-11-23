import { Stack } from 'expo-router/stack';

export const unstable_settings = { initialRouteName: 'index' };

export default function MessagesLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />;
}
