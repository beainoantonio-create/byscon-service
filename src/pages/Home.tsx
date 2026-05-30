import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import db, { SEED_SERVICES } from '../lib/db';
import { Service } from '../types';
import { Navbar } from '../components/Navbar';
import { ServiceIcon } from '../components/ServiceIcon';
import { BackgroundVectors } from '../components/BackgroundVectors';
// @ts-ignore
import shedLogo from '../assets/shed-logo.png';
import { 
  ArrowRight, 
  ArrowLeft, 
  Info, 
  HardHat, 
  ShieldCheck, 
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  ClipboardList,
  Camera
} from 'lucide-react';

interface HomeProps {
  view?: 'landing' | 'maintenance' | 'consultations';
}

export const Home: React.FC<HomeProps> = ({ view = 'landing' }) => {
  const { user, profile } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [services, setServices] = useState<Service[]>(SEED_SERVICES);
  const [activeCategory, setActiveCategory] = useState<'home_maintenance' | 'professional_consultations'>('home_maintenance');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  // Booking Form States
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [prefDate, setPrefDate] = useState('');
  const [prefTimeSlot, setPrefTimeSlot] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [urgency, setUrgency] = useState<'Normal' | 'Urgent' | 'Emergency'>('Normal');
  const [address, setAddress] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState('');
  const [isAck, setIsAck] = useState(false);
  const [formError, setFormError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  // Sychronize database with services
  useEffect(() => {
    db.getServices().then(setServices);
  }, []);

  // Sync state if category view is directly routed
  useEffect(() => {
    if (view === 'maintenance') {
      setActiveCategory('home_maintenance');
    } else if (view === 'consultations') {
      setActiveCategory('professional_consultations');
    }
  }, [view]);

  // Sync custom state passed from Construction sub-service card "Book Now"
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const bookParam = searchParams.get('book');
    const serviceNameEn = searchParams.get('name_en');
    const serviceNameAr = searchParams.get('name_ar');
    const serviceId = searchParams.get('service_id');
    const categoryId = searchParams.get('category');
    const feeParam = searchParams.get('booking_fee');

    if (bookParam === 'true' && serviceNameEn && serviceNameAr && serviceId) {
      if (!user) {
        navigate('/login?redirect=home');
        return;
      }
      setBookingService({
        id: serviceId,
        name_en: serviceNameEn,
        name_ar: serviceNameAr,
        category: (categoryId as any) || 'construction_contracting',
        booking_fee: feeParam ? parseInt(feeParam, 10) : 25,
        description_en: '',
        description_ar: '',
        active: true
      });
      setSelectedService(null);
      setPrefDate('');
      setPrefTimeSlot('Morning');
      setUrgency('Normal');
      setAddress('');
      setIssueDesc('');
      setPhotos([]);
      setIsAck(false);
      setFormError('');
      setSuccessInfo('');
      // Clean query search parameters safely
      navigate('/', { replace: true });
    }
  }, [location, user, navigate]);

  const handleBookNowBtn = (srv: Service, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingService(srv);
    setSelectedService(null);
    setPrefDate('');
    setPrefTimeSlot('Morning');
    setUrgency('Normal');
    setAddress('');
    setIssueDesc('');
    setPhotos([]);
    setIsAck(false);
    setFormError('');
    setSuccessInfo('');
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setFormError('Authentication required');
      return;
    }
    if (!bookingService) return;

    // Validate fee acknowledgement for categories carrying a booking fee
    if (bookingService.category !== 'professional_consultations' && !isAck) {
      setFormError(t('ackRequired'));
      return;
    }

    if (!address.trim()) {
      setFormError(language === 'ar' ? 'العنوان مطلوب بالتفصيل' : 'Detailed deployment location required');
      return;
    }

    if (!issueDesc.trim()) {
      setFormError(language === 'ar' ? 'يرجى تقديم تفاصيل العمل المطلوب' : 'Job description details required');
      return;
    }

    try {
      const fee = bookingService.booking_fee || 0;
      await db.createBooking({
        user_id: user.id,
        user_name: profile?.full_name || user.email || 'SHED client',
        service_id: bookingService.id,
        service_name_en: bookingService.name_en,
        service_name_ar: bookingService.name_ar,
        category_id: bookingService.category,
        date: prefDate || new Date().toISOString().split('T')[0],
        time_slot: prefTimeSlot,
        urgency,
        address,
        description: issueDesc,
        photos,
        booking_fee: fee
      });

      setSuccessInfo(t('successBooking'));
      setTimeout(() => {
        setBookingService(null);
        navigate('/dashboard');
      }, 2500);

    } catch (err: any) {
      setFormError(err.message || 'System failed to register booking');
    }
  };

  const addPhoto = () => {
    if (photoInput.trim()) {
      setPhotos([...photos, photoInput.trim()]);
      setPhotoInput('');
    }
  };

  // Filter services by category
  const filteredServices = services.filter(s => s.category === activeCategory && s.active);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col relative overflow-hidden">
      <BackgroundVectors />
      <Navbar />

      {/* Hero Header Area */}
      <div className="bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-200 py-16 px-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
        {/* Decorative Tools Scattered Background per Step 5 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <svg className="absolute top-6 left-12 w-24 h-24 text-black opacity-[0.03] -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          <svg className="absolute bottom-4 left-[20%] w-32 h-32 text-black opacity-[0.03] -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <svg className="absolute top-8 right-[15%] w-28 h-28 text-black opacity-[0.03] rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <svg className="absolute bottom-6 right-8 w-24 h-24 text-black opacity-[0.03] -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 4v4m3-4v4m3-4v4m3-4v4M4 9h4" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto text-center font-mono relative z-10 w-full flex items-center justify-center">
          {!logoFailed ? (
            <img 
              src={shedLogo} 
              alt="SHED" 
              className="mx-auto max-w-[280px] w-full" 
              onError={() => setLogoFailed(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-5xl md:text-6xl font-sans font-black tracking-widest text-[#C63300]">
              SHED
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex-grow pb-16 relative z-10">
        {/* VIEW 1 — Landing page: Show THREE big category cards */}
        {view === 'landing' && (
          <div id="category-panel-selector" className="grid grid-cols-1 md:grid-cols-3 auto-rows-fr gap-6 mb-12">
            
            {/* Home Maintenance Selector */}
            <button
              onClick={() => navigate('/maintenance')}
              className="text-left p-8 border hover:border-[#C63300] transition-all text-black rounded-none cursor-pointer flex h-full min-h-[340px] flex-col bg-white border-zinc-200 hover:bg-zinc-50 group shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="p-3 bg-zinc-50 text-zinc-650 group-hover:text-white group-hover:bg-[#C63300] border border-zinc-200 group-hover:border-[#C63300] transition-all">
                    <ServiceIcon id="electrical" className="w-6 h-6" />
                  </span>
                  <span className="font-mono text-xs font-bold text-[#C63300] tracking-widest bg-zinc-50 border border-zinc-200 px-2 py-0.5">
                    12 {language === 'ar' ? 'خدمات أساسية' : 'SERVICES'}
                  </span>
                </div>
                <h3 className="font-sans text-xl font-extrabold tracking-tight mb-2 min-h-[56px] uppercase group-hover:text-[#C63300] transition-colors">
                  {t('homeMaintenance')}
                </h3>
                <p className="text-xs text-zinc-650 font-mono leading-relaxed min-h-[72px]">
                  {t('homeMaintenanceDesc')}
                </p>
              </div>
              <div className="mt-auto pt-4 border-t border-zinc-150 w-full flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase text-zinc-550 group-hover:text-[#C63300]">
                  {language === 'ar' ? 'عرض الخدمات والأسعار' : 'ACCESS PORTAL'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#C63300] transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>

            {/* Professional Consultations Selector */}
            <button
              onClick={() => navigate('/consultations')}
              className="text-left p-8 border hover:border-[#C63300] transition-all text-black rounded-none cursor-pointer flex h-full min-h-[340px] flex-col bg-white border-zinc-200 hover:bg-zinc-50 group shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="p-3 bg-zinc-50 text-zinc-650 group-hover:text-white group-hover:bg-[#C63300] border border-zinc-200 group-hover:border-[#C63300] transition-all">
                    <ServiceIcon id="special-design" className="w-6 h-6" />
                  </span>
                  <span className="font-mono text-xs font-bold text-[#C63300] tracking-widest bg-zinc-50 border border-zinc-200 px-2 py-0.5">
                    4 {language === 'ar' ? 'تخصصات هندسية' : 'FIELDS'}
                  </span>
                </div>
                <h3 className="font-sans text-xl font-extrabold tracking-tight mb-2 min-h-[56px] uppercase group-hover:text-[#C63300] transition-colors">
                  {t('profConsultations')}
                </h3>
                <p className="text-xs text-zinc-650 font-mono leading-relaxed min-h-[72px]">
                  {t('profConsultationsDesc')}
                </p>
              </div>
              <div className="mt-auto pt-4 border-t border-zinc-150 w-full flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase text-zinc-550 group-hover:text-[#C63300]">
                  {language === 'ar' ? 'استشارة خبير مؤهل' : 'BOOK SURVEYOR'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#C63300] transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>

            {/* Construction & Contracting Selector (STEP 1) */}
            <button
              onClick={() => navigate('/construction')}
              className="text-left p-8 border hover:border-[#C63300] transition-all text-black rounded-none cursor-pointer flex h-full min-h-[340px] flex-col bg-white border-zinc-200 hover:bg-zinc-50 group shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="p-3 bg-zinc-50 text-zinc-650 group-hover:text-white group-hover:bg-[#C63300] border border-zinc-200 group-hover:border-[#C63300] transition-all">
                    <HardHat className="w-6 h-6" />
                  </span>
                  <span className="font-mono text-xs font-bold text-[#C63300] tracking-widest bg-zinc-50 border border-zinc-200 px-2 py-0.5">
                    16 {language === 'ar' ? 'أقسام البناء' : 'DIVISIONS'}
                  </span>
                </div>
                <h3 className="font-sans text-xl font-extrabold tracking-tight mb-2 min-h-[56px] uppercase group-hover:text-[#C63300] transition-colors">
                  {language === 'ar' ? 'البناء والمقاولات' : 'CONSTRUCTION & CONTRACTING'}
                </h3>
                <p className="text-xs text-zinc-650 font-mono leading-relaxed min-h-[72px]">
                  {language === 'ar' 
                    ? 'أشغال البناء والتشييد والقصارة وعروض الخرسانة والأنظمة الكهروميكانيكية المتكاملة للموقع.' 
                    : 'Heavy division physical solutions detailing masonry, concrete, acoustic isolation, woodwork, HVAC and electric distributions.'}
                </p>
              </div>
              <div className="mt-auto pt-4 border-t border-zinc-150 w-full flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase text-zinc-550 group-hover:text-[#C63300]">
                  {language === 'ar' ? 'استكشاف الأقسام بالتفصيل' : 'EXPLORE DIVISIONS'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#C63300] transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>

          </div>
        )}

        {/* VIEW 2 — Dynamic List view of Selected Category (Maintenance or Consultations) */}
        {view !== 'landing' && !bookingService && (
          <div className="relative">
            {/* Maintenance Category Faded Decorative background elements per Step 5 */}
            {activeCategory === 'home_maintenance' && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-10">
                {/* House Outline */}
                <svg className="absolute top-10 left-[-40px] w-48 h-48 text-black opacity-[0.03]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {/* Tool Box */}
                <svg className="absolute bottom-40 right-[-40px] w-56 h-56 text-black opacity-[0.03] rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="9" width="18" height="11" rx="2" />
                  <path d="M9 9V6a2 2 0 012-2h2a2 2 0 012 2v3" />
                  <path d="M3 13h18" />
                </svg>
                {/* Ladder */}
                <svg className="absolute top-[40%] right-[10%] w-32 h-64 text-black opacity-[0.03] -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <path d="M8 3v18M16 3v18M8 6h8M8 10h8M8 14h8M8 18h8" />
                </svg>
              </div>
            )}

            {/* Breadcrumb back links */}
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-black mb-6 uppercase tracking-wider relative z-10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('backToList')}
            </button>

            {/* Category Header Indicators */}
            <div className="border-b border-zinc-200 pb-4 mb-8 relative z-10">
              <h2 className="text-2xl font-sans font-black tracking-tight text-black uppercase font-mono">
                {activeCategory === 'home_maintenance' ? t('homeMaintenance') : t('profConsultations')}
              </h2>
              <p className="text-xs text-zinc-600 font-mono mt-1 leading-relaxed max-w-2xl">
                {activeCategory === 'home_maintenance'
                  ? t('homeMaintenanceDesc')
                  : t('profConsultationsDesc')}
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {filteredServices.map(srv => (
                <div
                  key={srv.id}
                  onClick={() => setSelectedService(srv)}
                  className="p-6 border border-zinc-200 bg-white hover:border-[#C63300] hover:bg-zinc-50/50 transition-all cursor-pointer flex flex-col justify-between group h-[260px] rounded-none shadow-sm"
                >
                  <div className="flex-grow">
                    {/* Header indicators */}
                    <div className="flex justify-between items-start mb-4 w-full">
                      <span className="p-2.5 bg-zinc-50 border border-zinc-200 text-[#C63300] group-hover:bg-[#C63300] group-hover:text-white transition-all">
                        <ServiceIcon id={srv.id} className="w-5 h-5" />
                      </span>
                      
                      {srv.category === 'home_maintenance' ? (
                        <span className="bg-zinc-100 border border-zinc-200 text-black text-[10px] font-mono font-extrabold px-2 py-0.5 uppercase tracking-wide">
                          {t('flatBookingFee')}: ${srv.booking_fee}
                        </span>
                      ) : (
                        <span className="bg-zinc-50 border border-zinc-200 text-zinc-650 text-[10px] font-mono px-2 py-0.5 uppercase tracking-wide">
                          {language === 'ar' ? 'معدل متغير' : 'QUOTE REQUEST'}
                        </span>
                      )}
                    </div>

                    <h4 className="font-sans text-md font-black tracking-tight text-black uppercase mb-1.5 group-hover:text-[#C63300] transition-colors">
                      {language === 'ar' ? srv.name_ar : srv.name_en}
                    </h4>
                    <p className="text-xs text-zinc-650 font-mono leading-relaxed line-clamp-3 mb-4">
                      {language === 'ar' ? srv.description_ar : srv.description_en}
                    </p>
                  </div>

                  {/* Action Trigger */}
                  <div className="pt-3 border-t border-zinc-150 flex justify-between items-center w-full mt-auto">
                    <button
                      onClick={(e) => handleBookNowBtn(srv, e)}
                      className="text-[10px] font-mono font-black text-[#C63300] uppercase hover:underline"
                    >
                      {language === 'ar' ? 'احجز الآن' : 'BOOK DEPLOYMENT'}
                    </button>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#C63300] transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKING MODULE VIEW */}
        {bookingService && (
          <div className="max-w-2xl mx-auto border border-zinc-200 bg-white p-6 md:p-8 shadow-sm relative z-10 text-black">
            <button
              onClick={() => setBookingService(null)}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-black mb-6 uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {language === 'ar' ? 'الرجوع ومراجعة الخدمات' : 'CANCEL BOOKING'}
            </button>

            {/* Stage Title */}
            <div className="mb-6">
              <span className="font-mono text-[9px] text-[#C63300] tracking-widest uppercase bg-zinc-50 px-2 py-1 border border-zinc-200">
                {bookingService.category === 'home_maintenance' 
                  ? t('homeMaintenance') 
                  : bookingService.category === 'construction_contracting'
                    ? (language === 'ar' ? 'أعمال البناء والمقاولات' : 'CONSTRUCTION & CONTRACTING')
                    : t('profConsultations')}
              </span>
              <h3 className="font-sans text-2xl font-black tracking-tighter text-black uppercase mt-2">
                {t('bookingFormTitle')} 
              </h3>
              <p className="text-xs text-[#C63300] font-mono font-bold mt-1 uppercase">
                {language === 'ar' ? 'مسار المهمة:' : 'TARGET UTILITY:'} {language === 'ar' ? bookingService.name_ar : bookingService.name_en}
              </p>
            </div>

            {successInfo ? (
              <div className="bg-zinc-50 border border-[#C63300] p-6 text-center text-[#C63300] font-mono my-8">
                <ShieldCheck className="w-12 h-12 mx-auto mb-3" />
                <p className="text-sm uppercase font-bold tracking-wider">{successInfo}</p>
              </div>
            ) : (
              <form onSubmit={handleCreateBooking} className="space-y-6">
                {formError && (
                  <div className="bg-red-50 border border-red-200 p-3 flex items-center gap-2.5 text-xs text-red-500 font-mono">
                    <AlertTriangle className="w-4 h-4 text-red-650 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Preferred Date */}
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-zinc-650 mb-2">
                      <Calendar className="w-3.5 h-3.5 inline mr-1 text-[#C63300]" />
                      {t('preferredDate')} *
                    </label>
                    <input
                      type="date"
                      value={prefDate}
                      onChange={e => setPrefDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-250 hover:border-[#C63300] text-black rounded-none focus:outline-none focus:border-[#C63300] font-mono text-xs"
                      required
                    />
                  </div>

                  {/* Operational Time Slot */}
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-zinc-650 mb-2">
                      <Clock className="w-3.5 h-3.5 inline mr-1 text-[#C63300]" />
                      {t('preferredTime')} *
                    </label>
                    <select
                      value={prefTimeSlot}
                      onChange={e => setPrefTimeSlot(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-zinc-250 hover:border-[#C63300] text-black rounded-none focus:outline-none focus:border-[#C63300] font-mono text-xs uppercase"
                    >
                      <option value="Morning">08:00 - 12:00 (Morning)</option>
                      <option value="Afternoon">12:00 - 16:00 (Afternoon)</option>
                      <option value="Evening">16:00 - 20:00 (Evening)</option>
                    </select>
                  </div>
                </div>

                {/* Priority Urgency Level */}
                <div>
                  <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-zinc-650 mb-2">
                    {t('urgencyLevel')} *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Normal', 'Urgent', 'Emergency'].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setUrgency(lvl as any)}
                        className={`py-2 border text-xs font-mono uppercase font-bold rounded-none cursor-pointer transition-all ${
                          urgency === lvl 
                            ? 'bg-[#C63300] text-white border-[#C63300]' 
                            : 'bg-zinc-50 text-zinc-650 border-zinc-200 hover:border-[#C63300]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Physical deployment address */}
                <div>
                  <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-zinc-650 mb-2">
                    <MapPin className="w-3.5 h-3.5 inline mr-1 text-[#C63300]" />
                    {t('addressLocation')} *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. Block 4, Street 15, Villa 29"
                    className="w-full px-3 py-2 bg-white border border-zinc-250 hover:border-[#C63300] text-black rounded-none focus:outline-none focus:border-[#C63300] font-mono text-xs"
                    required
                  />
                </div>

                {/* Job description details */}
                <div>
                  <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-zinc-650 mb-2">
                    <ClipboardList className="w-3.5 h-3.5 inline mr-1 text-[#C63300]" />
                    {t('taskDescription')} *
                  </label>
                  <textarea
                    rows={4}
                    value={issueDesc}
                    onChange={e => setIssueDesc(e.target.value)}
                    placeholder={language === 'ar' ? 'اشرح بالتفصيل نطاق العمل المطلوب لتسريع مباشرته مخرجات فنية...' : 'Specify requirements, core scope of diagnostic verification, blueprint analysis details.'}
                    className="w-full px-3 py-2 bg-white border border-zinc-250 hover:border-[#C63300] text-black rounded-none focus:outline-none focus:border-[#C63300] font-mono text-xs"
                    required
                  />
                </div>

                {/* Photo Attachments */}
                <div>
                  <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-zinc-650 mb-2">
                    <Camera className="w-3.5 h-3.5 inline mr-1 text-[#C63300]" />
                    {t('optionalPhotos')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={photoInput}
                      onChange={e => setPhotoInput(e.target.value)}
                      placeholder="Insert photo asset URL"
                      className="flex-grow px-3 py-2 bg-white border border-zinc-250 hover:border-[#C63300] text-black rounded-none focus:outline-none focus:border-[#C63300] font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={addPhoto}
                      className="px-4 py-2 bg-zinc-50 border border-zinc-200 hover:border-[#C63300] text-xs font-mono uppercase hover:text-[#C63300] cursor-pointer text-zinc-800"
                    >
                      {language === 'ar' ? 'إضافة' : 'ATTACH'}
                    </button>
                  </div>
                  {photos.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {photos.map((ph, pi) => (
                        <div key={pi} className="relative bg-zinc-50 px-2 py-1 text-[10px] font-mono text-zinc-600 border border-zinc-200 flex items-center gap-1">
                          <span className="truncate max-w-[150px]">{ph}</span>
                          <button 
                            type="button" 
                            onClick={() => setPhotos(photos.filter((_, idx) => idx !== pi))}
                            className="text-red-500 hover:text-red-400 font-extrabold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Booking Fee acknowledgement (Skip for consultations) */}
                {bookingService.category !== 'professional_consultations' ? (
                  <div className="p-4 bg-zinc-50 border border-zinc-200">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isAck}
                        onChange={e => setIsAck(e.target.checked)}
                        className="mt-1 w-4 h-4 bg-white border border-zinc-250 text-[#C63300] rounded-none focus:ring-0 cursor-pointer accent-[#C63300]"
                      />
                      <span className="text-[11px] font-mono text-zinc-600 leading-relaxed uppercase">
                        {t('acknowledgementText')}{' '}
                        <strong className="text-[#C63300]">${bookingService.booking_fee}</strong>.{' '}
                        {language === 'ar' ? 'سيتم احتساب هذا المبلغ كرسوم لحجز الفريق وتجهيز الدعم الميداني وتأكيد الزيارة بالتنسيق معكم.' : 'This serves as a security flat dispatch charge to secure our response technician crew, deploy the utility vehicle, and approve slot locks.'}
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-50 border border-zinc-200 text-[11px] font-mono text-zinc-600 uppercase leading-relaxed">
                    <Info className="w-4 h-4 text-[#C63300] inline mr-1" />
                    {language === 'ar' 
                      ? 'الاستشارات المهنية لا تتطلب رسوم حجز مسبقة. سيقوم مندوبنا بالاتصال بكم خلال ساعة لتقديم عرض مالي متكامل مبني على طبيعة الاستشارة المطلوبة.' 
                      : 'Specialized surveys are quote-driven and carry zero flat reservation fees. A dedicated technical accounts officer will connect on your coordinates within 60 minutes with custom scoping values.'}
                  </div>
                )}

                {/* Book Action Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#C63300] hover:bg-black text-white hover:text-white font-sans font-black tracking-tight uppercase transition-all duration-200 cursor-pointer flex justify-center items-center gap-2 text-sm"
                >
                  <ShieldCheck className="w-5 h-5" />
                  {t('bookNow')}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* SERVICE DETAILS DIALOG / MODAL (IF APPLICABLE for high-polish view) */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-mono">
          <div className="w-full max-w-lg bg-white border border-zinc-200 shadow-xl p-6 relative text-black">
            <button
               onClick={() => setSelectedService(null)}
               className="absolute top-4 right-4 text-zinc-500 hover:text-black text-lg font-bold cursor-pointer"
            >
              ×
            </button>
            
            <div className="mb-4">
              <span className="p-2 inline-block bg-zinc-50 text-[#C63300] border border-zinc-200">
                <ServiceIcon id={selectedService.id} className="w-6 h-6" />
              </span>
              <h3 className="text-xl font-sans font-black text-black uppercase mt-3">
                {language === 'ar' ? selectedService.name_ar : selectedService.name_en}
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                {selectedService.category === 'home_maintenance' ? t('homeMaintenance') : t('profConsultations')}
              </p>
            </div>

            <div className="py-4 border-t border-b border-zinc-200 my-4 text-xs text-zinc-655 leading-relaxed">
              {language === 'ar' ? selectedService.description_ar : selectedService.description_en}
            </div>

            <div className="flex justify-between items-center">
              <div>
                {selectedService.category === 'home_maintenance' ? (
                  <span className="text-[11px] uppercase text-zinc-500">
                    {t('flatBookingFee')}: <strong className="text-[#C63300]">${selectedService.booking_fee}</strong>
                  </span>
                ) : (
                  <span className="text-[11px] uppercase text-[#C63300] font-bold">
                    VARIABLE / SCORING QUOTE
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedService(null)}
                  className="px-3 py-1.5 border border-zinc-200 hover:border-black text-xs text-zinc-500 hover:text-black uppercase transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'أغلق' : 'CLOSE'}
                </button>
                <button
                  onClick={() => handleBookNowBtn(selectedService)}
                  className="px-4 py-1.5 bg-[#C63300] text-white hover:bg-black hover:text-white text-xs font-black uppercase transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'ابدأ الحجز' : 'BOOK SERVICE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 py-10 text-center font-mono text-zinc-500 text-[10px] uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 SHED.SERVICES GLOBAL FIELD DEPLOYMENT NETWORKS. ENCRYPTED & SECURED.</p>
        </div>
      </footer>
    </div>
  );
};
