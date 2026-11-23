import { View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Text } from '@/components/ui';
import type { RenterRequest } from '@/data/types';
import { colors, radius } from '@/theme';

/** Approved / Declined pill: icon + mono label, so status never relies on color alone. */
export function StatusBadge({ status }: { status: RenterRequest['status'] }) {
  const approved = status === 'approved';
  const tint = approved ? colors.accentMatch : status === 'declined' ? colors.accentDanger : colors.textTertiary;
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: approved ? 'rgba(163,196,129,0.35)' : 'rgba(226,125,96,0.35)',
        backgroundColor: approved ? colors.accentMatchSoft : 'rgba(226,125,96,0.12)',
      }}
    >
      {approved ? <Check size={11} color={tint} strokeWidth={3} /> : <X size={11} color={tint} strokeWidth={3} />}
      <Text variant="monoSm" color={tint}>{status}</Text>
    </View>
  );
}
