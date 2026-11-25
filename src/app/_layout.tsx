import 'react-native-reanimated';
import { useEffect } from 'react';
import { Platform, Pressable, Text as RNText, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router/stack';
import { DarkTheme, router, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { AppStateProvider } from '@/store/AppState';
import { Background } from '@/components/ui';

SplashScreen.preventAutoHideAsync();

/** Presenter shortcuts shown beside the phone frame on wide screens, to jump straight to a section. */
const JUMPS: { label: string; href: string }[] = [
  { label: 'Start', href: '/onboarding' },
  { label: '1 · What & where', href: '/onboarding/renter/making' },
  { label: '2 · Permit options', href: '/onboarding/renter/options' },
  { label: '2 · Application', href: '/onboarding/renter/application' },
  { label: '3 · Kitchen needs', href: '/onboarding/renter/needs' },
  { label: '3 · Matches', href: '/renter/find-space' },
  { label: '3 · NVC listing', href: '/listing/nvc' },
  { label: '4 · Tour', href: '/tour?id=nvc' },
  { label: 'Kitchen owner', href: '/onboarding/host/basics' },
];

// Navigators paint theme.colors.background behind every screen; keep it transparent so <Background /> shows through.
const navTheme: Theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: 'transparent', card: 'transparent' } };

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  // Pitch deck: when the app runs inside the deck's phone frame, pass slide-navigation keys up to the deck,
  // so the presenter's arrows / clicker still change slides after tapping in the phone. Never while typing.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || window.top === window) return;
    const NAV = ['ArrowRight', 'ArrowLeft', 'PageDown', 'PageUp', 'MediaTrackNext', 'MediaTrackPrevious', 'F5'];
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || !NAV.includes(e.key)) return;
      const t = e.target as HTMLElement | null;
      if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
      e.preventDefault();
      window.top?.postMessage({ type: 'kitchensync-deck-key', key: e.key }, '*');
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  const win = useWindowDimensions();
  if (!loaded) return null;
  // Projector / laptop: show the app inside a phone. Real phones get it full-screen.
  const framed = Platform.OS === 'web' && win.width > 600;
  const frameH = Math.min(860, win.height - 32);

  const app = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStateProvider>
          <ThemeProvider value={navTheme}>
            <View style={{ flex: 1 }}>
              <Background />
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: 'transparent' },
                  animation: 'fade',
                }}
              />
            </View>
          </ThemeProvider>
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );

  if (!framed) return app;
  return (
    <View style={{ flex: 1, backgroundColor: '#161A15', alignItems: 'center', justifyContent: 'center' }}>
      {win.width > 900 && (
        <View style={{ position: 'absolute', left: 28, top: 0, bottom: 0, justifyContent: 'center', gap: 2 }}>
          <RNText style={{ fontFamily: 'Georgia, serif', fontWeight: '700', fontSize: 22, color: '#A3C481', marginBottom: 12 }}>Kitchen Sync</RNText>
          {JUMPS.map((j) => (
            <Pressable key={j.href} accessibilityRole="link" onPress={() => router.navigate(j.href as never)} style={{ paddingVertical: 7 }}>
              <RNText style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(196,202,191,0.6)' }}>{j.label}</RNText>
            </Pressable>
          ))}
        </View>
      )}
      <View style={{ width: 412, height: frameH, borderRadius: 56, backgroundColor: '#0B0D0A', padding: 11, borderWidth: 2, borderColor: '#3A4037' }}>
        <View style={{ flex: 1, borderRadius: 44, overflow: 'hidden', backgroundColor: '#F7F7F3' }}>
          <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30, backgroundColor: '#F7F7F3' }}>
            <RNText style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#161A15' }}>9:41</RNText>
            <View style={{ position: 'absolute', left: '50%', marginLeft: -52, top: 9, width: 104, height: 28, borderRadius: 14, backgroundColor: '#0B0D0A' }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
                {[5, 7, 9, 11].map((h) => (
                  <View key={h} style={{ width: 3, height: h, borderRadius: 1, backgroundColor: '#161A15' }} />
                ))}
              </View>
              <View style={{ width: 24, height: 12, borderRadius: 4, borderWidth: 1.5, borderColor: '#161A15', padding: 1.5 }}>
                <View style={{ flex: 1, width: '80%', borderRadius: 1.5, backgroundColor: '#161A15' }} />
              </View>
            </View>
          </View>
          <View style={{ flex: 1 }}>{app}</View>
        </View>
      </View>
    </View>
  );
}
