import { useEffect, useState } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Text } from '@/components/ui';

type Props = {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  delay?: number;
  style?: StyleProp<TextStyle>;
};

export const formatInt = (n: number) => Math.round(n).toLocaleString('en-US');
export const formatUSD = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

/** Number that eases up from 0 to `value` (ease-out cubic) whenever `value` changes. */
export function CountUp({ value, format = formatInt, duration = 1100, delay = 0, style }: Props) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let raf = 0;
    const from = 0;
    const startAt = Date.now() + delay;
    const tick = () => {
      const t = Math.min(1, Math.max(0, (Date.now() - startAt) / duration));
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(from + (value - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay]);

  return <Text style={style}>{format(shown)}</Text>;
}
