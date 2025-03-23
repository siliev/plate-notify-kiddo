
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedPlateProps {
  plateNumber: string;
  childName: string;
  className?: string;
}

const AnimatedPlate: React.FC<AnimatedPlateProps> = ({ 
  plateNumber, 
  childName, 
  className 
}) => {
  const plateVariants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.6
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: {
        duration: 0.3
      }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1 + 0.3,
        duration: 0.4
      }
    }),
    exit: { opacity: 0 }
  };

  return (
    <motion.div
      variants={plateVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn("w-full max-w-4xl mx-auto", className)}
    >
      <Card className="glass backdrop-blur-lg border-2 border-white/40 overflow-hidden shadow-xl">
        <div className="p-8 md:p-12 flex flex-col items-center">
          <div className="relative mb-6 w-full max-w-md mx-auto">
            <div className="absolute inset-0 bg-primary/10 rounded-lg blur-xl" />
            <motion.div 
              className="relative bg-white/80 backdrop-blur-sm border border-white/50 rounded-lg p-4 text-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.h2 
                variants={textVariants}
                custom={0}
                className="text-3xl md:text-4xl font-bold tracking-tighter"
              >
                {plateNumber}
              </motion.h2>
            </motion.div>
          </div>
          
          <motion.div 
            variants={textVariants}
            custom={1}
            className="text-center"
          >
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Please prepare:</h4>
            <h3 className="text-2xl md:text-3xl font-bold">{childName}</h3>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 w-full bg-primary/5 rounded-lg p-4 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Car arrived at {new Date().toLocaleTimeString()} on {new Date().toLocaleDateString()}
            </p>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default AnimatedPlate;
