// Structured mock data for DWLR Groundwater Monitor
// TODO: Replace with actual API calls to FastAPI backend

export interface Station {
  id: string;
  name: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  status: 'Safe' | 'Warning' | 'Critical';
  current_depth_m: number;
  last_updated: string;
  trend: 'rising' | 'falling' | 'stable';
}

export interface WaterLevel {
  timestamp: string;
  depth_m: number;
  station_id: string;
}

export interface Alert {
  id: string;
  station_id: string;
  station_name: string;
  severity: 'Critical' | 'Warning' | 'Info';
  message: string;
  date: string;
  is_resolved: boolean;
}

// Mock stations data - structured for FastAPI integration
export const mockStations: Station[] = [
  {
    id: "ST001",
    name: "Nagpur DWLR Station",
    state: "Maharashtra",
    district: "Nagpur",
    latitude: 21.1458,
    longitude: 79.0882,
    status: "Safe",
    current_depth_m: 4.2,
    last_updated: "2025-01-15T10:00:00Z",
    trend: "stable"
  },
  {
    id: "ST002", 
    name: "Pune Urban Observatory",
    state: "Maharashtra",
    district: "Pune",
    latitude: 18.5204,
    longitude: 73.8567,
    status: "Warning",
    current_depth_m: 6.8,
    last_updated: "2025-01-15T09:45:00Z",
    trend: "falling"
  },
  {
    id: "ST003",
    name: "Jaipur Desert Monitor",
    state: "Rajasthan", 
    district: "Jaipur",
    latitude: 26.9124,
    longitude: 75.7873,
    status: "Critical",
    current_depth_m: 8.9,
    last_updated: "2025-01-15T11:15:00Z",
    trend: "falling"
  },
  {
    id: "ST004",
    name: "Bangalore Tech Hub",
    state: "Karnataka",
    district: "Bangalore Urban",
    latitude: 12.9716,
    longitude: 77.5946, 
    status: "Safe",
    current_depth_m: 3.5,
    last_updated: "2025-01-15T10:30:00Z",
    trend: "rising"
  },
  {
    id: "ST005",
    name: "Chennai Coastal Station",
    state: "Tamil Nadu",
    district: "Chennai",
    latitude: 13.0827,
    longitude: 80.2707,
    status: "Critical",
    current_depth_m: 9.2,
    last_updated: "2025-01-15T08:20:00Z",
    trend: "falling"
  },
  {
    id: "ST006",
    name: "Kolkata River Basin",
    state: "West Bengal",
    district: "Kolkata", 
    latitude: 22.5726,
    longitude: 88.3639,
    status: "Safe",
    current_depth_m: 2.8,
    last_updated: "2025-01-15T09:00:00Z",
    trend: "stable"
  }
];

// Generate mock water level readings for the last 30 days
export const generateMockWaterLevels = (stationId: string): WaterLevel[] => {
  const levels: WaterLevel[] = [];
  const station = mockStations.find(s => s.id === stationId);
  const baseDepth = station?.current_depth_m || 5.0;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add variation based on trend
    let variation = 0;
    if (station?.trend === 'falling') {
      variation = (29 - i) * 0.05 + (Math.random() - 0.5) * 0.3;
    } else if (station?.trend === 'rising') {
      variation = (29 - i) * -0.03 + (Math.random() - 0.5) * 0.2;
    } else {
      variation = (Math.random() - 0.5) * 0.2;
    }
    
    levels.push({
      timestamp: date.toISOString(),
      depth_m: Math.max(0.5, baseDepth + variation),
      station_id: stationId
    });
  }
  
  return levels;
};

// Mock alerts data
export const mockAlerts: Alert[] = [
  {
    id: "AL001",
    station_id: "ST003",
    station_name: "Jaipur Desert Monitor",
    severity: "Critical",
    message: "Water table dropped below 9m threshold - immediate action required",
    date: "2025-01-15",
    is_resolved: false
  },
  {
    id: "AL002", 
    station_id: "ST005",
    station_name: "Chennai Coastal Station",
    severity: "Critical",
    message: "Rapid water level decline detected - 0.5m drop in 48 hours",
    date: "2025-01-14", 
    is_resolved: false
  },
  {
    id: "AL003",
    station_id: "ST002",
    station_name: "Pune Urban Observatory", 
    severity: "Warning",
    message: "Water level approaching warning threshold of 7m depth",
    date: "2025-01-13",
    is_resolved: false
  },
  {
    id: "AL004",
    station_id: "ST001",
    station_name: "Nagpur DWLR Station",
    severity: "Info", 
    message: "Station maintenance completed - monitoring resumed",
    date: "2025-01-12",
    is_resolved: true
  }
];

// Mock authentication data
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'citizen' | 'researcher' | 'admin';
  created_at: string;
}

export const mockUsers: User[] = [
  {
    id: "U001",
    email: "citizen@example.com",
    name: "Citizen User",
    role: "citizen", 
    created_at: "2025-01-01T00:00:00Z"
  },
  {
    id: "U002",
    email: "researcher@example.com", 
    name: "Research Analyst",
    role: "researcher",
    created_at: "2025-01-01T00:00:00Z"
  }
];