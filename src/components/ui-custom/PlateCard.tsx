
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface PlateData {
  plateNumber: string;
  childName: string;
  timestamp: Date | string;
  notes?: string;
}

interface PlateCardProps {
  plate: PlateData;
  isActive?: boolean;
  className?: string;
}

export const PlateCard: React.FC<PlateCardProps> = ({ 
  plate, 
  isActive = false,
  className 
}) => {
  // Format the timestamp to a readable time
  // Safely handle different timestamp formats and invalid dates
  const getFormattedTime = () => {
    try {
      const dateObj = plate.timestamp instanceof Date 
        ? plate.timestamp 
        : new Date(plate.timestamp);
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn(`Invalid date for plate ${plate.plateNumber}`);
        return 'Time unavailable';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Time unavailable';
    }
  };

  const formattedTime = getFormattedTime();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={cn(
        "w-full",
        className
      )}
    >
      <Card className={cn(
        "overflow-hidden border glass transition-all duration-300",
        isActive ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
      )}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                {formattedTime}
              </span>
              <h3 className="text-2xl font-bold tracking-tight">
                {plate.plateNumber}
              </h3>
            </div>
            
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  Active
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="mt-4">
            <div className="text-sm text-muted-foreground mb-1">Child</div>
            <div className="text-lg font-semibold">
              {plate.childName}
            </div>
          </div>
          
          {plate.notes && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Notes</div>
              <div className="text-sm">
                {plate.notes}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default PlateCard;
