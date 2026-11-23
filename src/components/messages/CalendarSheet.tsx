import { ScrollView, StyleSheet, View } from 'react-native';
import { CalendarDays } from 'lucide-react-native';
import { Avatar, PillButton, Text } from '@/components/ui';
import { colors, fonts, radius } from '@/theme';
import type { Session } from './chatData';
import { Sheet } from './Sheet';

export type CalendarGroup = { key: string; name: string; avatar: string; sessions: Session[] };

type Props = {
  visible: boolean;
  onClose: () => void;
  groups: CalendarGroup[];
  /** Shown when a single partner has no sessions yet */
  onPropose?: () => void;
};

const statusColor = (s: string) =>
  /confirm|in progress/i.test(s) ? colors.accentMatch : /maint/i.test(s) ? colors.accentDanger : colors.textSecondary;

/** "Shared Calendar" — upcoming sessions with one partner (chat) or everyone (list). */
export function CalendarSheet({ visible, onClose, groups, onPropose }: Props) {
  const single = groups.length === 1;
  const total = groups.reduce((n, g) => n + g.sessions.length, 0);
  return (
    <Sheet visible={visible} onClose={onClose} eyebrow={single ? groups[0].name : 'All Partners'} title="Shared Calendar">
      <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 18 }}>
        {total === 0 && (
          <View style={styles.empty}>
            <CalendarDays size={22} color={colors.textTertiary} />
            <Text variant="bodySm" align="center">
              No upcoming sessions yet.
            </Text>
            {onPropose && <PillButton size="sm" label="Propose time" onPress={onPropose} />}
          </View>
        )}
        {groups
          .filter((g) => g.sessions.length > 0)
          .map((g) => (
            <View key={g.key} style={{ gap: 8 }}>
              {!single && (
                <View style={styles.groupHead}>
                  <Avatar emoji={g.avatar} size={28} />
                  <Text variant="label">{g.name}</Text>
                </View>
              )}
              {g.sessions.map((s) => (
                <View key={s.id} style={styles.session}>
                  <View style={styles.dateBox}>
                    <Text variant="monoSm" color={colors.textSecondary}>
                      {s.date.split(',')[0].slice(0, 3)}
                    </Text>
                    <Text style={styles.dateNum}>{s.date.match(/\d+/)?.[0] ?? '—'}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={styles.time}>{s.time}</Text>
                    <Text variant="monoSm" numberOfLines={1}>
                      {s.title}
                    </Text>
                  </View>
                  <Text variant="monoSm" color={statusColor(s.status)}>
                    {s.status}
                  </Text>
                </View>
              ))}
            </View>
          ))}
      </ScrollView>
    </Sheet>
  );
}


const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  session: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: radius.sm + 4,
    backgroundColor: colors.white05,
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
  },
  dateBox: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.black20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNum: { fontFamily: fonts.medium, fontSize: 17, color: colors.textPrimary },
  time: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
});
