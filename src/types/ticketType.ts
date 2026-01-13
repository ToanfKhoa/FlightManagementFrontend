import { SeatClass } from "./seatType"
import { Flight } from "./flightType";
import { Passenger } from "./passengerType";
import { Seat } from "./seatType";

export interface Ticket {
    id: number;
    flight: Flight;
    passenger: Passenger;
    seat: Seat;
    status: 'RESERVED' | 'PAID' | 'CANCELED' | 'CHANGED'; // Enum trạng thái
    ticketClass: SeatClass;
    price: number;
    bookedAt: string; // Date time
    paidAt: string | null; // Date time
}

export interface BookingRequest {
    flightId: number,
    seatClass: SeatClass
}
export interface PaymentRequest {
    paymentMethod: string;
    returnUrl: string;
    cancelUrl: string;
}

export interface PaginationRequest {
    page: number;
    size: number;
    sort: string[];
}

export interface PaymentResponse {
    transactionId: number;
    ticketId: number;
    amount: number;
    paymentMethod: string;
    status: string;
    paymentUrl: string;
    providerTxnRef: string;
    providerTxnNo: string;
    message: string;
    timestamp: number;
}

export type BookingResponse = {
    id: number;
    status: "RESERVED" | "BOOKED" | "CANCELLED" | "PAID"; // Enum trạng thái
    ticketClass: string;
    price: number;
    bookedAt: string;
    paidAt: string | null;

    flight: Flight;
    passenger: Passenger;
    seat: Seat;
};