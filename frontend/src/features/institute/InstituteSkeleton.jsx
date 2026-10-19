"use client";
import React from 'react';
import { Box, Container, Card, Skeleton, Typography } from '@mui/material';
import UniversalHero from '../../components/hero/UniversalHero';
import PremiumCard from '../../components/ui/PremiumCard';

export default function InstituteSkeleton() {
  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 72px)", overflowX: "hidden", overflowY: "auto", bgcolor: "transparent", mt: "-1px" }}>
      <UniversalHero loading={true} />
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, pb: 10, pt: 8, px: { xs: 3, md: 6, lg: 8 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
          {Array.from(new Array(4)).map((_, index) => (
            <PremiumCard
              key={`skeleton-${index}`}
              disableHover
              sx={{ display: "flex", alignItems: "center", p: 2, gap: 2 }}
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
