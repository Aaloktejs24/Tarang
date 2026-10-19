"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Avatar, Typography, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { useBgPreloader } from '../../hooks/useBgPreloader';


const HERO_HEIGHT = { xs: '55vh', md: '75vh' };
const FADE_MASK = 'linear-gradient(to bottom, black 0%, black 20%, rgba(0,0,0,0.3) 60%, transparent 90%)';
const TEXT_GRADIENT = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0px 4px 15px rgba(255, 255, 255, 0.05)'
};

export default function UniversalHero({ title = '', subtitle = '', bannerUrl = '', avatarUrl = '', loading = false, hideContent = false, hideAvatar = false, showSpacer = true, fadeAnchorRef, contentSx = {} }) {

  const [bgLoaded, setBgLoaded] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const spacerRef = useRef(null);
  const bgLoadedHook = useBgPreloader(bannerUrl, loading);

  useEffect(() => {
    setBgLoaded(bgLoadedHook);
  }, [bgLoadedHook]);

  // Scroll opacity fading
  useEffect(() => {
    const targetRef = fadeAnchorRef || spacerRef;
    if (!targetRef || typeof window === 'undefined') return;

    let initialTop = null;
    const handleScroll = () => {
      if (!targetRef.current) return;
      const rect = targetRef.current.getBoundingClientRect();

      if (initialTop === null && rect.top > 0) initialTop = rect.top;
      if (initialTop !== null) {
        setOpacity(Math.max(0, Math.min(1, 1 - Math.max(0, initialTop - rect.top) / 60)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, [showSpacer, fadeAnchorRef]);

  return (
    <>
      <Box
        component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}
        sx={{ position: 'fixed', inset: 0, bottom: 'auto', zIndex: 0, height: HERO_HEIGHT, minHeight: '420px', display: 'flex', alignItems: 'flex-end', pointerEvents: 'none' }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'var(--color-slate-50)', maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK, transform: 'translateZ(0)' }} />

        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: bannerUrl ? `url("${bannerUrl}")` : 'none', backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: bannerUrl && !bgLoaded ? 0 : 1, transform: 'scale(1.05) translateZ(0)', transition: 'opacity 1s, transform 15s ease-out',
          maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK
        }} />

        <Box sx={{ position: 'absolute', inset: 0, background: loading ? 'rgba(226, 232, 240, 0.4)' : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0) 100%)', maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK, pointerEvents: 'none' }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pb: { xs: 6, md: 13 }, px: { xs: 3, md: 6, lg: 8 }, ...contentSx }}>
          {!hideContent && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2.5, md: 4 }, flexDirection: { xs: 'column', md: 'row' }, textAlign: { xs: 'center', md: 'left' } }}>
              {!hideAvatar && (
                <Box component={motion.div} style={{ opacity }} sx={{ borderRadius: 'var(--radius-full)', p: '3px', border: `var(--border-thick) solid ${loading ? 'rgba(0,86,179,0.3)' : 'var(--color-primary)'}`, display: 'flex' }}>
                  {loading ? <Box className="MuiSkeleton-root" sx={{ width: { xs: 76, md: 92 }, height: { xs: 76, md: 92 }, borderRadius: '50%' }} /> :
                    <Avatar src={avatarUrl} alt={title} sx={{ width: { xs: 76, md: 92 }, height: { xs: 76, md: 92 }, bgcolor: 'var(--color-white)', color: 'var(--color-primary)', fontWeight: 900, fontSize: { xs: 32, md: 42 } }}>
                      {String(title).charAt(0)}
                    </Avatar>
                  }
                </Box>
              )}

              <Box component={motion.div} style={{ opacity }} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, maxWidth: loading ? 600 : 'none' }}>
                {loading ? (
                  <>
                    <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3.25rem' }, lineHeight: 1.4, m: 0, py: 0.5, overflowWrap: 'anywhere' }}>
                      <Box className="MuiSkeleton-root" sx={{ width: { xs: '240px', md: '420px' }, height: { xs: 32, md: 52 }, borderRadius: 'var(--radius-md)', maxWidth: 'var(--size-full)', display: 'inline-block' }} />
                    </Typography>
                    <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3.25rem' }, lineHeight: 1.4, m: 0, mt: '-0.2em', py: 0.5, overflowWrap: 'anywhere' }}>
                      <Box className="MuiSkeleton-root" sx={{ width: { xs: '160px', md: '280px' }, height: { xs: 32, md: 52 }, borderRadius: 'var(--radius-md)', maxWidth: '80%', display: 'inline-block' }} />
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3.25rem' }, lineHeight: 1.4, ...TEXT_GRADIENT, m: 0, py: 0.5, overflowWrap: 'anywhere' }}>{title}</Typography>
                    {subtitle && <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3.25rem' }, lineHeight: 1.4, ...TEXT_GRADIENT, m: 0, mt: '-0.2em', py: 0.5, overflowWrap: 'anywhere' }}>{subtitle}</Typography>}
                  </>
                )}
              </Box>
            </Box>
          )}
        </Container>
      </Box>

      {showSpacer && <Box ref={spacerRef} sx={{ width: 'var(--size-full)', height: HERO_HEIGHT, minHeight: '420px', mb: { xs: -8, md: -16 } }} />}
    </>
  );
}
