/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import Auth from './pages/Auth';
import BookingFlow from './pages/BookingFlow';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import { ToastNotifier } from './components/ToastNotifier';

export default function App() {
  // Global Drag-to-Scroll (Grab-and-Slide) support
  useEffect(() => {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;
    let activeContainer: HTMLElement | null = null;

    const handleMouseDown = (e: MouseEvent) => {
      // Exclude clicks on interactive elements (inputs, options, dropdowns, links, buttons, details, components)
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive = 
        target.closest('button') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.isContentEditable;

      if (isInteractive) return;

      // Find the closest parent that handles scrolling if there is a nested scroller
      let parent: HTMLElement | null = target;
      activeContainer = null;
      while (parent && parent !== document.body && parent !== document.documentElement) {
        const style = window.getComputedStyle(parent);
        const isScrollableX = (parent.scrollWidth > parent.clientWidth) && (style.overflowX === 'auto' || style.overflowX === 'scroll');
        const isScrollableY = (parent.scrollHeight > parent.clientHeight) && (style.overflowY === 'auto' || style.overflowY === 'scroll');
        if (isScrollableX || isScrollableY) {
          activeContainer = parent;
          break;
        }
        parent = parent.parentElement;
      }

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      if (activeContainer) {
        scrollLeft = activeContainer.scrollLeft;
        scrollTop = activeContainer.scrollTop;
      } else {
        scrollLeft = window.scrollX;
        scrollTop = window.scrollY;
      }

      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none'; // Avoid highlighting text during viewport grab drag
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (activeContainer) {
        activeContainer.scrollLeft = scrollLeft - dx;
        activeContainer.scrollTop = scrollTop - dy;
      } else {
        window.scrollTo(scrollLeft - dx, scrollTop - dy);
      }
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.cursor = 'grab';
      document.body.style.userSelect = '';
      activeContainer = null;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          {/* Main Browsing Catalog Route */}
          <Route path="/" element={<Home />} />
          
          {/* Customer login/register */}
          <Route path="/login" element={<Auth isAdmin={false} />} />
          <Route path="/signup" element={<Auth isAdmin={false} />} />
          
          {/* Admin dedicated login */}
          <Route path="/admin/login" element={<Auth isAdmin={true} />} />
          
          {/* Service Booking Flow */}
          <Route path="/book/:serviceId" element={<BookingFlow />} />
          
          {/* Customer Workspace Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Admin Dispatcher Panel - checks if admin inside page */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Fallback routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
      <ToastNotifier />
    </AppProvider>
  );
}

