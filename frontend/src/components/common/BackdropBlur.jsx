"use client";

import React, { forwardRef } from 'react';
import { Box } from '@mui/material';

/**
 * A reusable full-screen frosted-glass backdrop.
 * Uses CSS opacity transition for smooth fade-in/out instead of abrupt mount/unmount.
 *
 * Props:
 *  - open {boolean}   — controls visibility (default: true)
 *  - zIndex {number}  — stacking order (default: 1200)
 *  - onClick          — click handler (e.g. close on backdrop click)
 *  - sx               — additional MUI sx overrides
 */
const BackdropBlur = forwardRef(function BackdropBlur(props, ref) {
  const { children, onClick, zIndex = 1200, open = true, ...other } = props;

  return (
    <Box
      ref={ref}
      onClick={onClick}
      aria-hidden={!open}
      {...other}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: zIndex,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: `
          radial-gradient(circle at 15% 15%, rgba(0, 86, 179, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 85% 85%, rgba(40, 167, 69, 0.12) 0%, transparent 60%),
          rgba(255, 255, 255, 0.15)
        `,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        transform: "translateZ(0)",
        p: 2,
        overflow: "auto",
        // Smooth fade instead of abrupt null-return
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.2s ease",
        ...other.sx,
      }}
    >
      {children}
    </Box>
  );
});

export default BackdropBlur;
