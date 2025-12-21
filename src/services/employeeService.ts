import axiosClient from '../api/axiosClient';
import type { Employee } from '../types/employeeType';
import type { ApiResponse, PageResponse } from '../types/commonType';

export const employeeService = {
  getAllEmployees(page = 0, size = 10, search?: string): Promise<ApiResponse<PageResponse<Employee>>> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));
    if (search) params.append('q', search);
    return axiosClient.get(`/employees/all?${params.toString()}`) as Promise<ApiResponse<PageResponse<Employee>>>;
  },

  getEmployee(id: string): Promise<ApiResponse<Employee>> {
    return axiosClient.get(`/employees/${id}`) as Promise<ApiResponse<Employee>>;
  },

  createEmployee(payload: Partial<Employee>): Promise<ApiResponse<Employee>> {
    return axiosClient.post('/employees', payload) as Promise<ApiResponse<Employee>>;
  },

  updateEmployee(id: string, payload: Partial<Employee>): Promise<ApiResponse<Employee>> {
    return axiosClient.put(`/employees/${id}`, payload) as Promise<ApiResponse<Employee>>;
  },

  deleteEmployee(id: number): Promise<ApiResponse<any>> {
    return axiosClient.delete(`/employees/${id}`) as Promise<ApiResponse<any>>;
  },

  // Bulk delete: send DELETE with body containing ids array
  deleteEmployeesBulk(ids: number[]): Promise<ApiResponse<any>> {
    return axiosClient.request({ url: '/employees/bulk', method: 'delete', data: { ids } }) as Promise<ApiResponse<any>>;
  },
};

export default employeeService;
