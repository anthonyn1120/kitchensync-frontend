import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { PillButton, Text } from '@/components/ui';
import { Card, Choice, FlowScreen, HeaderLink, Title } from '@/components/demo/ui';
import { makeNowChoices, sellNowChoices, wantSellChoices } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors, fonts } from '@/theme';

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** Permit path 1 of 2: where they make it, where they sell, where they want to sell. */
export default function PermitWhere() {
  const { permit, updatePermit } = useAppState();
  const ok = permit.wantSell.length > 0;

  return (
    <FlowScreen
      eyebrow="Your permit path"
      right={<HeaderLink label="Skip to kitchens" onPress={() => router.push('/onboarding/renter/needs')} />}
      footer={
        <PillButton label="See my permit options" variant="primary" size="lg" fullWidth disabled={!ok} onPress={() => router.push('/onboarding/renter/options')} iconRight={<ArrowRight size={18} color={colors.primaryButtonText} />} />
      }
    >
      <Title sub="So we can show the right permit, in plain English.">Tell us where you are</Title>

      <Card>
        <Text style={styles.q}>Where do you make it now?</Text>
        <Text style={styles.hint}>Pick one</Text>
        <View style={{ gap: 8 }}>
          {makeNowChoices.map((c) => {
            const on = permit.makeNow === c.value;
            return (
              <Pressable key={c.value} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => updatePermit({ makeNow: c.value })} style={[styles.option, on && styles.optionOn]}>
                <Text style={styles.optionTitle}>{c.title}</Text>
                <Text style={styles.optionSub}>{c.sub}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.gap}>
        <Text style={styles.q}>Where do you sell now?</Text>
        <Text style={styles.hint}>Pick all that apply</Text>
        <View style={styles.wrap}>
          {sellNowChoices.map((c) => (
            <Choice key={c} label={c} on={permit.sellNow.includes(c)} onPress={() => updatePermit({ sellNow: toggle(permit.sellNow, c) })} />
          ))}
        </View>
      </Card>

      <Card style={styles.gap}>
        <Text style={styles.q}>Where do you want to sell?</Text>
        <Text style={styles.hint}>Pick all that apply</Text>
        <View style={styles.wrap}>
          {wantSellChoices.map((c) => (
            <Choice key={c} label={c} on={permit.wantSell.includes(c)} onPress={() => updatePermit({ wantSell: toggle(permit.wantSell, c) })} />
          ))}
        </View>
      </Card>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: 12 },
  q: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 19, lineHeight: 24, color: colors.textPrimary },
  hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textTertiary, marginTop: 2, marginBottom: 12 },
  option: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 16, borderWidth: 1.5, borderColor: colors.controlBorder, backgroundColor: colors.controlBg },
  optionOn: { borderColor: colors.primaryButtonBg, borderWidth: 2, backgroundColor: '#FFFFFF' },
  optionTitle: { fontFamily: fonts.semibold, fontSize: 15.5, lineHeight: 21, color: colors.textPrimary },
  optionSub: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
