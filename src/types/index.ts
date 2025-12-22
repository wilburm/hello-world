export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  timestamp: string;
}

export interface LiveRate {
  currency: string;
  rate: number;
  change: number;
  timestamp: string;
}

export interface HistoricalDataPoint {
  date: string;
  rate: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  currency?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
