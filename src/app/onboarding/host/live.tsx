import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { GlassPanel, Text } from '@/components/ui';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { FadeUp } from '@/components/onboarding/FadeUp';
import { ease } from '@/components/onboarding/Motion';
import { facilityLabel } from '@/components/onboarding/options';
import { photos } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors, fonts, radius } from '@/theme';

/** "You're live" — one check, a sentence, the listing preview, then into the host dashboard. */
export default function HostLive() {
  const { hostSetup, completeOnboarding } = useAppState();
  const { facilityName, facilityType, address, days, hours, ratePerHour } = hostSetup;
  const check = useSharedValue(0);

  useEffect(() => {
    check.value = withDelay(80, withTiming(1, { duration: 320, easing: ease }));
    const t = setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 200);
    return () => clearTimeout(t);
  }, [check]);
  const checkStyle = useAnimatedStyle(() => ({ opacity: check.value, transform: [{ scale: 0.85 + check.value * 0.15 }] }));
  const name = (facilityName || 'your space').replace(/\.$/, '');

  return (
    <StepScreen
      hideBack
      continueLabel="Go to my dashboard"
      onContinue={() => {
        completeOnboarding();
        router.replace('/host/dashboard');
      }}
    >
      <Animated.View style={[styles.check, checkStyle]}>
        <Check size={28} color="#FFFFFF" strokeWidth={2.5} />
      </Animated.View>

      <FadeUp stagger={1} style={{ marginBottom: 32 }}>
        <Text style={styles.title}>Your idle hours are listed</Text>
        <Text variant="body">Food businesses nearby can now find {name}. You approve every tour and booking. (Sample listing, demo only.)</Text>
      </FadeUp>

      <FadeUp stagger={2}>
        <GlassPanel radius={radius.panel - 8} contentStyle={{ padding: 8 }}>
          <View style={styles.photo}>
            <Image source={photos.nvcKitchen} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={{ top: '62%' }} transition={200} />
            <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']} style={StyleSheet.absoluteFill} />
            <View style={styles.rateBadge}>
              <Text style={{ fontFamily: fonts.monoMedium, fontSize: 13, color: colors.primaryButtonText }}>${ratePerHour}/hr</Text>
            </View>
          </View>
          <View style={{ paddingHorizontal: 14, paddingTop: 16, paddingBottom: 12 }}>
            <Text variant="monoSm" style={{ marginBottom: 6 }}>
              {facilityLabel(facilityType)}
            </Text>
            <Text variant="h3" numberOfLines={1} style={{ marginBottom: 6 }}>
              {facilityName || 'Your facility'}
            </Text>
            {!!address && (
              <Text variant="bodySm" numberOfLines={1}>
                {address}
              </Text>
            )}
            <Text variant="bodySm" numberOfLines={1}>
              {days.join(', ') || 'No days yet'} · {hours}
            </Text>
          </View>
        </GlassPanel>
      </FadeUp>
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  check: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentMatch,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 30, lineHeight: 36, letterSpacing: -0.4, color: colors.textPrimary, marginBottom: 12 },
  photo: { height: 160, borderRadius: radius.panel - 16, overflow: 'hidden', backgroundColor: colors.black20 },
  rateBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryButtonBg,
  },
});
