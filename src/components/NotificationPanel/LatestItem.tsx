import React from 'react';
import { UnifiedItem } from './types';

interface LatestItemProps {
  item: UnifiedItem;
}

const formatTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export const LatestItem: React.FC<LatestItemProps> = ({ item }) => {
  const getIcon = () => {
    if (item.type === 'error') {
      return (
        <svg className="item-icon error-icon" width="16" height="16" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7" fill="#ef4444" />
          <path d="M8 4v4M8 10h.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    } else {
      return (
        <svg className="item-icon notification-icon" width="16" height="16" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7" fill="#3b82f6" />
          <path d="M8 4v4l2 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
  };

  const truncateMessage = (message: string, maxLength: number = 60) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div className="latest-item">
      {getIcon()}
      
      <div className="item-content">
        <div className="item-header">
          <span className="item-title">
            {item.title || (item.type === 'error' ? 'Error' : 'Notification')}
          </span>
          {item.appName && (
            <span className="app-name">• {item.appName}</span>
          )}
          <span className="timestamp">{formatTimestamp(item.timestamp)}</span>
        </div>
        
        <div className="item-message">
          {truncateMessage(item.message)}
        </div>
        
        {item.coordinate && (
          <div className="coordinate-badge">
            ({item.coordinate[0]}, {item.coordinate[1]})
          </div>
        )}
      </div>
    </div>
  );
};