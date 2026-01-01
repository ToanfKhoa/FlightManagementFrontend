import axiosClient from '../api/axiosClient';
import type { Employee, RegisterEmployee } from '../types/employeeType';
import type { ApiResponse, PageResponse } from '../types/commonType';

export interface GetEmployeesParams {
  page?: number;
  size?: number;
  search?: string;
  position?: string;
  sort?: string;
  all?: boolean;
}

export const employeeService = {
  getAllEmployees(params: GetEmployeesParams): Promise<ApiResponse<PageResponse<Employee>>> {
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
    if (params.position) {
      rsqlConditions.push(`position=='${params.position}'`);
    }
    if (params.search) {
      const k = params.search.trim();
      rsqlConditions.push(`(fullName=='*${k}*')`);
    }
    if (rsqlConditions.length > 0) {
      queryParams.append('filter', rsqlConditions.join(';'));
    }

    return axiosClient.get(`/employees/all?${queryParams.toString()}`) as Promise<ApiResponse<PageResponse<Employee>>>;
  },

  getEmployee(id: string): Promise<ApiResponse<Employee>> {
    return axiosClient.get(`/employees/${id}`) as Promise<ApiResponse<Employee>>;
  },

  createEmployee(payload: Partial<RegisterEmployee>): Promise<ApiResponse<Employee>> {
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
