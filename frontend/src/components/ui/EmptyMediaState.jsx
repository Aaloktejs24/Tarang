import React from "react";
import { Box, Typography, Button } from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";

/**
 * EmptyMediaState
 * Tarang theme ke CSS variables se bana empty-state illustration + message.
 *
 * Props:
 *  - message      : main text (default: "No content uploaded for this topic.")
 *  - description  : optional chhota sa helper text
 *  - actionLabel  : optional button label (e.g. "Upload media")
 *  - onAction     : button click handler
 *  - maxWidth     : illustration ki max width (default 360)
 */

// Theme tokens (fallback values ke saath, taaki variable na mile to bhi sahi dikhe)
const T = {
  blue: "var(--theme-blue, #0056b3)",
  blueHover: "var(--theme-blue-hover, #004494)",
  green: "var(--theme-green, #28a745)",
  yellow: "var(--theme-yellow, #ffc107)",
  slate50: "var(--color-slate-50, #f8fafc)",
  slate300: "var(--color-slate-300, #cbd5e1)",
  slate400: "var(--color-slate-400, #94a3b8)",
  slate500: "var(--color-slate-500, #64748b)",
  slate800: "var(--color-slate-800, #1e293b)",
  card: "var(--card-bg, #ffffff)",
};

// color-mix se brand colors ke soft tints
const tint = (color, pct) =>
  `color-mix(in srgb, ${color} ${pct}%, transparent)`;

const svgSx = {
  width: "100%",
  height: "auto",
  display: "block",
  "& .blob-lg": { fill: tint(T.blue, 7) },
  "& .blob-sm": { fill: tint(T.blue, 12) },
  "& .ground": { fill: tint(T.slate500, 18) },
  "& .card-back-green": { fill: tint(T.green, 20) },
  "& .card-back-blue": { fill: tint(T.blue, 16) },
  "& .card-front": { fill: T.card, stroke: T.slate300, strokeWidth: 2 },
  "& .card-header": { fill: T.slate50 },
  "& .dot": { fill: T.slate300 },
  "& .ring": {
    fill: tint(T.blue, 8),
    stroke: tint(T.blue, 45),
    strokeWidth: 2,
    strokeDasharray: "6 6",
  },
  "& .play": {
    fill: T.blue,
    stroke: T.blue,
    strokeWidth: 4,
    strokeLinejoin: "round",
  },
  "& .line-1": { fill: tint(T.slate300, 70) },
  "& .line-2": { fill: tint(T.slate300, 40) },
  "& .lens": {
    fill: tint(T.card, 70),
    stroke: T.slate500,
    strokeWidth: 9,
  },
  "& .handle": {
    stroke: T.slate500,
    strokeWidth: 12,
    strokeLinecap: "round",
  },
  "& .lens-face": {
    fill: "none",
    stroke: T.slate400,
    strokeWidth: 4,
    strokeLinecap: "round",
  },
  "& .lens-eye": { fill: T.slate400 },
  "& .stem": {
    fill: "none",
    stroke: T.green,
    strokeWidth: 5,
    strokeLinecap: "round",
    opacity: 0.75,
  },
  "& .leaf-a": { fill: tint(T.green, 55) },
  "& .leaf-b": { fill: tint(T.green, 38) },
  "& .leaf-c": { fill: tint(T.green, 70) },
  "& .pot": { fill: T.slate400 },
  "& .glyph-blue": { fill: tint(T.blue, 38), fontWeight: 600 },
  "& .glyph-green": { fill: tint(T.green, 45), fontWeight: 600 },
  "& .spark-yellow": { fill: tint(T.yellow, 80) },
  "& .spark-blue": { fill: tint(T.blue, 25) },
  "& .spark-green": { fill: tint(T.green, 35) },
  "& .cloud": { fill: T.card, opacity: 0.85 },
};

