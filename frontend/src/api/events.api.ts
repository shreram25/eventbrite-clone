import api from './axios';
import { Event, PaginatedEvents } from '../types';

export interface EventFilters {
  search?: string;
  categoryId?: number;
  startDate?: string;
  isFree?: string;
  page?: number;
  limit?: number;
  status?: string;
}

export const eventsApi = {
  getAll: (filters?: EventFilters) =>
    api.get<PaginatedEvents>('/events', { params: filters }).then((r) => r.data),

  getOne: (id: string) => api.get<Event>(`/events/${id}`).then((r) => r.data),

  getMyEvents: () => api.get<Event[]>('/events/my').then((r) => r.data),

  create: (data: Partial<Event>) => api.post<Event>('/events', data).then((r) => r.data),

  update: (id: string, data: Partial<Event>) =>
    api.patch<Event>(`/events/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/events/${id}`).then((r) => r.data),

  getAttendees: (id: string) => api.get(`/events/${id}/attendees`).then((r) => r.data),

  getCategories: () => api.get('/categories').then((r) => r.data),

  getICSUrl: (id: string) => `/api/calendar/events/${id}/ics`,
};
