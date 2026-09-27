export type Credentials = {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
};

export type MessageDirection = 'incoming' | 'outgoing';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

export type ChatMessage = {
  id: string;
  chatId: string;
  text: string;
  direction: MessageDirection;
  timestamp: number;
  status?: MessageStatus;
  remoteId?: string;
  receiptId?: number;
};

export type Chat = {
  id: string;
  chatId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  colorIndex?: number;
};

export type RemoteChat = {
  id: string;
  name?: string;
  type?: 'user' | 'group' | string;
  archive?: boolean;
  unreadCount?: number;
  newChatId?: string;
};

export type InstanceStateResponse = {
  stateInstance?: string;
};

export type SendMessageResponse = {
  idMessage?: string;
};

export type CheckAccountResponse = {
  exist?: boolean;
  chatId?: string;
  username?: string;
  phoneNumber?: number;
};

export type DeleteNotificationResponse = {
  result?: boolean;
  reason?: string;
};

export type SenderData = {
  chatId?: string;
  chatName?: string;
  sender?: string;
  senderName?: string;
};

export type MessageData = {
  typeMessage?: string;
  textMessageData?: {
    textMessage?: string;
  };
  extendedTextMessageData?: {
    text?: string;
  };
};

export type NotificationBody = {
  typeWebhook?: string;
  instanceData?: {
    idInstance?: number;
    wid?: string;
    typeInstance?: string;
  };
  timestamp?: number;
  idMessage?: string;
  status?: string;
  senderData?: SenderData;
  messageData?: MessageData;
};

export type IncomingNotification = {
  receiptId?: number;
  body?: NotificationBody;
} | null;
