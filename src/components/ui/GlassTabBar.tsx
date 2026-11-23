import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { colors, fonts, radius, shadows } from '@/theme';
import { Text } from './Text';

/**
 * Floating frosted tab bar — the mobile stand-in for the desktop sidebar.
 * The active tab gets the sidebar's ".nav-item.active" treatment (white 12% pill).
 * Each screen supplies its icon via options.tabBarIcon and its label via options.title.
 */
export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Screens can hide the bar (e.g. chat) via tabBarStyle: { display: 'none' }.
  const focusedStyle = StyleSheet.flatten(
    descriptors[state.routes[state.index].key].options.tabBarStyle as StyleProp<ViewStyle>,
  );
  if (focusedStyle?.display === 'none') return null;

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={styles.shadow}>
        <View style={styles.bar}>
          <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassBgPrimary }]} />
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.border]} />
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            // Routes hidden with href: null (expo-router) shouldn't render a tab.
            if ((options as { href?: unknown }).href === null) return null;
            const focused = state.index === index;
            const color = focused ? colors.textPrimary : colors.textTertiary;
            const label = options.title ?? route.name;
            const badge = options.tabBarBadge;

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                onPress={() => {
                  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                  }
                }}
                style={[styles.item, focused && styles.itemActive]}
              >
                <View>
                  {options.tabBarIcon?.({ focused, color, size: 20 })}
                  {badge !== undefined && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.label, { color }]} numberOfLines={1}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16 },
  shadow: { ...shadows.ambient, borderRadius: radius.panel },
  bar: {
    flexDirection: 'row',
    borderRadius: radius.panel,
    overflow: 'hidden',
    padding: 6,
    gap: 4,
  },
  border: {
    borderRadius: radius.panel,
    borderWidth: 1,
    borderColor: colors.glassBorderDim,
    borderTopColor: colors.glassBorderLight,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 30,
    gap: 4,
  },
  itemActive: { backgroundColor: colors.white12 },
  label: { fontFamily: fonts.medium, fontSize: 10.5 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -9,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.accentDanger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.monoMedium, fontSize: 9, color: '#FFFFFF' },
});
