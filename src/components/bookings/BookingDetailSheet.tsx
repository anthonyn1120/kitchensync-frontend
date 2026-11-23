import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import type { Booking } from '@/data/types';
import { colors, fonts, radius } from '@/theme';
import { PillButton, Text } from '@/components/ui';
import { BottomSheet } from './BottomSheet';
import { StatusLabel } from './StatusLabel';

type Props = {
  booking: Booking | null;
  onClose: () => void;
  ratings: Record<string, number>;
  onRate: (bookingId: string, stars: number) => void;
  onBookAgain: (b: Booking) => void;
  onMessageHost: (b: Booking) => void;
};

/** Receipt + rating for past sessions; request summary for pending ones. */
export function BookingDetailSheet({ booking, onClose, ratings, onRate, onBookAgain, onMessageHost }: Props) {
  // Keep showing the last booking while the sheet animates closed.
  const last = useRef(booking);
  if (booking) last.current = booking;
  const shown = booking ?? last.current;
  return (
    <BottomSheet visible={!!booking} onClose={onClose} eyebrow={shown ? sheetEyebrow(shown) : undefined}>
      {shown && <Content booking={shown} rating={ratings[shown.id] ?? 0} onRate={(n) => onRate(shown.id, n)} onBookAgain={onBookAgain} onMessageHost={onMessageHost} />}
    </BottomSheet>
  );
}

function sheetEyebrow(b: Booking) {
  if (b.status === 'pending') return 'Booking Request';
  if (b.status === 'cancelled') return 'Cancelled Session';
  if (b.status === 'confirmed') return 'Upcoming Session';
  return 'Receipt';
}

type ContentProps = Pick<Props, 'onBookAgain' | 'onMessageHost'> & {
  booking: Booking;
  rating: number;
  onRate: (stars: number) => void;
};

function Content({ booking, rating, onRate, onBookAgain, onMessageHost }: ContentProps) {
  const rate = booking.ratePerHour ?? (booking.hours > 0 ? Math.round(booking.total / booking.hours) : 0);
  const subtotal = booking.ratePerHour != null ? booking.ratePerHour * booking.hours : booking.total;
  const cancelled = booking.status === 'cancelled';
  const pending = booking.status === 'pending';

  return (
    <View style={{ gap: 20 }}>
      <View style={styles.header}>
        <Image source={{ uri: booking.photo }} style={styles.photo} contentFit="cover" transition={200} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="h3" numberOfLines={2}>
            {booking.facilityName}
          </Text>
          <Text variant="monoSm">{booking.date}</Text>
          <Text variant="monoSm">{booking.time}</Text>
        </View>
      </View>

      <View style={styles.receipt}>
        <Line label="Host" value={booking.hostName} />
        <Line label="Stations" value={booking.stations} />
        <View style={styles.rule} />
        {cancelled ? (
          <Line label="Session cancelled" value="No charge" mono />
        ) : (
          <>
            <Line label={`${booking.hours} hrs × $${rate}/hr`} value={`$${subtotal.toFixed(2)}`} mono />
            {booking.cleaningFee != null && <Line label="Cleaning fee" value={`$${booking.cleaningFee.toFixed(2)}`} mono />}
          </>
        )}
        <View style={styles.rule} />
        <View style={styles.totalRow}>
          <Text variant="mono">{pending ? 'Est. Total' : 'Total'}</Text>
          <Text style={styles.total}>${(cancelled ? 0 : booking.total).toFixed(2)}</Text>
        </View>
        {!cancelled && !!booking.deposit && (
          <Text variant="bodySm">
            ${booking.deposit} refundable deposit{booking.status === 'completed' ? ', released' : ', held and not charged'}.
          </Text>
        )}
        <View style={styles.statusRow}>
          <StatusLabel status={booking.status} />
          {booking.status === 'confirmed' && booking.accessCode && (
            <Text variant="monoSm" color={colors.accentMatch}>
              Access code {booking.accessCode}
            </Text>
          )}
        </View>
      </View>

      {booking.status === 'completed' && (
        <View style={{ gap: 10, alignItems: 'center' }}>
          <Text variant="mono">Rate this kitchen</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                hitSlop={4}
                style={styles.star}
                accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
                onPress={() => onRate(n)}
              >
                <Star
                  size={28}
                  color={n <= rating ? colors.accentMatch : colors.textTertiary}
                  fill={n <= rating ? colors.accentMatch : 'transparent'}
                  strokeWidth={1.5}
                />
              </Pressable>
            ))}
          </View>
          <Text variant="bodySm" style={{ minHeight: 19 }}>
            {rating > 0 ? `Thanks! You rated ${booking.facilityName} ${rating}/5.` : ' '}
          </Text>
        </View>
      )}

      {booking.status === 'confirmed' ? (
        <PillButton label="Message Host" variant="primary" fullWidth onPress={() => onMessageHost(booking)} />
      ) : pending ? (
        <View style={{ gap: 10 }}>
          <Text variant="bodySm" align="center">
            Waiting for {booking.hostName} to approve. You'll get an access code once it's confirmed.
          </Text>
          <PillButton label="Message Host" variant="primary" fullWidth onPress={() => onMessageHost(booking)} />
        </View>
      ) : (
        <PillButton label="Book Again" variant="primary" size="lg" fullWidth onPress={() => onBookAgain(booking)} />
      )}
    </View>
  );
}

function Line({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.line}>
      <Text variant={mono ? 'mono' : 'bodySm'} style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text style={[styles.value, mono && { fontFamily: fonts.mono }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  photo: { width: 72, height: 72, borderRadius: radius.sm, backgroundColor: colors.black20 },
  receipt: {
    gap: 12,
    padding: 18,
    borderRadius: radius.sm,
    backgroundColor: colors.black20,
    borderWidth: 1,
    borderColor: colors.white05,
  },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  value: { flex: 1, textAlign: 'right', fontFamily: fonts.regular, fontSize: 14, color: colors.textPrimary },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rule: { height: 1, backgroundColor: colors.white08 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontFamily: fonts.mono, fontSize: 22, color: colors.accentMatch },
  star: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
