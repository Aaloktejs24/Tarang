"use client";
import React from 'react';
import { Box, Container, Skeleton, Paper } from '@mui/material';

import { DASHBOARD_PAGE_WRAPPER_NO_HERO_SX, DASHBOARD_CONTAINER_SX } from '../../../constants/layout';

export default function ApplicationSkeleton() {
  return (
    <Box sx={{ ...DASHBOARD_PAGE_WRAPPER_NO_HERO_SX, pt: 0, minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>

      {/* Container — exact copy from page.jsx L2487-2496 */}
      <Container maxWidth={false} sx={{
        ...DASHBOARD_CONTAINER_SX,
        px: { xs: 2, md: 4 },
        pb: 0,
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Box sx={{ width: 'var(--size-full)', display: 'flex', flexDirection: 'column' }}>

          {/* Paper — exact copy from page.jsx L2503-2514 */}
          <Paper elevation={0} sx={{
            borderRadius: 'var(--radius-lg)',
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

            {/* ══════ LEFT SIDEBAR — exact copy from page.jsx L2517-2525 ══════ */}
            <Box sx={{
              width: { xs: 'var(--size-full)', md: '350px' },
              flexShrink: 0,
              background: 'transparent',
              border: 'none',
              p: { xs: 3, md: 5 },
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Stepper placeholder — 4 steps horizontal */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mb: 2, width: 'var(--size-full)' }}>
                {[0, 1, 2, 3].map((i) => (
                  <React.Fragment key={i}>
                    <Skeleton variant="circular" width={36} height={36} sx={{ flexShrink: 0 }} />
                    {i < 3 && (
                      <Skeleton variant="rectangular" height={2} sx={{ flexGrow: 1, mx: 0.5 }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>

              {/* Title — "B.Tech" */}
              <Skeleton variant="text" width="50%" height={36} sx={{ mb: 2 }} />

              {/* Description text lines */}
              <Box sx={{ overflowY: 'auto', flexGrow: 1, minWidth: 0, pr: 1, pb: 2 }}>
                {Array.from({ length: 14 }).map((_, i) => (
                  <Skeleton key={i} variant="text" width={i === 13 ? "80%" : "100%"} height={16} sx={{ mb: 0.3 }} />
                ))}
              </Box>
            </Box>

            {/* ══════ RIGHT CONTENT AREA — exact copy from page.jsx L2581-2596 ══════ */}
            <Box sx={{
              flexGrow: 1, minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: { xs: 3, md: 4 },
              px: { xs: 3, md: 8 },
              background: "var(--popover-bg)",
              backdropFilter: "var(--popover-blur)",
              WebkitBackdropFilter: "var(--popover-blur)",
              border: "var(--border-thin) solid var(--card-border)",
              borderRadius: 'var(--radius-lg)',
              m: { xs: 0, md: 1 },
              mr: { xs: 0, md: 2 },
              position: 'relative'
            }}>
              {/* Top-right icons (AutoSave + Delete + Clear) — page.jsx L2598 */}
              <Box sx={{ position: 'absolute', top: { xs: 16, md: 24 }, right: { xs: 16, md: 32 }, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Skeleton variant="text" width={100} height={20} />
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton variant="circular" width={28} height={28} />
              </Box>

              {/* Inner wrapper — page.jsx L2624 */}
              <Box sx={{ width: 'var(--size-full)', display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>

                {/* Form wrapper — page.jsx L2651 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>

                  {/* Scrollable area — page.jsx L2652 */}
                  <Box sx={{ flexGrow: 1, minWidth: 0, overflowY: 'auto', pr: { md: 2 } }}>

                    {/* Stage title — "Basic Applicant Details" */}
                    <Skeleton variant="text" width="280px" height={36} sx={{ mb: 2 }} />

                    {/* PERSONAL INFORMATION subtitle */}
                    <Skeleton variant="text" width="200px" height={18} sx={{ mb: 2 }} />

                    {/* Form grid — exact 12-column grid, gap 1.5 from page.jsx */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(12, 1fr)' }, gap: 1.5, mb: 1.5, width: 'var(--size-full)' }}>
                      {/* Row 1: Name (span 6) + Email (span 6) */}
                      <Box sx={{ gridColumn: { md: 'span 6' } }}><Skeleton variant="rectangular" height={52} sx={{ borderRadius: 'var(--radius-md)' }} /></Box>
                      <Box sx={{ gridColumn: { md: 'span 6' } }}><Skeleton variant="rectangular" height={52} sx={{ borderRadius: 'var(--radius-md)' }} /></Box>

                      {/* Row 2: Phone (span 6) + DOB (span 6) */}
                      <Box sx={{ gridColumn: { md: 'span 6' } }}><Skeleton variant="rectangular" height={52} sx={{ borderRadius: 'var(--radius-md)' }} /></Box>
                      <Box sx={{ gridColumn: { md: 'span 6' } }}><Skeleton variant="rectangular" height={52} sx={{ borderRadius: 'var(--radius-md)' }} /></Box>

                      {/* Row 3: Nationality + Gender + Birth Religion (span 4 each) */}
                      <Box sx={{ gridColumn: { md: 'span 4' } }}><Skeleton variant="rectangular" height={52} sx={{ borderRadius: 'var(--radius-md)' }} /></Box>
                      <Box sx={{ gridColumn: { md: 'span 4' } }}><Skeleton variant="rectangular" height={52} sx={{ borderRadius: 'var(--radius-md)' }} /></Box>
                      <Box sx={{ gridColumn: { md: 'span 4' } }}><Skeleton variant="rectangular" height={52} sx={{ borderRadius: 'var(--radius-md)' }} /></Box>

                      {/* Row 4: Current Religion + Race/Ethnicity + Language (span 4 each) */}
                      <Box sx={{ gridColumn: { md: 'span 4' } }}><Skeleton variant="rectangular" height={52} sx={{ borderRadius: 'var(--radius-md)' }} /></Box>
                      <Box sx={{ gridColumn: { md: 'span 4' } }}><Skeleton variant="rectangular" height={52} sx={{ borderRadius: 'var(--radius-md)' }} /></Box>
                      <Box sx={{ gridColumn: { md: 'span 4' } }}><Skeleton variant="rectangular" height={52} sx={{ borderRadius: 'var(--radius-md)' }} /></Box>
                    </Box>

                    {/* File uploads — repeat(3, 1fr) grid, gap 1.5 from page.jsx L1360 */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5, mb: 3, width: 'var(--size-full)' }}>
                      <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 'var(--radius-md)' }} />
                      <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 'var(--radius-md)' }} />
                      <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 'var(--radius-md)' }} />
                      <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 'var(--radius-md)' }} />
                      <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 'var(--radius-md)' }} />
                    </Box>

                    {/* ACADEMIC RECORD subtitle */}
                    <Skeleton variant="text" width="160px" height={18} sx={{ mb: 2 }} />

                  </Box>

                  {/* Footer buttons — page.jsx L2708-2716 */}
                  <Box sx={{
                    mt: 2,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "flex-end",
                    alignItems: { xs: "stretch", sm: "center" },
                    gap: { xs: 1.5, sm: 2 },
                  }}>
                    <Skeleton variant="rectangular" width={140} height={48} sx={{ borderRadius: 'var(--radius-md)' }} />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
