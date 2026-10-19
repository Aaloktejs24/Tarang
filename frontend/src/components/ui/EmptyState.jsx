import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function EmptyState({ 
  title, 
  subtitle, 
  actionLabel, 
  actionIcon,
  onAction,
  illustration
}) {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      pb: 4, 
      boxSizing: 'border-box', 
      textAlign: 'center', 
      px: 3,
      width: '100%'
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: 420,
        height: { xs: 180, md: 200 },
        mb: { xs: 1, md: 2 },
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1
      }}>
        <Box sx={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(0, 86, 179, 0.06) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none'
        }} />
        {illustration ? illustration : (
          <svg viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', animation: 'float 6s ease-in-out infinite' }}>
            <style>
              {`
                  @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                  }
                  @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-4px) rotate(5deg); }
                  }
                  @keyframes pulseGlow {
                    0%, 100% { opacity: 0.5; r: 65px; }
                    50% { opacity: 0.7; r: 68px; }
                  }
                `}
            </style>
            {/* Ground Shadow Blob */}
            <ellipse cx="130" cy="165" rx="110" ry="12" fill="rgba(0, 0, 0, 0.04)" />
            {/* Background Ambient Glow */}
            <circle cx="130" cy="80" r="65" fill="rgba(37, 99, 235, 0.05)" style={{ animation: 'pulseGlow 4s ease-in-out infinite' }} />
            {/* Floating decorative elements */}
            <path d="M 40 35 Q 40 45 30 45 Q 40 45 40 55 Q 40 45 50 45 Q 40 45 40 35" fill="#f59e0b" opacity="0.9" style={{ animation: 'floatSlow 4s ease-in-out infinite', transformOrigin: '40px 45px' }} />
            <rect x="220" y="30" width="12" height="12" rx="3" fill="#10b981" opacity="0.8" style={{ animation: 'float 5s ease-in-out infinite', transformOrigin: '226px 36px' }} transform="rotate(15 226 36)" />
            <path d="M 210 120 L 222 128 L 210 136 Z" fill="#3b82f6" opacity="0.7" style={{ animation: 'floatSlow 6s ease-in-out infinite' }} />
            
            {/* CHARACTER BACKGROUND */}
            <rect x="105" y="55" width="50" height="70" rx="12" fill="#475569" />
            <path d="M 100 85 Q 130 75 160 85 L 150 140 L 110 140 Z" fill="#0056b3" />
            <polygon points="120,83 140,83 130,105" fill="#f1f5f9" />
            <polygon points="128,95 132,95 130,120" fill="#f59e0b" />
            <rect x="126" y="66" width="8" height="18" fill="#fad6ca" />
            <circle cx="130" cy="55" r="16" fill="#fad6ca" />
            <path d="M 112 55 Q 112 33 130 33 Q 148 33 148 55 Q 140 40 130 42 Q 120 40 112 55 Z" fill="#0f172a" />
            <line x1="118" y1="51" x2="142" y2="51" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
            <path d="M 120 51 L 128 51 Q 128 58 124 58 Q 120 58 120 51 Z" fill="#ffffff" opacity="0.8" stroke="#0f172a" strokeWidth="1" />
            <path d="M 132 51 L 140 51 Q 140 58 136 58 Q 132 58 132 51 Z" fill="#ffffff" opacity="0.8" stroke="#0f172a" strokeWidth="1" />

            {/* DESK */}
            <rect x="65" y="130" width="130" height="20" fill="#94a3b8" />
            <line x1="75" y1="130" x2="75" y2="170" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
            <line x1="185" y1="130" x2="185" y2="170" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
            <path d="M 50 120 L 210 120 L 195 135 L 65 135 Z" fill="#cbd5e1" />
            <rect x="65" y="135" width="130" height="6" rx="2" fill="#94a3b8" />

            {/* ARMS */}
            <path d="M 105 88 L 85 110 L 93 115 L 112 95 Z" fill="#004b9c" />
            <circle cx="87" cy="115" r="5" fill="#fad6ca" />
            <path d="M 155 88 L 140 110 L 148 114 L 162 95 Z" fill="#004b9c" />

            {/* DESK ITEMS */}
            <rect x="110" y="88" width="40" height="28" rx="3" fill="#1e293b" />
            <circle cx="130" cy="100" r="4" fill="#e2e8f0" opacity="0.6" />
            <path d="M 105 116 L 155 116 L 160 120 L 100 120 Z" fill="#64748b" />
            <rect x="160" y="115" width="25" height="15" rx="1" fill="#f8fafc" transform="rotate(-15 160 115)" />
            <rect x="162" y="113" width="22" height="15" rx="1" fill="#f59e0b" opacity="0.8" transform="rotate(-5 162 113)" />
            <line x1="165" y1="118" x2="178" y2="118" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" transform="rotate(-5 162 113)" />
            <rect x="75" y="105" width="10" height="14" rx="2" fill="#ef4444" />
            <path d="M 72 108 Q 68 112 72 116" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        )}
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, zIndex: 1 }}>
        {title}
      </Typography>
      
      {subtitle && (
        <Typography variant="subtitle1" sx={{ color: '#475569', mb: 5, maxWidth: '540px', fontWeight: 500, lineHeight: 1.6, zIndex: 1, fontSize: '1.05rem' }}>
          {subtitle}
        </Typography>
      )}

      {actionLabel && onAction && (
        <Button 
          variant="contained" disableElevation
          onClick={onAction}
          sx={{ 
            bgcolor: '#0056b3', 
            color: 'white', 
            textTransform: 'none', 
            fontWeight: 600, 
            borderRadius: "8px", 
            px: 4, 
            py: 1.5,
            fontSize: '1rem',
            boxShadow: 'none',
            '&:hover': { 
              bgcolor: '#004494', 
              boxShadow: 'none' 
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {actionIcon && actionIcon}
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
