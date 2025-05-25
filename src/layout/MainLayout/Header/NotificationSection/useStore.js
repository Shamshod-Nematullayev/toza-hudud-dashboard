import { toast } from 'react-toastify';
import api from 'utils/api';
import { create } from 'zustand';
import audio from '../../../../assets/audios/notification.wav';

const useNotificationStore = create((set) => ({
  notifications: [],
  getNotifications: async (filters) => {
    try {
      const notifications = (
        await api.get('/notification', {
          params: filters
        })
      ).data.notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      set({ notifications });
    } catch (error) {
      toast.error(error.message);
    }
  },
  addNotification: (notification) => {
    set((state) => ({ notifications: [...state.notifications, notification] }));
    new Audio(audio).play();
  },
  markNotificationAsRead: async (id) => {
    try {
      await api.put(`/notification/${id}/read`);
      set((state) => ({
        notifications: state.notifications
          .map((n) => (n._id == id ? { ...n, status: 'read' } : n))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }));
    } catch (error) {
      toast.error(error.message);
    }
  },
  markAllAsRead: async () => {
    try {
      await api.put('/notification/read-all');
      set({ notifications: [] });
    } catch (error) {
      toast.error(error.message);
    }
  },
  removeNotification: (id) => set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
  clearAllNotifications: () => set({ notifications: [] }),
  filterStatus: 'new',
  setFilterStatus: (status) => set({ filterStatus: status })
}));

export default useNotificationStore;
