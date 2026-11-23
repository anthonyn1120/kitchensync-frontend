import { useLocalSearchParams } from 'expo-router';
import { ChatScreen } from '@/components/messages';

export default function RenterChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChatScreen side="renter" id={id} />;
}
