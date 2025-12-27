export type ApiErrors = Record<string, string> | any;

export type BaseEntity = {
  id: number;
  version: number;
  createdBy: number;
  updatedBy: number;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  errors?: ApiErrors | null;
  timestamp?: string;
}

export interface PageResponse<T> {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  content: T[];
}

export default ApiResponse;
