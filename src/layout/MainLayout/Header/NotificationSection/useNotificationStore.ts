import { toast } from 'react-toastify';
import api from 'utils/api';
import { create } from 'zustand';
import audio from '../../../../assets/audios/notification.wav';

export interface INotification {
  _id: string;
  sender: {
    id: string;
    name: string;
    photo?: string;
  };
  message: string;
  status: 'new' | 'read';
  createdAt: string;
  type: 'alert' | 'info' | 'task';
}

interface StoreState {
  notifications: INotification[];
  getNotifications: (filters?: any) => Promise<void>;
  addNotification: (notification: INotification) => void;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  filterStatus: 'new' | 'all';
  setFilterStatus: (status: 'new' | 'all') => void;
}

const useNotificationStore = create<StoreState>((set) => ({
  notifications: [],
  getNotifications: async (filters) => {
    let notifications: INotification[] = (
      await api.get('/notification', {
        params: filters
      })
    ).data.notifications;

    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    set({ notifications });
  },
  addNotification: (notification) => {
    set((state) => ({ notifications: [notification, ...state.notifications] }));
    new Audio(audio).play();
  },
  markNotificationAsRead: async (id) => {
    await api.put(`/notification/${id}/read`);
    set((state) => ({
      ...state, // keep all other properties the same
      notifications: state.notifications.map(
        (n) => (n._id === id ? { ...n, status: 'read' } : n) // only update the status of the notification with the matching id
      )
    }));
  },

  markAllAsRead: async () => {
    await api.put('/notification/read-all');
    set({ notifications: [] });
  },
  removeNotification: (id) => set((state) => ({ notifications: state.notifications.filter((n) => n._id !== id) })),
  clearAllNotifications: () => set({ notifications: [] }),
  filterStatus: 'new',
  setFilterStatus: (status) => set({ filterStatus: status })
}));

export default useNotificationStore;
