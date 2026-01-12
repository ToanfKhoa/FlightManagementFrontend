import axiosClient from "../api/axiosClient";
import { PageResponse } from "../types/commonType";

import type { Assignment, AssignmentRequest, GetAssignmentsParams } from "../types/assignmentType";

export const assignmentService = {
    getAll(params: GetAssignmentsParams = {}): Promise<PageResponse<Assignment>> {
        const queryParams = new URLSearchParams();

        if (params.all) {
            queryParams.append('all', 'true');
        } else {
            queryParams.append('page', String(params.page || 0));
            queryParams.append('size', String(params.size || 10));
        }

        if (params.filter) {
            queryParams.append('filter', params.filter);
        }

        return axiosClient.get(`/assignments/all?${queryParams.toString()}`) as Promise<PageResponse<Assignment>>;
    },
    assign(request: AssignmentRequest): Promise<void> {
        return axiosClient.post("/assignments/assign", request);
    },
    getEmployeeAssignments(employeeId: number, params: GetAssignmentsParams = {}): Promise<PageResponse<Assignment>> {
        const queryParams = new URLSearchParams();

        if (params.all) {
            queryParams.append('all', 'true');
        } else {
            queryParams.append('page', String(params.page || 0));
            queryParams.append('size', String(params.size || 10));
        }

        if (params.filter) {
            queryParams.append('filter', params.filter);
        }

        return axiosClient.get(`/assignments/all/employee/${employeeId}?${queryParams.toString()}`) as Promise<PageResponse<Assignment>>;
    }
};