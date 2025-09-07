import { useState } from 'react';
import { Droplets, MapPin, TrendingDown, TrendingUp, Minus, AlertTriangle } from 'lucide-react';
import Layout from '@/components/Layout';
import StatsCard from '@/components/StatsCard';
import WaterLevelChart from '@/components/WaterLevelChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockStations, generateMockReadings } from '@/data/mockData';

const Index = () => {
  const [selectedStation, setSelectedStation] = useState(mockStations[0]);
  const chartData = generateMockReadings(selectedStation.id);

  const totalStations = mockStations.length;
  const safeStations = mockStations.filter(s => s.status === 'safe').length;
  const warningStations = mockStations.filter(s => s.status === 'warning').length;
  const criticalStations = mockStations.filter(s => s.status === 'critical').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'safe':
        return <Badge className="bg-success text-success-foreground">Safe</Badge>;
      case 'warning':
        return <Badge className="bg-warning text-warning-foreground">Warning</Badge>;
      case 'critical':
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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-glow/20" />
        <div className="container relative mx-auto max-w-6xl text-center">
          <div className="mx-auto flex max-w-fit items-center space-x-2 rounded-full border bg-background/80 px-4 py-2 text-sm shadow-elevated backdrop-blur">
            <Droplets className="h-4 w-4 text-primary" />
            <span className="font-medium">Real-time Groundwater Monitoring</span>
          </div>
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            DWLR Groundwater
            <span className="bg-gradient-water bg-clip-text text-transparent"> Monitor</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-3xl mx-auto">
            Monitor groundwater levels across India with real-time DWLR data. 
            Get insights on water availability, trends, and alerts for sustainable usage.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" className="bg-gradient-water text-white shadow-water hover:opacity-90">
              Explore Stations
            </Button>
            <Button variant="outline" size="lg">
              View Analytics
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Stations"
              value={totalStations}
              description="Active monitoring points"
              icon={MapPin}
            />
            <StatsCard
              title="Safe Levels"
              value={safeStations}
              description={`${Math.round((safeStations/totalStations)*100)}% of stations`}
              icon={Droplets}
              trend="up"
              className="border-success/20"
            />
            <StatsCard
              title="Warning Levels"
              value={warningStations}
              description={`${Math.round((warningStations/totalStations)*100)}% of stations`}
              icon={AlertTriangle}
              trend="stable"
              className="border-warning/20"
            />
            <StatsCard
              title="Critical Levels"
              value={criticalStations}
              description={`${Math.round((criticalStations/totalStations)*100)}% of stations`}
              icon={TrendingDown}
              trend="down"
              className="border-destructive/20"
            />
          </div>
        </div>
      </section>

      {/* Station Details and Chart */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Station List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Monitoring Stations</CardTitle>
                  <CardDescription>
                    Select a station to view detailed water level data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockStations.map((station) => (
                    <div 
                      key={station.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-card ${
                        selectedStation.id === station.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setSelectedStation(station)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{station.name}</h4>
                        {getStatusBadge(station.status)}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{station.state}, {station.district}</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(station.trend)}
                          <span>{station.currentLevel}m</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Chart and Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedStation.name}</CardTitle>
                      <CardDescription>
                        {selectedStation.state}, {selectedStation.district}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{selectedStation.currentLevel}m</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getTrendIcon(selectedStation.trend)}
                        <span className="capitalize">{selectedStation.trend}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="mt-1">{getStatusBadge(selectedStation.status)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Last Updated</div>
                      <div className="mt-1 text-sm">
                        {new Date(selectedStation.lastUpdated).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <WaterLevelChart
                data={chartData}
                title="30-Day Water Level Trend"
                description="Daily groundwater level measurements"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
