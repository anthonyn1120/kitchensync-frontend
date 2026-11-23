import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { GlassPanel, Text } from '@/components/ui';
import { hostListing } from '@/data/mock';
import { colors, fonts, radius } from '@/theme';
import { formatInt } from './CountUp';

/** Compact listing row: photo, name, status · rate, views in small text, and an Edit button. */
export function ListingSummary({ active, rate, onEdit }: { active: boolean; rate: number; onEdit: () => void }) {
  return (
    <GlassPanel tone="secondary" radius={22} contentStyle={styles.content}>
      <View>
        <Image source={{ uri: hostListing.photo }} style={styles.photo} contentFit="cover" transition={200} />
        {!active && <View style={[StyleSheet.absoluteFill, styles.photoDim]} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="label" numberOfLines={1}>{hostListing.name}</Text>
        <View style={styles.meta}>
          <View style={[styles.dot, !active && { backgroundColor: colors.textTertiary }]} />
          <Text style={[styles.metaText, active && { color: colors.accentMatch }]}>{active ? 'Active' : 'Paused'}</Text>
          <Text style={styles.metaText}>· ${rate}/hr</Text>
        </View>
        <Text variant="monoSm" style={{ marginTop: 3 }}>
          {formatInt(hostListing.views)} views · ★ {hostListing.rating}
        </Text>
      </View>
      <Pressable
        onPress={onEdit}
        hitSlop={6}
        style={({ pressed }) => [styles.edit, pressed && { backgroundColor: colors.controlBgPressed }]}
        accessibilityRole="button"
        accessibilityLabel="Edit listing"
      >
        <Text style={styles.editText}>Edit</Text>
      </Pressable>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, paddingRight: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  photo: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.black20 },
  photoDim: { borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.45)' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accentMatch },
  metaText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  edit: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    backgroundColor: colors.controlBg,
    justifyContent: 'center',
  },
  editText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textPrimary },
});
