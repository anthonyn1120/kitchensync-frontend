import { StyleSheet, View } from 'react-native';
import { GlassPanel, SectionTitle, Text } from '@/components/ui';
import { hostSchedule, TODAY_LABEL } from '@/data/mock';
import type { ScheduleSlot } from '@/data/types';
import { colors, fonts, radius } from '@/theme';

/** Today's schedule: .calendar-preview with .upcoming-slot rows. */
export function TodaySchedule() {
  return (
    <GlassPanel radius={radius.card} contentStyle={{ padding: 20 }}>
      <SectionTitle right={<Text variant="monoSm">{hostSchedule.length} Slots</Text>}>Today's Schedule</SectionTitle>
      <View style={styles.preview}>
        <Text variant="monoSm" style={{ opacity: 0.6 }}>{TODAY_LABEL}</Text>
        {hostSchedule.map((slot) => (
          <Slot key={slot.id} slot={slot} />
        ))}
      </View>
    </GlassPanel>
  );
}

function Slot({ slot }: { slot: ScheduleSlot }) {
  const live = slot.status === 'In Progress';
  return (
    <View style={[styles.slot, slot.status === 'Maintenance' && { opacity: 0.6 }, live && styles.slotLive]}>
      <Text style={styles.time}>{slot.time}</Text>
      <View style={{ flex: 1 }}>
        <Text variant="label" style={{ fontSize: 14 }}>{slot.title}</Text>
        <View style={styles.statusRow}>
          {live && <View style={styles.dot} />}
          <Text variant="monoSm" color={live ? colors.accentMatch : undefined}>{slot.status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: { backgroundColor: 'rgba(34,62,53,0.05)', borderRadius: 20, padding: 16, gap: 12 },
  slot: { flexDirection: 'row', gap: 12, padding: 12, backgroundColor: colors.white05, borderRadius: radius.sm },
  slotLive: { borderWidth: 1, borderColor: 'rgba(163,196,129,0.25)' },
  time: { width: 52, fontFamily: fonts.mono, fontSize: 13, color: colors.textTertiary, paddingTop: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accentMatch },
});
