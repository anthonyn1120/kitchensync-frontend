import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { Image } from 'expo-image';
import type { Booking } from '@/data/types';
import { colors, fonts, radius, springs } from '@/theme';
import { Text } from '@/components/ui';
import { StatusLabel } from './StatusLabel';
import { splitDate } from './dates';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PressRow({ onPress, children, dim }: { onPress: () => void; children: ReactNode; dim?: boolean }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.98, springs.gentle))}
      onPressOut={() => (scale.value = withSpring(1, springs.gentle))}
      onPress={onPress}
      style={[styles.row, dim && { opacity: 0.6 }, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

/** Compact row for upcoming items after the hero (e.g. the pending Le Petit request). */
export function UpcomingRow({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  return (
    <PressRow onPress={onPress}>
      <Image source={{ uri: booking.photo }} style={styles.thumb} contentFit="cover" transition={200} />
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { flex: 1 }]} numberOfLines={1}>
            {booking.facilityName}
          </Text>
          <StatusLabel status={booking.status} />
        </View>
        <Text variant="monoSm" numberOfLines={1}>
          {shortDate(booking.date)} • {booking.time}
        </Text>
        <Text variant="monoSm" numberOfLines={2} style={{ marginTop: 2 }}>
          {costLine(booking)}
        </Text>
        {booking.status === 'confirmed' && booking.accessCode && (
          <Animated.View entering={FadeIn.duration(260)}>
            <Text variant="monoSm" color={colors.accentMatch} numberOfLines={1}>
              Access code {booking.accessCode}
            </Text>
          </Animated.View>
        )}
      </View>
    </PressRow>
  );
}

/** "Thursday, Oct 8" → "Thu, Oct 8" */
const shortDate = (label: string) => label.replace(/^([A-Z][a-z]{2})[a-z]+,/, '$1,');

/** "6 hrs × $45 + $25 cleaning = $295", or just the hours and total for older bookings. */
export function costLine(b: Booking) {
  if (b.ratePerHour != null) {
    const cleaning = b.cleaningFee ? ` + $${b.cleaningFee} cleaning` : '';
    return `${b.hours} hrs × $${b.ratePerHour}${cleaning} = $${b.total}`;
  }
  return `${b.hours} hrs • $${b.total}`;
}

/** .past-item — date column, facility + "4 Hours • Prep Station A", status with dot. */
export function PastItem({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  const { md, year } = splitDate(booking.date);
  return (
    <PressRow onPress={onPress} dim={booking.status === 'cancelled'}>
      <View style={styles.dateCol}>
        <Text style={styles.name}>{md}</Text>
        <Text variant="monoSm">{year}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.name} numberOfLines={1}>
          {booking.facilityName}
        </Text>
        <Text variant="monoSm" numberOfLines={1}>
          {booking.hours} Hours • {booking.stations}
        </Text>
        {booking.status !== 'cancelled' && (
          <Text variant="monoSm" numberOfLines={1}>
            {costLine(booking)}
          </Text>
        )}
      </View>
      <StatusLabel status={booking.status} />
    </PressRow>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(34,62,53,0.04)',
    borderWidth: 1,
    borderColor: colors.white05,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  thumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.black20 },
  dateCol: { width: 58, gap: 2 },
  name: { fontFamily: fonts.regular, fontSize: 14, color: colors.textPrimary },
});
