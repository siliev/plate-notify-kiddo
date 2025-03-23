
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  delay?: number;
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  className,
  fullWidth = false,
  delay = 0
}) => {
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        delay: delay
      }
    },
    exit: { 
      opacity: 0, 
      y: 10,
      transition: {
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'mx-auto px-4 sm:px-6 py-8',
        fullWidth ? 'w-full' : 'max-w-7xl',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default Container;
