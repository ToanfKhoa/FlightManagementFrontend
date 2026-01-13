import axiosClient from "../api/axiosClient";
import { ApiResponse } from "../types/commonType";
import {
    FlightLoadFactorStatistic, FlightAvailableSeatsStatistic,
    FlightPassengerStatistic, TicketStatusStatistic,
    CrewFlightHoursStatistic, CrewPerFlightStatistic, AircraftStatusStatistic
} from "../types/statisticType.ts";

export const statisticService = {
    getTicketStatusStatistic(): Promise<ApiResponse<TicketStatusStatistic>> {
        return axiosClient.get('/statistics/tickets/status-summary');
    },
    getFlightPassengerStatistic(): Promise<ApiResponse<FlightPassengerStatistic[]>> {
        return axiosClient.get('/statistics/flights/passengers');
    },
    getFlightLoadFactorStatistic(): Promise<ApiResponse<FlightLoadFactorStatistic[]>> {
        return axiosClient.get('/statistics/flights/load-factor');
    },
    getFlightAvailableSeatsStatistic(): Promise<ApiResponse<FlightAvailableSeatsStatistic[]>> {
        return axiosClient.get('/statistics/flights/available-seats');
    },
    getCrewFlightHoursStatistic(): Promise<ApiResponse<CrewFlightHoursStatistic[]>> {
        return axiosClient.get('/statistics/crew/flight-hours');
    },
    getCrewPerFlight(): Promise<ApiResponse<CrewPerFlightStatistic[]>> {
        return axiosClient.get('/statistics/crew/by-flight');
    },
    getAircraftStatusStatistic(): Promise<ApiResponse<AircraftStatusStatistic>> {
        return axiosClient.get('/statistics/aircraft/status');
    }
};