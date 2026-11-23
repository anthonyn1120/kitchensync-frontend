import { useRef } from 'react';
import { router } from 'expo-router';
import { Text } from '@/components/ui';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { FadeUp } from '@/components/onboarding/FadeUp';
import { OptionGrid } from '@/components/onboarding/OptionGrid';
import { GlassInput } from '@/components/onboarding/Controls';
import { equipmentFor, productOptions, suggestedEquipment } from '@/components/onboarding/options';
import { RENTER_STEPS } from '@/components/onboarding/steps';
import type { ProductCategory } from '@/data/types';
import { useAppState } from '@/store/AppState';

/** Renter step 1 of 2 — business name + everything they make (multi-select, with "Something else"). */
export default function RenterProduct() {
  const { renterPrefs, updateRenterPrefs } = useAppState();
  const { productCategories, otherCategory, businessName } = renterPrefs;
  const suggestedFor = useRef<string | null>(null);

  const wantsOther = productCategories.includes('other');
  const canContinue =
    productCategories.length > 0 && businessName.trim().length > 1 && (!wantsOther || otherCategory.trim().length > 1);

  const toggle = (c: ProductCategory) =>
    updateRenterPrefs({
      productCategories: productCategories.includes(c)
        ? productCategories.filter((x) => x !== c)
        : [...productCategories, c],
    });

  const next = () => {
    if (!canContinue) return;
    // Pre-select typical equipment for the categories, once per set of choices.
    const key = [...productCategories].sort().join(',');
    if (suggestedFor.current !== key) {
      updateRenterPrefs({ equipment: equipmentFor(suggestedEquipment, productCategories) });
      suggestedFor.current = key;
    }
    updateRenterPrefs({ businessName: businessName.trim(), otherCategory: otherCategory.trim() });
    router.push('/onboarding/renter/location');
  };

  return (
    <StepScreen
      step={1}
      total={RENTER_STEPS}
      title="What are you making?"
      subtitle="Pick everything you make. We’ll look for spaces with the right equipment and permits."
      canContinue={canContinue}
      onContinue={next}
    >
      <FadeUp stagger={2}>
        <GlassInput
          label="Business name"
          placeholder="e.g. Rise & Rye Bakehouse"
          value={businessName}
          onChangeText={(t) => updateRenterPrefs({ businessName: t })}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
        />
      </FadeUp>
      <FadeUp stagger={3} style={{ marginTop: 28, gap: 12 }}>
        <Text variant="monoSm">Pick all that apply</Text>
        <OptionGrid dense options={productOptions} values={productCategories} onChange={toggle} />
      </FadeUp>
      {wantsOther && (
        <FadeUp stagger={0} style={{ marginTop: 16 }}>
          <GlassInput
            label="What do you make?"
            placeholder="e.g. Baby food, Hot honey, Pierogi"
            value={otherCategory}
            onChangeText={(t) => updateRenterPrefs({ otherCategory: t })}
            autoCapitalize="sentences"
            returnKeyType="done"
            onSubmitEditing={() => canContinue && next()}
            autoFocus
          />
        </FadeUp>
      )}
    </StepScreen>
  );
}
