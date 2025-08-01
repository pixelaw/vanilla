import React from 'react';
import { UnifiedItem } from './types';

interface ItemsListProps {
  items: UnifiedItem[];
  onItemClick: (item: UnifiedItem) => void;
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

const ItemRow: React.FC<{ item: UnifiedItem; onItemClick: (item: UnifiedItem) => void }> = ({ 
  item, 
  onItemClick 
}) => {
  const handleCoordinateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.coordinate) {
      onItemClick(item);
    }
  };

  return (
    <div className={`item-row ${item.type}`}>
      <span className="timestamp">{formatTimestamp(item.timestamp)}</span>
      
      <div className="item-details">
        <div className="item-single-line">
          {item.type === 'error' ? (
            <span className="app-name">Error: </span>
          ) : (
            item.appName && <span className="app-name">{item.appName}: </span>
          )}
          <span className="item-message">{item.message}</span>
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

export const ItemsList: React.FC<ItemsListProps> = ({ items, onItemClick }) => {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="items-list">
      {items.map((item) => (
        <ItemRow 
          key={item.id} 
          item={item} 
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
};