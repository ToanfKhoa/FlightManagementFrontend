import { create } from "domain";
import axiosClient from "../api/axiosClient";
import { CreateBaggageRequest } from "../types/baggageType";
import { PageableParams } from "../types/commonType"
import ApiResponse from "../types/commonType";

export const baggageService = {
    createNewBaggage(payload: CreateBaggageRequest): Promise<void> {
        return axiosClient.post("/baggages", payload) as Promise<void>;
    },
    calculateFee(payload: CreateBaggageRequest): Promise<ApiResponse<Number>> {
        return axiosClient.post("/baggages/calculate-fee", payload) as Promise<ApiResponse<Number>>;
    },
    getBaggageByPassenger(passengerId: number, params: PageableParams = { page: 0, size: 10 }) {
        return axiosClient.get(`/baggages/passenger/${passengerId}`, { params: params });
    },
};