import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Home } from './pages/Home';
import { Construction } from './pages/Construction';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Core Homepage view types */}
            <Route path="/" element={<Home view="landing" />} />
            <Route path="/maintenance" element={<Home view="maintenance" />} />
            <Route path="/consultations" element={<Home view="consultations" />} />
            
            {/* Construction & Contracting route per Step 5 */}
            <Route path="/construction" element={<Construction />} />
            
            {/* User Session routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
