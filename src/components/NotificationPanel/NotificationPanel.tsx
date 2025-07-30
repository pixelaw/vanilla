import React, { useState } from 'react';
import { UnifiedItem, NotificationPanelProps } from './types';
import { LatestItem } from './LatestItem';
import { ItemsList } from './ItemsList';
import './NotificationPanel.css';

// Mock data for testing
const mockItems: UnifiedItem[] = [
  {
    id: 'error-1',
    type: 'error',
    timestamp: Date.now() - 1000 * 60 * 2, // 2 minutes ago
    coordinate: [10, 15],
    message: 'Transaction failed: Insufficient gas',
    title: 'Transaction Error'
  },
  {
    id: 'notification-1', 
    type: 'notification',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    coordinate: [25, 30],
    message: 'Pixel placed successfully',
    title: 'Snake Game',
    appName: 'Snake'
  },
  {
    id: 'error-2',
    type: 'error', 
    timestamp: Date.now() - 1000 * 60 * 10, // 10 minutes ago
    coordinate: null,
    message: 'Network connection timeout',
    title: 'Connection Error'
  },
  {
    id: 'notification-2',
    type: 'notification',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago 
    coordinate: [50, 45],
    message: 'New player joined your area',
    title: 'Paint Game',
    appName: 'Paint'
  }
];

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Sort items by timestamp (newest first)
  const sortedItems = mockItems.sort((a, b) => b.timestamp - a.timestamp);
  const latestItem = sortedItems[0];
  const unreadCount = sortedItems.length;

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleItemClick = (item: UnifiedItem) => {
    console.log('Item clicked:', item);
    // TODO: Implement navigation
    if (item.coordinate) {
      console.log(`Navigate to coordinate: ${item.coordinate[0]}, ${item.coordinate[1]}`);
    }
  };

  const handleClearAll = () => {
    console.log('Clear all notifications');
    // TODO: Implement clear functionality
  };

  if (!latestItem) {
    return null;
  }

  return (
    <div className={`notification-panel ${className || ''}`}>
      {/* Collapsed State - Single Line */}
      <div 
        className="notification-bar" 
        onClick={handleToggleExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleToggleExpanded();
          }
        }}
      >
        <LatestItem item={latestItem} />
        
        <div className="panel-controls">
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
          <svg 
            className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
            width="16" 
            height="16" 
            viewBox="0 0 16 16"
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>

      {/* Expanded State - Scrollable List */}
      {isExpanded && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            <button 
              className="clear-all-btn"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>
          
          <ItemsList 
            items={sortedItems}
            onItemClick={handleItemClick}
          />
        </div>
      )}
    </div>
  );
};