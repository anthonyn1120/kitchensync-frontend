import { ScrollView, StyleSheet, View } from 'react-native';
import { CheckCircle2, ShieldCheck } from 'lucide-react-native';
import { PillButton, Text } from '@/components/ui';
import { colors, fonts, radius } from '@/theme';
import { BookingTerms, CANCELLATION_POLICY, HOUSE_RULES } from './chatData';
import { Sheet } from './Sheet';

type Props = {
  visible: boolean;
  onClose: () => void;
  terms: BookingTerms;
  confirmed: boolean;
  onConfirm: () => void;
  onRequestChanges: () => void;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="mono">{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

/** Booking summary: facility, slot, stations, rate × hours = total, policy and house rules. */
export function TermsSheet({ visible, onClose, terms, confirmed, onConfirm, onRequestChanges }: Props) {
  const hours = Number.isInteger(terms.hours) ? terms.hours : terms.hours.toFixed(1);
  return (
    <Sheet visible={visible} onClose={onClose} eyebrow={confirmed ? 'Confirmed Booking' : 'Review Terms'} title={terms.facility}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 16 }}>
        <View style={styles.block}>
          <Row label={terms.counterpartLabel} value={terms.counterpart} />
          <Row label="Date" value={terms.date} />
          <Row label="Time" value={terms.time} />
          <Row label="Stations" value={terms.stations.join(', ')} />
        </View>

        <View style={styles.block}>
          <View style={styles.row}>
            <Text variant="mono">Rate</Text>
            <Text style={styles.value}>
              ${terms.rate}/hr × {hours} hrs
            </Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text variant="mono" color={colors.textPrimary}>
              Total
            </Text>
            <Text style={styles.total}>${terms.total.toLocaleString()}</Text>
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <Text variant="mono">Cancellation Policy</Text>
          <Text variant="bodySm">{CANCELLATION_POLICY}</Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text variant="mono">House Rules</Text>
          {HOUSE_RULES.map((r) => (
            <View key={r} style={styles.rule}>
              <ShieldCheck size={14} color={colors.accentMatch} />
              <Text variant="bodySm" style={{ flex: 1 }}>
                {r}
              </Text>
            </View>
          ))}
        </View>

        {confirmed ? (
          <View style={styles.confirmedBox}>
            <CheckCircle2 size={18} color={colors.accentMatch} />
            <View style={{ flex: 1 }}>
              <Text style={styles.value}>Booking confirmed</Text>
              <Text variant="mono" color={colors.accentMatch}>
                Access code {terms.accessCode}
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ gap: 10, marginTop: 4 }}>
            <PillButton variant="primary" size="lg" label="Confirm Booking" fullWidth onPress={onConfirm} />
            <PillButton size="lg" label="Request Changes" fullWidth onPress={onRequestChanges} />
          </View>
        )}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.black20,
    borderRadius: radius.sm + 8,
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 10,
  },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.white10 },
  value: { flexShrink: 1, textAlign: 'right', fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
  total: { fontFamily: fonts.semibold, fontSize: 20, color: colors.textPrimary, letterSpacing: -0.4 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  confirmedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.sm + 8,
    backgroundColor: colors.accentMatchSoft,
    borderWidth: 1,
    borderColor: 'rgba(163,196,129,0.35)',
  },
});
