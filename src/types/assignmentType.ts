import { Flight } from "./flightType";
import { Employee } from "./employeeType";

export interface Assignment {
    id: number;
    flight: Flight;
    employee: Employee;
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
