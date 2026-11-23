import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Chip, PillButton, SectionTitle, Text } from '@/components/ui';
import { equipmentOptions, listings } from '@/data/mock';
import type { Weekday } from '@/data/types';
import { colors, fonts } from '@/theme';
import { BottomSheet } from './BottomSheet';
import { buildDeck, DeckFilters, WEEKDAYS } from './filters';
import { ValueSlider } from './ValueSlider';

type Props = {
  open: boolean;
  initial: DeckFilters;
  /** Already swiped ids, so the live count matches what the deck will show */
  exclude: string[];
  onClose: () => void;
  onApply: (f: DeckFilters) => void;
};

export function FilterSheet({ open, initial, exclude, onClose, onApply }: Props) {
  const [draft, setDraft] = useState<DeckFilters>(initial);

  // Re-seed from the saved prefs each time the sheet opens.
  useEffect(() => {
    if (open) setDraft(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const count = useMemo(() => buildDeck(listings, draft, exclude).length, [draft, exclude]);

  const toggle = <K extends 'equipment' | 'days'>(key: K, item: DeckFilters[K][number]) => {
    Haptics.selectionAsync();
    setDraft((d) => {
      const list = d[key] as string[];
      const next = list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
      if (key === 'days') next.sort((a, b) => WEEKDAYS.indexOf(a as Weekday) - WEEKDAYS.indexOf(b as Weekday));
      return { ...d, [key]: next };
    });
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      header={
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="mono" style={{ marginBottom: 6 }}>
              Filters
            </Text>
            <Text variant="h3">Refine your deck</Text>
          </View>
          <PillButton
            label="Reset"
            size="sm"
            variant="ghost"
            onPress={() => setDraft({ maxDistanceMiles: 5, budgetPerHour: 50, equipment: [], days: [] })}
          />
        </View>
      }
      footer={
        <>
          <PillButton label="Cancel" size="lg" onPress={onClose} style={{ flex: 1 }} />
          <PillButton
            label={count === 1 ? 'Show 1 Space' : `Show ${count} Spaces`}
            size="lg"
            variant="primary"
            onPress={() => onApply(draft)}
            style={{ flex: 1.4 }}
          />
        </>
      }
    >
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <SectionTitle right={<Value>{`${draft.maxDistanceMiles} mi`}</Value>}>Max Distance</SectionTitle>
          <ValueSlider
            value={draft.maxDistanceMiles}
            min={1}
            max={15}
            step={1}
            onChange={(v) => setDraft((d) => ({ ...d, maxDistanceMiles: v }))}
          />
          <Scale left="1 mi" right="15 mi" />
        </View>

        <View style={styles.section}>
          <SectionTitle right={<Value>{`$${draft.budgetPerHour}/hr`}</Value>}>Max Rate</SectionTitle>
          <ValueSlider
            value={draft.budgetPerHour}
            min={20}
            max={100}
            step={5}
            onChange={(v) => setDraft((d) => ({ ...d, budgetPerHour: v }))}
          />
          <Scale left="$20" right="$100" />
        </View>

        <View style={styles.section}>
          <SectionTitle right={<Text variant="monoSm">Any selected</Text>}>Required Equipment</SectionTitle>
          <View style={styles.chips}>
            {equipmentOptions.map((e) => (
              <Chip key={e} label={e} active={draft.equipment.includes(e)} onPress={() => toggle('equipment', e)} style={styles.chip} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle>Days</SectionTitle>
          <View style={styles.days}>
            {WEEKDAYS.map((d) => (
              <Chip
                key={d}
                label={d}
                active={draft.days.includes(d)}
                onPress={() => toggle('days', d)}
                style={styles.dayChip}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

function Value({ children }: { children: string }) {
  return <Text style={{ fontFamily: fonts.monoMedium, fontSize: 12, color: colors.textPrimary }}>{children}</Text>;
}

function Scale({ left, right }: { left: string; right: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text variant="monoSm">{left}</Text>
      <Text variant="monoSm">{right}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  body: { paddingHorizontal: 20, paddingBottom: 20, gap: 28 },
  section: { gap: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 40 },
  days: { flexDirection: 'row', gap: 6 },
  dayChip: { flex: 1, justifyContent: 'center', paddingHorizontal: 0, minHeight: 40 },
});
