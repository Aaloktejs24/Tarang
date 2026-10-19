import React from 'react';

export default function EmptyPersonalIllustration({ style, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="20 20 360 270" style={{ width: '100%', height: '100%', ...style }} className={className}>
      <defs>
        <linearGradient id="personal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-white)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--color-white)" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      
      
      {/* Background soft blur shapes */}
      <circle cx="90" cy="80" r="50" fill="var(--color-primary)" opacity="0.15" />
      <circle cx="310" cy="210" r="70" fill="var(--color-info)" opacity="0.1" />

      {/* ID Card / Profile Card */}
      <rect x="70" y="50" width="260" height="170" rx="20" fill="url(#card-grad)" />
      <rect x="70" y="50" width="260" height="170" rx="20" fill="url(#personal-grad)" />
      
      {/* Card Border */}
      <rect x="70" y="50" width="260" height="170" rx="20" fill="none" stroke="var(--color-white)" strokeWidth="2" opacity="0.6" />
      
      {/* Top bar of card */}
      <path d="M 70 70 A 20 20 0 0 1 90 50 L 310 50 A 20 20 0 0 1 330 70 L 330 90 L 70 90 Z" fill="var(--color-slate-900)" opacity="0.05" />
      
      {/* Profile Picture Placeholder */}
      <circle cx="130" cy="140" r="35" fill="var(--color-white)" opacity="0.9" />
      <path d="M130 130a12 12 0 1 0 0-24 12 12 0 0 0 0 24zm-22 32c0-12 10-22 22-22s22 10 22 22" fill="var(--color-slate-500)" opacity="0.6" />

      {/* Text lines */}
      <rect x="185" y="115" width="110" height="10" rx="5" fill="var(--color-slate-900)" opacity="0.25" />
      <rect x="185" y="135" width="125" height="6" rx="3" fill="var(--color-slate-500)" opacity="0.2" />
      <rect x="185" y="150" width="85" height="6" rx="3" fill="var(--color-slate-500)" opacity="0.2" />
      <rect x="185" y="165" width="95" height="6" rx="3" fill="var(--color-slate-500)" opacity="0.2" />
      <rect x="185" y="180" width="60" height="6" rx="3" fill="var(--color-slate-500)" opacity="0.2" />

      {/* Floating abstract elements */}
      <rect x="50" y="190" width="30" height="30" rx="8" fill="var(--color-warning)" opacity="0.3" transform="rotate(-15 65 205)" />
      <circle cx="340" cy="80" r="18" fill="var(--color-success)" opacity="0.25" />
      <rect x="300" y="240" width="40" height="12" rx="6" fill="var(--color-error)" opacity="0.2" />
          </svg>
  );
}
