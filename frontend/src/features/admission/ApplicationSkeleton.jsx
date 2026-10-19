"use client";
import React from 'react';
import { Box, Container, Skeleton } from '@mui/material';

export default function ApplicationSkeleton() {
  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 72px)", overflowX: "hidden", bgcolor: "transparent", display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: "relative", zIndex: 1, px: { xs: 3, md: 6, lg: 8 }, py: 4 }}>
        <Box sx={{
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'stretch',
          width: 'var(--size-full)',
          height: { xs: 'auto', md: '82vh' },
          maxHeight: { xs: 'none', md: '820px' },
          minHeight: { xs: 'auto', md: '600px' },
          overflow: 'hidden'
        }}>
          {/* Left Sidebar (Progress) */}
          <Box sx={{
            width: { xs: 'var(--size-full)', md: '350px' },
            flexShrink: 0,
            background: 'transparent',
            border: 'none',
            p: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mb: 4 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {Array.from(new Array(4)).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Skeleton variant="text" width="50%" height={24} />
                </Box>
              ))}
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', gap: 2, width: 'var(--size-full)' }}>
              <Box sx={{ display: 'flex', gap: 2, width: 'var(--size-full)' }}>
                <Skeleton variant="rectangular" height={48} sx={{ flex: 1, borderRadius: 'var(--radius-lg)' }} />
                <Skeleton variant="rectangular" height={48} sx={{ flex: 1, borderRadius: 'var(--radius-lg)' }} />
              </Box>
              <Skeleton variant="rectangular" height={48} sx={{ width: 'var(--size-full)', borderRadius: 'var(--radius-lg)' }} />
            </Box>
          </Box>

          {/* Right Content Area */}
          <Box sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            py: { xs: 6, md: 8 },
            px: { xs: 3, md: 8 },
            background: "rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "none",
            borderRadius: 'var(--radius-lg)',
            m: { xs: 0, md: 1 },
            mr: { xs: 0, md: 2 }
          }}>
            <Box sx={{ width: 'var(--size-full)', display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Skeleton variant="text" width="40%" height={40} />
              </Box>

              <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: { md: 2 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* Mock Form Sections */}
                  {Array.from(new Array(3)).map((_, sectionIndex) => (
                    <Box key={sectionIndex}>
                      <Skeleton variant="text" width="30%" height={20} sx={{ mb: 2 }} />
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
                        {Array.from(new Array(6)).map((_, fieldIndex) => (
                          <Skeleton key={fieldIndex} variant="rectangular" height={56} sx={{ borderRadius: 'var(--radius-md)' }} />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
