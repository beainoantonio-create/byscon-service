import React from 'react';
import { useApp } from '../context/AppContext';
import ServiceIcon from './ServiceIcon';

export const ToastNotifier: React.FC = () => {
  const { activeToasts, removeToast, language } = useApp();

  if (activeToasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-6 z-50 flex flex-col gap-3 max-w-md w-full px-6 pointer-events-none ltr:right-0 ltr:left-auto rtl:left-0 rtl:right-auto"
      style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
    >
      {activeToasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full bg-[#141414] text-white p-4 rounded-2xl shadow-2xl border flex items-start gap-3.5 animate-slide-in duration-300 relative overflow-hidden ${
              isSuccess 
                ? 'border-[#CCFF00]/30 hover:border-[#CCFF00]' 
                : isWarning 
                  ? 'border-orange-500/30 hover:border-orange-500' 
                  : 'border-white/10 hover:border-white/20'
            }`}
          >
            {/* Visual accent vertical bar */}
            <div 
              className={`absolute top-0 bottom-0 w-1 ${
                language === 'ar' ? 'right-0' : 'left-0'
              } ${isSuccess ? 'bg-[#CCFF00]' : isWarning ? 'bg-orange-500' : 'bg-[#CCFF00]'}`}
            />

            {/* Icon Column */}
            <div className={`shrink-0 p-1.5 rounded-lg bg-black ${isSuccess ? 'text-[#CCFF00]' : 'text-white/60'}`}>
              <ServiceIcon 
                name={isSuccess ? 'CheckCircle' : isWarning ? 'AlertTriangle' : 'Clock'} 
                className="w-5 h-5" 
              />
            </div>

            {/* Content Column */}
            <div className="flex-grow pt-0.5">
              <span className="font-mono text-[9px] text-[#CCFF00] tracking-widest uppercase font-black block mb-0.5">
                {isSuccess 
                  ? (language === 'en' ? 'DISPATCH CONFIRMATION' : 'تأكيد جدولة الزيارة') 
                  : (language === 'en' ? 'SYSTEM UPDATE' : 'تحديث النظام')
                }
              </span>
              <p className="text-xs font-sans text-white/90 leading-relaxed font-normal">
                {language === 'en' ? toast.messageEn : toast.messageAr}
              </p>
            </div>

            {/* Dismiss Column */}
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-white/40 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              aria-label="Dismiss notification"
            >
              <ServiceIcon name="X" className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastNotifier;
