import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Navbar } from '../components/Navbar';
import { BackgroundVectors } from '../components/BackgroundVectors';
import { 
  ArrowLeft, 
  ArrowRight, 
  HardHat, 
  Hammer, 
  Compass, 
  Layers, 
  Blocks, 
  Flame, 
  Trees, 
  Droplets, 
  DoorClosed, 
  Paintbrush, 
  Gem, 
  Truck, 
  Armchair, 
  Building, 
  ArrowUpDown, 
  Wind, 
  Zap
} from 'lucide-react';

interface SubService {
  id: string;
  name_en: string;
  name_ar: string;
}

interface Division {
  id: string;
  number: string;
  name_en: string;
  name_ar: string;
  icon: React.ComponentType<{ className?: string }>;
  subServices: SubService[];
}

const CONSTRUCTION_DIVISIONS: Division[] = [
  {
    id: "div-1",
    number: "01",
    name_en: "General Workmanship",
    name_ar: "أعمال عامة",
    icon: Hammer,
    subServices: [
      { id: "div-1-1", name_en: "Non-Skilled Labor", name_ar: "عمالة غير ماهرة" },
      { id: "div-1-2", name_en: "Semi Skilled Labor", name_ar: "عمالة شبه ماهرة" },
      { id: "div-1-3", name_en: "Skilled Labor", name_ar: "عمالة ماهرة" }
    ]
  },
  {
    id: "div-2",
    number: "02",
    name_en: "Site Work",
    name_ar: "أعمال الموقع",
    icon: Compass,
    subServices: [
      { id: "div-2-1", name_en: "Mobilization Services", name_ar: "خدمات التعبئة" },
      { id: "div-2-2", name_en: "Debris Removal", name_ar: "إزالة الحطام" },
      { id: "div-2-3", name_en: "Demolition Works", name_ar: "أعمال الهدم" },
      { id: "div-2-4", name_en: "Excavation Works", name_ar: "أعمال الحفر" },
      { id: "div-2-5", name_en: "Coring Works", name_ar: "أعمال الحفر الأسطواني" }
    ]
  },
  {
    id: "div-3",
    number: "03",
    name_en: "Concrete",
    name_ar: "خرسانة",
    icon: Layers,
    subServices: [
      { id: "div-3-1", name_en: "Request a Quote", name_ar: "طلب عرض سعر" }
    ]
  },
  {
    id: "div-4",
    number: "04",
    name_en: "Masonry",
    name_ar: "بناء",
    icon: Blocks,
    subServices: [
      { id: "div-4-1", name_en: "Masonry Works", name_ar: "أعمال البناء" }
    ]
  },
  {
    id: "div-5",
    number: "05",
    name_en: "Metals",
    name_ar: "معادن",
    icon: Flame,
    subServices: [
      { id: "div-5-1", name_en: "Metal Doors", name_ar: "أبواب معدنية" },
      { id: "div-5-2", name_en: "Metal Windows", name_ar: "نوافذ معدنية" },
      { id: "div-5-3", name_en: "Roof Structure", name_ar: "هيكل السقف" },
      { id: "div-5-4", name_en: "Sandwich Panel", name_ar: "ساندويش بانل" },
      { id: "div-5-5", name_en: "Others", name_ar: "أخرى" }
    ]
  },
  {
    id: "div-6",
    number: "06",
    name_en: "Wood and Plastics",
    name_ar: "خشب وبلاستيك",
    icon: Trees,
    subServices: [
      { id: "div-6-1", name_en: "Cabinets", name_ar: "خزائن" }
    ]
  },
  {
    id: "div-7",
    number: "07",
    name_en: "Thermal and Moisture Protection",
    name_ar: "حماية حرارية ومائية",
    icon: Droplets,
    subServices: [
      { id: "div-7-1", name_en: "Waterproofing", name_ar: "عزل مائي" },
      { id: "div-7-2", name_en: "Sound Proofing", name_ar: "عزل صوتي" }
    ]
  },
  {
    id: "div-8",
    number: "08",
    name_en: "Doors and Windows",
    name_ar: "أبواب ونوافذ",
    icon: DoorClosed,
    subServices: [
      { id: "div-8-1", name_en: "Doors", name_ar: "أبواب" },
      { id: "div-8-2", name_en: "Windows", name_ar: "نوافذ" }
    ]
  },
  {
    id: "div-9",
    number: "09",
    name_en: "Finishes",
    name_ar: "تشطيبات",
    icon: Paintbrush,
    subServices: [
      { id: "div-9-1", name_en: "Tiling", name_ar: "بلاط" },
      { id: "div-9-2", name_en: "Plastering", name_ar: "لياسة" },
      { id: "div-9-3", name_en: "Painting", name_ar: "دهان" },
      { id: "div-9-4", name_en: "Gypsum Board", name_ar: "جبس بورد" },
      { id: "div-9-5", name_en: "Counter Top", name_ar: "كاونتر توب" }
    ]
  },
  {
    id: "div-10",
    number: "10",
    name_en: "Specialties",
    name_ar: "تخصصات",
    icon: Gem,
    subServices: [
      { id: "div-10-1", name_en: "Specialty Works", name_ar: "أعمال متخصصة" }
    ]
  },
  {
    id: "div-11",
    number: "11",
    name_en: "Equipment",
    name_ar: "معدات",
    icon: Truck,
    subServices: [
      { id: "div-11-1", name_en: "Equipment Supply", name_ar: "توريد معدات" }
    ]
  },
  {
    id: "div-12",
    number: "12",
    name_en: "Furnishings",
    name_ar: "تأثيث",
    icon: Armchair,
    subServices: [
      { id: "div-12-1", name_en: "Furnishing Works", name_ar: "أعمال التأثيث" }
    ]
  },
  {
    id: "div-13",
    number: "13",
    name_en: "Special Construction",
    name_ar: "إنشاء خاص",
    icon: Building,
    subServices: [
      { id: "div-13-1", name_en: "Special Construction Works", name_ar: "أعمال إنشاء خاصة" }
    ]
  },
  {
    id: "div-14",
    number: "14",
    name_en: "Elevator and Conveying Systems",
    name_ar: "مصاعد وأنظمة نقل",
    icon: ArrowUpDown,
    subServices: [
      { id: "div-14-1", name_en: "Elevators", name_ar: "مصاعد" },
      { id: "div-14-2", name_en: "Conveying Systems", name_ar: "أنظمة النقل" }
    ]
  },
  {
    id: "div-15",
    number: "15",
    name_en: "Plumbing & HVAC",
    name_ar: "سباكة وتكييف",
    icon: Wind,
    subServices: [
      { id: "div-15-1", name_en: "Plumbing", name_ar: "سباكة" },
      { id: "div-15-2", name_en: "HVAC", name_ar: "تكييف هواء" }
    ]
  },
  {
    id: "div-16",
    number: "16",
    name_en: "Electrical",
    name_ar: "كهرباء",
    icon: Zap,
    subServices: [
      { id: "div-16-1", name_en: "Electrical Works", name_ar: "أعمال كهربائية" },
      { id: "div-16-2", name_en: "Lighting", name_ar: "إضاءة" }
    ]
  }
];

