"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Avatar, Typography, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { useLoading } from '../../contexts/LoadingContext';

const HERO_HEIGHT = { xs: '55vh', md: '75vh' };
const FADE_MASK = 'linear-gradient(to bottom, black 0%, black 20%, rgba(0,0,0,0.3) 60%, transparent 90%)';
const TEXT_GRADIENT = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0px 4px 15px rgba(255, 255, 255, 0.05)'
};

export default function UniversalHero({ title = '', subtitle = '', bannerUrl = '', avatarUrl = '', loading = false, hideContent = false, hideAvatar = false, showSpacer = true, contentSx = {} }) {
  const { startLoading, stopLoading } = useLoading();
  const [bgLoaded, setBgLoaded] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const spacerRef = useRef(null);

  // Background image preloading
  useEffect(() => {
    if (loading || !bannerUrl) return;
    
    startLoading();
    setBgLoaded(false);
    
    const img = new window.Image();
    img.src = bannerUrl;
    img.onload = img.onerror = () => {
      setBgLoaded(true);
      stopLoading();
    };
    
    return () => stopLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerUrl, loading]);

  // Scroll opacity fading
  useEffect(() => {
    if (!showSpacer || typeof window === 'undefined') return;

    let initialTop = null;
    const handleScroll = () => {
      if (!spacerRef.current) return;
      const rect = spacerRef.current.getBoundingClientRect();
      
      if (initialTop === null && rect.top > 0) initialTop = rect.top;
      if (initialTop !== null) {
        setOpacity(Math.max(0, Math.min(1, 1 - Math.max(0, initialTop - rect.top) / 60)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showSpacer]);

  return (
    <>
      <Box
        component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}
        sx={{ position: 'fixed', inset: 0, bottom: 'auto', zIndex: 0, height: HERO_HEIGHT, minHeight: '420px', display: 'flex', alignItems: 'flex-end', pointerEvents: 'none' }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#f1f5f9', maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }} />
        
        <Box sx={{ 
          position: 'absolute', inset: 0, 
          backgroundImage: bannerUrl ? `url("${bannerUrl}")` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', 
          opacity: bannerUrl && !bgLoaded ? 0 : 1, transform: 'scale(1.05)', transition: 'opacity 1s, transform 15s ease-out',
          maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK
        }} />

        <Box sx={{ position: 'absolute', inset: 0, background: loading ? 'rgba(226, 232, 240, 0.4)' : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0) 100%)', maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK, pointerEvents: 'none' }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pb: { xs: 6, md: 13 }, px: { xs: 3, md: 6, lg: 8 }, ...contentSx }}>
          {!hideContent && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2.5, md: 4 }, flexDirection: { xs: 'column', md: 'row' }, textAlign: { xs: 'center', md: 'left' } }}>
              {!hideAvatar && (
                <Box component={motion.div} style={{ opacity }} sx={{ borderRadius: '50%', p: '3px', border: `2px solid ${loading ? 'rgba(0,86,179,0.3)' : '#0056b3'}`, display: 'flex' }}>
                  {loading ? <Skeleton variant="circular" sx={{ width: { xs: 76, md: 92 }, height: { xs: 76, md: 92 } }} /> : 
                    <Avatar src={avatarUrl} alt={title} sx={{ width: { xs: 76, md: 92 }, height: { xs: 76, md: 92 }, bgcolor: '#fff', color: '#0056b3', fontWeight: 900, fontSize: { xs: 32, md: 42 } }}>
                      {String(title).charAt(0)}
                    </Avatar>
                  }
                </Box>
              )}

              <Box component={motion.div} style={{ opacity }} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, width: '100%', maxWidth: loading ? 420 : 'none' }}>
                {loading ? (
                  <>
                    <Skeleton variant="rounded" width="280px" sx={{ height: 32, mb: 2, maxWidth: '100%' }} />
                    <Skeleton variant="rounded" width="180px" sx={{ height: 32, maxWidth: '80%' }} />
                  </>
                ) : (
                  <>
                    <Typography variant="h1" sx={{ fontFamily: "'Rozha One', serif", fontSize: { xs: '2rem', md: '3.25rem' }, lineHeight: 1.4, ...TEXT_GRADIENT, m: 0, py: 0.5, overflowWrap: 'anywhere' }}>{title}</Typography>
                    {subtitle && <Typography variant="h2" sx={{ fontFamily: "'Rozha One', serif", fontSize: { xs: '2rem', md: '3.25rem' }, lineHeight: 1.4, ...TEXT_GRADIENT, m: 0, mt: '-0.2em', py: 0.5, overflowWrap: 'anywhere' }}>{subtitle}</Typography>}
                  </>
                )}
              </Box>
            </Box>
          )}
        </Container>
      </Box>

      {showSpacer && <Box ref={spacerRef} sx={{ width: '100%', height: HERO_HEIGHT, minHeight: '420px', mb: { xs: -8, md: -16 } }} />}
    </>
  );
}
