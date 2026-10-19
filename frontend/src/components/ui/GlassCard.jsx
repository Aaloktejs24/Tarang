"use client";
import React from 'react';
import { Paper } from '@mui/material';

export function GlassCard({ 
  children, 
  variant = 'default', // 'default', 'profile', 'stat'
  sx = {},
  disableHover = false,
  ...props 
}) {
  const baseStyles = {
    borderRadius: 'var(--radius-lg)',
    background: "var(--card-bg)",
    backdropFilter: "var(--card-blur)",
    WebkitBackdropFilter: "var(--card-blur)",
    border: "var(--border-thin) solid var(--card-border)",
    transition: "var(--transition-slow)",
    "&:hover": !disableHover ? {
      transform: "translateY(-2px)",
    } : {}
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'stat':
        return { px: 3, py: 3 };
      case 'profile':
      default:
        return {};
    }
  };

  const finalStyles = { ...baseStyles, ...getVariantStyles() };

  return (
    <Paper
      elevation={0}
      sx={{
        ...finalStyles,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}

export { GlassCard as PremiumCard };
export default GlassCard;
