import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { TRANSLATIONS } from '../data';
import ServiceIcon from '../components/ServiceIcon';
import { Booking, TimeSlot, BookingStatus } from '../types';

export const Dashboard: React.FC = () => {
  const { 
    language, 
    currentUser, 
    bookings, 
    cancelBooking, 
    rescheduleBooking, 
    logout, 
    toggleLanguage,
    updateBookingStatus
  } = useApp();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];

  // Protect route
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // States
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  
  // Reschedule state
  const [selectedRescheduleBooking, setSelectedRescheduleBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState<TimeSlot>('morning');

  if (!currentUser) return null;

  // Filter user bookings
  const userBookings = bookings.filter((b) => b.userId === currentUser.id);

  const upcomingBookings = userBookings.filter((b) => 
    b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'In Progress'
  );

  const pastBookings = userBookings.filter((b) => 
    b.status === 'Completed' || b.status === 'Cancelled'
  );

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const handleOpenReschedule = (booking: Booking) => {
    setSelectedRescheduleBooking(booking);
    setNewDate(booking.date);
    setNewSlot(booking.timeSlot);
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRescheduleBooking || !newDate) return;

    rescheduleBooking(selectedRescheduleBooking.id, newDate, newSlot);
    setSelectedRescheduleBooking(null);
  };

  // Status mapping
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

  const getUrgencyLabel = (urg: string) => {
    switch (urg) {
      case 'normal': return t.urgencyNormalLabel;
      case 'urgent': return t.urgencyUrgentLabel;
      case 'emergency': return t.urgencyEmergencyLabel;
      default: return urg;
    }
  };

  const slotTranslations = (slot: string) => {
    switch (slot) {
      case 'morning': return t.slotMorning;
      case 'afternoon': return t.slotAfternoon;
      case 'evening': return t.slotEvening;
      default: return slot;
    }
  };

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

            {currentUser.role === 'admin' && (
              <Link to="/admin" className="tracking-widest text-[#CCFF00] hover:underline uppercase transition-all font-black">
                [{t.navAdmin}]
              </Link>
            )}
            
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

      {/* DASHBOARD HERO / SUBHEADER */}
      <section className="bg-black py-10 border-b border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-xs font-mono text-[#CCFF00] tracking-widest uppercase mb-1">
            {t.dashboardSubtitle}
          </div>
          <h2 className="text-3xl font-sans font-black tracking-tight uppercase">
            {t.dashboardTitle}
          </h2>
          <p className="text-sm text-white/50 font-mono mt-1.5 uppercase">
            {t.roleCustomer}: <span className="text-[#CCFF00] font-sans font-bold">{currentUser.name}</span> | {currentUser.email} | {currentUser.phone}
          </p>
        </div>
      </section>

      {/* TABS SELECTORS */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-6 md:p-12 px-6">
        
        {/* Navigation Tabs in sleek selectors */}
        <div className="bg-[#1A1A1A] p-1.5 rounded-xl flex gap-1 border border-white/5 mb-8 max-w-lg font-mono text-xs uppercase tracking-widest">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 px-6 rounded-lg transition-all cursor-pointer text-center font-black ${
              activeTab === 'upcoming'
                ? 'bg-[#CCFF00] text-black shadow-lg scale-[1.01]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {language === 'en' ? 'Active Orders' : 'الطلبات النشطة والزيارات'} ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 px-6 rounded-lg transition-all cursor-pointer text-center font-black ${
              activeTab === 'past'
                ? 'bg-[#CCFF00] text-black shadow-lg scale-[1.01]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {language === 'en' ? 'Historical Records' : 'سجل العمليات المؤرشف'} ({pastBookings.length})
          </button>
        </div>

        {/* Display bookings list */}
        {displayedBookings.length === 0 ? (
          <div className="border border-dashed border-white/10 p-12 text-center text-white/40 rounded-3xl bg-[#1A1A1A]/30">
            <div className="flex flex-col items-center justify-center gap-3">
              <ServiceIcon name="FolderSync" className="w-8 h-8 text-[#CCFF00]" />
              <p className="font-sans text-sm font-medium">{t.noBookings}</p>
              <Link to="/" className="text-xs font-mono tracking-widest uppercase text-[#CCFF00] hover:underline mt-2">
                &rarr; {language === 'en' ? 'SUBMIT NEW SERVICE BOOKING' : 'تأكيد وإصدار طلب صيانة جديد'}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedBookings.map((booking) => (
              <div
                key={booking.id}
                className="border border-[#1A1A1A] hover:border-[#CCFF00]/50 bg-[#1A1A1A] p-6 md:p-8 relative transition-all duration-350 rounded-3xl shadow-xl hover:-translate-y-0.5"
              >
                {/* Visual Status Indicator Strip on Top right/left depending on translation direction */}
                <div className="absolute top-0 right-12 rtl:right-auto rtl:left-12 h-1 w-20 bg-[#CCFF00]"></div>

                {/* Grid header details */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-black bg-[#CCFF00] px-1.5 py-0.5 font-black uppercase">
                        {booking.id}
                      </span>
                      <span className="font-mono text-[10px] text-white/50">
                        {new Date(booking.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-xl font-sans font-black uppercase text-white tracking-tight mt-2 flex items-center gap-2">
                      <span>{language === 'en' ? booking.serviceNameEn : booking.serviceNameAr}</span>
                      <span className="text-white/40 font-mono text-xs uppercase font-light">
                        {booking.categoryId === 'maintenance' ? `(Booking Fee)` : `(Expert Consultation)`}
                      </span>
                    </h3>
                  </div>

                  {/* Status Pills inside Black, White, Lime Green constraints */}
                  <div className="flex flex-wrap gap-2 items-center">
                    
                    {/* Urgency Badge */}
                    <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 border font-bold ${
                      booking.urgency === 'emergency'
                        ? 'border-[#CCFF00] text-[#CCFF00] bg-[#CCFF00]/10 font-bold'
                        : booking.urgency === 'urgent'
                        ? 'border-white text-white font-bold'
                        : 'border-white/15 text-white/50'
                    }`}>
                      {getUrgencyLabel(booking.urgency)}
                    </span>

                    {/* Status badge with strict visual mappings */}
                    {booking.status === 'Pending' && (
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 border border-white text-white bg-black">
                        {getStatusLabel(booking.status)}
                      </span>
                    )}
                    {booking.status === 'Confirmed' && (
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 border border-[#CCFF00] text-[#CCFF00] bg-black font-extrabold">
                        {getStatusLabel(booking.status)}
                      </span>
                    )}
                    {booking.status === 'In Progress' && (
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 bg-[#CCFF00] text-black font-black">
                        {getStatusLabel(booking.status)}
                      </span>
                    )}
                    {booking.status === 'Completed' && (
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 border border-white/20 text-white/40 line-through">
                        {getStatusLabel(booking.status)}
                      </span>
                    )}
                    {booking.status === 'Cancelled' && (
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 border border-white/10 text-white/30 line-through decoration-white/40">
                        {getStatusLabel(booking.status)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Parameters Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-6">
                  <div>
                    <h4 className="text-[10px] font-mono tracking-widest text-[#CCFF00] uppercase mb-1">{t.bookingDate} / {t.bookingTime}</h4>
                    <p className="font-sans font-bold flex items-center gap-1.5">
                      <ServiceIcon name="Clock" className="w-4 h-4 text-[#CCFF00]" />
                      <span>{booking.date}</span>
                      <span className="text-white/60">({slotTranslations(booking.timeSlot)})</span>
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="text-[10px] font-mono tracking-widest text-[#CCFF00] uppercase mb-1">{t.bookingAddress}</h4>
                    <p className="font-sans font-light leading-relaxed">{booking.address}</p>
                  </div>
                </div>

                {/* Job description detail & attachments */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div>
                    <h4 className="text-[10px] font-mono tracking-widest text-[#CCFF00] uppercase mb-1">{t.bookingDescription}</h4>
                    <p className="font-sans font-light text-white/80 whitespace-pre-line leading-relaxed text-sm">
                      {booking.description}
                    </p>
                  </div>

                  {/* Attachment thumbnails */}
                  {booking.photos && booking.photos.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-mono tracking-widest text-[#CCFF00] uppercase mb-2">{t.bookingPhotos}</h4>
                      <div className="flex flex-wrap gap-2">
                        {booking.photos.map((photo, i) => (
                          <div
                            key={i}
                            onClick={() => setEnlargedPhoto(photo)}
                            className="w-14 h-14 border border-white/20 hover:border-[#CCFF00] cursor-pointer relative overflow-hidden transition-all group aspect-square"
                          >
                            <img src={photo} alt="Fault Attachment" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-[8px] font-mono text-[#CCFF00] tracking-tighter uppercase">SCALE</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tender/fee outline */}
                  {booking.bookingFee !== undefined && (
                    <div className="inline-flex items-center gap-3 bg-white/5 px-4 py-2 border border-white/10 font-mono text-xs">
                      <span className="text-white/50">{t.bookingFeeLabel}:</span>
                      <span className="text-[#CCFF00] font-bold">{booking.bookingFee} {t.bookingFeeCurrency}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons: Cancel and Reschedule */}
                {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                  <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-white/5 select-none justify-end">
                    {booking.status === 'Pending' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'Confirmed')}
                        className="bg-[#CCFF00] hover:bg-black text-black hover:text-[#CCFF00] border border-[#CCFF00] font-mono text-xs py-2 px-4 transition-all duration-200 cursor-pointer uppercase font-black tracking-wider shadow-lg flex items-center gap-1.5"
                        title="Simulate dispatch center confirming this booking"
                      >
                        <span>⚡ {language === 'en' ? 'SIMULATE CONFIRMATION' : 'محاكاة تأكيد المنسق'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenReschedule(booking)}
                      className="border border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black font-mono text-xs py-2 px-4 transition-all duration-200 cursor-pointer uppercase font-bold"
                    >
                      {t.btnReschedule}
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm(language === 'en' ? 'Are you sure you want to cancel this booking order?' : 'هل أنت متأكد من إلغاء هذا الطلب؟')) {
                          cancelBooking(booking.id);
                        }
                      }}
                      className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-mono text-xs py-2 px-4 transition-all duration-200 cursor-pointer uppercase font-bold"
                    >
                      {t.btnCancelBooking}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* PHOTO LIGHTBOX DIALOG OVERLAY */}
      {enlargedPhoto && (
        <div
          onClick={() => setEnlargedPhoto(null)}
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 cursor-zoom-out backdrop-blur-md"
        >
          <div className="max-w-4xl max-h-[85vh] relative border-2 border-[#CCFF00]">
            <img src={enlargedPhoto} alt="Enlarged File View" className="object-contain max-h-[80vh] w-auto max-w-full" referrerPolicy="no-referrer" />
            <p className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 font-mono text-[9px] text-[#CCFF00] px-3 py-1 uppercase tracking-widest border border-[#CCFF00]/40">
              {language === 'en' ? 'CLICK OUTSIDE TO SHUT' : 'انقر في أي مكان للإغلاق'}
            </p>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL POPUP */}
      {selectedRescheduleBooking && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-md border-2 border-[#CCFF00] bg-black p-8 relative">
            <button
              onClick={() => setSelectedRescheduleBooking(null)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-white hover:text-[#CCFF00] p-1 uppercase font-mono tracking-widest text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'en' ? 'CLOSE' : 'إغلاق'}</span>
              <ServiceIcon name="X" className="w-4 h-4" />
            </button>

            {/* Neon flanged details */}
            <div className="absolute -top-[2px] -left-[2px] w-3 h-3 bg-[#CCFF00]"></div>
            <div className="absolute -bottom-[2px] -right-[2px] w-3 h-3 bg-[#CCFF00]"></div>

            <div className="border-b border-[#CCFF00]/25 pb-4 mb-6 mt-4">
              <span className="font-mono text-[10px] text-[#CCFF00] uppercase tracking-widest">RESCHEDULER MODULE</span>
              <h3 className="text-xl font-sans font-black uppercase text-white tracking-tight mt-1">
                {t.modalRescheduleTitle}
              </h3>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-6">
              {/* Date */}
              <div>
                <label className="block text-xs font-mono tracking-widest uppercase mb-2 text-[#CCFF00]">
                  {t.fieldPreferredDate} *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-black border border-white/20 focus:border-[#CCFF00] text-white px-4 py-3 text-sm rounded-none tracking-wide focus:outline-none transition-all font-sans"
                />
              </div>

              {/* Time slots */}
              <div>
                <label className="block text-xs font-mono tracking-widest uppercase mb-2 text-[#CCFF00]">
                  {t.fieldTimeSlot} *
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'morning', label: t.slotMorning },
                    { value: 'afternoon', label: t.slotAfternoon },
                    { value: 'evening', label: t.slotEvening }
                  ].map((slot) => (
                    <label
                      key={slot.value}
                      className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${
                        newSlot === slot.value
                          ? 'border-[#CCFF00] bg-[#CCFF00]/5 text-[#CCFF00] font-bold'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reschedSlot"
                        checked={newSlot === slot.value}
                        onChange={() => setNewSlot(slot.value as TimeSlot)}
                        className="accent-[#CCFF00]"
                      />
                      <span className="text-xs font-mono uppercase tracking-wider">{slot.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRescheduleBooking(null)}
                  className="flex-1 border-2 border-white/25 hover:border-white text-white font-mono text-xs tracking-wider py-3 uppercase cursor-pointer text-center"
                >
                  {language === 'en' ? 'ABORT' : 'إلغاء'}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#CCFF00] border-2 border-[#CCFF00] text-black hover:bg-black hover:text-[#CCFF00] font-mono text-xs tracking-wider py-3 font-bold uppercase cursor-pointer text-center"
                >
                  {t.btnSaveReschedule}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-[#CCFF00]/10 bg-black p-4 text-center">
        <p className="font-mono text-[10px] text-white/40 tracking-wider">
          © {new Date().getFullYear()} {t.appName} GLOBAL. CONSOLIDATED CONSOLE CONTROL.
        </p>
      </footer>
    </div>
  );
};
export default Dashboard;
