import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Animated from '@/components/ui/Animated';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius, springs } from '@/theme';
import { Text } from './Text';

type Props = {
  label?: string;
  onPress?: () => void;
  /** primary = white pill w/ dark text (.btn-primary); default = dark glass (.btn-pill); ghost = transparent; danger = red text */
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  /** Haptic on press. Reserve for meaningful moments (book, confirm, approve); default none. */
  haptic?: Haptic;
};

type Haptic = 'none' | 'selection' | 'success';

function fireHaptic(h: Haptic) {
  if (h === 'selection') Haptics.selectionAsync();
  else if (h === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** .btn-pill — pill button that springs down to scale(0.96) on press. */
export function PillButton({
  label,
  onPress,
  variant = 'default',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  disabled,
  style,
  children,
  haptic = 'none',
}: Props) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const textColor =
    variant === 'primary' ? colors.primaryButtonText : variant === 'danger' ? colors.accentDanger : colors.textPrimary;

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={() => (scale.value = withSpring(0.96, springs.gentle))}
      onPressOut={() => (scale.value = withSpring(1, springs.gentle))}
      onPress={() => {
        fireHaptic(haptic);
        onPress?.();
      }}
      style={[
        styles.base,
        sizes[size],
        variantStyles[variant],
        fullWidth && { alignSelf: 'stretch' },
        disabled && { opacity: 0.4 },
        animated,
        style,
      ]}
    >
      {icon}
      {label !== undefined && (
        <Text style={{ color: textColor, fontFamily: fonts.medium, fontSize: size === 'lg' ? 16 : size === 'sm' ? 12 : 14 }}>
          {label}
        </Text>
      )}
      {children}
      {iconRight}
    </AnimatedPressable>
  );
}

/** Round icon-only control (.btn-icon / .back-btn / .btn-action round). */
export function IconButton({
  children,
  onPress,
  size = 40,
  variant = 'default',
  style,
  haptic = 'none',
}: {
  children: ReactNode;
  onPress?: () => void;
  size?: number;
  variant?: 'default' | 'primary' | 'accent';
  style?: StyleProp<ViewStyle>;
  haptic?: Haptic;
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.92, springs.gentle))}
      onPressOut={() => (scale.value = withSpring(1, springs.gentle))}
      onPress={() => {
        fireHaptic(haptic);
        onPress?.();
      }}
      hitSlop={6}
      style={[
        styles.icon,
        { width: size, height: size, borderRadius: size / 2 },
        variant === 'primary' && variantStyles.primary,
        variant === 'accent' && { backgroundColor: colors.accentMatch, borderColor: 'transparent' },
        animated,
        style,
      ]}
    >
      <View>{children}</View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.controlBg,
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
});

const sizes = StyleSheet.create({
  sm: { paddingVertical: 8, paddingHorizontal: 14 },
  md: { paddingVertical: 12, paddingHorizontal: 20 },
  lg: { paddingVertical: 16, paddingHorizontal: 24 },
});

const variantStyles = StyleSheet.create({
  default: { backgroundColor: colors.controlBg, borderColor: colors.controlBorder },
  primary: {
    backgroundColor: colors.primaryButtonBg,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  ghost: { backgroundColor: 'transparent', borderColor: colors.controlBorder },
  danger: { backgroundColor: colors.controlBg, borderColor: 'rgba(226, 125, 96, 0.25)' },
});
