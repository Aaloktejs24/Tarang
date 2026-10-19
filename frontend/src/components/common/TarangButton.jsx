"use client";

import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useSmartLoading } from '../../hooks/useDebouncedLoading';

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
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%)',
    color: 'var(--color-white)',
    border: 'none',
    '&:hover': { background: 'linear-gradient(135deg, #004494 0%, var(--color-success) 100%)' },
    '&.Mui-disabled': {
      background: 'linear-gradient(135deg, rgba(0, 86, 179, 0.4) 0%, rgba(40, 167, 69, 0.4) 100%) !important',
      backgroundColor: 'transparent !important',
      color: 'rgba(255, 255, 255, 0.7) !important',
    },
  },
  primary: {
    background: 'var(--color-primary)',
    color: 'var(--color-white)',
    border: 'none',
    '&:hover': { background: 'var(--color-primary-hover)' },
    '&.Mui-disabled': {
      backgroundColor: 'rgba(0, 86, 179, 0.4) !important',
      color: 'rgba(255, 255, 255, 0.7) !important',
    },
  },
  success: {
    background: 'var(--color-success)',
    color: 'var(--color-white)',
    border: 'none',
    '&:hover': { background: 'var(--color-success)' },
    '&.Mui-disabled': {
      backgroundColor: 'rgba(40, 167, 69, 0.4) !important',
      color: 'rgba(255, 255, 255, 0.7) !important',
    },
  },
  outlined: {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: 'var(--border-thin) solid var(--color-primary)',
    '&:hover': { background: 'rgba(0, 86, 179, 0.06)', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' },
    '&.Mui-disabled': {
      backgroundColor: 'transparent !important',
      color: 'rgba(0, 86, 179, 0.5) !important',
      border: 'var(--border-thin) solid rgba(0, 86, 179, 0.3) !important',
    },
  },
  danger: {
    background: 'var(--color-error)',
    color: 'var(--color-white)',
    border: 'none',
    '&:hover': { background: '#dc2626' },
    '&.Mui-disabled': {
      backgroundColor: 'rgba(239, 68, 68, 0.4) !important',
      color: 'rgba(255, 255, 255, 0.7) !important',
    },
  },
  dangerOutlined: {
    background: 'transparent',
    color: 'var(--color-error)',
    border: 'var(--border-thin) solid var(--color-error)',
    '&:hover': { background: 'rgba(239, 68, 68, 0.06)', borderColor: 'var(--color-error)', color: 'var(--color-error)' },
    '&.Mui-disabled': {
      backgroundColor: 'transparent !important',
      color: 'rgba(239, 68, 68, 0.5) !important',
      border: 'var(--border-thin) solid rgba(239, 68, 68, 0.3) !important',
    },
  },
  white: {
    background: 'var(--color-white)',
    color: 'var(--color-primary)',
    border: 'var(--border-thin) solid rgba(0, 86, 179, 0.2)',
    '&:hover': { background: 'var(--color-slate-50)', borderColor: 'var(--color-primary)' },
    '&.Mui-disabled': {
      backgroundColor: 'var(--glass-bg) !important',
      color: 'rgba(0, 86, 179, 0.5) !important',
      border: 'var(--border-thin) solid rgba(0, 86, 179, 0.1) !important',
    },
  },
  text: {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: 'none',
    padding: '0',
    minWidth: 'auto',
    '&:hover': { background: 'transparent', textDecoration: 'underline' },
    '&.Mui-disabled': {
      backgroundColor: 'transparent !important',
      color: 'rgba(0, 86, 179, 0.5) !important',
    },
  },
};

const SIZE_STYLES = {
  sm: { minHeight: 36, px: 2, fontSize: 'var(--font-sm)', borderRadius: 'var(--radius-sm)' },
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

  const isDarkVariant = ['gradient', 'primary', 'success', 'danger'].includes(variant);
  const spinnerColor = 'var(--color-primary)';

  // Smart loading: wait 100ms before showing spinner, show for at least 1000ms
  const spinnerVisible = useSmartLoading(loading, 100, 1000);

  return (
    <Button
      color="inherit"
      disableElevation
      disableRipple={variant === 'text'}
      variant="contained"
      type={type}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        textTransform: 'none',
        fontWeight: 'var(--font-semibold)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        transition: 'all var(--transition-base)',
        ...sizeSx,
        ...variantSx,
        ...sx,
        ...(loading && {
          '& .tarang-btn-content, & .MuiButton-startIcon, & .MuiButton-endIcon': {
            opacity: 0,
            visibility: 'hidden'
          }
        })
      }}
      {...rest}
    >
      <span className="tarang-btn-content" style={{ display: 'inherit', alignItems: 'inherit', justifyContent: 'inherit', color: isDarkVariant ? 'var(--color-white)' : 'inherit' }}>
        {children}
      </span>
      {loading && (
        <CircularProgress
          className="tarang-spinner"
          size={20}
          sx={{
            color: spinnerColor,
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginTop: '-10px',
            marginLeft: '-10px',
            zIndex: 1
          }}
        />
      )}
    </Button>
  );
}
