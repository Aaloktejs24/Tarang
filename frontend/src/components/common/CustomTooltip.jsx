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
    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
    color: theme.palette.common.white,
    fontSize: '0.75rem',
    fontWeight: 600,
    borderRadius: '12px',
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
    backgroundColor: alpha('#ffc107', 0.95),
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${alpha(theme.palette.common.white, 0.4)}`,
    color: '#000000', // Black text for better contrast on yellow
    fontSize: '0.8rem',
    borderRadius: '12px',
    padding: '8px 12px',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: alpha('#ffc107', 0.95),
  },
}));
