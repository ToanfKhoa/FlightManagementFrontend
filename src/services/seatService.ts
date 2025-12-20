import axiosClient from '../api/axiosClient';
import type { Seat, CreateSeatRequest, UpdateSeatRequest } from '../types/seatType';

export const seatService = {
  getAll(): Promise<Seat[]> {
    return axiosClient.get('/seats/all');
  },

  getById(id: number): Promise<Seat> {
    return axiosClient.get(`/seats/${id}`);
  },

  create(payload: CreateSeatRequest): Promise<Seat> {
    return axiosClient.post('/seats', payload);
  },

  update(id: number, payload: UpdateSeatRequest): Promise<Seat> {
    return axiosClient.put(`/seats/${id}`, payload);
  },

  delete(id: number): Promise<void> {
    return axiosClient.delete(`/seats/${id}`);
  },

  deleteBulk(ids: number[]): Promise<void> {
    return axiosClient.delete('/seats/bulk', { data: { ids } });
  }
};
