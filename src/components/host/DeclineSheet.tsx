import { View } from 'react-native';
import { PillButton, Text } from '@/components/ui';
import type { RenterRequest } from '@/data/types';
import { BottomSheet } from './BottomSheet';

/** Small confirmation sheet shown before a request is declined. */
export function DeclineSheet({
  request,
  visible,
  onCancel,
  onConfirm,
}: {
  request: RenterRequest | null;
  visible: boolean;
  onCancel: () => void;
  onConfirm: (r: RenterRequest) => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onCancel} eyebrow="Confirm" title="Decline request?">
      {request && (
        <View style={{ gap: 20 }}>
          <Text variant="body">
            {request.brandName} will be told {request.date} ({request.time}) isn't available. You can move it back to
            pending later.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <PillButton label="Keep" variant="ghost" size="lg" style={{ flex: 1 }} onPress={onCancel} />
            <PillButton label="Decline" variant="danger" size="lg" style={{ flex: 1 }} onPress={() => onConfirm(request)} />
          </View>
        </View>
      )}
    </BottomSheet>
  );
}
