import { useCallback } from 'react';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { makeId } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';

export function useMessages() {
  const [messages, setMessages] = useLocalStorage<Record<string, ChatMessage[]>>('messages', {});

  const appendMessage = useCallback(
    (chatId: string, message: ChatMessage) => {
      setMessages((current) => ({
        ...current,
        [chatId]: [...(current[chatId] ?? []), message],
      }));
    },
    [setMessages],
  );

  const patchMessage = useCallback(
    (chatId: string, messageId: string, patch: Partial<ChatMessage>) => {
      setMessages((current) => ({
        ...current,
        [chatId]: (current[chatId] ?? []).map((message) =>
          message.id === messageId ? { ...message, ...patch } : message,
        ),
      }));
    },
    [setMessages],
  );

  const addIncomingMessage = useCallback(
    (data: Omit<ChatMessage, 'id' | 'direction'>) => {
      setMessages((current) => {
        const list = current[data.chatId] ?? [];
        if (data.remoteId && list.some((message) => message.remoteId === data.remoteId)) {
          return current;
        }

        const incoming: ChatMessage = { ...data, id: makeId(), direction: 'incoming' };
        return {
          ...current,
          [data.chatId]: [...list, incoming],
        };
      });
    },
    [setMessages],
  );

  const updateStatusByRemoteId = useCallback(
    (remoteId: string, status: ChatMessage['status']) => {
      setMessages((current) => {
        const next: Record<string, ChatMessage[]> = {};
        for (const [chatId, list] of Object.entries(current)) {
          next[chatId] = list.map((message) =>
            message.remoteId === remoteId ? { ...message, status } : message,
          );
        }
        return next;
      });
    },
    [setMessages],
  );

  const clearChat = useCallback(
    (chatId: string) => {
      setMessages((current) => {
        const next = { ...current };
        delete next[chatId];
        return next;
      });
    },
    [setMessages],
  );

  return {
    messages,
    appendMessage,
    patchMessage,
    addIncomingMessage,
    updateStatusByRemoteId,
    clearChat,
  };
}
