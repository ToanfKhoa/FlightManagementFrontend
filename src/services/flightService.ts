// src/services/flightService.ts
import axiosClient from '../api/axiosClient';
import type { Flight, CreateFlightRequest } from '../types/flightType.ts';

export const flightService = {
  getAll(): Promise<Flight[]> {
    return axiosClient.get('/flights/all');
  },

  getById(id: string): Promise<Flight> {
    return axiosClient.get(`/flights/${id}`);
  },

  create(payload: CreateFlightRequest): Promise<Flight> {
    return axiosClient.post('/flights', payload);
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
