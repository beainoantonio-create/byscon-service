import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Navbar } from '../components/Navbar';
import { BackgroundVectors } from '../components/BackgroundVectors';
import { Mail, Key, User, AlertTriangle } from 'lucide-react';
import { ShedLogo } from '../components/ShedLogo';

export const Signup: React.FC = () => {
  const { signup } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError(language === 'ar' ? 'يرجى ملء جميع الحقول الإلزامية' : 'All mandatory fields must be populated');
      return;
    }

    if (password !== confirmPassword) {
      setError(language === 'ar' ? 'كلمات المرور غير متوافقة' : 'Passcodes do not match alignment check');
      return;
    }

    if (password.length < 4) {
      setError(language === 'ar' ? 'يجب أن تكون كلمة المرور 4 أحرف كحد أدنى' : 'Passcode must have at least 4 chars');
      return;
    }

    setLoading(true);
    try {
      const success = await signup(email, password, name);
      if (success) {
        navigate('/dashboard');
      } else {
        setError(language === 'ar' ? 'البريد الإلكتروني مسجل مسبقاً في النظام.' : 'Email address already logged in system directories.');
      }
    } catch (err) {
      setError('System failure registering unit profile.');
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
              {language === 'ar' ? 'تسجيل عميل جديد' : 'REGISTER OPERATOR UNIT'}
            </h2>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">
              {language === 'ar' ? 'أدخل البيانات لتثبيت نطاق حسابكم الموحد' : 'PROVISION UNIQUE SYSTEM OPERATOR CREDENTIALS'}
            </p>
          </div>

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 flex items-center gap-2 text-xs text-red-700">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-600 mb-2">
                <User className="w-3 inline mr-1 text-[#C63300]" />
                {language === 'ar' ? 'الاسم بالكامل' : 'Operator Full Name'} *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Chief Commander"
                className="w-full px-3 py-2 bg-white border border-zinc-200 hover:border-[#C63300] text-black rounded-none focus:outline-none focus:border-[#C63300] text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-600 mb-2">
                <Mail className="w-3 inline mr-1 text-[#C63300]" />
                {language === 'ar' ? 'البريد الإلكتروني الخاص بكم' : 'Operator Email'} *
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
                {language === 'ar' ? 'كلمة المرور' : 'Secure Passcode'} *
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

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-600 mb-2">
                <Key className="w-3 inline mr-1 text-[#C63300]" />
                {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Passcode'} *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
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
              {loading ? 'DEPLOYING PROVISION...' : (language === 'ar' ? 'تثبيت الحساب الجديد ومباشرة العمل' : 'INITIALIZE PROFILE DIRECTORY')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-[10px] text-zinc-500 hover:text-[#C63300] font-bold uppercase underline">
              {language === 'ar' ? 'لديك حساب بالفعل؟ سجل الدخول الآن' : 'SECURE OPERATOR ALREADY ACTIVE? AUTHENTICATE'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Signup;
