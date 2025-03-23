
/**
 * Utility functions for handling service worker registration
 */

/**
 * Registers the service worker
 * @returns Promise that resolves when the service worker is registered
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.error('Service Worker is not supported in this browser');
    return null;
  }

  try {
    // First, unregister any existing service workers
    console.log('Unregistering existing service workers...');
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      await registration.unregister();
      console.log('Service worker unregistered');
    }

    // Register service worker
    console.log('Registering service worker...');
    const registration = await navigator.serviceWorker.register('/sw.js', { 
      scope: '/',
      type: 'module'
    });
    
    console.log('Service Worker registered successfully:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Unregisters all service workers
 */
export const unregisterServiceWorkers = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      await registration.unregister();
      console.log('Service worker unregistered during cleanup');
    }
  }
};
