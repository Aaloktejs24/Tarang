"use client";
import React from 'react';
import { Box, Container, Card, Skeleton, Typography } from '@mui/material';
import UniversalHero from '../../components/hero/HeroBanner';
import PremiumCard from '../../components/ui/GlassCard';

import { DASHBOARD_PAGE_WRAPPER_SX, DASHBOARD_CONTAINER_SX } from '../../constants/layout';

export default function InstituteSkeleton() {
  return (
    <Box sx={DASHBOARD_PAGE_WRAPPER_SX}>
      <UniversalHero loading={true} />
      <Container maxWidth={false} sx={DASHBOARD_CONTAINER_SX}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.5 }}>
          {Array.from(new Array(4)).map((_, index) => (
            <PremiumCard
              key={`skeleton-${index}`}
              disableHover
              sx={{ display: "flex", alignItems: "center", p: 2, gap: 1.5 }}
            >
              {/* Icon — 48×48 rounded box */}
              <Skeleton variant="rectangular" sx={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', flexShrink: 0 }} />

              {/* Title + Subtitle with gap */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" noWrap sx={{ lineHeight: 1.5, mb: 0.5, fontSize: 'var(--font-base)', py: 0.5 }}>
                  <Skeleton variant="text" width="70%" />
                </Typography>
                <Typography variant="caption" noWrap>
                  <Skeleton variant="text" width="55%" />
                </Typography>
              </Box>

              {/* Arrow */}
              <Skeleton variant="circular" width={14} height={14} sx={{ flexShrink: 0 }} />
            </PremiumCard>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
