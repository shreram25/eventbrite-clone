export type Role = 'attendee' | 'organizer' | 'admin';
export type EventStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
export type TicketStatus = 'registered' | 'cancelled';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  status: EventStatus;
  organizer: { id: string; name: string; email?: string };
  organizerId: string;
  category?: Category;
  categoryId?: number;
  coverImage?: string;
  isFree: boolean;
  ticketPrice: number;
  rejectionReason?: string;
  registeredCount?: number;
  spotsLeft?: number;
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  event: Event;
  status: TicketStatus;
  paymentStatus: string;
  ticketCode: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedEvents {
  data: Event[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalTickets: number;
  pendingEvents: number;
}
