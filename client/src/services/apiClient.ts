import axios, { AxiosInstance } from 'axios';
import { CurrentRatesResponse, HistoricalRatesResponse } from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getCurrentRates(refresh: boolean = false): Promise<CurrentRatesResponse> {
    const response = await this.client.get<CurrentRatesResponse>('/api/rates/current', {
      params: { refresh },
    });
    return response.data;
  }

  async getHistoricalRates(
    pair: string,
    startDate?: string,
    endDate?: string
  ): Promise<HistoricalRatesResponse> {
    const response = await this.client.get<HistoricalRatesResponse>('/api/rates/history', {
      params: {
        pair,
        ...(startDate && { start: startDate }),
        ...(endDate && { end: endDate }),
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
