"use client";
import React from 'react';
import { Box, Skeleton, Stack, Typography, Grid } from '@mui/material';
import PremiumCard from '../../components/ui/PremiumCard';

export default function InstituteProfileSkeleton() {
  return (
    <Box sx={{ height: "calc(100vh - 72px)", overflow: "hidden", display: "flex" }}>

      {/* LEFT SIDEBAR SKELETON */}
      <Box sx={{
        width: { xs: '100%', sm: 420, md: 480 },
        flexShrink: 0,
        height: "100%",
        overflowY: "auto",
        display: { xs: 'none', sm: 'block' },
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        pl: { sm: 2, md: 4, lg: 6 },
        pr: { sm: 1, md: 1.5, lg: 1.5 },
        pt: { sm: 3, md: 4 },
        pb: { sm: 6, md: 8 },
      }}>
        <Box sx={{ width: "var(--size-full)" }}>
          {/* Main Profile Card Skeleton */}
          <PremiumCard variant="profile" sx={{ pt: 0, pb: 4, px: 4, textAlign: "left", overflow: "hidden", mb: 3 }}>
            {/* Banner Area */}
            <Box sx={{ height: 120, mx: -4, mb: 0 }}>
              <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: "var(--color-primary-light)" }} />
            </Box>
            {/* Avatar and Action Button Row */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: -5, mb: 3 }}>
              <Box sx={{ position: "relative", display: "inline-block", p: "2px", border: "2px solid rgba(30, 79, 163, 0.3)", borderRadius: 'var(--radius-full)', zIndex: 2, bgcolor: "var(--card-bg)" }}>
                <Skeleton variant="circular" width={100} height={100} />
              </Box>
              <Box sx={{ pb: 1, zIndex: 2 }}>
                <Skeleton variant="rounded" width={100} height={30} sx={{ borderRadius: 'var(--radius-md)' }} />
              </Box>
            </Box>
            {/* Text Info */}
            <Skeleton variant="text" width="60%" height={32} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
          </PremiumCard>

          {/* Skills/Expertise Card Skeleton */}
          <PremiumCard variant="profile" sx={{ p: { xs: 2.5, sm: 4 }, mt: 3, mb: 3 }}>
            <Box>
              <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1.5 }} />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} variant="rounded" width={80 + (i * 15 % 40)} height={32} sx={{ borderRadius: 'var(--radius-md)' }} />
                ))}
              </Box>
            </Box>
          </PremiumCard>

          {/* Connect Card Skeleton */}
          <PremiumCard variant="profile" sx={{ p: { xs: 2.5, sm: 4 }, mt: 3 }}>
            <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1.5 }} />
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} variant="circular" width={32} height={32} />
              ))}
            </Box>
          </PremiumCard>
        </Box>
      </Box>

      {/* RIGHT CONTENT SKELETON */}
      <Box sx={{
        flexGrow: 1,
        display: { xs: 'block', sm: 'flex' },
        flexDirection: "column",
        height: "100%",
        overflowY: { xs: 'auto', sm: 'hidden' },
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        pl: { xs: 2, md: 3, lg: 4 },
        pr: { xs: 2, md: 4, lg: 6 },
        pt: { xs: 3, md: 4 },
        pb: { xs: 4, sm: 0 },
      }}>

        {/* Mobile Profile Card (Only visible on XS) */}
        <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 4 }}>
          <PremiumCard variant="profile" sx={{ pt: 0, pb: 4, px: 4, textAlign: "left", overflow: "hidden", mb: 3 }}>
            <Box sx={{ height: 120, mx: -4, mb: 0 }}>
              <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: "rgba(30, 79, 163, 0.08)" }} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: -5, mb: 3 }}>
              <Box sx={{ position: "relative", display: "inline-block", p: "2px", border: "2px solid rgba(30, 79, 163, 0.3)", borderRadius: 'var(--radius-full)', zIndex: 2, bgcolor: "var(--card-bg)" }}>
                <Skeleton variant="circular" width={100} height={100} />
              </Box>
              <Box sx={{ pb: 1, zIndex: 2 }}>
                <Skeleton variant="rounded" width={100} height={30} sx={{ borderRadius: 'var(--radius-md)' }} />
              </Box>
            </Box>
            <Skeleton variant="text" width="60%" height={32} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
          </PremiumCard>
        </Box>

        {/* Desktop Tabs Header Skeleton */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 0, pb: 1.5, mb: 1, flexShrink: 0 }}>
          <Box sx={{
            display: "flex",
            gap: 0.5,
            overflowX: "hidden",
            bgcolor: "var(--card-bg)",
            backdropFilter: "var(--card-blur)",
            border: "var(--border-thin) solid var(--card-border)",
            p: 0.5,
            borderRadius: 'var(--radius-md)',
            mr: { xs: 0, sm: 2 },
            flex: { xs: 1, xl: 'none' },
            height: '44px',
            alignItems: 'center',
          }}>
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} variant="rounded" width={90} height={32} sx={{ borderRadius: 'var(--radius-md)' }} />)}
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, flexShrink: 0 }}>
            <Skeleton variant="rounded" width={130} height={44} sx={{ borderRadius: 'var(--radius-md)' }} />
          </Box>
        </Box>

        {/* Tab Content Skeleton (Overview Tab Reflection) */}
        <Box sx={{
          flex: { xs: 'none', sm: 1 },
          display: 'flex',
          flexDirection: 'column',
          overflowY: { xs: 'visible', sm: 'auto' },
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          pt: 3,
          pb: 4,
        }}>
          
          <Grid container spacing={4} sx={{ flexGrow: 1, m: 0, width: '100%' }}>
            <Grid size={{ xs: 12 }} sx={{ display: 'flex', flexDirection: 'column', pl: "0 !important" }}>
              {/* "मेरे बारे में" Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}><Skeleton variant="text" width="20%" /></Typography>
                <Box sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)", borderRadius: "var(--radius-lg)", border: "var(--border-thin) solid var(--card-border)" }}>
                  <Typography sx={{ fontSize: 'var(--font-base)', lineHeight: 1.8 }}>
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="80%" />
                  </Typography>
                </Box>
              </Box>

              {/* "सीखने के आँकड़े" Section */}
              <Box sx={{ mb: 4 }}>
                <Skeleton variant="text" width="25%" height={28} sx={{ mb: 2 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <PremiumCard variant="stat" key={item} sx={{ width: "var(--size-full)", height: "var(--size-full)", minHeight: 90, display: "flex", flexDirection: "row", alignItems: "center", gap: 1.5, px: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="70%" height={24} />
                        <Skeleton variant="text" width="40%" height={16} />
                      </Box>
                    </PremiumCard>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>

        </Box>

      </Box>
    </Box>
  );
}
