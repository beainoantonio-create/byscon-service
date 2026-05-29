import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import db from '../lib/db';
import { Booking } from '../types';
import { Navbar } from '../components/Navbar';
import { BackgroundVectors } from '../components/BackgroundVectors';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Info,
  Layers,
  FileText,
  DollarSign
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadUserBookings();
  }, [user, navigate]);

  const loadUserBookings = async () => {
    if (!user) return;
    try {
      const userList = await db.getBookings(user.id);
      // Sort in reverse order of creation time
      userList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setBookings(userList);
      if (userList.length > 0 && !selectedBooking) {
        setSelectedBooking(userList[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    const confirmation = window.confirm(
      language === 'ar' 
        ? 'هل أنت متأكد تماماً من رغبتك في إلغاء هذا الطلب الإنشائي بشكل كامل؟' 
        : 'Are you absolutely sure you want to cancel this secure utility assignment?'
    );
    if (!confirmation) return;

    try {
      await db.updateBookingStatus(id, 'Cancelled');
      await loadUserBookings();
      // Sync detailed selection view status as well
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: 'Cancelled' });
      }
    } catch (err) {
      console.error(err);
    }
  };

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex-grow pb-16 w-full relative z-10">
        {/* Title area */}
        <div className="border-b border-zinc-200 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono">
          <div>
            <h1 className="text-3xl font-sans font-black tracking-tighter text-black uppercase">
              {language === 'ar' ? 'حجوزات الخدمة والمتابعة' : 'PREMIUM MISSION DIRECTORY'}
            </h1>
            <p className="text-xs text-zinc-600 uppercase mt-1">
              {language === 'ar' 
                ? `مرحباً بك، ${profile?.full_name || user?.email}. سجل التاريخ والحجوزات الحياوية الخاصة بك.` 
                : `Active operator sessions logged for ${profile?.full_name || user?.email}`}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="sm:self-end px-4 py-2 bg-[#C63300] text-white font-sans font-bold hover:bg-black hover:text-white text-xs uppercase cursor-pointer border border-transparent transition-all"
          >
            {language === 'ar' ? 'حجز خدمة جديدة' : 'BOOK UTILITY UNIT'}
          </button>
        </div>

        {loading ? (
          <div className="text-center font-mono text-zinc-550 py-12 uppercase">
            Loading active operational directories...
          </div>
        ) : bookings.length === 0 ? (
          <div className="max-w-xl mx-auto border border-zinc-200 p-8 text-center font-mono bg-zinc-50 relative z-10 shadow-sm">
            <Info className="w-8 h-8 mx-auto mb-3 text-[#C63300]" />
            <h4 className="text-black uppercase font-bold text-sm">
              {language === 'ar' ? 'لا توجد حجوزات نشطة حالياً' : 'NO DEPLOYMENTS REGISTERED'}
            </h4>
            <p className="text-xs text-zinc-650 leading-relaxed mt-2 uppercase">
              {language === 'ar' 
                ? 'لم تقم بتسجيل أي حجوزات صيانة أو بناء هندسي بعد. انقر على الحافلة لحجز مهمتك الأولى.' 
                : 'Your unique identifier is not associated with any active physical dispatch commands.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-4 py-2 border border-[#C63300] text-[#C63300] hover:bg-[#C63300] hover:text-white transition-all text-xs font-bold uppercase cursor-pointer"
            >
              {language === 'ar' ? 'انطلق للوحة الخدمات' : 'EXPLORE SYSTEM HUBS'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List column */}
            <div className="lg:col-span-1 space-y-4 font-mono">
              <span className="text-[10px] text-zinc-600 uppercase tracking-widest block font-bold">
                {language === 'ar' ? `قائمة المهام المفتوحة (${bookings.length})` : `REGISTERED TASKS (${bookings.length})`}
              </span>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {bookings.map(bk => (
                  <div
                    key={bk.id}
                    onClick={() => setSelectedBooking(bk)}
                    className={`p-4 border transition-all cursor-pointer rounded-none flex flex-col justify-between ${
                      selectedBooking?.id === bk.id
                        ? 'bg-zinc-50 border-[#C63300]'
                        : 'bg-white border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <h4 className="font-sans text-xs font-extrabold text-black uppercase leading-tight line-clamp-1">
                          {language === 'ar' ? bk.service_name_ar : bk.service_name_en}
                        </h4>
                        <span className="font-mono text-[9px] text-zinc-600 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 mt-1 inline-block uppercase tracking-wide">
                          {bk.category_id === 'home_maintenance' 
                            ? t('homeMaintenance') 
                            : bk.category_id === 'construction_contracting'
                              ? (language === 'ar' ? 'البناء والمقاولات' : 'CONSTRUCTION & CONTRACTING')
                              : t('profConsultations')}
                        </span>
                      </div>

                      {/* Status label badge */}
                      <span className={`text-[8px] font-mono font-bold border px-1.5 py-0.5 uppercase tracking-wide shrink-0 ${getStatusColorClass(bk.status)}`}>
                        {bk.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-zinc-550 mt-2 pt-2 border-t border-zinc-150">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#C63300]" />
                        {bk.date}
                      </span>
                      <span className="font-bold text-[#C63300] uppercase tracking-wide">
                        {bk.urgency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed selection view column */}
            <div className="lg:col-span-2">
              {selectedBooking && (
                <div className="border border-zinc-200 bg-white p-6 sm:p-8 font-mono relative shadow-sm text-black z-10">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-6 border-b border-zinc-150">
                    <div>
                      <span className="text-[10px] text-[#C63300] tracking-widest uppercase block mb-1.5 font-bold">
                        {language === 'ar' ? 'تفاصيل المهمة والمتابعة اللوجستية' : 'OPERATIONAL ASSIGNMENT REPORT'}
                      </span>
                      <h3 className="font-sans text-xl sm:text-2xl font-black text-black uppercase leading-tight">
                        {language === 'ar' ? selectedBooking.service_name_ar : selectedBooking.service_name_en}
                      </h3>
                      
                      <p className="font-mono text-[9px] text-zinc-600 uppercase mt-1">
                        {selectedBooking.category_id === 'home_maintenance' 
                          ? t('homeMaintenance') 
                          : selectedBooking.category_id === 'construction_contracting'
                            ? (language === 'ar' ? 'البناء والمقاولات' : 'CONSTRUCTION & CONTRACTING')
                            : t('profConsultations')}
                      </p>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-1.5 font-bold uppercase shrink-0">
                      <span className={`text-xs border px-3 py-1 font-black leading-none uppercase tracking-widest ${getStatusColorClass(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono mt-1">
                        ID: {selectedBooking.id}
                      </span>
                    </div>
                  </div>

                  {/* Core specs table layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-xs border-b border-zinc-150 pb-8">
                    <div className="space-y-4">
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

                      <div className="flex items-start gap-2.5">
                        <Layers className="w-4 h-4 text-[#C63300] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-zinc-550 uppercase block font-bold">{t('urgencyLevel')}</span>
                          <span className="text-black uppercase font-bold text-xs">{selectedBooking.urgency}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#C63300] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-zinc-550 uppercase block font-bold">{t('addressLocation')}</span>
                          <span className="text-black leading-relaxed font-bold break-all">{selectedBooking.address}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <DollarSign className="w-4 h-4 text-[#C63300] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-zinc-550 uppercase block font-bold">{t('flatBookingFee')}</span>
                          {selectedBooking.booking_fee ? (
                            <span className="text-[#C63300] font-black">${selectedBooking.booking_fee} (PAID DIRECT DISPATCH)</span>
                          ) : (
                            <span className="text-blue-700 font-bold uppercase">VARIABLE / QUOTE DRIVEN</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description details item */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#C63300]" />
                      <h4 className="text-xs font-bold uppercase text-zinc-650">
                        {language === 'ar' ? 'تفاصيل وحجم العمل المطلوب بدقة' : 'MISSION SCOPE / INTEL REPORT'}
                      </h4>
                    </div>
                    <div className="p-4 bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 leading-relaxed font-bold rounded-none break-words">
                      {selectedBooking.description}
                    </div>

                    {/* Photos list view */}
                    {selectedBooking.photos && selectedBooking.photos.length > 0 && (
                      <div className="mt-4">
                        <span className="text-[10px] text-zinc-550 uppercase block font-bold mb-2">Visual Diagnostic Attachments</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedBooking.photos.map((ph, pi) => (
                            <a
                              key={pi}
                              href={ph}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-[#C63300] hover:underline hover:text-black bg-zinc-50 border border-zinc-200 px-3 py-1 truncate max-w-[200px]"
                            >
                              Photo #{pi + 1} ({ph})
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cancel mechanism */}
                  {selectedBooking.status === 'Pending' && (
                    <div className="flex justify-end pt-4 border-t border-zinc-150">
                      <button
                        onClick={() => handleCancelBooking(selectedBooking.id)}
                        className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold uppercase transition-all cursor-pointer"
                      >
                        {language === 'ar' ? 'إلغاء الطلب بالكامل' : 'ABORT UTILITY MISSION'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
