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
  const getIcon = () => {
    if (item.type === 'error') {
      return (
        <svg className="item-icon error-icon" width="20" height="20" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7" fill="#ef4444" />
          <path d="M8 4v4M8 10h.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    } else {
      return (
        <svg className="item-icon notification-icon" width="20" height="20" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7" fill="#3b82f6" />
          <path d="M8 4v4l2 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
  };

  return (
    <div 
      className={`item-row ${item.type} ${item.coordinate ? 'clickable' : ''}`}
      onClick={() => onItemClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onItemClick(item);
        }
      }}
    >
      {getIcon()}
      
      <div className="item-details">
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
          {item.message}
        </div>
        
        {item.coordinate && (
          <div className="coordinate-badge">
            Click to navigate to ({item.coordinate[0]}, {item.coordinate[1]})
          </div>
        )}
      </div>
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