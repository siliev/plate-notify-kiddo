
import React, { useEffect, useState } from 'react';
import { usePlateContext } from '@/context/PlateContext';
import { toast } from 'sonner';

/**
 * Component that listens for plate detection events from the .NET backend
 */
const PlateDetectionListener: React.FC = () => {
  const { processIncomingPlate } = usePlateContext();
  const [isConnected, setIsConnected] = useState(true);
  
  useEffect(() => {
    // Function to handle plate detection events from the DOM event
    const handlePlateDetected = (event: CustomEvent<string>) => {
      const plateNumber = event.detail;
      console.log('Plate detected event received:', plateNumber);
      processIncomingPlate(plateNumber);
    };
    
    // Function to check backend connectivity
    const checkBackendConnection = async () => {
      try {
        const response = await fetch('https://your-dotnet-api.com/api/health');
        if (response.ok) {
          if (!isConnected) {
            setIsConnected(true);
            toast.success('Connected to backend service');
          }
        } else {
          setIsConnected(false);
          toast.error('Backend service is unavailable');
        }
      } catch (error) {
        setIsConnected(false);
        toast.error('Cannot connect to backend service');
      }
    };
    
    // Check connection on component mount
    checkBackendConnection();
    
    // Set up interval to periodically check backend connection
    const connectionInterval = setInterval(checkBackendConnection, 30000);
    
    // Add event listener with type assertion
    window.addEventListener('plateDetected', handlePlateDetected as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('plateDetected', handlePlateDetected as EventListener);
      clearInterval(connectionInterval);
    };
  }, [processIncomingPlate, isConnected]);
  
  return null;
};

export default PlateDetectionListener;
