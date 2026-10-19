"use client";

import React from 'react';
import { Button, CircularProgress } from '@mui/material';

/**
 * TarangButton — Centralized button component
 *
 * Variants:
 *  - "gradient"  → Blue-to-green gradient (primary CTA)
 *  - "primary"   → Solid blue filled
 *  - "success"   → Solid green filled
 *  - "outlined"  → Ghost / bordered
 *  - "white"     → White bg, primary color text + subtle border
 *  - "text"      → Text link style, no background
 *
 * Sizes: "sm" | "md" (default) | "lg"
 */

const VARIANT_STYLES = {
  gradient: {
    background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)',
    color: 'var(--color-white)',
    border: 'none',
    '&:hover': { background: 'linear-gradient(135deg, #004494 0%, #28A745 100%)' },
    '&.Mui-disabled': { background: 'var(--color-slate-200)', color: 'var(--color-slate-500)' },
  },
  primary: {
    background: 'var(--color-primary)',
    color: 'var(--color-white)',
    border: 'none',
    '&:hover': { background: 'var(--color-primary-hover)' },
    '&.Mui-disabled': { background: 'var(--color-slate-200)', color: 'var(--color-slate-500)' },
  },
  success: {
    background: 'var(--color-success)',
    color: 'var(--color-white)',
    border: 'none',
    '&:hover': { background: 'var(--color-success)' },
    '&.Mui-disabled': { background: 'var(--color-slate-200)', color: 'var(--color-slate-500)' },
  },
  outlined: {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: '1.5px solid var(--color-primary)',
    '&:hover': { background: 'rgba(0, 86, 179, 0.06)', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' },
    '&.Mui-disabled': { color: 'var(--color-slate-300)', borderColor: 'var(--color-slate-200)' },
  },
  white: {
    background: 'var(--color-white)',
    color: 'var(--color-primary)',
    border: '1px solid rgba(0, 86, 179, 0.2)',
    '&:hover': { background: 'var(--color-slate-50)', borderColor: 'var(--color-primary)' },
    '&.Mui-disabled': { color: 'var(--color-slate-300)', borderColor: 'var(--color-slate-200)' },
  },
  text: {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: 'none',
    padding: '0 !important',
    minWidth: 'auto !important',
    '&:hover': { background: 'transparent', textDecoration: 'underline' },
    '&.Mui-disabled': { background: 'transparent !important', color: 'var(--color-slate-400) !important', WebkitTextFillColor: 'var(--color-slate-400) !important' },
  },
};

const SIZE_STYLES = {
  sm: { minHeight: 36, px: 2, fontSize: 'var(--font-sm)', borderRadius: 'var(--radius-md)' },
  md: { minHeight: 'var(--box-height)', px: 3, fontSize: 'var(--font-base)', borderRadius: 'var(--radius-md)' },
  lg: { minHeight: 'var(--box-height)', px: 4, fontSize: 'var(--font-base)', borderRadius: 'var(--radius-md)' },
};

export default function TarangButton({
  variant = 'gradient',
  size = 'md',
  fullWidth = false,
  loading = false,
  startIcon,
  endIcon,
  disabled = false,
  onClick,
  type = 'button',
  sx = {},
  children,
  ...rest
}) {
  const variantSx = VARIANT_STYLES[variant] || VARIANT_STYLES.gradient;
  const sizeSx = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <Button
      disableElevation
      disableRipple={variant === 'text'}
      variant="contained"
      type={type}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={loading ? null : startIcon}
      endIcon={loading ? null : endIcon}
      sx={{
        textTransform: 'none',
        fontWeight: 'var(--font-semibold)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease-in-out',
        ...sizeSx,
        ...variantSx,
        ...sx,
      }}
      {...rest}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </Button>
  );
}
