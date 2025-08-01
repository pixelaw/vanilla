import React, { useState, useEffect } from "react";
import type { UnifiedItem, NotificationPanelProps } from "./types";
import { LatestItem } from "./LatestItem";
import { ItemsList } from "./ItemsList";
import { usePixelawProvider } from "@pixelaw/react";
import type { Notification, SimplePixelError } from "@pixelaw/core";
import "./NotificationPanel.css";

// Helper function to convert notifications to unified items
const notificationToUnifiedItem = (
  notification: Notification,
  index: number,
): UnifiedItem => ({
  id: `notification-${notification.timestamp}-${notification.position.x},${notification.position.y}-${index}`,
  type: "notification",
  timestamp: notification.timestamp,
  coordinate: [notification.position.x, notification.position.y],
  message: notification.text,
  title: "Notification",
  appName: notification.app,
});

// Helper function to convert errors to unified items
const errorToUnifiedItem = (
  error: SimplePixelError,
  index: number,
): UnifiedItem => ({
  id: `error-${error.timestamp}-${error.coordinate[0]},${error.coordinate[1]}-${index}`,
  type: "error",
  timestamp: error.timestamp,
  coordinate: error.coordinate,
  message: error.error,
  title: "Error",
});

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  className,
}) => {
  const { pixelawCore, coreStatus } = usePixelawProvider();
  const [isExpanded, setIsExpanded] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [errors, setErrors] = useState<SimplePixelError[]>([]);

  // Update notifications and errors from stores
  useEffect(() => {
    if (!pixelawCore || !coreStatus.startsWith("ready")) return;

    const updateNotifications = () => {
      setNotifications(pixelawCore.notificationStore.getAll());
    };

    const updateErrors = () => {
      setErrors(pixelawCore.errorStore.getErrors());
    };

    // Initial load
    updateNotifications();
    updateErrors();

    // Subscribe to store events
    pixelawCore.notificationStore.eventEmitter.on("added", updateNotifications);
    pixelawCore.errorStore.eventEmitter.on("errorAdded", updateErrors);
    pixelawCore.errorStore.eventEmitter.on("errorsCleared", updateErrors);

    return () => {
      pixelawCore.notificationStore.eventEmitter.off(
        "added",
        updateNotifications,
      );
      pixelawCore.errorStore.eventEmitter.off("errorAdded", updateErrors);
      pixelawCore.errorStore.eventEmitter.off("errorsCleared", updateErrors);
    };
  }, [pixelawCore, coreStatus]);

  // Convert and combine all items
  const allItems: UnifiedItem[] = [
    ...notifications.map((n, i) => notificationToUnifiedItem(n, i)),
    ...errors.map((e, i) => errorToUnifiedItem(e, i)),
  ];

  // Filter items based on lastEventAck
  const filteredItems = pixelawCore 
    ? allItems.filter(item => item.timestamp > pixelawCore.lastEventAck)
    : allItems;

  // Sort items by timestamp (newest first)
  const sortedItems = filteredItems.sort((a, b) => b.timestamp - a.timestamp);

  // Auto-update lastEventAck if we have more than 100 items
  useEffect(() => {
    if (sortedItems.length > 100 && pixelawCore) {
      const oldestVisibleTimestamp = sortedItems[99].timestamp;
      if (oldestVisibleTimestamp > pixelawCore.lastEventAck) {
        pixelawCore.lastEventAck = oldestVisibleTimestamp;
      }
    }
  }, [sortedItems, pixelawCore]);


  const latestItem = sortedItems[0];
  const unreadCount = sortedItems.length;

  const handleToggleExpanded = () => {
    if (unreadCount > 1) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleItemClick = (item: UnifiedItem) => {
    console.log("Item clicked:", item);
    if (item.coordinate && pixelawCore) {
      // Navigate to coordinate and add glow effect
      pixelawCore.viewPort.setCenter(item.coordinate);
      pixelawCore.viewPort.addGlow(
        item.coordinate,
        3000,
        item.type === "error" ? "#FF0000" : "#3b82f6",
        10,
        50,
      );
    }
  };

  const handleClearAll = () => {
    if (pixelawCore) {
      // Clear errors from the store (this method exists)
      pixelawCore.errorStore.clearErrors();

      // For notifications, update lastEventAck to current time to hide all current events
      pixelawCore.lastEventAck = Date.now();

      // Update local state
      setNotifications(pixelawCore.notificationStore.getAll());
      setErrors([]);
    }
  };

  if (!latestItem) {
    return null;
  }

  return (
    <div className={`notification-panel ${className || ""}`}>
      {/* Collapsed State - Single Line */}
      <div
        className="notification-bar"
        onClick={handleToggleExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleToggleExpanded();
          }
        }}
      >
        <LatestItem item={latestItem} onItemClick={handleItemClick} />

        <div className="panel-controls">
          {unreadCount > 1 && (
            <>
              <span className="unread-badge">{unreadCount}</span>
              <button 
                className="clear-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearAll();
                }}
                title="Clear all notifications"
              >
                🗑
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expanded State - Scrollable List */}
      {isExpanded && unreadCount > 1 && (
        <div className="notification-dropdown">
          <ItemsList items={sortedItems.slice(1)} onItemClick={handleItemClick} />
        </div>
      )}
    </div>
  );
};
