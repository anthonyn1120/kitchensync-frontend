import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius } from '@/theme';
import { PillButton, Text } from '@/components/ui';
import { BottomSheet } from '@/components/bookings';
import { useAppState } from '@/store/AppState';
import { SettingsSection } from './SettingsSection';

type Editing = 'email' | 'password' | null;

export function SecuritySection({
  index,
  initialEmail,
  passwordChanged,
  onToast,
}: {
  index: number;
  initialEmail: string;
  passwordChanged: string;
  onToast: (m: string) => void;
}) {
  const { resetOnboarding } = useAppState();
  const [email, setEmail] = useState(initialEmail);
  const [pwLabel, setPwLabel] = useState(passwordChanged);
  const [editing, setEditing] = useState<Editing>(null);
  const [draft, setDraft] = useState('');
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const lastEditing = useRef<Editing>(null);
  if (editing) lastEditing.current = editing;
  const mode = editing ?? lastEditing.current;

  const open = (which: Exclude<Editing, null>) => {
    setDraft(which === 'email' ? email : '');
    setEditing(which);
  };

  const valid = mode === 'email' ? /^\S+@\S+\.\S+$/.test(draft.trim()) : draft.length >= 8;

  const save = () => {
    if (!valid) return;
    if (mode === 'email') {
      setEmail(draft.trim());
      onToast('Email updated');
    } else {
      setPwLabel('Last changed just now');
      onToast('Password updated');
    }
    setEditing(null);
  };

  const deactivate = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setConfirmDeactivate(false);
    resetOnboarding();
    router.replace('/onboarding');
  };

  return (
    <SettingsSection title="Account Security" index={index}>
      <AccountRow label="Email Address" value={email} action="Edit" onPress={() => open('email')} />
      <AccountRow label="Password" value={pwLabel} action="Update" onPress={() => open('password')} />
      <PillButton
        label="Deactivate Account"
        variant="danger"
        fullWidth
        onPress={() => setConfirmDeactivate(true)}
        style={{ marginTop: 4, borderColor: 'rgba(226, 125, 96, 0.2)' }}
      />

      <BottomSheet
        visible={!!editing}
        onClose={() => setEditing(null)}
        eyebrow="Account Security"
        title={mode === 'email' ? 'Edit Email' : 'Update Password'}
      >
        <View style={{ gap: 12 }}>
          <Text variant="mono">{mode === 'email' ? 'Email Address' : 'New Password'}</Text>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={mode === 'email' ? 'email-address' : 'default'}
            secureTextEntry={mode === 'password'}
            textContentType={mode === 'email' ? 'emailAddress' : 'newPassword'}
            placeholder={mode === 'email' ? 'you@business.com' : 'At least 8 characters'}
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.accentMatch}
            returnKeyType="done"
            onSubmitEditing={save}
            style={styles.input}
          />
          <PillButton label="Save" variant="primary" fullWidth disabled={!valid} onPress={save} style={{ marginTop: 8 }} />
        </View>
      </BottomSheet>

      <BottomSheet visible={confirmDeactivate} onClose={() => setConfirmDeactivate(false)} eyebrow="Danger Zone" title="Deactivate account?">
        <View style={{ gap: 12 }}>
          <Text variant="body">
            Your profile, saved kitchens and messages will be hidden and any pending requests cancelled. You can reactivate by
            signing in again within 30 days.
          </Text>
          <PillButton label="Deactivate Account" variant="danger" fullWidth onPress={deactivate} style={{ marginTop: 8 }} />
          <PillButton label="Keep My Account" variant="ghost" fullWidth onPress={() => setConfirmDeactivate(false)} />
        </View>
      </BottomSheet>
    </SettingsSection>
  );
}

function AccountRow({ label, value, action, onPress }: { label: string; value: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <PillButton size="sm" label={action} onPress={onPress} style={{ minHeight: 36 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
  value: { fontFamily: fonts.regular, fontSize: 13, color: colors.textPrimary, opacity: 0.5 },
  input: {
    height: 52,
    paddingHorizontal: 18,
    borderRadius: radius.sm,
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
