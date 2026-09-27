import type {
  CheckAccountResponse,
  Credentials,
  DeleteNotificationResponse,
  IncomingNotification,
  InstanceStateResponse,
  RemoteChat,
  SendMessageResponse,
} from '@/types/chat';

export class GreenApiError extends Error {
  status?: number;
  details?: string;

  constructor(message: string, status?: number, details?: string) {
    super(message);
    this.name = 'GreenApiError';
    this.status = status;
    this.details = details;
  }
}

export function normalizeApiUrl(apiUrl: string) {
  const trimmed = apiUrl.trim() || 'https://api.green-api.com';
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, '');
}

export function normalizeInstancePart(value: string) {
  return value.trim().replace(/^waInstance/i, '');
}

export class GreenApiClient {
  readonly credentials: Credentials;

  constructor(credentials: Credentials) {
    this.credentials = {
      ...credentials,
      apiUrl: normalizeApiUrl(credentials.apiUrl),
      idInstance: normalizeInstancePart(credentials.idInstance),
      apiTokenInstance: credentials.apiTokenInstance.trim(),
    };
  }

  private instanceBase() {
    return `${this.credentials.apiUrl}/waInstance${this.credentials.idInstance}`;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.instanceBase()}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    const raw = await response.text();
    let data: unknown = raw;

    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      // GREEN-API sometimes can return plain text; keep it as details.
    }

    if (!response.ok) {
      const details = typeof data === 'string' ? data : JSON.stringify(data);
      throw new GreenApiError(`GREEN-API вернул HTTP ${response.status}`, response.status, details);
    }

    return data as T;
  }

  getStateInstance() {
    return this.request<InstanceStateResponse>(
      'GET',
      `/getStateInstance/${this.credentials.apiTokenInstance}`,
    );
  }

  sendMessage(chatId: string, message: string) {
    return this.request<SendMessageResponse>(
      'POST',
      `/sendMessage/${this.credentials.apiTokenInstance}`,
      {
        chatId,
        message,
      },
    );
  }

  checkAccount(phoneNumber: number) {
    return this.request<CheckAccountResponse>(
      'POST',
      `/checkAccount/${this.credentials.apiTokenInstance}`,
      {
        phoneNumber,
      },
    );
  }

  getChats(count?: number) {
    const query = count ? `?count=${count}` : '';
    return this.request<RemoteChat[]>(
      'GET',
      `/getChats/${this.credentials.apiTokenInstance}${query}`,
    );
  }

  receiveNotification() {
    return this.request<IncomingNotification>(
      'GET',
      `/receiveNotification/${this.credentials.apiTokenInstance}`,
    );
  }

  deleteNotification(receiptId: number) {
    return this.request<DeleteNotificationResponse>(
      'DELETE',
      `/deleteNotification/${this.credentials.apiTokenInstance}/${receiptId}`,
    );
  }
}
