
import React, { useEffect } from 'react';
import { registerServiceWorker, unregisterServiceWorkers } from '@/lib/serviceWorker';
import ServiceWorkerMessageHandler from './ServiceWorkerMessageHandler';
import PlateDetectionListener from './PlateDetectionListener';

/**
 * Component that handles API routes within the application
 * This is a wrapper component that includes all the API-related functionality
 */
const PlateApiHandler: React.FC = () => {
  // Register our API handler service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.error('Service Worker is not supported in this browser');
      return;
    }

    const setupServiceWorker = async () => {
      await registerServiceWorker();
    };
    
    setupServiceWorker();
    
    // Clean up
    return () => {
      unregisterServiceWorkers();
    };
  }, []);
  
  return (
    <>
      <ServiceWorkerMessageHandler />
      <PlateDetectionListener />
    </>
  );
};

export default PlateApiHandler;
