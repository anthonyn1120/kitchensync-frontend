import { type Ref, useEffect, useImperativeHandle, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { FadeIn, FadeOut, FadeOutRight, LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import { router } from 'expo-router';
import { ChevronDown, Inbox } from 'lucide-react-native';
import { Avatar, Text } from '@/components/ui';
import type { RenterRequest } from '@/data/types';
import { useAppState } from '@/store/AppState';
import { colors, fonts, radius } from '@/theme';
import { DeclineSheet } from './DeclineSheet';
import { RequestCard } from './RequestCard';
import { RequestDetailSheet } from './RequestDetailSheet';
import { SectionHeader } from './SectionHeader';
import { StatusBadge } from './StatusBadge';
import { enterUp, STAGGER } from '@/components/ui/motion';
import { easeOut } from './motion';

const SHEET_SWAP_MS = 260;
const layout = LinearTransition.duration(240);

export type RenterRequestsHandle = {
  /** Play the card's approve animation (success haptic), then mark approved and toast. */
  approve: (id: string) => void;
  /** Open the request's detail sheet. */
  open: (id: string) => void;
};

/** "Renter Requests": pending cards, detail + decline sheets, and a collapsible "Recently handled" list. */
export function RenterRequests({
  toast,
  ref,
}: {
  toast: (text: string, tone?: 'success' | 'info') => void;
  ref?: Ref<RenterRequestsHandle>;
}) {
  const { requests, setRequestStatus, conversations } = useAppState();
  const pending = requests.filter((r) => r.status === 'pending');
  const handled = requests.filter((r) => r.status !== 'pending');

  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [declineId, setDeclineId] = useState<string | null>(null);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [showHandled, setShowHandled] = useState(false);
  const [approving, setApproving] = useState<string[]>([]);

  const detail = requests.find((r) => r.id === detailId) ?? null;
  const declining = requests.find((r) => r.id === declineId) ?? null;

  const openDetail = (r: RenterRequest) => {
    setDetailId(r.id);
    setDetailOpen(true);
  };
  const askDecline = (r: RenterRequest) => {
    setDeclineId(r.id);
    setDeclineOpen(true);
  };

  const approve = (r: RenterRequest) => {
    setApproving((ids) => ids.filter((id) => id !== r.id));
    setRequestStatus(r.id, 'approved');
    toast(`Approved — ${r.brandName} notified`);
  };
  /** Approve from outside the card: the card plays its animation and calls `approve` when done. */
  const signalApprove = (id: string) => setApproving((ids) => (ids.includes(id) ? ids : [...ids, id]));

  useImperativeHandle(ref, () => ({
    approve: signalApprove,
    open: (id) => {
      const r = requests.find((x) => x.id === id);
      if (r) openDetail(r);
    },
  }));
  const decline = (r: RenterRequest) => {
    setDeclineOpen(false);
    setRequestStatus(r.id, 'declined');
    toast(`Declined — ${r.brandName} notified`, 'info');
  };

  const message = (r: RenterRequest) => {
    setDetailOpen(false);
    const conv = conversations.host.find((c) => c.withName === r.brandName);
    setTimeout(() => router.push(conv ? `/host/messages/${conv.id}` : '/host/messages'), SHEET_SWAP_MS);
  };

  return (
    <View>
      <SectionHeader
        title="Renter Requests"
        right={
          <Animated.View key={pending.length} entering={FadeIn.duration(250)}>
            <Text variant="mono" color={pending.length ? colors.accentMatch : undefined}>
              {pending.length} Pending
            </Text>
          </Animated.View>
        }
      />

      <View style={{ gap: 12 }}>
        {pending.map((r, i) => (
          <Animated.View
            key={r.id}
            entering={enterUp(200 + i * STAGGER)}
            exiting={FadeOutRight.duration(280)}
            layout={layout}
          >
            <RequestCard
              request={r}
              onOpen={() => openDetail(r)}
              onDecline={() => askDecline(r)}
              onApproved={() => approve(r)}
              approveSignal={approving.includes(r.id)}
            />
          </Animated.View>
        ))}
        {pending.length === 0 && (
          <Animated.View entering={FadeIn.delay(250)} layout={layout} style={styles.empty}>
            <Inbox size={20} color={colors.textTertiary} />
            <Text variant="bodySm" align="center">You're all caught up. New requests will show up here.</Text>
          </Animated.View>
        )}
      </View>

      {handled.length > 0 && (
        <Animated.View layout={layout} entering={FadeIn} style={styles.handled}>
          <HandledHeader count={handled.length} open={showHandled} onToggle={() => setShowHandled((v) => !v)} />
          {showHandled && (
            <Animated.View entering={enterUp()} exiting={FadeOut.duration(150)} style={{ gap: 8, marginTop: 8 }}>
              {handled.map((r) => (
                <Pressable key={r.id} onPress={() => openDetail(r)} style={({ pressed }) => [styles.handledRow, pressed && { opacity: 0.7 }]}>
                  <Avatar uri={r.brandPhoto} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text variant="label" numberOfLines={1}>{r.brandName}</Text>
                    <Text variant="monoSm" style={{ marginTop: 2 }}>{r.date}</Text>
                  </View>
                  <StatusBadge status={r.status} />
                </Pressable>
              ))}
            </Animated.View>
          )}
        </Animated.View>
      )}

      <RequestDetailSheet
        request={detail}
        visible={detailOpen}
        onClose={() => setDetailOpen(false)}
        onMessage={message}
        onApprove={(r) => {
          setDetailOpen(false);
          setTimeout(() => signalApprove(r.id), SHEET_SWAP_MS);
        }}
        onDecline={(r) => {
          setDetailOpen(false);
          setTimeout(() => askDecline(r), SHEET_SWAP_MS);
        }}
        onReopen={(r) => {
          setDetailOpen(false);
          setRequestStatus(r.id, 'pending');
          toast(`${r.brandName} moved back to pending`, 'info');
        }}
      />
      <DeclineSheet request={declining} visible={declineOpen} onCancel={() => setDeclineOpen(false)} onConfirm={decline} />
    </View>
  );
}

function HandledHeader({ count, open, onToggle }: { count: number; open: boolean; onToggle: () => void }) {
  const rot = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    rot.value = withTiming(open ? 1 : 0, easeOut);
  }, [open, rot]);
  const chevron = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value * 180}deg` }] }));
  return (
    <Pressable
      onPress={onToggle}
      style={styles.handledHeader}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
    >
      <Text variant="mono">Recently handled</Text>
      <Text style={styles.count}>{count}</Text>
      <Animated.View style={[{ marginLeft: 'auto' }, chevron]}>
        <ChevronDown size={16} color={colors.textTertiary} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    gap: 8,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.white12,
  },
  handled: { marginTop: 16 },
  handledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: radius.sm + 4,
    backgroundColor: colors.white05,
  },
  count: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textSecondary,
    backgroundColor: colors.white10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  handledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(34,62,53,0.04)',
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
  },
});
