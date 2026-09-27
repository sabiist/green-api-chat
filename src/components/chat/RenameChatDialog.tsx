import { useEffect, useState, type FormEvent } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { inputClass, labelClass, primaryButtonClass } from '@/lib/controls';
import type { Chat } from '@/types/chat';

type Props = {
  chat: Chat | null;
  onClose: () => void;
  onRename: (chat: Chat, title: string) => void;
};

export function RenameChatDialog({ chat, onClose, onRename }: Props) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (chat) setValue(chat.title);
  }, [chat]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!chat) return;

    const title = value.trim();
    if (title) onRename(chat, title);
    onClose();
  };

  return (
    <Dialog open={Boolean(chat)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Изменить имя чата</DialogTitle>
          <DialogDescription>Имя меняется только локально в интерфейсе</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="rename-chat">
              Имя чата
            </label>
            <input
              id="rename-chat"
              className={inputClass}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoComplete="off"
              autoFocus
            />
          </div>
          <button className={`${primaryButtonClass} w-full`} type="submit">
            Сохранить
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
