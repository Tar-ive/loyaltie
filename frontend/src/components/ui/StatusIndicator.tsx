import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface StatusIndicatorProps {
  isOnline: boolean;
  isBackendAvailable: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isOnline,
  isBackendAvailable,
}) => {
  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: 'Offline Mode',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
    
    if (!isBackendAvailable) {
      return {
        icon: AlertCircle,
        text: 'Demo Mode',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    }
    
    return {
      icon: Wifi,
      text: 'Connected',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    };
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${status.bgColor} ${status.borderColor} ${status.color}`}>
      <Icon size={12} />
      <span>{status.text}</span>
    </div>
  );
};
