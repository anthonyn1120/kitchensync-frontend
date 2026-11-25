import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { PillButton, Text } from '@/components/ui';
import { Card, FlowScreen, GuidanceNote, HeaderLink, Title } from '@/components/demo/ui';
import { applicationSteps } from '@/data/demo';
import { colors, fonts } from '@/theme';

/** Permit path 2 of 2: the five things WSDA asks for, and what Kitchen Sync fills in. */
export default function LicenseApplication() {
  return (
    <FlowScreen
      eyebrow="Your permit path · 2 of 2"
      right={<HeaderLink label="Skip" onPress={() => router.push('/onboarding/renter/needs')} />}
      footer={
        <PillButton label="Choose what you need" variant="primary" size="lg" fullWidth onPress={() => router.push('/onboarding/renter/needs')} iconRight={<ArrowRight size={18} color={colors.primaryButtonText} />} />
      }
    >
      <Title sub="Here’s what WSDA asks for, so nothing surprises you.">The license application</Title>

      <View style={styles.warn}>
        <Text style={styles.warnText}>
          Your license is tied to one kitchen. WSDA licenses the kitchen’s address. To move later, you’d need WSDA’s approval again, so visit before you commit.
        </Text>
      </View>

      <Card style={{ paddingVertical: 6 }}>
        {applicationSteps.map((s, i) => (
          <View key={s.title} style={[styles.step, i > 0 && styles.border]}>
            <View style={styles.num}>
              <Text style={styles.numText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.small}>{s.detail}</Text>
            </View>
          </View>
        ))}
      </Card>

      <View style={styles.prefill}>
        <Text style={styles.prefillText}>We pre-fill your license application form with the kitchen’s details, so you only add what’s yours.</Text>
      </View>

      <Text style={[styles.small, { marginTop: 12, marginBottom: 12 }]}>Heads up: WSDA closes applications that aren’t licensed within 6 months.</Text>
      <GuidanceNote />
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  warn: { padding: 12, borderRadius: 14, backgroundColor: 'rgba(207,113,83,0.12)', marginBottom: 12 },
  warnText: { fontFamily: fonts.medium, fontSize: 13.5, lineHeight: 20, color: '#8A4B2C' },
  step: { flexDirection: 'row', gap: 12, paddingVertical: 11 },
  border: { borderTopWidth: 1, borderTopColor: colors.glassBorderDim },
  num: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: colors.controlBorder, backgroundColor: colors.controlBg, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  numText: { fontFamily: fonts.semibold, fontSize: 12.5, lineHeight: 16, color: colors.textPrimary },
  stepTitle: { fontFamily: fonts.semibold, fontSize: 15.5, lineHeight: 21, color: colors.textPrimary },
  small: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },
  prefill: { marginTop: 12, padding: 14, borderRadius: 16, backgroundColor: colors.primaryButtonBg },
  prefillText: { fontFamily: fonts.semibold, fontSize: 14.5, lineHeight: 21, color: '#FFFFFF' },
});
