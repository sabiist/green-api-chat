import { useEffect } from 'react';

import { GreenApiError, type GreenApiClient } from '@/lib/greenApi';
import type { IncomingNotification } from '@/types/chat';

const BASE_INTERVAL_MS = 5000;
const MAX_BACKOFF_MS = 60000;
const BACKOFF_FACTOR = 2;

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
    let backoffMs = 0;

    const tick = async () => {
      if (stopped || inFlight) return;
      inFlight = true;

      try {
        const notification = await client.receiveNotification();
        backoffMs = 0;
        if (!stopped && notification) {
          await onNotification(notification);
          if (notification.receiptId) {
            await client.deleteNotification(notification.receiptId);
          }
        }
      } catch (error) {
        if (error instanceof GreenApiError && error.status === 429) {
          backoffMs = Math.min(
            Math.max(backoffMs, BASE_INTERVAL_MS) * BACKOFF_FACTOR,
            MAX_BACKOFF_MS,
          );
        } else {
          backoffMs = 0;
        }
        if (!stopped) onError?.(error);
      } finally {
        inFlight = false;
        if (!stopped) {
          timer = window.setTimeout(tick, backoffMs || intervalMs);
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
