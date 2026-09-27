import { useCallback, useEffect, useMemo } from 'react';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { randomAvatarColorIndex } from '@/lib/avatarColors';
import { GreenApiClient } from '@/lib/greenApi';
import { makeId } from '@/lib/utils';
import type { Chat, RemoteChat } from '@/types/chat';

export function useChats(client: GreenApiClient | null) {
  const [chats, setChats] = useLocalStorage<Chat[]>('chats', []);
  const [activeChatId, setActiveChatId] = useLocalStorage<string>('activeChatId', '');

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId),
    [chats, activeChatId],
  );

  // Миграция: назначаем цвет чатам, созданным до появления colorIndex.
  useEffect(() => {
    if (chats.some((chat) => chat.colorIndex === undefined)) {
      setChats((current) =>
        current.map((chat) =>
          chat.colorIndex === undefined ? { ...chat, colorIndex: randomAvatarColorIndex() } : chat,
        ),
      );
    }
  }, [chats, setChats]);

  useEffect(() => {
    if (!chats.length) {
      if (activeChatId) setActiveChatId('');
      return;
    }

    if (!chats.some((chat) => chat.id === activeChatId)) {
      setActiveChatId(chats[0].id);
    }
  }, [activeChatId, chats, setActiveChatId]);

  const createChat = useCallback(
    async (chatId: string, title: string) => {
      const raw = chatId.trim();
      if (!raw) return;

      let normalizedChatId = raw;
      const digits = raw.replace(/^\+/, '').replace(/\D/g, '');
      const looksLikePhone = /^\+?\d{10,15}$/.test(raw.replace(/[\s()-]/g, ''));

      if (looksLikePhone && client) {
        const account = await client.checkAccount(Number(digits));
        if (!account?.exist || !account.chatId) {
          throw new Error('Аккаунт с таким номером не найден в мессенджере инстанса.');
        }
        normalizedChatId = account.chatId;
      }

      const existing = chats.find((chat) => chat.chatId === normalizedChatId);
      if (existing) {
        setActiveChatId(existing.id);
        return;
      }

      const now = Date.now();
      const chat: Chat = {
        id: makeId(),
        chatId: normalizedChatId,
        title: title.trim() || normalizedChatId,
        createdAt: now,
        updatedAt: now,
        colorIndex: randomAvatarColorIndex(),
      };

      setChats((current) => [chat, ...current]);
      setActiveChatId(chat.id);
    },
    [chats, client, setActiveChatId],
  );

  const renameChat = useCallback((chat: Chat, title: string) => {
    setChats((current) => current.map((item) => (item.id === chat.id ? { ...item, title } : item)));
  }, []);

  const removeChat = useCallback(
    (chat: Chat) => {
      setChats((current) => current.filter((item) => item.id !== chat.id));
      setActiveChatId((current) => (current === chat.id ? '' : current));
    },
    [setActiveChatId],
  );

  const touchChat = useCallback((chatId: string, timestamp: number) => {
    setChats((current) =>
      current.map((chat) => (chat.chatId === chatId ? { ...chat, updatedAt: timestamp } : chat)),
    );
  }, []);

  const upsertIncomingChat = useCallback(
    (data: { chatId: string; title: string; timestamp: number }) => {
      setChats((current) => {
        const existing = current.find((chat) => chat.chatId === data.chatId);
        if (existing) {
          return current.map((chat) =>
            chat.chatId === data.chatId ? { ...chat, updatedAt: data.timestamp } : chat,
          );
        }

        const chat: Chat = {
          id: makeId(),
          chatId: data.chatId,
          title: data.title,
          createdAt: data.timestamp,
          updatedAt: data.timestamp,
          colorIndex: randomAvatarColorIndex(),
        };
        return [chat, ...current];
      });
    },
    [],
  );

  const mergeRemoteChats = useCallback((remoteChats: RemoteChat[]) => {
    if (!remoteChats.length) return;

    const now = Date.now();
    const seen = new Set<string>();

    setChats((current) => {
      const byChatId = new Map(current.map((chat) => [chat.chatId, chat]));
      const merged: Chat[] = [];

      for (const remote of remoteChats) {
        // WhatsApp-инстансы отдают `id` (number@c.us), Telegram/MAX — `chatId` (числовой).
        const chatId = (remote.chatId ?? remote.id)?.trim();
        if (!chatId || seen.has(chatId)) continue;
        seen.add(chatId);

        const existing = byChatId.get(chatId);
        if (existing) {
          byChatId.delete(chatId);
          const remoteName = remote.name?.trim();
          const keepLocalTitle = existing.title !== existing.chatId || !remoteName;
          merged.push(keepLocalTitle ? existing : { ...existing, title: remoteName });
          continue;
        }

        merged.push({
          id: makeId(),
          chatId,
          title: remote.name?.trim() || chatId,
          createdAt: now,
          updatedAt: now,
          colorIndex: randomAvatarColorIndex(),
        });
      }

      return [...merged, ...byChatId.values()];
    });
  }, []);

  return {
    chats,
    activeChat,
    activeChatId,
    setActiveChatId,
    createChat,
    renameChat,
    removeChat,
    touchChat,
    upsertIncomingChat,
    mergeRemoteChats,
  };
}
