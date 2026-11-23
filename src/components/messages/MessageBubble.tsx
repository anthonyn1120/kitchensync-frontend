import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated from '@/components/ui/Animated';
import { CheckCircle2, FileText, Info } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors, fonts, radius } from '@/theme';
import type { ChatItem } from './chatData';
import { enterUp } from '@/components/ui/motion';

const enter = enterUp();

function formatSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** .message-bubble (received / sent), system notes and attachment chips. */
export function MessageBubble({ item, showTime, time }: { item: ChatItem; showTime: boolean; time?: string }) {
  if (item.kind === 'system') {
    const success = item.tone === 'success';
    const Icon = success ? CheckCircle2 : Info;
    return (
      <Animated.View entering={enter} style={[styles.system, success && styles.systemSuccess]}>
        <Icon size={14} color={success ? colors.accentMatch : colors.textSecondary} />
        <Text variant="monoSm" color={success ? colors.accentMatch : colors.textSecondary} style={styles.systemText}>
          {item.text}
        </Text>
      </Animated.View>
    );
  }

  const sent = item.from === 'me';
  return (
    <Animated.View entering={enter} style={[styles.wrap, sent ? styles.alignEnd : styles.alignStart]}>
      {item.kind === 'msg' ? (
        <View style={[styles.bubble, sent ? styles.sent : styles.received]}>
          <Text style={[styles.text, sent && styles.sentText]}>{item.text}</Text>
        </View>
      ) : item.attachment === 'photo' && item.uri ? (
        <View style={[styles.photo, styles.sentCorner]}>
          <Image source={{ uri: item.uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        </View>
      ) : (
        <View style={[styles.bubble, styles.sent, styles.file]}>
          <View style={styles.fileIcon}>
            <FileText size={18} color={colors.primaryButtonText} />
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text style={[styles.text, styles.sentText, { fontFamily: fonts.medium }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text variant="monoSm" color="rgba(26,26,26,0.55)">
              {[item.attachment === 'photo' ? 'Photo' : 'Document', formatSize(item.size)].filter(Boolean).join(' · ')}
            </Text>
          </View>
        </View>
      )}
      {showTime && time && (
        <Text variant="monoSm" style={[styles.time, sent && { textAlign: 'right' }]}>
          {time}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: '80%' },
  alignStart: { alignSelf: 'flex-start' },
  alignEnd: { alignSelf: 'flex-end' },
  bubble: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20 },
  received: { backgroundColor: colors.controlBg, borderBottomLeftRadius: 4 },
  sent: { backgroundColor: colors.primaryButtonBg, borderBottomRightRadius: 4 },
  sentCorner: { borderBottomRightRadius: 4 },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.textPrimary },
  sentText: { color: colors.primaryButtonText },
  time: { marginTop: 6, paddingHorizontal: 4 },
  photo: {
    width: 200,
    height: 150,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.white10,
    borderWidth: 1,
    borderColor: colors.glassBorderLight,
  },
  file: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(26,26,26,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  system: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.black20,
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
    maxWidth: '92%',
  },
  systemSuccess: { backgroundColor: colors.accentMatchSoft, borderColor: 'rgba(163,196,129,0.3)' },
  systemText: { flexShrink: 1, lineHeight: 15 },
});
