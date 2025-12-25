import type { BaseEntity } from './commonType';

export type AircraftStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

export type Aircraft = BaseEntity & {
  type: string;
  registrationNumber: string;
  manufacturer: string;
  model: string;
  manufactureYear: number;
  serialNumber: string;
  seatCapacity: number;
  status: AircraftStatus;
};

export type CreateAircraftRequest = Omit<Aircraft, keyof BaseEntity>;

export type AircraftSummary = {
  id: number;
  registrationNumber: string;
  model: string;
};

export type AircraftOption = {
  id: number;
  label: string;
  disabled: boolean;
};

export type AircraftUI = {
  id: number;
  registrationNumber: string;
  manufacturer: string;
  model: string;
  seatCapacity: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
};

import type { ApiResponse, PageResponse } from './commonType';

export type AircraftsPageResponse = PageResponse<Aircraft>;

