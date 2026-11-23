import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight, Layers } from 'lucide-react-native';
import { PillButton, Text } from '@/components/ui';
import { FadeUp } from '@/components/onboarding/FadeUp';
import { colors, fonts, shadows } from '@/theme';

/** Splash: brand mark, name, tagline and Get Started. */
export default function Splash() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom, 16) + 24 }]}>
      <FadeUp stagger={1} style={styles.hero}>
        <View style={styles.brandIconShadow}>
          <LinearGradient
            colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandIcon}
          >
            <Layers size={32} color={colors.textPrimary} strokeWidth={1.5} />
          </LinearGradient>
        </View>
        <Text style={styles.title}>Kitchen Sync</Text>
        <Text variant="body" align="center" style={{ maxWidth: 260 }}>
          The marketplace for commercial food production space.
        </Text>
      </FadeUp>

      <FadeUp stagger={3}>
        <PillButton
          label="Get Started"
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push('/onboarding/role')}
          iconRight={<ArrowRight size={18} color={colors.primaryButtonText} />}
        />
        <Text variant="mono" align="center" style={{ marginTop: 24, opacity: 0.6 }}>
          Version 2.0.1
        </Text>
      </FadeUp>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brandIconShadow: { ...shadows.contact, borderRadius: 20, marginBottom: 24 },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 36,
    letterSpacing: -1.1,
    color: colors.textPrimary,
    marginBottom: 16,
  },
});
