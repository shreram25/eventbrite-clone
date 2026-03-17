import api from './axios';
import { Notification } from '../types';

export const notificationsApi = {
  getAll: () => api.get<Notification[]>('/notifications').then((r) => r.data),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),
};
