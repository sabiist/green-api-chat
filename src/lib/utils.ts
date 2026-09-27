import type { ChatMessage } from '@/types/chat';

export function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function makeId() {
  return crypto.randomUUID();
}

export function clampSidebarWidth(width: number) {
  return Math.min(520, Math.max(260, width));
}

export function normalizeOutgoingStatus(status?: string): ChatMessage['status'] | undefined {
  if (status === 'sent') return 'sent';
  if (status === 'delivered') return 'delivered';
  if (status === 'read') return 'read';
  if (status === 'failed') return 'error';
  return undefined;
}
