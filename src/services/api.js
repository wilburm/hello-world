import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      throw new Error('API endpoint not found');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error, please try again later');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout, please check your connection');
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Network error, please check your connection');
    }
    
    throw error;
  }
);

export const currencyAPI = {
  // Get current rates
  getCurrentRates: async (baseCurrency = 'CNY') => {
    try {
      const response = await api.get(`/rates/current?base=${baseCurrency}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch current rates: ${error.message}`);
    }
  },

  // Get historical rates for chart
  getHistoricalRates: async (params) => {
    try {
      const queryParams = new URLSearchParams({
        base: params.base || 'CNY',
        target: params.target || 'USD',
        from: params.from || '',
        to: params.to || '',
        limit: params.limit || 100,
      });

      const response = await api.get(`/rates/history?${queryParams}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch historical rates: ${error.message}`);
    }
  },

  // Get paginated history records
  getHistoryTable: async (params) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        sortBy: params.sortBy || 'timestamp',
        sortOrder: params.sortOrder || 'DESC',
        ...(params.baseCurrency && { baseCurrency: params.baseCurrency }),
        ...(params.targetCurrency && { targetCurrency: params.targetCurrency }),
        ...(params.fromDate && { fromDate: params.fromDate }),
        ...(params.toDate && { toDate: params.toDate }),
      });

      const response = await api.get(`/rates/history-table?${queryParams}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch history table: ${error.message}`);
    }
  },

  // Get available currencies
  getCurrencies: async () => {
    try {
      const response = await api.get('/currencies');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch currencies: ${error.message}`);
    }
  },

  // Insert new rate data
  insertRate: async (rateData) => {
    try {
      const response = await api.post('/rates', rateData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to insert rate data: ${error.message}`);
    }
  },

  // Trigger data collection (for scheduled tasks)
  collectData: async (baseCurrency = 'CNY') => {
    try {
      const response = await api.post('/collect-data', { baseCurrency });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to collect data: ${error.message}`);
    }
  },
};

export default api;