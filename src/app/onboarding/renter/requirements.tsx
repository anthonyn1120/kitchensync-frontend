import { useState } from 'react';
import { router } from 'expo-router';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { FadeUp } from '@/components/onboarding/FadeUp';
import { TagPillGroup, TextLink } from '@/components/onboarding/Controls';
import { equipmentFor, focusedEquipment } from '@/components/onboarding/options';
import { exitRefine, refineLabel } from '@/components/onboarding/steps';
import { equipmentOptions } from '@/data/mock';
import { useAppState } from '@/store/AppState';

/**
 * Sharpen results 1/3 — the equipment they need, starting from the set that fits their categories.
 * Entered from Find Space at /onboarding/renter/requirements?refine=1; back returns there.
 */
export default function RenterRequirements() {
  const { renterPrefs, updateRenterPrefs } = useAppState();
  const { equipment, productCategories } = renterPrefs;
  const [showAll, setShowAll] = useState(false);

  // Their categories' sets, plus anything already selected from outside them, in the master list's order.
  const focus = equipmentFor(focusedEquipment, productCategories);
  const shown = showAll ? equipmentOptions : equipmentOptions.filter((e) => focus.includes(e) || equipment.includes(e));

  return (
    <StepScreen
      label={refineLabel(1)}
      onBack={() => (router.canGoBack() ? router.back() : exitRefine())}
      title="What equipment do you need?"
      subtitle="Pick what you can’t work without. We’ll rank kitchens by how much they have."
      canContinue={equipment.length > 0}
      onContinue={() => router.push('/onboarding/renter/standards?refine=1')}
    >
      <FadeUp stagger={2}>
        <TagPillGroup options={shown} selected={equipment} onChange={(next) => updateRenterPrefs({ equipment: next })} />
        {(showAll || shown.length < equipmentOptions.length) && (
          <TextLink label={showAll ? 'Show fewer' : 'Show all equipment'} onPress={() => setShowAll((s) => !s)} style={{ marginTop: 16 }} />
        )}
      </FadeUp>
    </StepScreen>
  );
}
