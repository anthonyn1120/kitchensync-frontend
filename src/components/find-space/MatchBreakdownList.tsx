import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { matchBreakdown } from '@/data/matching';
import type { Listing } from '@/data/types';
import type { RenterPreferences } from '@/store/AppState';
import { colors } from '@/theme';

/**
 * What matched and what didn't, one short line each: green dot = meets your
 * preference, warm dot = doesn't. Built from matchBreakdown().
 */
export function MatchBreakdownList({ listing, prefs }: { listing: Listing; prefs: RenterPreferences }) {
  const b = matchBreakdown(listing, prefs);
  const rows = [
    ...b.highlights,
    {
      label: b.distance.ok ? `${b.distance.miles} mi away` : `${b.distance.miles} mi, past your ${b.distance.max} mi`,
      ok: b.distance.ok,
    },
  ];
  // Matches first, then gaps, so the eye reads "why yes" then "watch out".
  const sorted = [...rows.filter((r) => r.ok), ...rows.filter((r) => !r.ok)];
  return (
    <View style={styles.list}>
      {sorted.map((r) => (
        <View key={r.label} style={styles.row} accessibilityLabel={`${r.label}, ${r.ok ? 'matches' : 'does not match'}`}>
          <View style={[styles.dot, r.ok ? styles.dotOk : styles.dotNo]} />
          <Text variant="bodySm" color={r.ok ? colors.textPrimary : colors.textSecondary} style={styles.label}>
            {r.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 14, flex: 1 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotOk: { backgroundColor: colors.accentMatch },
  dotNo: { backgroundColor: colors.accentDanger, opacity: 0.85 },
});
