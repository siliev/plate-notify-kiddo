
import React, { useEffect } from 'react';
import { usePlateContext } from '@/context/PlateContext';
import { processExternalPlateRequest } from '@/lib/api';

/**
 * Component that handles API routes within the application
 * This is a workaround for client-side routing while supporting API endpoints
 */
const PlateApiHandler: React.FC = () => {
  const { processIncomingPlate } = usePlateContext();
  
  useEffect(() => {
    // Set up event listener to handle plate detection events
    const handlePlateDetected = (event: CustomEvent<string>) => {
      const plateNumber = event.detail;
      processIncomingPlate(plateNumber);
    };
    
    // Add event listener with type assertion
    window.addEventListener('plateDetected', handlePlateDetected as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('plateDetected', handlePlateDetected as EventListener);
    };
  }, [processIncomingPlate]);
  
  // Listen for fetch events on the /api/plate path
  useEffect(() => {
    const originalFetch = window.fetch;
    
    // Override fetch to intercept requests to /api/plate
    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      // Check if this is a request to our API endpoint
      if (url.endsWith('/api/plate')) {
        // Create a request object to pass to our handler
        const request = new Request(url, init);
        return processExternalPlateRequest(request);
      }
      
      // For all other requests, use the original fetch
      return originalFetch.apply(this, [input, init as RequestInit]);
    };
    
    // Restore the original fetch when component unmounts
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
  
  // This component doesn't render anything - it just handles API routes
  return null;
};

export default PlateApiHandler;
