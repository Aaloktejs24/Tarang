"use client";

import React, { forwardRef } from 'react';
import { Box, Portal } from '@mui/material';

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
    <Portal>
      <Box
        ref={ref}
        onClick={onClick}
        aria-hidden={!open}
        {...other}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: zIndex,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 86, 179, 0.1)",
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          padding: "16px",
          overflow: "auto",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
          WebkitTransform: "translateZ(0)",
          willChange: "opacity"
        }}
        sx={other.sx}
      >
        {children}
      </Box>
    </Portal>
  );
});

export default BackdropBlur;
