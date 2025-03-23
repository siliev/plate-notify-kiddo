
import React, { useEffect } from 'react';
import { usePlateContext } from '@/context/PlateContext';

/**
 * Component that listens for and handles messages from the service worker
 */
const ServiceWorkerMessageHandler: React.FC = () => {
  const { processIncomingPlate } = usePlateContext();
  
  useEffect(() => {
    // Handle messages from the service worker
    const handleMessage = (event: MessageEvent) => {
      console.log('Message received from service worker:', event.data);
      
      if (event.data && event.data.type === 'PLATE_DETECTED') {
        console.log('Processing plate detection from service worker:', event.data.plateNumber);
        processIncomingPlate(event.data.plateNumber);
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleMessage);
    
    // Clean up
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [processIncomingPlate]);
  
  return null;
};

export default ServiceWorkerMessageHandler;
