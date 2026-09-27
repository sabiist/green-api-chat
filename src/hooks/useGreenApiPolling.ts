import { useEffect } from 'react';

import type { GreenApiClient } from '@/lib/greenApi';
import type { IncomingNotification } from '@/types/chat';

type Options = {
  client: GreenApiClient | null;
  enabled: boolean;
  intervalMs?: number;
  onNotification: (notification: NonNullable<IncomingNotification>) => Promise<void> | void;
  onError?: (error: unknown) => void;
};

export function useGreenApiPolling({
  client,
  enabled,
  intervalMs = 2500,
  onNotification,
  onError,
}: Options) {
  useEffect(() => {
    if (!client || !enabled) return;

    let stopped = false;
    let inFlight = false;
    let timer: number | undefined;

    const tick = async () => {
      if (stopped || inFlight) return;
      inFlight = true;

      try {
        const notification = await client.receiveNotification();
        if (!stopped && notification) {
          await onNotification(notification);
          if (notification.receiptId) {
            await client.deleteNotification(notification.receiptId);
          }
        }
      } catch (error) {
        if (!stopped) onError?.(error);
      } finally {
        inFlight = false;
        if (!stopped) {
          timer = window.setTimeout(tick, intervalMs);
        }
      }
    };

    void tick();

    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [client, enabled, intervalMs, onError, onNotification]);
}
