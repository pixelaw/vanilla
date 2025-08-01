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
  const truncateMessage = (message: string, maxLength: number = 60) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const handleCoordinateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.coordinate) {
      // This will be handled by the parent component's onItemClick
      const event = new CustomEvent('coordinateClick', { detail: item });
      e.currentTarget.dispatchEvent(event);
    }
  };

  return (
    <div className="latest-item">
      <span className="timestamp">{formatTimestamp(item.timestamp)}</span>
      
      <div className="item-content">
        <div className="item-single-line">
          {item.type === 'error' ? (
            <span className="app-name">Error: </span>
          ) : (
            item.appName && <span className="app-name">{item.appName}: </span>
          )}
          <span className="item-message">{truncateMessage(item.message)}</span>
        </div>
      </div>
      
      {item.coordinate && (
        <span 
          className="coordinate-crosshair" 
          onClick={handleCoordinateClick}
          role="button"
          tabIndex={0}
          title={`Go to (${item.coordinate[0]}, ${item.coordinate[1]})`}
        >
          ⌖
        </span>
      )}
    </div>
  );
};