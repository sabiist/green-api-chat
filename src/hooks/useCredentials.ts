import { useMemo, useState } from 'react';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GreenApiClient } from '@/lib/greenApi';
import { errorMessage } from '@/lib/utils';
import type { Credentials } from '@/types/chat';

export function useCredentials() {
  const [credentials, setCredentials] = useLocalStorage<Credentials | null>('credentials', null);
  const [connecting, setConnecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const client = useMemo(
    () => (credentials ? new GreenApiClient(credentials) : null),
    [credentials],
  );

  const connect = async (nextCredentials: Credentials) => {
    setConnecting(true);
    setAuthError(null);

    try {
      const nextClient = new GreenApiClient(nextCredentials);
      const state = await nextClient.getStateInstance();
      setCredentials(nextClient.credentials);

      if (state.stateInstance && state.stateInstance !== 'authorized') {
        setAuthError(`Инстанс сохранён, но состояние инстанса: ${state.stateInstance}`);
      }
    } catch (error) {
      setAuthError(errorMessage(error));
    } finally {
      setConnecting(false);
    }
  };

  const logout = () => {
    setCredentials(null);
    setAuthError(null);
  };

  return { credentials, client, connecting, authError, connect, logout };
}
