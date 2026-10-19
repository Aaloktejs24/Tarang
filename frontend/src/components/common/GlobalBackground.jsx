"use client";

import React from 'react';
import { Box } from '@mui/material';

export default function GlobalBackground() {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: -9999,
        background: `
          radial-gradient(ellipse at 0% 0%, rgba(0, 86, 179, 0.35) 0%, rgba(0, 86, 179, 0) 80%), 
          radial-gradient(ellipse at 100% 0%, rgba(40, 167, 69, 0.25) 0%, rgba(40, 167, 69, 0) 80%), 
          radial-gradient(ellipse at 100% 100%, rgba(40, 167, 69, 0.2) 0%, rgba(40, 167, 69, 0) 80%),
          radial-gradient(ellipse at 0% 100%, rgba(0, 86, 179, 0.2) 0%, rgba(0, 86, 179, 0) 80%),
          #f1f5f9
        `
      }}
    >
      {/* Subtle center fill so mid-screen doesn't look empty on phones */}
      <Box sx={{
        position: "absolute", borderRadius: 'var(--radius-full)', pointerEvents: "none",
        width: "var(--size-full)", height: "var(--size-full)",
        top: 0, left: 0,
        background: "radial-gradient(ellipse at 50% 50%, rgba(120, 160, 220, 0.06) 0%, transparent 70%)",
      }} />
      {/* Combined Dot Grid and Varnmala Pattern Overlay */}
      <Box sx={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1,
        pointerEvents: "none",
        backgroundImage: "radial-gradient(circle at 2px 2px, rgba(15, 23, 42, 0.09) 1.5px, transparent 0)",
        backgroundSize: "20px 20px",
      }}>
        <svg width="100%" height="100%">
          <pattern id="varnmala-pattern" x="0" y="0" width="240" height="240" patternUnits="userSpaceOnUse">
            <g fill="rgba(15, 23, 42, 0.09)" fontSize="24" fontFamily="sans-serif">
              {/* Row 1 */}
              <text x="40" y="20" transform="rotate(-5 40 20)">क</text>
              <text x="120" y="20" transform="rotate(10 120 20)">அ</text>
              <text x="200" y="20" transform="rotate(-15 200 20)">∑</text>
              {/* Row 2 */}
              <text x="0" y="60" transform="rotate(5 0 60)">అ</text>
              <text x="80" y="60" transform="rotate(-10 80 60)">π</text>
              <text x="160" y="60" transform="rotate(15 160 60)">അ</text>
              {/* Row 3 */}
              <text x="40" y="100" transform="rotate(10 40 100)">∫</text>
              <text x="120" y="100" transform="rotate(-5 120 100)">ਕ</text>
              <text x="200" y="100" transform="rotate(15 200 100)">জ্ঞ</text>
              {/* Row 4 */}
              <text x="0" y="140" transform="rotate(-15 0 140)">∞</text>
              <text x="80" y="140" transform="rotate(5 80 140)">খ</text>
              <text x="160" y="140" transform="rotate(-10 160 140)">√</text>
              {/* Row 5 */}
              <text x="40" y="180" transform="rotate(-10 40 180)">Δ</text>
              <text x="120" y="180" transform="rotate(15 120 180)">ങ</text>
              <text x="200" y="180" transform="rotate(-5 200 180)">Ω</text>
              {/* Row 6 */}
              <text x="0" y="220" transform="rotate(10 0 220)">ਖ</text>
              <text x="80" y="220" transform="rotate(-15 80 220)">λ</text>
              <text x="160" y="220" transform="rotate(5 160 220)">த</text>
            </g>
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#varnmala-pattern)" />
        </svg>
      </Box>
    </Box>
  );
}
