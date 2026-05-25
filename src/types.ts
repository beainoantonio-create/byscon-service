export interface Service {
  id: string;
  categoryId: 'maintenance' | 'consultation';
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  bookingFee?: number; // Only for Home Maintenance
  icon: string;
}

export interface Category {
  id: 'maintenance' | 'consultation';
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'staff' | 'admin';
  password?: string;
}

export type TimeSlot = 'morning' | 'afternoon' | 'evening';
export type UrgencyLevel = 'normal' | 'urgent' | 'emergency';
export type BookingStatus = 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';

export interface CostItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  serviceId: string;
  serviceNameEn: string;
  serviceNameAr: string;
  categoryId: 'maintenance' | 'consultation';
  date: string;
  timeSlot: TimeSlot;
  urgency: UrgencyLevel;
  address: string;
  description: string;
  photos: string[]; // Base64 data strings
  bookingFee?: number;
  status: BookingStatus;
  createdAt: string;
  costItems?: CostItem[];
  internalNotes?: string;
}

export interface AppState {
  users: User[];
  bookings: Booking[];
  services: Service[];
  currentUser: User | null;
  language: 'en' | 'ar';
}
