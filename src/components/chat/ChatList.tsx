import { EllipsisVertical } from 'lucide-react';

import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/components/ui/Menu';
import { avatarColorFor } from '@/lib/avatarColors';
import { menuButtonClass } from '@/lib/controls';
import { formatDate } from '@/lib/format';
import { cx } from '@/lib/cx';
import type { Chat } from '@/types/chat';

type Props = {
  chats: Chat[];
  activeChatId?: string;
  collapsed?: boolean;
  onSelect: (chatId: string) => void;
  onRename: (chat: Chat) => void;
  onDelete: (chat: Chat) => void;
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

function ChatAvatar({ chat }: { chat: Chat }) {
  const color = avatarColorFor(chat.chatId, chat.colorIndex);
  return (
    <div
      className={cx(
        'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
        color.bg,
        color.text,
      )}
    >
      {initials(chat.title)}
    </div>
  );
}

export function ChatList({ chats, activeChatId, collapsed, onSelect, onRename, onDelete }: Props) {
  if (!chats.length) {
    return collapsed ? null : (
      <div className="rounded-lg border border-dashed bg-white p-6 text-sm text-slate-500">
        Чатов пока нет
      </div>
    );
  }

  if (collapsed) {
    return (
      <div className="space-y-1">
        {chats.map((chat) => {
          const active = chat.id === activeChatId;
          return (
            <button
              key={chat.id}
              type="button"
              title={chat.title}
              onClick={() => onSelect(chat.id)}
              className={cx(
                'flex w-full items-center justify-center rounded-lg py-1.5 transition-colors',
                active ? 'bg-primary shadow-sm' : 'hover:bg-primary-light',
              )}
            >
              <ChatAvatar chat={chat} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {chats.map((chat) => {
        const active = chat.id === activeChatId;
        return (
          <div
            key={chat.id}
            className={cx(
              'flex w-full items-center gap-1 rounded-lg pr-1 transition-colors',
              active ? 'bg-primary text-white shadow-sm' : 'hover:bg-primary-light',
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(chat.id)}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-l-lg px-3 py-3 text-left"
            >
              <ChatAvatar chat={chat} />
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{chat.title}</div>
                  <div
                    className={cx(
                      'truncate text-xs',
                      active ? 'text-primary-lighter' : 'text-slate-500',
                    )}
                  >
                    {chat.chatId}
                  </div>
                </div>
                <div
                  className={cx(
                    'shrink-0 text-xs',
                    active ? 'text-primary-lighter' : 'text-slate-400',
                  )}
                >
                  {formatDate(chat.updatedAt)}
                </div>
              </div>
            </button>

            <Menu>
              <MenuTrigger
                aria-label="Меню чата"
                className={cx(
                  menuButtonClass,
                  active
                    ? 'text-white hover:bg-white/20'
                    : 'hover:bg-primary-light hover:text-primary-dark text-slate-500',
                )}
              >
                <EllipsisVertical className="size-5" aria-hidden="true" />
              </MenuTrigger>
              <MenuContent>
                <MenuItem
                  className={cx(
                    'data-[highlighted]:bg-primary-light data-[highlighted]:text-primary-dark rounded-t-md',
                  )}
                  onClick={() => onRename(chat)}
                >
                  Изменить имя
                </MenuItem>
                <MenuItem
                  className={cx(
                    'text-destructive data-[highlighted]:bg-destructive-soft data-[highlighted]:text-destructive-dark rounded-b-md',
                  )}
                  onClick={() => onDelete(chat)}
                >
                  Удалить чат
                </MenuItem>
              </MenuContent>
            </Menu>
          </div>
        );
      })}
    </div>
  );
}
