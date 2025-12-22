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
