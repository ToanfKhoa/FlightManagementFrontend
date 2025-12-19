import axiosClient from '../api/axiosClient';
import type { User, ApiResponse, UsersPageResponse } from '../types/authType';

export const userService = {
  getAllUsers(): Promise<ApiResponse<UsersPageResponse>> {
    return axiosClient.get('/users/all') as Promise<ApiResponse<UsersPageResponse>>;
  },

  getUser(id: string): Promise<ApiResponse<User>> {
    return axiosClient.get(`/users/${id}`) as Promise<ApiResponse<User>>;
  },

  createUser(payload: Partial<User>): Promise<ApiResponse<User>> {
    return axiosClient.post('/users', payload) as Promise<ApiResponse<User>>;
  },

  updateUser(id: string, payload: Partial<User>): Promise<ApiResponse<User>> {
    return axiosClient.put(`/users/${id}`, payload) as Promise<ApiResponse<User>>;
  },

  deleteUser(id: number): Promise<ApiResponse<any>> {
    return axiosClient.delete(`/users/${id}`) as Promise<ApiResponse<any>>;
  },
};

export default userService;
