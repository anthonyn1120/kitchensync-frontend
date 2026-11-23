import { View } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/theme';
import { Text } from './Text';

/** .avatar — round glass circle holding an emoji or a photo. */
export function Avatar({ emoji, uri, size = 44, online }: { emoji?: string; uri?: string; size?: number; online?: boolean }) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.white10,
          borderWidth: 1,
          borderColor: colors.glassBorderLight,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: size, height: size }} contentFit="cover" transition={200} />
        ) : (
          <Text style={{ fontSize: size * 0.42 }}>{emoji}</Text>
        )}
      </View>
      {online && (
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: size * 0.26,
            height: size * 0.26,
            borderRadius: size,
            backgroundColor: colors.accentMatch,
            borderWidth: 2,
            borderColor: '#3e4a3e',
          }}
        />
      )}
    </View>
  );
}
