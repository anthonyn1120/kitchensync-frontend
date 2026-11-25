import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Snowflake } from 'lucide-react-native';
import { PillButton, Text } from '@/components/ui';
import { Card, Choice, FlowScreen, Label, Segments, Switch, Title } from '@/components/demo/ui';
import { WEEKDAYS } from '@/components/onboarding/Controls';
import { equipmentChoices, hourChoices, timeWindows } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors, fonts, radius } from '@/theme';

/** The one renter onboarding step: where, how long, what equipment, cold storage, and when. Pre-filled for Tres. */
export default function RenterNeeds() {
  const { needs, updateNeeds, completeOnboarding } = useAppState();

  const go = () => {
    completeOnboarding();
    router.replace('/renter/find-space');
  };

  return (
    <FlowScreen
      eyebrow="Before we search"
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/onboarding/role'))}
      footer={
        <PillButton
          label="Find kitchens"
          variant="primary"
          size="lg"
          fullWidth
          onPress={go}
          iconRight={<ArrowRight size={18} color={colors.primaryButtonText} />}
        />
      }
    >
      <Title sub="We filter by this first, so every kitchen you see actually works for you.">What do you need in a kitchen?</Title>

      <Label>Booking rules</Label>
      <View style={styles.wrap}>
        <Choice label="Book by the hour" on={needs.byHour} onPress={() => updateNeeds({ byHour: !needs.byHour })} />
        <Choice label="No monthly contract" on={needs.noContract} onPress={() => updateNeeds({ noContract: !needs.noContract })} />
      </View>
      <Text style={[styles.personaSub, { marginTop: 12, marginBottom: 8 }]}>Minimum booking I can accept (longer minimums get flagged)</Text>
      <Segments options={hourChoices} value={needs.hours as (typeof hourChoices)[number]} onChange={(hours) => updateNeeds({ hours })} format={(h) => `${h} hrs or less`} />

      <Label style={styles.gap}>Equipment</Label>
      <View style={styles.wrap}>
        {equipmentChoices.map((e) => {
          const on = needs.equipment.includes(e);
          return (
            <Choice
              key={e}
              label={e}
              on={on}
              onPress={() => updateNeeds({ equipment: on ? needs.equipment.filter((x) => x !== e) : [...needs.equipment, e] })}
            />
          );
        })}
      </View>

      <Card style={[styles.cold, styles.gap]}>
        <View style={styles.coldIcon}>
          <Snowflake size={20} color={colors.accentMatch} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.coldTitle}>Cold storage</Text>
          <Text style={styles.personaSub}>Fridge space I can book with my slot</Text>
        </View>
        <Switch label="Cold storage" value={needs.coldStorage} onChange={(coldStorage) => updateNeeds({ coldStorage })} />
      </Card>

      <Label style={styles.gap}>Most I’ll pay</Label>
      <Segments options={[40, 50, 60, 80] as const} value={needs.budget as 40 | 50 | 60 | 80} onChange={(budget) => updateNeeds({ budget })} format={(b) => `$${b}/hr`} />

      <Label style={styles.gap}>When</Label>
      <View style={styles.days}>
        {WEEKDAYS.map((d) => (
          <Choice key={d} label={d} on={needs.day === d} onPress={() => updateNeeds({ day: d })} style={styles.day} />
        ))}
      </View>
      <View style={[styles.days, { marginTop: 8 }]}>
        {timeWindows.map((w) => (
          <Choice key={w.value} label={w.label} sub={w.range} on={needs.window === w.value} onPress={() => updateNeeds({ window: w.value })} style={{ flex: 1, borderRadius: 18, minHeight: 56 }} />
        ))}
      </View>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: 22 },
  persona: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, marginBottom: 22 },
  avatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.black20 },
  personaName: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, color: colors.textPrimary },
  personaSub: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },
  zipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  zipInput: { flex: 1, minWidth: 0, fontFamily: fonts.semibold, fontSize: 18, color: colors.textPrimary, paddingVertical: 12 },
  zipHint: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 19, color: colors.textTertiary },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cold: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  coldIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accentMatchSoft, alignItems: 'center', justifyContent: 'center' },
  coldTitle: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 21, color: colors.textPrimary },
  days: { flexDirection: 'row', gap: 6 },
  day: { flex: 1, paddingHorizontal: 0, borderRadius: 14 },
});
