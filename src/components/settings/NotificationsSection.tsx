import type { Role } from '@/data/types';
import { Toggle } from '@/components/ui';
import { useAppState } from '@/store/AppState';
import { SettingRow, SettingsSection } from './SettingsSection';

type Key = 'matches' | 'bookings' | 'marketing';

const COPY: Record<Role, Record<Key, { label: string; hint: string }>> = {
  renter: {
    matches: { label: 'New Kitchen Alerts', hint: 'When a kitchen that fits 80%+ is listed' },
    bookings: { label: 'Booking Updates', hint: 'Confirmations and schedule changes' },
    marketing: { label: 'Marketing & Tips', hint: 'Product news and local kitchen insights' },
  },
  host: {
    matches: { label: 'New Booking Requests', hint: 'When a renter who fits 80%+ requests your space' },
    bookings: { label: 'Schedule Updates', hint: 'Confirmations, cancellations and check-ins' },
    marketing: { label: 'Marketing & Tips', hint: 'Product news and local demand insights' },
  },
};

export function NotificationsSection({ side, index }: { side: Role; index: number }) {
  const { notifications, setNotification } = useAppState();
  return (
    <SettingsSection title="Notifications" index={index}>
      {(Object.keys(COPY[side]) as Key[]).map((k) => (
        <SettingRow key={k} label={COPY[side][k].label} hint={COPY[side][k].hint}>
          <Toggle value={notifications[k]} onChange={(v) => setNotification(k, v)} />
        </SettingRow>
      ))}
    </SettingsSection>
  );
}
