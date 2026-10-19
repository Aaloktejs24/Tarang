"use client";
import React, { useState } from 'react';
import { Box, Typography, Breadcrumbs } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SvgIcon from '@mui/material/SvgIcon';
import Link from 'next/link';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { motion, AnimatePresence } from 'framer-motion';

function CompassNeedleIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M14.19 14.19L6 18l3.81-8.19L18 6l-3.81 8.19z M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1z" />
    </SvgIcon>
  );
}

export default function ProjectBreadcrumbs({ items = [], floating = true, sx = {}, style = {} }) {
  const { language } = useAccessibility();
  const [expanded, setExpanded] = useState(false);

  if (!items || items.length === 0) return null;

  const baseFloatingSx = {
    position: 'fixed',
    top: { xs: 88, md: 96 },
    left: { xs: 24, md: 40 },
    zIndex: 'var(--z-sticky)',
    background: "var(--card-bg)",
    backdropFilter: "var(--card-blur)",
    WebkitBackdropFilter: "var(--card-blur)",
    borderRadius: '50px',
    border: "var(--border-thin) solid var(--card-border)",
    display: 'flex',
    alignItems: 'center',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden',
    height: '42px',
    padding: '4px',
    cursor: 'pointer'
  };

  // If floating, merge floating styles with sx. Otherwise just use sx.
  const wrapperSx = floating ? { ...baseFloatingSx, ...sx } : { ...sx };

  return (
    <Box
      component={motion.div}
      layout
      sx={wrapperSx}
      style={style}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onClick={() => setExpanded(!expanded)}
      initial={false}
      animate={{
        width: expanded ? "auto" : "42px",
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <AnimatePresence mode="wait">
        {!expanded ? (
          <Box
            component={motion.div}
            key="icon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
          >
            <CompassNeedleIcon sx={{ color: 'var(--color-primary)', fontSize: 32 }} />
          </Box>
        ) : (
          <Box
            component={motion.div}
            key="breadcrumbs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            sx={{ minWidth: 'max-content', pl: 1, pr: 1.5 }}
          >
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" sx={{ color: 'var(--color-slate-500)' }} />}
              aria-label="breadcrumb"
              sx={{
                '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' },
                '& .MuiBreadcrumbs-separator': { color: 'var(--color-slate-500)', mx: 0, display: 'flex', alignItems: 'center' },
                '& .MuiBreadcrumbs-li': { display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }
              }}
            >
              {items.map((crumb, index) => {
                const isLast = index === items.length - 1;
                const displayLabel = crumb.label || (language === 'en' ? crumb.labelEn : crumb.labelHi);

                // Render active item (last item)
                if (isLast) {
                  return (
                    <Typography key={index} sx={{ color: 'var(--color-slate-900)', fontWeight: 700, fontSize: 'var(--font-sm, 14px)', whiteSpace: 'nowrap' }}>
                      {displayLabel}
                    </Typography>
                  );
                }

                // Link styling
                const linkSx = {
                  color: 'var(--color-slate-900)',
                  fontWeight: 'var(--font-medium, 500)',
                  fontSize: 'var(--font-sm, 14px)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  '&:hover': { color: 'var(--color-primary)' }
                };

                // Render clickable items
                if (crumb.onClick) {
                  return (
                    <Typography
                      key={index}
                      onClick={crumb.onClick}
                      sx={linkSx}
                    >
                      {displayLabel}
                    </Typography>
                  );
                }

                if (crumb.href || crumb.path) {
                  return (
                    <Typography
                      key={index}
                      component={Link}
                      href={crumb.href || crumb.path}
                      sx={linkSx}
                    >
                      {displayLabel}
                    </Typography>
                  );
                }

                // Fallback if not clickable
                return (
                  <Typography key={index} sx={linkSx}>
                    {displayLabel}
                  </Typography>
                );
              })}
            </Breadcrumbs>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
}
