import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { TRANSLATIONS } from '../data';
import ServiceIcon from '../components/ServiceIcon';

interface AuthProps {
  isAdmin?: boolean;
}

export const Auth: React.FC<AuthProps> = ({ isAdmin = false }) => {
  const { language, login, signup, currentUser, toggleLanguage } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const t = TRANSLATIONS[language];

  // If already logged in, redirect correctly
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [currentUser, navigate]);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg(language === 'en' ? 'Email is required' : 'البريد الإلكتروني مطلوب');
      return;
    }

    if (isLogin || isAdmin) {
      if (!password) {
        setErrorMsg(language === 'en' ? 'Password is required' : 'كلمة المرور مطلوبة');
        return;
      }
      try {
        const user = await login(email, password, isAdmin ? 'admin' : 'customer');
        setSuccessMsg(t.authSuccess);
        setTimeout(() => {
          if (user.role === 'admin' || user.role === 'staff') {
            navigate('/admin');
          } else {
            const from = (location.state as any)?.from || '/dashboard';
            navigate(from);
          }
        }, 1000);
      } catch (err: any) {
        setErrorMsg(err.message || t.authError);
      }
    } else {
      if (!name || !phone || !password) {
        setErrorMsg(language === 'en' ? 'All fields are required' : 'جميع الحقول مطلوبة');
        return;
      }
      try {
        await signup(name, email, phone, password);
        setSuccessMsg(t.signupSuccess);
        setIsLogin(true); // Switch to login view
        setEmail(email); // Keep email
      } catch (err: any) {
        setErrorMsg(err.message || (language === 'en' ? 'Email or account already exists.' : 'البريد الإلكتروني مسجل بالفعل.'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top bar with logo and language toggle */}
      <header className="border-b border-[#1A1A1A] bg-black p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#CCFF00] rounded-sm shrink-0 flex items-center justify-center text-black font-extrabold text-[12px] tracking-tighter">
              MT
            </div>
            <div>
              <Link to="/" className="font-sans font-black text-2xl tracking-tighter text-[#CCFF00] hover:text-white transition-colors leading-none block">
                M-TECH
              </Link>
              <p className="font-mono text-[9px] text-white/40 tracking-widest mt-0.5 uppercase">
                {language === 'en' ? 'SYSTEMS GATE' : 'بوابة النظام'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="border border-[#CCFF00]/60 hover:bg-[#CCFF00] hover:text-black transition-all px-3 py-1.5 text-xs font-mono tracking-widest text-[#CCFF00] rounded-sm cursor-pointer uppercase"
            >
              {t.langToggle}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md border border-[#1A1A1A]/50 bg-[#1A1A1A] p-8 relative rounded-3xl shadow-2xl">
          {/* Decorative Corner Flanges */}
          <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 w-2 h-2 rounded-full bg-[#CCFF00]"></div>

          <div className="mb-8">
            <div className="text-xs font-mono text-[#CCFF00] tracking-widest uppercase mb-1">
              {isAdmin ? 'SECURE OPERATIONS DESK' : 'INTERNAL CLIENT WORKSPACE'}
            </div>
            <h2 className="text-2xl font-sans font-black tracking-tight uppercase">
              {isAdmin ? t.adminLoginTitle : isLogin ? t.loginTitle : t.signupTitle}
            </h2>
            <p className="text-sm text-white/60 mt-2 font-sans font-light">
              {isAdmin ? t.adminLoginSubtitle : isLogin ? t.loginSubtitle : t.signupSubtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="border border-[#CCFF00] bg-black text-white p-3 text-sm font-sans flex items-center gap-2 relative">
                <span className="w-2 h-2 bg-[#CCFF00] shrink-0"></span>
                <span className="text-[#CCFF00] font-sans font-bold">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="border border-[#CCFF00] bg-black p-3 text-sm font-sans flex items-center gap-2">
                <span className="w-2 h-2 bg-[#CCFF00] animate-ping shrink-0"></span>
                <span className="text-[#CCFF00] font-sans font-bold">{successMsg}</span>
              </div>
            )}

            {/* Fields */}
            <div className="space-y-4">
              {/* Name Field (Signup Only) */}
              {!isLogin && !isAdmin && (
                <div>
                  <label className="block text-xs font-mono tracking-widest uppercase mb-2 text-white/70">
                    {t.fieldName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-[#1A1A1A] hover:border-neutral-800 focus:border-[#CCFF00] text-white px-4 py-3 text-sm rounded-xl tracking-wide focus:outline-none transition-all font-sans"
                    placeholder="e.g. Antonio Beaino"
                  />
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-xs font-mono tracking-widest uppercase mb-2 text-white/70">
                  {t.fieldEmail} *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-[#1A1A1A] hover:border-neutral-800 focus:border-[#CCFF00] text-white px-4 py-3 text-sm rounded-xl tracking-wide focus:outline-none transition-all font-sans"
                  placeholder={isAdmin ? "admin@company.com" : "customer@gmail.com"}
                  dir="ltr"
                />
                {isAdmin && (
                  <p className="text-[10px] text-white/40 mt-1 font-mono">
                    * Try using: <span className="text-[#CCFF00] border-b border-[#CCFF00]/20 font-bold font-mono">admin@company.com</span> for instant dashboard access
                  </p>
                )}
                {!isAdmin && isLogin && (
                  <p className="text-[10px] text-white/40 mt-1 font-mono">
                    * Try using: <span className="text-[#CCFF00] border-b border-[#CCFF00]/20 font-bold font-mono">customer@gmail.com</span> for demo credentials
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-mono tracking-widest uppercase text-white/70">
                    {t.fieldPassword} *
                  </label>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-[#1A1A1A] hover:border-neutral-800 focus:border-[#CCFF00] text-white px-4 py-3 text-sm rounded-xl tracking-wide focus:outline-none transition-all font-sans"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>

              {/* Phone Field (Signup Only) */}
              {!isLogin && !isAdmin && (
                <div>
                  <label className="block text-xs font-mono tracking-widest uppercase mb-2 text-white/70">
                    {t.fieldPhone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black border border-[#1A1A1A] hover:border-neutral-800 focus:border-[#CCFF00] text-white px-4 py-3 text-sm rounded-xl tracking-wide focus:outline-none transition-all font-sans"
                    placeholder="e.g. +966 50 123 4567"
                    dir="ltr"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#CCFF00] hover:bg-black hover:text-[#CCFF00] text-black border-2 border-[#CCFF00] transition-all py-3.5 text-xs font-mono tracking-widest font-black uppercase rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <span>{isAdmin ? t.btnSubmitLogin : isLogin ? t.btnSubmitLogin : t.btnSubmitSignup}</span>
              <ServiceIcon name={language === 'ar' ? 'ChevronLeft' : 'ChevronRight'} className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Login/Signup */}
          {!isAdmin && (
            <div className="mt-8 pt-6 border-t border-[#CCFF00]/20 text-center text-sm font-sans">
              <span className="text-white/60">
                {isLogin ? t.msgNoAccount : t.msgHaveAccount}{' '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-[#CCFF00] hover:underline hover:text-white font-bold ml-1 transition-colors cursor-pointer"
              >
                {isLogin ? t.linkSignup : t.linkLogin}
              </button>
            </div>
          )}

          {isAdmin && (
            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm font-mono text-white/50 hover:text-[#CCFF00] underline uppercase tracking-wide">
                {language === 'en' ? '← CUSTOMER ACCESS INTERFACE' : '← بوابة دخول العملاء'}
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#CCFF00]/25 bg-black p-4 text-center">
        <p className="font-mono text-[10px] text-white/40 tracking-wider">
          © {new Date().getFullYear()} {t.appName} SYSTEMS. ALL RIGHTS RESERVED. BILINGUAL HIGH-CONTRAST CONSOLE.
        </p>
      </footer>
    </div>
  );
};
export default Auth;
