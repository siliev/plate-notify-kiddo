
import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock } from 'lucide-react';

const Login = () => {
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // If already logged in, redirect to admin page
  if (user) {
    return <Navigate to="/admin" replace />;
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('Please enter both username and password');
      return;
    }
    
    const success = await login(formData.username, formData.password);
    
    if (success) {
      toast.success('Logged in successfully');
      navigate('/admin');
    } else {
      toast.error('Invalid username or password');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <Container className="max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <motion.div
                className="w-12 h-12 bg-primary rounded-full mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            </Link>
            <h1 className="text-2xl font-bold mt-4">Admin Login</h1>
            <p className="text-muted-foreground mt-1">
              Sign in to manage plate records
            </p>
          </div>
          
          <Card className="p-6 backdrop-blur-lg shadow-lg glass">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  placeholder="admin"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                    <span className="sr-only">
                      {showPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-6 gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Lock size={16} />
                    </motion.div>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Login</span>
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground mt-4">
                <p>
                  For demo, use: <span className="font-medium">admin / admin123</span>
                </p>
              </div>
            </form>
          </Card>
          
          <div className="text-center mt-8">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};

export default Login;
