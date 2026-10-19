import React from 'react';

export default function EmptyAchievementsIllustration({ sx, ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="30 30 175 115" 
      {...props}
      style={{ width: "100%", height: "100%", margin: "0 auto", ...(sx || {}), ...(props.style || {}) }}
    >
      <defs>
        <linearGradient id="achievements-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--theme-yellow)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="trophy-gold" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
        <linearGradient id="trophy-silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#eab308" floodOpacity="0.2" />
        </filter>
        <filter id="glow-star" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#fde047" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* Background Blob */}
      
      {/* Decorative subtle background elements */}
      <g opacity="0.4" fill="var(--theme-yellow)">
        <circle cx="85" cy="55" r="2" />
        <circle cx="105" cy="55" r="1.5" />
        <circle cx="125" cy="55" r="2" />
        <circle cx="145" cy="55" r="1.5" />
        <circle cx="85" cy="135" r="1.5" />
        <circle cx="105" cy="135" r="2" />
        <circle cx="125" cy="135" r="1.5" />
        <circle cx="145" cy="135" r="2" />
        {/* Confetti */}
        <rect x="40" y="40" width="6" height="3" fill="var(--color-primary)" opacity="0.6" transform="rotate(45 43 41)" />
        <rect x="190" y="50" width="8" height="4" fill="var(--theme-green)" opacity="0.5" transform="rotate(-30 194 52)" />
        <rect x="60" y="140" width="5" height="5" fill="var(--color-error)" opacity="0.4" transform="rotate(15 62 142)" />
        <rect x="180" y="130" width="7" height="3" fill="var(--color-primary)" opacity="0.5" transform="rotate(60 183 131)" />
      </g>

      <circle cx="190" cy="40" r="35" fill="var(--theme-yellow)" opacity="0.04" />
      <circle cx="50" cy="120" r="25" fill="var(--theme-yellow)" opacity="0.04" />

      <g>
        {/* Trophy Base */}
        <path d="M100 135 L140 135 L145 145 L95 145 Z" fill="#475569" />
        <rect x="115" y="115" width="10" height="20" fill="#a16207" />
        <path d="M105 115 L135 115 L130 120 L110 120 Z" fill="#64748b" />
        
        {/* Trophy Cup */}
        <path d="M90 60 C90 100 95 115 105 115 L135 115 C145 115 150 100 150 60 Z" fill="url(#trophy-gold)" />
        <ellipse cx="120" cy="60" rx="30" ry="8" fill="#fef08a" />
        <ellipse cx="120" cy="60" rx="26" ry="6" fill="#ca8a04" />

        {/* Trophy Handles */}
        <path d="M90 70 C70 70 70 95 95 95" fill="none" stroke="url(#trophy-gold)" strokeWidth="6" strokeLinecap="round" />
        <path d="M150 70 C170 70 170 95 145 95" fill="none" stroke="url(#trophy-gold)" strokeWidth="6" strokeLinecap="round" />
        
        {/* Star on Trophy */}
        <polygon points="120,75 123,83 132,83 125,88 127,96 120,91 113,96 115,88 108,83 117,83" fill="#ffffff" opacity="0.9" />
      </g>
      
      <g transform="translate(60, 70) rotate(-15)">
        <path d="M-10,-25 L0,0 L10,-25 Z" fill="var(--color-error)" />
        <path d="M0,0 L10,-25 L15,-20 Z" fill="#991b1b" />
        <circle cx="0" cy="5" r="12" fill="url(#trophy-silver)" />
        <circle cx="0" cy="5" r="8" fill="#ffffff" opacity="0.3" />
        <polygon points="0,0 2,3 6,3 3,5 4,8 0,6 -4,8 -3,5 -6,3 -2,3" fill="#475569" />
      </g>

      <g transform="translate(175, 80) rotate(15) scale(1.2)">
        <polygon points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3" fill="#fde047" />
      </g>

      {/* Additional Floating Stars */}
      <polygon points="70,40 72,44 76,44 73,47 74,51 70,48 66,51 67,47 64,44 68,44" fill="var(--theme-yellow)" opacity="0.8" />
      <polygon points="150,130 151,133 154,133 152,135 153,138 150,136 147,138 148,135 146,133 149,133" fill="var(--color-primary)" opacity="0.6" />

      {/* Confetti foreground */}
      <circle cx="160" cy="115" r="3" fill="var(--color-error)" opacity="0.7" />
      <rect x="85" y="145" width="6" height="6" fill="var(--theme-green)" opacity="0.8" transform="rotate(30 88 148)" />

    </svg>
  );
}
