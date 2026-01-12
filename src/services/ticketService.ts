import axiosClient from '../api/axiosClient';
import { PageResponse } from '../types/commonType';
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
};

export default ticketService;