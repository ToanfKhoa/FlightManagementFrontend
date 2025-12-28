// src/services/flightService.ts
import axiosClient from '../api/axiosClient';
import type { Flight, CreateFlightRequest, FlightsPageResponse } from '../types/flightType.ts';
import type { ApiResponse } from '../types/commonType';

export interface GetFlightsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  sort?: string;
  all?: boolean;
  origin?: string;
  destination?: string;
  date?: string;
}

export const flightService = {
  getAll(params: GetFlightsParams = {}): Promise< /*Flight[] | */ApiResponse<FlightsPageResponse>> {
    const queryParams = new URLSearchParams();

    if (params.all) {
      queryParams.append('all', 'true');
      // return axiosClient
      //   .get(`/flights/all?${queryParams.toString()}`)
      //   .then(res => res.data.content);
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
      rsqlConditions.push(`(id=='*${k}*')`); // assuming search by id
    }
    if (rsqlConditions.length > 0) {
      queryParams.append('filter', rsqlConditions.join(';'));
    }

    return axiosClient.get(`/flights/all?${queryParams.toString()}`) as Promise<ApiResponse<FlightsPageResponse>>;
  },

  getById(id: string): Promise<Flight> {
    return axiosClient.get(`/flights/${id}`);
  },

  create(payload: CreateFlightRequest): Promise<Flight> {
    return axiosClient
      .post('/flights', payload)
      .then(res => res.data);
  },

  update(id: string, payload: CreateFlightRequest): Promise<Flight> {
    return axiosClient.put(`/flights/${id}`, payload);
  },

  delete(id: string): Promise<void> {
    return axiosClient.delete(`/flights/${id}`);
  },

  deleteBulk(ids: string[]): Promise<void> {
    return axiosClient.delete('/flights/bulk', {
      data: { ids }
    });
  }
};
