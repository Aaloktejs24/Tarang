import React from 'react';

export default function EmptyActivityIllustration({ sx, ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="30 30 175 115" 
      {...props}
      style={{ width: "100%", height: "100%", margin: "0 auto", ...(sx || {}), ...(props.style || {}) }}
    >
      <defs>
        <linearGradient id="activity-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--theme-green)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="chart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--theme-green)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--theme-green)" stopOpacity="0.1" />
        </linearGradient>
        <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="var(--color-primary)" floodOpacity="0.15" />
        </filter>
        <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="var(--theme-green)" floodOpacity="0.4" />
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
        {/* Abstract lines representing data flow */}
        <path d="M40 40 Q 60 20 80 40 T 120 40" fill="none" stroke="var(--theme-green)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
        <path d="M120 140 Q 140 160 160 140 T 200 140" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
      </g>

      <circle cx="190" cy="40" r="35" fill="var(--theme-green)" opacity="0.03" />
      <circle cx="50" cy="120" r="25" fill="var(--color-primary)" opacity="0.03" />

      {/* Main Illustration Elements */}
      
      <g>
        <rect x="60" y="55" width="120" height="80" rx="6" fill="var(--glass-bg)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <rect x="60" y="55" width="120" height="15" rx="6" fill="rgba(255,255,255,0.4)" />
        {/* Dashboard Header Dots */}
        <circle cx="70" cy="62.5" r="2.5" fill="#fca5a5" />
        <circle cx="78" cy="62.5" r="2.5" fill="#fde047" />
        <circle cx="86" cy="62.5" r="2.5" fill="#86efac" />
        {/* Dashboard Title Bar */}
        <rect x="100" y="61" width="30" height="3" rx="1.5" fill="#cbd5e1" />
        
        {/* Grid lines */}
        <line x1="70" y1="85" x2="170" y2="85" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        <line x1="70" y1="105" x2="170" y2="105" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        <line x1="70" y1="125" x2="170" y2="125" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        
        {/* Area Chart Gradient */}
        <path d="M75 125 L75 110 L95 115 L115 90 L135 105 L165 75 L165 125 Z" fill="url(#chart-grad)" />
        
        {/* Line Chart */}
        <path d="M75 110 L95 115 L115 90 L135 105 L165 75" fill="none" stroke="var(--theme-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Chart Data Points */}
        <circle cx="95" cy="115" r="3" fill="#ffffff" stroke="var(--theme-green)" strokeWidth="2" />
        <circle cx="115" cy="90" r="3" fill="#ffffff" stroke="var(--theme-green)" strokeWidth="2" />
        <circle cx="135" cy="105" r="3" fill="#ffffff" stroke="var(--theme-green)" strokeWidth="2" />
        <circle cx="165" cy="75" r="4" fill="#ffffff" stroke="var(--theme-green)" strokeWidth="2" filter="url(#glow-green)" />
      </g>
      
      <g transform="translate(45, 95) rotate(-10)">
        <circle cx="0" cy="0" r="15" fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <circle cx="0" cy="0" r="10" fill="rgba(254,202,202,0.8)" />
        <circle cx="0" cy="0" r="5" fill="var(--color-error)" />
        {/* Arrow hitting target */}
        <path d="M-15,-15 L-2,-2" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        <polygon points="-2,-2 -8,-4 -4,-8" fill="#475569" />
      </g>

      <g transform="translate(185, 75) rotate(15)">
        <circle cx="0" cy="0" r="14" fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <circle cx="0" cy="0" r="11" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        {/* Clock Hands */}
        <line x1="0" y1="0" x2="0" y2="-6" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="0" x2="5" y2="3" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="0" cy="0" r="2" fill="var(--theme-yellow)" />
      </g>

      {/* Floating Elements (Foreground) */}
      <circle cx="170" cy="130" r="4" fill="var(--theme-yellow)" opacity="0.8" />
      <polygon points="75,45 80,50 70,50" fill="var(--color-error)" opacity="0.6" transform="rotate(25 75 48)" />
      <rect x="150" y="45" width="6" height="6" fill="var(--color-primary)" opacity="0.5" transform="rotate(45 153 48)" />
    </svg>
  );
}
