import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { AlertTriangle, BadgeCheck, Bookmark, Check, Clock, Snowflake } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { type DemoListing, minLabel, type Result } from '@/data/demo';
import { colors, fonts, radius } from '@/theme';
import { Card, clay, clayBg, NoPhoto, SampleTag } from './ui';

/** Small fact pill (minimum booking, cold storage). */
export function Fact({ icon, label, strong }: { icon?: ReactNode; label: string; strong?: boolean }) {
  return (
    <View style={[styles.fact, strong && styles.factStrong]}>
      {icon}
      <Text style={[styles.factText, strong && { color: colors.accentMatch }]}>{label}</Text>
    </View>
  );
}

export function Facts({ listing }: { listing: DemoListing }) {
  return (
    <View style={styles.facts}>
      <Fact strong icon={<Clock size={14} color={colors.accentMatch} />} label={minLabel(listing.minHours)} />
      {listing.coldStorage && <Fact strong icon={<Snowflake size={14} color={colors.accentMatch} />} label="Cold storage" />}
      <Fact label={listing.contract ? 'Monthly contract' : 'No lease'} />
    </View>
  );
}

/** Example price, always marked as sample data. */
export function Price({ rate, size = 20 }: { rate: number; size?: number }) {
  return (
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={{ fontFamily: fonts.semibold, fontSize: size, lineHeight: size + 5, color: colors.textPrimary }}>
        ${rate}
        <Text style={{ fontFamily: fonts.regular, fontSize: size - 6, color: colors.textSecondary }}>/hr</Text>
      </Text>
      <Text style={styles.sampleRate}>sample rate</Text>
    </View>
  );
}

/** Fit score pill: green for a strong fit, clay when something is off. */
export function Score({ score, large }: { score: number; large?: boolean }) {
  const good = score >= 80;
  return (
    <View style={[styles.score, large && styles.scoreLg, { backgroundColor: good ? colors.accentMatch : '#FFFFFF', borderColor: good ? colors.accentMatch : clay }]}>
      <Text style={[styles.scoreText, large && { fontSize: 20, lineHeight: 24 }, { color: good ? '#FFFFFF' : clay }]}>{score}%</Text>
      <Text style={[styles.scoreSub, { color: good ? 'rgba(255,255,255,0.85)' : clay }]}>fit</Text>
    </View>
  );
}

/** Honest-fit chips: what doesn't match, or a tick when everything does. */
export function Warnings({ result }: { result: Result }) {
  if (result.fits) {
    return (
      <View style={styles.facts}>
        <View style={[styles.warn, { backgroundColor: colors.accentMatchSoft }]}>
          <Check size={13} color={colors.accentMatch} strokeWidth={3} />
          <Text style={[styles.warnText, { color: colors.accentMatch }]}>Fits everything you asked for</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.facts}>
      {result.warnings.map((w) => (
        <View key={w} style={styles.warn}>
          <AlertTriangle size={13} color={clay} strokeWidth={2.5} />
          <Text style={styles.warnText}>{w}</Text>
        </View>
      ))}
    </View>
  );
}

function SaveButton({ saved, onPress, onPhoto }: { saved: boolean; onPress: () => void; onPhoto?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={saved ? 'Remove from shortlist' : 'Save to shortlist'} hitSlop={8} onPress={onPress} style={[styles.save, onPhoto && styles.saveOnPhoto]}>
      <Bookmark size={18} color={saved ? colors.accentMatch : colors.textSecondary} fill={saved ? colors.accentMatch : 'transparent'} />
    </Pressable>
  );
}

type Props = { result: Result; onPress: () => void; saved: boolean; onSave: () => void; /** Always use the tall layout (swipe view). */ tall?: boolean };

/** Result card. Listings with real photos get a big photo; the rest get a compact, photo-free card. */
export function ListingCard({ result, onPress, saved, onSave, tall }: Props) {
  const { listing, score } = result;
  const hero = listing.photos[0];

  if (hero || tall) {
    return (
      <Card onPress={onPress} style={styles.big}>
        <View style={[styles.photo, tall && { height: 250 }]}>
          {hero ? (
            <Image source={hero.src} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={{ top: '62%' }} transition={150} />
          ) : (
            <NoPhoto height={tall ? 250 : 210} />
          )}
          <View style={styles.photoTop}>
            <SampleTag onPhoto={!!hero} />
            <SaveButton saved={saved} onPress={onSave} onPhoto />
          </View>
          {listing.license && (
            <View style={styles.licensed}>
              <BadgeCheck size={14} color={colors.accentMatch} />
              <Text style={styles.licensedText}>Licensed kitchen</Text>
            </View>
          )}
        </View>
        <View style={styles.bigBody}>
          <View style={styles.head}>
            <Score score={score} large />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{listing.name}</Text>
              <Text style={styles.meta}>
                {listing.area} · ~{listing.miles} mi
              </Text>
            </View>
            <Price rate={listing.rate} />
          </View>
          <Facts listing={listing} />
          <Warnings result={result} />
        </View>
      </Card>
    );
  }

  return (
    <Card onPress={onPress} style={styles.small}>
      <View style={styles.smallHead}>
        <Score score={score} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={styles.nameSm}>{listing.name}</Text>
          <Text style={styles.meta}>
            {listing.area} · ~{listing.miles} mi · ${listing.rate}/hr · {minLabel(listing.minHours)}
          </Text>
        </View>
        <SaveButton saved={saved} onPress={onSave} />
      </View>
      <Warnings result={result} />
      <SampleTag label="Sample listing · no photo yet" />
    </Card>
  );
}

const styles = StyleSheet.create({
  big: { padding: 8 },
  photo: { height: 210, borderRadius: radius.card - 6, overflow: 'hidden', backgroundColor: colors.black20 },
  photoTop: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  licensed: { position: 'absolute', left: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.95)' },
  licensedText: { fontFamily: fonts.semibold, fontSize: 12.5, lineHeight: 16, color: colors.textPrimary },
  bigBody: { paddingHorizontal: 8, paddingTop: 14, paddingBottom: 8, gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 20, lineHeight: 24, letterSpacing: -0.2, color: colors.textPrimary },
  nameSm: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 21, color: colors.textPrimary },
  meta: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },
  sampleRate: { fontFamily: fonts.medium, fontSize: 10.5, lineHeight: 14, letterSpacing: 0.4, textTransform: 'uppercase', color: clay },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.controlBg },
  factStrong: { backgroundColor: colors.accentMatchSoft },
  factText: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 17, color: colors.textSecondary },
  score: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  scoreLg: { width: 58, height: 58, borderRadius: 29 },
  scoreText: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 19 },
  scoreSub: { fontFamily: fonts.medium, fontSize: 9.5, lineHeight: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
  warn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: clayBg },
  warnText: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 17, color: clay },
  save: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.controlBg, alignItems: 'center', justifyContent: 'center' },
  saveOnPhoto: { backgroundColor: 'rgba(255,255,255,0.95)' },
  small: { padding: 14, gap: 10 },
  smallHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
