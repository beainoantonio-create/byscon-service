import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import db from '../lib/db';
import { Booking, Service } from '../types';
import { Navbar } from '../components/Navbar';
import { BackgroundVectors } from '../components/BackgroundVectors';
import { ServiceIcon } from '../components/ServiceIcon';
import { 
  ShieldAlert, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Check, 
  X, 
  DollarSign, 
  Power,
  Search,
  BookOpen
} from 'lucide-react';

export const Admin: React.FC = () => {
  const { user, profile } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<'assignments' | 'services'>('assignments');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('All');

  // Service Edit States
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editBookingFee, setEditBookingFee] = useState<number>(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (profile?.role !== 'admin' && user.email !== 'admin@shed.com') {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [user, profile, navigate]);

  const loadData = async () => {
    try {
      const allBookings = await db.getAllBookings();
      // Sort in reverse chronological order
      allBookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setBookings(allBookings);
      if (allBookings.length > 0 && !selectedBooking) {
        setSelectedBooking(allBookings[0]);
      }

      const allServices = await db.getServices();
      setServices(allServices);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: Booking['status']) => {
    try {
      await db.updateBookingStatus(id, newStatus);
      await loadData();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleService = async (serviceId: string) => {
    try {
      await db.toggleServiceStatus(serviceId);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEditingService = (srv: Service) => {
    setEditingServiceId(srv.id);
    setEditBookingFee(srv.booking_fee || 0);
  };

  const handleSaveBookingFee = async (serviceId: string) => {
    try {
      await db.updateServiceBookingFee(serviceId, editBookingFee);
      setEditingServiceId(null);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(bk => {
    const matchesSearch = 
      bk.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.service_name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bk.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    return bk.status === statusFilter && matchesSearch;
  });

  const getStatusColorClass = (status: Booking['status']) => {
    switch (status) {
      case 'Pending':
        return 'text-amber-700 border-amber-200 bg-amber-50';
      case 'Confirmed':
        return 'text-blue-700 border-blue-200 bg-blue-50';
      case 'Completed':
        return 'text-[#C63300] border-[#C63300]/20 bg-orange-50';
      case 'Cancelled':
        return 'text-red-700 border-red-200 bg-red-50';
      default:
        return 'text-zinc-600 border-zinc-200 bg-zinc-50';
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col relative overflow-hidden">
      <BackgroundVectors />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex-grow pb-16 w-full font-mono relative z-10">
        {/* Header Console */}
        <div className="border-b border-zinc-200 pb-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-[10px] uppercase font-bold tracking-widest mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              SOVEREIGN LEVEL COMMAND ENABLED
            </div>
            <h1 className="text-3xl font-sans font-black tracking-tighter text-black uppercase leading-none">
              {language === 'ar' ? 'لوحة التحكم الإدارية السيادية' : 'SOVEREIGN SYSTEM CONTROL HUB'}
            </h1>
            <p className="text-[10px] text-zinc-600 uppercase mt-1">
              {language === 'ar' 
                ? 'إدارة الحجوزات، تعديل قائمة رسوم الصيانة، وإلغاء/تأكيد نطاقات العمل الميداني.' 
                : 'ADMINISTRATIVE ACCESS FOR GLOBAL BOOKING DISPATCHES, FIELD COMMISSIONS, AND SERVICE MODAL FEES.'}
            </p>
          </div>

          {/* Tab Options */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-4 py-2 text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer hover:border-[#C63300] border ${
                activeTab === 'assignments' 
                  ? 'bg-[#C63300] text-white border-[#C63300]' 
                  : 'bg-white text-zinc-650 border-zinc-200 hover:text-black hover:border-zinc-400'
              }`}
            >
              BOOKINGS ARCHIVE ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer hover:border-[#C63300] border ${
                activeTab === 'services' 
                  ? 'bg-[#C63300] text-white border-[#C63300]' 
                  : 'bg-white text-zinc-650 border-zinc-200 hover:text-black hover:border-zinc-400'
              }`}
            >
              FEE CONTROL ENGINE ({services.length})
            </button>
          </div>
        </div>

        {/* TAB 1 - BOOKINGS ARCHIVE */}
        {activeTab === 'assignments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Filter & Lists */}
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by ID, client, or address..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 hover:border-[#C63300] focus:border-[#C63300] text-black text-xs focus:outline-none placeholder-zinc-400 uppercase"
                  />
                </div>

                {/* Filter list */}
                <div className="flex flex-wrap gap-1.5">
                  {(['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`text-[9px] font-bold px-2.5 py-1 uppercase border tracking-wider transition-all cursor-pointer ${
                        statusFilter === f 
                          ? 'bg-[#C63300] text-white border-[#C63300]' 
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorted Bookings List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 uppercase text-xs border border-zinc-200 bg-zinc-50">
                    No matching assignments located.
                  </div>
                ) : (
                  filteredBookings.map(bk => (
                    <div
                      key={bk.id}
                      onClick={() => setSelectedBooking(bk)}
                      className={`p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedBooking?.id === bk.id
                          ? 'bg-zinc-50 border-[#C63300]'
                          : 'bg-white border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-black uppercase truncate max-w-[120px]">
                              {bk.user_name}
                            </span>
                            <span className="text-[9px] text-zinc-500">({bk.id})</span>
                          </div>
                          <h4 className="font-sans text-xs font-bold text-zinc-700 uppercase leading-none mt-1">
                            {language === 'ar' ? bk.service_name_ar : bk.service_name_en}
                          </h4>
                          <span className="font-mono text-[8px] text-zinc-500 bg-zinc-50 border border-zinc-150 px-1.5 py-0.5 mt-1.5 inline-block uppercase tracking-wide">
                            {bk.category_id === 'home_maintenance' ? t('homeMaintenance') : t('profConsultations')}
                          </span>
                        </div>

                        <span className={`text-[8px] border px-2 py-0.5 font-bold uppercase ${getStatusColorClass(bk.status)}`}>
                          {bk.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-zinc-500 pt-2 border-t border-zinc-150 mt-2">
                        <span>{bk.date}</span>
                        <span className="text-[#C63300] uppercase font-bold">{bk.urgency}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Detailed selection view */}
            <div className="lg:col-span-2">
              {selectedBooking ? (
                <div className="border border-zinc-200 bg-white p-6 sm:p-8 font-mono relative shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-6 border-b border-zinc-150">
                    <div>
                      <span className="text-[10px] text-[#C63300] tracking-wider block uppercase mb-1.5 font-bold">
                        OPERATOR COMMAND ENTRY DETAIL
                      </span>
                      <h3 className="font-sans text-xl sm:text-2xl font-black text-black uppercase leading-tight">
                        {language === 'ar' ? selectedBooking.service_name_ar : selectedBooking.service_name_en}
                      </h3>
                      <p className="font-mono text-[9px] text-zinc-605 uppercase leading-none mt-1">
                        {selectedBooking.category_id === 'home_maintenance' ? t('homeMaintenance') : t('profConsultations')}
                      </p>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-1.5 font-bold uppercase shrink-0">
                      <span className={`text-xs border px-3 py-1 font-black leading-none uppercase tracking-widest ${getStatusColorClass(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        UID: {selectedBooking.user_id}
                      </span>
                    </div>
                  </div>

                  {/* Core specs table layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-xs border-b border-zinc-150 pb-8">
                    <div className="space-y-4">
                      <div className="flex items-start gap-2.5">
                        <User className="w-4 h-4 text-[#C63300] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-zinc-550 uppercase block font-bold">OPERATOR CLIENT</span>
                          <span className="text-black font-bold">{selectedBooking.user_name}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <Calendar className="w-4 h-4 text-[#C63300] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-zinc-550 uppercase block font-bold">{t('preferredDate')}</span>
                          <span className="text-black font-bold">{selectedBooking.date}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-[#C63300] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-zinc-550 uppercase block font-bold">{t('preferredTime')}</span>
                          <span className="text-black uppercase font-bold">{selectedBooking.time_slot}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#C63300] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-zinc-550 uppercase block font-bold">DEPLOYMENT LOCATION</span>
                          <span className="text-black font-bold leading-relaxed break-all">{selectedBooking.address}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <DollarSign className="w-4 h-4 text-[#C63300] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-zinc-550 uppercase block font-bold">{t('flatBookingFee')}</span>
                          {selectedBooking.booking_fee ? (
                            <span className="text-[#C63300] font-black">${selectedBooking.booking_fee} (FEE CHARGED)</span>
                          ) : (
                            <span className="text-blue-700 font-bold uppercase">VARIABLE / FREE DISPATCH</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description details item */}
                  <div className="space-y-4 mb-8">
                    <h4 className="text-xs font-bold uppercase text-zinc-500">
                      OPERATOR FIELD DIRECTIVE INTEL
                    </h4>
                    <div className="p-4 bg-zinc-50 border border-zinc-200 text-xs text-zinc-805 leading-relaxed font-bold rounded-none break-words">
                      {selectedBooking.description}
                    </div>

                    {/* Photos list view */}
                    {selectedBooking.photos && selectedBooking.photos.length > 0 && (
                      <div className="mt-4">
                        <span className="text-[10px] text-zinc-550 uppercase block font-bold mb-2">Visual diagnostic scans</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedBooking.photos.map((ph, pi) => (
                            <a
                              key={pi}
                              href={ph}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-[#C63300] hover:underline bg-zinc-50 border border-zinc-200 px-2.5 py-1 hover:text-black transition-colors"
                            >
                              Scan File #{pi + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Administrative State Control Actions */}
                  <div className="border-t border-zinc-150 pt-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#C63300] mb-3">
                      OVERRIDE DEPLOYMENT STATUS STRATAGEM
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'Confirmed')}
                        className={`px-3 py-1.5 border text-xs font-bold uppercase transition-all cursor-pointer hover:border-blue-500 ${
                          selectedBooking.status === 'Confirmed' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-white text-zinc-600 border-zinc-200'
                        }`}
                      >
                        CONFIRM
                      </button>

                      <button
                        onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'Completed')}
                        className={`px-3 py-1.5 border text-xs font-bold uppercase transition-all cursor-pointer hover:border-[#C63300] ${
                          selectedBooking.status === 'Completed' 
                            ? 'bg-orange-50 text-[#C63300] border-[#C63300]/25' 
                            : 'bg-white text-zinc-600 border-zinc-200'
                        }`}
                      >
                        COMPLETE
                      </button>

                      <button
                        onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'Cancelled')}
                        className={`px-3 py-1.5 border text-xs font-bold uppercase transition-all cursor-pointer hover:border-red-500 ${
                          selectedBooking.status === 'Cancelled' 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-white text-zinc-600 border-zinc-200'
                        }`}
                      >
                        CANCEL / ABORT
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 font-mono text-zinc-500 uppercase border border-zinc-200 bg-zinc-50 shadow-sm relative z-10">
                  <BookOpen className="w-12 h-12 text-[#C63300] mx-auto mb-3" />
                  Select a registered mission from the Left Directory panel view.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2 - SYSTEM SERVICES & FEE CONTROL */}
        {activeTab === 'services' && (
          <div className="border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="border-b border-zinc-150 pb-4 mb-6">
              <h3 className="text-lg font-sans font-black text-black uppercase">
                SYSTEM CORE FEE ENGINE OVERRIDE
              </h3>
              <p className="text-xs text-zinc-600 mt-1 uppercase">
                ADJUST THE COLD RESERVATION RECRUITMENT FEES FOR HOME MAINTENANCE DEPLOYMENTS, OR DISABLE SERVICES FROM THE SERVICE ROUTINE ENGINE FOR DIRECT COLD SAVING.
              </p>
            </div>

            <div className="space-y-4">
              {services.map(sv => (
                <div 
                  key={sv.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-zinc-200 bg-white hover:border-zinc-400 transitions-colors shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-zinc-50 border border-zinc-200 text-[#C63300]">
                      <ServiceIcon id={sv.id} className="w-5 h-5" />
                    </span>
                    <div>
                      <h5 className="text-xs uppercase font-extrabold text-black">
                        {sv.name_en} / {sv.name_ar}
                      </h5>
                      <span className="text-[9px] text-zinc-600 uppercase block mt-0.5">
                        {sv.category === 'home_maintenance' ? 'Home Maintenance' : 'Professional Consultation'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-4 border-t pt-3 sm:border-0 sm:pt-0 border-zinc-200">
                    <button
                      onClick={() => handleToggleService(sv.id)}
                      className={`px-3 py-1 border text-[9px] font-bold uppercase transition-all tracking-wider flex items-center gap-1 cursor-pointer ${
                        sv.active 
                          ? 'border-[#C63300] text-[#C63300] bg-orange-50' 
                          : 'border-zinc-200 text-zinc-500 bg-zinc-50'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      {sv.active ? 'Active' : 'Inactive'}
                    </button>

                    {/* Booking fee adjustment (Home maintenance ONLY as Consultations have null/0 booking fee) */}
                    {sv.category === 'home_maintenance' ? (
                      editingServiceId === sv.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                             value={editBookingFee}
                             onChange={e => setEditBookingFee(parseInt(e.target.value, 10) || 0)}
                             className="w-14 px-2 py-1 bg-white border border-[#C63300] text-black font-mono text-xs rounded-none text-center focus:outline-none"
                             min="0"
                           />
                           <button
                             onClick={() => handleSaveBookingFee(sv.id)}
                             className="p-1 text-[#C63300] hover:text-black border border-[#C63300] text-[9px] font-bold uppercase bg-white hover:bg-[#C63300] hover:text-white cursor-pointer"
                           >
                             <Check className="w-3.5 h-3.5" />
                           </button>
                           <button
                             onClick={() => setEditingServiceId(null)}
                             className="p-1 text-red-650 hover:text-black border border-zinc-200 text-[10px] font-bold uppercase bg-white hover:bg-zinc-50 cursor-pointer"
                           >
                             <X className="w-3.5 h-3.5" />
                           </button>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] uppercase text-zinc-650">
                             Fee: <strong className="text-[#C63300] font-black">${sv.booking_fee}</strong>
                           </span>
                           <button
                             onClick={() => handleStartEditingService(sv)}
                             className="text-[9px] font-bold uppercase text-zinc-500 hover:text-[#C63300] hover:underline cursor-pointer"
                           >
                             Adjust
                           </button>
                         </div>
                       )
                     ) : (
                       <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                         Quote Driven
                       </span>
                     )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  export default Admin;
export { Admin as AdminConsole };
