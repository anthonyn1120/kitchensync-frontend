import { router } from 'expo-router';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { FadeUp } from '@/components/onboarding/FadeUp';
import { FormSection, GlassInput, SegmentedPills } from '@/components/onboarding/Controls';
import { distanceOptions } from '@/components/onboarding/options';
import { RENTER_STEPS } from '@/components/onboarding/steps';
import { useAppState } from '@/store/AppState';

/** Renter step 2 of 2 — ZIP and how far they'll travel. Then straight to matching. */
export default function RenterLocation() {
  const { renterPrefs, updateRenterPrefs } = useAppState();
  const { maxDistanceMiles, zip } = renterPrefs;
  const zipValid = /^\d{5}$/.test(zip);
  const distance = (distanceOptions as readonly number[]).includes(maxDistanceMiles) ? (maxDistanceMiles as (typeof distanceOptions)[number]) : 5;

  return (
    <StepScreen
      step={2}
      total={RENTER_STEPS}
      title="Where’s your kitchen?"
      subtitle="Your ZIP and how far you’ll travel. We’ll show what’s nearby."
      continueLabel="Find kitchens"
      canContinue={zipValid}
      onContinue={() => router.push('/onboarding/renter/matching')}
    >
      <FadeUp stagger={2}>
        <GlassInput
          label="ZIP code"
          placeholder="11222"
          value={zip}
          onChangeText={(t) => updateRenterPrefs({ zip: t.replace(/\D/g, '').slice(0, 5) })}
          keyboardType="number-pad"
          maxLength={5}
          returnKeyType="done"
          style={{ marginBottom: 32 }}
        />
      </FadeUp>

      <FadeUp stagger={3}>
        <FormSection label="How far you’ll travel">
          <SegmentedPills options={distanceOptions} value={distance} format={(v) => `${v} mi`} onChange={(v) => updateRenterPrefs({ maxDistanceMiles: v })} />
        </FormSection>
      </FadeUp>
    </StepScreen>
  );
}
