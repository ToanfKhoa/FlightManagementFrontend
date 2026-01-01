import axiosClient from '../api/axiosClient';
import type { User, UsersPageResponse } from '../types/authType';
import type { ApiResponse } from '../types/commonType';

export interface GetUsersParams {
  page?: number;
  size?: number;
  search?: string;
  role?: string;
  sort?: string;
  all?: boolean;
}

export const userService = {
  // getAllUsers(page = 0, size = 10, search?: string): Promise<ApiResponse<UsersPageResponse>> {
  //   const params = new URLSearchParams();
  //   params.append('page', String(page));
  //   params.append('size', String(size));
  //   if (search) params.append('q', search);
  //   return axiosClient.get(`/users/all?${params.toString()}`) as Promise<ApiResponse<UsersPageResponse>>;
  // },

  getAllUsers(params: GetUsersParams): Promise<ApiResponse<UsersPageResponse>> {
    const queryParams = new URLSearchParams();

    //all
    if (params.all) {
      queryParams.append('all', 'true');
    } else {
      queryParams.append('page', String(params.page || 0));
      queryParams.append('size', String(params.size || 10));
    }
    //sort
    if (params.sort) {
      queryParams.append('sort', params.sort);
    }

    //filter
    const rsqlConditions: string[] = [];
    if (params.role) {
      rsqlConditions.push(`role=='${params.role}'`);
    }
    if (params.search) {
      const k = params.search.trim();
      rsqlConditions.push(`(username=='*${k}*',email=='*${k}*')`);
    }
    if (rsqlConditions.length > 0) {
      queryParams.append('filter', rsqlConditions.join(';'));
    }

    return axiosClient.get(`/users/all?${queryParams.toString()}`) as Promise<ApiResponse<UsersPageResponse>>;
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
