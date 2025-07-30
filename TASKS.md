# PixeLAW Notification Panel - Technical Implementation Plan

## Overview
Implement a single-line notification panel that overlays the top of the canvas, showing the latest notification/error with an unread count. Panel expands to show scrollable history with coordinate-based navigation.

## Architecture - Updated with Core Integration ✅

### Core Components (Leveraging Existing pixelaw.js Infrastructure)
- **NotificationPanel** - Main overlay component (React UI layer)
- ✅ **Core.notification** - DojoNotificationStore (existing, with timestamps)
- ✅ **Core.errorStore** - DojoErrorStore (existing, with timestamps) 
- ✅ **Core.events** - Event system for real-time updates
- ✅ **Canvas Integration** - setCenter() navigation + glow effects

---

## Phase 1: Foundation & Data Layer ✅ COMPLETE

### ~~Task 1.1: Define Notification Types~~ ✅ DONE
**Status:** Complete - Using existing pixelaw.js types
```typescript
// Already exists in @pixelaw/core
type Notification = {
  position: Position;
  app: App;
  color: number;
  from: string | null;
  to: string | null;
  text: string;
  timestamp: number; // ✅ Added
};

type SimplePixelError = { 
  coordinate: Coordinate | null; 
  error: string; 
  timestamp: number; // ✅ Added
};
```

### ~~Task 1.2: Create Notification Store~~ ✅ DONE
**Status:** Complete - Using existing DojoNotificationStore + DojoErrorStore
- ✅ Both stores have memory (getAll(), getErrors())
- ✅ Both emit events (notification, error)
- ✅ Both have timestamps for proper sorting
- ✅ ErrorStore has coordinate filtering

### ~~Task 1.3: Notification Service~~ ✅ DONE
**Status:** Complete - Using existing Core event system
- ✅ `core.events.emit("notification", notification)`
- ✅ `core.events.emit("error", errorObj)`
- ✅ Coordinate validation built into stores

---

## Phase 2: UI Components (PRIMARY WORK NEEDED)

### Task 2.1: NotificationPanel Component
**File:** `src/components/NotificationPanel/NotificationPanel.tsx`

**Key Features:**
- ✅ Unified time-sorted list of notifications + errors
- ✅ Uses existing pixelaw.js hooks: `usePixelawProvider()`
- ✅ Subscribes to core events: `core.events.on("notification"|"error")`
- ✅ Canvas navigation via existing `setCenter()` + glow effects

**Structure:**
```tsx
const NotificationPanel = () => {
  const { pixelawCore, setCenter } = usePixelawProvider();
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Unified data fetching
  const refreshItems = useCallback(() => {
    const notifications = pixelawCore.notification?.getAll() || [];
    const errors = pixelawCore.errorStore?.getErrors() || [];
    
    const allItems = [
      ...notifications.map(n => ({ type: 'notification', data: n, timestamp: n.timestamp })),
      ...errors.map(e => ({ type: 'error', data: e, timestamp: e.timestamp }))
    ].sort((a, b) => b.timestamp - a.timestamp);
    
    setItems(allItems);
  }, [pixelawCore]);

  // Event subscriptions
  useEffect(() => {
    pixelawCore.events.on("notification", refreshItems);
    pixelawCore.events.on("error", refreshItems);
    refreshItems();
    
    return () => {
      pixelawCore.events.off("notification", refreshItems);
      pixelawCore.events.off("error", refreshItems);
    };
  }, [pixelawCore, refreshItems]);

  return (
    <div className="notification-panel">
      {/* Collapsed State - Shows Latest Item */}
      <div className="notification-bar" onClick={() => setIsExpanded(!isExpanded)}>
        <LatestItem item={items[0]} />
        <UnreadBadge count={items.length} />
        <ExpandIcon />
      </div>
      
      {/* Expanded State - Scrollable Time-Sorted List */}
      {isExpanded && (
        <div className="notification-dropdown">
          <ItemsList 
            items={items}
            onItemClick={handleItemClick}
            onClear={handleClear}
          />
        </div>
      )}
    </div>
  );
};
```

**Props:** None needed - uses pixelaw.js context directly

### Task 2.2: UnifiedItem Components
**File:** `src/components/NotificationPanel/UnifiedItem.tsx`

**LatestItem Component:**
- Shows most recent notification or error in collapsed bar
- Icon differentiation (info vs error)
- Timestamp formatting ("2 min ago")
- Message truncation with tooltip

**ItemsList Component:**
- Unified display for both notification and error types
- Click handlers for coordinate navigation using existing `setCenter()`
- Visual distinction: notification (blue) vs error (red)
- Time grouping ("Today", "Yesterday", etc.)

**Types:**
```typescript
type UnifiedItem = {
  type: 'notification' | 'error';
  data: Notification | SimplePixelError;
  timestamp: number;
};

// Navigation handler
const handleItemClick = (item: UnifiedItem) => {
  const coordinate = item.type === 'notification' 
    ? [item.data.position.x, item.data.position.y] as Coordinate
    : (item.data as SimplePixelError).coordinate;
    
  if (coordinate) {
    setCenter(coordinate);
    pixelawCore.viewPort.effects.addGlow(
      coordinate, 2000, 
      item.type === 'error' ? "#ff4444" : "#44ff44", 
      0.8, 20
    );
  }
};
```

### Task 2.3: Panel Styling & UX
**File:** `src/components/NotificationPanel/NotificationPanel.css`
- Fixed top positioning (overlays canvas)
- Z-index management (above canvas, below modals)
- Smooth expand/collapse animations (height transition)
- Responsive design (mobile-friendly touch targets)
- Color coding: errors (red), notifications (blue/green)
- PixeLAW theme integration (match existing colors)
- Scrollable dropdown with max-height
- Hover states and interaction feedback

