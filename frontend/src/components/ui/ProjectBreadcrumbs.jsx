"use client";
import React from 'react';
import { Box, Typography, Breadcrumbs } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Link from 'next/link';
import { useAccessibility } from '../../contexts/AccessibilityContext';

export default function ProjectBreadcrumbs({ items = [], floating = true, sx = {}, style = {} }) {
  const { language } = useAccessibility();

  if (!items || items.length === 0) return null;

  const baseFloatingSx = {
    position: 'fixed',
    top: { xs: 88, md: 96 },
    left: { xs: 24, md: 40 },
    zIndex: 10,
    background: "rgba(255, 255, 255, 0.65)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    padding: "6px 16px",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  };

  // If floating, merge floating styles with sx. Otherwise just use sx.
  const wrapperSx = floating ? { ...baseFloatingSx, ...sx } : { ...sx };

  return (
    <Box sx={wrapperSx} style={style}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: '#64748b' }} />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': { color: '#64748b', mx: 0 },
          '& .MuiBreadcrumbs-li': { display: 'flex', alignItems: 'center' }
        }}
      >
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;
          const displayLabel = crumb.label || (language === 'en' ? crumb.labelEn : crumb.labelHi);

          // Render active item (last item)
          if (isLast) {
            return (
              <Typography key={index} sx={{ color: '#000', fontWeight: 900, fontSize: "0.95rem" }}>
                {displayLabel}
              </Typography>
            );
          }

          // Link styling
          const linkSx = {
            color: '#0f172a',
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            '&:hover': { color: '#0056b3' }
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
  );
}
