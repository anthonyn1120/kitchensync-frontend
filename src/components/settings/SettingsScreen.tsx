import { StyleSheet, View } from 'react-native';
import Animated from '@/components/ui/Animated';
import type { Role } from '@/data/types';
import { hostProfile, renterProfile } from '@/data/mock';
import { colors, fonts, radius } from '@/theme';
import { Avatar, GlassPanel, Screen, Text } from '@/components/ui';
import { useToast } from '@/components/bookings';
import { useAppState } from '@/store/AppState';
import { DocumentsSection } from './DocumentsSection';
import { NotificationsSection } from './NotificationsSection';
import { EquipmentSection } from './EquipmentSection';
import { PricingSection } from './PricingSection';
import { SecuritySection } from './SecuritySection';
import { ModeSection } from './ModeSection';
import { enterUp } from '@/components/ui/motion';

/** Shared Settings tab. The mockup's 2-column grid becomes one column of .settings-section cards. */
export function SettingsScreen({ side }: { side: Role }) {
  const { renterPrefs, hostSetup } = useAppState();
  const toast = useToast();
  const profile = side === 'host' ? hostProfile : renterProfile;
  const business = side === 'host' ? hostSetup.facilityName : renterPrefs.businessName || profile.businessName;

  let i = 0;
  return (
    <View style={{ flex: 1 }}>
      <Screen withTabBar scroll>
        <Animated.View entering={enterUp()} style={styles.header}>
          <Text variant="mono" style={{ marginBottom: 6 }}>
            {side === 'host' ? 'Host Mode' : 'Renter Mode'}
          </Text>
          <Text style={styles.h1}>Settings</Text>
          <Text variant="mono" color={colors.textSecondary}>
            Profile ID: {profile.profileId}
          </Text>
        </Animated.View>

        <View style={{ gap: 20 }}>
          <Animated.View entering={enterUp(60)}>
            <GlassPanel tone="secondary" radius={radius.card} contentStyle={styles.profile}>
              <Avatar emoji={side === 'host' ? '🥐' : '🌾'} size={52} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.name}>{profile.name}</Text>
                <Text variant="bodySm" numberOfLines={1}>
                  {business}
                </Text>
              </View>
              <View style={styles.verified}>
                <Text variant="monoSm" color={colors.accentMatch}>
                  Verified
                </Text>
              </View>
            </GlassPanel>
          </Animated.View>

          <ModeSection side={side} index={++i} />
          <DocumentsSection side={side} index={++i} onToast={toast.show} />
          <NotificationsSection side={side} index={++i} />
          <EquipmentSection side={side} index={++i} />
          {side === 'host' && <PricingSection index={++i} />}
          <SecuritySection
            index={++i}
            initialEmail={profile.email}
            passwordChanged={profile.passwordChanged}
            onToast={toast.show}
          />
        </View>
      </Screen>
      {toast.node}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 8, marginBottom: 24, gap: 4 },
  h1: { fontFamily: fonts.medium, fontSize: 32, letterSpacing: -0.9, color: colors.textPrimary, marginBottom: 4 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  name: { fontFamily: fonts.medium, fontSize: 17, color: colors.textPrimary },
  verified: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMatchSoft,
  },
});
