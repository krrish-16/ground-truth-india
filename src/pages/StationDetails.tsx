import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, TrendingDown, TrendingUp, Minus, AlertTriangle } from 'lucide-react';
import Layout from '@/components/Layout';
import WaterLevelChart from '@/components/WaterLevelChart';
import ErrorBanner from '@/components/ErrorBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Station, WaterLevel, Alert } from '@/data/structuredMockData';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const StationDetails = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [station, setStation] = useState<Station | null>(null);
  const [waterLevels, setWaterLevels] = useState<WaterLevel[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (stationId) {
      loadStationData(stationId);
    }
  }, [stationId]);

  const loadStationData = async (id: string) => {
    try {
      setIsLoading(true);
      setHasError(false);

      // TODO: Replace with parallel API calls to FastAPI backend
      const [stationData, waterLevelData, alertData] = await Promise.all([
        apiService.getStation(id),
        apiService.getWaterLevels(id),
        apiService.getStationAlerts(id)
      ]);

      if (!stationData) {
        throw new Error('Station not found');
      }

      setStation(stationData);
      setWaterLevels(waterLevelData);
      setAlerts(alertData);

    } catch (error) {
      console.error('Failed to load station data:', error);
      setHasError(true);
      toast({
        title: "Error",
        description: "Failed to load station details",
        variant: "destructive"
      });
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
        return <TrendingUp className="h-5 w-5 text-success" />;
      case 'falling':
        return <TrendingDown className="h-5 w-5 text-destructive" />;
      case 'stable':
        return <Minus className="h-5 w-5 text-warning" />;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'Warning':
        return <Badge className="bg-warning text-warning-foreground">Warning</Badge>;
      case 'Info':
        return <Badge variant="secondary">Info</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  // Transform water levels for chart
  const chartData = waterLevels.map(level => ({
    date: new Date(level.timestamp).toLocaleDateString(),
    level: level.depth_m,
    stationId: level.station_id
  }));

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading station details...</div>
        </div>
      </Layout>
    );
  }

  if (!station) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Station Not Found</h2>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {station.name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{station.state}, {station.district}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="text-3xl font-bold text-foreground">
                {station.current_depth_m}m
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(station.trend)}
                <span className="text-sm text-muted-foreground capitalize">
                  {station.trend}
                </span>
                {getStatusBadge(station.status)}
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {hasError && (
          <ErrorBanner 
            onRetry={() => stationId && loadStationData(stationId)}
            onDismiss={() => setHasError(false)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Station Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Station Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Station ID</div>
                  <div className="font-mono">{station.id}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="mt-1">{getStatusBadge(station.status)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Current Depth</div>
                  <div className="text-lg font-semibold">{station.current_depth_m}m</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Trend</div>
                  <div className="flex items-center gap-2 mt-1">
                    {getTrendIcon(station.trend)}
                    <span className="capitalize">{station.trend}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Last Updated</div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {new Date(station.last_updated).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Coordinates</div>
                  <div className="text-sm font-mono">
                    {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Alerts
                </CardTitle>
                <CardDescription>
                  Latest notifications for this station
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent alerts
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          {getSeverityBadge(alert.severity)}
                          <span className="text-xs text-muted-foreground">
                            {alert.date}
                          </span>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Water Level Chart */}
          <div className="lg:col-span-2">
            <WaterLevelChart
              data={chartData}
              title="30-Day Water Level Trend"
              description="Daily groundwater depth measurements (meters below surface)"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StationDetails;