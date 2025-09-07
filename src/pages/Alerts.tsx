import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Download, Filter, ExternalLink } from 'lucide-react';
import Layout from '@/components/Layout';
import ErrorBanner from '@/components/ErrorBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert } from '@/data/structuredMockData';
import { apiService, cacheService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, selectedSeverity, selectedStatus]);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      // TODO: Replace with GET /alerts API
      const data = await apiService.getAlerts();
      setAlerts(data);
      
      // TODO: Cache for offline support with IndexedDB
      cacheService.setAlerts(data);
      
    } catch (error) {
      console.error('Failed to load alerts:', error);
      setHasError(true);
      
      // Load from cache if available
      const cachedAlerts = cacheService.getAlerts();
      if (cachedAlerts.length > 0) {
        setAlerts(cachedAlerts);
        toast({
          title: "Offline Mode",
          description: "Showing cached alerts - some information may be outdated",
          variant: "default"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === selectedSeverity);
    }

    if (selectedStatus !== 'all') {
      const isResolved = selectedStatus === 'resolved';
      filtered = filtered.filter(alert => alert.is_resolved === isResolved);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredAlerts(filtered);
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

  const getStatusBadge = (isResolved: boolean) => {
    return isResolved ? (
      <Badge variant="outline" className="text-success border-success">
        Resolved
      </Badge>
    ) : (
      <Badge className="bg-destructive text-destructive-foreground">
        Active
      </Badge>
    );
  };

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      
      // TODO: Replace mock CSV export with backend export
      const csvData = await apiService.exportAlertsReport();
      
      // Download CSV file
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dwlr-alerts-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Alerts report downloaded successfully",
        variant: "default"
      });
      
    } catch (error) {
      console.error('Failed to export report:', error);
      toast({
        title: "Export Failed",
        description: "Could not generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const resetFilters = () => {
    setSelectedSeverity('all');
    setSelectedStatus('all');
  };

  // Calculate statistics
  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter(a => !a.is_resolved).length;
  const criticalAlerts = alerts.filter(a => a.severity === 'Critical' && !a.is_resolved).length;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading alerts...</div>
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
            Alerts & Reports
          </h1>
          <p className="text-muted-foreground">
            Monitor groundwater alerts and generate reports
          </p>
        </div>

        {/* Error Banner */}
        {hasError && (
          <ErrorBanner 
            onRetry={loadAlerts}
            onDismiss={() => setHasError(false)}
          />
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold">{totalAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-destructive">{activeAlerts}</p>
                </div>
                <div className="h-3 w-3 bg-destructive rounded-full animate-pulse" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-destructive">{criticalAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Export */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Actions
                </CardTitle>
                <CardDescription>
                  Filter alerts and export reports
                </CardDescription>
              </div>
              <Button 
                onClick={handleExportReport}
                disabled={isExporting}
                className="bg-gradient-water text-white hover:opacity-90"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Report'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                  <SelectItem value="Info">Info</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="resolved">Resolved Only</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>

              <div className="text-sm text-muted-foreground flex items-center">
                Showing {filteredAlerts.length} of {totalAlerts} alerts
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle>Alert List</CardTitle>
            <CardDescription>
              Latest groundwater monitoring alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No alerts found matching your criteria
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className="p-4 border rounded-lg hover:shadow-card transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getSeverityBadge(alert.severity)}
                          {getStatusBadge(alert.is_resolved)}
                          <span className="text-sm text-muted-foreground">
                            {alert.date}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold mb-1">{alert.station_name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {alert.message}
                        </p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/station/${alert.station_id}`)}
                        className="flex items-center gap-2"
                      >
                        View Station
                        <ExternalLink className="h-3 w-3" />
                      </Button>
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

export default Alerts;