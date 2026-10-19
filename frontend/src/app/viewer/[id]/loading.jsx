"use client";

import React from 'react';
import { Box, Typography } from '@mui/material';
import Loader from '../../../components/common/Loader';

export default function ViewerLoading() {
  return (
    <Box sx={{ 
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 0% 0%, rgba(0, 86, 179, 0.35) 0%, rgba(0, 86, 179, 0) 80%), radial-gradient(ellipse at 100% 0%, rgba(40, 167, 69, 0.25) 0%, rgba(40, 167, 69, 0) 80%), radial-gradient(ellipse at 100% 100%, rgba(40, 167, 69, 0.2) 0%, rgba(40, 167, 69, 0) 80%), radial-gradient(ellipse at 0% 100%, rgba(0, 86, 179, 0.2) 0%, rgba(0, 86, 179, 0) 80%), #f1f5f9'
    }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <Loader inline />
        <Typography sx={{ color: 'var(--color-primary)', fontWeight: 600, mt: -1 }}>Processing your file...</Typography>
      </Box>
    </Box>
  );
}
