// API service with placeholder integration for FastAPI backend
// TODO: Replace mock implementations with actual FastAPI calls

import { 
  Station, 
  WaterLevel, 
  Alert, 
  User,
  mockStations, 
  generateMockWaterLevels, 
  mockAlerts,
  mockUsers 
} from '@/data/structuredMockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Error handling wrapper
const handleApiError = (error: any, fallbackData: any) => {
  console.warn('API call failed, using mock data:', error);
  return fallbackData;
};

// Station API calls
export const apiService = {
  // TODO: Replace with GET /stations API
  async getStations(): Promise<Station[]> {
    try {
      const response = await fetch(`${API_URL}/stations`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      return handleApiError(error, mockStations);
    }
  },

  // TODO: Replace with GET /stations/{id} API  
  async getStation(id: string): Promise<Station | null> {
    try {
      const response = await fetch(`${API_URL}/stations/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      const station = mockStations.find(s => s.id === id) || null;
      return handleApiError(error, station);
    }
  },

  // TODO: Replace with GET /water-levels/{station_id} API
  async getWaterLevels(stationId: string): Promise<WaterLevel[]> {
    try {
      const response = await fetch(`${API_URL}/water-levels/${stationId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      return handleApiError(error, generateMockWaterLevels(stationId));
    }
  },

  // TODO: Replace with GET /alerts API
  async getAlerts(): Promise<Alert[]> {
    try {
      const response = await fetch(`${API_URL}/alerts`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      return handleApiError(error, mockAlerts);
    }
  },

  // TODO: Replace with GET /alerts/{station_id} API
  async getStationAlerts(stationId: string): Promise<Alert[]> {
    try {
      const response = await fetch(`${API_URL}/alerts/station/${stationId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      const stationAlerts = mockAlerts.filter(alert => alert.station_id === stationId);
      return handleApiError(error, stationAlerts);
    }
  },

  // TODO: Replace with real authentication API
  async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error('Login failed');
      return await response.json();
    } catch (error) {
      // Mock authentication - accept any email/password for demo
      const user = mockUsers.find(u => u.email === email);
      if (user) {
        return handleApiError(error, { user, token: 'mock-jwt-token' });
      }
      return null;
    }
  },

  // TODO: Replace with real registration API
  async register(email: string, password: string, name: string): Promise<{ user: User; token: string } | null> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      if (!response.ok) throw new Error('Registration failed');
      return await response.json();
    } catch (error) {
      // Mock registration
      const newUser: User = {
        id: `U${Date.now()}`,
        email,
        name,
        role: 'citizen',
        created_at: new Date().toISOString()
      };
      return handleApiError(error, { user: newUser, token: 'mock-jwt-token' });
    }
  },

  // TODO: Replace mock CSV export with backend export
  async exportAlertsReport(): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/reports/alerts/export`);
      if (!response.ok) throw new Error('Export failed');
      return await response.text();
    } catch (error) {
      // Generate mock CSV
      const csvHeader = 'Station,Severity,Message,Date,Status\n';
      const csvRows = mockAlerts.map(alert => 
        `"${alert.station_name}","${alert.severity}","${alert.message}","${alert.date}","${alert.is_resolved ? 'Resolved' : 'Active'}"`
      ).join('\n');
      return handleApiError(error, csvHeader + csvRows);
    }
  }
};

// Local storage helpers for offline caching
// TODO: Implement with IndexedDB for better offline support
export const cacheService = {
  setStations: (stations: Station[]) => {
    localStorage.setItem('dwlr_stations', JSON.stringify(stations));
  },
  
  getStations: (): Station[] => {
    const cached = localStorage.getItem('dwlr_stations');
    return cached ? JSON.parse(cached) : [];
  },
  
  setAlerts: (alerts: Alert[]) => {
    localStorage.setItem('dwlr_alerts', JSON.stringify(alerts));
  },
  
  getAlerts: (): Alert[] => {
    const cached = localStorage.getItem('dwlr_alerts');
    return cached ? JSON.parse(cached) : [];
  }
};