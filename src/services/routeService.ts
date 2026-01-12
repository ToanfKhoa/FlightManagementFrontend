// src/services/routeService.ts
import axiosClient from '../api/axiosClient';
import type { Route } from '../types/flightType';

export const routeService = {
  getAll(): Promise<Route[]> {
    return axiosClient
      .get('/routes/all?all=true')
      .then(res => res.data.content);
  },

  getById(id: number): Promise<Route> {
    return axiosClient.get(`/routes/${id}`);
  },

  create(routeData: { origin: string; destination: string; external: boolean }): Promise<Route> {
    return axiosClient.post('/routes', routeData);
  },
};