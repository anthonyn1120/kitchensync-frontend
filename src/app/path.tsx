import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { PillButton, Text } from '@/components/ui';
import { Card, FlowScreen, GuidanceNote, Title } from '@/components/demo/ui';
import { getDemoListing, needsProcessorLicense, pathSteps } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors, fonts } from '@/theme';

const MORE = [
  'The kitchen manager confirms the time. Nothing is booked or charged.',
  'Book hours as you need them. Your price is shown before you send.',
  'WSDA Food Processor License application. We fill in the kitchen’s address and floor plan.',
  'WSDA reviews your water test, your labels, and inspects the kitchen.',
  'Your passing inspection report works as your license until it arrives.',
];

/** After the tour request: the whole path in order, with the step just completed ticked. */
export default function Path() {
  const { demoRequests, permit } = useAppState();
  const tour = demoRequests.find((r) => r.mode === 'tour');
  const listing = getDemoListing(tour?.listingId);
  const [open, setOpen] = useState<number | null>(0);
  const wholesale = needsProcessorLicense(permit);
  // Without shipping or wholesale plans, the WSDA steps don't apply: the path is just tour, then book.
  const steps = wholesale ? pathSteps : pathSteps.slice(0, 2);

  return (
    <FlowScreen
      eyebrow={tour ? 'Tour requested' : 'Your path'}
      hideBack
      footer={
        <>
          <PillButton label="Done" variant="primary" size="lg" fullWidth onPress={() => router.replace('/renter/find-space')} />
          <PillButton label="See my requests" variant="ghost" size="md" fullWidth onPress={() => router.replace('/renter/bookings')} />
        </>
      }
    >
      <Title sub="Everything left, in order. Tap any step for what it involves and who to call.">{wholesale ? 'Your path to shipping' : 'Your path to more capacity'}</Title>

      <Card style={{ paddingVertical: 6 }}>
        {steps.map((s, i) => {
          const done = i === 0 && !!tour;
          const isOpen = open === i;
          const title = i === 0 && listing ? `Tour ${listing.name}` : s.title;
          const detail = i === 0 && tour ? `${tour.date} at ${tour.time} · requested` : s.detail;
          return (
            <Pressable key={s.title} accessibilityRole="button" accessibilityState={{ expanded: isOpen }} onPress={() => setOpen(isOpen ? null : i)} style={[styles.step, i > 0 && styles.border]}>
              <View style={[styles.num, done && styles.numDone]}>{done ? <Check size={15} color="#FFFFFF" strokeWidth={3} /> : <Text style={styles.numText}>{i + 1}</Text>}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{title}</Text>
                <Text style={[styles.small, done && { color: colors.accentMatch, fontFamily: fonts.medium }]}>{detail}</Text>
                {isOpen && <Text style={[styles.small, { marginTop: 6 }]}>{MORE[i]}</Text>}
              </View>
              {isOpen ? <ChevronUp size={18} color={colors.textTertiary} /> : <ChevronDown size={18} color={colors.textTertiary} />}
            </Pressable>
          );
        })}
      </Card>

      {wholesale && (
        <View style={styles.help}>
          <Text style={styles.helpText}>Stuck on a step? We connect you with WSDA Food Safety directly.</Text>
        </View>
      )}

      <View style={{ marginTop: 12 }}>
        <GuidanceNote text="Demo only: no tour was sent to a real kitchen. Confirm your own case with WSDA." />
      </View>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  border: { borderTopWidth: 1, borderTopColor: colors.glassBorderDim },
  num: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.controlBorder, backgroundColor: colors.controlBg, alignItems: 'center', justifyContent: 'center' },
  numDone: { backgroundColor: colors.accentMatch, borderColor: colors.accentMatch },
  numText: { fontFamily: fonts.semibold, fontSize: 12.5, lineHeight: 16, color: colors.textPrimary },
  stepTitle: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 21, color: colors.textPrimary },
  small: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },
  help: { marginTop: 12, padding: 14, borderRadius: 16, backgroundColor: colors.primaryButtonBg },
  helpText: { fontFamily: fonts.semibold, fontSize: 14.5, lineHeight: 21, color: '#FFFFFF' },
});
