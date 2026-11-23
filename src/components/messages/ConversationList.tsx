import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { router } from 'expo-router';
import { CalendarDays, Search, X } from 'lucide-react-native';
import { Avatar, GlassPanel, PageTitle, PillButton, Screen, Text } from '@/components/ui';
import type { Conversation } from '@/data/types';
import { useAppState } from '@/store/AppState';
import { colors, fonts, radius, springs } from '@/theme';
import { CalendarSheet } from './CalendarSheet';
import { getSessions, keyOf, lastPreview, mergeItems, Side } from './chatData';
import { useAllChatExtras } from './useChat';
import { enterUp, STAGGER } from '@/components/ui/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ConversationRow({ conv, preview, time, onPress }: { conv: Conversation; preview: string; time: string; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const unread = conv.unread > 0;
  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.97, springs.gentle))}
      onPressOut={() => (scale.value = withSpring(1, springs.gentle))}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${conv.withName}${unread ? `, ${conv.unread} unread` : ''}`}
      style={[styles.row, unread && styles.rowUnread, animated]}
    >
      <Avatar emoji={conv.withAvatar} size={44} online={conv.online} />
      <View style={{ flex: 1, gap: 3 }}>
        <View style={styles.rowTop}>
          <Text style={styles.name} numberOfLines={1}>
            {conv.withName}
          </Text>
          {!!time && <Text variant="monoSm">{time}</Text>}
        </View>
        <View style={styles.rowTop}>
          <Text
            style={[styles.preview, unread && { color: colors.textSecondary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {preview}
          </Text>
          {unread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{conv.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

/** Messages tab: search + "Recent Messages" contact cards + "View Shared Calendar". */
export function ConversationList({ side }: { side: Side }) {
  const { conversations, markRead, bookings } = useAppState();
  const extras = useAllChatExtras();
  const [query, setQuery] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const list = conversations[side];

  const rows = useMemo(
    () =>
      list.flatMap((c) => {
        const e = extras[keyOf(side, c.id)];
        const items = mergeItems(c.messages, e?.items ?? []);
        // A thread opened from a kitchen but never written in stays out of the list.
        return items.length ? [{ conv: c, ...lastPreview(items) }] : [];
      }),
    [list, side, extras],
  );
  const q = query.trim().toLowerCase();
  const filtered = q ? rows.filter((r) => r.conv.withName.toLowerCase().includes(q)) : rows;

  const groups = useMemo(
    () =>
      list.map((c) => ({
        key: c.id,
        name: c.withName,
        avatar: c.withAvatar,
        sessions: getSessions(side, c, !!extras[keyOf(side, c.id)]?.confirmed, bookings),
      })),
    [list, side, extras, bookings],
  );

  const open = (id: string) => {
    markRead(side, id);
    router.push(`/${side}/messages/${id}`);
  };

  return (
    <Screen withTabBar scroll>
      <PageTitle eyebrow={side === 'renter' ? 'Renter Mode' : 'Host Mode'} title="Messages" />

      <Animated.View entering={enterUp()} style={styles.search}>
        <Search size={16} color={colors.textTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search conversations"
          placeholderTextColor={colors.textTertiary}
          style={styles.searchInput}
          autoCorrect={false}
          returnKeyType="search"
          keyboardAppearance="dark"
          selectionColor={colors.accentMatch}
        />
        {!!query && (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
            <X size={16} color={colors.textSecondary} />
          </Pressable>
        )}
      </Animated.View>

      <Animated.View entering={enterUp(80)}>
        <GlassPanel radius={radius.card} contentStyle={styles.panel}>
          <Text variant="mono" style={{ paddingLeft: 4, marginBottom: 4 }}>
            Recent Messages
          </Text>
          {filtered.length === 0 ? (
            <Text variant="bodySm" style={{ paddingVertical: 20, paddingHorizontal: 4 }}>
              No conversations match “{query.trim()}”.
            </Text>
          ) : (
            filtered.map((r, i) => (
              <Animated.View key={r.conv.id} entering={enterUp(140 + i * STAGGER)}>
                <ConversationRow conv={r.conv} preview={r.text} time={r.time} onPress={() => open(r.conv.id)} />
              </Animated.View>
            ))
          )}

          <View style={styles.quick}>
            <Text variant="mono" style={{ marginBottom: 12 }}>
              Quick Actions
            </Text>
            <PillButton
              label="View Shared Calendar"
              icon={<CalendarDays size={15} color={colors.textPrimary} />}
              fullWidth
              onPress={() => setCalendarOpen(true)}
              style={{ justifyContent: 'flex-start' }}
            />
          </View>
        </GlassPanel>
      </Animated.View>

      <CalendarSheet visible={calendarOpen} onClose={() => setCalendarOpen(false)} groups={groups} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 46,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    marginBottom: 16,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontFamily: fonts.regular, fontSize: 14, height: '100%' },
  panel: { padding: 16, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.sm + 4,
    backgroundColor: colors.white05,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rowUnread: { backgroundColor: colors.white10, borderColor: colors.glassBorderLight },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
  preview: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: colors.textTertiary },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: colors.accentMatch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.monoMedium, fontSize: 11, color: '#1a2a1a' },
  quick: { marginTop: 10, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.glassBorderDim },
});
