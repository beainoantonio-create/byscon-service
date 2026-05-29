import { Service, Booking } from '../types';

export const SEED_SERVICES: Service[] = [
  // 12 Home Maintenance Services
  {
    id: 'plumbing',
    name_en: 'Plumbing Service',
    name_ar: 'خدمات السباكة والشبكات',
    category: 'home_maintenance',
    booking_fee: 15,
    description_en: 'Leak repair, pipe replacement, drain unclogging, fixture installation.',
    description_ar: 'إصلاح التسريب، تركيب وتمديد الأنابيب، تسليك المجاري، وخدمات تركيب الخلاطات والملحقات.',
    active: true
  },
  {
    id: 'electrical',
    name_en: 'Electrical Repair',
    name_ar: 'الشبكات والتركيبات الكهربائية',
    category: 'home_maintenance',
    booking_fee: 15,
    description_en: 'Short-circuit diagnostic, socket installations, wiring repairs, and load safety checking.',
    description_ar: 'فحص وتشخيص انقطاع الكهرباء، تمديدات الكابلات والمقابس، وتأمين سلامة الأحمال والأنظمة.',
    active: true
  },
  {
    id: 'hvac',
    name_en: 'HVAC & Air Conditioning',
    name_ar: 'التدفئة والتبريد والتكييف',
    category: 'home_maintenance',
    booking_fee: 15,
    description_en: 'AC cleaning, filter replacements, coolant refills, and compressor troubleshooting.',
    description_ar: 'تنظيف مكيفات الهواء، تبديل الفلاتر، إعادة شحن غاز التبريد، وصيانة الضواغط والوحدات الخارجية.',
    active: true
  },
  {
    id: 'appliance-repair',
    name_en: 'Appliance Repair',
    name_ar: 'إصلاح الأجهزة المنزلية',
    category: 'home_maintenance',
    booking_fee: 15,
    description_en: 'Maintenance for refrigerators, washing machines, ovens, and critical kitchen appliances.',
    description_ar: 'تصليح وصيانة الثلاجات، الغسالات، الأفران الكهربائية، وجميع أجهزة المطبخ الحيوية الأخرى.',
    active: true
  },
  {
    id: 'carpenter',
    name_en: 'Carpentry Works',
    name_ar: 'أعمال النجارة والديكور الخشبي',
    category: 'home_maintenance',
    booking_fee: 15,
    description_en: 'Furniture repair, door alignments, locks fitting, and custom wood restoration.',
    description_ar: 'تصليح الأثاث الخشبي، موازنة وتركيب الأبواب، تمديد وتثبيت خزائن المطبخ والعمل الخشبي الدقيق.',
    active: true
  },
  {
    id: 'painting',
    name_en: 'Painting & Plastering',
    name_ar: 'أعمال الدهان والطلاء الداخلي',
    category: 'home_maintenance',
    booking_fee: 15,
    description_en: 'Wall patching, primer applications, single room coatings, and complete indoor painting.',
    description_ar: 'معالجة وسد الفتحات وتشققات الجدران، طلاء الغرف الفردية، والدهان الداخلي الفاخر.',
    active: true
  },
  {
    id: 'locksmith',
    name_en: 'Locksmith Service',
    name_ar: 'خدمات الأقفال والمفاتيح',
    category: 'home_maintenance',
    booking_fee: 15,
    description_en: 'Emergency unlocking, deadbolt installation, smart key configuration, and complete hardware.',
    description_ar: 'فتح الأبواب الطارئ، تبديل وتركيب الأقفال والمفاتيح الذكية، وتأمين سلامة بوابات المداخل.',
    active: true
  },
  {
    id: 'cleaning',
    name_en: 'Deep Cleaning',
    name_ar: 'خدمات التنظيف الشاملة والمكثفة',
    category: 'home_maintenance',
    booking_fee: 15,
    description_en: 'Comprehensive room sanitation, floor polishing, window washing, and moving in/out operations.',
    description_ar: 'تنظيف وتطهير شامل للمنازل، تلميع الأرضيات، غسيل النوافذ، وعمليات تهيئة المنازل للانتقال.',
    active: true
  },
  {
    id: 'pest-control',
    name_en: 'Pest Control',
    name_ar: 'مكافحة الآفات وفحص الحشرات',
    category: 'home_maintenance',
    booking_fee: 15,
    description_en: 'Eco-safe chemical application for termites, bugs, rodents, and preventative spraying.',
    description_ar: 'رش مبيدات آمنة لمكافحة النمل الأبيض، القوارض، الحشرات، وتثبيت حواجز حماية وقائية.',
    active: true
  },
  {
    id: 'smart-home',
    name_en: 'Smart Home Installation',
    name_ar: 'تأسييس وتوصيل البيوت الذكية',
    category: 'home_maintenance',
    booking_fee: 15,
    description_en: 'Connecting smart doorbells, automated lighting paths, security cameras, and routers.',
    description_ar: 'تركيب أجراس الأبواب الذكية، كاميرات المراقبة الأمنية، وتوجيه وتجهيز الشبكات اللاسلكية.',
    active: true
  },
  {
    id: 'gardening',
    name_en: 'Gardening & Landscaping',
    name_ar: 'تنسيق وصيانة الحدائق والمسطحات',
    category: 'home_maintenance',
    booking_fee: 15,
    description_en: 'Weed removal, grass trimming, fertilizer deployment, and drip irrigation systems fixing.',
    description_ar: 'إزالة الحشائش الضارة، تدعيم التربة، تشذيب العشب، وإصلاح وصيانة شبكات الري بالتنقيط.',
    active: true
  },
  {
    id: 'handyman',
    name_en: 'Handyman Help',
    name_ar: 'خدمات الصيانة والتركيب العامة',
    category: 'home_maintenance',
    booking_fee: 15,
    description_en: 'TV mounting, mirror hanging, shelve setups, and minor physical assembly tasks.',
    description_ar: 'تثبيت شاشات التلفزيون، تعليق اللوحات والمرايا، تجميع الأثاث الجاهز، وتقديم الدعم في المهام الصغيرة.',
    active: true
  },

  // 4 Professional Consultations
  {
    id: 'structural-engineer',
    name_en: 'Structural Engineer',
    name_ar: 'مهندس إنشائي',
    category: 'professional_consultations',
    booking_fee: null,
    description_en: 'Load calculation, concrete core assessment, foundational settlement reporting, structural safety overview.',
    description_ar: 'حساب الأحمال الإنشائية، فحص الهويات الخرسانية، دراسة الهبوط التأسيسي، وتأمين متانة هياكل الأبنية.',
    active: true
  },
  {
    id: 'elec-engineer',
    name_en: 'Electrical Engineer',
    name_ar: 'مهندس كهربائي المترابط',
    category: 'professional_consultations',
    booking_fee: null,
    description_en: 'Industrial electrical mapping, panel load balancing, solar power integration, and high tension circuit design approvals.',
    description_ar: 'تصميم وبث الهياكل الكهربائية، فحص سلامة الأحمال، استشارات الطاقة الشمسية، وتخطيط تيار الضغط العالي والمنخفض.',
    active: true
  },
  {
    id: 'mech-engineer',
    name_en: 'Mechanical Engineer',
    name_ar: 'مهندس ميكانيكي',
    category: 'professional_consultations',
    booking_fee: null,
    description_en: 'Airtight circulation patterns, central ducts designs, fluid dynamic configurations, and lift hoist elevator blueprints review.',
    description_ar: 'استشارة توزيع تهوية مجاري الهواء المركزية، دراسات تدفق الهواء والغاز والسوائل، واعتماد المخططات الميكانيكية.',
    active: true
  },
  {
    id: 'architect',
    name_en: 'Architect',
    name_ar: 'مهندس معماري',
    category: 'professional_consultations',
    booking_fee: null,
    description_en: 'Spatial design layout approval, volumetric planning, facades rendering, and urban land development zoning permits.',
    description_ar: 'تخطيط الفراغات والمساحات، مراجعة وتعديل التصميم المعماري، تحديد الطراز الجمالي، والمساعدة بتراخيص البناء.',
    active: true
  }
];

