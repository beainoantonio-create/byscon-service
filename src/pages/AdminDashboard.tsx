import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { TRANSLATIONS } from '../data';
import ServiceIcon from '../components/ServiceIcon';
import { Booking, BookingStatus, Service, User } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { 
    language, 
    currentUser, 
    bookings, 
    users, 
    services, 
    updateBookingStatus, 
    updateServiceFee, 
    logout, 
    toggleLanguage,
    updateUserRole,
    updateUserPassword
  } = useApp();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];

  // Protect Admin route
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/admin' } });
    } else if (currentUser.role !== 'admin' && currentUser.role !== 'staff') {
      navigate('/dashboard'); // customer/others redirected away from admin dashboard
    }
  }, [currentUser, navigate]);

  // States
  const [adminTab, setAdminTab] = useState<'bookings' | 'users' | 'services' | 'settings'>('bookings');
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);
  const isStaff = currentUser?.role === 'staff';
  
  // Rate adjusting modal states
  const [selectedServiceForFee, setSelectedServiceForFee] = useState<Service | null>(null);
  const [newFeeValue, setNewFeeValue] = useState<number>(0);
  const [feeError, setFeeError] = useState('');
  const [innerStatusMsg, setInnerStatusMsg] = useState('');

  // Job Costs & Receipt states
  const { updateBookingCosts } = useApp();
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'costs'>('details');
  const [receiptLanguage, setReceiptLanguage] = useState<'en' | 'ar'>('en');
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  // New item form inputs
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);

  // Editing existing item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemDesc, setEditingItemDesc] = useState('');
  const [editingItemQty, setEditingItemQty] = useState(1);
  const [editingItemPrice, setEditingItemPrice] = useState(0);

  // Local state for internal notes
  const [internalNotesVal, setInternalNotesVal] = useState('');

  // Sync costing and notes whenever a booking is opened/selected
  React.useEffect(() => {
    if (selectedBookingDetails) {
      setInternalNotesVal(selectedBookingDetails.internalNotes || '');
      setActiveDetailTab('details');
      setShowReceiptPreview(false);
      setNewItemDesc('');
      setNewItemQty(1);
      setNewItemPrice(0);
      setEditingItemId(null);
      setReceiptLanguage(language);
    }
  }, [selectedBookingDetails, language]);

  // Costing helper handlers
  const handleAddCostItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingDetails || !newItemDesc.trim()) return;

    const newItem = {
      id: 'cost-' + Math.random().toString(36).substr(2, 9),
      description: newItemDesc.trim(),
      quantity: newItemQty,
      unitPrice: newItemPrice
    };

    const currentItems = selectedBookingDetails.costItems || [];
    const updatedItems = [...currentItems, newItem];

    updateBookingCosts(selectedBookingDetails.id, updatedItems, internalNotesVal);
    setSelectedBookingDetails(prev => prev ? { ...prev, costItems: updatedItems } : null);

    setNewItemDesc('');
    setNewItemQty(1);
    setNewItemPrice(0);
  };

  const handleStartEditCostItem = (item: any) => {
    setEditingItemId(item.id);
    setEditingItemDesc(item.description);
    setEditingItemQty(item.quantity);
    setEditingItemPrice(item.unitPrice);
  };

  const handleSaveEditCostItem = (itemId: string) => {
    if (!selectedBookingDetails || !editingItemDesc.trim()) return;

    const currentItems = selectedBookingDetails.costItems || [];
    const updatedItems = currentItems.map(item => 
      item.id === itemId 
        ? { ...item, description: editingItemDesc.trim(), quantity: editingItemQty, unitPrice: editingItemPrice }
        : item
    );

    updateBookingCosts(selectedBookingDetails.id, updatedItems, internalNotesVal);
    setSelectedBookingDetails(prev => prev ? { ...prev, costItems: updatedItems } : null);
    setEditingItemId(null);
  };

  const handleDeleteCostItem = (itemId: string) => {
    if (!selectedBookingDetails) return;

    const currentItems = selectedBookingDetails.costItems || [];
    const updatedItems = currentItems.filter(item => item.id !== itemId);

    updateBookingCosts(selectedBookingDetails.id, updatedItems, internalNotesVal);
    setSelectedBookingDetails(prev => prev ? { ...prev, costItems: updatedItems } : null);
  };

  const handleSaveInternalNotes = (notes: string) => {
    setInternalNotesVal(notes);
    if (!selectedBookingDetails) return;
    const currentItems = selectedBookingDetails.costItems || [];
    updateBookingCosts(selectedBookingDetails.id, currentItems, notes);
    setSelectedBookingDetails(prev => prev ? { ...prev, internalNotes: notes } : null);
  };

  // Filtering states
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Search states for customer listing table
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Multi-selection state for bookings
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);

  // Clear multi-select when changing filters or switching tabs
  React.useEffect(() => {
    setSelectedBookingIds([]);
  }, [filterService, filterStatus, filterUrgency, filterDate, adminTab]);

  if (!currentUser || currentUser.role !== 'admin') return null;

  // Overview Stats Calculation
  const totalBookingsCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
  const completedCount = bookings.filter((b) => b.status === 'Completed').length;
  
  // Completed revenue (sum of completed bookings fees)
  const totalRevenue = bookings
    .filter((b) => b.status === 'Completed' && b.bookingFee !== undefined)
    .reduce((sum, b) => sum + (b.bookingFee || 0), 0);

  // Filter Bookings logic
  const filteredBookings = bookings.filter((b) => {
    const matchService = filterService === 'all' || b.serviceId === filterService;
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchUrgency = filterUrgency === 'all' || b.urgency === filterUrgency;
    const matchDate = !filterDate || b.date === filterDate;
    return matchService && matchStatus && matchUrgency && matchDate;
  });

  // Filter Users search logic
  const filteredUsers = users.filter((u) => {
    if (!userSearchTerm) return true;
    const term = userSearchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.phone.toLowerCase().includes(term)
    );
  });

  // Status mappings
  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'Pending': return t.statusPending;
      case 'Confirmed': return t.statusConfirmed;
      case 'In Progress': return t.statusInProgress;
      case 'Completed': return t.statusCompleted;
      case 'Cancelled': return t.statusCancelled;
      default: return status;
    }
  };

  const getStatusBadgeStyles = (status: BookingStatus) => {
    switch (status) {
      case 'Pending': 
        return 'border border-white text-white';
      case 'Confirmed': 
        return 'border border-[#CCFF00] text-[#CCFF00] font-bold';
      case 'In Progress': 
        return 'bg-[#CCFF00] text-black font-black';
      case 'Completed': 
        return 'border border-white/20 text-white/40 line-through';
      case 'Cancelled': 
        return 'border border-white/10 text-white/25 line-through';
      default: 
        return 'border border-white';
    }
  };

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    updateBookingStatus(bookingId, newStatus);
    
    // Also keep the details panel updated with revised item if currently viewing
    setSelectedBookingDetails((prev) => {
      if (prev && prev.id === bookingId) {
        return { ...prev, status: newStatus };
      }
      return prev;
    });

    setInnerStatusMsg(t.confirmStatusSuccess);
    setTimeout(() => setInnerStatusMsg(''), 2500);
  };

  const handleBatchStatusChange = (newStatus: BookingStatus) => {
    if (selectedBookingIds.length === 0) return;
    
    selectedBookingIds.forEach((id) => {
      updateBookingStatus(id, newStatus);
    });

    setInnerStatusMsg(
      language === 'en' 
        ? `Successfully updated status to "${newStatus}" for ${selectedBookingIds.length} bookings.`
        : `تم تحديث حالة ${selectedBookingIds.length} حجوزات بنجاح إلى "${newStatus === 'Completed' ? 'مكتمل' : newStatus === 'Confirmed' ? 'مؤكد' : newStatus === 'In Progress' ? 'قيد التنفيذ' : newStatus === 'Cancelled' ? 'ملغي' : newStatus}".`
    );
    setSelectedBookingIds([]);
    setTimeout(() => setInnerStatusMsg(''), 3000);
  };

  const handleOpenFeeModal = (service: Service) => {
    setSelectedServiceForFee(service);
    setNewFeeValue(service.bookingFee || 0);
    setFeeError('');
  };

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    setFeeError('');

    if (newFeeValue < 0 || isNaN(newFeeValue)) {
      setFeeError(language === 'en' ? 'Fee must be a non-negative number.' : 'يجب أن تكون الرسوم برقم موجب.');
      return;
    }

    if (selectedServiceForFee) {
      updateServiceFee(selectedServiceForFee.id, newFeeValue);
      setSelectedServiceForFee(null);
      
      setInnerStatusMsg(t.confirmFeeSuccess);
      setTimeout(() => setInnerStatusMsg(''), 2500);
    }
  };

  // Helper arrays for filters
  const distinctServices = Array.from(new Set(bookings.map((b) => JSON.stringify({id: b.serviceId, en: b.serviceNameEn, ar: b.serviceNameAr}))))
    .map((str) => JSON.parse(str as string) as {id: string; en: string; ar: string});

  // Calculate last 30 days revenue data dynamically
  const getRevenueTrendData = () => {
    const dataset = [];
    const baseDate = new Date('2026-05-23T12:00:00Z');
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const label = language === 'en' 
        ? `${monthNamesEn[d.getMonth()]} ${d.getDate()}`
        : `${d.getDate()} ${monthNamesAr[d.getMonth()]}`;

      // Aggregate Completed bookings revenue on that exact date
      const dayBookings = bookings.filter(b => b.status === 'Completed' && b.date === dateStr);
      const dayRevenue = dayBookings.reduce((sum, b) => sum + (b.bookingFee || 0), 0);

      dataset.push({
        label,
        revenue: dayRevenue,
        count: dayBookings.length
      });
    }
    return dataset;
  };

  const revenueData = getRevenueTrendData();

  const getBookingMapTelemetry = (bid: string) => {
    let hash = 0;
    for (let i = 0; i < bid.length; i++) {
      hash = bid.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);
    const pinX = 25 + (absHash % 50); // centermost 25% to 75%
    const pinY = 25 + ((absHash >> 2) % 50);
    const latDec = 6800 + (absHash % 2500); 
    const lngDec = 4500 + ((absHash >> 3) % 2500);
    const zoneId = (absHash % 5) + 1;
    const estTime = (absHash % 12) + 9;
    return { pinX, pinY, latDec, lngDec, zoneId, estTime };
  };

  // Custom tool tip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1A1A] border border-white/10 p-3 shadow-2xl rounded-xl font-mono text-xs">
          <p className="text-white/40 font-sans font-bold uppercase mb-1">{label}</p>
          <p className="text-[#CCFF00] font-black text-sm">
            {language === 'en' ? 'Revenue' : 'الإيرادات'}: {payload[0].value} SAR
          </p>
          <p className="text-white/80 text-[10px] mt-1">
            {language === 'en' ? 'Tickets' : 'العمليات'}: {payload[0].payload.count} Completed
          </p>
        </div>
      );
    }
    return null;
  };

  const selectedTelemetry = selectedBookingDetails ? getBookingMapTelemetry(selectedBookingDetails.id) : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* HEADER NAVBAR */}
      <header className="border-b border-[#1A1A1A] bg-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center p-4 gap-4 px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#CCFF00] rounded-sm shrink-0 flex items-center justify-center text-black font-extrabold text-[12px] tracking-tighter">
              MT
            </div>
            <div>
              <Link to="/" className="font-sans font-black text-2xl tracking-tighter text-[#CCFF00] hover:text-white transition-colors leading-none block">
                M-TECH
              </Link>
              <p className="font-mono text-[9px] text-white/40 tracking-widest mt-0.5 uppercase">
                {language === 'en' ? 'SYSTEMS GATE' : 'بوابة النظام'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs">
            <Link to="/" className="tracking-widest text-white hover:text-[#CCFF00] uppercase transition-all">
              {t.navHome}
            </Link>
            
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="tracking-widest text-white hover:text-red-500 uppercase transition-colors cursor-pointer flex items-center gap-1 bg-[#1A1A1A] px-2.5 py-1.5 border border-white/5"
            >
              <ServiceIcon name="LogOut" className="w-3 h-3 text-[#CCFF00]" />
              <span>{t.navLogout}</span>
            </button>

            <button
              onClick={toggleLanguage}
              className="border border-[#CCFF00]/60 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black text-xs px-3 py-1.5 tracking-widest transition-all cursor-pointer uppercase rounded-sm"
            >
              {t.langToggle}
            </button>
          </div>
        </div>
      </header>

      {/* ADMIN TITLE / PROFILE */}
      <section className="bg-black py-8 border-b border-[#1A1A1A] px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-xs font-mono text-[#CCFF00] tracking-widest uppercase mb-1">
              {t.roleAdmin} SECURE TERMINAL
            </div>
            <h2 className="text-3xl font-sans font-black tracking-tight uppercase">
              {t.adminPortalTitle}
            </h2>
            <p className="text-xs font-mono text-white/50 mt-1 uppercase">
              {t.welcomeBack}, <span className="text-[#CCFF00] font-sans font-bold">{currentUser.name}</span> | CONSOLE CONTROL PANEL
            </p>
          </div>
          
          <div className="bg-[#CCFF00] text-black px-4 py-2 font-mono text-xs font-extrabold uppercase tracking-widest">
            LIVE SYSTEM DISPATCH
          </div>
        </div>
      </section>

      {/* OVERVIEW STATS BENTO MATRIX */}
      <section className="max-w-7xl mx-auto w-full p-6 pb-2 px-6">
        {innerStatusMsg && (
          <div className="border border-[#CCFF00] bg-[#CCFF00]/5 text-[#CCFF00] p-4 text-xs font-mono uppercase mb-6 flex items-center gap-2 animate-pulse">
            <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-none"></span>
            <span>{innerStatusMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat 1: Total bookings */}
          <div className="border border-white/15 bg-black p-6 relative">
            <span className="absolute bottom-4 right-4 text-white/10 font-black text-4xl font-mono">01</span>
            <p className="text-xs font-mono uppercase tracking-widest text-[#CCFF00] mb-2">{t.adminStatsTotal}</p>
            <h4 className="text-3xl font-sans font-black text-white">{totalBookingsCount}</h4>
          </div>

          {/* Stat 2: Pending bookings */}
          <div className="border border-white/15 bg-black p-6 relative">
            <span className="absolute bottom-4 right-4 text-white/10 font-black text-4xl font-mono">02</span>
            <p className="text-xs font-mono uppercase tracking-widest text-[#CCFF00] mb-2">{t.adminStatsPending}</p>
            <h4 className="text-3xl font-sans font-black text-white">{pendingCount}</h4>
          </div>

          {/* Stat 3: Completed bookings */}
          <div className="border border-[#CCFF00]/30 bg-black p-6 relative">
            <span className="absolute bottom-4 right-4 text-white/10 font-black text-4xl font-mono">03</span>
            <p className="text-xs font-mono uppercase tracking-widest text-[#CCFF00] mb-2">{t.adminStatsCompleted}</p>
            <h4 className="text-3xl font-sans font-black text-[#CCFF00]">{completedCount}</h4>
          </div>

          {/* Stat 4: Revenue */}
          <div className="border border-[#CCFF00] bg-black p-6 relative">
            <span className="absolute top-2 right-2 text-[8px] bg-[#CCFF00] text-black px-1 font-mono uppercase font-black">COMPLETED FEE ONLY</span>
            <p className="text-xs font-mono uppercase tracking-widest text-white/60 mb-2">{t.adminStatsRevenue}</p>
            <h4 className="text-3xl font-sans font-black text-[#CCFF00]">{totalRevenue} <span className="text-xs font-mono text-white/70">{t.bookingFeeCurrency}</span></h4>
          </div>
        </div>

        {/* REVENUE TRENDS CHART CARD */}
        <div className="mt-8 border border-white/10 bg-black p-6 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 w-2 h-2 rounded-full bg-[#CCFF00]"></div>
          
          <div className="mb-6">
            <span className="font-mono text-[10px] text-[#CCFF00] uppercase tracking-widest">
              {language === 'en' ? 'FINANCIAL TELEMETRY' : 'التحليلات والمجاميع المالية'}
            </span>
            <h3 className="text-xl font-sans font-black uppercase tracking-tight text-white mt-1">
              {language === 'en' ? '30-Day Completed Revenue Trend' : 'منحنى الإيرادات المحصلة - آخر 30 يوماً'}
            </h3>
            <p className="text-xs font-mono text-white/40 mt-1 uppercase">
              {language === 'en' ? 'Visualizing completed service ticket transactions dynamically' : 'عرض بياني ديناميكي لعمليات الدفع والتذاكر المكتملة بنجاح'}
            </p>
          </div>

          <div className="w-full h-[280px] sm:h-[355px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#CCFF00" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#555555" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#555555" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dx={-5}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#CCFF00" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* MAIN ADMIN LAYOUT AREA WITH TABBED MODULES */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-6 md:p-12 px-6 pt-6">
        
        {/* Module Tab Selectors */}
        <div className="flex border-b border-white/15 mb-8 font-mono text-xs uppercase tracking-widest select-none flex-wrap gap-y-1">
          <button
            onClick={() => setAdminTab('bookings')}
            className={`py-3 px-6 border-b-2 transition-all cursor-pointer ${
              adminTab === 'bookings'
                ? 'border-[#CCFF00] text-[#CCFF00] font-black bg-[#CCFF00]/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            {t.tabBookings}
          </button>
          
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setAdminTab('users')}
              className={`py-3 px-6 border-b-2 transition-all cursor-pointer ${
                adminTab === 'users'
                  ? 'border-[#CCFF00] text-[#CCFF00] font-black bg-[#CCFF00]/5'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              {t.tabUsers} ({users.length})
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setAdminTab('services')}
              className={`py-3 px-6 border-b-2 transition-all cursor-pointer ${
                adminTab === 'services'
                  ? 'border-[#CCFF00] text-[#CCFF00] font-black bg-[#CCFF00]/5'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              {t.tabServices}
            </button>
          )}

          <button
            onClick={() => setAdminTab('settings')}
            className={`py-3 px-6 border-b-2 transition-all cursor-pointer ${
              adminTab === 'settings'
                ? 'border-[#CCFF00] text-[#CCFF00] font-black bg-[#CCFF00]/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            {language === 'en' ? 'Settings' : 'الإعدادات'}
          </button>
        </div>

        {/* ================================== */}
        {/* MODULE 1: BOOKINGS DISPATCH BOARD */}
        {/* ================================== */}
        {adminTab === 'bookings' && (
          <div className="space-y-6">
            
            {/* Search/Filter Console Card */}
            <div className="border border-white/10 bg-black p-6">
              <span className="font-mono text-[10px] text-[#CCFF00] uppercase tracking-widest mb-4 block">
                {t.adminFiltersHeader}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Filter by Service */}
                <div>
                  <label className="block text-[10.5px] font-mono uppercase text-white/60 mb-1.5">{t.filterByService}</label>
                  <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-sans text-white focus:border-[#CCFF00] focus:outline-none rounded-none"
                  >
                    <option value="all">{t.filterAll}</option>
                    {distinctServices.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {language === 'en' ? srv.en : srv.ar}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Filter by Status */}
                <div>
                  <label className="block text-[10.5px] font-mono uppercase text-white/60 mb-1.5">{t.filterByStatus}</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-sans text-white focus:border-[#CCFF00] focus:outline-none rounded-none"
                  >
                    <option value="all">{t.filterAll}</option>
                    <option value="Pending">{t.statusPending}</option>
                    <option value="Confirmed">{t.statusConfirmed}</option>
                    <option value="In Progress">{t.statusInProgress}</option>
                    <option value="Completed">{t.statusCompleted}</option>
                    <option value="Cancelled">{t.statusCancelled}</option>
                  </select>
                </div>

                {/* 3. Filter by Urgency */}
                <div>
                  <label className="block text-[10.5px] font-mono uppercase text-white/60 mb-1.5">{t.filterByUrgency}</label>
                  <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="w-full bg-black border border-white/20 px-3 py-2 text-xs font-sans text-white focus:border-[#CCFF00] focus:outline-none rounded-none"
                  >
                    <option value="all">{t.filterAll}</option>
                    <option value="normal">{t.urgencyNormalLabel}</option>
                    <option value="urgent">{t.urgencyUrgentLabel}</option>
                    <option value="emergency">{t.urgencyEmergencyLabel}</option>
                  </select>
                </div>

                {/* 4. Filter by Date */}
                <div>
                  <label className="block text-[10.5px] font-mono uppercase text-white/60 mb-1.5">{t.filterByDate}</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full bg-black border border-white/20 px-3 py-1.5 text-xs font-mono text-white focus:border-[#CCFF00] focus:outline-none rounded-none"
                  />
                </div>
              </div>

              {/* Reset filter button */}
              {(filterService !== 'all' || filterStatus !== 'all' || filterUrgency !== 'all' || filterDate) && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setFilterService('all');
                      setFilterStatus('all');
                      setFilterUrgency('all');
                      setFilterDate('');
                    }}
                    className="font-mono text-[9px] text-[#CCFF00] border border-[#CCFF00] px-2 py-1 uppercase hover:bg-[#CCFF00] hover:text-black transition-all cursor-pointer"
                  >
                    {language === 'en' ? 'CLEAR ALL CUSTOM FILTERS' : 'إعادة ضبط كافة الفرز'}
                  </button>
                </div>
              )}
            </div>

            {/* Batch Operations Bar */}
            {selectedBookingIds.length > 0 && (
              <div className="border border-[#CCFF00] bg-black p-4 flex flex-col lg:flex-row justify-between items-center gap-4 animate-slide-in duration-200">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-[#CCFF00] rounded-none animate-pulse shrink-0"></div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#CCFF00] font-black">
                    {language === 'en' 
                      ? `BATCH OPERATION: ${selectedBookingIds.length} BOOKING(S) SELECTED`
                      : `عملية جماعية: تم تحديد ${selectedBookingIds.length} حجز`}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-mono text-[10px] text-white/50 uppercase ltr:block rtl:hidden mr-1">
                    Update status:
                  </span>
                  <span className="font-mono text-[10px] text-white/50 uppercase rtl:block ltr:hidden ml-1">
                    تحديث الحالة:
                  </span>
                  
                  {['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleBatchStatusChange(st as BookingStatus)}
                      className="bg-black text-[#CCFF00] hover:text-black border border-[#CCFF00] hover:bg-[#CCFF00] font-mono text-[10.5px] px-3 py-1 uppercase transition-all duration-150 cursor-pointer font-bold"
                    >
                      {st}
                    </button>
                  ))}
                  
                  <div className="h-5 w-px bg-white/10 mx-2"></div>
                  
                  <button
                    onClick={() => setSelectedBookingIds([])}
                    className="text-white/60 hover:text-white font-mono text-[10.5px] uppercase underline cursor-pointer"
                  >
                    {language === 'en' ? 'Deselect All' : 'إلغاء التحديد'}
                  </button>
                </div>
              </div>
            )}

            {/* Bookings responsive structured list grid table */}
            {filteredBookings.length === 0 ? (
              <div className="border border-dashed border-white/10 p-12 text-center text-white/50 text-sm">
                {language === 'en' ? 'No matching booking orders found with current filters.' : 'لا توجد طلبات تطابق معايير التصفية الحالية.'}
              </div>
            ) : (
              <div className="overflow-x-auto border border-white/15 bg-black">
                <table className="w-full text-left rtl:text-right border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-white/15 bg-white/[0.02] font-mono uppercase text-[10px] text-[#CCFF00] tracking-wider select-none">
                      {!isStaff && (
                        <th className="p-4 w-12 text-center">
                          <input 
                            type="checkbox"
                            checked={filteredBookings.length > 0 && filteredBookings.every(b => selectedBookingIds.includes(b.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBookingIds(filteredBookings.map(b => b.id));
                              } else {
                                setSelectedBookingIds([]);
                              }
                            }}
                            className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-[#CCFF00] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#CCFF00]"
                          />
                        </th>
                      )}
                      <th className="p-4">ID</th>
                      <th className="p-4">{t.tblClient}</th>
                      <th className="p-4">{t.tblService}</th>
                      <th className="p-4">{t.tblDate}</th>
                      <th className="p-4">{t.tblUrgency}</th>
                      <th className="p-4">{t.tblStatus}</th>
                      <th className="p-4 text-right rtl:text-left">{t.tblActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 font-sans">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-white/[0.01] transition-colors">
                        {!isStaff && (
                          <td className="p-4 text-center w-12 select-none">
                            <input 
                              type="checkbox"
                              checked={selectedBookingIds.includes(b.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBookingIds(prev => [...prev, b.id]);
                                } else {
                                  setSelectedBookingIds(prev => prev.filter(id => id !== b.id));
                                }
                              }}
                              className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-[#CCFF00] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#CCFF00]"
                            />
                          </td>
                        )}
                        <td className="p-4 font-mono font-bold">{b.id}</td>
                        <td className="p-4">
                          <div className="font-sans font-bold text-white">{b.userName}</div>
                          <div className="font-mono text-[10px] text-white/50">{b.userPhone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-sans font-black text-white">{language === 'en' ? b.serviceNameEn : b.serviceNameAr}</div>
                          <div className="text-[10px] font-mono text-white/40">
                            {b.bookingFee !== undefined ? `${b.bookingFee} ${t.bookingFeeCurrency}` : 'Consultation'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-mono text-white">{b.date}</div>
                          <div className="text-[10px] font-mono text-white/50 capitalize">{b.timeSlot} slot</div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[9.5px] font-mono uppercase tracking-wider px-2 py-0.5 border ${
                            b.urgency === 'emergency'
                              ? 'border-[#CCFF00] text-[#CCFF00] bg-[#CCFF00]/5 font-black'
                              : b.urgency === 'urgent'
                              ? 'border-white text-white font-bold'
                              : 'border-white/15 text-white/40'
                          }`}>
                            {b.urgency}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 ${getStatusBadgeStyles(b.status)}`}>
                            {getStatusLabel(b.status)}
                          </span>
                        </td>
                        <td className="p-4 text-right rtl:text-left select-none">
                          <button
                            onClick={() => setSelectedBookingDetails(b)}
                            className="bg-white/5 border border-white/20 hover:border-[#CCFF00] text-white hover:text-[#CCFF00] font-mono text-[10.5px] px-3 py-1 uppercase rounded-none transition-all cursor-pointer"
                          >
                            {t.btnViewDetails}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================================== */}
        {/* MODULE 2: CUSTOMERS REGISTER BASE */}
        {/* ================================== */}
        {adminTab === 'users' && (
          <div className="space-y-6">
            
            {/* Search inputs */}
            <div className="border border-white/10 bg-black p-4 flex items-center gap-3">
              <span className="text-white/40 shrink-0">
                <ServiceIcon name="Users" className="w-5 h-5 text-[#CCFF00]" />
              </span>
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder={language === 'en' ? "Search customers by name, email, phone number..." : "البحث عن عملاء بالاسم، البريد أو رقم الجوال..."}
                className="w-full bg-black text-sm text-white focus:outline-none font-sans"
              />
              {userSearchTerm && (
                <button
                  onClick={() => setUserSearchTerm('')}
                  className="font-mono text-[9px] text-[#CCFF00] hover:underline uppercase"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Users grid list */}
            <div className="overflow-x-auto border border-white/15 bg-black">
              <table className="w-full text-left rtl:text-right border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-white/15 bg-white/[0.02] font-mono uppercase text-[10px] text-[#CCFF00] tracking-wider">
                    <th className="p-4">UID</th>
                    <th className="p-4">{t.userColumnName}</th>
                    <th className="p-4">{t.userColumnContact}</th>
                    <th className="p-4">{t.tblStatus}</th>
                    <th className="p-4 text-right rtl:text-left">{t.userColumnBookings}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-sans">
                  {filteredUsers.map((u) => {
                    const clientBookingsCount = bookings.filter((b) => b.userId === u.id).length;
                    return (
                      <tr key={u.id} className="hover:bg-white/[0.01]">
                        <td className="p-4 font-mono font-bold text-white/50">{u.id}</td>
                        <td className="p-4">
                          <span className="font-sans font-black text-white">{u.name}</span>
                        </td>
                        <td className="p-4">
                          <div className="font-sans text-white">{u.email}</div>
                          <div className="font-mono text-[10px] text-white/50">{u.phone}</div>
                        </td>
                        <td className="p-4">
                          <select
                            value={u.role || 'customer'}
                            onChange={(e) => {
                              const newRole = e.target.value as 'customer' | 'staff' | 'admin';
                              updateUserRole(u.id, newRole);
                            }}
                            className="bg-black text-[11px] font-mono border border-white/20 hover:border-[#CCFF00] text-white px-2 py-1 uppercase rounded-none focus:outline-none focus:ring-1 focus:ring-[#CCFF00]"
                          >
                            <option value="customer">{language === 'en' ? 'Customer' : 'عميل'}</option>
                            <option value="staff">{language === 'en' ? 'Staff' : 'فريق العمل'}</option>
                            <option value="admin">{language === 'en' ? 'Admin' : 'مدير النظام'}</option>
                          </select>
                        </td>
                        <td className="p-4 text-right rtl:text-left font-mono font-bold text-[#CCFF00]">
                          {clientBookingsCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================== */}
        {/* MODULE 3: SERVICE RATE MANAGER */}
        {/* ================================== */}
        {adminTab === 'services' && (
          <div className="space-y-6">
            <div className="border border-white/10 bg-black p-4 text-xs font-mono text-white/60 uppercase max-w-2xl leading-relaxed">
              * {language === 'en' 
                ? 'Supervisor override allowed only for maintenance division booking fees. Consultancy categories do not support flat booking rates.'
                : 'يسمح بتغيير الرسوم التشغيلية لخدمات الصيانة فقط. استشارات الخبراء خاضعة للتسعير المرن بناءً على متطلبات المشروع المحددة.'
              }
            </div>

            <div className="overflow-x-auto border border-white/15 bg-black">
              <table className="w-full text-left rtl:text-right border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-white/15 bg-white/[0.02] font-mono uppercase text-[10px] text-[#CCFF00] tracking-wider">
                    <th className="p-4">{t.serviceColumnName}</th>
                    <th className="p-4">{t.serviceColumnCategory}</th>
                    <th className="p-4">{t.serviceColumnFee}</th>
                    <th className="p-4 text-right rtl:text-left">{t.serviceColumnActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-sans">
                  {services.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.01]">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[#CCFF00]">
                            <ServiceIcon name={s.icon} className="w-5 h-5" />
                          </span>
                          <div>
                            <span className="text-white font-black">{language === 'en' ? s.nameEn : s.nameAr}</span>
                            <p className="text-[10px] text-white/50 font-normal line-clamp-1 mt-0.5">
                              {language === 'en' ? s.descriptionEn : s.descriptionAr}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-white/10 text-white select-none">
                          {s.categoryId === 'maintenance' ? 'Maintenance' : 'Consultancy'}
                        </span>
                      </td>
                      <td className="p-4">
                        {s.categoryId === 'maintenance' && s.bookingFee !== undefined ? (
                          <span className="font-mono font-black text-[#CCFF00] text-base">
                            {s.bookingFee} <span className="text-[10px] font-normal text-white/70">{t.bookingFeeCurrency}</span>
                          </span>
                        ) : (
                          <span className="font-mono text-white/40 text-[10.5px] uppercase italic">
                            {language === 'en' ? 'Variable' : 'متغير'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right rtl:text-left select-none font-mono">
                        {s.categoryId === 'maintenance' ? (
                          <button
                            onClick={() => handleOpenFeeModal(s)}
                            className="bg-[#CCFF00] font-black hover:bg-black text-black border border-[#CCFF00] hover:text-[#CCFF00] text-[10.5px] px-3 py-1 uppercase rounded-none transition-all cursor-pointer"
                          >
                            {t.btnUpdateFee}
                          </button>
                        ) : (
                          <span className="text-[10px] text-white/30 uppercase">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================== */}
        {/* MODULE 4: SETTINGS SYSTEM */}
        {/* ================================== */}
        {adminTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            
            {/* Info panel */}
            <div className="border border-white/10 bg-black p-6 relative">
              <div className="absolute top-0 right-0 bg-[#CCFF00] text-black font-mono text-[9px] px-2 py-0.5 tracking-widest uppercase font-black">
                {currentUser?.role === 'admin' ? 'Root Access' : 'Staff Agent'}
              </div>
              <h4 className="text-sm font-mono tracking-widest text-[#CCFF00] uppercase mb-4">
                {language === 'en' ? 'LOGGED-IN PROFILE' : 'ملف المستخدم الفني الحالي'}
              </h4>
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">{language === 'en' ? 'Full Name:' : 'الاسم الكريم:'}</span>
                  <span className="text-white font-bold">{currentUser?.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">{language === 'en' ? 'Email Address:' : 'البريد الإلكتروني:'}</span>
                  <span className="text-white font-mono">{currentUser?.email}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">{language === 'en' ? 'Assigned Duty Role:' : 'المسمى الوظيفي والصلاحيات:'}</span>
                  <span className="text-[#CCFF00] font-mono uppercase font-bold">{currentUser?.role === 'admin' ? 'Admin / Dispatcher' : 'Staff / Field Agent'}</span>
                </div>
              </div>
            </div>

            {/* Change password form */}
            <div className="border border-white/10 bg-[#0a0a0a] p-6">
              <h4 className="text-sm font-mono tracking-widest text-[#CCFF00] uppercase mb-1">
                {language === 'en' ? 'CHANGE YOUR PASSWORD' : 'تحديث كلمة المرور الخاصة بك'}
              </h4>
              <p className="text-[10px] text-white/50 font-mono mb-4 uppercase">
                {language === 'en' ? '* Maintain strong, memorable credentials to protect dispatcher portal.' : '* يرجى إدخال كلمة مرور قوية لتأمين حساب المنسق لعمليات وجدولة المهام.'}
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
                  const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;
                  
                  if (!newPassword) {
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    return;
                  }

                  if (currentUser) {
                    updateUserPassword(currentUser.id, newPassword);
                    form.reset();
                  }
                }}
                className="space-y-4 text-xs font-sans"
              >
                <div>
                  <label className="block text-white/50 font-mono mb-1">{language === 'en' ? 'New Password' : 'كلمة المرور الجديدة'}</label>
                  <input
                    type="password"
                    name="newPassword"
                    required
                    placeholder="••••••••"
                    className="w-full bg-black border border-white/20 focus:border-[#CCFF00] text-white px-3 py-2 rounded-none focus:outline-none focus:ring-1 focus:ring-[#CCFF00]"
                  />
                </div>
                <div>
                  <label className="block text-white/50 font-mono mb-1">{language === 'en' ? 'Confirm New Password' : 'تأكيد كلمة المرور الجديدة'}</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    className="w-full bg-black border border-white/20 focus:border-[#CCFF00] text-white px-3 py-2 rounded-none focus:outline-none focus:ring-1 focus:ring-[#CCFF00]"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-[#CCFF00] text-black hover:bg-black hover:text-[#CCFF00] border-2 border-[#CCFF00] font-mono font-bold tracking-wider text-[11px] px-6 py-2.5 uppercase cursor-pointer"
                  >
                    {language === 'en' ? 'Update Password' : 'تغيير كلمة المرور'}
                  </button>
                </div>
              </form>
            </div>

            {/* Admin tool for managing other user passwords */}
            {currentUser?.role === 'admin' && (
              <div className="border border-white/10 bg-[#0a0a0a] p-6">
                <h4 className="text-sm font-mono tracking-widest text-[#CCFF00] uppercase mb-1">
                  {language === 'en' ? 'RESET ANY USER PASSWORD (ADMIN CONTROL)' : 'إعادة تعيين كلمة مرور أي حساب (صلاحية المشرف)'}
                </h4>
                <p className="text-[10px] text-white/50 font-mono mb-4 uppercase">
                  {language === 'en' ? '* As Administrator, you can override any customer or staff credentials.' : '* كمدير للنظام، يمكنك تجاوز وإعادة تحديد كلمة المرور لأي عميل أو فني عضو في الفريق.'}
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const targetUserId = (form.elements.namedItem('targetUserId') as HTMLSelectElement).value;
                    const overriddenPassword = (form.elements.namedItem('overriddenPassword') as HTMLInputElement).value;

                    if (!targetUserId || !overriddenPassword) {
                      return;
                    }

                    updateUserPassword(targetUserId, overriddenPassword);
                    form.reset();
                  }}
                  className="space-y-4 text-xs font-sans"
                >
                  <div>
                    <label className="block text-white/50 font-mono mb-1">{language === 'en' ? 'Select Registered User' : 'اختر العميل أو المشغل'}</label>
                    <select
                      name="targetUserId"
                      required
                      className="w-full bg-black border border-white/20 focus:border-[#CCFF00] text-white px-3 py-2 rounded-none focus:outline-none focus:ring-1 focus:ring-[#CCFF00] font-mono"
                    >
                      <option value="">{language === 'en' ? '--- Choose User ---' : '--- اختر حساب المستخدم ---'}</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email}) - {u.role.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/50 font-mono mb-1">{language === 'en' ? 'New Target Password' : 'كلمة المرور المستهدفة الجديدة'}</label>
                    <input
                      type="password"
                      name="overriddenPassword"
                      required
                      placeholder={language === 'en' ? 'Enter override password...' : 'أدخل كلمة المرور الجديدة...'}
                      className="w-full bg-black border border-white/20 focus:border-[#CCFF00] text-white px-3 py-2 rounded-none focus:outline-none focus:ring-1 focus:ring-[#CCFF00]"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="bg-black text-[#CCFF00] border border-[#CCFF00]/50 hover:border-[#CCFF00] hover:bg-[#CCFF00] hover:text-black font-mono font-bold tracking-wider text-[11px] px-6 py-2.5 uppercase cursor-pointer transition-all"
                    >
                      {language === 'en' ? 'Reset User Password' : 'تأكيد تعيين كلمة المرور للمستخدم'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ========================================= */}
      {/* DETAILED BOOKING INSPECT CARD OVERLAY */}
      {/* ========================================= */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl border-2 border-[#CCFF00] bg-black p-8 relative my-8">
            <button
              onClick={() => setSelectedBookingDetails(null)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-white hover:text-[#CCFF00] p-1.5 uppercase font-mono tracking-widest text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'en' ? 'CLOSE' : 'إغلاق'}</span>
              <ServiceIcon name="X" className="w-4 h-4" />
            </button>

            {/* Custom corners */}
            <div className="absolute -top-[2px] -left-[2px] w-3 h-3 bg-[#CCFF00]"></div>
            <div className="absolute -bottom-[2px] -right-[2px] w-3 h-3 bg-[#CCFF00]"></div>

            <div className="border-b border-[#CCFF00]/25 pb-4 mb-6 mt-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-black bg-[#CCFF00] px-1 font-bold">{selectedBookingDetails.id}</span>
                <span className="font-mono text-[9px] text-white/50 uppercase">ORDER DIAGNOSIS DETECTOR</span>
              </div>
              <h3 className="text-2xl font-sans font-black uppercase text-white tracking-tight mt-1">
                {t.adminDetailsTitle}
              </h3>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-white/10 mb-6 font-mono text-xs select-none">
              <button
                type="button"
                onClick={() => { setActiveDetailTab('details'); setShowReceiptPreview(false); }}
                className={`flex-1 py-3 text-center transition-all cursor-pointer border-b-2 tracking-widest uppercase ${
                  activeDetailTab === 'details' && !showReceiptPreview
                    ? 'border-[#CCFF00] text-[#CCFF00] font-bold font-black'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                {language === 'en' ? 'Diagnosis & Details' : 'التشخيص والتفاصيل'}
              </button>
              <button
                type="button"
                onClick={() => { setActiveDetailTab('costs'); }}
                className={`flex-1 py-3 text-center transition-all cursor-pointer border-b-2 tracking-widest uppercase ${
                  activeDetailTab === 'costs'
                    ? 'border-[#CCFF00] text-[#CCFF00] font-bold font-black'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                {language === 'en' ? 'Costs & Receipt' : 'التكاليف والفاتورة'}
              </button>
            </div>

            <div className="space-y-6">
              {activeDetailTab === 'details' ? (
                <>
                  {/* Customer details */}
                  <div className="border border-white/10 p-4">
                    <h4 className="text-[10px] font-mono tracking-widest text-[#CCFF00] uppercase mb-2">{t.customerInfo}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-white/45 block font-mono">{t.fieldName}:</span>
                        <span className="font-bold text-white font-sans">{selectedBookingDetails.userName}</span>
                      </div>
                      <div>
                        <span className="text-white/45 block font-mono">{t.fieldPhone}:</span>
                        <span className="font-mono text-white">{selectedBookingDetails.userPhone}</span>
                      </div>
                      <div>
                        <span className="text-white/45 block font-mono">{t.fieldEmail}:</span>
                        <span className="font-mono text-white">{selectedBookingDetails.userEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking params */}
                  <div className="border border-white/10 p-4">
                    <h4 className="text-[10px] font-mono tracking-widest text-[#CCFF00] uppercase mb-2">{t.bookingParams}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-white/45 block font-mono">{t.fieldService}:</span>
                        <span className="font-sans font-black text-white uppercase">{language === 'en' ? selectedBookingDetails.serviceNameEn : selectedBookingDetails.serviceNameAr}</span>
                      </div>
                      <div>
                        <span className="text-white/45 block font-mono">{t.bookingDate} / {t.bookingTime}:</span>
                        <span className="font-mono text-white">{selectedBookingDetails.date} ({selectedBookingDetails.timeSlot})</span>
                      </div>
                      <div>
                        <span className="text-white/45 block font-mono">{t.fieldUrgency}:</span>
                        <span className={`font-mono uppercase font-bold text-[#CCFF00]`}>{selectedBookingDetails.urgency}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address, descriptions */}
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="text-[10px] font-mono tracking-widest text-[#CCFF00] uppercase mb-1">{t.fieldAddress}</h4>
                      <p className="bg-white/5 p-3 font-sans font-light border border-white/5">{selectedBookingDetails.address}</p>
                    </div>

                    {/* GPS Dispatch Satellite Map Block */}
                    {selectedTelemetry && (
                      <div className="border border-white/10 p-4 rounded-2xl bg-[#0d0d0d] relative overflow-hidden select-none">
                        <div className="flex justify-between items-center mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-pulse shrink-0"></span>
                            <h5 className="font-mono text-[10px] text-[#CCFF00] uppercase tracking-wider">
                              {language === 'en' ? 'SATELLITE TRK LOCATOR' : 'نظام تعقب وتحديد الموقع لفرق الصيانة عبر الأقمار الصناعية'}
                            </h5>
                          </div>
                          <span className="font-mono text-[9px] text-white/40">
                            {language === 'en' ? 'SIGNAL: ACTIVE' : 'الإشارة: نشطة'}
                          </span>
                        </div>

                        {/* Vector Map canvas container */}
                        <div className="w-full h-44 bg-black border border-white/5 rounded-xl relative overflow-hidden flex items-center justify-center">
                          {/* Grid representation */}
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                          
                          {/* Compass reticle */}
                          <div className="absolute w-24 h-24 rounded-full border border-white/5 flex items-center justify-center animate-spin-slow">
                            <div className="w-16 h-16 rounded-full border border-dashed border-white/5"></div>
                          </div>

                          {/* Mock Roads (SVG graphic overlay representation of Riyadh layout streets) */}
                          <svg className="absolute inset-0 w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                            {/* Major curved highways */}
                            <path d="M-20 40 Q 150 120, 500 30" fill="none" stroke="#222" strokeWidth="4" />
                            <path d="M-20 40 Q 150 120, 500 30" fill="none" stroke="#CCFF00" strokeWidth="1.5" strokeOpacity="0.15" strokeDasharray="5 10" />
                            
                            <path d="M200 -20 Q 120 100, 30Q 0 220, -50 300" fill="none" stroke="#333" strokeWidth="3" />
                            <path d="M10 -50 L 450 250" fill="none" stroke="#222" strokeWidth="6" />
                            <path d="M10 -50 L 450 250" fill="none" stroke="#555" strokeWidth="1" />

                            {/* Local smaller roads */}
                            <line x1="0" y1="90" x2="500" y2="90" stroke="#1d1d1d" strokeWidth="2" />
                            <line x1="120" y1="0" x2="120" y2="250" stroke="#1d1d1d" strokeWidth="1.5" />
                            <line x1="320" y1="0" x2="320" y2="250" stroke="#1d1d1d" strokeWidth="1.5" />
                            <line x1="50" y1="180" x2="450" y2="20" stroke="#1c1c1c" strokeWidth="1.5" />
                            
                            {/* Selected localized zone circle highlighted */}
                            <circle cx={`${selectedTelemetry.pinX}%`} cy={`${selectedTelemetry.pinY}%`} r="32" fill="#CCFF00" fillOpacity="0.03" stroke="#CCFF00" strokeWidth="1" strokeDasharray="2 4" strokeOpacity="0.3" />
                          </svg>

                          {/* Dynamic pinpoint marker centered with deterministically hashed offset */}
                          <div 
                            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                            style={{ left: `${selectedTelemetry.pinX}%`, top: `${selectedTelemetry.pinY}%` }}
                          >
                            {/* Pulsing visual locator radar wave */}
                            <div className="absolute w-12 h-12 -mt-1 rounded-full bg-[#CCFF00]/25 animate-ping opacity-75"></div>
                            
                            {/* Precise pin point inner dot */}
                            <div className="w-4 h-4 rounded-full bg-black border-2 border-[#CCFF00] flex items-center justify-center shadow-lg relative z-20">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]"></div>
                            </div>

                            {/* Drop shadow pin cone */}
                            <div className="w-1 h-3 bg-gradient-to-b from-[#CCFF00] to-transparent shrink-0 opacity-80 -mt-1"></div>
                          </div>

                          {/* Latitude & Longitude HUD tag */}
                          <span className="absolute bottom-2 left-2.5 ltr:block rtl:hidden bg-black/85 text-white/50 border border-white/10 px-2 py-0.5 font-mono text-[9px] tracking-tight rounded-sm">
                            GPS {selectedTelemetry.latDec}° N, {selectedTelemetry.lngDec}° E
                          </span>
                          <span className="absolute bottom-2 right-2.5 rtl:block ltr:hidden bg-black/85 text-white/50 border border-white/10 px-2 py-0.5 font-mono text-[9px] tracking-tight rounded-sm">
                            GPS {selectedTelemetry.latDec}° N, {selectedTelemetry.lngDec}° E
                          </span>

                          {/* Zone identifier tag */}
                          <span className="absolute bottom-2 right-2.5 ltr:block rtl:hidden bg-[#CCFF00] text-black font-mono font-extrabold text-[9px] px-2 py-0.5 uppercase tracking-wide rounded-sm">
                            {language === 'en' ? `ZONE: RIYADH_0${selectedTelemetry.zoneId}` : `المنطقة: الرياض_0${selectedTelemetry.zoneId}`}
                          </span>
                          <span className="absolute bottom-2 left-2.5 rtl:block ltr:hidden bg-[#CCFF00] text-black font-mono font-extrabold text-[9px] px-2 py-0.5 uppercase tracking-wide rounded-sm">
                            {language === 'en' ? `ZONE: RIYADH_0${selectedTelemetry.zoneId}` : `المنطقة: الرياض_0${selectedTelemetry.zoneId}`}
                          </span>

                          {/* Live HUD lock tag */}
                          <div className="absolute top-2 left-2.5 ltr:block rtl:hidden font-mono text-[8.5px] bg-white/5 text-[#CCFF00] px-1.5 py-0.5 border border-[#CCFF00]/20 rounded-xs">
                            LOCK [S-{selectedBookingDetails.id.toUpperCase()}]
                          </div>
                          <div className="absolute top-2 right-2.5 rtl:block ltr:hidden font-mono text-[8.5px] bg-white/5 text-[#CCFF00] px-1.5 py-0.5 border border-[#CCFF00]/20 rounded-xs">
                            LOCK [S-{selectedBookingDetails.id.toUpperCase()}]
                          </div>
                        </div>

                        {/* Geolocation info strip */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono text-white/50 border-t border-white/5 pt-3">
                          <div>
                            <span className="block text-[9px] text-white/35 uppercase">{language === 'en' ? 'EST. VEHICLE DISPATCH' : 'الوقت التقريبي للفني'}</span>
                            <span className="text-[#CCFF00] font-bold text-sm tracking-tight">{selectedTelemetry.estTime} {language === 'en' ? 'MINS' : 'دقيقة'}</span>
                          </div>
                          <div className="text-right rtl:text-left flex items-center justify-end">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=Riyadh+${encodeURIComponent(selectedBookingDetails.address)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[#CCFF00] hover:underline hover:text-white transition-opacity uppercase font-bold text-[10px]"
                            >
                              <span>{language === 'en' ? 'OPEN GEO NAV' : 'تحديد الموقع على الخريطة'}</span>
                              &rarr;
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-[10px] font-mono tracking-widest text-[#CCFF00] uppercase mb-1">{t.fieldDescription}</h4>
                      <p className="bg-white/5 p-3 font-sans font-light border border-white/5 whitespace-pre-line text-white/95 leading-relaxed">
                        {selectedBookingDetails.description}
                      </p>
                    </div>

                    {/* Uploded photos */}
                    {selectedBookingDetails.photos && selectedBookingDetails.photos.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-mono tracking-widest text-[#CCFF00] uppercase mb-2">{t.bookingPhotos}</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {selectedBookingDetails.photos.map((ph, index) => (
                            <div key={index} className="aspect-square border border-white/15 overflow-hidden">
                              <img
                                src={ph}
                                alt="Diagnostic report upload"
                                className="w-full h-full object-cover select-none"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Predefined Booking Fee */}
                    {selectedBookingDetails.bookingFee !== undefined && (
                      <div className="bg-white/5 p-3 border border-white/10 font-mono text-xs inline-flex items-center gap-2">
                        <span className="text-white/50">{t.bookingFeeLabel}:</span>
                        <span className="text-[#CCFF00] font-extrabold">{selectedBookingDetails.bookingFee} {t.bookingFeeCurrency}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Cost Entry & Receipt Generator Tab */
                <div className="space-y-6">
                  {/* Cost items table */}
                  <div>
                    <h4 className="text-xs font-mono tracking-widest text-[#CCFF00] uppercase mb-3">
                      {language === 'en' ? 'JOB ITEMIZED EXPENSES *' : 'التكاليف التفصيلية للعمل الميداني *'}
                    </h4>
                    
                    <div className="border border-white/10 bg-[#0d0d0d] p-4 text-xs font-sans">
                      {(selectedBookingDetails.costItems || []).length === 0 ? (
                        <p className="text-white/40 italic py-2 text-center">
                          {language === 'en' ? 'No extra cost items added yet. Formulate items below.' : 'لم يتم إضافة أي تكلّفة بعد. الرجاء إدخال البنود والقطع المستبدلة أدناه.'}
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left rtl:text-right border-collapse">
                            <thead>
                              <tr className="border-b border-white/10 text-[10px] uppercase font-mono text-white/50">
                                <th className="pb-2 pl-2 text-left rtl:text-right">{language === 'en' ? 'Item / Description' : 'البند / تفاصيل قطعة الغيار'}</th>
                                <th className="pb-2 text-center">{language === 'en' ? 'Qty' : 'الكمية'}</th>
                                <th className="pb-2 text-right rtl:text-left">{language === 'en' ? 'Unit Price' : 'سعر الوحدة'}</th>
                                <th className="pb-2 text-right rtl:text-left pr-2">{language === 'en' ? 'Total' : 'إجمالي البند'}</th>
                                {!isStaff && <th className="pb-2 text-center">{language === 'en' ? 'Actions' : 'إجراء'}</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-sans">
                              {(selectedBookingDetails.costItems || []).map((item) => (
                                <tr key={item.id} className="text-white/90">
                                  <td className="py-2.5 pl-2 font-medium text-left rtl:text-right">
                                    {editingItemId === item.id ? (
                                      <input
                                        type="text"
                                        value={editingItemDesc}
                                        onChange={(e) => setEditingItemDesc(e.target.value)}
                                        className="bg-black border border-white/20 px-2 py-1 text-xs w-full text-white rounded-none focus:outline-none focus:border-[#CCFF00]"
                                      />
                                    ) : (
                                      item.description
                                    )}
                                  </td>
                                  <td className="py-2.5 text-center">
                                    {editingItemId === item.id ? (
                                      <input
                                        type="number"
                                        min="1"
                                        value={editingItemQty}
                                        onChange={(e) => setEditingItemQty(parseInt(e.target.value) || 1)}
                                        className="bg-black border border-white/20 px-2 py-1 text-xs w-16 text-center text-white rounded-none focus:outline-none focus:border-[#CCFF00]"
                                      />
                                    ) : (
                                      item.quantity
                                    )}
                                  </td>
                                  <td className="py-2.5 text-right rtl:text-left font-mono">
                                    {editingItemId === item.id ? (
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editingItemPrice}
                                        onChange={(e) => setEditingItemPrice(parseFloat(e.target.value) || 0)}
                                        className="bg-black border border-white/20 px-2 py-1 text-xs w-20 text-right text-white rounded-none focus:outline-none focus:border-[#CCFF00]"
                                      />
                                    ) : (
                                      `${item.unitPrice.toFixed(2)} SAR`
                                    )}
                                  </td>
                                  <td className="py-2.5 text-right rtl:text-left font-mono font-bold text-[#CCFF00] pr-2">
                                    {editingItemId === item.id ? (
                                      `${(editingItemQty * editingItemPrice).toFixed(2)} SAR`
                                    ) : (
                                      `${(item.quantity * item.unitPrice).toFixed(2)} SAR`
                                    )}
                                  </td>
                                  {!isStaff && (
                                    <td className="py-2.5 text-center">
                                      <div className="flex justify-center gap-2">
                                        {editingItemId === item.id ? (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => handleSaveEditCostItem(item.id)}
                                              className="text-[10px] bg-[#CCFF00] text-black px-2 py-1 font-mono hover:bg-white transition-colors cursor-pointer"
                                            >
                                              {language === 'en' ? 'SAVE' : 'حفظ'}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setEditingItemId(null)}
                                              className="text-[10px] border border-white/20 text-white/60 px-2 py-1 font-mono hover:text-white transition-colors cursor-pointer"
                                            >
                                              {language === 'en' ? 'CANCEL' : 'إلغاء'}
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => handleStartEditCostItem(item)}
                                              className="text-white hover:text-[#CCFF00] transition-colors p-1"
                                              title="Edit Item"
                                            >
                                              ✏️
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteCostItem(item.id)}
                                              className="text-white hover:text-red-500 transition-colors p-1"
                                              title="Delete Item"
                                            >
                                              🗑️
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add expense items form block */}
                  {!isStaff && editingItemId === null && (
                    <form onSubmit={handleAddCostItem} className="border border-white/5 p-4 bg-white/[0.02]">
                      <h5 className="text-[10px] font-mono tracking-widest text-[#CCFF00] uppercase mb-3">
                        {language === 'en' ? 'ADD NEW EXPENSE LINE' : 'إضافة بند تكلفة للمصاريف الإضافية'}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                        <div className="sm:col-span-6">
                          <label className="block text-white/50 font-mono mb-1">{language === 'en' ? 'Item Name / Description' : 'اسم البند / الوصف الفني للقطعة'}</label>
                          <input
                            type="text"
                            required
                            placeholder={language === 'en' ? 'e.g., Copper valve, PVC Joint pipe' : 'مثال: صمام نحاسي، مفصل تمديد بلاستيك'}
                            value={newItemDesc}
                            onChange={(e) => setNewItemDesc(e.target.value)}
                            className="w-full bg-black border border-white/20 focus:border-[#CCFF00] text-white px-3 py-2 rounded-none focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-white/50 font-mono mb-1">{language === 'en' ? 'Qty' : 'الكمية'}</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={newItemQty}
                            onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                            className="w-full bg-black border border-white/20 focus:border-[#CCFF00] text-white px-3 py-2 text-center font-mono rounded-none focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <label className="block text-white/50 font-mono mb-1">{language === 'en' ? 'Unit Price (SAR)' : 'سعر الوحدة (درهم/ريال)'}</label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={newItemPrice}
                            onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                            className="w-full bg-black border border-white/20 focus:border-[#CCFF00] text-white px-3 py-2 text-right font-mono rounded-none focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="submit"
                          className="bg-[#CCFF00] text-black hover:bg-black hover:text-[#CCFF00] border-2 border-[#CCFF00] font-mono font-bold tracking-wider text-[10px] px-4 py-2 uppercase cursor-pointer"
                        >
                          {language === 'en' ? '+ ADD COST ITEM' : '+ إضافة بند المصاريف'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Internal remarks field */}
                  <div>
                    <h4 className="text-xs font-mono tracking-widest text-[#CCFF00] uppercase mb-1.5">
                      {language === 'en' ? 'INTERNAL DISPATCH REMARKS' : 'ملاحظات وتوجيهات التنسيق الفنية الداخلية'}
                    </h4>
                    <p className="text-[9.5px] text-white/40 font-mono mb-2 uppercase select-none">
                      {language === 'en' ? '* NOTE: Internal comments are only shown to dispatchers and are strictly EXCLUDED from consumer receipts.' : '* تنبيه: سجلات التنسيق اختيارية للاستخدام الإداري البحت ولن تظهر في الفاتورة الممنوحة للعميل.'}
                    </p>
                    <textarea
                      rows={3}
                      value={internalNotesVal}
                      onChange={(e) => handleSaveInternalNotes(e.target.value)}
                      disabled={isStaff}
                      placeholder={isStaff 
                        ? (language === 'en' ? 'No internal notes recorded by Admin.' : 'لا توجد ملاحظات داخلية من مسؤول التنسيق.')
                        : (language === 'en' ? 'e.g., Awaiting supplier valve delivery, tools fully checked, dispatch team ready.' : 'مثال: تم إبلاغ الفني بضرورة إحضار سلم طويل، جاري استبدال المواد من المورد الخارجي')}
                      className={`w-full bg-black border border-white/20 focus:border-[#CCFF00] text-white text-xs px-3 py-2 font-sans focus:outline-none transition-colors rounded-none ${isStaff ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  {/* Summary & Branded print button box */}
                  <div className="border border-white/10 p-5 bg-[#050505] flex flex-col md:flex-row justify-between items-start md:items-stretch gap-6">
                    <div className="flex-1 space-y-2 text-xs font-mono">
                      <div className="flex justify-between border-b border-white/5 pb-1 text-white/60">
                        <span>{language === 'en' ? 'SUBTOTAL EXPENSES:' : 'مجموع نفقات قطع الغيار:'}</span>
                        <span className="text-white font-bold">
                          {((selectedBookingDetails.costItems || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)).toFixed(2)} SAR
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1 text-white/60">
                        <span>{language === 'en' ? 'BOOKING SERVICE FEE:' : 'أجور الخدمة المسبقة للموقع:'}</span>
                        <span className="text-white font-bold">
                          {((selectedBookingDetails.bookingFee || 0)).toFixed(2)} SAR
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 text-sm text-[#CCFF00] font-extrabold bg-[#CCFF00]/5 px-2 py-1.5 border border-[#CCFF00]/25">
                        <span>{language === 'en' ? 'GRAND TOTAL:' : 'المجموع الإجمالي المطلوب:'}</span>
                        <span>
                          {(((selectedBookingDetails.costItems || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)) + (selectedBookingDetails.bookingFee || 0)).toFixed(2)} SAR
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center items-stretch md:w-56 gap-2.5">
                      <div className="flex items-center gap-2 justify-between">
                        <span className="text-[10px] font-mono text-white/50">{language === 'en' ? 'Print Language:' : 'لغة الطباعة / الفاتورة:'}</span>
                        <select
                          value={receiptLanguage}
                          onChange={(e) => setReceiptLanguage(e.target.value as 'en' | 'ar')}
                          className="bg-black border border-white/20 text-white font-mono text-[10.5px] px-2 py-1 focus:outline-none focus:border-[#CCFF00]"
                        >
                          <option value="en">English</option>
                          <option value="ar">العربية</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowReceiptPreview(true)}
                        className="w-full bg-white hover:bg-[#CCFF00] text-black transition-colors py-3 font-mono font-black tracking-wider text-xs uppercase cursor-pointer text-center"
                      >
                        📄 {language === 'en' ? 'GENERATE RECEIPT' : 'إصدار الفاتورة الرسمية'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Update Options (Mandatory dispatcher dashboard override) */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <span className="font-mono text-[10px] text-[#CCFF00] tracking-widest uppercase block">{t.adminActionsHeader}</span>
                
                <div className="flex flex-wrap gap-2 select-none">
                  {['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map((st) => {
                    const isActive = selectedBookingDetails.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedBookingDetails.id, st as BookingStatus)}
                        className={`font-mono text-[10.5px] px-3.5 py-2 uppercase border tracking-wider transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#CCFF00] text-black border-[#CCFF00] font-black'
                            : 'bg-black text-white/60 border-white/10 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* BRANDED RECEIPTS PORTAL & PRINT PREVIEW */}
      {/* ========================================= */}
      {showReceiptPreview && selectedBookingDetails && (
        <div className="fixed inset-0 bg-black/98 flex flex-col justify-start items-center p-4 overflow-y-auto z-[60] backdrop-blur-md">
          {/* Controls banner */}
          <div className="w-full max-w-xl bg-neutral-900 border border-white/10 p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none print:hidden">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-xs text-white/80">
                {receiptLanguage === 'en' 
                  ? 'OFFICIAL BILLING RECEIPT PREVIEW (ACTIVE)' 
                  : 'معاينة الفاتورة الرسمية الصادرة (نشط)'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="bg-[#CCFF00] hover:bg-white text-black text-xs font-mono font-black px-4 py-2 uppercase tracking-wide cursor-pointer transition-colors"
              >
                🖨️ {receiptLanguage === 'en' ? 'PRINT / SAVE AS PDF' : 'طباعة / حفظ كـ PDF'}
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptPreview(false)}
                className="border border-white/20 hover:border-white text-white/85 hover:text-white text-xs font-mono px-3 py-2 uppercase tracking-wide cursor-pointer transition-colors"
              >
                {receiptLanguage === 'en' ? 'BACK' : 'رجوع'}
              </button>
            </div>
          </div>

          {/* Printable container sheet */}
          <div 
            id="printable-receipt-card"
            className="w-full max-w-xl bg-white text-black p-8 sm:p-12 shadow-2xl relative select-text border border-neutral-200 print:border-none print:p-0"
            dir={receiptLanguage === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Stamp Logo Emblem */}
            <div className="flex flex-col items-center text-center pb-6 border-b-2 border-dashed border-gray-300">
              {/* Monochromatic Shield Emblem Logo */}
              <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center font-mono font-black text-lg tracking-widest bg-gray-50 mb-2">
                DS
              </div>
              <h1 className="text-lg font-sans font-black uppercase tracking-wider text-black">
                {receiptLanguage === 'en' ? 'DOUBLE SHIELD EMERGENCY SERVICES' : 'الدرع المزدوج لخدمات الطوارئ والصيانة'}
              </h1>
              <p className="text-[10.5px] font-mono text-gray-500 uppercase tracking-tight mt-1">
                {receiptLanguage === 'en' 
                  ? 'Riyadh, KSA • CR: 101089274 • dispatch@double-shield.sa' 
                  : 'المملكة العربية السعودية، الرياض • سجل تجاري: 101089274 • البريد: dispatch@double-shield.sa'}
              </p>
              <p className="text-[10.5px] font-mono text-gray-500 tracking-tight">
                {receiptLanguage === 'en' ? 'Hotline Support: +966 50 123 4567' : 'الرقم الموحد الميداني: 966501234567+'}
              </p>
            </div>

            {/* Receipt Identification Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-gray-100 text-xs text-left rtl:text-right">
              <div>
                <span className="text-gray-400 block font-mono text-[10px] uppercase">
                  {receiptLanguage === 'en' ? 'Booking Reference' : 'رقم حجز الخدمة'}
                </span>
                <span className="font-mono font-bold text-gray-900 bg-gray-100 px-1 py-0.5 rounded-sm">
                  #{selectedBookingDetails.id}
                </span>
              </div>
              <div className="text-right rtl:text-left">
                <span className="text-gray-400 block font-mono text-[10px] uppercase">
                  {receiptLanguage === 'en' ? 'Date Issued' : 'تاريخ الإصدار'}
                </span>
                <span className="font-mono text-gray-800">{selectedBookingDetails.date}</span>
              </div>
            </div>

            {/* Customer Details info block */}
            <div className="py-4 border-b border-gray-100 text-xs text-left rtl:text-right">
              <h3 className="font-mono font-bold uppercase text-[10px] text-gray-400 mb-2">
                {receiptLanguage === 'en' ? 'CUSTOMER & SITE INFORMATION' : 'بيانات العميل وعنوان الموقع الميداني'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 block font-mono text-[9px] uppercase">{receiptLanguage === 'en' ? 'Client Name:' : 'اسم العميل:'}</span>
                  <span className="font-bold text-gray-900 font-sans">{selectedBookingDetails.userName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-mono text-[9px] uppercase">{receiptLanguage === 'en' ? 'Phone Number:' : 'رقم الجوال:'}</span>
                  <span className="font-mono font-bold text-gray-900">{selectedBookingDetails.userPhone}</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-gray-400 block font-mono text-[9px] uppercase">{receiptLanguage === 'en' ? 'Service Location Address:' : 'عنوان موقع الإصلاح الميداني:'}</span>
                <span className="text-gray-800 font-sans font-light">{selectedBookingDetails.address}</span>
              </div>
            </div>

            {/* Services info block */}
            <div className="py-4 border-b border-gray-100 text-xs text-left rtl:text-right">
              <h3 className="font-mono font-bold uppercase text-[10px] text-gray-400 mb-2">
                {receiptLanguage === 'en' ? 'DISPATCHED SERVICE CATEGORY' : 'تصنيف وترخيص الخدمة الميدانية'}
              </h3>
              <div>
                <span className="text-gray-400 block font-mono text-[9px] uppercase">{receiptLanguage === 'en' ? 'Primary Service:' : 'الخدمة الأساسية:'}</span>
                <span className="font-mono font-black uppercase text-gray-900">
                  {receiptLanguage === 'en' ? selectedBookingDetails.serviceNameEn : selectedBookingDetails.serviceNameAr}
                </span>
              </div>
            </div>

            {/* Itemized expenses table */}
            <div className="py-4 text-xs">
              <h3 className="font-mono font-bold uppercase text-[10px] text-gray-400 mb-3 text-left rtl:text-right">
                {receiptLanguage === 'en' ? 'ITEMIZED EXPENSES SUMMARY' : 'ملخص تكاليف قطع الغيار والعمالة'}
              </h3>
              
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-[10px] font-mono text-gray-400 uppercase">
                    <th className="pb-2 text-left rtl:text-right">{receiptLanguage === 'en' ? 'Item / Description' : 'البند / تفاصيل قطعة الغيار'}</th>
                    <th className="pb-2 text-center w-12">{receiptLanguage === 'en' ? 'Qty' : 'الكمية'}</th>
                    <th className="pb-2 text-right rtl:text-left w-24">{receiptLanguage === 'en' ? 'Unit Price' : 'سعر الوحدة'}</th>
                    <th className="pb-2 text-right rtl:text-left w-24 pr-1">{receiptLanguage === 'en' ? 'Total' : 'الإجمالي'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans text-gray-800">
                  {/* Expense line items */}
                  {(selectedBookingDetails.costItems || []).map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 text-left rtl:text-right font-medium">{item.description}</td>
                      <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 text-right rtl:text-left font-mono">{item.unitPrice.toFixed(2)} SAR</td>
                      <td className="py-2.5 text-right rtl:text-left font-mono font-bold text-gray-900 pr-1">{(item.quantity * item.unitPrice).toFixed(2)} SAR</td>
                    </tr>
                  ))}
                  
                  {/* Fallback if list is empty */}
                  {(selectedBookingDetails.costItems || []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-400 italic font-light">
                        {receiptLanguage === 'en' ? 'No extra material expenses claimed.' : 'لا يوجد تفاصيل تكاليف إضافية مسجلة.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Receipt Summary Totals Box */}
            <div className="mt-4 pt-4 border-t-2 border-gray-200 text-xs font-mono space-y-1.5 text-left rtl:text-right">
              <div className="flex justify-between text-gray-500">
                <span>{receiptLanguage === 'en' ? 'Parts & Materials Subtotal:' : 'مجموع قطع الغيار والمواد:'}</span>
                <span>
                  {((selectedBookingDetails.costItems || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)).toFixed(2)} SAR
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>{receiptLanguage === 'en' ? 'Base Call-out & Labor Fee:' : 'رسوم الكشفية وإجرائية العمالة المباشرة:'}</span>
                <span>
                  {((selectedBookingDetails.bookingFee || 0)).toFixed(2)} SAR
                </span>
              </div>
              
              {/* Grand Total prominent box */}
              <div className="flex justify-between items-center bg-gray-900 text-[#CCFF00] p-4 border border-black mt-4">
                <span className="font-sans font-black text-xs uppercase tracking-wider">
                  {receiptLanguage === 'en' ? 'GRAND TOTAL DUE:' : 'صافي المبلغ الإجمالي المستحق:'}
                </span>
                <span className="font-mono text-lg font-black tracking-tight">
                  {(((selectedBookingDetails.costItems || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)) + (selectedBookingDetails.bookingFee || 0)).toFixed(2)} SAR
                </span>
              </div>
            </div>

            {/* Professional footer note */}
            <div className="mt-10 pt-6 border-t border-dashed border-gray-300 text-center select-none text-gray-400 font-mono text-[9px] tracking-tight uppercase">
              <p className="font-bold text-gray-700 text-center text-center">
                {receiptLanguage === 'en' ? 'Thank you for choosing Double Shield!' : 'نشكركم لثقتكم باختيار مؤسسة الدرع المزدوج!'}
              </p>
              <p className="mt-1 text-center text-center">
                {receiptLanguage === 'en' 
                  ? 'This receipt is electronically matched to the service order. All maintenance warrantied for 30 days.' 
                  : 'تم توليد هذه المستندات آلياً ومطابقتها لأمر العمل الميداني. جميع أعمال الصيانة مضمونة لمدة 30 يوماً.'}
              </p>
              <p className="mt-2 text-[8px] opacity-75 text-center text-center">
                GENERATED BY DOUBLE-SHIELD CORE TELEMETRY PORTAL v2.1
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* SERVICE RATE MODIFIER DIALOG */}
      {/* ========================================= */}
      {selectedServiceForFee && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-sm border-2 border-[#CCFF00] bg-black p-8 relative">
            <button
              onClick={() => setSelectedServiceForFee(null)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-white hover:text-[#CCFF00] p-1 uppercase font-mono tracking-widest text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'en' ? 'CLOSE' : 'إغلاق'}</span>
              <ServiceIcon name="X" className="w-4 h-4" />
            </button>

            {/* Custom corners */}
            <div className="absolute -top-[2px] -left-[2px] w-3 h-3 bg-[#CCFF00]"></div>
            <div className="absolute -bottom-[2px] -right-[2px] w-3 h-3 bg-[#CCFF00]"></div>

            <div className="border-b border-[#CCFF00]/25 pb-4 mb-6 mt-4">
              <span className="font-mono text-[10px] text-[#CCFF00] uppercase tracking-widest">RATE CONTROLLER MANUAL</span>
              <h3 className="text-xl font-sans font-black uppercase text-white tracking-tight mt-1">
                {t.modalUpdateFeeTitle}
              </h3>
            </div>

            <form onSubmit={handleSaveFee} className="space-y-6">
              
              <div>
                <label className="block text-xs font-mono tracking-widest uppercase mb-2 text-[#CCFF00]">
                  {language === 'en' ? 'Selected Service' : 'الخدمة المختارة'}
                </label>
                <div className="bg-white/5 p-3 border border-white/10 flex items-center gap-2 text-xs">
                  <span className="text-[#CCFF00]">
                    <ServiceIcon name={selectedServiceForFee.icon} className="w-5 h-5" />
                  </span>
                  <span className="font-sans font-black text-white uppercase select-none">
                    {language === 'en' ? selectedServiceForFee.nameEn : selectedServiceForFee.nameAr}
                  </span>
                </div>
              </div>

              {/* Fee Input */}
              <div>
                <label className="block text-xs font-mono tracking-widest uppercase mb-2 text-[#CCFF00]">
                  {t.newFeeLabel} *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={newFeeValue}
                  onChange={(e) => setNewFeeValue(parseInt(e.target.value) || 0)}
                  className="w-full bg-black border border-white/20 focus:border-[#CCFF00] text-white px-4 py-3 text-sm rounded-none tracking-wide focus:outline-none focus:ring-0 transition-all font-mono"
                />
                {feeError && (
                  <p className="text-xs text-red-500 font-sans mt-2 font-bold">{feeError}</p>
                )}
              </div>

              {/* Save buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedServiceForFee(null)}
                  className="flex-1 border-2 border-white/25 hover:border-white text-white font-mono text-xs tracking-wider py-3 uppercase cursor-pointer"
                >
                  {language === 'en' ? 'ABORT' : 'إلغاء'}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#CCFF00] border-2 border-[#CCFF00] text-black hover:bg-black hover:text-[#CCFF00] font-mono text-xs tracking-wider py-3 font-bold uppercase cursor-pointer"
                >
                  {t.btnSaveFee}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-[#CCFF00]/10 bg-black p-4 text-center mt-12">
        <p className="font-mono text-[10px] text-white/40 tracking-wider">
          © {new Date().getFullYear()} {t.appName} EXECUTIVE CORE. BILINGUAL SCHEDULING DISPATCH HUB.
        </p>
      </footer>
    </div>
  );
};
export default AdminDashboard;
