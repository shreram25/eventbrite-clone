import api from './axios';
import { Ticket } from '../types';

export const ticketsApi = {
  getMyTickets: () => api.get<Ticket[]>('/tickets/my').then((r) => r.data),

  register: (eventId: string, mockCardNumber?: string) =>
    api.post<Ticket>('/tickets/register', { eventId, mockCardNumber }).then((r) => r.data),

  cancel: (ticketId: string) =>
    api.patch<Ticket>(`/tickets/${ticketId}/cancel`).then((r) => r.data),
};
