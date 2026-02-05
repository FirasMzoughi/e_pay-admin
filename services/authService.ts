import api from './api';
import { User } from '@/types';

// Mock response for development until backend is ready
const MOCK_USER: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@epay.com',
  role: 'admin',
};

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple mock check
    if (email === 'admin@epay.com' && password === 'admin123') {
      return {
        user: MOCK_USER,
        token: 'mock-jwt-token-12345',
      };
    }

    // Real API call would be:
    // const response = await api.post('/auth/login', { email, password });
    // return response.data;

    throw new Error('Invalid credentials');
  },

  logout: async () => {
    // await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    // const response = await api.get('/auth/me');
    // return response.data;
    return MOCK_USER;
  }
};
