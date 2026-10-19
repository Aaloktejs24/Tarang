"use client";

import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import BackdropBlur from './BackdropBlur';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

/**
 * General-purpose loading indicator.
 *
 * Variants:
 *  - <Loader />              → full-screen frosted-glass backdrop spinner
 *  - <Loader inline />       → inline spinner centered in its container
 *  - <Loader mini />         → small inline spinner (20px), inherits color
 *  - <Loader size={n} />     → inline spinner with custom pixel size
 */
const Loader = ({ mini = false, size, inline = false }) => {
  const theme = useTheme();

  // Inline / mini spinner — no backdrop
  if (mini || size) {
    return (
      <Box display="inline-flex" alignItems="center" justifyContent="center">
        <CircularProgress size={size ?? 20} color="inherit" />
      </Box>
    );
  }

  // Standard centered inline spinner
  if (inline) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" p={2} width="100%">
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </Box>
    );
  }

  // Full-screen spinner (Default)
  return (
    <BackdropBlur zIndex={999999}>
      <CircularProgress size={40} thickness={4} sx={{ color: 'var(--color-primary)' }} />
    </BackdropBlur>
  );
};



export default Loader;
