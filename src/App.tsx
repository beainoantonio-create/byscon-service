/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';

// Route guards to protect secure customer segments
const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs uppercase animate-pulse">authorizing node...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Route guards to protect administrative segments
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs uppercase animate-pulse">verifying privilege index...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile && profile.role !== 'admin' && profile.role !== 'staff') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

function AppContent() {
  return (
    <Router>
      <div id="shed-application-root" className="min-h-screen bg-black text-white selection:bg-lime-primary selection:text-black">
        {/* Navigation Layer */}
        <Navbar />

        {/* View Routing Matrix */}
        <main id="view-space-wrapper">
          <Routes>
            <Route path="/" element={<Home view="landing" />} />
            <Route path="/maintenance" element={<Home view="maintenance" />} />
            <Route path="/consultations" element={<Home view="consultations" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Customer Segments */}
            <Route 
              path="/dashboard" 
              element={
                <CustomerRoute>
                  <Dashboard />
                </CustomerRoute>
              } 
            />

            {/* Administrations / Staff Workspace */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />

            {/* General Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Humid, low-risk, elegant footer */}
        <footer className="bg-black text-zinc-650 font-mono text-[9px] py-8 text-center border-t border-gray-950 no-print">
          <div className="max-w-7xl mx-auto px-4">
            <p className="uppercase tracking-widest font-bold">SHED MANAGEMENT UTILITY SYSTEM</p>
            <p className="mt-1 uppercase text-[8px] tracking-wide opacity-50">© 2026 SHED CORP • ALL SYSTEMS OPERATIONAL</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
