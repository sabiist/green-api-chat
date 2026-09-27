import { useCallback } from 'react';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { makeId, normalizeOutgoingStatus } from '@/lib/utils';
import type { ChatHistoryMessage, ChatMessage } from '@/types/chat';

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

  const mergeHistory = useCallback(
    (chatId: string, history: ChatHistoryMessage[]) => {
      setMessages((current) => {
        const list = current[chatId] ?? [];
        const knownRemoteIds = new Set(
          list.map((message) => message.remoteId).filter((id): id is string => Boolean(id)),
        );

        const restored: ChatMessage[] = [];
        for (const item of history) {
          if (!item.idMessage || knownRemoteIds.has(item.idMessage)) continue;

          const text = item.textMessage ?? item.extendedTextMessage?.text ?? '';
          if (!text.trim()) continue;

          knownRemoteIds.add(item.idMessage);
          const outgoing = item.type === 'outgoing';
          restored.push({
            id: makeId(),
            chatId,
            text,
            direction: outgoing ? 'outgoing' : 'incoming',
            timestamp: item.timestamp ? item.timestamp * 1000 : Date.now(),
            status: outgoing ? (normalizeOutgoingStatus(item.statusMessage) ?? 'sent') : undefined,
            remoteId: item.idMessage,
          });
        }

        if (!restored.length) return current;

        const merged = [...list, ...restored].sort((a, b) => a.timestamp - b.timestamp);
        return { ...current, [chatId]: merged };
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
    mergeHistory,
  };
}
