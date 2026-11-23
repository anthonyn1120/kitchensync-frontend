import { forwardRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Plus, Send } from 'lucide-react-native';
import { IconButton, PillButton } from '@/components/ui';
import { colors, fonts } from '@/theme';

type Props = {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
  onPlus: () => void;
  placeholder: string;
  bottomPadding: number;
};

/** .composer — round + button, glass pill input, white "Send" pill. */
export const Composer = forwardRef<TextInput, Props>(function Composer(
  { value, onChange, onSend, onPlus, placeholder, bottomPadding },
  ref,
) {
  const canSend = value.trim().length > 0;
  return (
    <View style={[styles.wrap, { paddingBottom: bottomPadding }]}>
      <IconButton size={44} onPress={onPlus}>
        <Plus size={18} color={colors.textPrimary} />
      </IconButton>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
        multiline
        selectionColor={colors.accentMatch}
        keyboardAppearance="dark"
        accessibilityLabel="Message"
      />
      <PillButton
        variant="primary"
        label="Send"
        disabled={!canSend}
        onPress={onSend}
        iconRight={<Send size={15} color={colors.primaryButtonText} />}
        style={styles.send}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorderDim,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    borderRadius: 22, // pill at one line; stays rounded when multiline grows
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 19,
  },
  send: { height: 44, paddingVertical: 0, paddingHorizontal: 16, gap: 6 },
});
