import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { IconButton, PillButton, Text, Toggle } from '@/components/ui';
import { listings } from '@/data/mock';
import { colors, fonts, radius } from '@/theme';
import { BottomSheet } from './BottomSheet';

type Props = {
  visible: boolean;
  onClose: () => void;
  rate: number;
  description: string;
  active: boolean;
  onSave: (v: { rate: number; description: string; active: boolean }) => void;
};

const fallbackDescription = listings.find((l) => l.id === 'bbc')?.quote ?? '';

export function EditListingSheet({ visible, onClose, rate, description, active, onSave }: Props) {
  const [draftRate, setDraftRate] = useState(rate);
  const [draftDesc, setDraftDesc] = useState(description || fallbackDescription);
  const [draftActive, setDraftActive] = useState(active);

  // Reset the draft each time the sheet opens.
  useEffect(() => {
    if (visible) {
      setDraftRate(rate);
      setDraftDesc(description || fallbackDescription);
      setDraftActive(active);
    }
  }, [visible, rate, description, active]);

  const step = (d: number) => setDraftRate((r) => Math.min(250, Math.max(15, r + d)));

  return (
    <BottomSheet visible={visible} onClose={onClose} eyebrow="Brooklyn Baking Co. Main" title="Edit Listing">
      <View style={{ gap: 20 }}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text variant="label">Active</Text>
            <Text variant="bodySm">{draftActive ? 'Visible to renters in search' : 'Hidden from search'}</Text>
          </View>
          <Toggle value={draftActive} onChange={setDraftActive} />
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text variant="label">Hourly rate</Text>
            <Text variant="monoSm" style={{ marginTop: 4 }}>Area avg $48/hr</Text>
          </View>
          <View style={styles.stepper}>
            <IconButton size={40} onPress={() => step(-5)}>
              <Minus size={16} color={colors.textPrimary} />
            </IconButton>
            <Text style={styles.rate}>${draftRate}</Text>
            <IconButton size={40} onPress={() => step(5)}>
              <Plus size={16} color={colors.textPrimary} />
            </IconButton>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text variant="mono">Description</Text>
          <TextInput
            value={draftDesc}
            onChangeText={setDraftDesc}
            multiline
            placeholder="Describe your space, equipment and open windows"
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.accentMatch}
            style={styles.input}
          />
        </View>

        <PillButton
          variant="primary"
          size="lg"
          fullWidth
          label="Save Changes"
          onPress={() => onSave({ rate: draftRate, description: draftDesc.trim(), active: draftActive })}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  divider: { height: 1, backgroundColor: colors.white10 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rate: { fontFamily: fonts.mono, fontSize: 18, color: colors.textPrimary, minWidth: 52, textAlign: 'center' },
  input: {
    minHeight: 110,
    maxHeight: 180,
    borderRadius: radius.sm + 4,
    backgroundColor: colors.black20,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    padding: 14,
    paddingTop: 14,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    textAlignVertical: 'top',
  },
});
