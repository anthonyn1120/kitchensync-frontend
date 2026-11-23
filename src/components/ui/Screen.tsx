import { ReactNode } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '@/theme';
import { Text } from './Text';
import { IconButton } from './PillButton';

export const TAB_BAR_SPACE = 110; // bottom padding so content clears the floating tab bar

type Props = {
  children: ReactNode;
  /** Wrap content in a ScrollView */
  scroll?: boolean;
  /** Leave room for the floating tab bar (true on tab screens) */
  withTabBar?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Standard screen container: transparent (Background shows through), safe-area
 * top padding, 20px side gutters.
 */
export function Screen({ children, scroll, withTabBar, style, contentStyle }: Props) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + 8,
    paddingHorizontal: 20,
    paddingBottom: withTabBar ? TAB_BAR_SPACE + insets.bottom : insets.bottom + 16,
  };
  if (scroll) {
    return (
      <ScrollView
        style={[{ flex: 1 }, style]}
        contentContainerStyle={[padding, contentStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }
  return <View style={[{ flex: 1 }, padding, style, contentStyle]}>{children}</View>;
}

/** .nav-header — round back button + mono label (e.g. "Step 1 of 3"). */
export function NavHeader({ label, onBack, right }: { label?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
      <IconButton onPress={onBack ?? (() => router.back())}>
        <ChevronLeft size={20} color={colors.textPrimary} />
      </IconButton>
      {label && <Text variant="mono">{label}</Text>}
      {right && <View style={{ marginLeft: 'auto' }}>{right}</View>}
    </View>
  );
}

/** Large page title + optional mono subtitle, used at the top of tab screens. */
export function PageTitle({ title, eyebrow, right }: { title: string; eyebrow?: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20, marginTop: 8 }}>
      <View style={{ flex: 1 }}>
        {eyebrow && <Text variant="mono" style={{ marginBottom: 6 }}>{eyebrow}</Text>}
        <Text variant="h2">{title}</Text>
      </View>
      {right}
    </View>
  );
}

/** .section-title — mono label with a hairline underneath. */
export function SectionTitle({ children, right }: { children: string; right?: ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: colors.white10,
        paddingBottom: 8,
        marginBottom: 12,
      }}
    >
      <Text variant="mono">{children}</Text>
      {right}
    </View>
  );
}
