import React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

export const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'var(--popover-bg)',
    backdropFilter: 'var(--popover-blur)',
    WebkitBackdropFilter: 'var(--popover-blur)',
    border: 'var(--border-thin) solid var(--card-border)',
    color: 'var(--color-slate-900)',
    fontSize: '0.75rem',
    fontWeight: 600,
    fontFamily: 'inherit',
    borderRadius: 'var(--radius-md)',
    padding: '8px 12px',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: 'var(--popover-bg)',
    "&::before": {
      border: 'var(--border-thin) solid var(--card-border)',
    }
  },
}));
