import api from './axios';
import { Event, User, AdminStats } from '../types';

export const adminApi = {
  getStats: () => api.get<AdminStats>('/admin/stats').then((r) => r.data),

  getAllEvents: () => api.get<Event[]>('/admin/events').then((r) => r.data),

  getPendingEvents: () => api.get<Event[]>('/admin/events/pending').then((r) => r.data),

  approveEvent: (id: string) => api.patch(`/admin/events/${id}/approve`).then((r) => r.data),

  rejectEvent: (id: string, reason: string) =>
    api.patch(`/admin/events/${id}/reject`, { reason }).then((r) => r.data),

  getAllUsers: () => api.get<User[]>('/admin/users').then((r) => r.data),

  seedCategories: () => api.post('/categories/seed').then((r) => r.data),
};
