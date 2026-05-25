import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LogOut, User, Globe, LayoutDashboard, KeyRound, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-lime-primary text-black border border-black';
      case 'staff':
        return 'border border-lime-primary text-lime-primary bg-black';
      default:
        return 'border border-gray-700 text-gray-400';
    }
  };

  return (
    <header id="shed-main-navigation" className="sticky top-0 z-50 bg-black text-white border-b border-gray-900 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link 
          to="/" 
          id="nav-logo" 
          className="flex items-center gap-3 group"
        >
          <span className="font-mono text-3xl font-extrabold tracking-widest text-white group-hover:text-lime-primary transition-colors">
            SHED
          </span>
          <span className="h-4 w-[1.5px] bg-gray-800"></span>
          <span className="hidden sm:inline font-mono text-[10px] tracking-widest text-gray-500 uppercase">
            Internal Operations
          </span>
        </Link>

        {/* Action Controls & User States */}
        <div id="nav-actions" className="flex items-center gap-3 sm:gap-4">
          {/* Language Toggle */}
          <button
            id="lang-toggle-btn"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold bg-gray-900 hover:bg-lime-primary hover:text-black border border-gray-800 hover:border-lime-primary text-white rounded transition-all"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'AR' : 'EN'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Role badge and info */}
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="font-sans text-xs text-white font-medium">
                  {profile?.full_name || 'SHED User'}
                </span>
                <span className="font-mono text-[9px] text-gray-500 uppercase">
                  {user.email}
                </span>
              </div>

              {/* Status Badge */}
              {profile && (
                <span className={`px-2 py-0.5 font-mono text-[10px] font-extrabold rounded uppercase ${getRoleBadgeColor(profile.role)}`}>
                  {profile.role}
                </span>
              )}

              {/* Redirection / Dashboard Buttons based on Role */}
              {profile && (profile.role === 'admin' || profile.role === 'staff') ? (
                <Link
                  id="nav-to-admin"
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold rounded transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-lime-primary text-black'
                      : 'bg-gray-900 text-white hover:bg-lime-primary hover:text-black'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{t('adminDashboard')}</span>
                </Link>
              ) : (
                <Link
                  id="nav-to-dashboard"
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold rounded transition-colors ${
                    location.pathname.startsWith('/dashboard')
                      ? 'bg-lime-primary text-black'
                      : 'bg-gray-900 text-white hover:bg-lime-primary hover:text-black'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{t('activeRequests')}</span>
                </Link>
              )}

              {/* Sign Out Button */}
              <button
                id="sign-out-btn"
                onClick={handleSignOut}
                className="p-1.5 sm:p-2 bg-gray-900 text-red-500 hover:bg-white border border-gray-800 hover:border-white rounded transition-colors"
                title="Log Out / تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                id="nav-login"
                to="/login"
                className="px-3.5 py-1.5 font-mono text-xs font-bold text-gray-400 hover:text-white transition-colors"
              >
                {t('loginBtn')}
              </Link>
              <Link
                id="nav-signup"
                to="/signup"
                className="px-3.5 py-1.5 font-mono text-xs font-extrabold text-black bg-lime-primary hover:bg-white transition-colors rounded"
              >
                {t('signupBtn')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
