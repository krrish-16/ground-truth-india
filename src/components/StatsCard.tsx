import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

const StatsCard = ({ title, value, description, icon: Icon, trend, className }: StatsCardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      case 'stable':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn('transition-all duration-300 hover:shadow-card', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className={cn('text-xs', getTrendColor())}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;