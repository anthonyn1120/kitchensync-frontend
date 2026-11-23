import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { FadeUp } from '@/components/onboarding/FadeUp';
import { DayGrid, FormSection, StepperRow, TagPill } from '@/components/onboarding/Controls';
import { hourPresets } from '@/components/onboarding/options';
import { HOST_STEPS } from '@/components/onboarding/steps';
import { useAppState } from '@/store/AppState';

/** Host step 4 — open days, hours window and hourly rate, with a quiet earnings estimate. */
export default function HostAvailability() {
  const { hostSetup, updateHostSetup } = useAppState();
  const { days, hours, ratePerHour } = hostSetup;
  const hoursPerDay = hourPresets.find((p) => p.label === hours)?.hours ?? 8;
  const monthly = Math.round(ratePerHour * hoursPerDay * days.length * 4.3);
  const canContinue = days.length > 0 && !!hours;

  return (
    <StepScreen
      step={4}
      total={HOST_STEPS}
      title="When can renters book?"
      subtitle="Open only the time you’d leave idle. You approve every booking."
      continueLabel="Publish listing"
      canContinue={canContinue}
      onContinue={() => router.push('/onboarding/host/live')}
    >
      <FadeUp stagger={2}>
        <FormSection label="Days">
          <DayGrid selected={days} onChange={(next) => updateHostSetup({ days: next })} />
        </FormSection>
      </FadeUp>

      <FadeUp stagger={3}>
        <FormSection label="Hours">
          <View style={styles.wrap}>
            {hourPresets.map((p) => (
              <TagPill key={p.label} label={p.label} active={hours === p.label} onPress={() => updateHostSetup({ hours: p.label })} />
            ))}
          </View>
        </FormSection>
      </FadeUp>

      <FadeUp stagger={4}>
        <StepperRow
          label="Hourly rate"
          value={ratePerHour}
          min={20}
          max={200}
          step={5}
          format={(v) => `$${v}/hr`}
          onChange={(v) => updateHostSetup({ ratePerHour: v })}
        />
        <Text variant="bodySm" style={{ marginTop: 8 }}>
          {days.length > 0
            ? `About $${monthly.toLocaleString('en-US')} a month if every slot books. Nearby kitchens charge $40–55.`
            : 'Nearby kitchens charge $40–55 an hour.'}
        </Text>
      </FadeUp>
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
