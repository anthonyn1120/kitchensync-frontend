import { Pressable, StyleSheet, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarPlus, Clock, Copy, MessageSquare, Navigation } from 'lucide-react-native';
import type { Booking } from '@/data/types';
import { colors, fonts, radius, springs } from '@/theme';
import { GlassPanel, PillButton, Text } from '@/components/ui';
import { countdownLabel } from './dates';
import { costLine } from './BookingRows';

type Props = {
  booking: Booking;
  onMessage: () => void;
  onCopyCode: () => void;
  onGuidelines: () => void;
  onDirections: () => void;
  onCalendar: () => void;
};

/** .upcoming-card stacked for phone: photo strip, session details, then the .check-in-box. */
export function UpcomingHero({ booking, onMessage, onCopyCode, onGuidelines, onDirections, onCalendar }: Props) {
  const countdown = countdownLabel(booking.date);
  const codeScale = useSharedValue(1);
  const codeStyle = useAnimatedStyle(() => ({ transform: [{ scale: codeScale.value }] }));

  const copy = () => {
    codeScale.value = withSequence(withSpring(0.96, springs.gentle), withSpring(1, springs.gentle));
    onCopyCode();
  };

  return (
    <GlassPanel tone="secondary" radius={radius.card}>
      <View style={styles.photo}>
        <Image source={{ uri: booking.photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(40,48,40,0.55)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {countdown && (
          <View style={styles.countdown}>
            <Clock size={12} color={colors.primaryButtonText} strokeWidth={2.5} />
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text variant="mono" color={colors.accentMatch} style={{ marginBottom: 8 }}>
          Confirmed
        </Text>
        <Text variant="h2">{booking.facilityName}</Text>

        <View style={styles.details}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date &amp; Time</Text>
            <Text style={styles.infoValue}>
              {booking.date} • {booking.time}
            </Text>
          </View>
          {booking.ratePerHour != null && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cost</Text>
              <Text style={styles.infoValue}>{costLine(booking)}</Text>
              {!!booking.deposit && (
                <Text variant="monoSm">${booking.deposit} deposit held, refunded after checkout</Text>
              )}
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Host Contact</Text>
            <View style={styles.hostRow}>
              <Text style={styles.infoValue}>{booking.hostName}</Text>
              <PillButton
                size="sm"
                label="Message"
                onPress={onMessage}
                icon={<MessageSquare size={12} color={colors.textPrimary} />}
              />
            </View>
          </View>
        </View>

        <View style={styles.checkIn}>
          <Text variant="monoSm">Access Code</Text>
          <Pressable onPress={copy} accessibilityRole="button" accessibilityLabel={`Copy access code ${booking.accessCode}`}>
            <Animated.View style={[styles.codeBox, codeStyle]}>
              <Text style={styles.code}>{booking.accessCode}</Text>
              <Copy size={14} color={colors.accentMatch} style={{ opacity: 0.7 }} />
            </Animated.View>
          </Pressable>
          {booking.accessNote && (
            <Text variant="monoSm" align="center" style={{ lineHeight: 15 }}>
              {booking.accessNote}
            </Text>
          )}
          <PillButton label="View Guidelines" fullWidth onPress={onGuidelines} style={{ marginTop: 4 }} />
        </View>

        <View style={styles.actions}>
          <PillButton
            label="Get Directions"
            size="sm"
            style={{ flex: 1, minHeight: 40 }}
            onPress={onDirections}
            icon={<Navigation size={13} color={colors.textPrimary} />}
          />
          <PillButton
            label="Add to Calendar"
            size="sm"
            style={{ flex: 1, minHeight: 40 }}
            onPress={onCalendar}
            icon={<CalendarPlus size={13} color={colors.textPrimary} />}
          />
        </View>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  photo: { height: 150, backgroundColor: colors.black20 },
  countdown: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMatch,
  },
  countdownText: { fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.primaryButtonText },
  body: { padding: 24 },
  details: { marginTop: 20, gap: 20 },
  infoRow: { gap: 4 },
  infoLabel: { fontFamily: fonts.regular, fontSize: 11, letterSpacing: 0.55, textTransform: 'uppercase', color: colors.textTertiary },
  infoValue: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, color: colors.textPrimary },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  checkIn: {
    marginTop: 24,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.black20,
    borderWidth: 1,
    borderColor: colors.white05,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(163, 196, 129, 0.1)',
  },
  code: { fontFamily: fonts.mono, fontSize: 24, letterSpacing: 4.8, color: colors.accentMatch },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
});
