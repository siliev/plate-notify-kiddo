
import React, { useEffect } from 'react';
import { usePlateContext } from '@/context/PlateContext';

/**
 * Component that listens for plate detection events
 */
const PlateDetectionListener: React.FC = () => {
  const { processIncomingPlate } = usePlateContext();
  
  useEffect(() => {
    // Set up event listener to handle plate detection events
    const handlePlateDetected = (event: CustomEvent<string>) => {
      const plateNumber = event.detail;
      console.log('Plate detected event received:', plateNumber);
      processIncomingPlate(plateNumber);
    };
    
    // Add event listener with type assertion
    window.addEventListener('plateDetected', handlePlateDetected as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('plateDetected', handlePlateDetected as EventListener);
    };
  }, [processIncomingPlate]);
  
  return null;
};

export default PlateDetectionListener;