export const Construction: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  // Dynamic Level state ("level-1" or "level-2")
  const [currentLevel, setCurrentLevel] = useState<'level-1' | 'level-2'>('level-1');
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);

  const handleSelectDivision = (division: Division) => {
    if (!division.subServices || division.subServices.length === 0) {
      // Navigate directly to booking flow if no subservices exist
      const srvNameEn = division.name_en;
      const srvNameAr = division.name_ar;
      const url = `/?book=true&name_en=${encodeURIComponent(srvNameEn)}&name_ar=${encodeURIComponent(srvNameAr)}&service_id=${division.id}&category=construction_contracting&booking_fee=25`;
      navigate(url);
    } else {
      setSelectedDivision(division);
      setCurrentLevel('level-2');
    }
  };

  const handleBookSubservice = (sub: SubService) => {
    if (!selectedDivision) return;
    
    // Format name as "Division Name — Sub-service Name" as requested in Step 4
    const formatEn = `${selectedDivision.name_en} — ${sub.name_en}`;
    const formatAr = `${selectedDivision.name_ar} — ${sub.name_ar}`;

    // Navigate to homepage with URL search params triggering booking state
    const url = `/?book=true&name_en=${encodeURIComponent(formatEn)}&name_ar=${encodeURIComponent(formatAr)}&service_id=${sub.id}&category=construction_contracting&booking_fee=25`;
    navigate(url);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col relative overflow-hidden">
      <BackgroundVectors />
      <Navbar />

      {/* Hero Banner Details with low opacity background SVG elements per Step 5 */}
      <div className="relative bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-200 py-16 px-4 overflow-hidden">
        {/* Subtle decorative construction SVGs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-[0.03]">
          {/* Hard Hat outline */}
          <svg className="absolute top-10 right-20 w-36 h-36 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13m0-13a9 9 0 010 18H5a2 2 0 01-2-2V9a7 7 0 0114 0v11a2 2 0 01-2 2h-3" />
          </svg>
          {/* Crane Outline */}
          <svg className="absolute bottom-4 left-10 w-44 h-44 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.8">
            <path d="M5 21V3m0 3h16l-3 4H5m0-1V3M21 6v3m-3-3l3 3m-16 12h12v3H5v-3z" />
          </svg>
          {/* Construction gear */}
          <svg className="absolute top-[20%] left-[30%] w-24 h-24 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto text-center font-mono relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-200 text-[#C63300] text-[10px] tracking-widest uppercase mb-4">
            <HardHat className="w-4 h-4" />
            {language === 'ar' ? 'أقسام البناء والمقاولات المعتمدة' : 'SYSTEM DIRECTIVE 16'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-sans font-black tracking-tighter text-black uppercase max-w-4xl mx-auto leading-none">
            {language === 'ar' ? 'أقسام البناء والمقاولات الكبرى' : 'HEAVY DIVISION CONTRACTING DIRECTORY'}
          </h1>
          <p className="mt-3 text-xs text-zinc-650 max-w-xl mx-auto leading-relaxed">
            {language === 'ar' 
              ? 'تصفح الستة عشر قسماً التخصصية المعتمدة للمقاولات العامة والإنشائية، مع حجز تخصصات العمل المتكاملة.' 
              : 'Deploy master construction units across 16 heavy industrial categories. Each operational sector carries a standardized $25 dispatch filing fee.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex-grow pb-16 w-full relative z-10">
        {/* LEVEL 1 — Divisions Grid (default view) */}
        {currentLevel === 'level-1' && (
          <div>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 hover:text-black mb-6 uppercase tracking-wider bg-transparent border-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('backToList')}
            </button>

            <div className="border-b border-zinc-200 pb-4 mb-8">
              <h2 className="text-xl font-sans font-black tracking-tight text-black uppercase flex items-center gap-2">
                <span className="p-1 bg-[#C63300] text-white"><HardHat className="w-4 h-4" /></span>
                {language === 'ar' ? 'دليل الأقسام الستة عشر' : '16 DIVISIONS SYSTEM STATUS'}
              </h2>
              <p className="text-xs text-zinc-650 font-mono mt-1 uppercase">
                {language === 'ar' 
                  ? 'جميع مشاريع وأقسام المقاولات والبناء تخضع لرسوم حجز ثابتة بقيمة 25 دولار' 
                  : 'ALL DIVISION ASSIGNMENTS CARRY STANDARDIZED $25 SECURE BOOKING RATES'}
              </p>
            </div>

            {/* Grid display layout (1 col mobile, 2 tablet, 3 desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CONSTRUCTION_DIVISIONS.map(div => {
                const DivIcon = div.icon;
                return (
                  <div
                    key={div.id}
                    onClick={() => handleSelectDivision(div)}
                    className="p-6 border border-zinc-200 bg-white hover:border-[#C63300] hover:bg-zinc-50/50 transition-all cursor-pointer flex flex-col justify-between group h-[240px] relative rounded-none shadow-sm"
                  >
                    <div className="w-full flex justify-between items-start mb-4">
                      {/* Badge Number Top Left */}
                      <span className="bg-zinc-50 text-[#C63300] border border-zinc-200 text-[10px] font-mono font-bold px-2.5 py-1 uppercase tracking-wider flex items-center gap-1.5">
                        <DivIcon className="w-3.5 h-3.5 text-[#C63300] group-hover:text-white transition-colors" />
                        DIV {div.number}
                      </span>
                      
                      {/* $25 Booking Fee Badge in #C63300 Top Right */}
                      <span className="bg-[#C63300] text-white text-[10px] font-mono font-black px-2 py-0.5 tracking-wide uppercase">
                        $25 FEE
                      </span>
                    </div>

                    <div className="flex-grow flex flex-col justify-center">
                      <h3 className="font-sans text-lg font-black tracking-tight text-black uppercase group-hover:text-[#C63300] transition-colors leading-tight">
                        {language === 'ar' ? div.name_ar : div.name_en}
                      </h3>
                      <span className="text-[10px] text-zinc-600 font-mono uppercase mt-1">
                        {div.subServices.length} {language === 'ar' ? 'خدمة فرعية متاحة' : 'SUB-SERVICES AVAILABLE'}
                      </span>
                    </div>

                    {/* Explore button in #C63300 */}
                    <div className="mt-4 pt-3 border-t border-zinc-150 flex justify-between items-center w-full">
                      <span className="text-[10px] font-mono font-black text-[#C63300] group-hover:underline">
                        {language === 'ar' ? 'عرض الخدمات الفرعية' : 'EXPLORE DIVISION'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#C63300] transform group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LEVEL 2 — Sub-services Grid (after clicking a division) */}
        {currentLevel === 'level-2' && selectedDivision && (
          <div>
            <button
              onClick={() => setCurrentLevel('level-1')}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 hover:text-black mb-6 uppercase tracking-wider bg-transparent border-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('backToDivisions')}
            </button>

            <div className="border-b border-zinc-200 pb-4 mb-8">
              <span className="text-[10px] font-mono font-bold text-[#C63300] uppercase tracking-wider bg-zinc-50 border border-zinc-200 px-2.5 py-1">
                DIV {selectedDivision.number} — {language === 'ar' ? selectedDivision.name_ar : selectedDivision.name_en}
              </span>
              <h2 className="text-xl font-sans font-black tracking-tight text-black uppercase mt-3">
                {language === 'ar' ? 'الخدمات الفرعية التخصصية للقسم' : 'DIVISION SUB-SERVICES DEPLOYMENT'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedDivision.subServices.map(sub => (
                <div
                  key={sub.id}
                  className="p-6 border border-zinc-200 bg-white hover:border-[#C63300] transition-all flex flex-col justify-between group h-[200px] rounded-none shadow-sm"
                >
                  <div>
                    {/* Parent division name small at top in grey */}
                    <span className="text-[9px] text-zinc-600 font-mono uppercase block mb-1">
                      {selectedDivision.name_en}
                    </span>
                    
                    {/* Subservice large bold uppercase */}
                    <h4 className="font-sans text-base font-extrabold tracking-tight text-black uppercase leading-tight group-hover:text-[#C63300] transition-colors font-mono">
                      {language === 'ar' ? sub.name_ar : sub.name_en}
                    </h4>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-150 flex justify-between items-center w-full">
                    {/* $25 booking fee badge */}
                    <span className="bg-zinc-50 text-zinc-650 group-hover:bg-[#C63300] group-hover:text-white text-[10px] font-mono border border-zinc-200 px-2 py-0.5 transition-colors">
                      $25 BOOKING
                    </span>

                    {/* BOOK NOW button in #C63300 */}
                    <button
                      onClick={() => handleBookSubservice(sub)}
                      className="text-[10px] font-mono font-black text-[#C63300] bg-white hover:bg-[#C63300] hover:text-white border border-[#C63300] px-3.5 py-1.5 uppercase transition-all cursor-pointer rounded-none"
                    >
                      {language === 'ar' ? 'احجز الآن' : 'BOOK NOW'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 py-10 text-center font-mono text-zinc-500 text-[10px] uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 SHED.SERVICES GLOBAL FIELD DEPLOYMENT NETWORKS. ALL RIGHTS SECURED.</p>
        </div>
      </footer>
    </div>
  );
};
export default Construction;
