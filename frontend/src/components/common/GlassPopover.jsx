import React from 'react';
import { Popover } from '@mui/material';

/**
 * A universal Popover component that applies the standard glassmorphism styling
 * consistent with the rest of the application (like dropdowns).
 * Renders in a Portal to avoid nested backdrop-filter rendering bugs.
 */
export const GlassPopover = ({ 
  children, 
  open, 
  anchorEl, 
  onClose, 
  anchorOrigin = { vertical: 'bottom', horizontal: 'left' },
  transformOrigin = { vertical: 'top', horizontal: 'left' },
  width = 'auto',
  minWidth,
  sx = {},
  ...props 
}) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      elevation={0}
      marginThreshold={0}
      disableAutoFocus
      disableEnforceFocus
      PaperProps={{
        sx: {
          mt: '6px',
          width: width === 'match-anchor' ? (anchorEl ? Math.max(anchorEl.clientWidth, minWidth || 0) : 'auto') : width,
          minWidth: minWidth,
          bgcolor: 'var(--popover-bg)', 
          backdropFilter: 'var(--popover-blur)', 
          WebkitBackdropFilter: 'var(--popover-blur)',
          boxShadow: 'none',
          border: 'var(--border-thin) solid var(--card-border)', 
          borderRadius: 'var(--radius-lg)',
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          ...sx
        }
      }}
      {...props}
    >
      {children}
    </Popover>
  );
};
