
export interface TicketStatusStatistic {
    refundedCount: number;
    changedCount: number;
    canceledCount: number;
    totalAffectedTickets: number;
}

export interface FlightPassengerStatistic {
    flightId: number;
    origin: string;
    destination: string;
    departureTime: string;
    flightStatus: string;
    passengerCount: number;
}

export interface FlightLoadFactorStatistic {
    flightId: number;
    origin: string;
    destination: string;
    departureTime: string;
    flightStatus: string;
    soldSeatsCount: number;
    totalSeatCapacity: number;
    loadFactorPercentage: number;
}

export interface FlightAvailableSeatsStatistic {
    flightId: number;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    aircraftRegistrationNumber: string;
    flightStatus: string;
    availableSeatsCount: number;
    totalSeatCapacity: number;
}

export interface CrewFlightHoursStatistic {
    flightId: number;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    aircraftRegistrationNumber: string;
    flightStatus: string;
    availableSeatsCount: number;
    totalSeatCapacity: number;
}

export interface CrewPerFlightStatistic {
    flightId: number;
    origin: string;
    destination: string;
    departureTime: string;
    flightStatus: string;
    totalCrewCount: number;
    pilotCount: number;
    copilotCount: number;
    attendantCount: number;
}

export interface AircraftStatusStatistic {
    activeCount: number;
    maintenanceCount: number;
    inactiveCount: number;
    totalAircraftCount: number;
}