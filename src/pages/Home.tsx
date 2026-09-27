import { useCallback, useEffect, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import logoUrl from '@/assets/header-logo.svg';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { LoginPanel } from '@/components/chat/LoginPanel';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { RenameChatDialog } from '@/components/chat/RenameChatDialog';
import { SwitchInstanceIcon } from '@/components/chat/icons';
import { useChats } from '@/hooks/useChats';
import { useCredentials } from '@/hooks/useCredentials';
import { useGreenApiPolling } from '@/hooks/useGreenApiPolling';
import { useMessages } from '@/hooks/useMessages';
import { useSidebar } from '@/hooks/useSidebar';
import { errorMessage, makeId, normalizeOutgoingStatus } from '@/lib/utils';
import type { Chat, ChatMessage, IncomingNotification } from '@/types/chat';

export default function Home() {
  const { credentials, client, connecting, authError, connect, logout } = useCredentials();
  const {
    chats,
    activeChat,
    setActiveChatId,
    createChat,
    renameChat,
    removeChat,
    touchChat,
    upsertIncomingChat,
    mergeRemoteChats,
  } = useChats(client);
  const {
    messages,
    appendMessage,
    patchMessage,
    addIncomingMessage,
    updateStatusByRemoteId,
    clearChat,
  } = useMessages();
  const {
    sidebarRef,
    sidebarWidth,
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarResizing,
    startSidebarResize,
  } = useSidebar();

  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [renamingChat, setRenamingChat] = useState<Chat | null>(null);
  const [deletingChat, setDeletingChat] = useState<Chat | null>(null);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const activeMessages = activeChat ? (messages[activeChat.chatId] ?? []) : [];

  const confirmDeleteChat = () => {
    const chat = deletingChat;
    if (!chat) return;

    removeChat(chat);
    clearChat(chat.chatId);
    setDeletingChat(null);
  };

  const sendMessage = async (text: string) => {
    if (!client || !activeChat) return;

    const localMessage: ChatMessage = {
      id: makeId(),
      chatId: activeChat.chatId,
      text,
      direction: 'outgoing',
      timestamp: Date.now(),
      status: 'sending',
    };

    appendMessage(activeChat.chatId, localMessage);
    touchChat(activeChat.chatId, Date.now());
    setSending(true);
    setChatError(null);

    try {
      const response = await client.sendMessage(activeChat.chatId, text);
      patchMessage(activeChat.chatId, localMessage.id, {
        status: 'sent',
        remoteId: response.idMessage,
      });
    } catch (error) {
      patchMessage(activeChat.chatId, localMessage.id, { status: 'error' });
      setChatError(errorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const handleNotification = useCallback(
    (notification: NonNullable<IncomingNotification>) => {
      const body = notification.body;
      if (!body?.typeWebhook) return;

      if (body.typeWebhook.includes('outgoingMessageStatus')) {
        const status = normalizeOutgoingStatus(body.status);
        if (body.idMessage && status) {
          updateStatusByRemoteId(body.idMessage, status);
        }
        return;
      }

      if (!body.typeWebhook.includes('incomingMessage')) return;

      const text =
        body.messageData?.textMessageData?.textMessage ??
        body.messageData?.extendedTextMessageData?.text ??
        '';
      const chatId = body.senderData?.chatId ?? body.senderData?.sender ?? '';

      if (!text.trim() || !chatId) return;

      const timestamp = body.timestamp ? body.timestamp * 1000 : Date.now();

      upsertIncomingChat({
        chatId,
        title: body.senderData?.senderName ?? body.senderData?.chatName ?? chatId,
        timestamp,
      });
      addIncomingMessage({
        chatId,
        text,
        timestamp,
        remoteId: body.idMessage,
        receiptId: notification.receiptId,
      });
    },
    [addIncomingMessage, updateStatusByRemoteId, upsertIncomingChat],
  );

  useGreenApiPolling({
    client,
    enabled: Boolean(client),
    onNotification: handleNotification,
    onError: useCallback((error: unknown) => setChatError(errorMessage(error)), []),
  });

  useEffect(() => {
    if (!client) return;

    let cancelled = false;
    client
      .getChats()
      .then((remoteChats) => {
        if (!cancelled) mergeRemoteChats(remoteChats);
      })
      .catch((error) => {
        if (!cancelled) setChatError(errorMessage(error));
      });

    return () => {
      cancelled = true;
    };
  }, [client, mergeRemoteChats]);

  const handleLogout = () => {
    setChatError(null);
    logout();
  };

  if (!credentials) {
    return <LoginPanel connecting={connecting} error={authError} onConnect={connect} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="h-16 border-b bg-white">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="GREEN-API" className="h-9 w-9" />
            <div className="text-primary text-xl font-extrabold tracking-wide">GREEN-API Chat</div>
          </div>

          <div className="group relative">
            <button
              type="button"
              aria-label="Сменить инстанс"
              className="hover:bg-primary-lighter hover:text-primary-dark inline-flex size-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition"
              onClick={() => setConfirmLogoutOpen(true)}
            >
              <SwitchInstanceIcon className="size-5" />
            </button>
            <span className="pointer-events-none absolute top-11 right-0 z-20 rounded-md bg-black px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100">
              Сменить инстанс
            </span>
          </div>
        </div>
      </header>

      <main className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <aside
          ref={sidebarRef}
          style={{ width: sidebarCollapsed ? 72 : sidebarWidth }}
          className={`relative flex min-h-0 shrink-0 flex-col border-r bg-white${
            sidebarResizing ? '' : 'transition-[width] duration-200'
          }`}
        >
          <div
            className={
              sidebarCollapsed
                ? 'flex justify-center px-3 pt-4 pb-2'
                : 'flex items-center justify-between px-4 pt-4 pb-2'
            }
          >
            {sidebarCollapsed ? null : (
              <div className="flex items-baseline gap-2">
                <h2 className="text-sm font-semibold text-slate-700">Чаты</h2>
                <span className="text-xs text-slate-400">{chats.length}</span>
              </div>
            )}
            <button
              type="button"
              aria-label={sidebarCollapsed ? 'Развернуть список чатов' : 'Свернуть список чатов'}
              className="hover:text-primary-dark inline-flex size-8 items-center justify-center rounded-md text-slate-500 transition"
              onClick={() => setSidebarCollapsed((value) => !value)}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="size-5" aria-hidden="true" />
              ) : (
                <PanelLeftClose className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pt-1 pb-20">
            <ChatList
              chats={chats}
              activeChatId={activeChat?.id}
              collapsed={sidebarCollapsed}
              onSelect={setActiveChatId}
              onRename={setRenamingChat}
              onDelete={setDeletingChat}
            />
          </div>

          <div
            className={
              sidebarCollapsed
                ? 'absolute bottom-4 left-1/2 -translate-x-1/2'
                : 'absolute right-4 bottom-4'
            }
          >
            <NewChatDialog onCreate={createChat} />
          </div>
        </aside>

        {sidebarCollapsed ? null : (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Изменить ширину списка чатов"
            className="hover:bg-success w-1 cursor-col-resize bg-slate-200 transition-colors"
            onMouseDown={startSidebarResize}
          />
        )}

        <section className="min-w-0 flex-1 bg-slate-100">
          <ChatWindow
            chat={activeChat}
            messages={activeMessages}
            sending={sending}
            error={chatError}
            onSend={sendMessage}
          />
        </section>
      </main>

      <RenameChatDialog
        chat={renamingChat}
        onClose={() => setRenamingChat(null)}
        onRename={renameChat}
      />

      <ConfirmDialog
        open={Boolean(deletingChat)}
        title="Удалить чат?"
        description={
          <>
            Вы уверены, что хотите удалить чат «{deletingChat?.title}»? История сообщений тоже будет
            удалена
          </>
        }
        confirmLabel="Удалить"
        onConfirm={confirmDeleteChat}
        onCancel={() => setDeletingChat(null)}
      />

      <ConfirmDialog
        open={confirmLogoutOpen}
        title="Сменить инстанс?"
        description="Вы уверены, что хотите сменить инстанс? Текущие учётные данные будут удалены из этого браузера"
        confirmLabel="Сменить"
        onConfirm={() => {
          setConfirmLogoutOpen(false);
          handleLogout();
        }}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
    </div>
  );
}
