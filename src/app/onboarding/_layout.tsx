import { Stack } from 'expo-router/stack';

// Screens are transparent over the shared Background, so a slide would show both
// screens on top of each other mid-transition. A short cross-fade reads cleaner;
// each screen's own content entrance supplies the motion.
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'fade',
        animationDuration: 220,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="host/live" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
