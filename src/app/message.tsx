import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import { PillButton, Text } from '@/components/ui';
import { FlowScreen } from '@/components/demo/ui';
import { getDemoListing, persona } from '@/data/demo';
import { useAppState } from '@/store/AppState';
import { colors, fonts } from '@/theme';

/** Message the kitchen before requesting anything. The draft is written from the renter's search. */
export default function Message() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { needs, renterPrefs } = useAppState();
  const listing = getDemoListing(id);
  const name = renterPrefs.businessName.trim() || persona.name;
  const [draft, setDraft] = useState(
    `Hi! We’re ${name} in Sammamish. We need about ${needs.hours} hour${needs.hours > 1 ? 's' : ''} on ${needs.day} ${needs.window.toLowerCase()}s to bake granola${needs.coldStorage ? ', plus a fridge shelf' : ''}. Is that open?`,
  );
  const [sent, setSent] = useState<string[]>([]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setSent((s) => [...s, text]);
    setDraft('');
  };

  return (
    <FlowScreen
      eyebrow={listing ? listing.name : 'Message'}
      footer={
        <View style={styles.composer}>
          <TextInput
            accessibilityLabel="Message"
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a message"
            placeholderTextColor={colors.textTertiary}
            multiline
            style={styles.input}
          />
          <PillButton label="Send" variant="primary" size="md" disabled={!draft.trim()} onPress={send} iconRight={<Send size={15} color={colors.primaryButtonText} />} />
        </View>
      }
    >
      <Text style={styles.title}>Message the kitchen</Text>
      <Text style={styles.sub}>Ask anything before you tour or book. We drafted this from your search.</Text>

      {sent.map((m, i) => (
        <View key={i} style={styles.bubble}>
          <Text style={styles.bubbleText}>{m}</Text>
        </View>
      ))}
      {sent.length > 0 && <Text style={styles.note}>Sent. Demo only: this sample listing has no one to reply.</Text>}
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontWeight: '700', fontSize: 28, lineHeight: 34, letterSpacing: -0.4, color: colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.textSecondary, marginTop: 6, marginBottom: 18 },
  bubble: { alignSelf: 'flex-end', maxWidth: '86%', padding: 14, borderRadius: 20, borderBottomRightRadius: 6, backgroundColor: colors.primaryButtonBg, marginBottom: 8 },
  bubbleText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: '#FFFFFF' },
  note: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, color: colors.textTertiary, textAlign: 'right' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 140,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.controlBorder,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textPrimary,
  },
});
