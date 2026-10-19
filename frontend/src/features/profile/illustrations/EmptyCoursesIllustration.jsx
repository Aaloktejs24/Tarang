import React from 'react';

export default function EmptyCoursesIllustration({ sx, ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="30 30 175 115" 
      {...props}
      style={{ width: "100%", height: "100%", margin: "0 auto", ...(sx || {}), ...(props.style || {}) }}
    >
      <defs>
        <linearGradient id="courses-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--theme-yellow)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.10" />
        </linearGradient>
        <linearGradient id="laptop-screen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--color-primary)" />
        </linearGradient>
        <linearGradient id="laptop-base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="var(--color-primary)" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Background Blob */}
      
      {/* Decorative subtle background elements */}
      <g opacity="0.3" fill="var(--color-primary)">
        <circle cx="85" cy="55" r="1.5" />
        <circle cx="105" cy="55" r="1.5" />
        <circle cx="125" cy="55" r="1.5" />
        <circle cx="145" cy="55" r="1.5" />
        <circle cx="85" cy="135" r="1.5" />
        <circle cx="105" cy="135" r="1.5" />
        <circle cx="125" cy="135" r="1.5" />
        <circle cx="145" cy="135" r="1.5" />
        <path d="M40 30 L42 35 L47 35 L43 38 L45 43 L40 40 L35 43 L37 38 L33 35 L38 35 Z" opacity="0.5" fill="var(--theme-yellow)"/>
        <path d="M190 140 L192 143 L196 143 L193 145 L194 149 L190 147 L186 149 L187 145 L184 143 L188 143 Z" opacity="0.5"/>
      </g>
      
      <circle cx="190" cy="40" r="35" fill="var(--theme-yellow)" opacity="0.03" />
      <circle cx="50" cy="120" r="25" fill="var(--color-primary)" opacity="0.03" />

      {/* Floating Elements (Background) */}
      <circle cx="55" cy="70" r="4" fill="var(--theme-green)" opacity="0.6" />
      <polygon points="180,60 185,68 175,68" fill="var(--color-error)" opacity="0.6" transform="rotate(15 180 64)"/>

      <g>
        {/* Laptop Screen */}
        <rect x="70" y="60" width="100" height="65" rx="4" fill="#1e293b" />
        <rect x="74" y="64" width="92" height="53" rx="2" fill="url(#laptop-screen)" />
        
        {/* Play Button on Screen */}
        <circle cx="120" cy="90" r="12" fill="#ffffff" opacity="0.2" />
        <polygon points="116,84 126,90 116,96" fill="#ffffff" />
        
        {/* Video progress bar */}
        <rect x="80" y="110" width="80" height="2" rx="1" fill="#ffffff" opacity="0.3" />
        <rect x="80" y="110" width="30" height="2" rx="1" fill="#ffffff" />
        
        {/* Laptop Base */}
        <path d="M 60 125 L 180 125 L 186 132 L 54 132 Z" fill="url(#laptop-base)" />
        <rect x="105" y="125" width="30" height="3" fill="#cbd5e1" opacity="0.5" />
      </g>
      
      <g transform="translate(160, 95) rotate(15)">
        <path d="M0,0 L30,-10 L45,5 L15,15 Z" fill="var(--theme-yellow)" />
        <path d="M0,0 L15,15 L15,22 L0,7 Z" fill="#b45309" />
        <path d="M15,15 L45,5 L45,12 L15,22 Z" fill="#ffffff" />
        
        <path d="M-5,-10 L25,-20 L40,-5 L10,5 Z" fill="var(--color-primary)" opacity="0.9" />
        <path d="M-5,-10 L10,5 L10,12 L-5,-3 Z" fill="#1e40af" />
        <path d="M10,5 L40,-5 L40,2 L10,12 Z" fill="#ffffff" />
      </g>
      
      <g transform="translate(50, 90) rotate(-15)">

        <path d="M2,2 L18,-6 L26,10 L10,18 Z" fill="var(--color-slate-100)" />
        {/* Lines on certificate */}
        <line x1="8" y1="4" x2="16" y2="0" stroke="var(--color-slate-300)" strokeWidth="1" strokeLinecap="round" />
        <line x1="10" y1="8" x2="20" y2="3" stroke="var(--color-slate-300)" strokeWidth="1" strokeLinecap="round" />
        <line x1="12" y1="12" x2="18" y2="9" stroke="var(--color-slate-300)" strokeWidth="1" strokeLinecap="round" />
        {/* Seal */}
        <circle cx="22" cy="12" r="4" fill="var(--color-error)" />
        <path d="M20,15 L22,20 L24,15 Z" fill="var(--color-error)" />
      </g>

      {/* Floating Elements (Foreground) */}
      <circle cx="165" cy="45" r="3" fill="var(--theme-yellow)" />
      <circle cx="65" cy="140" r="5" fill="var(--color-primary)" opacity="0.8" />
    </svg>
  );
}
