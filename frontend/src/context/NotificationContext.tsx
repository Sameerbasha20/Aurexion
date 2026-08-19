import { createContext } from "react";

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  description?: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  showNotification: (type: Notification["type"], message: string, description?: string) => void;
  dismissNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export default NotificationContext;