const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  if (!item) return defaultValue;
  try {
    return JSON.parse(item);
  } catch (error) {
    return defaultValue;
  }
};

const setLocalStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const db = {
  getServices: async (): Promise<Service[]> => {
    return getLocalStorageItem<Service[]>('shed_services', SEED_SERVICES);
  },

  updateServiceBookingFee: async (serviceId: string, fee: number | null): Promise<boolean> => {
    const services = getLocalStorageItem<Service[]>('shed_services', SEED_SERVICES);
    const updated = services.map(s => s.id === serviceId ? { ...s, booking_fee: fee } : s);
    setLocalStorageItem('shed_services', updated);
    return true;
  },

  toggleServiceStatus: async (serviceId: string): Promise<boolean> => {
    const services = getLocalStorageItem<Service[]>('shed_services', SEED_SERVICES);
    const updated = services.map(s => s.id === serviceId ? { ...s, active: !s.active } : s);
    setLocalStorageItem('shed_services', updated);
    return true;
  },

  getBookings: async (userId: string): Promise<Booking[]> => {
    const bookings = getLocalStorageItem<Booking[]>('shed_bookings', []);
    return bookings.filter(b => b.user_id === userId);
  },

  getAllBookings: async (): Promise<Booking[]> => {
    return getLocalStorageItem<Booking[]>('shed_bookings', []);
  },

  createBooking: async (bookingData: Omit<Booking, 'id' | 'status' | 'created_at'>): Promise<Booking> => {
    const bookings = getLocalStorageItem<Booking[]>('shed_bookings', []);
    const newBooking: Booking = {
      ...bookingData,
      id: 'bk-' + Math.random().toString(36).substring(2, 9),
      status: 'Pending',
      created_at: new Date().toISOString()
    };
    bookings.push(newBooking);
    setLocalStorageItem('shed_bookings', bookings);
    return newBooking;
  },

  updateBookingStatus: async (bookingId: string, status: Booking['status']): Promise<boolean> => {
    const bookings = getLocalStorageItem<Booking[]>('shed_bookings', []);
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status } : b);
    setLocalStorageItem('shed_bookings', updated);
    return true;
  }
};

export default db;
