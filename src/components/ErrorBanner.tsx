import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorBanner = ({ 
  message = "⚠️ Could not fetch live data, showing offline data instead", 
  onRetry,
  onDismiss 
}: ErrorBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <span className="text-sm text-warning-foreground">{message}</span>
        </div>
        <div className="flex items-center gap-2">
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="border-warning/20 text-warning hover:bg-warning/10"
            >
              Retry
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="text-warning hover:bg-warning/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;