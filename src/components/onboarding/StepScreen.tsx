import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { NavHeader, PillButton, Text } from '@/components/ui';
import { colors, fonts } from '@/theme';
import { FadeUp } from './FadeUp';

type Props = {
  /** Mono label next to the back button. Defaults to "Step N of M" when step/total are given. */
  label?: string;
  step?: number;
  total?: number;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  onBack?: () => void;
  hideBack?: boolean;

  continueLabel?: string;
  canContinue?: boolean;
  onContinue?: () => void;
  /** Replaces the Continue button entirely */
  footer?: ReactNode;
  /** Extra content above the Continue button (hints, secondary links) */
  footerExtra?: ReactNode;
  hideFooter?: boolean;
};

/**
 * Shared onboarding step layout, after the mockup: back button + mono step
 * label, heading, one line of body copy, the question, and a pinned Continue.
 */
export function StepScreen({
  label,
  step,
  total,
  title,
  subtitle,
  children,
  onBack,
  hideBack,
  continueLabel = 'Continue',
  canContinue = true,
  onContinue,
  footer,
  footerExtra,
  hideFooter,
}: Props) {
  const insets = useSafeAreaInsets();
  const headerLabel = label ?? (step !== undefined && total ? `Step ${step} of ${total}` : undefined);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, paddingTop: insets.top + 8 }}>
        <FadeUp stagger={0} distance={0} style={styles.headerWrap}>
          {hideBack ? (
            <View style={{ height: 40, marginBottom: 24, justifyContent: 'center' }}>
              {headerLabel && <Text variant="mono">{headerLabel}</Text>}
            </View>
          ) : (
            <NavHeader label={headerLabel} onBack={onBack} />
          )}
        </FadeUp>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {(title || subtitle) && (
            <FadeUp key={title} stagger={1} style={styles.titleBlock}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text variant="body">{subtitle}</Text>}
            </FadeUp>
          )}
          {children}
        </ScrollView>
        {!hideFooter && (
          <FadeUp stagger={4} style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
            {footerExtra}
            {footer ?? (
              <PillButton
                label={continueLabel}
                variant="primary"
                size="lg"
                fullWidth
                disabled={!canContinue}
                onPress={onContinue}
                iconRight={<ArrowRight size={18} color={colors.primaryButtonText} />}
              />
            )}
          </FadeUp>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerWrap: { paddingHorizontal: 20 },
  titleBlock: { marginBottom: 32 },
  title: {
    fontFamily: fonts.serif,
    fontWeight: '700',
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  footer: { paddingHorizontal: 20, paddingTop: 12, gap: 14 },
});
