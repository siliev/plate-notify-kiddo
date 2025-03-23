
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ChevronRight, LogOut, Monitor, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4 md:py-6">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                className="w-8 h-8 bg-primary rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span 
                className="text-lg font-medium tracking-tight"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                PlateNotify
              </motion.span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <nav className="hidden md:flex items-center space-x-1">
              <Link to="/monitor">
                <Button 
                  variant={isActive('/monitor') ? "default" : "ghost"} 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Monitor size={18} />
                  <span>Monitor</span>
                </Button>
              </Link>
              
              {user ? (
                <Link to="/admin">
                  <Button 
                    variant={isActive('/admin') ? "default" : "ghost"} 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Settings size={18} />
                    <span>Admin</span>
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button 
                    variant={isActive('/login') ? "default" : "ghost"} 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ChevronRight size={18} />
                    <span>Login</span>
                  </Button>
                </Link>
              )}
              
              {user && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-2 text-destructive"
                  onClick={logout}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </Button>
              )}
            </nav>
            
            {/* Mobile navigation button - simplified for now */}
            <Button variant="ghost" size="sm" className="md:hidden">
              Menu
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
