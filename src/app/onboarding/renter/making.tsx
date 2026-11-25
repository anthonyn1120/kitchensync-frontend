import { StyleSheet, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { PillButton, Text } from '@/components/ui';
import { Card, Choice, FlowScreen, HeaderLink, Label, Title } from '@/components/demo/ui';
import { photos, productChoices, persona } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors, fonts, radius } from '@/theme';

/** Step 1: business name and what they make. Pre-filled for Tres. */
export default function Making() {
  const { renterPrefs, updateRenterPrefs, permit, updatePermit } = useAppState();
  const ok = renterPrefs.businessName.trim().length > 1 && permit.products.length > 0;
  const isTres = renterPrefs.businessName.trim() === persona.name;

  return (
    <FlowScreen
      eyebrow="Step 1 of 4"
      right={<HeaderLink label="Skip to kitchens" onPress={() => router.push('/onboarding/renter/needs')} />}
      footer={
        <PillButton label="Continue" variant="primary" size="lg" fullWidth disabled={!ok} onPress={() => router.push('/onboarding/renter/permit')} iconRight={<ArrowRight size={18} color={colors.primaryButtonText} />} />
      }
    >
      <Title sub="Tell us what you make and where. We’ll find the right permit and kitchens.">What are you making?</Title>

      <Label>Business name</Label>
      <View style={styles.input}>
        <TextInput
          accessibilityLabel="Business name"
          value={renterPrefs.businessName}
          onChangeText={(businessName) => updateRenterPrefs({ businessName })}
          placeholder="e.g. Wanola Granola"
          placeholderTextColor={colors.textTertiary}
          autoCorrect={false}
          style={styles.inputText}
        />
      </View>

      {isTres && (
        <Card style={styles.persona}>
          <View style={{ flexDirection: 'row', height: 150 }}>
            <Image source={photos.wanolaBag} style={{ flex: 1, backgroundColor: '#E9E9EC' }} contentFit="contain" />
            <Image source={photos.wanolaLogo} style={{ flex: 1.2 }} contentFit="cover" />
          </View>
          <View style={{ padding: 14 }}>
            <Text style={styles.personaName}>{persona.blurb}</Text>
            <Text style={styles.small}>{persona.story}</Text>
          </View>
        </Card>
      )}

      <Label style={{ marginTop: 22 }}>Where are you based?</Label>
      <View style={styles.input}>
        <TextInput
          accessibilityLabel="ZIP code"
          value={renterPrefs.zip === persona.zip ? `${persona.city} ${persona.zip}` : renterPrefs.zip}
          onChangeText={(t) => updateRenterPrefs({ zip: t.replace(/\D/g, '').slice(-5) })}
          placeholder="ZIP code"
          placeholderTextColor={colors.textTertiary}
          style={styles.inputText}
        />
      </View>

      <Label style={{ marginTop: 22 }}>What you make</Label>
      <View style={styles.wrap}>
        {productChoices.map((c) => {
          const on = permit.products.includes(c);
          return <Choice key={c} label={c} on={on} onPress={() => updatePermit({ products: on ? permit.products.filter((x) => x !== c) : [...permit.products, c] })} />;
        })}
      </View>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 54, paddingHorizontal: 18, borderRadius: radius.pill, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.controlBorder, justifyContent: 'center' },
  inputText: { fontFamily: fonts.semibold, fontSize: 17, color: colors.textPrimary, paddingVertical: 12 },
  persona: { padding: 0, overflow: 'hidden', marginTop: 14 },
  photo: { height: 150, backgroundColor: colors.black20 },
  personaName: { fontFamily: fonts.semibold, fontSize: 15.5, lineHeight: 21, color: colors.textPrimary, marginBottom: 2 },
  small: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
