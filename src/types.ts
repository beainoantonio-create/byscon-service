export type UserRole = 'customer' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at?: string;
}

export interface Service {
  id: string;
  name_en: string;
  name_ar: string;
  category: 'home_maintenance' | 'professional_consultations';
  booking_fee: number | null; // Null for professional consultations
  description_en: string;
  description_ar: string;
  active: boolean;
}

export interface CostItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Booking {
  id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  service_id: string;
  service_name_en: string;
  service_name_ar: string;
  category_id: 'home_maintenance' | 'professional_consultations';
  date: string;
  time_slot: 'Morning' | 'Afternoon' | 'Evening';
  urgency: 'Normal' | 'Urgent' | 'Emergency';
  address: string;
  description: string;
  photos: string[]; // URLs
  booking_fee: number; // Stored booking fee at time of service
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  cost_items: CostItem[]; // JSONB
  internal_notes: string;
  created_at?: string;
}

export interface Receipt {
  id: string;
  booking_id: string;
  subtotal: number;
  booking_fee: number;
  grand_total: number;
  notes: string;
  generated_at?: string;
  language: 'en' | 'ar';
}
