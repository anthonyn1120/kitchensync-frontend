import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import * as DocumentPicker from 'expo-document-picker';
import { Award, ClipboardCheck, FileText, ShieldCheck } from 'lucide-react-native';
import type { DocumentItem, Role } from '@/data/types';
import { hostDocuments, renterDocuments } from '@/data/mock';
import { colors, fonts, radius } from '@/theme';
import { PillButton, Text } from '@/components/ui';
import { BottomSheet } from '@/components/bookings';
import { SettingsSection } from './SettingsSection';
import { enterUp } from '@/components/ui/motion';

const ICONS = { certificate: Award, insurance: ShieldCheck, permit: FileText, inspection: ClipboardCheck } as const;

export function DocumentsSection({ side, index, onToast }: { side: Role; index: number; onToast: (m: string) => void }) {
  const [docs, setDocs] = useState<DocumentItem[]>(side === 'host' ? hostDocuments : renterDocuments);
  const [viewing, setViewing] = useState<DocumentItem | null>(null);
  const lastViewed = useRef<DocumentItem | null>(null);
  if (viewing) lastViewed.current = viewing;
  const shown = viewing ?? lastViewed.current;

  const upload = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: false,
      });
      if (res.canceled || !res.assets?.length) return;
      const added = res.assets.map<DocumentItem>((a, i) => ({
        id: `up-${Date.now()}-${i}`,
        name: a.name,
        kind: /insur/i.test(a.name) ? 'insurance' : 'certificate',
        status: 'PENDING REVIEW',
        verified: false,
      }));
      setDocs((d) => [...d, ...added]);
      onToast('Uploaded. We’ll review it shortly');
    } catch {
      onToast('Couldn’t open Files');
    }
  };

  return (
    <SettingsSection
      index={index}
      title={side === 'host' ? 'Facility Documents' : 'Certifications & Insurance'}
      right={<PillButton size="sm" label="+ Upload New" onPress={upload} />}
    >
      {docs.map((d) => (
        <Animated.View key={d.id} entering={enterUp()} layout={LinearTransition.springify()}>
          <DocCard doc={d} onView={() => setViewing(d)} />
        </Animated.View>
      ))}

      <BottomSheet visible={!!viewing} onClose={() => setViewing(null)} eyebrow="Document" title={shown?.name}>
        {shown && (
          <View style={{ gap: 16 }}>
            <View style={styles.preview}>
              <FileText size={36} color={colors.textTertiary} strokeWidth={1.25} />
              {[0.9, 0.75, 0.82, 0.6, 0.7].map((w, i) => (
                <View key={i} style={[styles.previewLine, { width: `${w * 100}%` }]} />
              ))}
            </View>
            <Text style={[styles.status, { color: shown.verified ? colors.accentMatch : colors.textSecondary }]}>
              {shown.status}
            </Text>
            <Text variant="bodySm">
              {shown.verified
                ? 'Verified by the Kitchen Sync trust team. Hosts see this badge on your profile.'
                : 'Our team usually reviews new documents within one business day.'}
            </Text>
            <PillButton label="Done" variant="primary" fullWidth onPress={() => setViewing(null)} />
          </View>
        )}
      </BottomSheet>
    </SettingsSection>
  );
}

function DocCard({ doc, onView }: { doc: DocumentItem; onView: () => void }) {
  const Icon = ICONS[doc.kind];
  const tint = doc.verified ? colors.accentMatch : colors.textSecondary;
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Icon size={18} color={tint} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.name} numberOfLines={1}>
          {doc.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {!doc.verified && <View style={styles.pendingDot} />}
          <Text style={[styles.status, { color: tint }]} numberOfLines={1}>
            {doc.status}
          </Text>
        </View>
      </View>
      <PillButton size="sm" label="View" onPress={onView} style={{ opacity: 0.75, minHeight: 36 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.black20,
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.white05,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
  status: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.5, flexShrink: 1 },
  pendingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textSecondary },
  preview: {
    height: 200,
    borderRadius: radius.sm,
    backgroundColor: colors.black20,
    borderWidth: 1,
    borderColor: colors.white08,
    padding: 24,
    gap: 12,
  },
  previewLine: { height: 6, borderRadius: 3, backgroundColor: colors.white08 },
});
