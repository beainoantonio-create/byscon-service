import React from 'react';

export const BackgroundVectors: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Large Gear top-left */}
      <div className="absolute top-[8%] left-[4%] -rotate-12 transition-transform duration-1000 hover:rotate-45">
        <svg className="w-24 h-24 text-black opacity-[0.05]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      </div>

      {/* 2. Screw and Bolt top-right */}
      <div className="absolute top-[12%] right-[6%] rotate-45">
        <svg className="w-20 h-20 text-black opacity-[0.05]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 4H6v2h12V4zM16 6v4l-2 2v6l-2 2h-1l-2-2v-6l-2-2V6h8z" />
          <path d="M8 12h8M8 15h8M9 18h6" />
        </svg>
      </div>

      {/* 3. Wrench middle-left */}
      <div className="absolute top-[50%] left-[2%] rotate-12">
        <svg className="w-22 h-22 text-black opacity-[0.05]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </div>

      {/* 4. Hammer middle-right */}
      <div className="absolute top-[45%] right-[2%] -rotate-45">
        <svg className="w-24 h-24 text-black opacity-[0.05]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 12.5l-8 8a1.41 1.41 0 0 1-2-2l8-8M11.5 9.5l3-3a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4l-3 3M11.5 9.5l3 3M15 6L18 3M21 12l2.5 2.5a1 1 0 0 0 1.4 0l1.6-1.6a1 1 0 0 0 0-1.4l-2.5-2.5" />
        </svg>
      </div>

      {/* 5. Hexagonal Nut bottom-left */}
      <div className="absolute bottom-[10%] left-[8%] rotate-[30deg]">
        <svg className="w-16 h-16 text-black opacity-[0.05]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      </div>

      {/* 6. Screwdriver & Level bottom-right */}
      <div className="absolute bottom-[12%] right-[5%] -rotate-[15deg]">
        <svg className="w-20 h-20 text-black opacity-[0.05]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 19H19V11H5V19ZM7 11V15M11 11V17M15 11V15M19 11V15" />
          <path d="M2 11h20v2H2z" />
        </svg>
      </div>

      {/* 7. Handsaw center-top */}
      <div className="absolute top-[2%] left-[45%] rotate-[75deg] opacity-[0.03]">
        <svg className="w-28 h-28 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 4l4 4L6 22H2v-4L18 4z" />
          <path d="M16 6l-2 2M13 9l-2 2M10 12l-2 2M7 15l-2 2M16 12l2 2" />
        </svg>
      </div>

      {/* 8. Safety Goggles bottom-center */}
      <div className="absolute bottom-[3%] left-[48%] opacity-[0.03]">
        <svg className="w-20 h-20 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 13h18M3 13c0 3 2.5 5 5 5s5-2 5-5M21 13c0 3-2.5 5-5 5s-5-2-5-5" />
          <path d="M9 11V9a3 3 0 0 1 6 0v2" />
        </svg>
      </div>

      {/* 9. Small Screws around the corners */}
      <div className="absolute top-[25%] left-[30%] rotate-45">
        <svg className="w-6 h-6 text-black opacity-[0.04]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 8l8 8M16 8l-8 8" />
        </svg>
      </div>
      <div className="absolute bottom-[35%] right-[25%] -rotate-12">
        <svg className="w-8 h-8 text-black opacity-[0.04]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 8l8 8M16 8l-8 8" />
        </svg>
      </div>
    </div>
  );
};
