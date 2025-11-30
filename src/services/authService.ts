import axiosClient from '../api/axiosClient';
import { LoginResponse } from '../types/authType.ts';

export const authService = {
  login(email: string, password: string): Promise<LoginResponse> {
    return axiosClient.post('/auth/login', { email, password });
  },
};