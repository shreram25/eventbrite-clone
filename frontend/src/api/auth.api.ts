import api from './axios';
import { User } from '../types';

export const authApi = {
  register: (data: { email: string; password: string; name: string; role: string }) =>
    api.post<{ token: string; user: User }>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/login', data).then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),

  updateProfile: (data: Partial<User>) =>
    api.patch<User>('/users/profile', data).then((r) => r.data),
};