export function EmptyMediaIllustration({ maxWidth = 360 }) {
  return (
    <Box sx={{ width: "100%", maxWidth }}>
      <Box
        component="svg"
        viewBox="0 0 680 440"
        role="img"
        aria-label="Empty media illustration"
        sx={svgSx}
      >
        {/* background blobs */}
        <ellipse className="blob-lg" cx="340" cy="225" rx="215" ry="170" />
        <ellipse className="blob-sm" cx="340" cy="225" rx="150" ry="120" />
        <ellipse className="ground" cx="340" cy="382" rx="170" ry="14" />

        {/* stacked cards behind */}
        <g transform="rotate(-7 300 220)">
          <rect className="card-back-green" x="196" y="128" width="250" height="170" rx="16" />
        </g>
        <g transform="rotate(6 380 220)">
          <rect className="card-back-blue" x="236" y="120" width="250" height="170" rx="16" />
        </g>

        {/* front media card */}
        <rect className="card-front" x="215" y="115" width="250" height="175" rx="16" />
        <rect className="card-header" x="215" y="115" width="250" height="28" rx="16" />
        <rect className="card-header" x="215" y="130" width="250" height="13" />
        <circle className="dot" cx="234" cy="129" r="4.5" />
        <circle className="dot" cx="250" cy="129" r="4.5" />
        <circle className="dot" cx="266" cy="129" r="4.5" />

        {/* play button */}
        <circle className="ring" cx="340" cy="212" r="42" />
        <path className="play" d="M330 194 L330 230 L359 212 Z" />

        {/* caption lines */}
        <rect className="line-1" x="245" y="262" width="150" height="8" rx="4" />
        <rect className="line-2" x="245" y="276" width="90" height="8" rx="4" />

        {/* magnifier */}
        <circle className="lens" cx="447" cy="300" r="34" />
        <line className="handle" x1="472" y1="326" x2="506" y2="362" />
        <path className="lens-face" d="M434 296 Q447 284 460 296" />
        <circle className="lens-eye" cx="440" cy="307" r="3" />
        <circle className="lens-eye" cx="454" cy="307" r="3" />

        {/* plant */}
        <path className="stem" d="M150 380 Q146 330 168 300" />
        <path className="leaf-a" d="M168 300 Q200 296 204 270 Q172 270 168 300 Z" />
        <path className="leaf-b" d="M153 345 Q120 342 114 316 Q146 316 153 345 Z" />
        <path className="leaf-c" d="M158 328 Q184 322 190 302 Q164 304 158 328 Z" />
        <rect className="pot" x="128" y="372" width="48" height="12" rx="5" />

        {/* floating Devanagari letters */}
        <text className="glyph-blue" x="108" y="158" fontSize="34">अ</text>
        <text className="glyph-green" x="522" y="168" fontSize="30">क</text>
        <text className="glyph-blue" x="552" y="262" fontSize="24">ज्ञ</text>

        {/* sparkles */}
        <path className="spark-yellow" d="M560 96 L564 108 L576 112 L564 116 L560 128 L556 116 L544 112 L556 108 Z" />
        <path className="spark-green" d="M118 232 L121 240 L129 243 L121 246 L118 254 L115 246 L107 243 L115 240 Z" />
        <path className="spark-yellow" d="M300 66 L302 72 L308 74 L302 76 L300 82 L298 76 L292 74 L298 72 Z" />
        <circle className="spark-blue" cx="498" cy="86" r="5" />
        <circle className="spark-green" cx="178" cy="92" r="4" />
        <circle className="spark-yellow" cx="598" cy="210" r="4" />

        {/* small cloud */}
        <g className="cloud">
          <ellipse cx="528" cy="334" rx="30" ry="9" />
          <ellipse cx="548" cy="327" rx="18" ry="8" />
        </g>
      </Box>
    </Box>
  );
}

export default function EmptyMediaState({
  message = "No content uploaded for this topic.",
  description,
  actionLabel,
  onAction,
  maxWidth = 360,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 1.5,
        py: { xs: 4, md: 6 },
        px: 2,
        minHeight: 360,
        height: '100%',
        flex: 1,
      }}
    >
      <EmptyMediaIllustration maxWidth={maxWidth} />

      <Typography
        variant="h6"
        sx={{
          color: T.slate800,
          fontWeight: 600,
          maxWidth: 480,
          mt: -1,
        }}
      >
        {message}
      </Typography>

      {description && (
        <Typography
          variant="body2"
          sx={{ color: T.slate500, maxWidth: 420 }}
        >
          {description}
        </Typography>
      )}

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          startIcon={<FileUploadOutlinedIcon />}
          sx={{
            mt: 1,
            px: 2.5,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            color: "#fff",
            backgroundColor: T.blue,
            borderRadius: "var(--radius-lg, 12px)",
            boxShadow: "var(--shadow-md)",
            "&:hover": { backgroundColor: T.blueHover },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
