import { StyleSheet, View } from 'react-native';
import { FadeIn } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import type { BookingStatus } from '@/data/types';
import { colors, radius } from '@/theme';
import { Text } from '@/components/ui';

const LABELS: Record<BookingStatus, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/** .status-completed — mono label with a leading dot. Pending gets a neutral outlined pill. */
export function StatusLabel({ status }: { status: BookingStatus }) {
  // Keyed by status so a pending → confirmed flip fades the new label in.
  return (
    <Animated.View key={status} entering={FadeIn.duration(260)}>
      <Label status={status} />
    </Animated.View>
  );
}

function Label({ status }: { status: BookingStatus }) {
  if (status === 'pending') {
    return (
      <View style={styles.pendingPill}>
        <View style={[styles.dot, { backgroundColor: colors.textSecondary, opacity: 1 }]} />
        <Text variant="monoSm" color={colors.textSecondary}>
          {LABELS.pending}
        </Text>
      </View>
    );
  }
  const dotColor =
    status === 'confirmed' ? colors.accentMatch : status === 'cancelled' ? colors.accentDanger : colors.textTertiary;
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text variant="monoSm" color={status === 'confirmed' ? colors.accentMatch : colors.textTertiary}>
        {LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, opacity: 0.6 },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    backgroundColor: colors.white05,
  },
});
