# Pixel Interaction Flow Documentation

This document describes the complete flow when a user clicks on a pixel in the PixeLAW application, from the initial canvas click through blockchain execution.

## Code Organization

The interaction flow spans two repositories:
- **vanilla** (this repository): Frontend React application
- **pixelaw.js** (`../pixelaw.js`): Core SDK and engine implementations

## Overview

The pixel interaction system follows a layered architecture:
- **Canvas Layer**: Handles mouse/touch events and coordinate conversion (pixelaw.js)
- **Core Layer**: Manages application state and orchestrates interactions (pixelaw.js)
- **Engine Layer**: Handles blockchain-specific operations (pixelaw.js)
- **Frontend Layer**: React components and event handlers (vanilla)
- **Execution Layer**: Manages transaction queuing and blockchain calls (pixelaw.js)

## Detailed Flow

### 1. Canvas Click Detection

**Location**: `../pixelaw.js/packages/core/src/renderers/Canvas2DRenderer/handlers.ts`

When a user clicks on the canvas:

```typescript
// handleMouseUp() - line 153
const timeDiff = Date.now() - this.mouseDownTime;
const totalDistance = Math.abs(dx) + Math.abs(dy);

// Click detected if: quick tap (10-1500ms) with minimal movement (<10px)
if (timeDiff > 10 && timeDiff < 1500 && totalDistance < 10) {
    // Convert screen coordinates to grid coordinates
    const x = Math.floor((mouseX - offsetX) / (zoom * cellSize));
    const y = Math.floor((mouseY - offsetY) / (zoom * cellSize));
    
    // Emit cellClicked event
    this.renderer.core.events.emit("cellClicked", [x, y]);
}
```

### 2. Frontend Event Handler

**Location**: `src/pages/GamePage/GamePage.tsx` (vanilla - this repo)

The GamePage component listens for cell clicks:

```typescript
// handleCellClick() - line 135
const handleCellClick = async (cell: Coordinate) => {
    // Skip if zoomed out too far
    if (getZoomLevel(zoom) === "far") return;
    
    // Prepare interaction through core
    const interaction = await pixelawCore.prepInteraction(cell);
    
    // Check if user parameters needed
    if (interaction.getUserParams().length === 0) {
        // Execute immediately
        await interaction.execute();
    } else {
        // Show parameter dialog
        setCurrentInteraction(interaction);
    }
};
```

### 3. Interaction Preparation

**Core Delegation**: `../pixelaw.js/packages/core/src/PixelawCore.ts:299`
```typescript
async prepInteraction(coordinate: Coordinate): Promise<Interaction> {
    return await this._engine.prepInteraction(coordinate);
}
```

**Engine Processing**: `../pixelaw.js/packages/core-dojo/src/DojoEngine.ts:71`
```typescript
async prepInteraction(coordinate: Coordinate): Promise<Interaction> {
    // Get or create pixel data
    const pixel = this.core.pixelStore.getPixel(coordinate) ?? 
                  { x: coordinate[0], y: coordinate[1] };
    
    // Get current app and color
    const app = this.core.appStore.getByName(this.core.app);
    const color = this.core.color;
    
    // Create interaction object
    return await DojoInteraction.create(this, app, pixel, color);
}
```

### 4. DojoInteraction Creation

**Location**: `../pixelaw.js/packages/core-dojo/src/DojoInteraction.ts`

The DojoInteraction class handles the specifics of a pixel interaction:

```typescript
static async create(engine, app, pixel, color): Promise<DojoInteraction> {
    const functionName = pixel?.action || "interact";
    const contractName = `${app.name}_actions`;
    
    const interaction = new DojoInteraction(
        engine, app, pixel, color, contractName, functionName
    );
    
    await interaction.initializeParams();  // Parse ABI for parameters
    interaction.initializeAction();        // Create execution function
    
    return interaction;
}
```

#### Parameter Initialization
```typescript
private async initializeParams(): Promise<void> {
    // Find contract in manifest
    const contract = findContract(this.manifest, this.contractName);
    
    // Find function in ABI
    const fn = contract.abi.find(f => f.name === this.functionName);
    
    // Extract and prepare parameters
    const rawParams = extractParamsFromAbi(fn);
    this.params = await prepareParams(this, rawParams, contract.abi);
}
```

#### Action Initialization
```typescript
private initializeAction(): void {
    this.action = async (params) => {
        // Generate blockchain call data
        const dojoCall = generateDojoCall(
            this.manifest, params, this.contractName, 
            this.functionName, this.position, this.color
        );
        
        // Enqueue for execution with error handling
        this.engine.core.executor.enqueue(
            dojoCall,
            console.log,  // Success callback
            (e: Error | string) => {
                // Parse coordinate-specific errors
                const regex = /"\s*(\d+_\d+\s[^"]+)\s*"/;
                const match = error.match(regex);
                
                if (match) {
                    // Extract coordinate from error like "15_16 NotAllowed"
                    const pixelError = parsePixelError(match[1]);
                    this.engine.core.events.emit("error", pixelError);
                } else {
                    // Emit error without coordinate
                    this.engine.core.events.emit("error", { 
                        coordinate: null, error, timestamp: Date.now() 
                    });
                }
            }
        );
    };
}
```

