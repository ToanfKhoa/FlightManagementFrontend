// services/aircraftService.ts
import axiosClient from '../api/axiosClient';
import type { Aircraft, CreateAircraftRequest, AircraftsPageResponse } from '../types/aircraftType';
import type { ApiResponse } from '../types/commonType';

export interface GetAircraftsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  sort?: string;
  all?: boolean;
}

export const aircraftService = {
  getAll(params: GetAircraftsParams = {}): Promise<Aircraft[] | ApiResponse<AircraftsPageResponse>> {
    const queryParams = new URLSearchParams();

    if (params.all) {
      queryParams.append('all', 'true');
    } else {
      queryParams.append('page', String(params.page || 0));
      queryParams.append('size', String(params.size || 10));
    }

    if (params.sort) {
      queryParams.append('sort', params.sort);
    }
    // Add search/filter if needed
    const rsqlConditions: string[] = [];
    if (params.status) {
      rsqlConditions.push(`status=='${params.status}'`);
    }
    if (params.search) {
      const k = params.search.trim();
      rsqlConditions.push(`(registrationNumber=='*${k}*',type=='*${k}*')`);
    }
    if (rsqlConditions.length > 0) {
      queryParams.append('filter', rsqlConditions.join(';'));
    }

    if (params.all) {
      return axiosClient
        .get(`/aircrafts/all?${queryParams.toString()}`)
        .then(res => res.data.content);
    } else {
      return axiosClient.get(`/aircrafts/all?${queryParams.toString()}`) as Promise<ApiResponse<AircraftsPageResponse>>;
    }
  },

  getById(id: number): Promise<Aircraft> {
    return axiosClient.get(`/aircrafts/${id}`).then(res => res.data);
  },

  create(payload: CreateAircraftRequest): Promise<Aircraft> {
    return axiosClient.post('/aircrafts', payload).then(res => res.data);
  },

  update(id: number, payload: Partial<CreateAircraftRequest>): Promise<Aircraft> {
    return axiosClient.put(`/aircrafts/${id}`, payload).then(res => res.data);
  },

  delete(id: number): Promise<void> {
    return axiosClient.delete(`/aircrafts/${id}`);
  },

  deleteBulk(ids: number[]): Promise<void> {
    return axiosClient.delete('/aircrafts/bulk', { data: { ids } });
  }
};
