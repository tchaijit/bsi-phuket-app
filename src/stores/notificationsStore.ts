import { create } from 'zustand';
import type { Notification } from '../types';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;

  // Actions
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [
    {
      id: '1',
      type: 'warning',
      title: 'สัญญาใกล้หมดอายุ',
      message: 'มีสัญญา 1 ฉบับที่จะหมดอายุภายใน 90 วัน',
      timestamp: new Date(),
      read: false,
    },
    {
      id: '2',
      type: 'error',
      title: 'สัญญาหมดอายุแล้ว',
      message: 'Resort Group Holdings PCU - สัญญาหมดอายุตั้งแต่ 31 ธ.ค. 2568',
      timestamp: new Date(),
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'โอกาสทางธุรกิจ',
      message: 'พบพื้นที่ว่าง 4 จุดที่มีคู่แข่งแต่ BSI ยังไม่มีพันธมิตร',
      timestamp: new Date(),
      read: false,
    },
  ],
  unreadCount: 3,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const unreadCount = notifications.filter((n) => !n.read).length;
      return { notifications, unreadCount };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id) => {
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id);
      const unreadCount = notifications.filter((n) => !n.read).length;
      return { notifications, unreadCount };
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
