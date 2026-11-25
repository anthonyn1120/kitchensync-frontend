import { router, useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import { PillButton, Text } from '@/components/ui';
import { ReadyChecklist } from '@/components/demo/ReadyChecklist';
import { FlowScreen, Title } from '@/components/demo/ui';
import { getDemoListing } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors } from '@/theme';

/** Last step before sending: the permit checklist for this kitchen. */
export default function GetReady() {
  const p = useLocalSearchParams<{ id: string; date: string; time: string; hours: string; cold: string; total: string }>();
  const { sendDemoRequest } = useAppState();
  const listing = getDemoListing(p.id);

  if (!listing) {
    return (
      <FlowScreen eyebrow="Get ready">
        <Text variant="body">That kitchen isn’t in the demo.</Text>
      </FlowScreen>
    );
  }

  const send = () => {
    const rid = sendDemoRequest({
      listingId: listing.id,
      mode: 'book',
      date: p.date ?? '',
      time: p.time ?? '',
      hours: Number(p.hours) || 0,
      coldStorage: p.cold === '1',
      total: Number(p.total) || 0,
    });
    router.dismissAll();
    router.replace(`/confirmed?rid=${rid}`);
  };

  return (
    <FlowScreen
      eyebrow="Get ready"
      footer={
        <PillButton
          label="Send booking request"
          variant="primary"
          size="lg"
          fullWidth
          haptic="success"
          onPress={send}
          iconRight={<Send size={17} color={colors.primaryButtonText} />}
        />
      }
    >
      <Title sub="Send your request now and finish these before your first shift.">Before you cook here</Title>
      <ReadyChecklist listing={listing} />
    </FlowScreen>
  );
}
