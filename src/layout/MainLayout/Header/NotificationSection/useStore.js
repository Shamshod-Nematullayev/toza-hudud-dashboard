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
      ).data.notifications;
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
        notifications: state.notifications.map((n) => (n._id == id ? { ...n, status: 'read' } : n))
      }));
    } catch (error) {
      toast.error(error.message);
    }
  },
  removeNotification: (id) => set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
  clearAllNotifications: () => set({ notifications: [] }),
  filterStatus: 'all',
  setFilterStatus: (status) => set({ filterStatus: status })
}));

export default useNotificationStore;
