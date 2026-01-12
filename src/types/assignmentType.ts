import { Flight } from "./flightType";

export interface Assignment {
    id: number;
    flight: Flight;
}

export interface AssignmentRequest {
    flightId: number;
    employeeIds: number[];
}

export interface GetAssignmentsParams {
    page?: number;
    size?: number;
    search?: string;
    filter?: string;
    all?: boolean;
}