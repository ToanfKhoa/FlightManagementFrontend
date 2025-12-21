export type ApiErrors = Record<string, string> | any;

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
