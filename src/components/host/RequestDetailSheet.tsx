import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Check, MessageSquare, RotateCcw, X } from 'lucide-react-native';
import { Chip, MatchRing, PillButton, Text } from '@/components/ui';
import type { RenterRequest } from '@/data/types';
import { colors, radius } from '@/theme';
import { BottomSheet } from './BottomSheet';
import { MatchBars } from './MatchBars';
import { matchBreakdown } from './matchBreakdown';
import { StatusBadge } from './StatusBadge';

type Props = {
  request: RenterRequest | null;
  visible: boolean;
  onClose: () => void;
  onMessage: (r: RenterRequest) => void;
  onApprove: (r: RenterRequest) => void;
  onDecline: (r: RenterRequest) => void;
  onReopen: (r: RenterRequest) => void;
};

export function RequestDetailSheet({ request, visible, onClose, onMessage, onApprove, onDecline, onReopen }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} eyebrow="Renter Request">
      {request && (
        <View style={{ gap: 20 }}>
          <View style={styles.head}>
            <Image source={{ uri: request.brandPhoto }} style={styles.photo} contentFit="cover" transition={200} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="h3" numberOfLines={2}>{request.brandName}</Text>
              <Text variant="monoSm">{request.date} • {request.time}</Text>
              {request.status !== 'pending' && <StatusBadge status={request.status} />}
            </View>
            <MatchRing score={request.matchScore} size={64} />
          </View>

          <View style={styles.note}>
            <Text variant="mono" style={{ marginBottom: 6 }}>Note from renter</Text>
            <Text variant="body" color={colors.textPrimary}>“{request.note}”</Text>
          </View>

          <View style={styles.tags}>
            {request.tags.map((t) => (
              <Chip key={t} label={t} size="sm" />
            ))}
          </View>

          <View style={{ gap: 12 }}>
            <Text variant="mono">Fit Breakdown</Text>
            <MatchBars items={matchBreakdown(request)} />
          </View>

          <PillButton
            label="Message"
            fullWidth
            icon={<MessageSquare size={16} color={colors.textPrimary} />}
            onPress={() => onMessage(request)}
          />
          {request.status === 'pending' ? (
            <View style={styles.actions}>
              <PillButton
                label="Decline"
                variant="danger"
                style={{ flex: 1 }}
                icon={<X size={16} color={colors.accentDanger} />}
                onPress={() => onDecline(request)}
              />
              <PillButton
                label="Approve"
                variant="primary"
                style={{ flex: 1 }}
                icon={<Check size={16} color={colors.primaryButtonText} />}
                onPress={() => onApprove(request)}
              />
            </View>
          ) : (
            <PillButton
              label="Move back to pending"
              variant="ghost"
              fullWidth
              icon={<RotateCcw size={15} color={colors.textPrimary} />}
              onPress={() => onReopen(request)}
            />
          )}
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  photo: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.black20 },
  note: { backgroundColor: colors.black20, borderRadius: radius.sm + 4, padding: 16 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  actions: { flexDirection: 'row', gap: 10 },
});
