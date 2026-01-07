import axiosClient from '../api/axiosClient';
import { BookingRequest, BookingResponse } from '../types/ticketType';


export const ticketService = {
    booking(payload: Partial<BookingRequest>): Promise<BookingResponse> {
        return axiosClient.post('/tickets', payload) as Promise<BookingResponse>;
    },
};

export default ticketService;