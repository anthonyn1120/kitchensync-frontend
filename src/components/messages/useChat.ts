import { useMemo, useSyncExternalStore } from 'react';
import { useAppState } from '@/store/AppState';
import { chatStore, mergeItems, Side } from './chatData';

/** Live extras (simulated replies, system messages, confirmation) for one conversation. */
export function useChatExtras(side: Side, id: string) {
  return useSyncExternalStore(chatStore.subscribe, () => chatStore.get(side, id));
}

/** Conversation + its merged item list (store messages interleaved with local extras). */
export function useChat(side: Side, id: string) {
  const { conversations } = useAppState();
  const conv = conversations[side].find((c) => c.id === id);
  const extras = useChatExtras(side, id);
  const items = useMemo(() => mergeItems(conv?.messages ?? [], extras.items), [conv?.messages, extras.items]);
  return { conv, items, typing: extras.typing, confirmed: extras.confirmed };
}

/** All extras, for list previews. */
export function useAllChatExtras() {
  return useSyncExternalStore(chatStore.subscribe, chatStore.getAll);
}
