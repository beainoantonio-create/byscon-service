import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { TRANSLATIONS, INITIAL_CATEGORIES } from '../data';
import ServiceIcon from '../components/ServiceIcon';
import { Service, Category } from '../types';

export const Home: React.FC = () => {
  const { language, currentUser, services, toggleLanguage, logout } = useApp();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];

  // Homepage internal states
  const [selectedCategory, setSelectedCategory] = useState<'maintenance' | 'consultation' | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Filter services based on category
  const filteredServices = services.filter(s => s.categoryId === selectedCategory);

  const handleBookService = (serviceId: string) => {
    if (!currentUser) {
      // Direct guest to login first, passing the source service to return to
      navigate('/login', { state: { from: `/book/${serviceId}` } });
    } else {
      navigate(`/book/${serviceId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* HEADER / NAVIGATION BAR */}
      <header className="border-b border-[#1A1A1A] bg-black sticky top-0 z-40 backdrop-blur-md">
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

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-center">
            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs">
                <div className="text-white/70 border-r border-[#1A1A1A] pr-4 rtl:border-r-0 rtl:border-l rtl:pr-0 rtl:pl-4 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]"></span>
                  <span className="text-[#CCFF00] font-sans font-bold">{currentUser.name}</span> 
                  <span className="text-[9px] uppercase font-bold text-[#CCFF00] bg-white/5 border border-white/10 px-1.5 py-0.5 ml-1.5 rtl:mr-1.5 rtl:ml-0">
                    {currentUser.role === 'admin' ? t.roleAdmin : t.roleCustomer}
                  </span>
                </div>
                
                <Link to="/dashboard" className="tracking-widest text-white hover:text-[#CCFF00] uppercase transition-colors">
                  {t.navBookings}
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
              </div>
            ) : (
              <div className="flex items-center gap-2 font-mono text-xs">
                <Link to="/login" className="tracking-widest text-[#CCFF00] border border-[#CCFF00]/40 px-3 py-1.5 uppercase hover:bg-[#CCFF00] hover:text-black transition-all">
                  {t.navLogin}
                </Link>
                <Link to="/login" className="tracking-widest text-white bg-white/5 border border-white/10 px-3 py-1.5 uppercase hover:bg-white hover:text-black transition-all">
                  {t.navSignup}
                </Link>
              </div>
            )}

            <button
              onClick={toggleLanguage}
              className="border border-[#CCFF00]/60 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black font-mono text-xs px-3 py-1.5 tracking-widest transition-all cursor-pointer uppercase rounded-sm"
            >
              {t.langToggle}
            </button>
          </div>
        </div>
      </header>

      {/* HERO HERO SECTION */}
      <section className="bg-black py-16 border-b border-[#CCFF00]/10 px-6 relative overflow-hidden">
        {/* Abstract futuristic subtle grid background overlay in grayscale */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #CCFF00 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-block border border-[#CCFF00] bg-black text-[#CCFF00] px-3 py-1 text-xs font-mono tracking-widest mb-6 uppercase">
            {t.appSubtitle}
          </div>
          <h2 className="text-4xl md:text-6xl font-sans font-black tracking-tight mb-4 uppercase">
            {t.heroTitle}
          </h2>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-white/60 font-mono tracking-wider leading-relaxed">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* MAIN LAYOUT: DEPARTMENTS AND SERVICES */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-6 md:p-12 px-6">
        
        {/* Categories Level (Always visible or toggle back to) */}
        {!selectedCategory ? (
          <div>
            <div className="mb-8 border-l-4 border-[#CCFF00] pl-4 rtl:border-l-0 rtl:border-r-4 rtl:pr-4">
              <h3 className="text-sm font-mono tracking-widest text-[#CCFF00] uppercase">
                {t.categoriesHeader}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {INITIAL_CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="border border-[#1A1A1A] hover:border-[#CCFF00] bg-[#1A1A1A] p-8 relative cursor-pointer group transition-all duration-350 rounded-2xl h-full flex flex-col justify-between shadow-2xl hover:shadow-[#CCFF00]/5"
                >
                  {/* Decorative corner box */}
                  <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 w-2 h-2 rounded-full bg-white/10 group-hover:bg-[#CCFF00] transition-colors"></div>
                  
                  <div>
                    <div className="text-[#CCFF00] mb-6 group-hover:scale-105 transition-transform duration-300 ease-out origin-left rtl:origin-right inline-block">
                      <div className="p-3 bg-black rounded-xl border border-white/5">
                        <ServiceIcon name={category.icon} className="w-10 h-10" />
                      </div>
                    </div>
                    
                    <h4 className="text-2xl font-sans font-black tracking-tight uppercase group-hover:text-[#CCFF00] transition-colors mb-4">
                      {language === 'en' ? category.nameEn : category.nameAr}
                    </h4>
                    
                    <p className="text-sm text-neutral-400 leading-relaxed max-w-md font-sans font-light">
                      {language === 'en' ? category.descriptionEn : category.descriptionAr}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center gap-2 font-mono text-xs text-[#CCFF00] tracking-widest uppercase">
                    <span>{language === 'en' ? 'ENTER DEPARTMENT' : 'الدخول إلى هذا القسم'}</span>
                    <ServiceIcon name={language === 'ar' ? 'ChevronLeft' : 'ChevronRight'} className="w-4 h-4 group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Services list level */
          <div>
            {/* Navigation back and header */}
            <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#CCFF00]/20 pb-6">
              <div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="font-mono text-xs text-[#CCFF00] hover:text-[#CCFF00] border-2 border-[#CCFF00] px-4 py-2 hover:bg-[#CCFF00] hover:text-black transition-all cursor-pointer uppercase flex items-center gap-2 mb-4 font-black tracking-widest"
                >
                  <ServiceIcon name={language === 'ar' ? 'ChevronRight' : 'ChevronLeft'} className="w-3 h-3" />
                  <span>{t.backCategories}</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="text-[#CCFF00]">
                    <ServiceIcon name={selectedCategory === 'maintenance' ? 'Hammer' : 'Briefcase'} className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-sans font-black tracking-tight uppercase">
                    {selectedCategory === 'maintenance'
                      ? (language === 'en' ? 'HOME MAINTENANCE SERVICES' : 'خدمات صيانة المنزل')
                      : (language === 'en' ? 'PROFESSIONAL CONSULTATIONS' : 'الاستشارات المهنية المعتمدة')
                    }
                  </h3>
                </div>
              </div>

              {/* Slick Category Fast Toggles */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="bg-[#1A1A1A] p-1.5 rounded-xl flex gap-1 border border-[#1A1A1A] self-start sm:self-auto">
                  <button
                    onClick={() => setSelectedCategory('maintenance')}
                    className={`px-5 py-2.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all cursor-pointer ${
                      selectedCategory === 'maintenance'
                        ? 'bg-[#CCFF00] text-black font-black shadow-lg scale-[1.02]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {language === 'en' ? 'Maintenance' : 'صيانة'}
                  </button>
                  <button
                    onClick={() => setSelectedCategory('consultation')}
                    className={`px-5 py-2.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all cursor-pointer ${
                      selectedCategory === 'consultation'
                        ? 'bg-[#CCFF00] text-black font-black shadow-lg scale-[1.02]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {language === 'en' ? 'Consultation' : 'استشارات'}
                  </button>
                </div>
                
                <div className="text-xs font-mono text-white/50 bg-[#1A1A1A] p-3 border border-white/5 max-w-sm">
                  {selectedCategory === 'maintenance'
                    ? (language === 'en' ? 'Standard callout fee applies to each selected services line.' : 'تطبق أجور فحص ورسوم زيارة مسبقة لكل تخصص مطلوب.')
                    : t.consultationNoFee
                  }
                </div>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className="bg-white text-black rounded-2xl p-6 relative flex flex-col justify-between cursor-pointer transition-all hover:outline-[4px] hover:outline-[#CCFF00] hover:-translate-y-1 duration-150 group/card shadow-xl"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-black group-hover/card:scale-110 transition-transform duration-200">
                        <ServiceIcon name={service.icon} className="w-8 h-8 text-black" />
                      </div>
                      
                      {/* Pricing Tag */}
                      {service.categoryId === 'maintenance' && service.bookingFee !== undefined && (
                        <div className="font-mono text-xs text-black bg-[#CCFF00] px-2.5 py-1 font-extrabold flex items-center gap-1 shadow-sm border border-black/10">
                          <span>{service.bookingFee}</span>
                          <span>{t.bookingFeeCurrency}</span>
                        </div>
                      )}
                    </div>

                    <h4 className="text-xl font-sans font-black tracking-tight uppercase mb-2 text-black leading-tight">
                      {language === 'en' ? service.nameEn : service.nameAr}
                    </h4>

                    <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed font-sans mb-6">
                      {language === 'en' ? service.descriptionEn : service.descriptionAr}
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-neutral-100 pt-4 mt-auto">
                    <span className="font-mono text-[10px] uppercase text-neutral-400 tracking-wider">
                      {service.categoryId === 'maintenance' ? t.roleCustomer + ' LINE' : 'EXPERT ADVISORY'}
                    </span>
                    <span className="font-mono text-[10px] tracking-widest uppercase text-black font-black group-hover/card:underline">
                      {language === 'en' ? 'INSPECT' : 'تفاصيل / حجز'} &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* SERVICE DETAIL MODAL OVERLAY */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="w-full max-w-lg border-2 border-[#CCFF00] bg-black p-8 relative">
            
            {/* Cross Close Button */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-white hover:text-[#CCFF00] p-1.5 hover:bg-white/10 uppercase font-mono tracking-widest text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'en' ? 'CLOSE' : 'إغلاق'}</span>
              <ServiceIcon name="X" className="w-4 h-4" />
            </button>

            {/* Custom corners */}
            <div className="absolute -top-[2px] -left-[2px] w-3 h-3 bg-[#CCFF00]"></div>
            <div className="absolute -bottom-[2px] -right-[2px] w-3 h-3 bg-[#CCFF00]"></div>

            {/* Content heading */}
            <div className="flex items-center gap-3 text-[#CCFF00] mb-6 border-b border-[#CCFF00]/20 pb-4 mt-4">
              <ServiceIcon name={selectedService.icon} className="w-10 h-10" />
              <div>
                <p className="text-[10px] font-mono tracking-widest uppercase text-white/50 leading-none">
                  {selectedService.categoryId === 'maintenance' ? t.categoriesHeader : 'professional expert panel'}
                </p>
                <h3 className="text-xl font-sans font-black uppercase text-[#CCFF00] tracking-tight mt-1 leading-tight">
                  {t.detailsTitle}
                </h3>
              </div>
            </div>

            {/* Details details */}
            <div className="space-y-6">
              <div>
                <h4 className="text-2xl font-sans font-black uppercase text-white tracking-tight leading-tight">
                  {language === 'en' ? selectedService.nameEn : selectedService.nameAr}
                </h4>
                <p className="text-sm text-white/75 leading-relaxed font-sans font-light mt-3">
                  {language === 'en' ? selectedService.descriptionEn : selectedService.descriptionAr}
                </p>
              </div>

              {/* Pricing breakdown */}
              <div className="bg-white/5 p-4 border border-white/10 font-mono text-xs">
                {selectedService.categoryId === 'maintenance' && selectedService.bookingFee !== undefined ? (
                  <div className="flex justify-between items-center">
                    <span className="text-[#CCFF00] font-bold tracking-wider uppercase">
                      {t.bookingFeeLabel}:
                    </span>
                    <span className="text-xl text-white font-extrabold flex items-center gap-1">
                      {selectedService.bookingFee} {t.bookingFeeCurrency}
                    </span>
                  </div>
                ) : (
                  <p className="text-white/70 text-center uppercase tracking-wider leading-relaxed text-[11px]">
                    {t.consultationNoFee}
                  </p>
                )}
                
                {selectedService.categoryId === 'maintenance' && (
                  <p className="text-[10px] text-white/40 mt-3 leading-relaxed border-t border-white/10 pt-2 font-sans italic">
                    {language === 'en' 
                      ? '* The booking fee represents the administrative entry check-up charge. It is displayed clearly to the customer before booking and is set by administrative control.'
                      : '* الرسوم المذكورة تمثل أجر الفحص والزيارة التأسيسي للخدمة. يتم الإعلان عنها بوضوح للعميل قبل عملية الحجز وتحدد وتدار بواسطة الإدارة.'
                    }
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => {
                    const id = selectedService.id;
                    setSelectedService(null);
                    handleBookService(id);
                  }}
                  className="flex-1 bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black border-2 border-[#CCFF00] hover:border-[#CCFF00] transition-all py-3.5 text-xs font-mono tracking-widest font-black uppercase cursor-pointer text-center"
                >
                  {t.clickToBook}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-[#CCFF00]/10 bg-black p-6 md:p-8 mt-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#CCFF00] p-1 text-black font-black text-xs">
              HP
            </div>
            <div>
              <h1 className="font-sans font-extrabold text-[#CCFF00] tracking-wider text-base leading-none">
                {t.appName}
              </h1>
              <p className="font-mono text-[9px] text-white/40 tracking-widest uppercase mt-0.5">
                {t.appSubtitle}
              </p>
            </div>
          </div>
          <div className="text-center font-mono text-[10px] text-white/40 tracking-widest uppercase md:text-right">
            <span>© {new Date().getFullYear()} {t.appName} Systems. ALL CONSTITUENT DATA ENCRYPTED LOCALHOST ONLY.</span>
            <div className="mt-1 flex justify-center md:justify-end gap-3 text-white/50 text-[9px]">
              <Link to="/admin" className="hover:text-[#CCFF00] underline">[ADMIN WORKSPACE PORTAL]</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
export default Home;
