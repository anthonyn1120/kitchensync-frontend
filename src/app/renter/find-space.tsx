import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SlidersHorizontal, Snowflake } from 'lucide-react-native';
import { Screen, Text } from '@/components/ui';
import { ListingCard } from '@/components/demo/ListingCard';
import { Choice, Label, Segments } from '@/components/demo/ui';
import { equipmentChoices, hourChoices, photos, search, persona } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors, fonts, radius } from '@/theme';

type ViewMode = 'List' | 'Swipe';

/** Results: every kitchen gets an honest fit score and says what doesn't match. List or swipe through them. */
export default function FindSpace() {
  const { needs, updateNeeds, renterPrefs, shortlist, toggleShortlist } = useAppState();
  const [mode, setMode] = useState<ViewMode>('List');
  const [width, setWidth] = useState(0);
  const results = search(needs);
  const open = (id: string) => router.push(`/listing/${id}`);
  const fitCount = results.filter((r) => r.fits).length;
  const cardW = Math.max(260, width - 28);

  return (
    <Screen withTabBar scroll>
      <View style={styles.header} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <Image source={photos.wanolaBag} style={styles.avatar} contentFit="contain" />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Kitchens for {persona.short}</Text>
          <Text style={styles.sub}>
            Near {renterPrefs.zip} · {needs.day} {needs.window.toLowerCase()} · max ${needs.budget}/hr
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit search" hitSlop={8} onPress={() => router.push('/onboarding/renter/needs')} style={styles.edit}>
          <SlidersHorizontal size={18} color={colors.textPrimary} />
        </Pressable>
      </View>

      <Label>Minimum booking I can accept</Label>
      <Segments options={hourChoices} value={needs.hours as (typeof hourChoices)[number]} onChange={(hours) => updateNeeds({ hours })} format={(h) => `${h} hr${h > 1 ? 's' : ''}`} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chips}>
        <Choice
          label="Cold storage"
          on={needs.coldStorage}
          onPress={() => updateNeeds({ coldStorage: !needs.coldStorage })}
          style={styles.chip}
          icon={<Snowflake size={15} color={needs.coldStorage ? '#FFFFFF' : colors.textSecondary} />}
        />
        {equipmentChoices.map((e) => {
          const on = needs.equipment.includes(e);
          return (
            <Choice
              key={e}
              label={e}
              on={on}
              style={styles.chip}
              onPress={() => updateNeeds({ equipment: on ? needs.equipment.filter((x) => x !== e) : [...needs.equipment, e] })}
            />
          );
        })}
      </ScrollView>

      <View style={styles.resultsHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.count}>
            {fitCount} of {results.length} fit everything
          </Text>
          <Text style={styles.saved}>{shortlist.length > 0 ? `${shortlist.length} saved to your shortlist` : 'Ranked by fit score'}</Text>
        </View>
        <View style={styles.toggle}>
          {(['List', 'Swipe'] as const).map((m) => (
            <Pressable key={m} accessibilityRole="button" accessibilityState={{ selected: mode === m }} onPress={() => setMode(m)} style={[styles.toggleItem, mode === m && styles.toggleOn]}>
              <Text style={[styles.toggleText, mode === m && { color: '#FFFFFF' }]}>{m}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {mode === 'List' ? (
        <View style={{ gap: 12 }}>
          {results.map((r) => (
            <ListingCard key={r.listing.id} result={r} onPress={() => open(r.listing.id)} saved={shortlist.includes(r.listing.id)} onSave={() => toggleShortlist(r.listing.id)} />
          ))}
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={cardW + 10} decelerationRate="fast" style={styles.deckScroll} contentContainerStyle={styles.deck}>
            {results.map((r) => (
              <View key={r.listing.id} style={{ width: cardW }}>
                <ListingCard tall result={r} onPress={() => open(r.listing.id)} saved={shortlist.includes(r.listing.id)} onSave={() => toggleShortlist(r.listing.id)} />
              </View>
            ))}
          </ScrollView>
          <Text style={styles.hint}>Swipe sideways for the next kitchen. Tap a card for details.</Text>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6, marginBottom: 18 },
  avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#E9E9EC' },
  title: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 23, lineHeight: 28, letterSpacing: -0.3, color: colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },
  edit: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.controlBorder, alignItems: 'center', justifyContent: 'center' },
  chipScroll: { marginHorizontal: -20, marginTop: 10, flexGrow: 0 },
  chips: { paddingHorizontal: 20, gap: 8 },
  chip: { minHeight: 42, paddingHorizontal: 14 },
  resultsHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, marginBottom: 12 },
  count: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 21, color: colors.textPrimary },
  saved: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  toggle: { flexDirection: 'row', padding: 3, borderRadius: radius.pill, backgroundColor: colors.controlBg, borderWidth: 1, borderColor: colors.controlBorder },
  toggleItem: { minHeight: 38, paddingHorizontal: 16, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.primaryButtonBg },
  toggleText: { fontFamily: fonts.semibold, fontSize: 13.5, lineHeight: 18, color: colors.textSecondary },
  deckScroll: { marginHorizontal: -20, flexGrow: 0 },
  deck: { paddingHorizontal: 20, gap: 10, paddingBottom: 16 },
  hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textTertiary, textAlign: 'center' },
});
