import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../data';
import ServiceIcon from '../components/ServiceIcon';
import { TimeSlot, UrgencyLevel, Booking } from '../types';

export const BookingFlow: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { language, currentUser, services, createBooking, toggleLanguage, logout } = useApp();
  const t = TRANSLATIONS[language];

  // Find the requested service
  const service = services.find((s) => s.id === serviceId);

  // Redirect if service not found
  useEffect(() => {
    if (!service) {
      navigate('/');
    }
  }, [service, navigate]);

  // Protect route
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/book/${serviceId}` } });
    }
  }, [currentUser, navigate, serviceId]);

  // States
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('morning');
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!service || !currentUser) return null;

  const isMaintenance = service.categoryId === 'maintenance';

  // Handle file uploads (Base64 conversions)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>, isDrag = false) => {
    setErrorMsg('');
    let files: FileList | null = null;

    if (isDrag) {
      const dragEvent = e as React.DragEvent<HTMLDivElement>;
      files = dragEvent.dataTransfer.files;
    } else {
      const changeEvent = e as React.ChangeEvent<HTMLInputElement>;
      files = changeEvent.target.files;
    }

    if (!files) return;

    const availableSlots = 3 - photos.length;
    if (files.length > availableSlots) {
      setErrorMsg(language === 'en' 
        ? `You can only upload up to 3 photos. Remaining slots: ${availableSlots}`
        : `يمكنك رفع ٣ صور كحد أقصى. الأماكن المتبقية: ${availableSlots}`
      );
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.type.match('image.*')) {
        setErrorMsg(language === 'en' ? 'Only image files are allowed.' : 'الرجاء إرفاق صور فقط.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!date || !address || !description) {
      setErrorMsg(language === 'en' ? 'Please complete all required fields.' : 'الرجاء إكمال كافة الحقول المطلوبة.');
      return;
    }

    // Require checkbox fee acknowledgment as configured
    if (!acknowledged) {
      setErrorMsg(t.msgAckRequired);
      return;
    }

    try {
      createBooking({
        serviceId: service.id,
        serviceNameEn: service.nameEn,
        serviceNameAr: service.nameAr,
        categoryId: service.categoryId,
        date,
        timeSlot,
        urgency,
        address,
        description,
        photos,
        bookingFee: isMaintenance ? service.bookingFee : undefined
      });

      setSuccessMsg(t.bookingSuccess);
      
      // Delay redirecting so the success bar is clearly readable
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setErrorMsg(language === 'en' ? 'An error occurred. Please try again.' : 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.');
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
            <Link to="/dashboard" className="tracking-widest text-white hover:text-[#CCFF00] uppercase transition-colors">
              {t.navBookings}
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

      {/* BODY CONTENT FORM */}
      <main className="flex-grow max-w-4xl mx-auto w-full p-6 md:p-12">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs text-[#CCFF00] hover:underline mb-8 uppercase">
          <ServiceIcon name={language === 'ar' ? 'ChevronRight' : 'ChevronLeft'} className="w-3 h-3" />
          <span>{language === 'en' ? 'Back to Services Catalog' : 'العودة لقائمة الخدمات'}</span>
        </Link>

        {/* Outer Booking Card Container */}
        <div className="border border-[#1A1A1A]/50 bg-[#1A1A1A] p-8 relative rounded-3xl shadow-2xl">
          
          {/* Neon flanges */}
          <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 w-2 h-2 rounded-full bg-[#CCFF00]"></div>

          <div className="border-b border-[#CCFF00]/10 pb-6 mb-8">
            <span className="font-mono text-[10px] text-[#CCFF00] uppercase tracking-widest">{t.bookingFormTitle}</span>
            <h2 className="text-3xl font-sans font-black tracking-tight uppercase text-white mt-1.5 flex items-center gap-3">
              <span className="text-[#CCFF00]">
                <ServiceIcon name={service.icon} className="w-8 h-8" />
              </span>
              <span>
                {language === 'en' ? service.nameEn : service.nameAr}
              </span>
            </h2>
          </div>

          {/* Alert bars */}
          {errorMsg && (
            <div className="border border-red-500 bg-black/40 text-white p-4 text-sm font-sans mb-6 relative rounded-xl">
              <p className="text-red-400 font-sans font-bold uppercase tracking-wide flex items-center gap-2">
                <ServiceIcon name="AlertTriangle" className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            </div>
          )}

          {successMsg && (
            <div className="border border-[#CCFF00] bg-black/40 p-4 text-sm font-sans mb-6 rounded-xl">
              <p className="text-[#CCFF00] font-sans font-bold flex items-center gap-2">
                <ServiceIcon name="CheckCircle" className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Schedule settings */}
              <div className="space-y-6">
                
                {/* 1. Preferred Date */}
                <div>
                  <label className="block text-xs font-mono tracking-widest uppercase mb-2 text-white/70">
                    {t.fieldPreferredDate} *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-black border border-neutral-800 hover:border-neutral-700 focus:border-[#CCFF00] text-white px-4 py-3 text-sm rounded-xl tracking-wide focus:outline-none transition-all font-sans"
                  />
                </div>

                {/* 2. Preferred time slot */}
                <div>
                  <label className="block text-xs font-mono tracking-widest uppercase mb-2 text-white/70">
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
                        className={`flex items-center gap-3 p-3 border cursor-pointer transition-all rounded-xl ${
                          timeSlot === slot.value
                            ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-[#CCFF00]'
                            : 'border-white/5 bg-black hover:border-white/10'
                        }`}
                      >
                        <input
                          type="radio"
                          name="timeSlot"
                          checked={timeSlot === slot.value}
                          onChange={() => setTimeSlot(slot.value as TimeSlot)}
                          className="accent-[#CCFF00] h-4 w-4 bg-black"
                        />
                        <span className="text-xs font-mono uppercase tracking-wider">{slot.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 3. Urgency level */}
                <div>
                  <label className="block text-xs font-mono tracking-widest uppercase mb-2 text-white/70">
                    {t.fieldUrgency} *
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'normal', label: t.urgencyNormal },
                      { value: 'urgent', label: t.urgencyUrgent },
                      { value: 'emergency', label: t.urgencyEmergency }
                    ].map((urg) => (
                      <label
                        key={urg.value}
                        className={`flex items-center gap-3 p-3 border cursor-pointer transition-all rounded-xl ${
                          urgency === urg.value
                            ? 'border-[#CCFF00] bg-[#CCFF00]/15 text-[#CCFF00] font-black'
                            : 'border-white/5 bg-black hover:border-white/10'
                        }`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          checked={urgency === urg.value}
                          onChange={() => setUrgency(urg.value as UrgencyLevel)}
                          className="accent-[#CCFF00] h-4 w-4"
                        />
                        <span className="text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                          {urg.value === 'emergency' && <span className="bg-[#CCFF00] text-black text-[9px] px-1.5 py-0.5 font-black rounded-sm">EMERGENCY</span>}
                          <span>{urg.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Address, issue description, photos */}
              <div className="space-y-6">
                
                {/* Address */}
                <div>
                  <label className="block text-xs font-mono tracking-widest uppercase mb-2 text-white/70">
                    {t.fieldAddress} *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={language === 'en' ? "District name, Street, Building, Apartment No" : "اسم الحي، الشارع، المبنى، رقم الشقة بالتفصيل"}
                    className="w-full bg-black border border-neutral-800 hover:border-neutral-700 focus:border-[#CCFF00] text-white px-4 py-3 text-sm rounded-xl tracking-wide focus:outline-none transition-all font-sans"
                  />
                </div>

                {/* Fault description */}
                <div>
                  <label className="block text-xs font-mono tracking-widest uppercase mb-2 text-white/70">
                    {t.fieldDescription} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={language === 'en' ? "Please outline the exact symptoms of the problem..." : "يرجى كتابة تفاصيل المشكلة أو طلب الاستشارة بوضوح..."}
                    className="w-full bg-black border border-neutral-800 hover:border-neutral-700 focus:border-[#CCFF00] text-white px-4 py-3 text-sm rounded-xl tracking-wide focus:outline-none transition-all font-sans"
                  />
                </div>

                {/* Photos upload option */}
                <div>
                  <label className="block text-xs font-mono tracking-widest uppercase mb-2 text-[#CCFF00]">
                    {t.fieldPhotos} ({t.fileLimitMsg})
                  </label>
                  
                  {/* File Drag and Drop Box */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handlePhotoUpload(e, true);
                    }}
                    className={`border border-dashed p-4 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-[#CCFF00] bg-[#CCFF00]/10' 
                        : 'border-white/20 hover:border-[#CCFF00]/60'
                    }`}
                  >
                    <input
                      type="file"
                      id="photos-file"
                      multiple
                      disabled={photos.length >= 3}
                      onChange={(e) => handlePhotoUpload(e, false)}
                      className="hidden"
                      accept="image/*"
                    />
                    <label htmlFor="photos-file" className="block cursor-pointer">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <ServiceIcon name="Sprout" className="w-6 h-6 text-[#CCFF00]" />
                        <span className="text-[11px] font-sans font-bold">{t.fileDragDrop}</span>
                        <span className="text-[9px] font-mono text-white/50">{photos.length}/3 photos attached</span>
                      </div>
                    </label>
                  </div>

                  {/* Previews */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {photos.map((src, idx) => (
                        <div key={idx} className="relative aspect-square border border-white/20 group">
                          <img
                            src={src}
                            alt={`Upload Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 bg-black text-[#CCFF00] border border-[#CCFF00] p-1 text-[8px] font-bold hover:bg-[#CCFF00] hover:text-black transition-all cursor-pointer shadow-md rounded-none uppercase font-mono"
                          >
                            REMOVE
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Price tag & terms acknowledgment */}
            <div className="p-6 bg-white/[0.02] border border-white/10 mt-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h4 className="font-sans font-black text-lg tracking-tight uppercase leading-none">
                    {language === 'en' ? 'TENDER BREAKDOWN' : 'تفاصيل أجور التأسيس والطلب'}
                  </h4>
                  <p className="text-[10px] font-mono text-white/55 tracking-wider uppercase mt-1">
                    {language === 'en' ? 'Administrative service booking fee' : 'قيمة حجز الخدمة المحددة في النظام'}
                  </p>
                </div>

                <div className="font-mono">
                  {isMaintenance && service.bookingFee !== undefined ? (
                    <div className="text-right rtl:text-left">
                      <span className="text-2xl font-black text-[#CCFF00]">{service.bookingFee}</span>
                      <span className="text-sm font-bold text-white ml-2 rtl:mr-2 rtl:ml-0">{t.bookingFeeCurrency}</span>
                    </div>
                  ) : (
                    <div className="text-right rtl:text-left text-xs text-white/70 uppercase">
                      {language === 'en' ? 'Rate on Inquiry' : 'حسب الدراسة والمعاينة'}
                    </div>
                  )}
                </div>
              </div>

              {/* Checkbox Acknowledgment */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="accent-[#CCFF00] h-5 w-5 mt-0.5 shrink-0"
                />
                <span className="text-xs text-white/80 leading-relaxed font-sans font-medium">
                  {isMaintenance && service.bookingFee !== undefined ? (
                    <>
                      {t.feeAckLabel} <span className="text-[#CCFF00] font-sans font-bold underline">{service.bookingFee} {t.bookingFeeCurrency}</span>.
                    </>
                  ) : (
                    t.feeAckLabelConsultation
                  )}
                </span>
              </label>
            </div>

            {/* Submission button */}
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-4 text-xs font-mono tracking-widest font-black uppercase rounded-none border-2 border-[#CCFF00] transition-all flex items-center justify-center gap-3 ${
                  acknowledged 
                    ? 'bg-[#CCFF00] text-black hover:bg-black hover:text-[#CCFF00] cursor-pointer' 
                    : 'bg-black text-[#CCFF00]/50 border-[#CCFF00]/40 cursor-not-allowed opacity-60'
                }`}
              >
                <ServiceIcon name="CheckCircle" className="w-4 h-4" />
                <span>{t.btnConfirmBooking}</span>
              </button>
            </div>
          </form>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#CCFF00]/20 bg-black p-4 text-center mt-12">
        <p className="font-mono text-[10px] text-white/40 tracking-wider">
          © {new Date().getFullYear()} {t.appName} SYSTEMS. SECURED CLIENT DISPATCH. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
};
export default BookingFlow;
