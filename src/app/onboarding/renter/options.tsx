import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Check, DollarSign, X } from 'lucide-react-native';
import { PillButton, Text } from '@/components/ui';
import { Card, FlowScreen, GuidanceNote, HeaderLink, Title } from '@/components/demo/ui';
import { needsProcessorLicense, permitOptions } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors, fonts, radius } from '@/theme';

type Option = typeof permitOptions.cottage;

/** Permit path: the two WSDA options side by side, with the one that matches their answers marked as the next step. */
export default function PermitOptions() {
  const { permit } = useAppState();
  const needsLicense = needsProcessorLicense(permit);
  const home = permit.makeNow === 'home';

  return (
    <FlowScreen
      eyebrow="Your permit path · 1 of 2"
      right={<HeaderLink label="Skip to kitchens" onPress={() => router.push('/onboarding/renter/needs')} />}
      footer={
        <PillButton label="What the application needs" variant="primary" size="lg" fullWidth onPress={() => router.push('/onboarding/renter/application')} iconRight={<ArrowRight size={18} color={colors.primaryButtonText} />} />
      }
    >
      <Title sub="Both are issued by Washington State (WSDA). To ship or sell wholesale, you need the second one.">Your two options</Title>

      {permit.makeNow === 'licensed' && (
        <View style={styles.have}>
          <Text style={styles.haveText}>
            <Text style={{ fontFamily: fonts.semibold, color: colors.textPrimary }}>What you have now: </Text>
            a shop with a county food permit typically covers selling to your own customers. Supplying stores and cafés is a separate WSDA license.
          </Text>
        </View>
      )}

      <OptionCard option={permitOptions.cottage} tag={home ? 'What you have now' : undefined} muted={!home && needsLicense} />
      <OptionCard
        option={permitOptions.processor}
        tag={needsLicense ? 'Your next step' : 'Not needed yet'}
        highlight={needsLicense}
        style={{ marginTop: 12 }}
      />

      <Text style={styles.source}>{permitOptions.source}</Text>
      <GuidanceNote />
    </FlowScreen>
  );
}

function OptionCard({ option, tag, highlight, muted, style }: { option: Option; tag?: string; highlight?: boolean; muted?: boolean; style?: object }) {
  return (
    <Card style={[highlight && styles.highlight, muted && { opacity: 0.8 }, style]}>
      {tag && (
        <View style={[styles.tag, highlight && { backgroundColor: colors.primaryButtonBg }]}>
          <Text style={[styles.tagText, highlight && { color: '#FFFFFF' }]}>{tag}</Text>
        </View>
      )}
      <Text style={styles.name}>{option.title}</Text>
      <Text style={styles.sub}>{option.sub}</Text>
      {option.lines.map((l) => (
        <View key={l.text} style={styles.line}>
          {l.ok ? <Check size={16} color={colors.accentMatch} strokeWidth={3} style={styles.icon} /> : <X size={16} color={colors.accentDanger} strokeWidth={3} style={styles.icon} />}
          <Text style={styles.lineText}>{l.text}</Text>
        </View>
      ))}
      <View style={styles.line}>
        <DollarSign size={16} color={colors.textSecondary} strokeWidth={2.5} style={styles.icon} />
        <Text style={styles.lineText}>{option.money}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  have: { padding: 12, borderRadius: 14, backgroundColor: colors.accentMatchSoft, marginBottom: 12 },
  haveText: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },
  highlight: { borderWidth: 2, borderColor: colors.primaryButtonBg },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.controlBg, marginBottom: 10 },
  tagText: { fontFamily: fonts.semibold, fontSize: 10.5, lineHeight: 14, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textSecondary },
  name: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 21, lineHeight: 26, color: colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textTertiary, marginBottom: 8 },
  line: { flexDirection: 'row', gap: 10, paddingVertical: 5 },
  icon: { marginTop: 3 },
  lineText: { flex: 1, fontFamily: fonts.medium, fontSize: 14.5, lineHeight: 21, color: colors.textPrimary },
  source: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.textTertiary, textAlign: 'center', marginTop: 14, marginBottom: 10 },
});
