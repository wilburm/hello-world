import axios, { AxiosInstance } from 'axios';
import {
  LiveRate,
  HistoricalDataPoint,
  ExchangeRate,
  PaginatedResponse,
  PaginationParams,
  SortParams,
  FilterParams,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getLiveRates(): Promise<LiveRate[]> {
    try {
      const response = await this.client.get<LiveRate[]>('/rates/live');
      return response.data;
    } catch (error) {
      console.error('Error fetching live rates:', error);
      throw new Error('Failed to fetch live rates');
    }
  }

  async getHistoricalRates(
    currency: string,
    startDate: string,
    endDate: string
  ): Promise<HistoricalDataPoint[]> {
    try {
      const response = await this.client.get<HistoricalDataPoint[]>('/rates/historical', {
        params: {
          currency,
          startDate,
          endDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching historical rates:', error);
      throw new Error('Failed to fetch historical rates');
    }
  }

  async getRateHistory(
    pagination: PaginationParams,
    sort?: SortParams,
    filter?: FilterParams
  ): Promise<PaginatedResponse<ExchangeRate>> {
    try {
      const response = await this.client.get<PaginatedResponse<ExchangeRate>>('/rates/history', {
        params: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          sortField: sort?.field,
          sortDirection: sort?.direction,
          ...filter,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching rate history:', error);
      throw new Error('Failed to fetch rate history');
    }
  }
}

export const apiService = new ApiService();
