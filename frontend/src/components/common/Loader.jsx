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
 *  - <Loader mini />         → small inline spinner (20px), inherits color
 *  - <Loader size={n} />     → inline spinner with custom pixel size
 *
 * The full-screen variant uses BackdropBlur for a consistent look across the app.
 */
const Loader = ({ mini = false, size }) => {
  const theme = useTheme();

  // Inline / mini spinner — no backdrop
  if (mini || size) {
    return (
      <Box display="inline-flex" alignItems="center" justifyContent="center">
        <CircularProgress size={size ?? 20} color="inherit" />
      </Box>
    );
  }

  // Full-screen spinner
  return (
    <BackdropBlur zIndex={999999}>
      <CircularProgress sx={{ color: 'var(--color-primary)' }} />
    </BackdropBlur>
  );
};

export default Loader;
