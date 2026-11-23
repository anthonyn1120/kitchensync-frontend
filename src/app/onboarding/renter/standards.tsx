import { router } from 'expo-router';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { FadeUp } from '@/components/onboarding/FadeUp';
import { FormSection, TagPillGroup } from '@/components/onboarding/Controls';
import { refineLabel } from '@/components/onboarding/steps';
import { allergenOptions, certificationOptions } from '@/data/mock';
import { useAppState } from '@/store/AppState';

/** Sharpen results 2/3 — allergen rules the kitchen must follow, and certifications the renter holds. */
export default function RenterStandards() {
  const { renterPrefs, updateRenterPrefs } = useAppState();
  const { allergens, certifications } = renterPrefs;

  return (
    <StepScreen
      label={refineLabel(2)}
      title="Any allergen rules?"
      subtitle="We’ll only show kitchens that can keep to them. Skip this if none apply."
      onContinue={() => router.push('/onboarding/renter/schedule?refine=1')}
    >
      <FadeUp stagger={2}>
        <FormSection label="Kitchen must be">
          <TagPillGroup options={allergenOptions} selected={allergens} onChange={(next) => updateRenterPrefs({ allergens: next })} />
        </FormSection>
      </FadeUp>
      <FadeUp stagger={3}>
        <FormSection label="Certifications you hold" hint="Optional">
          <TagPillGroup
            options={certificationOptions}
            selected={certifications}
            onChange={(next) => updateRenterPrefs({ certifications: next })}
          />
        </FormSection>
      </FadeUp>
    </StepScreen>
  );
}
