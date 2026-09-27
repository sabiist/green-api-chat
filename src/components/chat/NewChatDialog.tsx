import { useState, type FormEvent } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { inputClass, labelClass, primaryButtonClass } from '@/lib/controls';
import { ChatPlusIcon } from '@/components/chat/icons';

type Props = {
  onCreate: (chatId: string, title: string) => Promise<void> | void;
};

export function NewChatDialog({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState('');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const normalized = chatId.trim();
    if (!normalized || busy) return;

    setBusy(true);
    setError(null);

    try {
      await onCreate(normalized, title.trim() || normalized);
      setChatId('');
      setTitle('');
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось создать чат.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label="Создать чат"
        className="bg-primary hover:bg-primary-dark inline-flex size-12 items-center justify-center rounded-full text-white shadow-lg transition"
      >
        <ChatPlusIcon className="size-6" />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый чат</DialogTitle>
          <DialogDescription>
            Укажите номер или chatId получателя в формате вашего инстанса GREEN-API
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="new-chat-id">
              Номер или chatId
            </label>
            <input
              id="new-chat-id"
              className={inputClass}
              value={chatId}
              onChange={(event) => setChatId(event.target.value)}
              placeholder="79991234567@c.us или chatId"
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass} htmlFor="new-chat-title">
              Имя чата
            </label>
            <input
              id="new-chat-title"
              className={inputClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Необязательно"
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="border-destructive-border bg-destructive-soft text-destructive-dark rounded-md border px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <button className={`${primaryButtonClass} w-full`} type="submit" disabled={busy}>
            {busy ? 'Проверяем номер…' : 'Создать чат'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
