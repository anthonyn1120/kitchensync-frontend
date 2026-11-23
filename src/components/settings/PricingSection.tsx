import { Pressable, StyleSheet, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import type { Weekday } from '@/data/types';
import { colors, fonts, radius } from '@/theme';
import { IconButton, Text } from '@/components/ui';
import { useAppState } from '@/store/AppState';
import { SettingRow, SettingsSection } from './SettingsSection';

const DAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STEP = 5;

/** Host-only: hourly rate stepper + weekly availability grid, wired to hostSetup. */
export function PricingSection({ index }: { index: number }) {
  const { hostSetup, updateHostSetup } = useAppState();
  const rate = hostSetup.ratePerHour;

  const setRate = (next: number) => updateHostSetup({ ratePerHour: Math.min(250, Math.max(15, next)) });
  const toggleDay = (d: Weekday) => {
    const days = hostSetup.days.includes(d) ? hostSetup.days.filter((x) => x !== d) : [...hostSetup.days, d];
    updateHostSetup({ days: DAYS.filter((x) => days.includes(x)) });
  };

  return (
    <SettingsSection title="Pricing & Availability" index={index}>
      <SettingRow label="Hourly Rate" hint="Shown to renters on your listing card">
        <View style={styles.stepper}>
          <IconButton size={40} onPress={() => setRate(rate - STEP)}>
            <Minus size={16} color={colors.textPrimary} />
          </IconButton>
          <View style={{ minWidth: 64, alignItems: 'center' }}>
            <Text style={styles.rate}>${rate}</Text>
            <Text variant="monoSm">/ hr</Text>
          </View>
          <IconButton size={40} onPress={() => setRate(rate + STEP)}>
            <Plus size={16} color={colors.textPrimary} />
          </IconButton>
        </View>
      </SettingRow>

      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="mono">Available Days</Text>
          <Text variant="mono" color={colors.textSecondary}>
            {hostSetup.hours}
          </Text>
        </View>
        <View style={styles.grid}>
          {DAYS.map((d) => {
            const on = hostSetup.days.includes(d);
            return (
              <Pressable
                key={d}
                onPress={() => toggleDay(d)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                style={[styles.day, on && styles.dayOn]}
              >
                <Text style={[styles.dayText, { color: on ? colors.accentMatch : colors.textSecondary }]}>{d.slice(0, 2)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rate: { fontFamily: fonts.mono, fontSize: 20, color: colors.accentMatch },
  grid: { flexDirection: 'row', gap: 6 },
  day: {
    flex: 1,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.white10,
  },
  dayOn: { backgroundColor: colors.accentMatchSoft, borderColor: colors.accentMatch },
  dayText: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
});
