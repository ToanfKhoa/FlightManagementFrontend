import axiosClient from '../api/axiosClient';
import type { LoginResponse, RegisterRequest } from '../types/authType';

export const authService = {
  login(email: string, password: string): Promise<LoginResponse> {
    return axiosClient.post('/auth/login', { email, password });
  },
  register(payload: RegisterRequest): Promise<any> {
    return axiosClient.post('/auth/register', payload);
  },
};