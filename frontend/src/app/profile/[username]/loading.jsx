"use client";
import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';

export default function ProfileLoading() {
  return (
    <Box sx={{ width: '100%', maxWidth: 1000, margin: '0 auto', pt: 2 }}>
      {/* Cover Photo */}
      <Skeleton variant="rectangular" width="100%" height={250} sx={{ borderRadius: 2 }} />
      
      {/* Avatar & Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: -6, px: 4, mb: 4 }}>
        <Skeleton variant="circular" width={120} height={120} sx={{ border: '4px solid #fff' }} />
        <Box sx={{ ml: 3, pb: 1, flex: 1 }}>
          <Skeleton variant="text" width={250} height={40} />
          <Skeleton variant="text" width={150} height={20} />
        </Box>
        <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Profile Body */}
      <Grid container spacing={3}>
        <Grid size={{xs: 12, md: 4}}>
          <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
          </Box>
        </Grid>
        <Grid size={{xs: 12, md: 8}}>
          <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
