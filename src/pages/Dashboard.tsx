import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import db from '../lib/db';
import { Booking } from '../types';
import { ServiceIcon } from '../components/ServiceIcon';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Play, 
  History,
  Info,
  CalendarDays,
  X,
  RefreshCw
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Rescheduling overlay modal states
  const [targetReschedule, setTargetReschedule] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState<Booking['time_slot']>('Morning');
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);

  // Booking detail view states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchUserBookings = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await db.getBookings('customer', user.id);
      setBookings(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to sync your dashboard requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    const doubleCheck = window.confirm(t('cancelConfirm'));
    if (!doubleCheck) return;

    try {
      setError('');
      await db.updateBookingStatus(bookingId, 'Cancelled');
      await fetchUserBookings();
      // Update selected modal too if open
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, status: 'Cancelled' } : null);
      }
    } catch (err: any) {
      setError(err?.message || 'Cancellation operation aborted.');
    }
  };

  const triggerRescheduleModal = (bk: Booking, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetReschedule(bk);
    setNewDate(bk.date);
    setNewTimeSlot(bk.time_slot);
  };

  const submitReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetReschedule) return;

    try {
      setRescheduleSubmitting(true);
      setError('');
      await db.updateBookingDetails(targetReschedule.id, newDate, newTimeSlot);
      setTargetReschedule(null);
      await fetchUserBookings();
    } catch (err: any) {
      setError(err?.message || 'Rescheduling failed.');
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  const getStatusStyle = (status: Booking['status']) => {
    switch (status) {
      case 'Pending':
        return 'border border-gray-700 text-gray-400 bg-neutral-950 font-mono';
      case 'Confirmed':
        return 'border border-lime-primary text-lime-primary bg-black font-mono';
      case 'In Progress':
        return 'border border-lime-primary text-black bg-lime-primary font-mono';
      case 'Completed':
        return 'border border-white text-white bg-black font-sans font-medium';
      case 'Cancelled':
        return 'border border-red-950 text-red-500 bg-black font-sans';
      default:
        return 'border border-gray-800 text-gray-500 bg-black';
    }
  };

  // Split bookings
  const upcomingBookings = bookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'In Progress');
  const pastBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled');

  return (
    <div id="customer-dashboard-viewport" className="bg-black text-white min-h-[calc(100vh-4.5rem)] pb-18">
      {/* Dashboard Headline */}
      <section className="bg-zinc-950 border-b border-gray-900 py-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="font-mono text-[9px] text-lime-primary tracking-widest uppercase">
              {language === 'ar' ? 'البوابة الآمنة للمواطنين' : 'SECURED CUSTOMER INTERFACE'}
            </span>
            <h1 className="font-sans text-3xl font-black text-white uppercase mt-1">
              {language === 'ar' ? 'بوابة حجوزاتي الشخصية' : 'Personal Requests Hub'}
            </h1>
          </div>
          <button
            onClick={fetchUserBookings}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-800 hover:border-lime-primary hover:text-black hover:bg-lime-primary text-xs font-mono rounded transition-colors uppercase font-bold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تحديث البيانات' : 'Sync Records'}</span>
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {error && (
          <div className="mb-8 p-4 bg-black border border-red-500 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <p className="font-mono text-xs text-white">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-gray-500 font-mono text-xs uppercase animate-pulse">
            DISPATCHING SECURED METRIC SERVERS...
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* 1. Upcoming active maintenance actions */}
            <div>
              <div className="border-b border-gray-900 pb-3 mb-6 flex justify-between items-center">
                <span className="font-sans text-sm font-black tracking-wider uppercase text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-lime-primary" />
                  {t('activeRequests')}
                </span>
                <span className="font-mono text-xs text-gray-500 bg-neutral-950 px-2 py-0.5 border border-zinc-900">
                  {upcomingBookings.length} {language === 'ar' ? 'طلب نشط' : 'JOBS'}
                </span>
              </div>

              {upcomingBookings.length === 0 ? (
                <div className="p-12 text-center border border-gray-900 bg-black">
                  <CalendarDays className="w-12 h-12 text-zinc-800 mx-auto mb-3" />
                  <p className="font-mono text-xs text-gray-500 uppercase">
                    {t('noBookings')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingBookings.map(bk => (
                    <div
                      key={bk.id}
                      onClick={() => setSelectedBooking(bk)}
                      className="group bg-black hover:bg-neutral-950 border border-gray-900 hover:border-lime-primary transition-all p-5 relative cursor-pointer"
                    >
                      <div className="absolute top-4 right-4">
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider ${getStatusStyle(bk.status)}`}>
                          {bk.status}
                        </span>
                      </div>

                      <div className="flex gap-4 items-start mb-6">
                        <span className="p-3 bg-zinc-950 text-lime-primary border border-gray-900">
                          <ServiceIcon id={bk.service_id} className="w-5 h-5" />
                        </span>
                        <div>
                          <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest block leading-none">
                            {bk.id}
                          </span>
                          <h4 className="font-sans text-lg font-bold text-white uppercase mt-1">
                            {language === 'ar' ? bk.service_name_ar : bk.service_name_en}
                          </h4>
                          <span className="font-mono text-[9px] text-zinc-400 bg-neutral-900 px-1.5 py-0.5 mt-1 inline-block uppercase tracking-wide">
                            {bk.category_id === 'home_maintenance' ? t('homeMaintenance') : t('profConsultations')}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 font-mono text-[11px] text-gray-400 mb-6 bg-zinc-950 p-3 border border-zinc-900">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-lime-primary" />
                          <span>{bk.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-lime-primary" />
                          <span className="uppercase">{bk.time_slot}</span>
                        </div>
                        <div className="col-span-2 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-lime-primary shrink-0 mt-0.5" />
                          <span className="truncate">{bk.address}</span>
                        </div>
                      </div>

                      {/* Controls inside Card (Pending only) */}
                      {bk.status === 'Pending' && (
                        <div className="flex gap-2 pt-4 border-t border-gray-900">
                          <button
                            onClick={(e) => triggerRescheduleModal(bk, e)}
                            className="flex-1 py-2 border border-gray-800 hover:border-lime-primary text-[10px] font-mono font-bold uppercase transition-colors text-white cursor-pointer"
                          >
                            {t('reschedule')}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelBooking(bk.id);
                            }}
                            className="flex-1 py-2 border border-red-950 hover:bg-red-950 hover:text-white text-red-500 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer"
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Historic completed or cancelled requests */}
            <div>
              <div className="border-b border-gray-900 pb-3 mb-6 flex justify-between items-center">
                <span className="font-sans text-sm font-black tracking-wider uppercase text-gray-500 flex items-center gap-2">
                  <History className="w-4 h-4 text-gray-500" />
                  {t('pastBookings')}
                </span>
                <span className="font-mono text-xs text-gray-550 bg-neutral-950 px-2 py-0.5 border border-zinc-900">
                  {pastBookings.length} {language === 'ar' ? 'طلب سابق' : 'CLEARED'}
                </span>
              </div>

              {pastBookings.length === 0 ? (
                <div className="p-12 text-center border border-gray-950">
                  <p className="font-mono text-xs text-gray-650 uppercase">
                    {language === 'ar' ? 'لا توجد حجوزات منتهية في السجل.' : 'NO PASSED ACTIONS FILED'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map(bk => (
                    <div
                      key={bk.id}
                      onClick={() => setSelectedBooking(bk)}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-black hover:bg-neutral-950 border border-gray-900 cursor-pointer transition-colors gap-4"
                    >
                      <div className="flex gap-3 items-center">
                        <span className="p-2.5 bg-neutral-950 text-gray-500 border border-gray-900">
                          <ServiceIcon id={bk.service_id} className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="font-mono text-[9px] text-gray-600 uppercase block select-none">
                            {bk.id}
                          </span>
                          <h5 className="font-sans text-sm font-extrabold text-white uppercase mt-0.5">
                            {language === 'ar' ? bk.service_name_ar : bk.service_name_en}
                          </h5>
                          <span className="font-mono text-[9px] text-gray-500">
                            {bk.date} • {bk.time_slot}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {bk.cost_items && bk.cost_items.length > 0 && (
                          <span className="text-[10px] font-mono text-lime-primary bg-zinc-950 border border-zinc-950 px-2 py-0.5 uppercase tracking-wide">
                            {language === 'ar' ? 'فاتورة صادرة' : 'INVOICED'}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider ${getStatusStyle(bk.status)}`}>
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
      </div>

      {/* ==========================================
          OVERLAY A: GENERAL REQUEST DETAILED VIEW
         ========================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-black border border-gray-900 p-6 sm:p-8 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-lime-primary"></div>
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 p-1 bg-gray-950 text-gray-400 hover:text-white border border-gray-800 hover:border-white"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="font-mono text-[9px] text-lime-primary px-2 py-0.5 bg-zinc-950 border border-zinc-900 uppercase">
              {selectedBooking.id}
            </span>

            <h3 className="font-sans text-2xl font-black text-white uppercase mt-3 mb-1">
              {language === 'ar' ? selectedBooking.service_name_ar : selectedBooking.service_name_en}
            </h3>
            
            <p className="font-mono text-[10px] text-gray-500 uppercase pb-4 border-b border-gray-900 mb-6">
              {selectedBooking.category_id === 'home_maintenance' ? t('homeMaintenance') : t('profConsultations')}
            </p>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3.5 bg-zinc-950 border border-zinc-900 text-gray-300">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">{t('issueDescription')}</span>
                <p className="leading-relaxed whitespace-pre-line text-white">{selectedBooking.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-neutral-950 border border-gray-900">
                  <span className="text-[9px] text-gray-500 uppercase block">{t('preferredDate')}</span>
                  <span className="text-white font-bold block mt-1">{selectedBooking.date}</span>
                </div>
                <div className="p-3 bg-neutral-950 border border-gray-900">
                  <span className="text-[9px] text-gray-500 uppercase block">{t('preferredTime')}</span>
                  <span className="text-white font-bold block mt-1 uppercase">{selectedBooking.time_slot}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-neutral-950 border border-gray-900">
                  <span className="text-[9px] text-gray-500 uppercase block">{t('urgencyLevel')}</span>
                  <span className="text-lime-primary font-bold block mt-1 uppercase">
                    {selectedBooking.urgency === 'Normal' ? t('normal') : selectedBooking.urgency === 'Urgent' ? t('urgent') : t('emergency')}
                  </span>
                </div>
                <div className="p-3 bg-neutral-950 border border-gray-900">
                  <span className="text-[9px] text-gray-500 uppercase block">{t('status')}</span>
                  <span className="text-white font-bold block mt-1 uppercase">{selectedBooking.status}</span>
                </div>
              </div>

              {/* Physical Adr */}
              <div className="p-3 bg-neutral-950 border border-gray-900">
                <span className="text-[9px] text-gray-500 uppercase block">{t('serviceAddress')}</span>
                <span className="text-white block mt-1 leading-relaxed">{selectedBooking.address}</span>
              </div>

              {/* Display File Attachment Previews */}
              {selectedBooking.photos && selectedBooking.photos.length > 0 && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">{t('photoUpload')}</span>
                  <div className="flex gap-2">
                    {selectedBooking.photos.map((ph, index) => (
                      <div key={index} className="w-20 h-20 border border-gray-800 bg-zinc-900">
                        <img
                          src={ph}
                          onClick={() => window.open(ph)} // Fallback view on click
                          alt="attached"
                          className="w-full h-full object-cover cursor-pointer"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cost items info if completed/invoiced */}
              {selectedBooking.cost_items && selectedBooking.cost_items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-900">
                  <span className="text-[10px] text-lime-primary uppercase tracking-widest block mb-2">{t('costsReceipt')}</span>
                  <table className="w-full text-left text-[10px] font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-500 uppercase">
                        <th className="py-1">{t('itemName')}</th>
                        <th className="py-1 text-center">{t('quantity')}</th>
                        <th className="py-1 text-right">{t('lineTotal')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBooking.cost_items.map((it) => (
                        <tr key={it.id} className="border-b border-gray-900 text-white">
                          <td className="py-1.5">{it.description}</td>
                          <td className="py-1.5 text-center">{it.quantity}</td>
                          <td className="py-1.5 text-right font-bold text-lime-primary">${it.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-900 text-[11px] font-bold text-white uppercase">
                    <span>{t('grandTotal')}</span>
                    <span className="bg-lime-primary text-black px-2 py-0.5">
                      ${selectedBooking.cost_items.reduce((s, c) => s + c.total, 0) + (selectedBooking.booking_fee || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* If pending booking, cancel/reschedule option */}
            {selectedBooking.status === 'Pending' && (
              <div className="flex gap-2.5 mt-8 pt-4 border-t border-gray-900">
                <button
                  onClick={(e) => triggerRescheduleModal(selectedBooking, e)}
                  className="flex-1 py-3 border border-gray-800 hover:border-lime-primary text-xs font-mono font-bold uppercase transition-colors text-white cursor-pointer"
                >
                  {t('reschedule')}
                </button>
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="flex-1 py-3 border border-red-950 hover:bg-red-950 hover:text-white text-red-500 text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          OVERLAY B: RESCHEDULE SUB-VIEW FORM
         ========================================== */}
      {targetReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xs">
          <div className="w-full max-w-md bg-black border border-gray-900 p-8 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-lime-primary"></div>
            
            {/* Close Button */}
            <button
              onClick={() => setTargetReschedule(null)}
              className="absolute top-4 right-4 p-1 bg-gray-950 text-gray-450 hover:text-white border border-gray-850 hover:border-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-sans text-xl font-bold uppercase text-white tracking-tight mb-2">
              {t('rescheduleTitle')}
            </h3>
            <span className="font-mono text-[9px] text-gray-500 uppercase block mb-6 px-1 py-0.5 bg-zinc-950 border border-zinc-900 w-max">
              {targetReschedule.id}
            </span>

            <form onSubmit={submitReschedule} className="space-y-5">
              {/* Date selection */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  {t('preferredDate')}
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black border border-gray-800 text-white rounded-none focus:outline-none focus:border-lime-primary font-mono text-sm"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time slot */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  {t('preferredTime')}
                </label>
                <select
                  value={newTimeSlot}
                  onChange={e => setNewTimeSlot(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-black border border-gray-800 text-white rounded-none focus:outline-none focus:border-lime-primary font-mono text-sm uppercase"
                >
                  <option value="Morning">{t('morning')}</option>
                  <option value="Afternoon">{t('afternoon')}</option>
                  <option value="Evening">{t('evening')}</option>
                </select>
              </div>

              {/* Trigger */}
              <button
                type="submit"
                disabled={rescheduleSubmitting}
                className="w-full py-4 mt-2 bg-lime-primary text-black hover:bg-white text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{rescheduleSubmitting ? 'PROCESSING CHANGES...' : t('saveBtn')}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
