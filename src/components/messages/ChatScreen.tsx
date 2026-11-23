import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { CalendarDays, ChevronLeft } from 'lucide-react-native';
import { Avatar, GlassPanel, IconButton, NavHeader, PillButton, Screen, Text } from '@/components/ui';
import { BookingFlowSheet } from '@/components/booking-flow';
import { getListing } from '@/data/mock';
import { useAppState } from '@/store/AppState';
import { colors, radius } from '@/theme';
import { ActionSheet } from './ActionSheet';
import { BookingCard } from './BookingCard';
import { CalendarSheet } from './CalendarSheet';
import { Composer } from './Composer';
import { MessageBubble } from './MessageBubble';
import { TermsSheet } from './TermsSheet';
import { TypingBubble } from './TypingBubble';
import { buildRows, chatStore, getSessions, getTerms, ListRow, nowTime, Side, simulateReply } from './chatData';
import { useChat } from './useChat';

/**
 * Set to true once GlassTabBar returns null when the focused route's
 * options.tabBarStyle has display: 'none' (see report). Until then the
 * composer sits above the floating tab bar instead of being covered by it.
 */
const TAB_BAR_HIDES_IN_CHAT = true;
const FLOATING_TAB_BAR_HEIGHT = 68; // GlassTabBar: 6px padding + ~56px item

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function ChatScreen({ side, id }: { side: Side; id: string }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { sendMessage, markRead, bookings } = useAppState();
  const { conv, items, typing, confirmed } = useChat(side, id);

  const [draft, setDraft] = useState('');
  const [sheet, setSheet] = useState<'terms' | 'calendar' | 'actions' | 'book' | null>(null);
  const [keyboardUp, setKeyboardUp] = useState(false);
  const listRef = useRef<FlatList<ListRow>>(null);
  const inputRef = useRef<TextInput>(null);
  const countRef = useRef(0);
  countRef.current = conv?.messages.length ?? 0;
  const mountedAt = useRef(Date.now());

  // Hide the floating tab bar while this pushed screen is focused; restore on blur.
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => parent?.setOptions({ tabBarStyle: undefined });
    }, [navigation]),
  );

  useEffect(() => {
    if (conv && conv.unread > 0) markRead(side, id);
  }, [conv, side, id, markRead]);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const a = Keyboard.addListener(showEvt, () => {
      setKeyboardUp(true);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
    });
    const b = Keyboard.addListener(hideEvt, () => setKeyboardUp(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);

  // Note a booking made from this chat in the thread once it lands in the store.
  const [justBooked, setJustBooked] = useState<string | null>(null);
  useEffect(() => {
    const bk = justBooked && bookings.find((x) => x.id === justBooked);
    if (!bk) return;
    setJustBooked(null);
    chatStore.add(side, id, countRef.current, {
      kind: 'system',
      id: `s${Date.now()}`,
      tone: 'info',
      text: `You requested ${bk.date.replace(/^(\w{3})\w*/, '$1')} · ${bk.time}`,
    });
  }, [justBooked, bookings, side, id]);

  const rows = useMemo(() => buildRows(items), [items]);
  const terms = useMemo(() => (conv ? getTerms(side, conv) : null), [conv, side]);
  const sessions = useMemo(() => (conv ? getSessions(side, conv, confirmed, bookings) : []), [conv, side, confirmed, bookings]);

  if (!conv) {
    return (
      <Screen>
        <NavHeader label="Messages" />
        <Text variant="body">This conversation is no longer available.</Text>
      </Screen>
    );
  }

  const reply = (prompt: string) => simulateReply(side, id, prompt, () => countRef.current);
  const addLocal = (item: Parameters<typeof chatStore.add>[3]) => chatStore.add(side, id, countRef.current, item);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage(side, id, text);
    setDraft('');
    reply(text);
  };

  const confirmBooking = () => {
    if (!terms) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    chatStore.patch(side, id, () => ({ confirmed: true }));
    addLocal({ kind: 'system', id: `s${Date.now()}`, tone: 'success', text: `Booking confirmed · Access code ${terms.accessCode}` });
    setSheet(null);
    reply('confirmed');
  };

  const requestChanges = () => {
    setSheet(null);
    setDraft('Could we adjust the booking? ');
    setTimeout(() => inputRef.current?.focus(), 350);
  };

  const share = async (kind: 'photo' | 'document') => {
    setSheet(null);
    await wait(350); // let the sheet's modal dismiss before presenting the picker
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: kind === 'photo' ? 'image/*' : ['application/pdf', '*/*'],
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.[0]) return;
      const a = res.assets[0];
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      addLocal({
        kind: 'attachment',
        id: `a${Date.now()}`,
        from: 'me',
        attachment: kind,
        name: a.name,
        size: a.size,
        uri: kind === 'photo' ? a.uri : undefined,
        time: nowTime(),
      });
      reply(kind === 'photo' ? 'photo' : 'document');
    } catch {
      addLocal({ kind: 'system', id: `s${Date.now()}`, tone: 'info', text: 'Could not open the file picker' });
    }
  };

  const propose = (slot: { date: string; time: string }) => {
    setSheet(null);
    addLocal({ kind: 'system', id: `s${Date.now()}`, tone: 'info', text: `You proposed ${slot.date} · ${slot.time}` });
    reply('time');
  };

  // Renters can request a booking straight from the chat; questions stay in the thread.
  const canBook = side === 'renter' && !!conv.listingId;
  const openBooking = () => {
    Keyboard.dismiss();
    setSheet('book');
  };

  const composerPad = keyboardUp
    ? 10
    : TAB_BAR_HIDES_IN_CHAT
      ? insets.bottom + 8
      : Math.max(insets.bottom, 12) + FLOATING_TAB_BAR_HEIGHT + 10;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.flex, { paddingTop: insets.top + 4 }]}>
        <GlassPanel blur radius={radius.card + 4} style={styles.headerPanel} contentStyle={styles.headerContent}>
          <View style={styles.headerRow}>
            <IconButton onPress={() => (router.canGoBack() ? router.back() : router.replace(`/${side}/messages`))}>
              <ChevronLeft size={20} color={colors.textPrimary} />
            </IconButton>
            <Avatar emoji={conv.withAvatar} size={44} online={conv.online} />
            <View style={styles.flex}>
              <Text variant="title" numberOfLines={1}>
                {conv.withName}
              </Text>
              <Text variant="monoSm" color={conv.online ? colors.accentMatch : colors.textTertiary} style={{ marginTop: 3 }}>
                {typing ? '● Typing…' : conv.online ? '● Active Now' : '○ Away'}
              </Text>
            </View>
            <IconButton onPress={() => setSheet('calendar')}>
              <CalendarDays size={18} color={colors.textPrimary} />
            </IconButton>
            {canBook && <PillButton label="Book" variant="primary" size="sm" onPress={openBooking} style={styles.bookPill} />}
          </View>
          {conv.draftBooking && (
            <BookingCard
              draft={conv.draftBooking}
              confirmed={confirmed}
              accessCode={terms?.accessCode}
              onReview={() => setSheet('terms')}
            />
          )}
        </GlassPanel>

        <FlatList
          ref={listRef}
          data={rows}
          keyExtractor={(r) => r.key}
          style={styles.flex}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={() => {
            const animated = Date.now() - mountedAt.current > 400;
            listRef.current?.scrollToEnd({ animated });
            // On web the last row can finish laying out after this fires; scroll again once it has.
            if (Platform.OS === 'web') setTimeout(() => listRef.current?.scrollToEnd({ animated }), 150);
          }}
          renderItem={({ item: row }) =>
            row.type === 'day' ? (
              <View style={styles.day}>
                <View style={styles.dayLine} />
                <Text variant="monoSm">{row.label}</Text>
                <View style={styles.dayLine} />
              </View>
            ) : (
              <MessageBubble item={row.item} showTime={row.showTime} time={row.time} />
            )
          }
          ListFooterComponent={typing ? <TypingBubble /> : null}
          ListEmptyComponent={typing ? null : <EmptyChat side={side} listingId={conv.listingId} name={conv.withName} />}
        />

        <Composer
          ref={inputRef}
          value={draft}
          onChange={setDraft}
          onSend={send}
          onPlus={() => {
            Keyboard.dismiss();
            setSheet('actions');
          }}
          placeholder={`Message ${conv.withName.replace(/\.$/, '')}...`}
          bottomPadding={composerPad}
        />
      </View>

      {terms && (
        <TermsSheet
          visible={sheet === 'terms'}
          onClose={() => setSheet(null)}
          terms={terms}
          confirmed={confirmed}
          onConfirm={confirmBooking}
          onRequestChanges={requestChanges}
        />
      )}
      <CalendarSheet
        visible={sheet === 'calendar'}
        onClose={() => setSheet(null)}
        groups={[{ key: conv.id, name: conv.withName, avatar: conv.withAvatar, sessions }]}
        onPropose={() => setSheet('actions')}
      />
      {canBook && conv.listingId && (
        <BookingFlowSheet
          listingId={conv.listingId}
          visible={sheet === 'book'}
          onClose={() => setSheet(null)}
          onBooked={setJustBooked}
        />
      )}
      <ActionSheet
        visible={sheet === 'actions'}
        onClose={() => setSheet(null)}
        onPhoto={() => share('photo')}
        onDocument={() => share('document')}
        onPropose={propose}
      />
    </KeyboardAvoidingView>
  );
}

/** A brand-new thread (renter tapped Message on a kitchen): a nudge on what to ask. */
function EmptyChat({ side, listingId, name }: { side: Side; listingId?: string; name: string }) {
  const listing = listingId ? getListing(listingId) : undefined;
  const host = listing?.hostName.split(' ')[0];
  return (
    <View style={styles.empty}>
      <Text variant="title" align="center">
        {host ? `Say hi to ${host}` : `Start a conversation with ${name}`}
      </Text>
      <Text variant="bodySm" align="center">
        {side === 'renter'
          ? 'Ask about equipment, access or a walkthrough before you request a time.'
          : 'Introduce yourself and share what you have open.'}
      </Text>
      {listing && (
        <Text variant="monoSm" align="center" style={{ marginTop: 4 }}>
          {listing.responseTime}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerPanel: { marginHorizontal: 12 },
  headerContent: { padding: 12, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bookPill: { minHeight: 40, paddingHorizontal: 16 },
  list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, gap: 10 },
  empty: { alignItems: 'center', gap: 6, paddingHorizontal: 24, paddingTop: 48 },
  day: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 },
  dayLine: { flex: 1, height: 1, backgroundColor: colors.white10 },
});
