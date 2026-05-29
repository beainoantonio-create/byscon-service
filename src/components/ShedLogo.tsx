import React from 'react';

interface ShedLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ShedLogo: React.FC<ShedLogoProps> = ({ className = 'h-8 w-auto', style }) => {
  return (
    <svg 
      viewBox="0 0 400 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* S */}
      <path 
        d="M 33,15 H 100 V 38 H 33 V 49 H 100 V 82 L 77,105 H 33 L 10,82 H 77 V 71 H 10 V 38 L 33,15 Z" 
        fill="#C63300" 
      />

      {/* H */}
      <path 
        d="M 110,15 H 133 V 49 H 177 V 15 H 200 V 105 H 177 V 71 H 133 V 105 H 110 Z" 
        fill="#C63300" 
      />

      {/* E with rounded prongs */}
      <path 
        d="M 210,15 H 300 V 31 H 233 V 42 H 279.5 A 5.5,5.5 0 0,1 279.5,53 H 233 V 64 H 279.5 A 5.5,5.5 0 0,1 279.5,75 H 233 V 86 H 300 V 105 H 210 Z" 
        fill="#C63300" 
      />

      {/* D with Hex Nut Cutout */}
      <g>
        {/* Outer D Letter Shape */}
        <path 
          d="M 310,15 H 377 L 400,38 V 82 L 377,105 H 310 Z" 
          fill="#C63300" 
        />
        
        {/* Hexagon Nut on top (White) */}
        <polygon 
          points="358,44.4 376,44.4 385,60 376,75.6 358,75.6 349,60" 
          fill="#FFFFFF" 
        />
        
        {/* Inner Nut Hole (Brand Color #C63300) */}
        <circle 
          cx="367" 
          cy="60" 
          r="9" 
          fill="#C63300" 
        />
      </g>
    </svg>
  );
};
