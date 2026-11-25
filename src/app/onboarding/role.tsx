import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { NavHeader, Text } from '@/components/ui';
import { FadeUp } from '@/components/onboarding/FadeUp';
import { RoleCard } from '@/components/onboarding/RoleCard';
import { photos } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors, fonts } from '@/theme';

/** "How will you use Kitchen Sync?" — picks the renter or host branch. */
export default function RoleScreen() {
  const insets = useSafeAreaInsets();
  const { setRole } = useAppState();

  const chooseRenter = () => {
    setRole('renter');
    // Pitch demo: the search is pre-filled for Wanola Granola (Bellevue, 98005) so it taps straight through.
    router.push('/onboarding/renter/making');
  };

  const chooseHost = () => {
    setRole('host');
    router.push('/onboarding/host/basics');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
      <FadeUp stagger={0} distance={0}>
        <NavHeader label="Welcome" />
      </FadeUp>
      <FadeUp stagger={1}>
        <Text style={styles.title}>How will you use{'\n'}Kitchen Sync?</Text>
      </FadeUp>

      <View style={styles.cards}>
        <FadeUp stagger={2} style={{ flex: 1 }}>
          <RoleCard
            photo={photos.nvcStorage}
            badge="Food business"
            title="I need space"
            description="Book a licensed kitchen by the hour. No lease, price shown up front."
            onPress={chooseRenter}
          />
        </FadeUp>
        <FadeUp stagger={3} style={{ flex: 1 }}>
          <RoleCard
            photo={photos.nvcKitchen}
            badge="Kitchen owner"
            title="I have space"
            description="List the hours your kitchen sits idle and approve who books them."
            onPress={chooseHost}
          />
        </FadeUp>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  title: {
    fontFamily: fonts.serif,
    fontWeight: '700',
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
    color: colors.textPrimary,
    marginBottom: 28,
  },
  cards: { flex: 1, gap: 20 },
});
