import { ReactNode } from 'react';

export interface NotificationContent {
  title: string;
  body: string;
}

export interface NotificationContextProps {
  notificationList: NotificationContent[];
  unreadCount: number;
  scheduleRandomNotification: () => Promise<void>;  // somente o disparo aleatório agora
  resetUnread: () => void;
  clearAll: () => Promise<void>;
}

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element;

export function useNotification(): NotificationContextProps;
