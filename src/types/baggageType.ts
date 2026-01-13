import { Flight } from "./flightType"
import { Passenger } from "./passengerType"

export type BaggageType = "CARRY_ON" | "CHECKED";

export interface CreateBaggageRequest {
    type: BaggageType,
    weight: number,
    passengerId: number,
    flightId: number
}

export type Baggage = {
    id: number,
    version: string,
    createdBy: string,
    updatedBy: string,
    createdAt: string,
    updatedAt: string,

    type: BaggageType,
    weight: number,
    extraFee: number,
    passenger: Passenger,
    flightId: Flight
}
