// Mock data for the Flight Management System

export interface Flight {
  id: string;
  flightCode: string;
  route: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  status:
    | "open"
    | "full"
    | "delayed"
    | "canceled"
    | "completed";
  aircraftId: string;
  aircraftType: string;
  availableSeats: {
    economy: number;
    business: number;
    first: number;
  };
  prices: {
    economy: number;
    business: number;
    first: number;
  };
  waitingList?: WaitingListEntry[];
}

export interface WaitingListEntry {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerEmail: string;
  registeredAt: string;
  notified: boolean;
}

export interface Seat {
  id: string;
  seatNumber: string;
  class: "economy" | "business" | "first";
  status: "available" | "reserved" | "occupied";
  price: number;
}

export interface Booking {
  id: string;
  ticketCode: string;
  passengerId: string;
  passengerName: string;
  flightId: string;
  flightCode: string;
  seatNumber: string;
  seatClass: "economy" | "business" | "first";
  status: "reserved" | "paid" | "canceled" | "checked-in";
  bookingDate: string;
  paymentDeadline: string;
  price: number;
  baggage?: {
    carryOn: number;
    checked: number;
    extraFee: number;
  };
}

export interface Aircraft {
  id: string;
  registration: string;
  type: string;
  status: "active" | "maintenance" | "inactive";
  totalSeats: {
    economy: number;
    business: number;
    first: number;
  };
  lastMaintenance: string;
  nextMaintenance: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: "pilot" | "attendant";
  monthlyHours: number;
  maxHours: number;
  assignments: string[];
}

// Mock flights data
export const mockFlights: Flight[] = [
  {
    id: "f1",
    flightCode: "VN101",
    route: "Hà Nội - TP.HCM",
    departure: "HAN",
    arrival: "SGN",
    departureTime: "08:00",
    arrivalTime: "10:15",
    date: "2025-11-19",
    status: "open",
    aircraftId: "ac1",
    aircraftType: "Boeing 787",
    availableSeats: { economy: 45, business: 8, first: 2 },
    prices: {
      economy: 1500000,
      business: 4500000,
      first: 8000000,
    },
  },
  {
    id: "f2",
    flightCode: "VN202",
    route: "TP.HCM - Đà Nẵng",
    departure: "SGN",
    arrival: "DAD",
    departureTime: "14:30",
    arrivalTime: "15:45",
    date: "2025-11-19", // Changed to tomorrow so check-in can work (within 24 hours)
    status: "open",
    aircraftId: "ac2",
    aircraftType: "Airbus A321",
    availableSeats: { economy: 30, business: 5, first: 0 },
    prices: { economy: 900000, business: 2500000, first: 0 },
  },
  {
    id: "f3",
    flightCode: "VN303",
    route: "Hà Nội - Đà Nẵng",
    departure: "HAN",
    arrival: "DAD",
    departureTime: "06:00",
    arrivalTime: "07:30",
    date: "2025-11-21",
    status: "open",
    aircraftId: "ac3",
    aircraftType: "Boeing 737",
    availableSeats: { economy: 60, business: 10, first: 3 },
    prices: {
      economy: 1200000,
      business: 3500000,
      first: 6500000,
    },
  },
  {
    id: "f4",
    flightCode: "VN404",
    route: "TP.HCM - Phú Quốc",
    departure: "SGN",
    arrival: "PQC",
    departureTime: "16:00",
    arrivalTime: "17:00",
    date: "2025-11-22",
    status: "delayed",
    aircraftId: "ac1",
    aircraftType: "Boeing 787",
    availableSeats: { economy: 25, business: 4, first: 1 },
    prices: {
      economy: 1100000,
      business: 3000000,
      first: 5500000,
    },
  },
  {
    id: "f5",
    flightCode: "VN505",
    route: "Hà Nội - Nha Trang",
    departure: "HAN",
    arrival: "CXR",
    departureTime: "11:00",
    arrivalTime: "13:00",
    date: "2025-11-23",
    status: "full",
    aircraftId: "ac4",
    aircraftType: "Airbus A320",
    availableSeats: { economy: 0, business: 0, first: 0 },
    prices: {
      economy: 1300000,
      business: 3800000,
      first: 7000000,
    },
  },
];

// Generate seat map for a flight
export function generateSeatMap(
  flightId: string,
  flight: Flight,
): Seat[] {
  const seats: Seat[] = [];
  let seatCounter = 1;

  // First class
  for (let i = 0; i < 4; i++) {
    const row = Math.floor(seatCounter / 4) + 1;
    const letter = ["A", "B", "C", "D"][seatCounter % 4];
    seats.push({
      id: `${flightId}-seat-${seatCounter}`,
      seatNumber: `${row}${letter}`,
      class: "first",
      status: Math.random() > 0.3 ? "available" : "occupied",
      price: flight.prices.first,
    });
    seatCounter++;
  }

  // Business class
  for (let i = 0; i < 12; i++) {
    const row = Math.floor(i / 4) + 2;
    const letter = ["A", "B", "C", "D"][i % 4];
    seats.push({
      id: `${flightId}-seat-${seatCounter}`,
      seatNumber: `${row}${letter}`,
      class: "business",
      status: Math.random() > 0.4 ? "available" : "occupied",
      price: flight.prices.business,
    });
    seatCounter++;
  }

  // Economy class
  for (let i = 0; i < 84; i++) {
    const row = Math.floor(i / 6) + 5;
    const letter = ["A", "B", "C", "D", "E", "F"][i % 6];
    seats.push({
      id: `${flightId}-seat-${seatCounter}`,
      seatNumber: `${row}${letter}`,
      class: "economy",
      status: Math.random() > 0.5 ? "available" : "occupied",
      price: flight.prices.economy,
    });
    seatCounter++;
  }

  return seats;
}

