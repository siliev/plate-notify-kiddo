
import React, { useEffect } from 'react';
import { usePlateContext } from '@/context/PlateContext';

// Define the custom event type
interface PlateDetectedEvent extends CustomEvent {
  detail: string;
}

/**
 * Component that listens for plate detection events
 */
const PlateDetectionListener: React.FC = () => {
  const { processIncomingPlate } = usePlateContext();
  
  useEffect(() => {
    // Set up event listener to handle plate detection events
    const handlePlateDetected = (event: PlateDetectedEvent) => {
      const plateNumber = event.detail;
      console.log('Plate detected event received:', plateNumber);
      processIncomingPlate(plateNumber);
    };
    
    // Add event listener with proper typing
    window.addEventListener('plateDetected', handlePlateDetected as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('plateDetected', handlePlateDetected as EventListener);
    };
  }, [processIncomingPlate]);
  
  return null;
};

export default PlateDetectionListener;
