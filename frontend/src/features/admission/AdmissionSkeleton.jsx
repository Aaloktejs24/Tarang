"use client";
import React from 'react';
import { Box, Container, Paper, Card, Skeleton } from '@mui/material';
import UniversalHero from '../../components/hero/UniversalHero';

export default function AdmissionSkeleton() {
  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 72px)", overflowX: "hidden", bgcolor: "transparent", mt: "-1px" }}>
      <UniversalHero loading={true} />
      
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, px: { xs: 3, md: 6, lg: 8 }, pb: 10 }}>
        <Box sx={{ width: 'var(--size-full)' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
              gap: 3
            }}
          >
            {Array.from(new Array(6)).map((_, index) => (
              <Card key={`skeleton-${index}`} sx={{
                display: 'flex', flexDirection: 'column', overflow: 'hidden'
              }}>
                <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 38, right: 32 }}>
                    <Skeleton variant="circular" width={10} height={10} />
                  </Box>
                  <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
                      {Array.from(new Array(6)).map((_, i) => (
                        <Skeleton key={i} variant="circular" width={24} height={24} />
                      ))}
                    </Box>
                    <Skeleton variant="rectangular" width={80} height={32} sx={{ }} />
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
