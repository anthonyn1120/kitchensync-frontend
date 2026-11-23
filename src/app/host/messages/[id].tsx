import { useLocalSearchParams } from 'expo-router';
import { ChatScreen } from '@/components/messages';

export default function HostChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChatScreen side="host" id={id} />;
}
