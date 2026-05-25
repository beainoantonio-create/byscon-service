import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

export const translations = {
  en: {
    appName: 'SHED',
    heroTagline: 'INTERNAL HOME MAINTENANCE SERVICES',
    heroDescription: 'Sleek, pristine structural maintenance and professional engineering consultations provided entirely in-house.',
    aboutUs: 'All services are fulfilled by our own certified SHED technicians. High contrast, precise engineering, and flawless execution.',
    homeMaintenance: 'HOME MAINTENANCE',
    profConsultations: 'PROFESSIONAL CONSULTATIONS',
    flatBookingFee: 'Booking Fee',
    noBookingFee: 'No Booking Fee',
    bookNow: 'BOOK NOW',
    bookingFormTitle: 'BOOK SERVICE: ',
    preferredDate: 'Preferred Date',
    preferredTime: 'Preferred Time Slot',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    urgencyLevel: 'Urgency Level',
    normal: 'Normal',
    urgent: 'Urgent',
    emergency: 'Emergency',
    serviceAddress: 'Service Address / Location',
    issueDescription: 'Description of Issue / Consultation Scope',
    photoUpload: 'Upload Photos (Up to 3)',
    dragDropText: 'Drag & drop photos here, or click to upload',
    acknowledgementText: 'I acknowledge and agree to pay the standard booking fee of ',
    ackRequired: 'You must acknowledge the booking fee to proceed.',
    confirmBookingBtn: 'CONFIRM BOOKING',
    activeRequests: 'Active Requests',
    pastBookings: 'Booking History',
    status: 'Status',
    actions: 'Actions',
    reschedule: 'RESCHEDULE',
    cancel: 'CANCEL',
    cancelConfirm: 'Are you sure you want to cancel this booking?',
    rescheduleTitle: 'Reschedule Booking',
    saveBtn: 'SAVE CHANGES',
    closeBtn: 'CLOSE',
    loginTitle: 'SHED INTERNAL CONSOLE',
    signupTitle: 'CREATE AN ACCOUNT',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    password: 'Password',
    loginBtn: 'LOG IN',
    signupBtn: 'REGISTER AND START',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    adminDashboard: 'ADMIN BOARD',
    usersRoles: 'USERS & ROLES',
    serviceFees: 'SERVICES REGISTRY',
    allBookings: 'ALL BOOKINGS',
    overview: 'OVERVIEW',
    totalBookings: 'TOTAL BOOKINGS',
    pending: 'PENDING',
    inProgress: 'IN PROGRESS',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
    totalRevenue: 'REVENUE',
    filters: 'FILTERS',
    urgency: 'Urgency',
    all: 'All',
    costsReceipt: 'Costs & Receipt',
    costLineItems: 'Additional Line Items',
    itemName: 'Item/Description',
    quantity: 'Qty',
    unitPrice: 'Unit Price',
    lineTotal: 'Line Total',
    addItem: 'ADD LINE ITEM',
    internalNotes: 'Internal Notes (Admin Only)',
    grandTotal: 'GRAND TOTAL',
    generateReceipt: 'GENERATE RECEIPT',
    invoiceLanguage: 'Invoice Language',
    printExport: 'Direct Print / Save PDF',
    receiptTitle: 'OFFICIAL SERVICE RECEIPT',
    bookingId: 'Booking Ref ID',
    customerName: 'Customer Name',
    officialStamp: 'SHED Official Dispatch Seal',
    thankYou: 'Thank you for choosing SHED for your premium home care and engineering services.',
    companyDetails: 'SHED Corporate Services Inc. • 24/7 National Maintenance Hotline: 800-SHED-CARE',
    roleLabel: 'Assign Role',
    changePasswordTitle: 'CHANGE ADMIN PASSWORD',
    newPassword: 'New Password',
    updatePasswordBtn: 'UPDATE PASSWORD',
    noBookings: 'No bookings on record.',
    serviceLimitExceeded: 'Maximum of 3 photos limit reached.',
    backToHome: 'BACK TO SERVICING'
  },
  ar: {
    appName: 'شيد (SHED)',
    heroTagline: 'خدمات الصيانة المنزلية الداخلية',
    heroDescription: 'صيانة هيكلية أنيقة ومتكاملة واستشارات هندسية متخصصة يتم تقديمها بالكامل من قبل فريقنا.',
    aboutUs: 'يتم تقديم جميع الخدمات من قبل فنيي شيد المعتمدين وبأعلى مستويات الدقة والاحترافية.',
    homeMaintenance: 'الصيانة المنزلية',
    profConsultations: 'الاستشارات المهنية',
    flatBookingFee: 'رسوم الحجز',
    noBookingFee: 'بدون رسوم حجز',
    bookNow: 'احجز الآن',
    bookingFormTitle: 'حجز خدمة: ',
    preferredDate: 'التاريخ المفضل',
    preferredTime: 'الفترة المفضلة',
    morning: 'صباحاً',
    afternoon: 'بعد الظهر',
    evening: 'مساءً',
    urgencyLevel: 'مستوى الأهمية',
    normal: 'عادي',
    urgent: 'عاجل',
    emergency: 'طوارئ',
    serviceAddress: 'العنوان / موقع تقديم الخدمة',
    issueDescription: 'وصف المشكلة / نطاق الاستشارة المطلوبة',
    photoUpload: 'تحميل الصور (بحد أقصى 3)',
    dragDropText: 'اسحب وأسقط الصور هنا، أو انقر للتحميل',
    acknowledgementText: 'أقر بموافقتي على دفع الرسوم الثابتة للحجز وقدرها ',
    ackRequired: 'يجب عليك تأكيد الموافقة على رسوم الحجز للمتابعة.',
    confirmBookingBtn: 'تأكيد الحجز',
    activeRequests: 'الطلبات النشطة',
    pastBookings: 'سجل الحجوزات',
    status: 'الحالة',
    actions: 'الإجراءات',
    reschedule: 'تعديل الموعد',
    cancel: 'إلغاء الطلب',
    cancelConfirm: 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟',
    rescheduleTitle: 'تعديل موعد الحجز',
    saveBtn: 'حفظ التغييرات',
    closeBtn: 'إغلاق',
    loginTitle: 'لوحة التحكم الداخلية لشيد',
    signupTitle: 'إنشاء حساب جديد',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    password: 'كلمة المرور',
    loginBtn: 'تسجيل الدخول',
    signupBtn: 'تسجيل الحساب والبدء',
    dontHaveAccount: 'ليس لديك حساب؟',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    adminDashboard: 'لوحة الإشراف',
    usersRoles: 'الأدوار والمستخدمين',
    serviceFees: 'سجل الخدمات والرسوم',
    allBookings: 'جميع الحجوزات',
    overview: 'التقرير العام',
    totalBookings: 'إجمالي الحجوزات',
    pending: 'قيد الانتظار',
    inProgress: 'قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    totalRevenue: 'الإيرادات',
    filters: 'تصفية النتائج',
    urgency: 'الأهمية',
    all: 'الكل',
    costsReceipt: 'التكاليف والفاتورة',
    costLineItems: 'بنود التكلفة الإضافية',
    itemName: 'البند / وصف الخدمة',
    quantity: 'الكمية',
    unitPrice: 'سعر الوحدة',
    lineTotal: 'الإجمالي',
    addItem: 'إضافة بند تكلفة',
    internalNotes: 'ملاحظات داخلية (للمشرفين فقط)',
    grandTotal: 'المجموع الإجمالي النهائي',
    generateReceipt: 'إصدار الفاتورة الكلية',
    invoiceLanguage: 'لغة الفاتورة',
    printExport: 'طباعة مباشرة / حفظ بصيغة PDF',
    receiptTitle: 'فاتورة الاستلام الرسمية',
    bookingId: 'رقم المرجع',
    customerName: 'اسم العميل',
    officialStamp: 'ختم تشغيل شيد الرسمي',
    thankYou: 'نشكركم على اختيار شيد لتقديم الرعاية المنزلية والخدمات الهندسية المتميزة لكم.',
    companyDetails: 'مؤسسة شيد للخدمات المتكاملة • الخط الساخن لخدمة العملاء على مدار الساعة: 800-SHED-CARE',
    roleLabel: 'تعيين الدور',
    changePasswordTitle: 'تغيير كلمة مرور المشرف',
    newPassword: 'كلمة المرور الجديدة',
    updatePasswordBtn: 'تحديث كلمة المرور',
    noBookings: 'لا توجد حجوزات مسجلة.',
    serviceLimitExceeded: 'لقد تجاوزت الحد الأقصى المسموح للصور (3 صور).',
    backToHome: 'العودة للخدمات'
  }
};

interface LanguageContextType {
  language: Language;
  direction: 'ltr' | 'rtl';
  toggleLanguage: () => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('shed_lang') as Language) || 'en';
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('shed_lang', language);
    // Bind global HTML attributes for proper rendering flow
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    document.title = language === 'ar' ? 'شيد - خدمات الصيانة المنزلية' : 'SHED - Home Maintenance Services';
  }, [language, direction]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, direction, toggleLanguage, t }}>
      <div className={`w-full min-h-screen ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
