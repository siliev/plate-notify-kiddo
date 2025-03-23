
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PlateData } from '@/components/ui-custom/PlateCard';

interface PlateContextType {
  plates: PlateData[];
  activePlate: PlateData | null;
  addPlate: (plate: Omit<PlateData, 'timestamp'>) => void;
  updatePlate: (plateNumber: string, updates: Partial<Omit<PlateData, 'plateNumber' | 'timestamp'>>) => void;
  deletePlate: (plateNumber: string) => void;
  setActivePlate: (plateNumber: string) => void;
  processIncomingPlate: (plateNumber: string) => boolean;
  isLoading: boolean;
}

// Initial mock data
const initialPlates: PlateData[] = [
  {
    plateNumber: 'ABC123',
    childName: 'Emma Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    notes: 'Pickup at east entrance'
  },
  {
    plateNumber: 'XYZ789',
    childName: 'Noah Williams',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    plateNumber: 'DEF456',
    childName: 'Olivia Davis',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    notes: 'Has asthma medication in backpack'
  }
];

const PlateContext = createContext<PlateContextType | undefined>(undefined);

export const PlateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plates, setPlates] = useState<PlateData[]>(() => {
    const storedPlates = localStorage.getItem('plates');
    return storedPlates ? JSON.parse(storedPlates) : initialPlates;
  });
  
  const [activePlate, setActivePlate] = useState<PlateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Persist plates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('plates', JSON.stringify(plates));
  }, [plates]);

  const addPlate = (plateData: Omit<PlateData, 'timestamp'>) => {
    // Check if plate already exists
    if (plates.some(p => p.plateNumber === plateData.plateNumber)) {
      toast.error(`Plate ${plateData.plateNumber} already exists`);
      return;
    }
    
    const newPlate: PlateData = {
      ...plateData,
      timestamp: new Date()
    };
    
    setPlates(prev => [newPlate, ...prev]);
    toast.success(`Added plate ${plateData.plateNumber}`);
  };

  const updatePlate = (
    plateNumber: string, 
    updates: Partial<Omit<PlateData, 'plateNumber' | 'timestamp'>>
  ) => {
    setPlates(prev => 
      prev.map(plate => 
        plate.plateNumber === plateNumber 
          ? { ...plate, ...updates } 
          : plate
      )
    );
    toast.success(`Updated plate ${plateNumber}`);
  };

  const deletePlate = (plateNumber: string) => {
    setPlates(prev => prev.filter(plate => plate.plateNumber !== plateNumber));
    
    // If the active plate is being deleted, set activePlate to null
    if (activePlate?.plateNumber === plateNumber) {
      setActivePlate(null);
    }
    
    toast.success(`Deleted plate ${plateNumber}`);
  };

  const handleSetActivePlate = (plateNumber: string) => {
    const plate = plates.find(p => p.plateNumber === plateNumber);
    
    if (plate) {
      setActivePlate(plate);
      return true;
    }
    
    return false;
  };

  const processIncomingPlate = (plateNumber: string): boolean => {
    // Set loading state
    setIsLoading(true);
    
    // Look for the plate in our system
    const plate = plates.find(p => p.plateNumber === plateNumber);
    
    if (plate) {
      // Update the timestamp to now
      const updatedPlate = { ...plate, timestamp: new Date() };
      
      // Update the plate in the array
      setPlates(prev => 
        prev.map(p => 
          p.plateNumber === plateNumber ? updatedPlate : p
        )
      );
      
      // Set it as the active plate
      setActivePlate(updatedPlate);
      
      // Show a success notification
      toast.success(`Plate ${plateNumber} recognized: ${plate.childName} is ready for pickup`, {
        duration: 5000,
      });
      
      setIsLoading(false);
      return true;
    } else {
      // Plate not found
      toast.error(`Plate ${plateNumber} not found in system`, {
        duration: 3000,
      });
      
      setIsLoading(false);
      return false;
    }
  };

  const value = {
    plates,
    activePlate,
    addPlate,
    updatePlate,
    deletePlate,
    setActivePlate: handleSetActivePlate,
    processIncomingPlate,
    isLoading
  };

  return <PlateContext.Provider value={value}>{children}</PlateContext.Provider>;
};

export const usePlateContext = (): PlateContextType => {
  const context = useContext(PlateContext);
  if (context === undefined) {
    throw new Error('usePlateContext must be used within a PlateProvider');
  }
  return context;
};
