import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, MapPin, TrendingDown, TrendingUp, Minus, AlertTriangle } from 'lucide-react';
import Layout from '@/components/Layout';
import StatsCard from '@/components/StatsCard';
import SearchFilters from '@/components/SearchFilters';
import ErrorBanner from '@/components/ErrorBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Station } from '@/data/structuredMockData';
import { apiService, cacheService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load stations data
  useEffect(() => {
    loadStations();
  }, []);

  // Filter stations based on search and filters
  useEffect(() => {
    let filtered = stations;

    if (searchTerm) {
      filtered = filtered.filter(station =>
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.district.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedState !== 'all') {
      filtered = filtered.filter(station => station.state === selectedState);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(station => station.status === selectedStatus);
    }

    setFilteredStations(filtered);
  }, [stations, searchTerm, selectedState, selectedStatus]);

  const loadStations = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      // TODO: Replace with GET /stations API
      const data = await apiService.getStations();
      setStations(data);
      
      // TODO: Cache for offline support with IndexedDB
      cacheService.setStations(data);
      
    } catch (error) {
      console.error('Failed to load stations:', error);
      setHasError(true);
      
      // Load from cache if available
      const cachedStations = cacheService.getStations();
      if (cachedStations.length > 0) {
        setStations(cachedStations);
        toast({
          title: "Offline Mode",
          description: "Showing cached data - some information may be outdated",
          variant: "default"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Safe':
        return <Badge className="bg-success text-success-foreground">Safe</Badge>;
      case 'Warning':
        return <Badge className="bg-warning text-warning-foreground">Warning</Badge>;
      case 'Critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'falling':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedState('all');
    setSelectedStatus('all');
  };

  // Calculate statistics
  const totalStations = stations.length;
  const safeStations = stations.filter(s => s.status === 'Safe').length;
  const warningStations = stations.filter(s => s.status === 'Warning').length;
  const criticalStations = stations.filter(s => s.status === 'Critical').length;
  const uniqueStates = [...new Set(stations.map(s => s.state))];

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading stations...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            DWLR Groundwater Monitor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring of groundwater levels across India
          </p>
        </div>

        {/* Error Banner */}
        {hasError && (
          <ErrorBanner 
            onRetry={loadStations}
            onDismiss={() => setHasError(false)}
          />
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Stations"
            value={totalStations}
            description="Active monitoring points"
            icon={MapPin}
          />
          <StatsCard
            title="Safe Levels"
            value={safeStations}
            description={`${totalStations ? Math.round((safeStations/totalStations)*100) : 0}% of stations`}
            icon={Droplets}
            trend="up"
            className="border-success/20"
          />
          <StatsCard
            title="Warning Levels"
            value={warningStations}
            description={`${totalStations ? Math.round((warningStations/totalStations)*100) : 0}% of stations`}
            icon={AlertTriangle}
            trend="stable"
            className="border-warning/20"
          />
          <StatsCard
            title="Critical Levels"
            value={criticalStations}
            description={`${totalStations ? Math.round((criticalStations/totalStations)*100) : 0}% of stations`}
            icon={TrendingDown}
            trend="down"
            className="border-destructive/20"
          />
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedState={selectedState}
            onStateChange={setSelectedState}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            states={uniqueStates}
            onReset={resetFilters}
          />
        </div>

        {/* Stations Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Monitoring Stations ({filteredStations.length})</CardTitle>
            <CardDescription>
              Click on any station to view detailed water level data and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No stations found matching your criteria
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStations.map((station) => (
                  <div 
                    key={station.id}
                    className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-card hover:border-primary/50"
                    onClick={() => navigate(`/station/${station.id}`)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">{station.name}</h4>
                      {getStatusBadge(station.status)}
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>{station.state}, {station.district}</div>
                      <div className="flex items-center justify-between">
                        <span>Depth: {station.current_depth_m}m</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(station.trend)}
                          <span className="capitalize">{station.trend}</span>
                        </div>
                      </div>
                      <div className="text-xs">
                        Updated: {new Date(station.last_updated).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;