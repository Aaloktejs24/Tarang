"use client";

import React, { useState, useEffect } from 'react';
import { Box, Container, Avatar, Typography, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { useLoading } from '../../contexts/LoadingContext';

const HERO_HEIGHT = { xs: '55vh', md: '75vh' };
const HERO_MIN_HEIGHT = '420px';

const clampOpacity = (value) => Math.max(0, Math.min(1, value));

export default function UniversalHero({
  title = '',
  subtitle = '',
  bannerUrl = '',
  avatarUrl = '',
  loading = false,
  hideContent = false,
  hideAvatar = false,
  fadeAnchorRef = null,
  showSpacer = true,
  contentSx = {},
}) {
  const { startLoading, stopLoading } = useLoading();
  const [bgLoaded, setBgLoaded] = useState(false);
  const [logoOpacity, setLogoOpacity] = React.useState(1);
  const [textOpacity, setTextOpacity] = React.useState(1);
  const textRef = React.useRef(null);

  const spacerRef = React.useRef(null);

  useEffect(() => {
    let isLoaderActive = false;

    const safeStartLoading = () => {
      if (!isLoaderActive) {
        startLoading();
        isLoaderActive = true;
      }
    };

    const safeStopLoading = () => {
      if (isLoaderActive) {
        stopLoading();
        isLoaderActive = false;
      }
    };

    if (loading) {
      safeStartLoading();
      return safeStopLoading;
    }

    if (!bannerUrl) {
      return;
    }

    setBgLoaded(false);
    safeStartLoading();

    const img = new window.Image();
    img.src = bannerUrl;

    img.onload = () => {
      setBgLoaded(true);
      safeStopLoading();
    };

    img.onerror = () => {
      setBgLoaded(true);
      safeStopLoading();
    };

    return safeStopLoading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerUrl, loading]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !showSpacer) return undefined;

    let frameId;
    let initialTop = null;
    let lastOpacity = 1; // To prevent unnecessary state updates

    const checkPosition = () => {
      if (spacerRef.current) {
        const rect = spacerRef.current.getBoundingClientRect();

        // Wait for a valid layout calculation (top should be > 0 initially because of navbar)
        if (initialTop === null && rect.top > 0) {
          initialTop = rect.top;
        }

        if (initialTop !== null) {
          // As we scroll down, the spacer moves up, so rect.top decreases
          const scrolled = initialTop - rect.top;
          const currentScroll = Math.max(0, scrolled);

          // Fade completely over 60px of scroll
          const opacity = clampOpacity(1 - currentScroll / 60);

          if (opacity !== lastOpacity) {
            setLogoOpacity(opacity);
            setTextOpacity(opacity);
            lastOpacity = opacity;
          }
        }
      }
      frameId = requestAnimationFrame(checkPosition);
    };

    frameId = requestAnimationFrame(checkPosition);
    return () => cancelAnimationFrame(frameId);
  }, [showSpacer, hideContent]);

  return (
    <>
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 0, width: '100%', height: HERO_HEIGHT, minHeight: HERO_MIN_HEIGHT, display: 'flex', alignItems: 'flex-end', overflow: 'hidden', pointerEvents: 'none' }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#f1f5f9', maskImage: 'linear-gradient(to bottom, black 0%, black 20%, rgba(0,0,0,0.3) 60%, transparent 90%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 20%, rgba(0,0,0,0.3) 60%, transparent 90%)' }} />
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: bannerUrl ? `url("${bannerUrl}")` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', opacity: bannerUrl && !bgLoaded ? 0 : 1, transform: 'scale(1.05)', transition: 'opacity 1s ease-in-out, transform 15s ease-out', maskImage: 'linear-gradient(to bottom, black 0%, black 20%, rgba(0,0,0,0.3) 60%, transparent 90%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 20%, rgba(0,0,0,0.3) 60%, transparent 90%)' }} />

        <Box sx={{ position: 'absolute', inset: 0, background: loading ? 'rgba(226, 232, 240, 0.4)' : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0) 100%)', maskImage: 'linear-gradient(to bottom, black 0%, black 20%, rgba(0,0,0,0.3) 60%, transparent 90%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 20%, rgba(0,0,0,0.3) 60%, transparent 90%)', pointerEvents: 'none' }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pb: { xs: 6, md: 10 }, px: { xs: 3, md: 5 }, ...contentSx }}>
          {!hideContent && (
            loading ? (
              <Box sx={{ maxWidth: '1200px', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2.5, md: 4 }, flexDirection: { xs: 'column', md: 'row' }, textAlign: { xs: 'center', md: 'left' } }}>
                  {!hideAvatar && (
                    <Box component={motion.div} style={{ opacity: logoOpacity }} sx={{ borderRadius: '50%', border: '2px solid rgba(0,86,179,0.3)', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Skeleton variant="circular" sx={{ width: { xs: 76, md: 92 }, height: { xs: 76, md: 92 } }} />
                    </Box>
                  )}
                  <Box component={motion.div} style={{ opacity: textOpacity }} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', maxWidth: 420 }}>
                    <Skeleton variant="rounded" width="280px" sx={{ height: 32, mb: 2, maxWidth: '100%' }} />
                    <Skeleton variant="rounded" width="180px" sx={{ height: 32, maxWidth: '80%' }} />
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box ref={textRef} sx={{ maxWidth: '1200px', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2.5, md: 4 }, flexDirection: { xs: 'column', md: 'row' }, textAlign: { xs: 'center', md: 'left' } }}>
                  {!hideAvatar && (
                    <Box component={motion.div} style={{ opacity: logoOpacity }} sx={{ borderRadius: '50%', border: '2px solid #0056b3', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Avatar src={avatarUrl} alt={title} sx={{ width: { xs: 76, md: 92 }, height: { xs: 76, md: 92 }, bgcolor: '#ffffff', color: '#0056b3', fontWeight: 900, fontSize: { xs: 32, md: 42 } }}>{String(title).charAt(0)}</Avatar>
                    </Box>
                  )}

                  <Box component={motion.div} style={{ opacity: textOpacity }} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                    <Typography variant="h1" sx={{ fontFamily: "'Rozha One', serif", fontSize: { xs: '2rem', md: '3.25rem' }, lineHeight: 1.1, background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0px 4px 15px rgba(255, 255, 255, 0.05)', m: 0, py: '0.15em', letterSpacing: 0, overflowWrap: 'anywhere' }}>{title}</Typography>

                    {subtitle && (
                      <Typography variant="h2" sx={{ fontFamily: "'Rozha One', serif", fontSize: { xs: '2rem', md: '3.25rem' }, lineHeight: 1.1, background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0px 4px 15px rgba(255, 255, 255, 0.05)', m: 0, mt: '-0.2em', py: '0.15em', letterSpacing: 0, overflowWrap: 'anywhere' }}>{subtitle}</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )
          )}
        </Container>
      </Box>

      {showSpacer && <Box ref={spacerRef} sx={{ width: '100%', height: HERO_HEIGHT, minHeight: HERO_MIN_HEIGHT, mb: { xs: -8, md: -16 } }} />}
    </>
  );
}
