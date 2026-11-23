import { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

/** .requests-header: h3-sized title on the left, mono meta on the right. */
export function SectionHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, marginBottom: 12 }}>
      <Text variant="title" style={{ fontSize: 18 }}>{title}</Text>
      {right}
    </View>
  );
}
