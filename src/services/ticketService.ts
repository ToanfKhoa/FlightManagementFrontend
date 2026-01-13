import { get } from 'http';
import axiosClient from '../api/axiosClient';
import ApiResponse, { PageResponse } from '../types/commonType';
import { Flight } from '../types/flightType';
import { BookingRequest, BookingResponse, PaymentRequest, PaginationRequest, PaymentResponse, Ticket } from '../types/ticketType';


export const ticketService = {
    booking(payload: Partial<BookingRequest>): Promise<BookingResponse> {
        return axiosClient.post('/tickets', payload) as Promise<BookingResponse>;
    },
    pay(ticketId: number, payload: PaymentRequest): Promise<PaymentResponse> {
        return axiosClient.post(`tickets/tickets/${ticketId}/payments`, payload);
    },
    getOwnTickets(payload: PaginationRequest): Promise<PageResponse<Ticket>> {
        return axiosClient.get('/tickets/own', { params: payload });
    },
    checkin(payload: { ticketId: number, passengerEmail: string, seatId: number }): Promise<Flight> {
        return axiosClient.get(`/flights/${payload.ticketId}/seat`, { params: payload });
    },
    refund(ticketId: number): Promise<ApiResponse<Ticket>> {
        return axiosClient.post(`/tickets/tickets/${ticketId}/refund`);
    },
    getTicketById(ticketId: number): Promise<Ticket> {
        return axiosClient.get(`/tickets/${ticketId}`);
    }
};

export default ticketService;