import { StyleSheet, View } from 'react-native';
import { PillButton, Text } from '@/components/ui';
import { colors, fonts } from '@/theme';
import { BottomSheet } from './BottomSheet';

const RULES: { title: string; body: string }[] = [
  { title: 'Arrive on time', body: 'Your access code works from 15 minutes before your slot. Check in at the side entrance keypad.' },
  { title: 'Nut-free facility', body: 'No tree nuts or peanuts on premises, including packaged snacks.' },
  { title: 'Clean as you go', body: 'Sanitize stations and wash all smallwares before your session ends. Leave 20 minutes for breakdown.' },
  { title: 'Label everything', body: 'Anything left in the walk-in needs your brand name, contents and date. Unlabeled items are discarded.' },
  { title: 'Equipment care', body: 'Deck oven max 550°F. Report any faults to the host right away; don\'t attempt repairs.' },
  { title: 'Hard stop', body: 'The next renter arrives at 12:00 PM. Overtime is billed at 1.5× and must be approved by the host.' },
];

export function GuidelinesSheet({ visible, onClose, facilityName }: { visible: boolean; onClose: () => void; facilityName: string }) {
  return (
    <BottomSheet visible={visible} onClose={onClose} eyebrow="House Rules" title={facilityName}>
      <View style={{ gap: 4 }}>
        {RULES.map((r, i) => (
          <View key={r.title} style={[styles.rule, i < RULES.length - 1 && styles.divider]}>
            <Text variant="monoSm" color={colors.accentMatch} style={{ width: 22, paddingTop: 2 }}>
              {String(i + 1).padStart(2, '0')}
            </Text>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.title}>{r.title}</Text>
              <Text variant="bodySm">{r.body}</Text>
            </View>
          </View>
        ))}
      </View>
      <PillButton label="Got It" variant="primary" fullWidth onPress={onClose} style={{ marginTop: 20 }} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  rule: { flexDirection: 'row', gap: 12, paddingVertical: 14 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.white08 },
  title: { fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
});
