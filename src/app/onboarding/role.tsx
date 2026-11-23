import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { NavHeader, Text } from '@/components/ui';
import { FadeUp } from '@/components/onboarding/FadeUp';
import { RoleCard } from '@/components/onboarding/RoleCard';
import { images } from '@/data/images';
import { useAppState } from '@/store/AppState';
import { colors, fonts } from '@/theme';

/** "How will you use Kitchen Sync?" — picks the renter or host branch. */
export default function RoleScreen() {
  const insets = useSafeAreaInsets();
  const { setRole, updateHostSetup } = useAppState();

  const chooseRenter = () => {
    setRole('renter');
    // Pitch demo: Maya's answers stay filled in (Beverages, Bothell ZIP) so it taps straight through.
    router.push('/onboarding/renter/product');
  };

  const chooseHost = () => {
    setRole('host');
    updateHostSetup({ facilityName: '', facilityType: null, address: '', listingSource: null, description: '' });
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
            photo={images.chefLine}
            badge="Renter"
            title="I need space"
            description="Find verified commercial kitchens and factories with idle production capacity."
            onPress={chooseRenter}
          />
        </FadeUp>
        <FadeUp stagger={3} style={{ flex: 1 }}>
          <RoleCard
            photo={images.factoryFloor}
            badge="Host"
            title="I have space"
            description="Monetize your unused equipment and schedule by hosting vetted food brands."
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
    fontFamily: fonts.medium,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.9,
    color: colors.textPrimary,
    marginBottom: 28,
  },
  cards: { flex: 1, gap: 20 },
});
