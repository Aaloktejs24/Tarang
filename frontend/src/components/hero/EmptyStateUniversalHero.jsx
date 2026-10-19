"use client";

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useBgPreloader } from '../../hooks/useBgPreloader';

const HERO_HEIGHT = { xs: '55vh', md: '75vh' };
const FADE_MASK = 'linear-gradient(to bottom, black 0%, black 20%, rgba(0,0,0,0.3) 60%, transparent 90%)';

/**
 * A standalone, highly-optimized hero component that only displays the background banner.
 * It has NO scroll event listeners and NO content fading logic.
 * Perfect for system-wide empty states, 404 pages, or generic pages.
 */
export default function EmptyStateUniversalHero({ bannerUrl, loading = false, showSpacer = true }) {
  const [bgLoaded, setBgLoaded] = useState(false);
  const bgLoadedHook = useBgPreloader(bannerUrl, loading);

  useEffect(() => {
    setBgLoaded(bgLoadedHook);
  }, [bgLoadedHook]);

  return (
    <>
      <Box sx={{ position: 'fixed', inset: 0, bottom: 'auto', zIndex: 0, height: HERO_HEIGHT, minHeight: '420px', display: 'flex', alignItems: 'flex-end', pointerEvents: 'none' }}>
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'var(--color-slate-50)', maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK, transform: 'translateZ(0)' }} />
        
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: bannerUrl ? `url("${bannerUrl}")` : 'none', backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: bannerUrl && !bgLoaded ? 0 : 1, transform: 'scale(1.05) translateZ(0)', transition: 'opacity 1s, transform 15s ease-out',
          maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK
        }} />

        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0) 100%)', maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK, pointerEvents: 'none' }} />
      </Box>

      {showSpacer && <Box sx={{ width: 'var(--size-full)', height: HERO_HEIGHT, minHeight: '420px', mb: { xs: -8, md: -16 } }} />}
    </>
  );
}
