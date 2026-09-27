import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Check, CheckCheck, Clock, CircleAlert, Info, X } from 'lucide-react';

import { avatarColorFor } from '@/lib/avatarColors';
import { textareaClass } from '@/lib/controls';
import { SendIcon } from '@/components/chat/icons';
import { formatDay, formatTime } from '@/lib/format';
import { cx } from '@/lib/cx';
import type { Chat, ChatMessage } from '@/types/chat';

type Props = {
  chat?: Chat;
  messages: ChatMessage[];
  sending: boolean;
  error?: string | null;
  onSend: (text: string) => Promise<void> | void;
};

function initials(title: string) {
  return (
    title
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '•'
  );
}

function StatusIcon({ status }: { status?: ChatMessage['status'] }) {
  if (!status) return null;
  if (status === 'sending') return <Clock className="size-3.5" />;
  if (status === 'error') return <CircleAlert className="text-destructive size-3.5" />;
  if (status === 'sent') return <Check className="size-3.5" />;
  if (status === 'delivered') return <CheckCheck className="size-4" />;
  if (status === 'read') return <CheckCheck className="text-success size-4" />;
  return null;
}

export function ChatWindow({ chat, messages, sending, error, onSend }: Props) {
  const [text, setText] = useState('');
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const visibleError = error && error !== dismissedError ? error : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, chat?.id]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const value = text.trim();
    if (!value || !chat) return;
    setText('');
    void onSend(value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  if (!chat) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-white p-8 text-center text-slate-500">
        Выберите чат слева или создайте новый
      </div>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <header className="flex items-center gap-3 border-b px-5 py-4">
        <div
          className={cx(
            'flex size-10 items-center justify-center rounded-full text-sm font-semibold',
            avatarColorFor(chat.chatId, chat.colorIndex).bg,
            avatarColorFor(chat.chatId, chat.colorIndex).text,
          )}
        >
          {initials(chat.title)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{chat.title}</div>
          <div className="truncate text-xs text-slate-500">{chat.chatId}</div>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-5">
        {messages.length ? (
          messages.map((message, index) => {
            const outgoing = message.direction === 'outgoing';
            const previous = messages[index - 1];
            const showDay =
              !previous ||
              new Date(previous.timestamp).toDateString() !==
                new Date(message.timestamp).toDateString();

            return (
              <Fragment key={message.id}>
                {showDay ? (
                  <div className="flex justify-center">
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-400 shadow-sm">
                      {formatDay(message.timestamp)}
                    </span>
                  </div>
                ) : null}

                <div
                  className={cx('flex items-end gap-2', outgoing ? 'justify-end' : 'justify-start')}
                >
                  {outgoing ? (
                    <div className="flex items-center gap-1 pb-1 text-[11px] text-slate-400">
                      <span>{formatTime(message.timestamp)}</span>
                      <StatusIcon status={message.status} />
                    </div>
                  ) : null}

                  <div
                    className={cx(
                      'max-w-[78%] rounded-lg px-4 py-2 text-sm shadow-sm',
                      outgoing
                        ? 'bg-primary rounded-br-md text-white'
                        : 'rounded-bl-md border bg-white text-slate-900',
                    )}
                  >
                    <div className="leading-6 wrap-break-word whitespace-pre-wrap">
                      {message.text}
                    </div>
                  </div>

                  {!outgoing ? (
                    <div className="pb-1 text-[11px] text-slate-400">
                      {formatTime(message.timestamp)}
                    </div>
                  ) : null}
                </div>
              </Fragment>
            );
          })
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Сообщений пока нет. Напишите первое сообщение
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="border-t bg-white p-4" onSubmit={submit}>
        {visibleError ? (
          <div className="text-destructive-dark border-destructive-border bg-destructive-soft mb-3 flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
            <span>{visibleError}</span>
            <button
              type="button"
              onClick={() => setDismissedError(visibleError)}
              className="hover:bg-destructive-border/50 text-destructive-dark -mr-1 inline-flex size-6 shrink-0 items-center justify-center rounded-sm transition"
              aria-label="Закрыть"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}
        <div className="relative">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onKeyDown}
            name="message"
            placeholder="Введите текстовое сообщение"
            className={cx(textareaClass, 'h-16 resize-none scrollbar-none pr-12')}
          />
          <div className="group absolute top-2 right-1 cursor-help text-slate-400">
            <Info className="size-4" />
            <div className="pointer-events-none absolute right-0 bottom-full z-10 mb-1.5 hidden w-max max-w-56 rounded-md bg-[#000000] px-2.5 py-1.5 text-xs leading-4 text-white shadow-lg group-hover:block">
              Enter — отправить, Shift+Enter — новая строка
            </div>
          </div>
          <button
            className="bg-primary hover:bg-primary-dark absolute right-1 bottom-2.5 inline-flex size-8 items-center justify-center rounded-md text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={sending || !text.trim()}
            type="submit"
            aria-label="Отправить"
          >
            <SendIcon className="size-4" />
          </button>
        </div>
      </form>
    </section>
  );
}
