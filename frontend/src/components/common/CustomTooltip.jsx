import React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

export const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: alpha(theme.palette.primary.main, 0.75),
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `var(--border-thin) solid ${alpha(theme.palette.common.white, 0.2)}`,
    color: theme.palette.common.white,
    fontSize: 'var(--font-xs)',
    fontWeight: 'var(--font-semibold)',
    borderRadius: 'var(--radius-lg)',
    padding: '8px 12px',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: alpha(theme.palette.primary.main, 0.75),
  },
}));

export const AmberTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: alpha('var(--color-warning)', 0.95),
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `var(--border-thin) solid ${alpha(theme.palette.common.white, 0.4)}`,
    color: 'var(--color-slate-900)', // Black text for better contrast on yellow
    fontSize: 'var(--font-xs)',
    borderRadius: 'var(--radius-lg)',
    padding: '8px 12px',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: alpha('var(--color-warning)', 0.95),
  },
}));
