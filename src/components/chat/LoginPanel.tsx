import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { inputClass, labelClass, primaryButtonClass } from '@/lib/controls';
import type { Credentials } from '@/types/chat';

type Props = {
  connecting: boolean;
  error?: string | null;
  onConnect: (credentials: Credentials) => Promise<void> | void;
};

export function LoginPanel({ connecting, error, onConnect }: Props) {
  const [apiUrl, setApiUrl] = useState('');
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [showToken, setShowToken] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void onConnect({ apiUrl, idInstance, apiTokenInstance });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-8">
          <div className="bg-primary-light text-primary-dark mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold">
            GREEN-API chat
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Вход</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Введите данные инстанса GREEN-API. Дальше можно создать чат и обменяться текстовыми
            сообщениями
          </p>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="apiUrl">
              API URL
            </label>
            <input
              id="apiUrl"
              className={inputClass}
              value={apiUrl}
              onChange={(event) => setApiUrl(event.target.value)}
              placeholder="https://api.green-api.com"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass} htmlFor="idInstance">
              idInstance
            </label>
            <input
              id="idInstance"
              className={inputClass}
              value={idInstance}
              onChange={(event) => setIdInstance(event.target.value)}
              placeholder="1100000000"
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass} htmlFor="apiTokenInstance">
              apiTokenInstance
            </label>
            <div className="relative">
              <input
                id="apiTokenInstance"
                className={`${inputClass} pr-10`}
                type={showToken ? 'text' : 'password'}
                value={apiTokenInstance}
                onChange={(event) => setApiTokenInstance(event.target.value)}
                placeholder="token"
                autoComplete="off"
                required
              />
              <button
                type="button"
                onClick={() => setShowToken((value) => !value)}
                aria-label={showToken ? 'Скрыть токен' : 'Показать токен'}
                className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-slate-400 transition hover:text-slate-600"
              >
                {showToken ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {error ? (
            <div className="border-destructive-border bg-destructive-soft text-destructive-dark rounded-md border px-3 py-2 text-sm">
              {error}
            </div>
          ) : null}

          <button className={`${primaryButtonClass} w-full`} disabled={connecting} type="submit">
            {connecting ? 'Проверяем инстанс…' : 'Подключиться'}
          </button>
        </form>
      </div>
    </div>
  );
}
