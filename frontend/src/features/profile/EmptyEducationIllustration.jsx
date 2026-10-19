import React from 'react';

export default function EmptyEducationIllustration({ sx, ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="30 20 175 100" 
      {...props}
      style={{ width: "100%", height: "100%", margin: "0 auto", ...(sx || {}), ...(props.style || {}) }}
    >
      {/* Decorative subtle background elements */}
      <g opacity="0.3" fill="var(--color-primary)">
        <circle cx="65" cy="45" r="1.5" />
        <circle cx="85" cy="45" r="1.5" />
        <circle cx="105" cy="45" r="1.5" />
        <circle cx="125" cy="45" r="1.5" />
        <circle cx="145" cy="45" r="1.5" />
        <circle cx="165" cy="45" r="1.5" />
        <path d="M40 50 Q 70 30 100 50 T 160 50" fill="none" stroke="var(--theme-green)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
      </g>

      <circle cx="180" cy="50" r="30" fill="var(--theme-green)" opacity="0.04" />
      <circle cx="60" cy="95" r="25" fill="var(--color-primary)" opacity="0.04" />

      {/* Main Illustration Elements */}
      <g>
        {/* Books Stack (Base) */}
        <g transform="translate(115, 95)">
          {/* Bottom Book */}
          <rect x="-45" y="5" width="90" height="15" rx="2" fill="var(--color-primary-dark)" />
          <rect x="-43" y="5" width="86" height="12" rx="1" fill="#f8fafc" />
          <rect x="-45" y="5" width="90" height="3" fill="var(--color-primary-dark)" />
          <rect x="-45" y="17" width="90" height="3" fill="var(--color-primary-dark)" />
          <rect x="42" y="5" width="3" height="15" fill="#1e293b" opacity="0.5" />
          
          {/* Middle Book */}
          <rect x="-40" y="-5" width="80" height="12" rx="2" fill="var(--theme-yellow)" />
          <rect x="-38" y="-5" width="76" height="9" rx="1" fill="#f8fafc" />
          <rect x="-40" y="-5" width="80" height="2" fill="#ca8a04" />
          <rect x="-40" y="5" width="80" height="2" fill="#ca8a04" />
          <rect x="37" y="-5" width="3" height="12" fill="#a16207" opacity="0.5" />

          {/* Top Book */}
          <rect x="-35" y="-15" width="70" height="12" rx="2" fill="var(--theme-green)" />
          <rect x="-33" y="-15" width="66" height="9" rx="1" fill="#f8fafc" />
          <rect x="-35" y="-15" width="70" height="2" fill="#15803d" />
          <rect x="-35" y="-5" width="70" height="2" fill="#15803d" />
          <rect x="32" y="-15" width="3" height="12" fill="#166534" opacity="0.5" />
        </g>

        {/* Rolled up Diploma (Leaning on the left side) */}
        <g transform="translate(65, 80) rotate(-15)">
          <rect x="-10" y="-25" width="20" height="55" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Inner scroll swirl effect */}
          <path d="M-3,-22 C0,-22 5,-20 5,-15" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M-3,27 C0,27 5,25 5,20" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
          {/* Red Ribbon */}
          <rect x="-11" y="-2" width="22" height="12" fill="var(--color-error)" />
          {/* Ribbon Ends */}
          <path d="M-8,10 L-14,24 L-4,18 Z" fill="#dc2626" />
          <path d="M8,10 L14,22 L4,16 Z" fill="#b91c1c" />
          {/* Ribbon Knot */}
          <circle cx="0" cy="4" r="3.5" fill="#991b1b" />
          <path d="M-11,-2 L11,-2" stroke="#991b1b" strokeWidth="1" />
          <path d="M-11,10 L11,10" stroke="#991b1b" strokeWidth="1" />
        </g>

        {/* Graduation Cap (Resting on books) */}
        <g transform="translate(115, 60)">
          {/* Tassel (Hanging down) */}
          <path d="M0,0 Q15,10 12,35" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
          <path d="M12,35 L9,45 L15,45 Z" fill="#eab308" />
          <path d="M10,45 L14,45" stroke="#ca8a04" strokeWidth="1" />
          <circle cx="0" cy="0" r="3" fill="#fef08a" />
          
          {/* Cap Base (Fits on head) */}
          <path d="M-28,10 C-28,28 28,28 28,10 Z" fill="#1e293b" />
          <path d="M-28,10 L-28,15 C-28,33 28,33 28,15 L28,10 Z" fill="#0f172a" />
          
          {/* Cap Top (Diamond board) */}
          <polygon points="0,-18 55,5 0,22 -55,5" fill="#334155" />
          <polygon points="0,-18 55,5 0,10 -55,5" fill="#475569" />
          
          {/* Tassel button */}
          <circle cx="0" cy="0" r="4" fill="#1e293b" />
        </g>

        {/* Floating Apple (Right side) */}
        <g transform="translate(165, 95) rotate(10)">
          <path d="M0,2 C-10,-8 -15,8 0,15 C15,8 10,-8 0,2" fill="var(--color-error)" />
          {/* Stem */}
          <path d="M0,3 Q2,-2 5,-2" fill="none" stroke="#795548" strokeWidth="1.5" strokeLinecap="round" />
          {/* Leaf */}
          <path d="M2,1 Q6,-3 9,2 Z" fill="var(--theme-green)" />
        </g>
      </g>

      {/* Foreground decorative elements */}
      <circle cx="160" cy="115" r="3" fill="var(--theme-yellow)" opacity="0.8" />
      <polygon points="45,45 50,50 40,50" fill="var(--color-error)" opacity="0.6" transform="rotate(25 45 48)" />
      <rect x="150" y="45" width="6" height="6" fill="var(--color-primary)" opacity="0.5" transform="rotate(45 153 48)" />
      <polygon points="120,35 124,42 116,42" fill="var(--theme-green)" opacity="0.7" transform="rotate(-15 120 38)" />
    </svg>
  );
}
