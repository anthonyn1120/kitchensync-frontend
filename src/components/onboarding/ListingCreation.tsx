import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import * as Haptics from 'expo-haptics';
import { FileText, Mic, Square, X } from 'lucide-react-native';
import { IconButton, Text } from '@/components/ui';
import { colors, fonts } from '@/theme';
import { FadeUp } from './FadeUp';
import { ProgressLine, usePressScale, useSelection, Waveform } from './Motion';
import { voiceScript } from './options';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PickedDoc = { id: string; name: string; size?: number; status: 'analyzing' | 'done' };

/** A picked file: name and a quiet mono status. */
export function DocRow({ doc, onRemove }: { doc: PickedDoc; onRemove: () => void }) {
  const reading = doc.status === 'analyzing';
  return (
    <View style={styles.docCard}>
      <FileText size={20} color={colors.textSecondary} strokeWidth={1.5} />
      <View style={{ flex: 1 }}>
        <Text style={styles.docName} numberOfLines={1}>
          {doc.name}
        </Text>
        <Text variant="monoSm" color={reading ? colors.textTertiary : colors.accentMatch} style={{ marginTop: 3 }}>
          {reading ? 'Reading…' : 'Ready'}
          {doc.size ? ` · ${formatSize(doc.size)}` : ''}
        </Text>
      </View>
      <IconButton size={32} onPress={onRemove}>
        <X size={14} color={colors.textSecondary} />
      </IconButton>
    </View>
  );
}

const formatSize = (b: number) => (b > 1_000_000 ? `${(b / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1000))} KB`);

type VoiceState = 'idle' | 'recording' | 'done';

/**
 * Fake voice capture: one mic button, a live waveform while recording, and the
 * transcript typing itself out underneath from a canned script.
 */
export function VoiceRecorder({
  initialText = '',
  onTranscript,
}: {
  /** Restores a finished recording when the screen comes back into view */
  initialText?: string;
  onTranscript: (text: string, finished: boolean) => void;
}) {
  const [state, setState] = useState<VoiceState>(initialText ? 'done' : 'idle');
  const [chars, setChars] = useState(initialText.length);
  const [elapsed, setElapsed] = useState(Math.round((initialText.length / 2) * 0.045));
  const startedAt = useRef(0);

  useEffect(() => {
    if (state !== 'recording') return;
    const typer = setInterval(() => setChars((c) => Math.min(voiceScript.length, c + 2)), 45);
    const clock = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 250);
    return () => {
      clearInterval(typer);
      clearInterval(clock);
    };
  }, [state]);

  useEffect(() => {
    if (state === 'recording' && chars >= voiceScript.length) {
      setState('done');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [chars, state]);

  useEffect(() => {
    onTranscript(voiceScript.slice(0, chars), state === 'done');
  }, [chars, state]);

  const toggle = () => {
    if (state === 'recording') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setState('done');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChars(0);
    setElapsed(0);
    startedAt.current = Date.now();
    setState('recording');
  };

  const recording = state === 'recording';
  const transcript = voiceScript.slice(0, chars);
  const status = recording ? `Recording · ${clock(elapsed)}` : state === 'done' ? `${clock(elapsed)} · Tap to redo` : 'Tap to record';

  return (
    <View>
      <View style={{ alignItems: 'center' }}>
        <MicButton recording={recording} onPress={toggle} />
        <Text variant="mono" color={recording ? colors.textPrimary : colors.textTertiary} style={{ marginTop: 16 }}>
          {status}
        </Text>
      </View>
      <View style={{ marginTop: 24, marginBottom: 24 }}>
        <Waveform active={recording} />
      </View>
      {state !== 'idle' && (
        <FadeUp stagger={0}>
          <Text style={styles.transcript}>{transcript}</Text>
        </FadeUp>
      )}
    </View>
  );
}

const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function MicButton({ recording, onPress }: { recording: boolean; onPress: () => void }) {
  const press = usePressScale(0.94);
  const s = useSelection(recording);
  const look = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(s.value, [0, 1], [colors.glassBgPrimary, colors.accentMatch]),
    borderColor: interpolateColor(s.value, [0, 1], [colors.glassBorderLight, 'rgba(163,196,129,0)']),
  }));
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={recording ? 'Stop recording' : 'Start recording'}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={onPress}
      style={[styles.mic, look, press.style]}
    >
      {recording ? <Square size={22} color="#1a2a1a" fill="#1a2a1a" /> : <Mic size={30} color={colors.textPrimary} strokeWidth={1.5} />}
    </AnimatedPressable>
  );
}

const STRUCTURE_MS = [1100, 1000, 1000];

/** Calm "building your listing" state: a thin bar and one line of status, then calls onDone. */
export function StructuringView({ source, onDone }: { source: 'upload' | 'voice'; onDone: () => void }) {
  const lines = [
    source === 'voice' ? 'Listening back to your description…' : 'Reading your files…',
    'Picking out equipment and certifications…',
    'Writing your description…',
  ];
  const [step, setStep] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (step >= lines.length) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const t = setTimeout(() => doneRef.current(), 450);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((p) => p + 1), STRUCTURE_MS[step]);
    return () => clearTimeout(t);
  }, [step, lines.length]);

  const total = STRUCTURE_MS.reduce((a, b) => a + b, 0);

  return (
    <FadeUp stagger={2}>
      <ProgressLine progress={1} duration={total} />
      <FadeUp key={step} stagger={0} distance={4} style={{ marginTop: 16 }}>
        <Text variant="bodySm">{lines[Math.min(step, lines.length - 1)]}</Text>
      </FadeUp>
    </FadeUp>
  );
}

const styles = StyleSheet.create({
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingLeft: 18,
    paddingRight: 12,
    borderRadius: 20,
    backgroundColor: colors.glassBgSecondary,
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
    marginBottom: 10,
  },
  docName: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
  mic: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  transcript: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 26, color: colors.textPrimary },
});
