export interface Service {
  id: string;
  name_en: string;
  name_ar: string;
  category: 'home_maintenance' | 'professional_consultations' | 'construction_contracting';
  booking_fee: number | null; // Null for professional consultations, $25 for construction
  description_en: string;
  description_ar: string;
  active: boolean;
}

export interface Booking {
  id: string;
  user_id: string;
  user_name: string;
  service_id: string;
  service_name_en: string;
  service_name_ar: string;
  category_id: 'home_maintenance' | 'professional_consultations' | 'construction_contracting';
  date: string;
  time_slot: 'Morning' | 'Afternoon' | 'Evening';
  urgency: 'Normal' | 'Urgent' | 'Emergency';
  address: string;
  description: string;
  photos: string[];
  booking_fee: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  language: 'en' | 'ar';
  role: 'client' | 'admin';
}
