import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ArrowLeftRight, RotateCcw } from 'lucide-react-native';
import { PillButton, Screen, Text } from '@/components/ui';
import { persona, photos } from '@/data/demo';
import type { Role } from '@/data/types';
import { useAppState } from '@/store/AppState';
import { colors, fonts } from '@/theme';
import { Card, Label, SampleTag } from './ui';

/** Profile tab for both sides: who you are in the demo, switch sides, or start the demo over. */
export function Profile({ side }: { side: Role }) {
  const { permit, needs, hostSetup, renterPrefs, switchMode, restartDemo } = useAppState();
  const renter = side === 'renter';

  return (
    <Screen withTabBar scroll>
      <Text style={styles.title}>Profile</Text>

      {renter ? (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', height: 170 }}>
            <Image source={photos.wanolaBag} style={{ flex: 1, backgroundColor: '#E9E9EC' }} contentFit="contain" />
            <Image source={photos.wanolaLogo} style={{ flex: 1.2 }} contentFit="cover" />
          </View>
          <View style={{ padding: 16 }}>
            <Text style={styles.name}>{renterPrefs.businessName || persona.name}</Text>
            <Text style={styles.small}>{persona.blurb}</Text>
            <Text style={[styles.small, { marginTop: 8 }]}>{persona.story}</Text>
          </View>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Image source={photos.nvcKitchen} style={{ height: 170 }} contentFit="cover" contentPosition={{ top: '62%' }} />
          <View style={{ padding: 16, gap: 6 }}>
            <SampleTag />
            <Text style={styles.name}>{hostSetup.facilityName}</Text>
            <Text style={styles.small}>
              Open to renters {hostSetup.days.join(', ')} · {hostSetup.hours} · ${hostSetup.ratePerHour}/hr
            </Text>
          </View>
        </Card>
      )}

      {renter && (
        <>
          <Label style={{ marginTop: 22 }}>Your answers</Label>
          <Card style={{ gap: 10 }}>
            <Fact label="Makes" value={permit.products.join(', ') || 'Not set'} />
            <Fact label="Makes it" value={permit.makeNow === 'home' ? 'Home kitchen (cottage food permit)' : permit.makeNow === 'licensed' ? 'Licensed commercial kitchen' : 'Nowhere yet'} />
            <Fact label="Wants to sell" value={permit.wantSell.join(', ') || 'Not set'} />
            <Fact label="Kitchen needs" value={[...needs.equipment, needs.coldStorage ? 'Cold storage' : null, `${needs.hours} hrs or less`].filter(Boolean).join(', ')} />
          </Card>
        </>
      )}

      <View style={{ gap: 10, marginTop: 22 }}>
        <PillButton
          label={renter ? 'Switch to kitchen-owner view' : 'Switch to food-business view'}
          variant="primary"
          size="lg"
          fullWidth
          icon={<ArrowLeftRight size={18} color={colors.primaryButtonText} />}
          onPress={() => {
            switchMode();
            router.replace(renter ? '/host/dashboard' : '/renter/find-space');
          }}
        />
        <PillButton
          label="Restart demo"
          size="lg"
          fullWidth
          icon={<RotateCcw size={17} color={colors.textPrimary} />}
          onPress={() => {
            restartDemo();
            router.replace('/onboarding');
          }}
        />
      </View>
      <Text style={styles.note}>Prototype. Listings, prices and requests are sample data.</Text>
    </Screen>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 30, lineHeight: 36, letterSpacing: -0.4, color: colors.textPrimary, marginTop: 6, marginBottom: 16 },
  name: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 22, lineHeight: 27, color: colors.textPrimary },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  factLabel: { fontFamily: fonts.semibold, fontSize: 11.5, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textTertiary },
  factValue: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: colors.textPrimary },
  note: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, color: colors.textTertiary, textAlign: 'center', marginTop: 18 },
});
