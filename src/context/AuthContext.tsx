import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import db, { isSupabaseConfigured, supabase, MockUserRecord } from '../lib/db';

interface AuthContextType {
  user: any; // Supabase auth user or mock user object
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileRole: (userId: string, role: UserRole) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string, email: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', uid)
          .single();

        if (error || !data) {
          // Profile didn't exist yet, let's insert it
          const isFirstAdmin = email === 'admin@shed.com';
          const newProfile: UserProfile = {
            id: uid,
            full_name: 'User',
            phone: '',
            role: isFirstAdmin ? 'admin' : 'customer'
          };
          
          await supabase.from('users').insert({
            id: newProfile.id,
            full_name: newProfile.full_name,
            phone: newProfile.phone,
            role: newProfile.role
          });
          
          setProfile(newProfile);
        } else {
          setProfile(data as UserProfile);
        }
      } else {
        // Mock DB Profile fetching
        const users = JSON.parse(localStorage.getItem('shed_users') || '[]');
        const found = users.find((u: MockUserRecord) => u.id === uid);
        if (found) {
          setProfile({
            id: found.id,
            full_name: found.full_name,
            phone: found.phone,
            role: found.role
          });
        }
      }
    } catch (e) {
      console.error("Error fetching user profile", e);
    }
  };

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    if (isSupabaseConfigured && supabase) {
      // Supabase Active
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });

      unsubscribe = () => subscription.unsubscribe();
    } else {
      // Mock Auth Setup
      const loggedUser = localStorage.getItem('shed_current_user');
      if (loggedUser) {
        try {
          const uObj = JSON.parse(loggedUser);
          setUser(uObj);
          fetchProfile(uObj.id, uObj.email);
        } catch {
          localStorage.removeItem('shed_current_user');
        }
      }
      setLoading(false);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          await fetchProfile(data.user.id, email);
        }
      } else {
        // Mock Authenticate
        const users: MockUserRecord[] = JSON.parse(localStorage.getItem('shed_users') || '[]');
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!found) {
          throw new Error('User not found. Please sign up or use seeded credentials.');
        }
        if (found.password !== password) {
          throw new Error('Incorrect password.');
        }

        const sessionUser = { id: found.id, email: found.email, full_name: found.full_name };
        localStorage.setItem('shed_current_user', JSON.stringify(sessionUser));
        setUser(sessionUser);
        setProfile({
          id: found.id,
          full_name: found.full_name,
          phone: found.phone,
          role: found.role
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    setLoading(true);
    try {
      // Check first if email is admin@shed.com for mock role setting
      const isFirstAdmin = email.toLowerCase() === 'admin@shed.com';
      const determinedRole: UserRole = isFirstAdmin ? 'admin' : 'customer';

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          // Manually guarantee registration in custom table since trigger is fine but triggers on auth table
          const newProfile: UserProfile = {
            id: data.user.id,
            full_name: fullName,
            phone: phone,
            role: determinedRole
          };
          await supabase.from('users').insert({
            id: newProfile.id,
            full_name: newProfile.full_name,
            phone: newProfile.phone,
            role: newProfile.role
          });
          setProfile(newProfile);
        }
      } else {
        // Mock signup
        const users: MockUserRecord[] = JSON.parse(localStorage.getItem('shed_users') || '[]');
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error('Email already exists.');
        }

        const newUid = 'mock-user-' + Math.floor(100000 + Math.random() * 900000);
        const newUser: MockUserRecord = {
          id: newUid,
          email,
          password,
          full_name: fullName,
          phone,
          role: determinedRole,
          created_at: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('shed_users', JSON.stringify(users));

        const sessionUser = { id: newUser.id, email: newUser.email, full_name: newUser.full_name };
        localStorage.setItem('shed_current_user', JSON.stringify(sessionUser));
        setUser(sessionUser);
        setProfile({
          id: newUser.id,
          full_name: newUser.full_name,
          phone: newUser.phone,
          role: newUser.role
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('shed_current_user');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileRole = async (userId: string, role: UserRole) => {
    await db.updateUserRole(userId, role);
    if (user && user.id === userId && profile) {
      setProfile({ ...profile, role });
    }
  };

  const changePassword = async (newPassword: string) => {
    if (user) {
      await db.updateUserPassword(user.id, newPassword);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email || '');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfileRole,
      changePassword,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
