import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Lock, Mail, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const { signIn } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(language === 'ar' ? 'يرجى إكمال جميع الحقول.' : 'Please fill in all fields.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      await signIn(email, password);
      // Let's redirect based on role or just default. The router will handle auth state, but we'll redirect.
      // We will allow general auth redirect or directly route to '/' or '/admin'.
      // We can inspect the profile after login or let the App router handle redirections. Let's redirect to '/' first
      // which will direct them appropriately.
      navigate('/');
    } catch (err: any) {
      setError(err?.message || (language === 'ar' ? 'فشل تسجيل الدخول. يرجى التحقق من المدخلات.' : 'Login failed. Please check your credentials.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDemoAdmin = () => {
    setEmail('admin@shed.com');
    setPassword('Admin@1234');
  };

  return (
    <div id="login-layout-wrapper" className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-md bg-black border border-gray-900 rounded-none p-8 relative overflow-hidden">
        {/* Aesthetic highlight bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-lime-primary"></div>

        <div className="text-center mb-8">
          <span className="font-mono text-xs font-bold tracking-widest text-lime-primary bg-zinc-900 px-3 py-1 uppercase rounded-none">
            {t('loginTitle')}
          </span>
          <h2 className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-white uppercase">
            {language === 'ar' ? 'الدخول للمنظومة' : 'Internal Sign-In'}
          </h2>
          <p className="mt-2 text-xs text-gray-500 font-mono">
            {language === 'ar' ? 'يرجى إدخال بيانات الاعتماد الخاصة بك' : 'AUTHENTICATION REQUIRED FOR SYSTEM ENGAGEMENT'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4.5 bg-black border border-red-500 rounded-none flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs text-white font-mono break-all leading-relaxed">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-2">
              {t('email')}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="developer@shed.com"
                className="w-full pl-10 pr-4 py-3 bg-black border border-gray-800 text-white rounded-none focus:outline-none focus:border-lime-primary font-mono text-sm leading-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                {t('password')}
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-black border border-gray-800 text-white rounded-none focus:outline-none focus:border-lime-primary font-mono text-sm leading-none transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 mt-2 bg-lime-primary text-black hover:bg-white transition-all font-mono font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? 'Authenticating...' : t('loginBtn')}</span>
            {language === 'ar' ? (
              <ArrowLeft className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Guest fallback trigger or Demo Quick Login seed */}
        <div className="mt-6 pt-6 border-t border-gray-900 text-center space-y-4">
          <button
            type="button"
            onClick={handleSetDemoAdmin}
            className="text-xs font-mono text-lime-primary hover:underline uppercase tracking-wide bg-zinc-950 px-3 py-1.5 border border-zinc-900 rounded-none cursor-pointer"
          >
            🔑 {language === 'ar' ? 'تخطي للدخول كمسؤول (تجريبي)' : 'AUTO-FILL DEMO ADMIN CREDENTIALS'}
          </button>

          <p className="text-xs text-gray-500 font-mono">
            {t('dontHaveAccount')}{' '}
            <Link to="/signup" className="text-white font-bold hover:text-lime-primary uppercase transition-colors">
              {t('signupBtn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
