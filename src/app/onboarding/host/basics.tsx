import { router } from 'expo-router';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { FadeUp } from '@/components/onboarding/FadeUp';
import { OptionGrid } from '@/components/onboarding/OptionGrid';
import { FormSection, GlassInput } from '@/components/onboarding/Controls';
import { facilityOptions } from '@/components/onboarding/options';
import { HOST_STEPS } from '@/components/onboarding/steps';
import { useAppState } from '@/store/AppState';

/** Host step 1 — facility type, name and address. */
export default function HostBasics() {
  const { hostSetup, updateHostSetup } = useAppState();
  const { facilityName, facilityType, address } = hostSetup;
  const canContinue = facilityName.trim().length > 1 && !!facilityType && address.trim().length > 4;

  return (
    <StepScreen
      step={1}
      total={HOST_STEPS}
      title="Tell us about your space"
      subtitle="Renters search by type first, so start there."
      canContinue={canContinue}
      onContinue={() => {
        updateHostSetup({ facilityName: facilityName.trim(), address: address.trim() });
        router.push('/onboarding/host/listing');
      }}
    >
      <FadeUp stagger={2}>
        <FormSection label="Type of space">
          <OptionGrid compact options={facilityOptions} value={facilityType} onChange={(v) => updateHostSetup({ facilityType: v })} />
        </FormSection>
      </FadeUp>

      <FadeUp stagger={3}>
        <GlassInput
          label="Name"
          placeholder="e.g. Brooklyn Baking Co."
          value={facilityName}
          onChangeText={(t) => updateHostSetup({ facilityName: t })}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
          style={{ marginBottom: 24 }}
        />
        <GlassInput
          label="Address"
          placeholder="118 Franklin St, Brooklyn, NY 11222"
          value={address}
          onChangeText={(t) => updateHostSetup({ address: t })}
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="fullStreetAddress"
          returnKeyType="done"
        />
      </FadeUp>
    </StepScreen>
  );
}
