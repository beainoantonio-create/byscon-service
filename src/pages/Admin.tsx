import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import db, { MockUserRecord, SEED_SERVICES, supabase, isSupabaseConfigured } from '../lib/db';
import { Booking, UserProfile, Service, CostItem, Receipt, UserRole } from '../types';
import { ServiceIcon } from '../components/ServiceIcon';
import { 
  BarChart3, 
  Users, 
  Settings2, 
  SlidersHorizontal, 
  Search, 
  Briefcase,
  Layers, 
  Eye, 
  Plus, 
  Trash2, 
  FileText, 
  Percent, 
  Edit, 
  ShieldAlert, 
  Printer, 
  Check, 
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  ChevronDown,
  RefreshCw,
  X
} from 'lucide-react';

export const Admin: React.FC = () => {
  const { user, profile, changePassword } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  // Redirect customers away instantly
  useEffect(() => {
    if (profile && profile.role === 'customer') {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const isAdmin = profile?.role === 'admin';

  // Navigation management
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'users' | 'services' | 'settings'>('overview');

  // Core registries
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [usersList, setUsersList] = useState<MockUserRecord[]>([]);
  const [servicesRegistry, setServicesRegistry] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalMsg, setGlobalMsg] = useState('');
  const [globalErr, setGlobalErr] = useState('');

  // Filtering systems for bookings
  const [filterService, setFilterService] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterUrgency, setFilterUrgency] = useState('All');
  const [filterDate, setFilterDate] = useState('');

  // Selected Booking overlays
  const [targetBooking, setTargetBooking] = useState<Booking | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setShowCancelConfirm(false);
    setShowDeleteConfirm(false);
  }, [targetBooking?.id]);

  // New cost line item state
  const [itemDesc, setItemDesc] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);

  // Branded printable receipt overlay states
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);
  const [receiptLang, setReceiptLang] = useState<'en' | 'ar'>('en');

  // Service fee state adjustments
  const [editingServiceFeeId, setEditingServiceFeeId] = useState<string | null>(null);
  const [newFeeValue, setNewFeeValue] = useState<number>(0);

  // Settings forms
  const [newAdminPassword, setNewAdminPassword] = useState('');

  // Sync core lists
  const syncRegistryData = async () => {
    try {
      setLoading(true);
      setGlobalErr('');
      
      const role = profile?.role || 'staff';
      const bks = await db.getBookings(role, user?.id || '');
      setBookings(bks);

      if (isAdmin) {
        const usr = await db.getUsersList();
        setUsersList(usr);
      }

      const srvs = await db.getServices();
      setServicesRegistry(srvs);

    } catch (err: any) {
      setGlobalErr(err?.message || 'Failure loading management catalogs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && (profile.role === 'admin' || profile.role === 'staff')) {
      syncRegistryData();
    }
  }, [profile, activeTab]);

  // DERIVE STATISTICS (Overview dashboard)
  const totalBookingsCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const inProgressCount = bookings.filter(b => b.status === 'In Progress').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'Cancelled').length;

  // Revenue calculation: Sum of booking fee + cost items totals for COMPLETED actions
  const totalRevenue = bookings
    .filter(b => b.status === 'Completed')
    .reduce((sum, b) => {
      const bFee = Number(b.booking_fee) || 0;
      const linesSum = b.cost_items?.reduce((ls, item) => ls + (Number(item.total) || 0), 0) || 0;
      return sum + bFee + linesSum;
    }, 0);

  // Status updates
  const handleUpdateStatus = async (bookingId: string, value: Booking['status']) => {
    if (!isAdmin) return; // Only Admin can change statuses
    try {
      setGlobalErr('');
      await db.updateBookingStatus(bookingId, value);
      // Update local state arrays seamlessly
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: value } : b));
      if (targetBooking && targetBooking.id === bookingId) {
        setTargetBooking(prev => prev ? { ...prev, status: value } : null);
      }
      setGlobalMsg('Booking status updated successfully.');
      setTimeout(() => setGlobalMsg(''), 3000);
    } catch (err: any) {
      setGlobalErr(err?.message || 'Status modification error.');
    }
  };

  const handleCancelBooking = async () => {
    if (!isAdmin || !targetBooking) return;
    const bookingId = targetBooking.id;
    try {
      setGlobalErr('');
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'Cancelled' })
          .eq('id', bookingId);
        if (error) {
          throw new Error(error.message || 'Direct Supabase update error');
        }
      } else {
        // Fallback for mocked storage
        const bookings = JSON.parse(localStorage.getItem('shed_bookings') || '[]');
        const updated = bookings.map((b: any) => b.id === bookingId ? { ...b, status: 'Cancelled' } : b);
        localStorage.setItem('shed_bookings', JSON.stringify(updated));
      }

      // Re-fetch bookings list from Supabase/DB so the UI reflects the live status instantly
      const role = profile?.role || 'staff';
      const bks = await db.getBookings(role, user?.id || '');
      setBookings(bks);

      // Instantly update the parent overview/selected booking view state with fresh live DB data
      const updatedBk = bks.find(b => b.id === bookingId);
      if (updatedBk) {
        setTargetBooking(updatedBk);
      } else {
        setTargetBooking(prev => prev ? { ...prev, status: 'Cancelled' } : null);
      }

      setGlobalMsg(language === 'ar' ? 'تم إلغاء الحجز بنجاح.' : 'Booking cancelled successfully.');
      setTimeout(() => setGlobalMsg(''), 4000);
      setShowCancelConfirm(false);
    } catch (err: any) {
      setGlobalErr(err?.message || 'Error occurred while cancelling the booking.');
    }
  };

  const handleDeleteBooking = async () => {
    if (!isAdmin || !targetBooking) return;
    const bookingId = targetBooking.id;
    try {
      setGlobalErr('');
      if (isSupabaseConfigured && supabase) {
        console.log('[Delete Process] Initiating Supabase delete request for bookingId:', bookingId);
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', bookingId);
        console.log('[Delete Process] Supabase returned error state:', error);
        
        if (error) {
          console.error('Delete error:', error);
          setGlobalErr('Failed to delete booking');
          setTimeout(() => setGlobalErr(''), 4000);
          return;
        }
      } else {
        console.log('[Delete Process] Supabase not active. Deleting from local fallback storage. BookingID:', bookingId);
        const bookingsData = JSON.parse(localStorage.getItem('shed_bookings') || '[]');
        const filtered = bookingsData.filter((b: any) => b.id !== bookingId);
        localStorage.setItem('shed_bookings', JSON.stringify(filtered));
      }

      setBookings(prev => prev.filter(b => b.id !== bookingId));
      setTargetBooking(null);
      setShowDeleteConfirm(false);
      setGlobalMsg('Booking deleted successfully');
      setTimeout(() => setGlobalMsg(''), 4000);
    } catch (error: any) {
      console.error('Unexpected error in handleDeleteBooking:', error);
      setGlobalErr('Failed to delete booking');
      setTimeout(() => setGlobalErr(''), 4000);
    }
  };

  // Add line item cost entry
  const handleAddCostLineItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !targetBooking) return;

    if (!itemDesc || itemQty <= 0 || itemPrice < 0) {
      setGlobalErr('Invalid line item parameters.');
      return;
    }

    try {
      const newItem: CostItem = {
        id: 'LI-' + Math.floor(100000 + Math.random() * 900000),
        description: itemDesc,
        quantity: itemQty,
        unit_price: itemPrice,
        total: Number((itemQty * itemPrice).toFixed(2))
      };

      const updatedLines = [...(targetBooking.cost_items || []), newItem];
      
      await db.updateBookingCosts(targetBooking.id, updatedLines, targetBooking.internal_notes || '');
      
      // Update local states
      const updatedBooking = { ...targetBooking, cost_items: updatedLines };
      setTargetBooking(updatedBooking);
      setBookings(prev => prev.map(b => b.id === targetBooking.id ? updatedBooking : b));

      // Clear input form fields
      setItemDesc('');
      setItemQty(1);
      setItemPrice(0);
      setGlobalMsg('Line cost item logged successfully.');
      setTimeout(() => setGlobalMsg(''), 3000);

    } catch (err: any) {
      setGlobalErr(err?.message || 'Failed to append cost line.');
    }
  };

  // Delete line item cost entry
  const handleDeleteCostLineItem = async (itemId: string) => {
    if (!isAdmin || !targetBooking) return;

    try {
      const updatedLines = targetBooking.cost_items.filter(it => it.id !== itemId);
      await db.updateBookingCosts(targetBooking.id, updatedLines, targetBooking.internal_notes || '');
      
      const updatedBooking = { ...targetBooking, cost_items: updatedLines };
      setTargetBooking(updatedBooking);
      setBookings(prev => prev.map(b => b.id === targetBooking.id ? updatedBooking : b));

      setGlobalMsg('Line cost item deleted.');
      setTimeout(() => setGlobalMsg(''), 3000);
    } catch (err: any) {
      setGlobalErr(err?.message || 'Failed to delete line.');
    }
  };

  // Update internal admin notes
  const handleUpdateInternalNotes = async (text: string) => {
    if (!isAdmin || !targetBooking) return;

    try {
      await db.updateBookingCosts(targetBooking.id, targetBooking.cost_items, text);
      const updatedBooking = { ...targetBooking, internal_notes: text };
      setTargetBooking(updatedBooking);
      setBookings(prev => prev.map(b => b.id === targetBooking.id ? updatedBooking : b));
    } catch (err: any) {
      setGlobalErr(err?.message || 'Failed to persist notes.');
    }
  };

  // Assign user roles
  const handleRoleChange = async (targetUserId: string, inputRole: UserRole) => {
    if (!isAdmin) return;
    try {
      setGlobalErr('');
      await db.updateUserRole(targetUserId, inputRole);
      setUsersList(prev => prev.map(u => u.id === targetUserId ? { ...u, role: inputRole } : u));
      
      setGlobalMsg('User role upgraded successfully.');
      setTimeout(() => setGlobalMsg(''), 3000);
    } catch (err: any) {
      setGlobalErr(err?.message || 'Cannot alter system roles registry.');
    }
  };

  // Modify standard service booking fee
  const handleSaveServiceFee = async (srvId: string) => {
    if (!isAdmin) return;
    try {
      await db.updateServiceFee(srvId, newFeeValue);
      setServicesRegistry(prev => prev.map(s => s.id === srvId ? { ...s, booking_fee: newFeeValue } : s));
      setEditingServiceFeeId(null);
      setGlobalMsg('Filing rate updated.');
      setTimeout(() => setGlobalMsg(''), 3000);
    } catch (err: any) {
      setGlobalErr('Fee filing error.');
    }
  };

  // Toggle active/inactive services
  const handleToggleServiceActive = async (srvId: string, active: boolean) => {
    if (!isAdmin) return;
    try {
      await db.toggleServiceActive(srvId, active);
      setServicesRegistry(prev => prev.map(s => s.id === srvId ? { ...s, active } : s));
      setGlobalMsg('Service toggle complete.');
      setTimeout(() => setGlobalMsg(''), 3000);
    } catch (err: any) {
      setGlobalErr('Service toggle error.');
    }
  };

  // Update password settings form triggering
  const handleAdminPasswordUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!newAdminPassword || newAdminPassword.length < 5) {
      setGlobalErr('Password must be at least 5 characters.');
      return;
    }

    try {
      setGlobalErr('');
      await changePassword(newAdminPassword);
      setNewAdminPassword('');
      setGlobalMsg('Admin security key refreshed successfully.');
      setTimeout(() => setGlobalMsg(''), 4000);
    } catch (err: any) {
      setGlobalErr(err?.message || 'Security upgrade failed.');
    }
  };

  // Filter calculations
  const filteredBookings = bookings.filter(b => {
    const matchService = filterService === 'All' || b.service_id === filterService;
    const matchStatus = filterStatus === 'All' || b.status === filterStatus;
    const matchUrgency = filterUrgency === 'All' || b.urgency === filterUrgency;
    const matchDate = !filterDate || b.date === filterDate;
    return matchService && matchStatus && matchUrgency && matchDate;
  });

  // Layout calculations
  const subtotalSum = targetBooking?.cost_items?.reduce((tot, item) => tot + item.total, 0) || 0;
  const targetBookingFee = targetBooking?.booking_fee || 0;
  const grandTotalSum = subtotalSum + Number(targetBookingFee);

  return (
    <div id="admin-dashboard-container" className="bg-black text-white min-h-[calc(100vh-4.5rem)] pb-18">
      
      {/* 1. Header Navigation Bar */}
      <section className="bg-zinc-950 border-b border-gray-900 py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="font-mono text-[9px] text-lime-primary bg-zinc-900 border border-zinc-900 px-2 py-0.5 uppercase tracking-wider block w-max">
                {profile?.role === 'admin' ? 'SHED UNIFIED COMMAND CONSOLE' : 'STAFF DATA TERMINAL'}
              </span>
              <h1 className="font-sans text-3xl font-black text-white mt-1 uppercase">
                {language === 'ar' ? 'المنظومة الإدارية الداخلية لشيد' : 'Operations Dashboard'}
              </h1>
            </div>

            <div className="flex gap-2">
              <button
                onClick={syncRegistryData}
                className="p-2 border border-blue-900/0 text-[10px] bg-zinc-900 hover:bg-lime-primary hover:text-black border-gray-850 hover:border-lime-primary text-gray-400 font-mono flex items-center gap-1 cursor-pointer"
                title="Refresh Cache"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تحديث' : 'SYNC'}</span>
              </button>
            </div>
          </div>

          {/* Tab selectors */}
          <div className="flex flex-wrap gap-1.5 mt-8 border-b border-gray-900 pb-0.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all rounded-none ${
                activeTab === 'overview'
                  ? 'bg-lime-primary text-black'
                  : 'text-gray-400 hover:text-white bg-zinc-950/40'
              }`}
            >
              {language === 'ar' ? 'نظرة عامة' : 'OVERVIEW'}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all rounded-none ${
                activeTab === 'bookings'
                  ? 'bg-lime-primary text-black'
                  : 'text-gray-400 hover:text-white bg-zinc-950/40'
              }`}
            >
              {language === 'ar' ? 'الحجوزات والتشغيل' : 'BOOKINGS'}
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all rounded-none ${
                    activeTab === 'users'
                      ? 'bg-lime-primary text-black'
                      : 'text-gray-400 hover:text-white bg-zinc-950/40'
                  }`}
                >
                  {t('usersRoles')}
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all rounded-none ${
                    activeTab === 'services'
                      ? 'bg-lime-primary text-black'
                      : 'text-gray-400 hover:text-white bg-zinc-950/40'
                  }`}
                >
                  {t('serviceFees')}
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all rounded-none ${
                    activeTab === 'settings'
                      ? 'bg-lime-primary text-black'
                      : 'text-gray-400 hover:text-white bg-zinc-950/40'
                  }`}
                >
                  {language === 'ar' ? 'أمان المنظومة' : 'SECURITY'}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Global Alerts inside workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 no-print">
        {globalErr && (
          <div className="p-4 bg-black border border-red-500 rounded-none flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="font-mono text-xs text-white">{globalErr}</p>
          </div>
        )}
        {globalMsg && (
          <div className="p-4 bg-black border border-lime-primary rounded-none flex items-start gap-2.5">
            <Check className="w-5 h-5 text-lime-primary shrink-0 mt-0.5" />
            <p className="font-mono text-xs text-white">{globalMsg}</p>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* ==========================================
            TAB 1: OVERVIEW METRIC SUMMARY & STREAM
           ========================================== */}
        {activeTab === 'overview' && (
          <div id="admin-tab-overview" className="space-y-10 no-print">
            
            {/* 4 Stats Panel Bento Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Bookings */}
              <div className="bg-black border border-gray-900 p-6 flex flex-col justify-between">
                <div>
                  <BarChart3 className="w-5 h-5 text-lime-primary mb-3" />
                  <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider block">
                    {t('totalBookings')}
                  </span>
                </div>
                <span className="font-mono text-4xl font-extrabold text-white mt-4">
                  {totalBookingsCount}
                </span>
              </div>

              {/* Pending jobs */}
              <div className="bg-black border border-gray-900 p-6 flex flex-col justify-between">
                <div>
                  <span className="w-2.5 h-2.5 bg-gray-700 inline-block mr-1.5"></span>
                  <span className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">
                    {t('pending')}
                  </span>
                </div>
                <span className="font-mono text-4xl font-extrabold text-white mt-4">
                  {pendingCount}
                </span>
              </div>

              {/* In Progress */}
              <div className="bg-black border border-gray-900 p-6 flex flex-col justify-between">
                <div>
                  <span className="w-2.5 h-2.5 bg-lime-primary inline-block mr-1.5"></span>
                  <span className="font-mono text-[9px] text-lime-primary uppercase tracking-wider">
                    {t('inProgress')}
                  </span>
                </div>
                <span className="font-mono text-4xl font-extrabold text-[#CCFF00] mt-4">
                  {inProgressCount}
                </span>
              </div>

              {/* Completed */}
              <div className="bg-black border border-gray-900 p-6 flex flex-col justify-between">
                <div>
                  <span className="w-2.5 h-2.5 bg-white inline-block mr-1.5"></span>
                  <span className="font-mono text-[9px] text-white uppercase tracking-wider">
                    {t('completed')}
                  </span>
                </div>
                <span className="font-mono text-4xl font-extrabold text-white mt-4">
                  {completedCount}
                </span>
              </div>

              {/* Derived Revenue stream (ONLY visible for Admin according to roles description) */}
              <div className="col-span-2 lg:col-span-1 bg-black border border-lime-primary p-6 flex flex-col justify-between">
                <div>
                  <Percent className="w-5 h-5 text-lime-primary mb-3" />
                  <span className="font-mono text-[9px] text-lime-primary uppercase tracking-wider block">
                    {t('totalRevenue')}
                  </span>
                </div>
                <span className="font-mono text-2xl sm:text-3xl font-black text-lime-primary mt-4 uppercase">
                  {isAdmin ? `$${totalRevenue}` : `N/A`}
                </span>
              </div>
            </div>

            {/* Quick Audit Stream Container */}
            <div className="bg-black border border-gray-900 p-6">
              <div className="border-b border-gray-900 pb-3 mb-6 flex justify-between items-center text-xs font-mono">
                <span className="font-sans text-sm font-extrabold uppercase text-white">
                  {language === 'ar' ? 'أحدث الإشارات الواردة للتحكم' : 'REAL-TIME DISPATCH QUEUE'}
                </span>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-[10px] text-lime-primary uppercase hover:underline"
                >
                  {language === 'ar' ? 'عرض السجل الكامل' : 'VIEW DETAILED LOGS'} →
                </button>
              </div>

              {bookings.length === 0 ? (
                <p className="text-gray-500 font-mono text-xs py-8 uppercase text-center">
                  NO ACTIVE DISPATCH SIGNALS DETECTED.
                </p>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map(bk => (
                    <div
                      key={bk.id}
                      onClick={() => {
                        setTargetBooking(bk);
                        setActiveTab('bookings'); // Go straight to booking workspace
                      }}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-zinc-950 border border-zinc-900 hover:border-lime-primary cursor-pointer transition-colors text-xs font-mono gap-4"
                    >
                      <div className="flex gap-3 items-center">
                        <span className="p-2 bg-black border border-gray-800 text-lime-primary">
                          <ServiceIcon id={bk.service_id} className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <p className="text-[10px] text-gray-500">{bk.id} • {bk.user_name}</p>
                          <h6 className="font-sans font-extrabold text-white text-sm uppercase mt-0.5">
                            {language === 'ar' ? bk.service_name_ar : bk.service_name_en}
                          </h6>
                        </div>
                      </div>

                      <div className="flex gap-4 items-center">
                        <span className="text-[10px] text-gray-400 font-bold bg-black px-2 py-0.5 border border-gray-900 uppercase">
                          {bk.date}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider border ${
                          bk.status === 'Pending' ? 'border-gray-700 text-gray-400 bg-black' :
                          bk.status === 'Confirmed' ? 'border-lime-primary text-lime-primary bg-black' :
                          bk.status === 'In Progress' ? 'bg-lime-primary text-black' : 'border-white text-white'
                        }`}>
                          {bk.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: COMPREHENSIVE BOOKINGS DIRECTORY
           ========================================== */}
        {activeTab === 'bookings' && (
          <div id="admin-tab-bookings" className="space-y-8 no-print">
            
            {/* Sliders / Category Filters */}
            <div className="p-5 bg-zinc-950 border border-gray-900 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              {/* Service Type Filter */}
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">
                  Filter Service
                </label>
                <select
                  value={filterService}
                  onChange={e => setFilterService(e.target.value)}
                  className="w-full p-2 bg-black border border-gray-850 text-white rounded-none uppercase font-mono text-[11px]"
                >
                  <option value="All">All Services</option>
                  {servicesRegistry.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name_en.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">
                  Filter Status
                </label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full p-2 bg-black border border-gray-850 text-white rounded-none uppercase font-mono text-[11px]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Urgency Filter */}
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">
                  Urgency Level
                </label>
                <select
                  value={filterUrgency}
                  onChange={e => setFilterUrgency(e.target.value)}
                  className="w-full p-2 bg-black border border-gray-850 text-white rounded-none uppercase font-mono text-[11px]"
                >
                  <option value="All">All urgency</option>
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              {/* Specific Date Filter */}
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">
                  Specific Date
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  className="w-full p-2 bg-black border border-gray-850 text-white rounded-none font-mono text-[11px]"
                />
              </div>
            </div>

            {/* List and Detail workspace splits */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: List bookings */}
              <div className="lg:col-span-5 space-y-4">
                <div className="border-b border-gray-900 pb-2 flex justify-between items-center text-xs font-mono">
                  <span className="uppercase text-gray-400 font-bold">DISPATCH QUEUE LISTING</span>
                  <span className="text-lime-primary font-bold">{filteredBookings.length} FOUND</span>
                </div>

                {filteredBookings.length === 0 ? (
                  <p className="py-12 text-center text-gray-600 font-mono text-xs uppercase border border-gray-950">
                    NO COMPLIANT INBOUND THREADS DISCOVERED.
                  </p>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2">
                    {filteredBookings.map(bk => (
                      <div
                        key={bk.id}
                        onClick={() => {
                          setTargetBooking(bk);
                        }}
                        className={`p-4 border text-xs font-mono cursor-pointer transition-all ${
                          targetBooking?.id === bk.id
                            ? 'bg-zinc-950 border-lime-primary'
                            : 'bg-black border-gray-900 hover:border-gray-800 hover:bg-zinc-950/40'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] text-gray-500 font-bold">{bk.id}</span>
                          <span className={`px-1.5 py-0.5 text-[8px] uppercase tracking-wider border ${
                            bk.status === 'Pending' ? 'border-gray-800 text-gray-400 bg-black' :
                            bk.status === 'Confirmed' ? 'border-lime-primary text-lime-primary bg-black' :
                            bk.status === 'In Progress' ? 'bg-lime-primary text-black' : 'border-white text-white'
                          }`}>
                            {bk.status}
                          </span>
                        </div>

                        <h5 className="font-sans font-black text-white text-sm uppercase">
                          {language === 'ar' ? bk.service_name_ar : bk.service_name_en}
                        </h5>
                        
                        <p className="text-[10px] text-gray-400 mt-1 uppercase">
                          {bk.user_name} ({bk.user_phone})
                        </p>

                        <div className="mt-3 pt-3 border-t border-gray-950 flex justify-between text-[10px] text-gray-500">
                          <span>📅 {bk.date}</span>
                          <span className="text-lime-primary uppercase font-bold">{bk.urgency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: In-depth Detail interactive workspace split */}
              <div id="booking-admin-detailed-area" className="lg:col-span-7">
                {targetBooking ? (
                  <div className="bg-zinc-950/40 border border-gray-900 p-6 relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-lime-primary"></div>

                    <div className="flex justify-between items-start border-b border-gray-900 pb-4 mb-6">
                      <div>
                        <span className="font-mono text-[9px] text-lime-primary px-1.5 py-0.2 bg-zinc-950 border border-zinc-900 select-all font-bold">
                          {targetBooking.id}
                        </span>
                        <h3 className="font-sans text-xl font-black text-white uppercase mt-2">
                          {language === 'ar' ? targetBooking.service_name_ar : targetBooking.service_name_en}
                        </h3>
                        <p className="font-mono text-[9px] text-zinc-500 uppercase leading-none mt-1">
                          {targetBooking.category_id === 'home_maintenance' ? t('homeMaintenance') : t('profConsultations')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[9px] text-gray-550 uppercase mr-1">Status:</span>
                        {/* UPDATE STATUS Dropdown (Admin ONLY according to rules) */}
                        {isAdmin ? (
                          <div className="relative">
                            <select
                              value={targetBooking.status}
                              onChange={e => handleUpdateStatus(targetBooking.id, e.target.value as any)}
                              className="bg-black text-white border border-lime-primary px-2 py-1 font-mono text-[10px] uppercase font-bold focus:outline-none"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        ) : (
                          <span className="px-2 py-1 bg-black text-gray-400 border border-gray-800 text-[10px] uppercase font-bold">
                            {targetBooking.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Admin Cancellation Override Button */}
                    {isAdmin && targetBooking.status !== 'Cancelled' && (
                      <div className="mb-6 p-4 bg-black border border-red-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-red-500 uppercase block font-bold tracking-wider">
                            {language === 'ar' ? 'تجاوز النظام الإداري' : 'System Override Alert'}
                          </span>
                          <span className="text-[9px] text-gray-400 block leading-normal mt-0.5">
                            {language === 'ar' ? 'إجراءات إنهاء وإلغاء حجز الخدمة النشط' : 'Terminate execution of this active dispatch thread'}
                          </span>
                        </div>
                        
                        {!showCancelConfirm ? (
                          <button
                            type="button"
                            onClick={() => setShowCancelConfirm(true)}
                            className="bg-black text-red-500 hover:text-white uppercase font-bold text-[10px] font-mono border border-red-500 hover:bg-neutral-900 px-3 py-1.5 transition-colors cursor-pointer"
                          >
                            {language === 'ar' ? 'إلغاء الحجز' : 'Cancel Booking'}
                          </button>
                        ) : (
                          <div className="flex flex-col gap-2 w-full sm:w-auto">
                            <span className="text-red-500 text-[10px] uppercase font-bold text-left block">
                              {language === 'ar' ? 'هل أنت متأكد من إلغاء هذا الحجز؟' : 'Are you sure you want to cancel this booking?'}
                            </span>
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={handleCancelBooking}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-mono font-bold uppercase text-[9px] cursor-pointer"
                              >
                                {language === 'ar' ? 'تأكيد' : 'Confirm'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowCancelConfirm(false)}
                                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white font-mono font-bold uppercase text-[9px] cursor-pointer"
                              >
                                {language === 'ar' ? 'تراجع' : 'Cancel'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Delete Booking Override Button */}
                    {isAdmin && (
                      <div className="mb-6 p-4 bg-black border border-red-650 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-red-600 uppercase block font-bold tracking-wider">
                            {language === 'ar' ? 'منطقة الخطر' : 'Danger Zone / System Purge'}
                          </span>
                          <span className="text-[9px] text-gray-400 block leading-normal mt-0.5">
                            {language === 'ar' ? 'حذف هذا الحجز نهائيًا من قاعدة البيانات' : 'Permanently delete this booking record from database records'}
                          </span>
                        </div>
                        
                        {!showDeleteConfirm ? (
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="bg-red-950/20 text-red-500 hover:text-white uppercase font-bold text-[10px] font-mono border border-red-600 hover:bg-red-900 px-3 py-1.5 transition-colors cursor-pointer"
                          >
                            {language === 'ar' ? 'حذف الحجز' : 'Delete Booking'}
                          </button>
                        ) : (
                          <div className="flex flex-col gap-2 w-full sm:w-auto">
                            <span className="text-red-500 text-[10px] uppercase font-bold text-left block">
                              {language === 'ar' ? 'هل أنت متأكد من الحذف النهائي؟ لا يمكن التراجع.' : 'Permanently delete booking? This action is irreversible.'}
                            </span>
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={handleDeleteBooking}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-mono font-bold uppercase text-[9px] cursor-pointer"
                              >
                                {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white font-mono font-bold uppercase text-[9px] cursor-pointer"
                              >
                                {language === 'ar' ? 'تراجع' : 'Cancel'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Customer Info Box */}
                    <div className="p-3 bg-black border border-gray-900 mb-6 font-mono text-xs">
                      <span className="text-[10px] text-gray-500 uppercase block mb-2 font-bold tracking-wider">Customer Profile Details</span>
                      <div className="grid grid-cols-2 gap-y-1 text-gray-300">
                        <div>Name: <span className="text-white font-bold">{targetBooking.user_name}</span></div>
                        <div>Phone: <span className="text-white font-bold">{targetBooking.user_phone}</span></div>
                        <div className="col-span-2 mt-1">Email: <span className="text-white font-bold">{targetBooking.user_email}</span></div>
                        <div className="col-span-2 mt-1">Address: <span className="text-white block bg-neutral-950 p-2 border border-zinc-900 mt-1 font-sans">{targetBooking.address}</span></div>
                      </div>
                    </div>

                    <div className="mb-6 bg-black p-4 border border-gray-905">
                      <span className="text-[10px] text-gray-500 font-mono uppercase block mb-1 font-bold">Issue / Consultation scope</span>
                      <p className="font-mono text-xs leading-normal text-white break-words select-text">
                        {targetBooking.description}
                      </p>
                    </div>

                    {/* Photos Preview in Admin Workspace */}
                    {targetBooking.photos && targetBooking.photos.length > 0 && (
                      <div className="mb-8">
                        <span className="text-[10px] text-gray-500 font-mono uppercase block mb-2 font-bold select-none">Client Attached Photos ({targetBooking.photos.length})</span>
                        <div className="flex gap-2">
                          {targetBooking.photos.map((ph, idx) => (
                            <div key={idx} className="w-18 h-18 border border-gray-850 bg-black">
                              <img
                                src={ph}
                                onClick={() => window.open(ph)}
                                alt="inspect file"
                                className="w-full h-full object-cover cursor-pointer"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* COSTS & RECEIPTS TAB INTERACTIVE AREA */}
                    <div className="border-t border-gray-900 pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-mono text-[11px] text-lime-primary font-black uppercase tracking-wider">
                          🛠️ {t('costsReceipt')} Workspace
                        </span>
                      </div>

                      {/* Display Cost Lines Table */}
                      <div className="bg-black border border-gray-900 p-4 mb-5">
                        <table className="w-full text-left text-xs font-mono border-collapse">
                          <thead>
                            <tr className="border-b border-gray-850 text-gray-500 uppercase">
                              <th className="py-2">{t('itemName')}</th>
                              <th className="py-2 text-center">{t('quantity')}</th>
                              <th className="py-2 text-right">{t('unitPrice')}</th>
                              <th className="py-2 text-right">{t('lineTotal')}</th>
                              {isAdmin && <th className="py-2 text-center"></th>}
                            </tr>
                          </thead>
                          <tbody>
                            {/* Standard booking fee listed first */}
                            <tr className="border-b border-gray-950 text-gray-400">
                              <td className="py-2 font-bold uppercase">{t('flatBookingFee')}</td>
                              <td className="py-2 text-center">1</td>
                              <td className="py-2 text-right">${targetBookingFee}</td>
                              <td className="py-2 text-right font-bold text-lime-primary">${targetBookingFee}</td>
                              {isAdmin && <td className="py-2 text-center"></td>}
                            </tr>

                            {/* Additional Cost lines */}
                            {targetBooking.cost_items && targetBooking.cost_items.length > 0 ? (
                              targetBooking.cost_items.map(it => (
                                <tr key={it.id} className="border-b border-gray-950 text-white">
                                  <td className="py-2 max-w-[150px] truncate">{it.description}</td>
                                  <td className="py-2 text-center">{it.quantity}</td>
                                  <td className="py-2 text-right">${it.unit_price}</td>
                                  <td className="py-2 text-right font-bold text-lime-primary">${it.total}</td>
                                  {isAdmin && (
                                    <td className="py-2 text-center text-red-500">
                                      <button
                                        onClick={() => handleDeleteCostLineItem(it.id)}
                                        className="p-1 text-red-400 hover:text-red-500 text-xs text-center cursor-pointer font-mono"
                                        title="Delete fee"
                                      >
                                        [DEL]
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))
                            ) : null}
                          </tbody>
                        </table>

                        {/* Totals Summary */}
                        <div className="mt-4 pt-4 border-t border-gray-900 flex justify-between items-center text-xs font-mono">
                          <span className="text-gray-400 uppercase">SUMMARY TOTAL:</span>
                          <span className="bg-lime-primary text-black font-extrabold px-3 py-1 text-sm">
                            ${grandTotalSum}
                          </span>
                        </div>
                      </div>

                      {/* ADD COST LINE ITEM PANEL (Admin ONLY according to rules) */}
                      {isAdmin ? (
                        <form onSubmit={handleAddCostLineItem} className="p-4 bg-zinc-950/80 border border-gray-900 space-y-3 mb-6">
                          <span className="text-[10px] text-gray-400 font-mono uppercase block font-bold">Log New Work Billing Item</span>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <input
                              type="text"
                              placeholder="Fittings, Steel bracket etc."
                              value={itemDesc}
                              onChange={e => setItemDesc(e.target.value)}
                              className="col-span-2 p-2 bg-black border border-gray-850 text-white text-xs font-mono"
                              required
                            />
                            <input
                              type="number"
                              min={1}
                              placeholder="Qty"
                              value={itemQty}
                              onChange={e => setItemQty(Number(e.target.value))}
                              className="p-2 bg-black border border-gray-850 text-white text-xs font-mono"
                              required
                            />
                            <input
                              type="number"
                              min={0}
                              placeholder="Price"
                              value={itemPrice}
                              onChange={e => setItemPrice(Number(e.target.value))}
                              className="p-2 bg-black border border-gray-850 text-white text-xs font-mono"
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2.5 bg-lime-primary text-black hover:bg-white text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer"
                          >
                            ➕ APPEND LINE BILLING
                          </button>
                        </form>
                      ) : (
                        <div className="p-3.5 bg-zinc-950 border border-zinc-900 text-gray-500 text-[10px] font-mono uppercase mb-6 flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-lime-primary" />
                          <span>Staff terminal limited view. Cost adjustments locked.</span>
                        </div>
                      )}

                      {/* Internal notes input field (Admin only, shown separately on backend) */}
                      {isAdmin && (
                        <div className="mb-6">
                          <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2 font-mono">
                            {t('internalNotes')}
                          </label>
                          <textarea
                            value={targetBooking.internal_notes || ''}
                            onChange={e => handleUpdateInternalNotes(e.target.value)}
                            placeholder="Add internal observations or technician dispatch names..."
                            rows={2}
                            className="w-full p-2.5 bg-black border border-gray-800 text-white font-mono text-xs leading-relaxed"
                          ></textarea>
                        </div>
                      )}

                      {/* RECEIPT GENERATION TRIGGER PANEL */}
                      <div className="p-4 bg-black border border-lime-primary/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-lime-primary uppercase block font-bold">{t('invoiceLanguage')}</span>
                          <div className="flex gap-1.5 mt-1">
                            <button
                              type="button"
                              onClick={() => setReceiptLang('en')}
                              className={`px-2 py-0.5 text-[9px] font-bold uppercase transition-all ${receiptLang === 'en' ? 'bg-lime-primary text-black' : 'border border-gray-800 text-gray-500'}`}
                            >
                              English
                            </button>
                            <button
                              type="button"
                              onClick={() => setReceiptLang('ar')}
                              className={`px-2 py-0.5 text-[9px] font-bold uppercase transition-all ${receiptLang === 'ar' ? 'bg-lime-primary text-black' : 'border border-gray-800 text-gray-500'}`}
                            >
                              العربية
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setReceiptBooking(targetBooking)}
                          className="px-4 py-2.5 bg-lime-primary text-black hover:bg-white font-mono font-bold uppercase text-[10px] tracking-wide flex items-center gap-1.5 cursor-pointer border border-lime-primary hover:border-white"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{t('generateReceipt')} ({receiptLang.toUpperCase()})</span>
                        </button>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center border border-dashed border-gray-900 text-gray-500 font-mono text-xs uppercase">
                    SELECT AN ACTIVE INBOUND BOOKING ACTION CARD ON THE LEFT TO INITIATE THE WORKSPACE
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: USERS & ROLE MANAGEMENT (Admin Only)
           ========================================== */}
        {activeTab === 'users' && isAdmin && (
          <div id="admin-tab-users" className="bg-black border border-gray-900 p-6 space-y-6 no-print">
            <div className="border-b border-gray-950 pb-2 flex justify-between items-center text-xs font-mono">
              <span className="uppercase text-gray-400 font-bold">GLOBAL USERS LISTING SECURITY CONTROL</span>
              <span className="text-lime-primary font-bold">{usersList.length} PROFILES LOADED</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase">
                    <th className="py-3 px-2">{t('fullName')}</th>
                    <th className="py-3 px-2">{t('email')}</th>
                    <th className="py-3 px-2">{t('phone')}</th>
                    <th className="py-3 px-2">{t('roleLabel')}</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => (
                    <tr key={u.id} className="border-b border-gray-900 text-white hover:bg-zinc-950/20">
                      <td className="py-3.5 px-2 font-bold font-sans">{u.full_name}</td>
                      <td className="py-3.5 px-2 text-gray-400">{u.email}</td>
                      <td className="py-3.5 px-2 text-gray-400">{u.phone || 'N/A'}</td>
                      <td className="py-3.5 px-2">
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="bg-black text-white border border-gray-800 hover:border-lime-primary px-20.5 py-1 font-mono text-[10px] uppercase font-bold text-center"
                        >
                          <option value="customer">CUSTOMER</option>
                          <option value="staff">STAFF</option>
                          <option value="admin">ADMIN</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-3 bg-zinc-950 border border-gray-900 text-[10px] text-gray-500 font-mono uppercase leading-normal flex items-start gap-1.5 mt-4">
              <Info className="w-4 h-4 text-lime-primary shrink-0" />
              <p>For operations security, there must always exist at least one Admin account on record. Dropping the role of the last administrator is strictly intercepted and blocked by standard system constraints.</p>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: SERVICE REGISTRY ACTIVE LISTING (Admin Only)
           ========================================== */}
        {activeTab === 'services' && isAdmin && (
          <div id="admin-tab-services" className="bg-black border border-gray-900 p-6 space-y-6 no-print">
            
            <div className="border-b border-gray-950 pb-2 flex justify-between items-center text-xs font-mono">
              <span className="uppercase text-gray-400 font-bold">OFFICIAL DISPATCH SERVICE FEES CATALOG</span>
              <span className="text-lime-primary font-bold">{servicesRegistry.length} ITEMS REGULATED</span>
            </div>

            <div className="space-y-4">
              {servicesRegistry.map(sv => (
                <div
                  key={sv.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-zinc-950 border border-zinc-900 gap-4 text-xs font-mono"
                >
                  <div className="flex gap-3 items-center">
                    <span className="p-2 bg-black border border-gray-800 text-lime-primary">
                      <ServiceIcon id={sv.id} className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[9px] text-gray-550 uppercase block select-all font-bold">
                        {sv.id}
                      </span>
                      <h5 className="font-sans text-sm font-black text-white uppercase mt-0.5">
                        {sv.name_en} / {sv.name_ar}
                      </h5>
                      <span className="text-[9px] text-gray-500 uppercase block mt-0.5">
                        {sv.category === 'home_maintenance' ? 'Home Maintenance' : 'Professional Consultation'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Active Inactive toggle button */}
                    <button
                      onClick={() => handleToggleServiceActive(sv.id, !sv.active)}
                      className={`px-2 py-1 text-[9px] font-mono font-bold uppercase transition-colors rounded-none ${
                        sv.active 
                          ? 'bg-lime-primary text-black border border-lime-primary' 
                          : 'bg-black text-gray-500 border border-gray-800 hover:text-white'
                      }`}
                    >
                      {sv.active ? 'Active' : 'Inactive'}
                    </button>

                    {/* Booking fee adjustment (Home maintenance ONLY as Consultations have null/0 booking fee) */}
                    {sv.category === 'home_maintenance' ? (
                      editingServiceFeeId === sv.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            value={newFeeValue}
                            onChange={e => setNewFeeValue(Number(e.target.value))}
                            className="w-18 p-1 bg-black border border-lime-primary text-white text-right"
                          />
                          <button
                            onClick={() => handleSaveServiceFee(sv.id)}
                            className="p-1 bg-lime-primary text-black uppercase text-[10px] font-bold"
                          >
                            [SAVE]
                          </button>
                          <button
                            onClick={() => setEditingServiceFeeId(null)}
                            className="p-1 text-gray-500 hover:text-white text-[10px]"
                          >
                            [ESC]
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-black p-1 border border-zinc-800">
                          <span className="text-gray-400 px-1 font-bold">${sv.booking_fee}</span>
                          <button
                            onClick={() => {
                              setEditingServiceFeeId(sv.id);
                              setNewFeeValue(sv.booking_fee || 0);
                            }}
                            className="text-[9px] text-lime-primary hover:text-white uppercase font-bold"
                            title="Edit Service Fee"
                          >
                            [EDIT]
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-[10px] text-gray-500 italic uppercase">
                        Consultation (NO FEE)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 5: ADMIN SEED SECURITY SETTINGS (Admin Only)
           ========================================== */}
        {activeTab === 'settings' && isAdmin && (
          <div id="admin-tab-settings" className="bg-black border border-gray-900 p-6 space-y-6 no-print">
            
            <div className="border-b border-gray-950 pb-2 text-xs font-mono">
              <span className="uppercase text-gray-400 font-bold">{t('changePasswordTitle')}</span>
            </div>

            <div className="max-w-md">
              <form onSubmit={handleAdminPasswordUpdateSubmit} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">
                    {t('newPassword')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-605">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={newAdminPassword}
                      onChange={e => setNewAdminPassword(e.target.value)}
                      placeholder="Enter new master key password"
                      className="w-full pl-10 pr-4 py-2.5 bg-black border border-gray-800 text-white rounded-none focus:outline-none focus:border-lime-primary"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-3 bg-lime-primary text-black hover:bg-white transition-all font-bold uppercase text-[10px] tracking-wide w-full"
                >
                  {t('updatePasswordBtn')}
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* ==========================================
          OVERLAY C: HIGH-CONTRAST BRANDED RECEIPT GENERATOR
         ========================================== */}
      {receiptBooking && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-start items-center p-4 sm:p-8 overflow-y-auto">
          {/* Header Controls (NOT PRINTED on paper/pdf outputs) */}
          <div className="w-full max-w-2xl bg-zinc-950 border border-gray-900 p-4 mb-6 flex justify-between items-center text-xs font-mono no-print">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 capitalize">{t('invoiceLanguage')}:</span>
              <button
                onClick={() => setReceiptLang(receiptLang === 'en' ? 'ar' : 'en')}
                className="px-2 py-0.5 bg-lime-primary text-black font-extrabold uppercase"
              >
                {receiptLang.toUpperCase()}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-white text-black hover:bg-lime-primary transition-colors font-bold uppercase flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('printExport')}</span>
              </button>
              <button
                onClick={() => setReceiptBooking(null)}
                className="p-1 px-2 border border-gray-800 text-gray-400 hover:text-white"
              >
                {t('closeBtn').toUpperCase()}
              </button>
            </div>
          </div>

          {/* PRINTABLE RECEIPT FRAME Layout */}
          <div 
            id="shed-printable-invoice" 
            className="w-full max-w-2xl bg-white text-black p-8 sm:p-12 border border-zinc-150 relative"
            dir={receiptLang === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Top high-contrast highlight decorative ribbon */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#CCFF00]"></div>

            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-black pb-6 mb-8 gap-4 font-mono text-xs">
              <div>
                <span className="text-3xl font-bold tracking-widest leading-none block">SHED</span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 block mt-1">INTERNAL DISPATCH RECEIPT SERVICE</span>
              </div>
              <div className={receiptLang === 'ar' ? 'text-left' : 'text-right'}>
                <span className="text-[10px] text-zinc-500 block">REF BOOKING TRANSACTION ID</span>
                <span className="text-sm font-bold block bg-black text-[#CCFF00] px-2 py-0.5 mt-1 text-center font-mono">
                  {receiptBooking.id}
                </span>
              </div>
            </div>

            {/* Customer Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-zinc-200 pb-6 mb-8 text-xs font-sans">
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-zinc-400 block uppercase font-bold">CLIENT INFORMATION</span>
                <p className="text-sm font-bold uppercase">{receiptBooking.user_name}</p>
                <p className="font-mono text-zinc-600">{receiptBooking.user_email}</p>
                <p className="font-mono text-zinc-600">{receiptBooking.user_phone}</p>
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-zinc-400 block uppercase font-bold">DISPATCH / SERVICE METRIC</span>
                <p className="text-sm font-bold uppercase">
                  {receiptLang === 'en' ? receiptBooking.service_name_en : receiptBooking.service_name_ar}
                </p>
                <p className="font-mono text-zinc-600 uppercase">DATE: {receiptBooking.date}</p>
                <p className="font-mono text-zinc-600 uppercase">SLOT: {receiptBooking.time_slot}</p>
              </div>
              <div className="col-span-1 sm:col-span-2 mt-2">
                <span className="font-mono text-[9px] text-zinc-400 block uppercase font-bold">PHYSICAL SERVICING SITE</span>
                <p className="text-xs text-zinc-800 leading-normal font-sans bg-zinc-50 p-2.5 border border-zinc-100">{receiptBooking.address}</p>
              </div>
            </div>

            {/* Cost Items Table Details */}
            <div className="mb-8 font-mono text-xs">
              <span className="text-[9px] text-zinc-400 block uppercase mb-3 font-bold">BILLING STATEMENT DETAIL</span>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black text-black">
                    <th className={`py-2 text-[10px] uppercase ${receiptLang === 'ar' ? 'text-right' : 'text-left'}`}>
                      {receiptLang === 'en' ? 'Item / Work Description' : 'البند / وصف المنيفة'}
                    </th>
                    <th className="py-2 text-center text-[10px] uppercase">
                      {receiptLang === 'en' ? 'Qty' : 'الكمية'}
                    </th>
                    <th className={`py-2 text-[10px] uppercase ${receiptLang === 'ar' ? 'text-left' : 'text-right'}`}>
                      {receiptLang === 'en' ? 'Unit Price ($)' : 'سعر الوحدة ($)'}
                    </th>
                    <th className={`py-2 text-[10px] uppercase ${receiptLang === 'ar' ? 'text-left' : 'text-right'}`}>
                      {receiptLang === 'en' ? 'Total' : 'الإجمالي'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Flat Booking fee listed */}
                  <tr className="border-b border-zinc-150 text-zinc-800">
                    <td className={`py-2.5 ${receiptLang === 'ar' ? 'text-right font-sans' : 'text-left'}`}>
                      {receiptLang === 'en' 
                        ? 'Flat File Booking Fee' 
                        : 'رسوم حجز الخدمة الثابتة للشيد'}
                    </td>
                    <td className="py-2.5 text-center">1</td>
                    <td className={`py-2.5 ${receiptLang === 'ar' ? 'text-left' : 'text-right'}`}>
                      ${receiptBooking.booking_fee}
                    </td>
                    <td className={`py-2.5 font-bold ${receiptLang === 'ar' ? 'text-left' : 'text-right'}`}>
                      ${receiptBooking.booking_fee}
                    </td>
                  </tr>

                  {/* Dynamic cost items */}
                  {receiptBooking.cost_items && receiptBooking.cost_items.map(item => (
                    <tr key={item.id} className="border-b border-zinc-150 text-zinc-800">
                      <td className={`py-2.5 ${receiptLang === 'ar' ? 'text-right' : 'text-left'}`}>{item.description}</td>
                      <td className="py-2.5 text-center">{item.quantity}</td>
                      <td className={`py-2.5 ${receiptLang === 'ar' ? 'text-left' : 'text-right'}`}>${item.unit_price}</td>
                      <td className={`py-2.5 font-bold ${receiptLang === 'ar' ? 'text-left' : 'text-right'}`}>${item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations summaries */}
            <div className="flex flex-col items-end space-y-2 border-t border-black pt-4 mb-12 font-mono text-xs">
              <div className="flex justify-between w-64 text-zinc-500">
                <span>{receiptLang === 'en' ? 'Subtotal' : 'المجموع الفرعي'}</span>
                <span>${receiptBooking.cost_items?.reduce((s, c) => s + c.total, 0) || 0}</span>
              </div>
              <div className="flex justify-between w-64 text-zinc-500 pb-2 border-b border-zinc-200">
                <span>{receiptLang === 'en' ? 'Standard Booking Fee' : 'رسوم الحجز الثابتة'}</span>
                <span>${receiptBooking.booking_fee}</span>
              </div>
              
              {/* Grand Total Highlight Box in #CCFF00 */}
              <div className="flex justify-between items-center w-72 bg-[#CCFF00] text-black font-black p-3 mt-1.5 border border-black">
                <span className="text-[10px] uppercase font-bold">
                  {receiptLang === 'en' ? 'GRAND TOTAL ($)' : 'المجموع الإجمالي الكلي ($)'}
                </span>
                <span className="text-base font-black">
                  ${(receiptBooking.cost_items?.reduce((s, c) => s + c.total, 0) || 0) + Number(receiptBooking.booking_fee)}
                </span>
              </div>
            </div>

            {/* Signature official Stamp */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-zinc-200 font-mono text-[10px] text-zinc-400">
              <div className="space-y-1">
                <p className="font-bold text-zinc-650">{receiptLang === 'en' ? 'SHED OFFICIAL REGISTER stamp' : 'ختم تسجيل شيد الرسمي للمشاريع'}</p>
                <p>STATUS: DIAL-OK SECURE</p>
              </div>
              <div className="border border-black p-2 text-center text-black font-black uppercase text-[10px] tracking-widest bg-zinc-50 select-none">
                SHED SYSTEM APPROVED
              </div>
            </div>

            {/* Corporate Invoice Footer */}
            <div className="mt-16 text-center text-zinc-400 text-[9px] leading-relaxed font-mono border-t border-zinc-150 pt-4">
              <p className="font-bold text-zinc-500 uppercase">
                {receiptLang === 'en' ? t('thankYou') : 'نشكركم على اختيار شيد لتقديم الرعاية المتميزة والحلول الإنشائية والخدمات لكم.'}
              </p>
              <p className="mt-1">
                {t('companyDetails')}
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