// Mock bookings
export const mockBookings: Booking[] = [
  {
    id: "b1",
    ticketCode: "TK001234567",
    passengerId: "demo-passenger",
    passengerName: "Nguyễn Văn A",
    flightId: "f1",
    flightCode: "VN101",
    seatNumber: "12A",
    seatClass: "economy",
    status: "paid",
    bookingDate: "2025-11-15T10:30:00",
    paymentDeadline: "2025-11-16T10:30:00",
    price: 1500000,
    baggage: {
      carryOn: 5,
      checked: 20,
      extraFee: 0,
    },
  },
  {
    id: "b2",
    ticketCode: "TK987654321",
    passengerId: "demo-passenger",
    passengerName: "Nguyễn Văn A",
    flightId: "f2",
    flightCode: "VN202",
    seatNumber: "8C",
    seatClass: "business",
    status: "paid",
    bookingDate: "2025-11-17T14:00:00",
    paymentDeadline: "2025-11-18T14:00:00",
    price: 2500000,
    baggage: {
      carryOn: 7,
      checked: 30,
      extraFee: 0,
    },
  },
];

// Mock aircraft
export const mockAircraft: Aircraft[] = [
  {
    id: "ac1",
    registration: "VN-A888",
    type: "Boeing 787",
    status: "active",
    totalSeats: { economy: 200, business: 28, first: 8 },
    lastMaintenance: "2025-10-01",
    nextMaintenance: "2025-12-01",
  },
  {
    id: "ac2",
    registration: "VN-A321",
    type: "Airbus A321",
    status: "active",
    totalSeats: { economy: 180, business: 20, first: 0 },
    lastMaintenance: "2025-09-15",
    nextMaintenance: "2025-11-15",
  },
  {
    id: "ac3",
    registration: "VN-B737",
    type: "Boeing 737",
    status: "maintenance",
    totalSeats: { economy: 150, business: 16, first: 4 },
    lastMaintenance: "2025-11-10",
    nextMaintenance: "2025-11-20",
  },
  {
    id: "ac4",
    registration: "VN-A320",
    type: "Airbus A320",
    status: "active",
    totalSeats: { economy: 140, business: 12, first: 0 },
    lastMaintenance: "2025-10-20",
    nextMaintenance: "2025-12-20",
  },
];

// Mock crew members
export const mockCrew: CrewMember[] = [
  {
    id: "c1",
    name: "Trần Văn B",
    role: "pilot",
    monthlyHours: 85,
    maxHours: 100,
    assignments: ["VN101", "VN202", "VN303"],
  },
  {
    id: "c2",
    name: "Lê Thị C",
    role: "pilot",
    monthlyHours: 92,
    maxHours: 100,
    assignments: ["VN404", "VN505"],
  },
  {
    id: "c3",
    name: "Phạm Văn D",
    role: "attendant",
    monthlyHours: 65,
    maxHours: 80,
    assignments: ["VN101", "VN202"],
  },
  {
    id: "c4",
    name: "Hoàng Thị E",
    role: "attendant",
    monthlyHours: 78,
    maxHours: 80,
    assignments: ["VN303", "VN404", "VN505"],
  },
];

// Baggage calculation
export function calculateBaggageFee(
  seatClass: "economy" | "business" | "first",
  carryOn: number,
  checked: number,
): number {
  const limits = {
    carryOn: 7,
    checked: {
      economy: 20,
      business: 30,
      first: 40,
    },
  };

  let totalExcess = 0;

  // Calculate carry-on excess
  if (carryOn > limits.carryOn) {
    totalExcess += carryOn - limits.carryOn;
  }

  // Calculate checked excess
  if (checked > limits.checked[seatClass]) {
    totalExcess += checked - limits.checked[seatClass];
  }

  // Round up to nearest 5 kg
  if (totalExcess > 0) {
    totalExcess = Math.ceil(totalExcess / 5) * 5;
  }

  // Fee: 100,000đ per 5 kg
  return (totalExcess / 5) * 100000;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// Calculate time until deadline
export function getTimeRemaining(deadline: string): {
  hours: number;
  minutes: number;
  expired: boolean;
} {
  const now = new Date().getTime();
  const deadlineTime = new Date(deadline).getTime();
  const diff = deadlineTime - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, expired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(
    (diff % (1000 * 60 * 60)) / (1000 * 60),
  );

  return { hours, minutes, expired: false };
}