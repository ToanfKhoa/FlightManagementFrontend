import axiosClient from "../api/axiosClient";
import { PageResponse } from "../types/commonType";

import type { Assignment } from "../types/assignmentType";

export const assignmentService = {
    getAll(): Promise<Assignment[]> {
        return axiosClient.get("/assignments/all");
    },
    assign(flightId: string, employeeIds: number[]): Promise<PageResponse<Assignment>> {
        return axiosClient.post("/assignments/assign", { flightId, employeeIds }) as Promise<PageResponse<Assignment>>;
    },
    getEmployeeAssignments(employeeId: number): Promise<PageResponse<Assignment>> {
        return axiosClient.get(`/assignments/employee/${employeeId}`) as Promise<PageResponse<Assignment>>;
    }
};