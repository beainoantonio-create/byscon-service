import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Booking, Service, AppState, TimeSlot, UrgencyLevel, BookingStatus, CostItem } from '../types';
import { INITIAL_SERVICES } from '../data';
import { supabase } from '../lib/supabaseClient';

export interface ToastMessage {
  id: string;
  messageEn: string;
  messageAr: string;
  type: 'info' | 'success' | 'warning';
}

interface AppContextType {
  language: 'en' | 'ar';
  currentUser: User | null;
  users: User[];
  bookings: Booking[];
  services: Service[];
  toggleLanguage: () => void;
  login: (email: string, passwordInput: string, role?: 'customer' | 'staff' | 'admin') => Promise<User>;
  signup: (name: string, email: string, phone: string, password?: string) => Promise<User>;
  logout: () => void;
  createBooking: (booking: Omit<Booking, 'id' | 'userId' | 'userName' | 'userPhone' | 'userEmail' | 'createdAt' | 'status'>) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  updateServiceFee: (serviceId: string, fee: number) => void;
  cancelBooking: (id: string) => void;
  rescheduleBooking: (id: string, date: string, timeSlot: TimeSlot) => void;
  updateBookingCosts: (id: string, costItems: CostItem[], internalNotes?: string) => void;
  updateUserRole: (userId: string, newRole: 'customer' | 'staff' | 'admin') => void;
  updateUserPassword: (userId: string, newPassword: string) => void;
  activeToasts: ToastMessage[];
  addToast: (messageEn: string, messageAr: string, type?: 'info' | 'success' | 'warning') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SERVICE_ICONS: Record<string, string> = {
  plumbing: 'Wrench',
  electricity: 'Zap',
  paint: 'Paintbrush',
  aluminum: 'Columns3',
  tiling: 'Grid3X3',
  woodwork: 'Notebook',
  steelwork: 'Boxes',
  ac: 'Snowflake',
  mechanical: 'Settings',
  gardening: 'Sprout',
  insulation: 'Shield',
  inspection: 'Eye',
  mech_eng: 'Cpu',
  contractor: 'HardHat',
  architect: 'Map',
  interior: 'Palette'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'ar'>(() => {
    const saved = localStorage.getItem('homeplex_lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeToasts, setActiveToasts] = useState<ToastMessage[]>([]);

  const addToast = (messageEn: string, messageAr: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setActiveToasts((prev) => [...prev, { id, messageEn, messageAr, type }]);
    
    // Auto remove toast after 6 seconds
    setTimeout(() => {
      setActiveToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Adjust document direction for global RTL spacing support
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('homeplex_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  // Helper functions to fetch services, bookings and users
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true);
      if (error) throw error;
      if (data) {
        const mapped = data.map((row) => ({
          id: row.id,
          categoryId: row.category as 'maintenance' | 'consultation',
          nameEn: row.name_en || '',
          nameAr: row.name_ar || '',
          descriptionEn: row.description_en || '',
          descriptionAr: row.description_ar || '',
          bookingFee: row.booking_fee ? Number(row.booking_fee) : undefined,
          icon: SERVICE_ICONS[row.id] || 'Wrench'
        }));
        setServices(mapped);
      }
    } catch (err: any) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchBookings = async (user: User) => {
    try {
      let query = supabase.from('bookings').select('*');
      if (user.role === 'customer') {
        query = query.eq('user_id', user.id);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const mapped: Booking[] = data.map((b) => ({
          id: b.id,
          userId: b.user_id,
          userName: b.user_name || '',
          userPhone: b.user_phone || '',
          userEmail: b.user_email || '',
          serviceId: b.service_id,
          serviceNameEn: b.service_name_en || '',
          serviceNameAr: b.service_name_ar || '',
          categoryId: b.category_id as 'maintenance' | 'consultation',
          date: b.date || '',
          timeSlot: b.time_slot as TimeSlot,
          urgency: b.urgency as UrgencyLevel,
          address: b.address || '',
          description: b.description || '',
          photos: b.photos || [],
          bookingFee: b.booking_fee ? Number(b.booking_fee) : undefined,
          status: b.status as BookingStatus,
          createdAt: b.created_at || new Date().toISOString(),
          costItems: Array.isArray(b.cost_items) ? b.cost_items : [],
          internalNotes: b.internal_notes || ''
        }));
        setBookings(mapped);
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const mapped: User[] = data.map((u) => ({
          id: u.id,
          name: u.full_name || '',
          email: u.email || '',
          phone: u.phone || '',
          role: u.role as 'customer' | 'staff' | 'admin'
        }));
        setUsers(mapped);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
    }
  };

  const seedServicesIfEmpty = async () => {
    try {
      const { count, error } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error checking services count for seed:', error);
        return;
      }

      if (count === 0) {
        console.log('Seeding initial services to Supabase...');
        const seedData = INITIAL_SERVICES.map((s) => ({
          id: s.id,
          category: s.categoryId,
          name_en: s.nameEn,
          name_ar: s.nameAr,
          booking_fee: s.bookingFee || null,
          description_en: s.descriptionEn,
          description_ar: s.descriptionAr,
          active: true
        }));

        const { error: insertErr } = await supabase.from('services').insert(seedData);
        if (insertErr) {
          console.error('Error seeding services:', insertErr);
        } else {
          console.log('Seeding services succeeded!');
          await fetchServices();
        }
      }
    } catch (err) {
      console.error('Failed in seed check:', err);
    }
  };

  const handleAuthUser = async (authUser: any) => {
    try {
      // Fetch profile from public.users
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      
      let resolvedUser: User;
      if (error || !profile) {
        // Fallback from auth user metadata
        resolvedUser = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0].toUpperCase() || 'USER',
          email: authUser.email || '',
          phone: authUser.user_metadata?.phone || '',
          role: 'customer'
        };
      } else {
        resolvedUser = {
          id: profile.id,
          name: profile.full_name || '',
          email: profile.email || authUser.email || '',
          phone: profile.phone || '',
          role: profile.role || 'customer'
        };
      }
      
      // Auto-promote George B. Teich to admin if logged in with georgebteich@live.com
      if (resolvedUser.email.toLowerCase() === 'georgebteich@live.com' && resolvedUser.role !== 'admin') {
        resolvedUser.role = 'admin';
        await supabase.from('users').update({ role: 'admin' }).eq('id', resolvedUser.id);
      }

      setCurrentUser(resolvedUser);
      fetchBookings(resolvedUser);
      if (resolvedUser.role === 'admin' || resolvedUser.role === 'staff') {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error handling authenticated user session:', err);
    }
  };

  // Track session and subscribe to auth changes
  useEffect(() => {
    // 1. Initial services fetching and potential seeding
    const initDataAndAuth = async () => {
      await fetchServices();
      await seedServicesIfEmpty();
      
      // 2. Load auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handleAuthUser(session.user);
      } else {
        setCurrentUser(null);
        setBookings([]);
        setUsers([]);
      }
    };

    initDataAndAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await handleAuthUser(session.user);
      } else {
        setCurrentUser(null);
        setBookings([]);
        setUsers([]);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, passwordInput: string, roleHint?: 'customer' | 'staff' | 'admin'): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: passwordInput
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error(language === 'en' ? 'Authentication failed.' : 'فشلت عملية التحقق.');
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    let role: 'customer' | 'staff' | 'admin' = (profile?.role as 'customer' | 'staff' | 'admin') || 'customer';

    // Auto-promote George B. Teich
    if (email.toLowerCase() === 'georgebteich@live.com' && role !== 'admin') {
      role = 'admin';
      await supabase.from('users').update({ role: 'admin' }).eq('id', data.user.id);
    }

    const loggedUser: User = {
      id: data.user.id,
      name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0].toUpperCase(),
      email: data.user.email || email.toLowerCase(),
      phone: profile?.phone || data.user.user_metadata?.phone || '',
      role: role
    };

    setCurrentUser(loggedUser);
    await fetchBookings(loggedUser);
    if (loggedUser.role === 'admin' || loggedUser.role === 'staff') {
      await fetchUsers();
    }

    addToast('Logged in successfully!', 'تم تسجيل الدخول بنجاح!', 'success');
    return loggedUser;
  };

  const signup = async (name: string, email: string, phone: string, passwordInput?: string): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: passwordInput || 'Admin@1234',
      options: {
        data: {
          full_name: name,
          phone: phone
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error(language === 'en' ? 'Signup failed. Please try again.' : 'فشل التسجيل. يرجى المحاولة مرة أخرى.');
    }

    // Auto-promote George block for Admin
    const role: 'customer' | 'staff' | 'admin' = email.toLowerCase() === 'georgebteich@live.com' ? 'admin' : 'customer';

    const newUser: User = {
      id: data.user.id,
      name,
      email: email.toLowerCase(),
      phone,
      role: role
    };

    // Explicitly insert into users table in case the postgres trigger has latency or is not deployed
    try {
      await supabase.from('users').upsert({
        id: data.user.id,
        full_name: name,
        email: email.toLowerCase(),
        phone: phone,
        role: role
      });
    } catch (err) {
      console.warn('Explicit row insertion warning:', err);
    }

    setCurrentUser(newUser);
    addToast('Registered and logged in successfully!', 'تم تسجيل الحساب والدخول بنجاح!', 'success');
    return newUser;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setBookings([]);
    setUsers([]);
    addToast('Logged out successfully.', 'تم تسجيل الخروج بنجاح.', 'info');
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'userId' | 'userName' | 'userPhone' | 'userEmail' | 'createdAt' | 'status'>) => {
    if (!currentUser) return;

    const id = 'b-' + (Math.floor(Math.random() * 9000) + 1000).toString();
    const createdAt = new Date().toISOString();

    const newBookingRow = {
      id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_phone: currentUser.phone,
      user_email: currentUser.email,
      service_id: bookingData.serviceId,
      service_name_en: bookingData.serviceNameEn,
      service_name_ar: bookingData.serviceNameAr,
      category_id: bookingData.categoryId,
      date: bookingData.date,
      time_slot: bookingData.timeSlot,
      urgency: bookingData.urgency,
      address: bookingData.address,
      description: bookingData.description,
      photos: bookingData.photos || [],
      booking_fee: bookingData.bookingFee || null,
      status: 'Pending',
      cost_items: [],
      internal_notes: '',
      created_at: createdAt
    };

    const { error } = await supabase.from('bookings').insert([newBookingRow]);

    if (error) {
      console.error('Error inserting booking:', error);
      addToast('Failed to request booking.', 'فشل إرسال طلب الحجز.', 'warning');
      return;
    }

    await fetchBookings(currentUser);
    addToast('Booking requested successfully!', 'تم طلب الحجز بنجاح!', 'success');
  };

  const updateBookingStatus = async (id: string, newStatus: BookingStatus) => {
    const { data: b, error: fetchErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !b) {
      console.error('Error finding booking status:', fetchErr);
      return;
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating booking status:', error);
      addToast('Failed to update status.', 'فشل تحديث حالة الحجز.', 'warning');
      return;
    }

    if (b.status === 'Pending' && newStatus === 'Confirmed') {
      const msgEn = `Booking #${b.id} for "${b.service_name_en}" has been CONFIRMED by our M-TECH dispatcher! We are scheduling your slot.`;
      const msgAr = `تم تأكيد حجزك رقم #${b.id} لـ "${b.service_name_ar}" من قبل منسق M-TECH! نقوم الآن بجدولة زيارتك.`;
      console.log(`%c[NOTIFICATION TRIGGERED] Booking ${id}: Pending -> Confirmed`, 'background: #CCFF00; color: #000; font-weight: bold; padding: 2px 5px;');
      addToast(msgEn, msgAr, 'success');
    } else if (b.status !== newStatus) {
      const msgEn = `Booking #${b.id} is now updated to "${newStatus}".`;
      const msgAr = `تم تحديث حالة الحجز رقم #${b.id} لتصبح "${newStatus === 'In Progress' ? 'قيد التنفيذ' : newStatus === 'Completed' ? 'مكتمل' : newStatus === 'Cancelled' ? 'ملغي' : newStatus}".`;
      addToast(msgEn, msgAr, 'info');
    }

    if (currentUser) {
      await fetchBookings(currentUser);
    }
  };

  const updateServiceFee = async (serviceId: string, fee: number) => {
    const { error } = await supabase
      .from('services')
      .update({ booking_fee: fee })
      .eq('id', serviceId);

    if (error) {
      console.error('Error updating service fee:', error);
      addToast('Failed to update service fee.', 'فشل تحديث أجور الخدمة.', 'warning');
      return;
    }

    await fetchServices();
    addToast('Service fee updated successfully.', 'تم تحديث أجور الخدمة بنجاح.', 'success');
  };

  const cancelBooking = async (id: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'Cancelled' })
      .eq('id', id);

    if (error) {
      console.error('Error cancelling booking:', error);
      addToast('Failed to cancel booking.', 'فشل إلغاء الحجز.', 'warning');
      return;
    }

    if (currentUser) {
      await fetchBookings(currentUser);
    }
    addToast('Booking cancelled.', 'تم إلغاء الحجز.', 'info');
  };

  const rescheduleBooking = async (id: string, date: string, timeSlot: TimeSlot) => {
    const { error } = await supabase
      .from('bookings')
      .update({ date, time_slot: timeSlot })
      .eq('id', id);

    if (error) {
      console.error('Error rescheduling booking:', error);
      addToast('Failed to reschedule booking.', 'فشل إعادة جدولة الحجز.', 'warning');
      return;
    }

    if (currentUser) {
      await fetchBookings(currentUser);
    }
    addToast('Booking rescheduled successfully.', 'تم إعادة جدولة الحجز بنجاح.', 'success');
  };

  const updateBookingCosts = async (id: string, costItems: CostItem[], internalNotes?: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({
        cost_items: costItems,
        internal_notes: internalNotes ?? ''
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating booking costs:', error);
      addToast('Failed to update expenses.', 'فشل تحديث تفاصيل المصاريف.', 'warning');
      return;
    }

    if (currentUser) {
      await fetchBookings(currentUser);
    }
    addToast('Expenses and notes updated successfully.', 'تم تحديث المصاريف والملاحظات بنجاح.', 'success');
  };

  const updateUserRole = async (userId: string, newRole: 'customer' | 'staff' | 'admin') => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser && targetUser.role === 'admin' && newRole !== 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        addToast(
          'Cannot change role. There must always be at least one Admin account.',
          'لا يمكن تغيير الدور. يجب وجود حساب مسؤول واحد على الأقل.',
          'warning'
        );
        return;
      }
    }

    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      addToast('Failed to update user role.', 'فشل تحديث صلاحية المشغل.', 'warning');
      return;
    }

    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
    }

    await fetchUsers();
    addToast('User role updated successfully.', 'تم تحديث صلاحية المشغل بنجاح.', 'success');
  };

  const updateUserPassword = async (userId: string, newPassword: string) => {
    if (currentUser && userId === currentUser.id) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.error('Error updating password in auth:', error);
        addToast('Failed to update password.', 'فشل تحديد كلمة المرور.', 'warning');
        return;
      }
      addToast('Password updated successfully.', 'تم تحديث كلمة المرور بنجاح.', 'success');
    } else {
      addToast(
        'Direct override of another user’s password requires Supabase administrative credentials.',
        'إعادة تعيين كلمة مرور مستخدم آخر يتطلب الدخول إلى لوحة المطورين في سوبابيز.',
        'info'
      );
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        currentUser,
        users,
        bookings,
        services,
        toggleLanguage,
        login,
        signup,
        logout,
        createBooking,
        updateBookingStatus,
        updateServiceFee,
        cancelBooking,
        rescheduleBooking,
        updateBookingCosts,
        updateUserRole,
        updateUserPassword,
        activeToasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
