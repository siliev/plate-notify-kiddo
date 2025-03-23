
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import { ArrowRight, Car, Monitor, Settings } from 'lucide-react';

const Index = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2"
                >
                  Welcome to PlateNotify
                </motion.div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Smart car <span className="text-primary">plate recognition</span> for child pickups
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Streamline your pickup process with our plate recognition system that automatically notifies staff when a parent arrives.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link to="/monitor">
                    <Button size="lg" className="gap-2">
                      <Monitor size={18} />
                      <span>Open Monitor</span>
                      <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </Link>
                  
                  <Link to="/admin">
                    <Button variant="outline" size="lg" className="gap-2">
                      <Settings size={18} />
                      <span>Admin Panel</span>
                    </Button>
                  </Link>
                </div>
                
                <div className="pt-8">
                  <h3 className="text-lg font-medium mb-4">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Real-time plate recognition",
                      "Automatic child notification",
                      "Secure admin management",
                      "Simple API integration",
                      "Detailed activity logs",
                      "Mobile responsive design"
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                        className="flex items-center gap-2"
                      >
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative hidden lg:block"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl blur-3xl" />
                <div className="relative glass border-white/20 rounded-3xl overflow-hidden p-6">
                  <div className="aspect-[4/3] rounded-2xl bg-white/80 flex items-center justify-center overflow-hidden">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <motion.div
                        animate={{ 
                          y: [0, -10, 0],
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity,
                          repeatType: "reverse", 
                          ease: "easeInOut" 
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Car size={120} className="text-primary/30" />
                      </motion.div>
                      
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 glass px-6 py-4 rounded-xl border border-white/40"
                      >
                        <div className="text-center text-lg font-bold">ABC123</div>
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <div className="h-10 bg-white/80 rounded-lg animate-pulse" />
                    <div className="h-24 bg-white/80 rounded-lg" />
                  </div>
                </div>
              </motion.div>
            </div>
          </Container>
        </div>
        
        <footer className="py-8 border-t">
          <Container>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} PlateNotify. All rights reserved.
              </div>
              
              <div className="flex items-center gap-6">
                <Link to="/monitor" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Monitor
                </Link>
                <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Admin
                </Link>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
              </div>
            </div>
          </Container>
        </footer>
      </div>
    </>
  );
};

export default Index;
