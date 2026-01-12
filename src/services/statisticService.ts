import axiosClient from "../api/axiosClient";
import { PageResponse } from "../types/commonType";
import {
    FlightLoadFactorStatistic, FlightAvailableSeatsStatistic,
    FlightPassengerStatistic, TicketStatusStatistic,
    CrewFlightHoursStatistic, CrewPerFlightStatistic, AircraftStatusStatistic
} from "../types/statisticType.ts";

export const statisticService = {
    getTicketStatusStatistic(): Promise<PageResponse<TicketStatusStatistic>> {
        return axiosClient.get('/statistics/tickets/status-summary');
    },
    getFlightPassengerStatistic(): Promise<PageResponse<FlightPassengerStatistic>> {
        return axiosClient.get('/statistics/flights/passengers');
    },
    getFlightLoadFactorStatistic(): Promise<PageResponse<FlightLoadFactorStatistic>> {
        return axiosClient.get('/statistics/flights/load-factor');
    },
    getFlightAvailableSeatsStatistic(): Promise<PageResponse<FlightAvailableSeatsStatistic>> {
        return axiosClient.get('/statistics/flights/available-seats');
    },
    getCrewFlightHoursStatistic(): Promise<PageResponse<CrewFlightHoursStatistic>> {
        return axiosClient.get('/statistics/crew/flight-hours');
    },
    getCrewPerFlight(): Promise<PageResponse<CrewPerFlightStatistic>> {
        return axiosClient.get('/statistics/crew/by-flight');
    },
    getAircraftStatusStatistic(): Promise<PageResponse<AircraftStatusStatistic>> {
        return axiosClient.get('/statistics/aircrafts/status');
    }
};