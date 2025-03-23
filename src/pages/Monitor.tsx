
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import { Container } from '@/components/layout/Container';
import { PlateCard } from '@/components/ui-custom/PlateCard';
import AnimatedPlate from '@/components/ui-custom/AnimatedPlate';
import { usePlateContext } from '@/context/PlateContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { RefreshCw, Search, Car } from 'lucide-react';
import { sendPlateNumber } from '@/lib/api';
import { toast } from 'sonner';

const Monitor = () => {
  const { plates, activePlate, processIncomingPlate, isLoading } = usePlateContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorPlate, setSimulatorPlate] = useState('');
  
  // Filter plates based on search query
  const filteredPlates = plates.filter(plate => 
    plate.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    plate.childName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort by timestamp (most recent first)
  const sortedPlates = [...filteredPlates].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Handle simulated plate arrival
  const handleSimulatePlate = async () => {
    if (!simulatorPlate) {
      toast.error('Please enter a plate number');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // First, send to our simulated API
      const response = await sendPlateNumber(simulatorPlate);
      
      if (response.success) {
        // Then process it in our application
        const result = processIncomingPlate(simulatorPlate);
        
        if (!result) {
          toast.error(`Plate ${simulatorPlate} not found in system`);
        }
        
        // Clear the input
        setSimulatorPlate('');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('An error occurred while processing the plate');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <>
      <Header />
      <div className="min-h-screen pt-20 pb-10 flex flex-col">
        <Container className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar with recent plate history */}
            <div className="col-span-1">
              <div className="sticky top-24">
                <div className="flex flex-col h-[calc(100vh-140px)]">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Recent Arrivals</h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground"
                      onClick={() => setShowSimulator(!showSimulator)}
                    >
                      {showSimulator ? 'Hide Simulator' : 'Simulator'}
                    </Button>
                  </div>
                  
                  {/* Plate simulator (development only) */}
                  <AnimatePresence>
                    {showSimulator && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <Card className="p-4 mb-4 bg-muted/30">
                          <h3 className="text-sm font-medium mb-2">Plate Simulator</h3>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Enter plate number" 
                              value={simulatorPlate}
                              onChange={(e) => setSimulatorPlate(e.target.value)}
                              className="flex-1"
                            />
                            <Button 
                              onClick={handleSimulatePlate} 
                              disabled={isProcessing}
                              className="gap-2"
                            >
                              {isProcessing ? (
                                <RefreshCw size={16} className="animate-spin" />
                              ) : (
                                <Car size={16} />
                              )}
                              <span>Send</span>
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Simulates a car arriving with the entered plate number.
                          </p>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search plates or children..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                    <AnimatePresence>
                      {sortedPlates.length > 0 ? (
                        sortedPlates.map((plate) => (
                          <PlateCard 
                            key={plate.plateNumber} 
                            plate={plate} 
                            isActive={activePlate?.plateNumber === plate.plateNumber}
                          />
                        ))
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center h-40 text-center"
                        >
                          <div className="text-muted-foreground mb-2">
                            <Car size={40} strokeWidth={1} />
                          </div>
                          <p className="text-muted-foreground">
                            {searchQuery ? 'No matching plates found' : 'No recent arrivals'}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main content area */}
            <div className="col-span-1 lg:col-span-2 flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <AnimatePresence mode="wait">
                  {activePlate ? (
                    <div key="active-plate">
                      <div className="text-center mb-8">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600"
                        >
                          Active Arrival
                        </motion.div>
                        <motion.h1 
                          className="text-3xl font-bold mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.3 }}
                        >
                          Car Arrived
                        </motion.h1>
                      </div>
                      
                      <AnimatedPlate 
                        plateNumber={activePlate.plateNumber}
                        childName={activePlate.childName}
                      />
                    </div>
                  ) : (
                    <motion.div 
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center p-6"
                    >
                      <div className="glass rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.05, 1],
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        >
                          <Car size={40} className="text-primary" />
                        </motion.div>
                      </div>
                      
                      <h2 className="text-2xl font-bold mb-2">Waiting for Arrivals</h2>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        The monitor will automatically update when a registered car arrives.
                      </p>
                      
                      <div className="mt-12">
                        <div className="flex items-center justify-center gap-4">
                          <div className="h-3 w-3 rounded-full bg-primary animate-pulse-soft" />
                          <div className="h-3 w-3 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
                          <div className="h-3 w-3 rounded-full bg-primary animate-pulse-soft" style={{ animationDelay: '1s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default Monitor;
