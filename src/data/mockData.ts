// Mock data for DWLR stations and water levels
export interface Station {
  id: string;
  name: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  currentLevel: number;
  status: 'safe' | 'warning' | 'critical';
  lastUpdated: string;
  trend: 'rising' | 'falling' | 'stable';
}

export interface WaterLevelReading {
  date: string;
  level: number;
  stationId: string;
}

export const mockStations: Station[] = [
  {
    id: 'DL001',
    name: 'Central Delhi Observatory',
    state: 'Delhi',
    district: 'Central Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    currentLevel: 12.5,
    status: 'warning',
    lastUpdated: '2024-01-15T10:30:00Z',
    trend: 'falling'
  },
  {
    id: 'MH001',
    name: 'Mumbai Coastal Station',
    state: 'Maharashtra',
    district: 'Mumbai',
    latitude: 19.0760,
    longitude: 72.8777,
    currentLevel: 8.2,
    status: 'critical',
    lastUpdated: '2024-01-15T11:00:00Z',
    trend: 'falling'
  },
  {
    id: 'KA001',
    name: 'Bangalore Tech Hub',
    state: 'Karnataka',
    district: 'Bangalore Urban',
    latitude: 12.9716,
    longitude: 77.5946,
    currentLevel: 15.8,
    status: 'safe',
    lastUpdated: '2024-01-15T09:45:00Z',
    trend: 'stable'
  },
  {
    id: 'TN001',
    name: 'Chennai Metro Station',
    state: 'Tamil Nadu',
    district: 'Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    currentLevel: 6.5,
    status: 'critical',
    lastUpdated: '2024-01-15T10:15:00Z',
    trend: 'falling'
  },
  {
    id: 'WB001',
    name: 'Kolkata River Basin',
    state: 'West Bengal',
    district: 'Kolkata',
    latitude: 22.5726,
    longitude: 88.3639,
    currentLevel: 18.2,
    status: 'safe',
    lastUpdated: '2024-01-15T10:45:00Z',
    trend: 'rising'
  },
  {
    id: 'RJ001',
    name: 'Jaipur Desert Station',
    state: 'Rajasthan',
    district: 'Jaipur',
    latitude: 26.9124,
    longitude: 75.7873,
    currentLevel: 4.3,
    status: 'critical',
    lastUpdated: '2024-01-15T09:30:00Z',
    trend: 'falling'
  }
];

// Generate mock water level readings for the last 30 days
export const generateMockReadings = (stationId: string): WaterLevelReading[] => {
  const readings: WaterLevelReading[] = [];
  const station = mockStations.find(s => s.id === stationId);
  const baseLevel = station?.currentLevel || 10;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some variation based on trend
    let variation = 0;
    if (station?.trend === 'falling') {
      variation = (29 - i) * -0.1 + (Math.random() - 0.5) * 0.5;
    } else if (station?.trend === 'rising') {
      variation = (29 - i) * 0.05 + (Math.random() - 0.5) * 0.3;
    } else {
      variation = (Math.random() - 0.5) * 0.4;
    }
    
    readings.push({
      date: date.toISOString().split('T')[0],
      level: Math.max(0, baseLevel + variation),
      stationId
    });
  }
  
  return readings;
};