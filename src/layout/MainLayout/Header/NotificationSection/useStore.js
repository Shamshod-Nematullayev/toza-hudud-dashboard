import { toast } from 'react-toastify';
import api from 'utils/api';
import { create } from 'zustand';

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
