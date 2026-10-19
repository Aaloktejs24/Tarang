"use client";
import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export default function FeedLoading() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, margin: '0 auto', width: '100%', pt: 2 }}>
      {/* Create Post Skeleton */}
      <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 4 }} />
        </Box>
      </Box>

      {/* Posts Skeletons */}
      {[1, 2, 3].map((item) => (
        <Box key={item} sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="20%" height={16} />
            </Box>
          </Box>
          <Skeleton variant="rectangular" width="100%" height={250} sx={{ borderRadius: 2 }} />
        </Box>
      ))}
    </Box>
  );
}
