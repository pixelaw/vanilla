/**
 * Test Helper Functions for PixeLAW Frontend
 * These functions allow programmatic interaction with the UI for testing and debugging
 */

// Global helper functions that can be called from browser console or injected scripts
declare global {
    interface Window {
        pixelawTestHelpers: {
            // App Selector Functions
            openAppSelector: () => void;
            closeAppSelector: () => void;
            selectApp: (appName: string) => void;
            getAvailableApps: () => string[];
            getCurrentApp: () => string | null;
            
            // Color Picker Functions  
            openColorPicker: () => void;
            closeColorPicker: () => void;
            setColor: (color: number) => void;
            getCurrentColor: () => number;
            
            // Wallet Picker Functions
            openWalletPicker: () => void;
            closeWalletPicker: () => void;
            
            // General UI Functions
            clickElement: (selector: string) => void;
            getUIState: () => object;
            
            // Quick Actions
            switchToPaintApp: () => void;
            switchToPlayerApp: () => void;
            switchToApp: (appName: string) => void;
        };
    }
}

// Helper function to dispatch React synthetic events
const dispatchReactEvent = (element: Element, eventType: string) => {
    const event = new MouseEvent(eventType, {
        bubbles: true,
        cancelable: true,
        view: window
    });
    element.dispatchEvent(event);
};

// Helper function to find React component props/state
const getReactProps = (element: Element): any => {
    const key = Object.keys(element).find(key => key.startsWith('__reactProps'));
    return key ? (element as any)[key] : null;
};

// Initialize test helpers
export const initializeTestHelpers = () => {
    window.pixelawTestHelpers = {
        // App Selector Functions
        openAppSelector: () => {
            const appButton = document.querySelector('[class*="customButton"]:first-child') as HTMLElement;
            if (appButton) {
                console.log('Opening app selector...');
                dispatchReactEvent(appButton, 'click');
            } else {
                console.error('App selector button not found');
            }
        },

        closeAppSelector: () => {
            const appPicker = document.querySelector('.pickerPanel');
            if (appPicker) {
                console.log('Closing app selector...');
                // Click outside the panel to close it
                document.body.click();
            } else {
                console.log('App selector is not open');
            }
        },

        selectApp: (appName: string) => {
            console.log(`Attempting to select app: ${appName}`);
            const appPicker = document.querySelector('.pickerPanel');
            if (!appPicker) {
                console.log('Opening app selector first...');
                window.pixelawTestHelpers.openAppSelector();
                // Wait a moment for the picker to open
                setTimeout(() => {
                    const appElements = document.querySelectorAll('.pickerPanel > div');
                    const targetApp = Array.from(appElements).find(el => 
                        el.textContent?.toLowerCase().includes(appName.toLowerCase())
                    ) as HTMLElement;
                    
                    if (targetApp) {
                        console.log(`Selecting app: ${appName}`);
                        dispatchReactEvent(targetApp, 'click');
                    } else {
                        console.error(`App "${appName}" not found. Available apps:`, 
                            Array.from(appElements).map(el => el.textContent));
                    }
                }, 100);
            } else {
                const appElements = document.querySelectorAll('.pickerPanel > div');
                const targetApp = Array.from(appElements).find(el => 
                    el.textContent?.toLowerCase().includes(appName.toLowerCase())
                ) as HTMLElement;
                
                if (targetApp) {
                    console.log(`Selecting app: ${appName}`);
                    dispatchReactEvent(targetApp, 'click');
                } else {
                    console.error(`App "${appName}" not found`);
                }
            }
        },

        getAvailableApps: () => {
            const appElements = document.querySelectorAll('.pickerPanel > div');
            return Array.from(appElements).map(el => el.textContent || '').filter(text => text.length > 0);
        },

        getCurrentApp: () => {
            const url = new URLSearchParams(window.location.search);
            return url.get('app');
        },

        // Color Picker Functions
        openColorPicker: () => {
            const colorButton = document.querySelector('[class*="customButton"]:last-child') as HTMLElement;
            if (colorButton) {
                console.log('Opening color picker...');
                dispatchReactEvent(colorButton, 'click');
            } else {
                console.error('Color picker button not found');
            }
        },

        closeColorPicker: () => {
            const colorPicker = document.querySelector('[class*="colorPicker"]');
            if (colorPicker) {
                console.log('Closing color picker...');
                document.body.click();
            } else {
                console.log('Color picker is not open');
            }
        },

        setColor: (color: number) => {
            console.log(`Setting color to: ${color}`);
            const url = new URLSearchParams(window.location.search);
            url.set('color', color.toString());
            window.history.replaceState(null, '', `?${url.toString()}`);
        },

        getCurrentColor: () => {
            const url = new URLSearchParams(window.location.search);
            return parseInt(url.get('color') || '0');
        },

        // Wallet Picker Functions  
        openWalletPicker: () => {
            const walletButton = document.querySelector('[class*="customButton"]:nth-child(2)') as HTMLElement;
            if (walletButton) {
                console.log('Opening wallet picker...');
                dispatchReactEvent(walletButton, 'click');
            } else {
                console.error('Wallet picker button not found');
            }
        },

        closeWalletPicker: () => {
            console.log('Closing wallet picker...');
            document.body.click();
        },

        // General UI Functions
        clickElement: (selector: string) => {
            const element = document.querySelector(selector) as HTMLElement;
            if (element) {
                console.log(`Clicking element: ${selector}`);
                dispatchReactEvent(element, 'click');
            } else {
                console.error(`Element not found: ${selector}`);
            }
        },

        getUIState: () => {
            const url = new URLSearchParams(window.location.search);
            return {
                app: url.get('app'),
                center: url.get('center'),
                zoom: url.get('zoom'),
                color: url.get('color'),
                world: url.get('world'),
                activeChooser: document.querySelector('.pickerPanel') ? 'app' : 
                              document.querySelector('[class*="colorPicker"]') ? 'color' : 'none'
            };
        },

        // Quick Actions
        switchToPaintApp: () => {
            console.log('Switching to paint app...');
            window.pixelawTestHelpers.closeColorPicker();
            const colorButton = document.querySelector('[class*="customButton"]:last-child') as HTMLElement;
            if (colorButton) {
                dispatchReactEvent(colorButton, 'click');
            }
        },

        switchToPlayerApp: () => {
            console.log('Switching to player app...');
            const walletButton = document.querySelector('[class*="customButton"]:nth-child(2)') as HTMLElement;
            if (walletButton) {
                dispatchReactEvent(walletButton, 'click');
            }
        },

        switchToApp: (appName: string) => {
            console.log(`Switching to app: ${appName}`);
            if (appName === 'paint') {
                window.pixelawTestHelpers.switchToPaintApp();
            } else if (appName === 'player') {
                window.pixelawTestHelpers.switchToPlayerApp();
            } else {
                window.pixelawTestHelpers.selectApp(appName);
            }
        }
    };

    console.log('PixeLAW Test Helpers initialized! Available functions:', Object.keys(window.pixelawTestHelpers));
    console.log('Usage examples:');
    console.log('- pixelawTestHelpers.openAppSelector()');
    console.log('- pixelawTestHelpers.selectApp("snake")');
    console.log('- pixelawTestHelpers.switchToPaintApp()');
    console.log('- pixelawTestHelpers.getUIState()');
};

// Auto-initialize when the module is loaded
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTestHelpers);
    } else {
        initializeTestHelpers();
    }
}