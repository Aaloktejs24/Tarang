import React from 'react';

export default function EmptyBioIllustration({ sx, ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 240 180" 
      {...props}
      style={{ width: "100%", height: "100%", ...(sx || {}), ...(props.style || {}) }}
    >
      <defs>
        <linearGradient id="bio-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--theme-green)" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* Abstract background elements */}
      <circle cx="120" cy="90" r="75" fill="url(#bio-grad)" />
      <path d="M180 40 Q210 70 190 120 Q160 150 130 130 Q100 110 120 70 Q140 30 180 40 Z" fill="var(--color-slate-200)" opacity="0.3" />
      <circle cx="60" cy="140" r="25" fill="var(--theme-green)" opacity="0.1" />

      {/* Main Document / Notepad */}
      <rect x="75" y="30" width="90" height="110" rx="8" fill="var(--card-bg)" stroke="var(--card-border)" strokeWidth="2" />
      
      

      {/* Text Lines on Document */}
      <rect x="90" y="55" width="30" height="6" rx="3" fill="var(--color-primary)" opacity="0.4" />
      <rect x="90" y="70" width="60" height="6" rx="3" fill="var(--color-slate-300)" />
      <rect x="90" y="85" width="50" height="6" rx="3" fill="var(--color-slate-300)" />
      <rect x="90" y="100" width="55" height="6" rx="3" fill="var(--color-slate-300)" />
      <rect x="90" y="115" width="40" height="6" rx="3" fill="var(--color-slate-200)" />

      {/* Floating Pencil / Pen */}
      <g transform="translate(130, 95) rotate(-35)">
        <rect x="0" y="0" width="12" height="40" rx="2" fill="var(--theme-yellow)" opacity="0.9" />
        <path d="M0 40 L6 50 L12 40 Z" fill="var(--color-slate-300)" />
        <path d="M4 46 L6 50 L8 46 Z" fill="var(--color-slate-900)" />
        <rect x="0" y="0" width="12" height="6" rx="2" fill="var(--color-error)" opacity="0.7" />
        <rect x="0" y="6" width="12" height="4" fill="var(--color-slate-500)" />
      </g>

      {/* Quote Marks Floating */}
      <g transform="translate(50, 45) scale(0.6)">
        <path d="M10 20 Q10 10 20 5 L23 10 Q15 15 15 20 L20 20 L20 30 L10 30 Z" fill="var(--color-primary)" />
        <path d="M25 20 Q25 10 35 5 L38 10 Q30 15 30 20 L35 20 L35 30 L25 30 Z" fill="var(--color-primary)" />
      </g>

      {/* Small floating sparkles */}
      <circle cx="170" cy="140" r="4" fill="var(--theme-green)" opacity="0.6" />
      <circle cx="65" cy="105" r="2.5" fill="var(--theme-yellow)" opacity="0.8" />
    </svg>
  );
}
