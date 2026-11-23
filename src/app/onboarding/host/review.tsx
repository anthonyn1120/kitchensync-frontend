import { router } from 'expo-router';
import { Text } from '@/components/ui';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { FadeUp } from '@/components/onboarding/FadeUp';
import { EditableChips, FormSection, GlassInput } from '@/components/onboarding/Controls';
import { HOST_STEPS } from '@/components/onboarding/steps';
import { allergenOptions, certificationOptions, equipmentOptions } from '@/data/mock';
import { useAppState } from '@/store/AppState';
import { colors } from '@/theme';

/** Host step 3 — check what was pulled out of the files or voice note, as editable chips + description. */
export default function HostReview() {
  const { hostSetup, updateHostSetup } = useAppState();
  const { equipment, certifications, allergenPolicies, description, listingSource } = hostSetup;
  const manual = listingSource === 'manual';
  const canContinue = equipment.length > 0 && description.trim().length >= 20;

  return (
    <StepScreen
      step={3}
      total={HOST_STEPS}
      title={manual ? 'Add your details' : 'Check the details'}
      subtitle={manual ? 'Renters filter by these, so add what your space has.' : 'Here’s what we picked up. Remove anything wrong, add what’s missing.'}
      canContinue={canContinue}
      onContinue={() => {
        updateHostSetup({ description: description.trim() });
        router.push('/onboarding/host/availability');
      }}
    >
      <FadeUp stagger={2}>
        <FormSection label="Equipment">
          <EditableChips options={equipmentOptions} selected={equipment} onChange={(next) => updateHostSetup({ equipment: next })} />
        </FormSection>
      </FadeUp>
      <FadeUp stagger={3}>
        <FormSection label="Certifications">
          <EditableChips options={certificationOptions} selected={certifications} onChange={(next) => updateHostSetup({ certifications: next })} />
        </FormSection>
      </FadeUp>
      <FadeUp stagger={4}>
        <FormSection label="Allergen policy">
          <EditableChips options={allergenOptions} selected={allergenPolicies} onChange={(next) => updateHostSetup({ allergenPolicies: next })} />
        </FormSection>
      </FadeUp>
      <FadeUp stagger={5}>
        <GlassInput
          label="Description"
          multiline
          placeholder="What makes your space good for food brands? Equipment, hours, house rules…"
          value={description}
          onChangeText={(t) => updateHostSetup({ description: t })}
        />
        {description.trim().length > 0 && description.trim().length < 20 && (
          <Text variant="monoSm" color={colors.accentDanger} style={{ marginTop: 8 }}>
            A little more detail, please
          </Text>
        )}
      </FadeUp>
    </StepScreen>
  );
}
