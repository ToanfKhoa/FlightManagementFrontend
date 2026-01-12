import axiosClient from '../api/axiosClient';
import type { LoginResponse, RegisterRequest } from '../types/authType';

export const authService = {
  getMe(): Promise<LoginResponse> {
    return axiosClient.get('/auth/me');
  },
  refresh(refreshToken: string): Promise<LoginResponse> {
    return axiosClient.post('/auth/refresh', { refreshToken });
  },
  login(credentialId: string, password: string): Promise<LoginResponse> {
    return axiosClient.post('/auth/login', { credentialId, password });
  },
  register(payload: RegisterRequest): Promise<any> {
    return axiosClient.post('/auth/register', payload);
  },
  changePassword(oldPassword: string, newPassword: string): Promise<LoginResponse> {
    return axiosClient.post('/auth/change-password', { oldPassword, newPassword });
  },
  resetPassword(verificationCode: string, newPassword: string): Promise<LoginResponse> {
    return axiosClient.post('/auth/reset-password', { verificationCode, newPassword });
  },
  sendResetPasswordEmail(email: string): Promise<LoginResponse> {
    return axiosClient.post(`/auth/send-reset-password-email?${email}`);
  }
};