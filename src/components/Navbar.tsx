import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, LayoutDashboard, LogOut, LogIn, Globe, Home } from 'lucide-react';
import { ShedLogo } from './ShedLogo';

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleLogout = () => {
    logout();
    navigate('/', { state: { resetHome: true } });
  };

  return (
    <nav className="border-b border-zinc-200 bg-white/95 backdrop-blur-md text-black font-mono sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo / Title */}
          <Link to="/" state={{ resetHome: true }} className="flex items-center group">
            <ShedLogo className="h-7 w-auto select-none" />
          </Link>

          {/* Navigation Items (Desktop) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
            <Link 
              to="/" 
              state={{ resetHome: true }}
              className={`flex items-center gap-1 hover:text-[#C63300] transition-colors ${location.pathname === '/' ? 'text-[#C63300]' : 'text-zinc-600'}`}
            >
              <Home className="w-3.5 h-3.5" />
              {t('home')}
            </Link>

            {user && (
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-1 hover:text-[#C63300] transition-colors ${location.pathname === '/dashboard' ? 'text-[#C63300]' : 'text-zinc-600'}`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                {t('dashboard')}
              </Link>
            )}

            {profile?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`flex items-center gap-1 hover:text-[#C63300] transition-colors ${location.pathname === '/admin' ? 'text-[#C63300]' : 'text-zinc-600'}`}
              >
                <Shield className="w-3.5 h-3.5" />
                {t('admin')}
              </Link>
            )}
          </div>

          {/* User Interface Commands & Language Switcher */}
          <div className="flex items-center gap-4">
            {/* Bilingual Flag Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 hover:text-[#C63300] border border-zinc-200 px-3 py-1 bg-zinc-50 text-black font-bold uppercase transition-all hover:border-[#C63300] text-xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#C63300]" />
              {language === 'en' ? 'AR' : 'EN'}
            </button>

            {user ? (
               <div className="flex items-center gap-3">
                 <span className="hidden sm:inline border-l border-zinc-200 pl-3 text-[10px] text-zinc-650 max-w-[120px] truncate">
                   {profile?.full_name || user.email}
                 </span>
                 <button
                   onClick={handleLogout}
                   className="flex items-center gap-1 border border-[#C63300] hover:bg-[#C63300] hover:text-white hover:border-[#C63300] px-3 py-1.5 transition-all font-bold uppercase text-[10px] text-[#C63300] cursor-pointer"
                 >
                   <LogOut className="w-3 h-3" />
                   {language === 'ar' ? 'خروج' : 'LOGOUT'}
                 </button>
               </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 border border-[#C63300] bg-zinc-50 hover:bg-[#C63300] hover:text-white hover:border-[#C63300] px-4 py-1.5 transition-all font-extrabold uppercase text-xs text-[#C63300]"
              >
                <LogIn className="w-3.5 h-3.5" />
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
