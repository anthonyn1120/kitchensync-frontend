import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { GlassPanel, Text } from '@/components/ui';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { FadeUp } from '@/components/onboarding/FadeUp';
import { FillRing } from '@/components/onboarding/Motion';
import { listings } from '@/data/mock';
import { buildDeck } from '@/components/find-space/filters';
import { describeCategories } from '@/components/onboarding/options';
import { useAppState } from '@/store/AppState';
import { colors, fonts, radius } from '@/theme';


const STEP_MS = [1300, 1100, 1100];
const TOTAL_MS = STEP_MS.reduce((a, b) => a + b, 0);

/** "Finding kitchens" — the fit ring fills while one status line changes, then the result. */
export default function RenterMatching() {
  const { renterPrefs, completeOnboarding, saved } = useAppState();
  const [step, setStep] = useState(0);
  // Same deck Find Space will show, so the numbers here match the first card.
  const deck = buildDeck(
    listings,
    {
      maxDistanceMiles: renterPrefs.maxDistanceMiles,
      budgetPerHour: renterPrefs.budgetPerHour,
      equipment: renterPrefs.equipment,
      days: renterPrefs.days,
    },
    saved,
  );
  const top = deck[0] ?? [...listings].sort((a, b) => b.matchScore - a.matchScore)[0];
  const count = deck.length;

  const category = describeCategories(renterPrefs.productCategories, renterPrefs.otherCategory);
  const lines = [`Looking at kitchens near ${renterPrefs.zip}…`, `Checking which suit ${category}…`, 'Ranking by fit and distance…'];
  const done = step >= lines.length;

  useEffect(() => {
    if (done) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    const t = setTimeout(() => setStep((p) => p + 1), STEP_MS[step]);
    return () => clearTimeout(t);
  }, [step, done]);

  return (
    <StepScreen
      label={done ? 'Your kitchens' : 'Searching'}
      hideFooter={!done}
      continueLabel="Start swiping"
      onContinue={() => {
        completeOnboarding();
        router.replace('/renter/find-space');
      }}
    >
      <FadeUp stagger={1} style={styles.hero}>
        <FillRing progress={top.matchScore / 100} duration={TOTAL_MS} size={176}>
          {done && (
            <FadeUp stagger={0} distance={4} style={{ alignItems: 'center' }}>
              <Text style={styles.score}>{top.matchScore}%</Text>
              <Text variant="monoSm">Top fit</Text>
            </FadeUp>
          )}
        </FillRing>
      </FadeUp>

      {done ? (
        <>
          <FadeUp key="done" stagger={1} style={styles.copy}>
            <Text style={styles.title}>{count} kitchens fit</Text>
            <Text variant="body" align="center">
              Within {renterPrefs.maxDistanceMiles} mi, ranked by how well they suit {category}.
            </Text>
          </FadeUp>
          <FadeUp stagger={2}>
            <GlassPanel tone="secondary" radius={radius.card} contentStyle={styles.topCard}>
              <Image source={{ uri: top.photos[0] }} style={styles.topPhoto} contentFit="cover" transition={200} />
              <View style={{ flex: 1 }}>
                <Text variant="title" numberOfLines={1} style={{ marginBottom: 4 }}>
                  {top.name}
                </Text>
                <Text variant="bodySm" numberOfLines={1}>
                  {top.neighborhood} · {top.distanceMiles} mi · ${top.ratePerHour}/hr
                </Text>
              </View>
            </GlassPanel>
          </FadeUp>
        </>
      ) : (
        <FadeUp key={step} stagger={0} distance={4} style={styles.copy}>
          <Text variant="body" align="center">
            {lines[step]}
          </Text>
        </FadeUp>
      )}
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: 24, marginBottom: 32 },
  copy: { alignItems: 'center', marginBottom: 28 },
  score: { fontFamily: fonts.monoMedium, fontSize: 30, color: colors.textPrimary, marginBottom: 2 },
  title: { fontFamily: fonts.medium, fontSize: 30, lineHeight: 36, letterSpacing: -0.9, color: colors.textPrimary, marginBottom: 8 },
  topCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 10, paddingRight: 18 },
  topPhoto: { width: 60, height: 60, borderRadius: 18 },
});
