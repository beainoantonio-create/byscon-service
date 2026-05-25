import { createClient } from '@supabase/supabase-js';
import { UserRole, UserProfile, Service, Booking, CostItem, Receipt } from '../types';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' && 
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  supabaseUrl.startsWith('http');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ==========================================
// MOCK DATABASE PRESET SEED DATA
// ==========================================
const SEED_SERVICES: Service[] = [
  { id: 'plumbing', name_en: 'Plumbing', name_ar: 'السباكة', category: 'home_maintenance', booking_fee: 25, description_en: 'All plumbing repairs and installations', description_ar: 'جميع أعمال السباكة والتركيبات', active: true },
  { id: 'electricity', name_en: 'Electricity', name_ar: 'الكهرباء', category: 'home_maintenance', booking_fee: 25, description_en: 'Electrical repairs and wiring', description_ar: 'إصلاح الكهرباء والأسلاك', active: true },
  { id: 'paint', name_en: 'Paint', name_ar: 'الدهان', category: 'home_maintenance', booking_fee: 25, description_en: 'Interior and exterior painting', description_ar: 'دهان داخلي وخارجي', active: true },
  { id: 'aluminum', name_en: 'Aluminum', name_ar: 'الألمنيوم', category: 'home_maintenance', booking_fee: 25, description_en: 'Aluminum works and installations', description_ar: 'أعمال الألمنيوم والتركيبات', active: true },
  { id: 'tiling', name_en: 'Tiling', name_ar: 'البلاط', category: 'home_maintenance', booking_fee: 25, description_en: 'Floor and wall tiling', description_ar: 'تبليط الأرضيات والجدران', active: true },
  { id: 'woodwork', name_en: 'Woodwork', name_ar: 'النجارة', category: 'home_maintenance', booking_fee: 25, description_en: 'Custom woodwork and carpentry', description_ar: 'أعمال النجارة المخصصة', active: true },
  { id: 'steelwork', name_en: 'Steelwork', name_ar: 'أعمال الحديد', category: 'home_maintenance', booking_fee: 25, description_en: 'Steel fabrication and installation', description_ar: 'تصنيع الحديد وتركيبه', active: true },
  { id: 'ac', name_en: 'Air Conditioning', name_ar: 'التكييف', category: 'home_maintenance', booking_fee: 25, description_en: 'AC installation, repair and maintenance', description_ar: 'تركيب وصيانة وإصلاح التكييف', active: true },
  { id: 'mechanical', name_en: 'Mechanical', name_ar: 'الميكانيكا', category: 'home_maintenance', booking_fee: 25, description_en: 'Mechanical systems and maintenance', description_ar: 'الأنظمة الميكانيكية والصيانة', active: true },
  { id: 'gardening', name_en: 'Gardening', name_ar: 'البستنة', category: 'home_maintenance', booking_fee: 25, description_en: 'Garden design and maintenance', description_ar: 'تصميم الحدائق وصيانتها', active: true },
  { id: 'insulation', name_en: 'Insulation', name_ar: 'العزل', category: 'home_maintenance', booking_fee: 25, description_en: 'Thermal and waterproofing insulation', description_ar: 'العزل الحراري والمائي', active: true },
  { id: 'home-inspection', name_en: 'Full Home Inspection', name_ar: 'فحص المنزل الكامل', category: 'home_maintenance', booking_fee: 25, description_en: 'Comprehensive inspection of the entire home', description_ar: 'فحص شامل للمنزل بالكامل', active: true },
  { id: 'mech-engineer', name_en: 'Mechanical Engineer', name_ar: 'مهندس ميكانيكي', category: 'professional_consultations', booking_fee: null, description_en: 'Professional mechanical engineering consultation', description_ar: 'استشارة هندسية ميكانيكية متخصصة', active: true },
  { id: 'contractor', name_en: 'Contractor', name_ar: 'مقاول', category: 'professional_consultations', booking_fee: null, description_en: 'Contracting and project management consultation', description_ar: 'استشارة مقاولات وإدارة مشاريع', active: true },
  { id: 'architect', name_en: 'Architect', name_ar: 'مهندس معماري', category: 'professional_consultations', booking_fee: null, description_en: 'Architectural design and planning consultation', description_ar: 'استشارة تصميم معماري وتخطيط', active: true },
  { id: 'interior-design', name_en: 'Interior Designer', name_ar: 'مصمم داخلي', category: 'professional_consultations', booking_fee: null, description_en: 'Interior design and decoration consultation', description_ar: 'استشارة تصميم داخلي وديكور', active: true }
];

