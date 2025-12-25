import type { BaseEntity } from './commonType';

export type Schedule = BaseEntity & {
  flight: string;
  departureTime: string; // ISO datetime
  arrivalTime: string; // ISO datetime
  durationMinutes: number;
};