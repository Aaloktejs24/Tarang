"use client";
import React from 'react';
import { Box, Card, CardContent, Skeleton, Grid, Stack, Typography } from '@mui/material';

export default function ExploreListSkeleton() {
  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {Array.from(new Array(6)).map((_, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }} key={idx}>
            <Card elevation={0} sx={{
              width: 'var(--size-full)', display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-lg)',
              background: 'var(--card-bg)', border: 'var(--border-thin) solid var(--card-border)', overflow: "visible"
            }}>
              <Skeleton variant="rectangular" width="100%" height={140} sx={{ borderTopLeftRadius: "var(--radius-lg)", borderTopRightRadius: "var(--radius-lg)" }} />
              <CardContent sx={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', pt: 0, px: 3, pb: 3 }}>
                <Box sx={{ position: "relative", display: "inline-flex", p: "2px", border: "2px solid rgba(30, 79, 163, 0.3)", borderRadius: 'var(--radius-full)', zIndex: 2, bgcolor: "var(--card-bg)", mt: "-42px", mb: 2 }}>
                  <Skeleton variant="circular" width={84} height={84} />
                </Box>
                <Box sx={{ width: '100%', mb: 3 }}>
                  <Typography variant="h6" sx={{ lineHeight: 1.3, mb: 0.5 }}>
                    <Skeleton variant="text" width="80%" />
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 1.5 }}>
                    <Skeleton variant="text" width="40%" />
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="80%" />
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, width: 'var(--size-full)', mt: 'auto' }}>
                  <Skeleton variant="rectangular" sx={{ flex: 1, height: 42, borderRadius: 'var(--radius-md)' }} />
                  <Skeleton variant="rectangular" sx={{ flex: 1, height: 42, borderRadius: 'var(--radius-md)' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