const DEFAULT_MOCK_USERS = [
  {
    id: 'admin-uuid-1111-2222-333333333333',
    email: 'admin@shed.com',
    full_name: 'SHED Admin',
    phone: '+96650000000',
    role: 'admin' as UserRole,
    password: 'Admin@1234',
    created_at: new Date().toISOString()
  }
];

// Helper to secure initial local storage seeding
function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
}

function setLocalStorageItem<T>(key: string, val: T): void {
  localStorage.setItem(key, JSON.stringify(val));
}

// Global active in-memory / local storage states
export interface MockUserRecord extends UserProfile {
  email: string;
  password?: string;
}

// Seed Mock Stores
getLocalStorageItem<Service[]>('shed_services', SEED_SERVICES);
getLocalStorageItem<MockUserRecord[]>('shed_users', DEFAULT_MOCK_USERS);
getLocalStorageItem<Booking[]>('shed_bookings', []);
getLocalStorageItem<Receipt[]>('shed_receipts', []);

// Database helpers
const db = {
  // SERVICES
  getServices: async (): Promise<Service[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('id', { ascending: true });
      if (!error && data && data.length > 0) return data as Service[];
    }
    return getLocalStorageItem<Service[]>('shed_services', SEED_SERVICES);
  },

  updateServiceFee: async (serviceId: string, fee: number | null): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('services')
        .update({ booking_fee: fee })
        .eq('id', serviceId);
      if (!error) return;
    }
    const services = getLocalStorageItem<Service[]>('shed_services', SEED_SERVICES);
    const updated = services.map(s => s.id === serviceId ? { ...s, booking_fee: fee } : s);
    setLocalStorageItem('shed_services', updated);
  },

  toggleServiceActive: async (serviceId: string, active: boolean): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('services')
        .update({ active })
        .eq('id', serviceId);
      if (!error) return;
    }
    const services = getLocalStorageItem<Service[]>('shed_services', SEED_SERVICES);
    const updated = services.map(s => s.id === serviceId ? { ...s, active } : s);
    setLocalStorageItem('shed_services', updated);
  },

  // USERS
  getUsersList: async (): Promise<MockUserRecord[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      if (!error && data) {
        // We'll map them. In real Supabase, we cannot fetch emails of other users from public.users table unless stored there.
        // Let's fallback to returning the mock user registry or merge if possible.
        // For convenience in admin view, let's merge with the email values if available in public.users or return combined payload.
        return data.map(u => ({
          id: u.id,
          full_name: u.full_name || 'User',
          phone: u.phone || '',
          role: (u.role || 'customer') as UserRole,
          email: u.email || `${u.id.substring(0, 5)}@shed.com`,
          created_at: u.created_at
        }));
      }
    }
    return getLocalStorageItem<MockUserRecord[]>('shed_users', DEFAULT_MOCK_USERS);
  },

  updateUserRole: async (userId: string, role: UserRole): Promise<void> => {
    // Check if it exists in DB
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId);
      if (!error) return;
    }
    const users = getLocalStorageItem<MockUserRecord[]>('shed_users', DEFAULT_MOCK_USERS);
    // Ensure we don't remove last admin
    if (role !== 'admin') {
      const currentRole = users.find(u => u.id === userId)?.role;
      if (currentRole === 'admin') {
        const adminsCount = users.filter(u => u.role === 'admin').length;
        if (adminsCount <= 1) {
          throw new Error('Cannot remove the last Admin account.');
        }
      }
    }
    const updated = users.map(u => u.id === userId ? { ...u, role } : u);
    setLocalStorageItem('shed_users', updated);
  },

  updateUserPassword: async (userId: string, newPassword: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (!error) return;
    }
    const users = getLocalStorageItem<MockUserRecord[]>('shed_users', DEFAULT_MOCK_USERS);
    const updated = users.map(u => u.id === userId ? { ...u, password: newPassword } : u);
    setLocalStorageItem('shed_users', updated);
  },

  // BOOKINGS
  getBookings: async (userRole: UserRole, userId: string): Promise<Booking[]> => {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('bookings').select('*');
      if (userRole === 'customer') {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(b => ({
          ...b,
          cost_items: Array.isArray(b.cost_items) ? b.cost_items : JSON.parse(b.cost_items || '[]')
        })) as Booking[];
      }
    }
    const bookings = getLocalStorageItem<Booking[]>('shed_bookings', []);
    if (userRole === 'customer') {
      return bookings.filter(b => b.user_id === userId);
    }
    return bookings;
  },

  createBooking: async (bookingData: Omit<Booking, 'id' | 'status' | 'cost_items' | 'internal_notes' | 'created_at'>): Promise<Booking> => {
    const newBooking: Booking = {
      ...bookingData,
      id: 'SHED-' + Math.floor(100000 + Math.random() * 900000),
      status: 'Pending',
      cost_items: [],
      internal_notes: '',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('bookings')
        .insert({
          id: newBooking.id,
          user_id: newBooking.user_id,
          user_name: newBooking.user_name,
          user_phone: newBooking.user_phone,
          user_email: newBooking.user_email,
          service_id: newBooking.service_id,
          service_name_en: newBooking.service_name_en,
          service_name_ar: newBooking.service_name_ar,
          category_id: newBooking.category_id,
          date: newBooking.date,
          time_slot: newBooking.time_slot,
          urgency: newBooking.urgency,
          address: newBooking.address,
          description: newBooking.description,
          photos: newBooking.photos,
          booking_fee: newBooking.booking_fee,
          status: newBooking.status,
          cost_items: JSON.stringify(newBooking.cost_items),
          internal_notes: newBooking.internal_notes
        });
      if (!error) return newBooking;
    }

    const bookings = getLocalStorageItem<Booking[]>('shed_bookings', []);
    bookings.push(newBooking);
    setLocalStorageItem('shed_bookings', bookings);
    return newBooking;
  },

  updateBookingStatus: async (bookingId: string, status: Booking['status']): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);
      if (!error) return;
    }
    const bookings = getLocalStorageItem<Booking[]>('shed_bookings', []);
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status } : b);
    setLocalStorageItem('shed_bookings', updated);
  },

  updateBookingDetails: async (bookingId: string, date: string, time_slot: Booking['time_slot']): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('bookings')
        .update({ date, time_slot })
        .eq('id', bookingId);
      if (!error) return;
    }
    const bookings = getLocalStorageItem<Booking[]>('shed_bookings', []);
    const updated = bookings.map(b => b.id === bookingId ? { ...b, date, time_slot } : b);
    setLocalStorageItem('shed_bookings', updated);
  },

  updateBookingCosts: async (bookingId: string, costItems: CostItem[], internalNotes: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          cost_items: JSON.stringify(costItems),
          internal_notes: internalNotes
        })
        .eq('id', bookingId);
      if (!error) return;
    }
    const bookings = getLocalStorageItem<Booking[]>('shed_bookings', []);
    const updated = bookings.map(b => b.id === bookingId ? { ...b, cost_items: costItems, internal_notes: internalNotes } : b);
    setLocalStorageItem('shed_bookings', updated);
  },

  // RECEIPTS
  getReceipts: async (): Promise<Receipt[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('receipts')
        .select('*');
      if (!error && data) return data as Receipt[];
    }
    return getLocalStorageItem<Receipt[]>('shed_receipts', []);
  },

  createReceipt: async (receipt: Omit<Receipt, 'id' | 'generated_at'>): Promise<Receipt> => {
    const newReceipt: Receipt = {
      ...receipt,
      id: 'RC-uuid-' + Math.floor(100000 + Math.random() * 900000),
      generated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('receipts')
        .insert({
          booking_id: newReceipt.booking_id,
          subtotal: newReceipt.subtotal,
          booking_fee: newReceipt.booking_fee,
          grand_total: newReceipt.grand_total,
          notes: newReceipt.notes,
          language: newReceipt.language
        });
      if (!error) return newReceipt;
    }

    const receipts = getLocalStorageItem<Receipt[]>('shed_receipts', []);
    receipts.push(newReceipt);
    setLocalStorageItem('shed_receipts', receipts);
    return newReceipt;
  }
};

export default db;
export { SEED_SERVICES };