---

## ~~Phase 3: Canvas Integration~~ ✅ COMPLETE

### ~~Task 3.1: Canvas Navigation Service~~ ✅ DONE
**Status:** Complete - Using existing `usePixelawProvider()` hook
- ✅ `setCenter(coordinate)` for navigation
- ✅ `core.viewPort.effects.addGlow()` for highlighting
- ✅ Coordinate validation built into Core

### ~~Task 3.2: Renderer Integration~~ ✅ DONE  
**Status:** Complete - Canvas2DRenderer already supports effects
- ✅ Glow effects system exists and works
- ✅ Coordinate transformation handled by Core
- ✅ Visual feedback via existing effects

### ~~Task 3.3: Event System Integration~~ ✅ DONE
**Status:** Complete - Using existing Core events
- ✅ `core.events.on("notification"|"error")` subscription
- ✅ Real-time updates work out of the box

---

## ~~Phase 4: Notification Sources~~ ✅ COMPLETE

### ~~Task 4.1: Blockchain Notifications~~ ✅ DONE
**Status:** Complete - DojoNotificationStore + DojoEngine integration
- ✅ Transaction failures emit errors via `core.events.emit("error")`
- ✅ Notification subscriptions via Dojo SDK
- ✅ Error parsing and storage in DojoErrorStore

### ~~Task 4.2: Canvas Notifications~~ ✅ DONE
**Status:** Complete - Error handling in DojoEngine
- ✅ Transaction errors captured and stored
- ✅ Coordinate-based error tracking

### ~~Task 4.3: System Notifications~~ ✅ READY
**Status:** Infrastructure ready - can add more error sources easily
- ✅ Any component can emit: `core.events.emit("error", errorObj)`
- ✅ ErrorStore will capture and display automatically

---

## Phase 5: Enhanced Features (OPTIONAL)

### Task 5.1: Read/Unread State Management
**File:** `src/hooks/useNotificationPanel.ts`
- Track read status in localStorage
- Mark items as read when clicked or panel expanded
- Show unread count badge
- Persist read state across sessions

```typescript
const useReadState = () => {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  
  const markAsRead = (item: UnifiedItem) => {
    const id = generateItemId(item);
    setReadIds(prev => new Set([...prev, id]));
    // Persist to localStorage
  };
  
  const getUnreadCount = (items: UnifiedItem[]) => {
    return items.filter(item => !readIds.has(generateItemId(item))).length;
  };
};
```

### Task 5.2: User Preferences (OPTIONAL)
- Panel position (top/bottom)
- Auto-dismiss timeouts
- Sound notifications (browser API)
- Notification type filtering (show errors only, etc.)

### Task 5.3: Performance Optimizations (OPTIONAL)
- Virtualized scrolling for 1000+ items
- Debounced event handling
- Memory cleanup for old notifications
- Lazy loading of notification details

---

## Phase 6: Testing & Polish (OPTIONAL)

### Task 6.1: Component Testing
- React Testing Library for UI components
- Event emission and subscription testing
- Navigation click accuracy
- Mobile touch interactions

### Task 6.2: Integration Testing
- End-to-end notification flow
- Canvas coordinate navigation accuracy
- Real blockchain error scenarios
- Cross-browser compatibility

### Task 6.3: Accessibility (RECOMMENDED)
- Screen reader support (ARIA labels)
- Keyboard navigation (Tab, Enter, Escape)
- High contrast mode support
- Focus management for expanded panel

---

## **REVISED Implementation Priority** 

### **🔥 Immediate MVP (Start Here)**
1. ✅ **Phase 1**: Foundation - COMPLETE (pixelaw.js integration)
2. **Task 2.1**: Basic NotificationPanel component
3. **Task 2.2**: UnifiedItem display components  
4. **Task 2.3**: Basic CSS styling

**Estimated Time:** 4-6 hours for working MVP

### **📈 Enhancement Phase**
1. **Task 5.1**: Read/unread state management
2. **Task 5.2**: User preferences
3. **Task 6.3**: Basic accessibility

**Estimated Time:** 2-4 hours additional

### **🎯 Polish Phase**
1. **Task 5.3**: Performance optimizations
2. **Task 6.1-6.2**: Comprehensive testing

**Estimated Time:** 4-8 hours additional

---

## **SUMMARY: What Changed**

### **Major Simplifications:**
- ✅ **~70% Less Work**: Core infrastructure (stores, events, navigation) already exists
- ✅ **Unified Timestamps**: Both notifications and errors now have timestamps for proper sorting
- ✅ **Built-in Memory**: DojoNotificationStore + DojoErrorStore handle persistence
- ✅ **Navigation Ready**: `setCenter()` + glow effects work out of the box
- ✅ **Event System**: Real-time updates via existing `core.events`

### **What's Left to Build:**
1. **React UI Components** (2-3 components)
2. **CSS Styling** (overlay positioning, animations)  
3. **Read/Unread Logic** (optional enhancement)

### **Key Architecture Benefits:**
- **Time-Sorted Feed**: Latest errors/notifications appear first automatically
- **Canvas Integration**: Click any item → navigate to pixel coordinate + glow effect
- **Real-Time Updates**: New items appear immediately via event subscriptions
- **Memory Management**: Built-in limits (100 errors max) prevent memory leaks
- **Type Safety**: Full TypeScript support with existing pixelaw.js types

**Total Implementation Reduced From:** ~40 tasks → **3 core tasks**

The notification panel is now primarily a **UI layer** over robust existing infrastructure rather than a complex system build.