// services/aircraftService.ts
import axiosClient from '../api/axiosClient';
import type { Aircraft, CreateAircraftRequest } from '../types/aircraftType';

export const aircraftService = {
  getAll(): Promise<Aircraft[]> {
    return axiosClient
    .get('/aircrafts/all?all=true')
    .then(res => res.data.content);
  },

  getById(id: number): Promise<Aircraft> {
    return axiosClient.get(`/aircrafts/${id}`);
  },

  create(payload: CreateAircraftRequest): Promise<Aircraft> {
    return axiosClient.post('/aircrafts', payload);
  },

  update(id: number, payload: Partial<CreateAircraftRequest>): Promise<Aircraft> {
    return axiosClient.put(`/aircrafts/${id}`, payload);
  },

  delete(id: number): Promise<void> {
    return axiosClient.delete(`/aircrafts/${id}`);
  },

  deleteBulk(ids: number[]): Promise<void> {
    return axiosClient.delete('/aircrafts/bulk', { data: { ids } });
  }
};