### 5. User Parameter Collection (Optional)

**Location**: `../pixelaw.js/packages/react/src/components/InteractionDialog.tsx`

If the interaction requires user parameters:
- Dialog displays form inputs based on parameter types
- Supports: string, number, enum, emoji types
- On submit: calls `interaction.execute()`

### 6. Blockchain Call Generation

**Location**: `../pixelaw.js/packages/core-dojo/src/interaction/generateDojoCall.ts`

Builds the calldata array for the smart contract:

```typescript
const calldata = [
    player_override,     // 1 (use current player)
    system_override,     // 1 (use app system)
    area_hint,          // 1 (default area)
    position.x,         // X coordinate
    position.y,         // Y coordinate
    color,              // Selected color
    ...params.map(p => p.value)  // User parameters
];

return {
    contractAddress: contract.address,
    entrypoint: action,
    calldata
};
```

### 7. Execution Queue System

**Location**: `../pixelaw.js/packages/core-dojo/src/DojoExecutor.ts`

The DojoExecutor manages transaction execution:

```typescript
public enqueue(dojoCall, onSuccess, onFail): void {
    this.queue.push({ dojoCall, onSuccess, onFail });
    this.processQueue();
}

private async processQueue(): Promise<void> {
    // Check guards
    if (this.executing || this.queue.length === 0) return;
    if (!this.walletProvider?.account) return;
    
    // Get next task
    const task = this.queue.shift();
    this.executing = true;
    
    try {
        // Get account and nonce
        const account = await this.resolveAccount();
        const nonce = await account.getNonce();
        
        // Parse and execute
        const call = parseDojoCall(this.manifest, task.dojoCall);
        
        // Simulate and execute in parallel
        const [sim, { transaction_hash }] = await Promise.all([
            account.simulateTransaction([call], options),
            account.execute([call], options)
        ]);
        
        // Handle success/failure
        if (sim[0].transaction_trace?.execute_invocation?.revert_reason) {
            task.onFail(revert_reason);
        } else {
            task.onSuccess(sim[0]);
        }
    } catch (error) {
        task.onFail(error);
    } finally {
        this.executing = false;
        this.processQueue();  // Process next item
    }
}
```

### 8. Error Handling

Errors can occur at multiple levels:

1. **Parameter Validation**: Invalid user input
2. **Contract Resolution**: Missing contract/function
3. **Execution Errors**: Network, nonce, or gas issues
4. **Smart Contract Errors**: Revert with reasons like "15_16 NotAllowed"

Error flow:
```
Contract Error → DojoExecutor → onFail callback → DojoInteraction error handler
→ Parse coordinate → Emit error event → ErrorStore → NotificationPanel
```

### 9. Queue Items

For delayed actions, the system uses QueueItems:

**Location**: `../pixelaw.js/packages/core-dojo/src/DojoQueueStore.ts`
- Subscribes to `QueueScheduled` events from blockchain
- Stores items until execution time
- Emits `scheduled` event when ready

**GamePage Handler** (vanilla): Executes queued items
```typescript
const handleQueueItem = (item: QueueItem) => {
    pixelawCore.executeQueueItem(item);
};
```

### 10. State Updates

After successful execution:
1. Transaction events parsed for pixel changes
2. PixelStore updated with new states
3. Events emitted: `pixelStoreUpdated`, `tileStoreUpdated`
4. Canvas re-renders with new pixel data

## Error Coordinate Parsing

The system attempts to parse coordinates from error messages:

```typescript
// Example error: "15_16 NotAllowed"
const regex = /"\s*(\d+_\d+\s[^"]+)\s*"/;
const match = error.match(regex);

if (match) {
    // parsePixelError extracts: { coordinate: [15, 16], error: "NotAllowed" }
    const pixelError = parsePixelError(match[1]);
}
```

## Visual Feedback

- **Click feedback**: Immediate visual response on canvas
- **Error feedback**: Red glow effect at error coordinate
- **Success feedback**: Pixel color changes after blockchain confirmation

## Architecture Benefits

1. **Separation of Concerns**: Canvas, Core, Engine layers are independent
2. **Extensibility**: Easy to add new engines (MUD) or renderers
3. **Error Recovery**: Robust error handling at each layer
4. **User Experience**: Optimistic updates with proper error rollback
5. **Scalability**: Queue system prevents nonce conflicts

## Common Issues and Solutions

### Issue: Errors show "coordinate: null"
**Cause**: Error parsing fails or error occurs outside pixel context
**Solution**: Check error message format matches parsing regex

### Issue: Clicks not registering
**Cause**: Zoom level check or drag detection
**Solution**: Ensure proper zoom level and minimal mouse movement

### Issue: Parameters not showing
**Cause**: ABI parsing or parameter preparation fails
**Solution**: Verify contract manifest and ABI definitions

### Issue: Transaction failures
**Cause**: Nonce conflicts, gas issues, or contract reverts
**Solution**: Queue system handles nonces; check contract logic for reverts