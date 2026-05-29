import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    homeMaintenance: "Home Maintenance",
    homeMaintenanceDesc: "Sleek and swift premium utility dispatch for your residential physical modules",
    profConsultations: "Professional Consultations",
    profConsultationsDesc: "Direct diagnostic access to specialized design and engineering analysis surveys",
    constructionContracting: "Construction & Contracting",
    constructionContractingDesc: "Heavy industrial division solutions: structures, masonry, and mechanical installations",
    bookingFormTitle: "Secure Booking System",
    flatBookingFee: "Booking Fee",
    ackRequired: "You must acknowledge the payment/booking fee terms to proceed",
    exploreDivisions: "Explore Divisions",
    divisions: "Divisions",
    servicesCount: "Services Available",
    bookNow: "Submit Secure Assignment",
    backToList: "Return to Main Hub",
    backToDivisions: "Return to Divisions",
    subServicesTitle: "Select Required Division Sub-Service",
    preferredDate: "Preferred Operational Date",
    preferredTime: "Tactical Execution Range",
    urgencyLevel: "Priority Directive Level",
    addressLocation: "Physical Deployment Address",
    taskDescription: "Detailed Field Intel / Scope of Work",
    optionalPhotos: "Visual Scans / Area Documentation (URLs, comma-separated)",
    acknowledgementText: "I acknowledge there is a dispatch booking fee of",
    successBooking: "Order transmitted. Tactical field team logged and prepared.",
    home: "Hub",
    dashboard: "My Bookings",
    admin: "Sovereign Command Panel",
    login: "Authenticate",
    signup: "Register Unit",
    logout: "Disconnect Terminal"
  },
  ar: {
    homeMaintenance: "صيانة المنازل",
    homeMaintenanceDesc: "خدمات صيانة وإصلاح سريعة لوحداتك السكنية بأعلى مستويات الاحترافية والسرعة",
    profConsultations: "استشارات مهنية",
    profConsultationsDesc: "استشارات متخصصة تهدف لتحليل ودراسة وتصميم نطاق مشاريعك الهندسية والمكانية",
    constructionContracting: "البناء والمقاولات",
    constructionContractingDesc: "حلول البناء الكبرى والأعمار والتشييد والأنظمة الإنشائية والكهروميكانيكية المتكاملة",
    bookingFormTitle: "نظام الحجز الآمن",
    flatBookingFee: "رسوم الحجز",
    ackRequired: "يجب تأكيد الموافقة على شروط ورسوم الحجز المسبقة للمتابعة",
    exploreDivisions: "عرض الأقسام التخصصية",
    divisions: "الأقسام الإنشائية",
    servicesCount: "الخدمات المتاحة",
    bookNow: "تأكيد الطلب وإرسال المهمة",
    backToList: "العودة إلى المركز الرئيسي",
    backToDivisions: "العودة لقائمة الأقسام",
    subServicesTitle: "حدد الخدمة الفرعية المطلوبة بدقة",
    preferredDate: "تاريخ التنفيذ المفضل",
    preferredTime: "فترة العمل المفضلة",
    urgencyLevel: "مستوى الأهمية والسرعة",
    addressLocation: "عنوان موقع ومكان العمل",
    taskDescription: "تفاصيل وحجم العمل المطلوب بدقة",
    optionalPhotos: "صور توضيحية للموقع (عناوين ويب تفصلها فاصلة)",
    acknowledgementText: "أوافق تماماً على دفع رسوم الحجز المقررة بقيمة",
    successBooking: "تم استلام الطلب بنجاح. النبض اللوجستي مستعد لمباشرة التنفيذ والمتابعة.",
    home: "الرئيسية",
    dashboard: "حجوزاتي",
    admin: "لوحة التحكمCommand سيادية",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب الجديد",
    logout: "إنهاء الاتصال بالنظام"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('shed_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('shed_lang', lang);
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'ar' ? 'ar' : 'en';
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within standard LanguageProvider');
  return context;
};
