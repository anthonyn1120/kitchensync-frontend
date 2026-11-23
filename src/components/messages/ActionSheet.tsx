import { ReactNode, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CalendarPlus, ChevronLeft, ChevronRight, FileText, ImageIcon } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors, fonts, radius } from '@/theme';
import { PROPOSED_SLOTS } from './chatData';
import { Sheet } from './Sheet';

type Slot = (typeof PROPOSED_SLOTS)[number];

type Props = {
  visible: boolean;
  onClose: () => void;
  onPhoto: () => void;
  onDocument: () => void;
  onPropose: (slot: Slot) => void;
};

function Row({ icon, title, sub, onPress }: { icon: ReactNode; title: string; sub: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.white10 }]}>
      <View style={styles.icon}>{icon}</View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.title}>{title}</Text>
        <Text variant="monoSm">{sub}</Text>
      </View>
      <ChevronRight size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

/** The composer's "+" menu: share a photo or document, or propose a time slot. */
export function ActionSheet({ visible, onClose, onPhoto, onDocument, onPropose }: Props) {
  const [step, setStep] = useState<'menu' | 'propose'>('menu');
  useEffect(() => {
    if (visible) setStep('menu');
  }, [visible]);

  return (
    <Sheet visible={visible} onClose={onClose} eyebrow="Attach" title={step === 'menu' ? 'Add to Chat' : 'Propose Time'}>
      {step === 'menu' ? (
        <View style={{ gap: 8 }}>
          <Row icon={<ImageIcon size={18} color={colors.textPrimary} />} title="Share photo" sub="Product shots, packaging" onPress={onPhoto} />
          <Row icon={<FileText size={18} color={colors.textPrimary} />} title="Share document" sub="COI, permits, recipes" onPress={onDocument} />
          <Row
            icon={<CalendarPlus size={18} color={colors.accentMatch} />}
            title="Propose time"
            sub="Suggest another session"
            onPress={() => setStep('propose')}
          />
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {PROPOSED_SLOTS.map((s) => (
            <Row
              key={s.date}
              icon={<Text style={styles.day}>{s.date.match(/\d+/)?.[0]}</Text>}
              title={s.date}
              sub={s.time}
              onPress={() => onPropose(s)}
            />
          ))}
          <Pressable onPress={() => setStep('menu')} style={styles.back} hitSlop={8}>
            <ChevronLeft size={14} color={colors.textSecondary} />
            <Text variant="mono" color={colors.textSecondary}>
              Back
            </Text>
          </Pressable>
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: radius.sm + 4,
    backgroundColor: colors.white05,
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
  day: { fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'center', paddingVertical: 12 },
});
