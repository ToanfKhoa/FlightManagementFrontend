import axiosClient from '../api/axiosClient';
import type { Passenger, PassengersPageResponse } from '../types/passengerType';
import type { ApiResponse } from '../types/commonType';

export interface GetPassengersParams {
    page?: number;
    size?: number;
    search?: string;
    sort?: string;
    all?: boolean;
}

export const passengerService = {
    getAllPassengers(params: GetPassengersParams): Promise<ApiResponse<PassengersPageResponse>> {
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
        if (params.search) {
            const k = params.search.trim();
            rsqlConditions.push(`(fullName=='*${k}*',idNumber=='*${k}*')`);
        }
        if (rsqlConditions.length > 0) {
            queryParams.append('filter', rsqlConditions.join(';'));
        }

        return axiosClient.get(`/passengers/all?${queryParams.toString()}`) as Promise<ApiResponse<PassengersPageResponse>>;
    },

    getPassenger(id: string): Promise<ApiResponse<Passenger>> {
        return axiosClient.get(`/passengers/${id}`) as Promise<ApiResponse<Passenger>>;
    },

    createPassenger(payload: Partial<Passenger>): Promise<ApiResponse<Passenger>> {
        return axiosClient.post('/passengers', payload) as Promise<ApiResponse<Passenger>>;
    },

    updatePassenger(id: string, payload: Partial<Passenger>): Promise<ApiResponse<Passenger>> {
        return axiosClient.put(`/passengers/${id}`, payload) as Promise<ApiResponse<Passenger>>;
    },

    deletePassenger(id: number): Promise<ApiResponse<any>> {
        return axiosClient.delete(`/passengers/${id}`) as Promise<ApiResponse<any>>;
    },
};

export default passengerService;
