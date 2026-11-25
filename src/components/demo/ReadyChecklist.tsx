import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { BadgeCheck, Check, Info } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { type DemoListing, photos, readyItems } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors, fonts } from '@/theme';
import { Card, clay, Label } from './ui';

/** "Get ready": the kitchen's own license, then what the renter typically needs. Guidance, not legal advice. */
export function ReadyChecklist({ listing }: { listing: DemoListing }) {
  const { ready, toggleReady } = useAppState();
  const done = readyItems.filter((i) => ready.includes(i.id)).length;

  return (
    <View>
      <View style={styles.notice}>
        <Info size={16} color={clay} style={{ marginTop: 2 }} />
        <Text style={styles.noticeText}>
          <Text style={styles.noticeStrong}>Guidance, not legal advice. </Text>
          A preview of where Kitchen Sync is headed. Confirm your case with Public Health – Seattle & King County or WSDA.
        </Text>
      </View>

      <Label style={{ marginTop: 20 }}>The kitchen has</Label>
      {listing.license ? (
        <Card style={styles.license}>
          <Image source={photos.nvcPermit} style={styles.permit} contentFit="cover" contentPosition={{ top: '55%' }} />
          <View style={{ flex: 1 }}>
            <View style={styles.licenseHead}>
              <BadgeCheck size={18} color={colors.accentMatch} />
              <Text style={styles.licenseTitle}>{listing.license.title}</Text>
            </View>
            <Text style={styles.small}>{listing.license.authority}</Text>
            <Text style={[styles.small, { marginTop: 4 }]}>{listing.license.detail}</Text>
          </View>
        </Card>
      ) : (
        <Card>
          <Text style={styles.small}>This sample listing has no permit on file. A real listing shows the kitchen’s license here.</Text>
        </Card>
      )}

      <Label style={{ marginTop: 22 }} right={<Text style={styles.count}>{done} of {readyItems.length} ready</Text>}>
        You typically need
      </Label>
      <Card style={{ paddingVertical: 6 }}>
        {readyItems.map((item, i) => {
          const on = ready.includes(item.id);
          return (
            <Pressable
              key={item.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={item.title}
              onPress={() => toggleReady(item.id)}
              style={[styles.item, i > 0 && styles.itemBorder]}
            >
              <View style={[styles.box, on && styles.boxOn]}>{on && <Check size={16} color="#FFFFFF" strokeWidth={3} />}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.small}>{item.detail}</Text>
                <Text style={styles.who}>{item.who}</Text>
              </View>
            </Pressable>
          );
        })}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 14, backgroundColor: 'rgba(207,113,83,0.10)' },
  noticeText: { flex: 1, fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },
  noticeStrong: { fontFamily: fonts.semibold, fontSize: 13.5, lineHeight: 19, color: colors.textPrimary },
  license: { flexDirection: 'row', gap: 12, padding: 10 },
  permit: { width: 84, height: 104, borderRadius: 12, backgroundColor: colors.black20 },
  licenseHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 2, paddingRight: 4 },
  licenseTitle: { flex: 1, fontFamily: fonts.semibold, fontSize: 15.5, lineHeight: 20, color: colors.textPrimary },
  small: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textSecondary },
  count: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, color: colors.accentMatch },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  itemBorder: { borderTopWidth: 1, borderTopColor: colors.glassBorderDim },
  box: { width: 28, height: 28, borderRadius: 9, borderWidth: 2, borderColor: colors.controlBorder, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  boxOn: { backgroundColor: colors.accentMatch, borderColor: colors.accentMatch },
  itemTitle: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 21, color: colors.textPrimary },
  who: { fontFamily: fonts.medium, fontSize: 11.5, lineHeight: 16, letterSpacing: 0.3, color: colors.textTertiary, marginTop: 3 },
});
