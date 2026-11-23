import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import type { Role } from '@/data/types';
import { equipmentOptions } from '@/data/mock';
import { Chip, PillButton, Text, Toggle } from '@/components/ui';
import { BottomSheet } from '@/components/bookings';
import { useAppState } from '@/store/AppState';
import { SettingRow, SettingsSection } from './SettingsSection';

const NUT_FREE = 'Nut-Free';

/** Renter "Equipment Preferences" / host "Listing Equipment": removable tag-pills, add sheet, nut-free toggle. */
export function EquipmentSection({ side, index }: { side: Role; index: number }) {
  const { renterPrefs, hostSetup, updateRenterPrefs, updateHostSetup } = useAppState();
  const [picking, setPicking] = useState(false);

  const isHost = side === 'host';
  const equipment = isHost ? hostSetup.equipment : renterPrefs.equipment;
  const allergens = isHost ? hostSetup.allergenPolicies : renterPrefs.allergens;
  const nutFree = allergens.includes(NUT_FREE);

  const setEquipment = (next: string[]) =>
    isHost ? updateHostSetup({ equipment: next }) : updateRenterPrefs({ equipment: next });
  const setNutFree = (on: boolean) => {
    const next = on ? [...allergens.filter((a) => a !== NUT_FREE), NUT_FREE] : allergens.filter((a) => a !== NUT_FREE);
    return isHost ? updateHostSetup({ allergenPolicies: next }) : updateRenterPrefs({ allergens: next });
  };

  const toggleItem = (name: string) => {
    setEquipment(equipment.includes(name) ? equipment.filter((e) => e !== name) : [...equipment, name]);
  };

  return (
    <SettingsSection title={isHost ? 'Listing Equipment' : 'Equipment Preferences'} index={index}>
      <Text variant="bodySm" style={{ marginTop: -8 }}>
        {isHost
          ? 'Renters are ranked against this list, so keep it current to score higher on their Fit Scores.'
          : 'These are used to calculate your Fit Score with potential kitchens.'}
      </Text>

      <View style={styles.tags}>
        {equipment.map((e) => (
          <Animated.View key={e} entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} layout={LinearTransition.springify().damping(18)}>
            <Chip label={e} active onPress={() => toggleItem(e)} onRemove={() => toggleItem(e)} style={styles.tag} />
          </Animated.View>
        ))}
        <Animated.View layout={LinearTransition.springify().damping(18)}>
          <Chip label={isHost ? '+ Add Equipment' : '+ Add Requirement'} dashed onPress={() => setPicking(true)} style={styles.tag} />
        </Animated.View>
      </View>

      <View style={{ gap: 4 }}>
        <Text variant="mono">Special Requirements</Text>
        <SettingRow label={isHost ? 'Certified Nut-Free Facility' : 'Strictly Nut-Free Facility'}>
          <Toggle value={nutFree} onChange={setNutFree} />
        </SettingRow>
      </View>

      <BottomSheet
        visible={picking}
        onClose={() => setPicking(false)}
        eyebrow={`${equipment.length} selected`}
        title={isHost ? 'Equipment on Site' : 'Add Requirement'}
      >
        <View style={styles.tags}>
          {equipmentOptions.map((o) => (
            <Chip key={o} label={o} active={equipment.includes(o)} onPress={() => toggleItem(o)} style={styles.tag} />
          ))}
        </View>
        <PillButton label="Done" variant="primary" fullWidth onPress={() => setPicking(false)} style={{ marginTop: 24 }} />
      </BottomSheet>
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingVertical: 9, paddingHorizontal: 14, minHeight: 40 },
});

