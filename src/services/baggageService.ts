import { create } from "domain";
import axiosClient from "../api/axiosClient";
import { CreateBaggageRequest } from "../types/baggageType";
import { PageableParams } from "../types/common"

export const baggageService = {
    createNewBaggage(payload: CreateBaggageRequest): Promise<void> {
        return axiosClient.post("/baggages", payload) as Promise<void>;
    },
    calculateFee(payload: CreateBaggageRequest): Promise<number> {
        return axiosClient.post("/baggages/calculate-fee", payload) as Promise<number>;
    },
    getBaggageByPassenger(passengerId: number, params: PageableParams = { page: 0, size: 10 }) {
        return axiosClient.get(`/baggages/passenger/${passengerId}`, { params: params });
    },
};