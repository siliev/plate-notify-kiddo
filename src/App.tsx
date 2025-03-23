
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlateProvider } from './context/PlateContext';
import { AuthProvider } from './context/AuthContext'; 
import { Toaster } from './components/ui/sonner';
import Index from './pages/Index';
import Monitor from './pages/Monitor';
import Admin from './pages/Admin';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import PlateApiHandler from './components/api/PlateApiHandler';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <PlateProvider>
        <BrowserRouter>
          <PlateApiHandler />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/monitor" element={<Monitor />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors />
      </PlateProvider>
    </AuthProvider>
  );
}

export default App;
