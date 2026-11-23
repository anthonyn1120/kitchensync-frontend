import { Redirect } from 'expo-router';
import { useAppState } from '@/store/AppState';

/** Entry: send new users through onboarding, everyone else to their mode's home tab. */
export default function Index() {
  const { onboarded, role } = useAppState();
  if (!onboarded || !role) return <Redirect href="/onboarding" />;
  return <Redirect href={role === 'host' ? '/host/dashboard' : '/renter/find-space'} />;
}
