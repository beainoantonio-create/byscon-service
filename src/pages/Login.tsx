import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Navbar } from '../components/Navbar';
import { BackgroundVectors } from '../components/BackgroundVectors';
import { Key, Mail, AlertTriangle } from 'lucide-react';
import { ShedLogo } from '../components/ShedLogo';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        const redirect = searchParams.get('redirect') || '';
        if (redirect === 'home') {
          navigate('/');
        } else {
          // Check if admin or standard client
          if (email.toLowerCase().trim() === 'admin@shed.com') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        setError(language === 'ar' ? 'فشل التحقق من الهوية. يرجى مراجعة تفاصيل البريد وكلمة المرور.' : 'Authentication failed. Please verify email and password.');
      }
    } catch (err) {
      setError('System encountered failure during auth query.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col relative overflow-hidden">
      <BackgroundVectors />
      <Navbar />

      <div className="flex-grow flex items-center justify-center px-4 py-16 relative z-10 w-full">
        <div className="w-full max-w-md border border-zinc-200 bg-white p-8 font-mono shadow-md">
          <div className="text-center mb-8">
            <div className="mb-4">
              <ShedLogo className="mx-auto h-12 w-auto select-none" />
            </div>
            <h2 className="text-2xl font-sans font-black tracking-tighter uppercase text-black">
              {language === 'ar' ? 'بوابة التحقق الآمنة' : 'UTILITIES AUTH PORTAL'}
            </h2>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">
              {language === 'ar' ? 'أدخل رمز تفعيل الحساب' : 'LOG INTO YOUR SECURE DEPLOYMENT TERMINAL'}
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 flex items-center gap-2 text-xs text-red-700">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-600 mb-2">
                <Mail className="w-3 inline mr-1 text-[#C63300]" />
                {language === 'ar' ? 'البريد الإلكتروني للعميل' : 'Registered Operator Email'} *
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="operator@shed.com"
                className="w-full px-3 py-2 bg-white border border-zinc-200 hover:border-[#C63300] text-black rounded-none focus:outline-none focus:border-[#C63300] text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-600 mb-2">
                <Key className="w-3 inline mr-1 text-[#C63300]" />
                {language === 'ar' ? 'كلمة المرور السرية' : 'Secure Passcode'} *
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-white border border-zinc-200 hover:border-[#C63300] text-black rounded-none focus:outline-none focus:border-[#C63300] text-xs"
                required
              />
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full py-2.5 bg-[#C63300] hover:bg-black text-white hover:text-white font-sans font-black tracking-tight uppercase transition-all duration-200 cursor-pointer text-xs border border-transparent"
            >
              {loading ? 'PROCESSING...' : (language === 'ar' ? 'المتابعة والدخول' : 'ESTABLISH CONNECTIVITY')}
            </button>
          </form>

          {/* Seed credentials description block */}
          <div className="mt-8 pt-6 border-t border-zinc-150 text-[10px] text-zinc-500 space-y-2 uppercase leading-relaxed text-center">
            <p className="font-bold">
              {language === 'ar'
                ? 'ملاحظة: يمكنك إدخال أي بريد إلكتروني وكلمة مرور من 4 أحرف وسيقوم النظام بتسجيل دخولك فوراً للأغراض التوضيحية.'
                : 'DEMO PASSCODE SECURITY NOTE:'}
            </p>
            <p className="text-[#C63300]">
              ADMIN: <strong className="underline">admin@shed.com</strong> / PASS: <strong className="underline">password</strong><br />
              CLIENT: <strong className="underline">client@shed.com</strong> / PASS: <strong className="underline">password</strong>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/signup" className="text-[10px] text-zinc-500 hover:text-[#C63300] font-bold uppercase underline">
              {language === 'ar' ? 'ليس لديك حساب؟ سجل حساباً جديداً' : 'NO ACCOUNT? REGISTER OPERATOR UNIT'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
