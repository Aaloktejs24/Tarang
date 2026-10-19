"use client";
import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';

export default function AdminLoading() {
  return (
    <Box
      sx={{
        minHeight: 'var(--size-screen-h)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.45) 0, transparent 50%), 
          radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.3) 0, transparent 50%), 
          radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.2) 0, transparent 50%),
          radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.15) 0, transparent 50%),
          #eef2f6
        ` }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          width: { xs: 'var(--size-screen-w)', sm: '500px' },
          minHeight: { xs: 'var(--size-screen-h)', sm: 'auto' },
          px: { xs: 3, sm: 6 },
          py: { xs: 6, sm: 6 },
          border: 'none',
          bgcolor: 'var(--color-white)',
          borderRadius: { sm: 'var(--radius-xl)' }
        }}
      >
        {/* Header Skeleton */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Skeleton variant="text" width={100} height={40} />
          </Box>
        </Box>

        {/* Form Fields Skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={120} height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 'var(--radius-md)' }} />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={80} height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 'var(--radius-md)' }} />
        </Box>

        {/* Button Skeleton */}
        <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 'var(--radius-md)', mt: 1 }} />
      </Paper>
    </Box>
  );
}
