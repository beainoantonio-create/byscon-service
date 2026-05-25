import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import db, { SEED_SERVICES } from '../lib/db';
import { Service, Booking } from '../types';
import { ServiceIcon } from '../components/ServiceIcon';
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Plus, 
  Upload, 
  Check, 
  CheckSquare, 
  FileText,
  Building,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';

interface HomeProps {
  view?: 'landing' | 'maintenance' | 'consultations';
}

export const Home: React.FC<HomeProps> = ({ view = 'landing' }) => {
  const { user, profile } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  // Active state repositories
  const [services, setServices] = useState<Service[]>(SEED_SERVICES);
  const [activeCategory, setActiveCategory] = useState<'home_maintenance' | 'professional_consultations'>('home_maintenance');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Synchronize category based on the routed view
  useEffect(() => {
    if (view === 'maintenance') {
      setActiveCategory('home_maintenance');
    } else if (view === 'consultations') {
      setActiveCategory('professional_consultations');
    }
  }, [view]);
  
  // Handlers for the Booking Flow
  const [bookingService, setBookingService] = useState<Service | null>(null);
  
  // Booking Form State
  const [prefDate, setPrefDate] = useState('');
  const [prefTimeSlot, setPrefTimeSlot] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [urgency, setUrgency] = useState<'Normal' | 'Urgent' | 'Emergency'>('Normal');
  const [address, setAddress] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [photos, setPhotos] = useState<string[]>([]); // Base64 data URLs
  const [isAck, setIsAck] = useState(false);
  
  // UI Helpers
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Read live services from DB
    const loadServices = async () => {
      try {
        const loaded = await db.getServices();
        setServices(loaded);
      } catch (err) {
        console.error("Failed to load services", err);
      }
    };
    loadServices();
  }, []);

  const handleBookNowBtn = (srv: Service, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent opening service card details click conflict
    }
    
    if (!user) {
      // Not logged in - redirect to login
      navigate('/login');
      return;
    }

    // Initialize values
    setBookingService(srv);
    setSelectedService(null); // Close detail modal if open
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

  const handleFileUpload = (filesList: FileList | null) => {
    if (!filesList) return;
    setFormError('');

    const newPhotos = [...photos];
    if (newPhotos.length + filesList.length > 3) {
      setFormError(t('serviceLimitExceeded'));
      return;
    }

    Array.from(filesList).forEach(file => {
      if (!file.type.startsWith('image/')) {
        setFormError(language === 'ar' ? 'تنبيه: يُسمح فقط بملفات الصور.' : 'Notice: Only image files are permitted.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && newPhotos.length < 3) {
          newPhotos.push(event.target.result as string);
          setPhotos([...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const submitBookingForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError('');

    if (!prefDate || !address || !issueDesc) {
      setFormError(language === 'ar' ? 'يرجى إكمال جميع الحقول الإلزامية.' : 'Please completely fill general fields.');
      return;
    }

    // Validate booking fee acknowledgement for Home Maintenance
    if (bookingService?.category === 'home_maintenance' && !isAck) {
      setFormError(t('ackRequired'));
      return;
    }

    setLoading(true);

    try {
      const fee = bookingService?.booking_fee || 0;
      await db.createBooking({
        user_id: user.id,
        user_name: profile?.full_name || user.email || 'SHED client',
        user_phone: profile?.phone || '',
        user_email: user.email || '',
        service_id: bookingService!.id,
        service_name_en: bookingService!.name_en,
        service_name_ar: bookingService!.name_ar,
        category_id: bookingService!.category,
        date: prefDate,
        time_slot: prefTimeSlot,
        urgency,
        address,
        description: issueDesc,
        photos,
        booking_fee: fee
      });

      // Clear layout state and show spectacular success modal or feedback
      setSuccessInfo(t('bookingSucc'));
      setTimeout(() => {
        setBookingService(null);
        navigate('/dashboard');
      }, 2500);

    } catch (err: any) {
      setFormError(err?.message || (language === 'ar' ? 'فشل حجز الخدمة. حاول مرة أخرى.' : 'Booking dispatch failed. Retry.'));
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(s => s.category === activeCategory && s.active);

  return (
    <div id="home-view-container" className="bg-black text-white min-h-[calc(100vh-4.5rem)] pb-18">
      {/* 1. Hero Spotlight - ONLY on landing */}
      {view === 'landing' && (
        <section id="hero-spotlight" className="relative border-b border-gray-900 bg-black py-16 sm:py-24 overflow-hidden">
          {/* Abstract grids / High contrast vector style */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(204,255,0,0.06),transparent_40%)] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 border border-lime-primary text-lime-primary text-[10px] font-mono tracking-widest font-bold uppercase rounded-none mb-6">
              <Sparkles className="w-3 h-3" />
              {t('heroTagline')}
            </span>
            <h1 className="font-sans text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none text-white uppercase">
              WE ARE <span className="text-lime-primary">SHED</span>
            </h1>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* VIEW 1 — Landing page: Show ONLY the two big category cards */}
        {view === 'landing' && (
          <div id="category-panel-selector" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Home Maintenance Selector */}
            <button
              onClick={() => navigate('/maintenance')}
              className="text-left p-8 border hover:border-lime-primary transition-all text-white rounded-none cursor-pointer flex flex-col justify-between bg-black border-gray-900 hover:bg-zinc-950 group h-[320px]"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="p-3 rounded-none bg-gray-900 text-gray-400 group-hover:text-lime-primary group-hover:bg-black border group-hover:border-lime-primary transition-colors">
                    <Building className="w-6 h-6" />
                  </span>
                  <span className="font-mono text-xs font-bold text-lime-primary tracking-widest bg-zinc-900 border border-zinc-900 px-2 py-0.5">
                    12 {language === 'ar' ? 'خدمة مدمجة' : 'SERVICES'}
                  </span>
                </div>
                <h3 className="font-sans text-xl font-extrabold tracking-tight mb-2 uppercase group-hover:text-lime-primary transition-colors">
                  {t('homeMaintenance')}
                </h3>
                <p className="text-xs text-gray-500 font-mono leading-relaxed">
                  {language === 'ar' 
                    ? 'حلول صيانة منزلية فورية ومميزة تغطي الكهرباء، السباكة، التكييف، التبليط، والعزل برسوم حجز ثابتة وواضحة.'
                    : 'Instant in-house physical infrastructure updates, servicing carpentry, mechanics, plumbing, painting, and overall inspection.'}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-900 w-full flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase text-gray-400">
                  {language === 'ar' ? 'عرض خدمات الفئة' : 'EXPLORE UTILITIES'}
                </span>
                <ArrowRight className="w-4 h-4 text-lime-primary transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>

            {/* Professional Consultations Selector */}
            <button
              onClick={() => navigate('/consultations')}
              className="text-left p-8 border hover:border-lime-primary transition-all text-white rounded-none cursor-pointer flex flex-col justify-between bg-black border-gray-900 hover:bg-zinc-950 group h-[320px]"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="p-3 rounded-none bg-gray-900 text-gray-400 group-hover:text-lime-primary group-hover:bg-black border group-hover:border-lime-primary transition-colors">
                    <Sparkles className="w-6 h-6" />
                  </span>
                  <span className="font-mono text-xs font-bold text-lime-primary tracking-widest bg-zinc-900 border border-zinc-900 px-2 py-0.5">
                    4 {language === 'ar' ? 'استشارات كبرى' : 'FIELDS'}
                  </span>
                </div>
                <h3 className="font-sans text-xl font-extrabold tracking-tight mb-2 uppercase group-hover:text-lime-primary transition-colors">
                  {t('profConsultations')}
                </h3>
                <p className="text-xs text-gray-500 font-mono leading-relaxed">
                  {language === 'ar'
                    ? 'رسم المخططات الهندسية، إدارة المقاولات، والتصميم الداخلي مع مهندسينا ومصممينا المتخصصين المعتمدين.'
                    : 'On-demand contracting, structural architecture, interior design layout styling, and mechanical design consultancy.'}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-900 w-full flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase text-gray-400">
                  {language === 'ar' ? 'عرض الاستشارات' : 'EXPLORE SCHEMES'}
                </span>
                <ArrowRight className="w-4 h-4 text-lime-primary transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </button>
          </div>
        )}

        {/* VIEW 2A / 2B — Category Pages */}
        {view !== 'landing' && (
          <>
            {/* Back Button */}
            <button
              onClick={() => navigate('/')}
              className="mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-gray-400 hover:text-lime-primary border border-gray-900 hover:border-lime-primary px-4 py-2 bg-black transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </button>

            {/* Category Header Indicators */}
            <div className="border-b border-gray-900 pb-4 mb-8">
              <h2 className="text-2xl font-sans font-black tracking-tight text-white uppercase">
                {activeCategory === 'home_maintenance' ? t('homeMaintenance') : t('profConsultations')}
              </h2>
              <p className="text-xs text-gray-500 font-mono mt-1">
                {activeCategory === 'home_maintenance'
                  ? (language === 'ar' ? 'جميع الخدمات المقدمة تخضع لرسوم حجز ثابتة تورد للشركة' : 'ALL INFRASTRUCTURE REPAIRS CARRY STANDARDIZED BOOKING RATES')
                  : (language === 'ar' ? 'استشارات متخصصة تهدف لتحليل ودراسة نطاق المشاريع' : 'EXPERT DESIGN AND ENGINEERING ANALYSIS SURVEYS')}
              </p>
            </div>

            {/* Services Grid */}
            <div id="services-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(srv => (
                <div
                  key={srv.id}
                  onClick={() => setSelectedService(srv)}
                  className="group bg-black border border-gray-900 hover:border-lime-primary transition-all p-6 relative flex flex-col justify-between cursor-pointer min-h-[300px]"
                >
                  <div>
                    {/* Header indicators */}
                    <div className="flex justify-between items-start mb-6 w-full">
                      <span className="p-2.5 bg-gray-950 border border-gray-900 text-lime-primary group-hover:bg-lime-primary group-hover:text-black transition-all">
                        <ServiceIcon id={srv.id} className="w-5 h-5" />
                      </span>
                      
                      {srv.category === 'home_maintenance' ? (
                        <span className="bg-lime-primary text-black text-[10px] font-mono font-extrabold px-2 py-0.5 uppercase tracking-wide">
                          {t('flatBookingFee')}: ${srv.booking_fee}
                        </span>
                      ) : (
                        <span className="border border-gray-800 text-gray-500 text-[10px] font-mono px-2 py-0.5 uppercase">
                          {t('noBookingFee')}
                        </span>
                      )}
                    </div>

                    {/* Service Metadata */}
                    <h4 className="font-sans text-lg font-black tracking-tight text-white uppercase mb-2 group-hover:text-lime-primary transition-colors">
                      {language === 'ar' ? srv.name_ar : srv.name_en}
                    </h4>
                    <p className="text-xs text-gray-500 font-mono leading-relaxed line-clamp-3 mb-6">
                      {language === 'ar' ? srv.description_ar : srv.description_en}
                    </p>
                  </div>

                  {/* Action Trigger */}
                  <div className="w-full">
                    <div className="w-full h-[1px] bg-gray-950 mb-4 group-hover:bg-lime-primary/20 transition-colors"></div>
                    <button
                      onClick={(e) => handleBookNowBtn(srv, e)}
                      className="w-full py-3 bg-lime-primary text-black hover:bg-white text-xs font-mono font-black uppercase tracking-wider transition-all block text-center border border-lime-primary hover:border-white cursor-pointer"
                    >
                      {t('bookNow')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ==========================================
          MODAL A: SERVICE DETAILS & OVERVIEW
         ========================================== */}
      {selectedService && (
        <div id="service-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-black border border-gray-900 p-8 relative">
            {/* Lime top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-lime-primary"></div>
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 p-1 bg-gray-950 text-gray-400 hover:text-white border border-gray-800 hover:border-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content Profile */}
            <div className="flex items-center gap-4 mb-6">
              <span className="p-3.5 bg-lime-primary text-black font-semibold">
                <ServiceIcon id={selectedService.id} className="w-6 h-6" />
              </span>
              <div>
                <span className="font-mono text-[10px] text-lime-primary tracking-widest uppercase bg-zinc-950 px-2 py-0.5 border border-zinc-900">
                  {selectedService.category === 'home_maintenance' ? t('homeMaintenance') : t('profConsultations')}
                </span>
                <h3 className="font-sans text-2xl font-black text-white uppercase mt-1">
                  {language === 'ar' ? selectedService.name_ar : selectedService.name_en}
                </h3>
              </div>
            </div>

            <div className="space-y-4 font-mono text-xs text-gray-400 leading-relaxed mb-8">
              <p className="bg-zinc-950 p-4 border border-zinc-900 text-white rounded-none leading-relaxed">
                {language === 'ar' ? selectedService.description_ar : selectedService.description_en}
              </p>

              {selectedService.category === 'home_maintenance' ? (
                <div className="flex justify-between items-center p-3 border border-lime-primary/30 bg-lime-primary/5">
                  <span className="text-white uppercase font-bold">{t('flatBookingFee')}</span>
                  <span className="text-lime-primary text-sm font-black tracking-wider">${selectedService.booking_fee}</span>
                </div>
              ) : (
                <div className="flex justify-between items-center p-3 border border-gray-900 bg-zinc-950">
                  <span className="text-gray-400 uppercase">{t('flatBookingFee')}</span>
                  <span className="text-white text-xs uppercase font-extrabold tracking-widest">{t('noBookingFee')}</span>
                </div>
              )}

              <div className="flex gap-2 text-[10px] text-gray-500 items-start pt-2">
                <Info className="w-4 h-4 text-lime-primary shrink-0 mt-0.5" />
                <p>
                  {language === 'ar' 
                    ? 'سيتم تولي الخدمة بالكامل من قبل فنيي شيد ومهندسيها الداخليين طبقاً لمعايير الإنجاز الفني المتفوق.'
                    : 'All service parameters are strictly fulfilled by certified internal SHED technicians and in-house lead specialists.'}
                </p>
              </div>
            </div>

            {/* Modal Action CTA */}
            <button
              onClick={() => handleBookNowBtn(selectedService)}
              className="w-full py-4 bg-lime-primary text-black hover:bg-white text-sm font-mono font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              {t('bookNow')}
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL B: COMPREHENSIVE BOOKING FLOW
         ========================================== */}
      {bookingService && (
        <div id="booking-flow-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-black border border-gray-900 p-6 sm:p-8 my-8 relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-lime-primary"></div>
            
            {/* Close */}
            <button
              onClick={() => setBookingService(null)}
              className="absolute top-4 right-4 p-1 bg-gray-950 text-gray-400 hover:text-white border border-gray-800 hover:border-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Stage Title */}
            <div className="mb-6">
              <span className="font-mono text-[9px] text-lime-primary tracking-widest uppercase bg-zinc-950 px-2 py-0.5 border border-zinc-900">
                {bookingService.category === 'home_maintenance' ? t('homeMaintenance') : t('profConsultations')}
              </span>
              <h3 className="font-sans text-2xl font-bold tracking-tight text-white uppercase mt-2">
                {t('bookingFormTitle')} 
                <span className="text-lime-primary">
                  {language === 'ar' ? bookingService.name_ar : bookingService.name_en}
                </span>
              </h3>
            </div>

            {successInfo ? (
              <div className="p-8 text-center bg-zinc-950 border border-lime-primary text-white rounded-none">
                <CheckSquare className="w-16 h-16 text-lime-primary mx-auto mb-4 animate-bounce" />
                <h4 className="font-sans text-xl font-bold uppercase mb-2">SUCCESSFULLY ASSIGNED DETECTOR</h4>
                <p className="font-mono text-sm leading-relaxed text-gray-400">
                  {successInfo}
                </p>
              </div>
            ) : (
              <form onSubmit={submitBookingForm} className="space-y-5">
                {formError && (
                  <div className="p-4 bg-black border border-red-500 rounded-none flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-white font-mono break-all">{formError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Preferred Date */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      {t('preferredDate')} *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                        <Calendar className="w-4 h-4" />
                      </span>
                      <input
                        type="date"
                        value={prefDate}
                        onChange={e => setPrefDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-black border border-gray-800 text-white rounded-none focus:outline-none focus:border-lime-primary font-mono text-sm"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Preferred Time Slot */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      {t('preferredTime')} *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                        <Clock className="w-4 h-4" />
                      </span>
                      <select
                        value={prefTimeSlot}
                        onChange={e => setPrefTimeSlot(e.target.value as any)}
                        className="w-full pl-10 pr-4 py-2 bg-black border border-gray-800 text-white rounded-none focus:outline-none focus:border-lime-primary font-mono text-sm uppercase leading-none"
                      >
                        <option value="Morning">{t('morning')}</option>
                        <option value="Afternoon">{t('afternoon')}</option>
                        <option value="Evening">{t('evening')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Urgency selection */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      {t('urgencyLevel')} *
                    </label>
                    <div className="flex gap-2">
                      {(['Normal', 'Urgent', 'Emergency'] as const).map(u => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setUrgency(u)}
                          className={`flex-1 py-2 font-mono text-xs font-bold uppercase transition-all border ${
                            urgency === u
                              ? 'bg-lime-primary text-black border-lime-primary'
                              : 'bg-black text-gray-500 border-gray-800 hover:text-white'
                          }`}
                        >
                          {u === 'Normal' ? t('normal') : u === 'Urgent' ? t('urgent') : t('emergency')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Physical Location */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      {t('serviceAddress')} *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="District, Road Name, Building 14"
                        className="w-full pl-10 pr-4 py-2 bg-black border border-gray-800 text-white rounded-none focus:outline-none focus:border-lime-primary font-mono text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Scope Description */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    {t('issueDescription')} *
                  </label>
                  <div className="relative">
                    <span className="absolute top-2.5 left-3 text-gray-600">
                      <FileText className="w-4 h-4" />
                    </span>
                    <textarea
                      value={issueDesc}
                      onChange={e => setIssueDesc(e.target.value)}
                      placeholder={language === 'ar' ? 'اكتب تفاصيل الطلب أو طبيعة المشكلة...' : 'Describe the explicit requirements or plumbing pipe breakdown detail...'}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2.5 bg-black border border-gray-800 text-white rounded-none focus:outline-none focus:border-lime-primary font-mono text-xs leading-relaxed"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Drag-and-Drop Photo Upload Interface */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-2">
                    {t('photoUpload')}
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed py-6 px-4 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-lime-primary bg-lime-primary/5 text-lime-primary'
                        : 'border-gray-800 hover:border-lime-primary hover:bg-zinc-950 text-gray-400'
                    }`}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-lime-primary" />
                    <p className="font-mono text-[11px] uppercase tracking-wide">
                      {t('dragDropText')}
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={e => handleFileUpload(e.target.files)}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* Thumbnail Previews */}
                  {photos.length > 0 && (
                    <div className="flex gap-3 mt-3">
                      {photos.map((pt, idx) => (
                        <div key={idx} className="relative w-16 h-16 border border-gray-800 bg-zinc-950">
                          <img src={pt} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotos(photos.filter((_, i) => i !== idx));
                            }}
                            className="absolute -top-1 -right-1 bg-black border border-gray-850 hover:border-red-500 hover:text-red-500 rounded p-0.5 text-[8p] leading-none"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center text-gray-500 text-[10px] font-mono uppercase">
                        {photos.length}/3 {language === 'ar' ? 'صور محملة' : 'FILES LOADED'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Booking Fee Acknowledgement (Required for Home Maintenance) */}
                {bookingService.category === 'home_maintenance' && (
                  <div className="p-4 bg-zinc-950 border border-lime-primary/30">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAck}
                        onChange={e => setIsAck(e.target.checked)}
                        className="w-4.5 h-4.5 mt-0.5 accent-lime-primary text-black border border-gray-800 bg-black"
                      />
                      <span className="font-mono text-xs text-gray-300 select-none leading-normal">
                        {t('acknowledgementText')}{' '}
                        <strong className="text-lime-primary font-black">
                          ${bookingService.booking_fee}
                        </strong>{' '}
                        {language === 'ar' ? 'عن رسوم الحجز الثابتة.' : 'for home dispatch assignment.'} *
                      </span>
                    </label>
                  </div>
                )}

                {/* Confirm Dispatch CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-2 bg-lime-primary text-black hover:bg-white text-sm font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{loading ? 'TRANSMITTING REQUEST...' : t('confirmBookingBtn')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
