import { SeatClass } from "./seatType"
import { Flight } from "./flightType";
import { Passenger } from "./passengerType";
import { Seat } from "./seatType";

export interface BookingRequest {
    flightId: number,
    seatClass: SeatClass
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