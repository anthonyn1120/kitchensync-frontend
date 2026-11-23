import { StyleSheet, View } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { CheckCircle2 } from 'lucide-react-native';
import { PillButton, Text } from '@/components/ui';
import type { Conversation } from '@/data/types';
import { colors, fonts, radius } from '@/theme';

type Props = {
  draft: NonNullable<Conversation['draftBooking']>;
  confirmed: boolean;
  accessCode?: string;
  onReview: () => void;
};

/** .booking-card — pinned draft booking with "Review Terms"; turns green once confirmed. */
export function BookingCard({ draft, confirmed, accessCode, onReview }: Props) {
  return (
    <Animated.View layout={LinearTransition.springify()} style={[styles.card, confirmed && styles.confirmed]}>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={styles.labelRow}>
          {confirmed && <CheckCircle2 size={12} color={colors.accentMatch} />}
          <Text variant="mono" color={colors.accentMatch}>
            {confirmed ? `Confirmed${accessCode ? ` · ${accessCode}` : ''}` : draft.label}
          </Text>
        </View>
        <Text style={styles.title}>
          {draft.date} • {draft.time}
        </Text>
        <Text variant="monoSm" numberOfLines={1}>
          {draft.equipment.join(', ')}
        </Text>
      </View>
      <PillButton
        size="sm"
        label={confirmed ? 'View Terms' : 'Review Terms'}
        onPress={onReview}
        style={{ backgroundColor: colors.white10 }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: colors.black20,
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
    borderRadius: radius.card,
  },
  confirmed: { backgroundColor: colors.accentMatchSoft, borderColor: 'rgba(163,196,129,0.35)' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 19, color: colors.textPrimary },
});
