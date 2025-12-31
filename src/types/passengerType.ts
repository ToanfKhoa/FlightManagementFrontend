import { RegisterRequest } from "./authType";
import { PageResponse } from "./commonType";

export interface Passenger {
    accountRequest: RegisterRequest;
    id?: number;
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    idNumber: string;
    address: string;
    phone: string;
}

export type PassengersPageResponse = PageResponse<Passenger>;
export default Passenger;