import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Lock, User, Phone, AlertTriangle } from 'lucide-react';

export const Signup: React.FC = () => {
  const { signUp } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password) {
      setError(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة الكترونياً.' : 'Please completely fill in all parameters.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      await signUp(email, password, fullName, phone);
      navigate('/');
    } catch (err: any) {
      setError(err?.message || (language === 'ar' ? 'تعذر إنشاء الحساب. يُرجى التحقق من المدخلات.' : 'Registration failed. Check inputs or connection.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="signup-layout-wrapper" className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-md bg-black border border-gray-900 rounded-none p-8 relative overflow-hidden">
        {/* Aesthetic highlight bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-lime-primary"></div>

        <div className="text-center mb-8">
          <span className="font-mono text-xs font-bold tracking-widest text-lime-primary bg-zinc-900 px-3 py-1 uppercase rounded-none">
            {t('signupTitle')}
          </span>
          <h2 className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-white uppercase">
            {language === 'ar' ? 'التسجيل للمواطنين والمقيمين' : 'Shed Account Setup'}
          </h2>
          <p className="mt-2 text-xs text-gray-500 font-mono">
            {language === 'ar' ? 'سجل بيانات صيانة منزلك للبدء الفوري' : 'ACCESS SHED LIVE IN-HOUSE SERVICE MODULES'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-black border border-red-500 rounded-none flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs text-white font-mono break-all leading-relaxed">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              {t('fullName')}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-black border border-gray-800 text-white rounded-none focus:outline-none focus:border-lime-primary font-mono text-sm transition-colors"
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-1.5">
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
                className="w-full pl-10 pr-4 py-2.5 bg-black border border-gray-800 text-white rounded-none focus:outline-none focus:border-lime-primary font-mono text-sm transition-colors"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              {t('phone')}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+966 50 123 4567"
                className="w-full pl-10 pr-4 py-2.5 bg-black border border-gray-800 text-white rounded-none focus:outline-none focus:border-lime-primary font-mono text-sm transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              {t('password')}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-black border border-gray-800 text-white rounded-none focus:outline-none focus:border-lime-primary font-mono text-sm transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 mt-2 bg-lime-primary text-black hover:bg-white transition-all font-mono font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? 'Registering...' : t('signupBtn')}</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-900 text-center">
          <p className="text-xs text-gray-500 font-mono">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-white font-bold hover:text-lime-primary uppercase transition-colors">
              {t('loginBtn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
