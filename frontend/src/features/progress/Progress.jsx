import React from "react";
import { Box, Typography, Paper, Chip, LinearProgress } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import mockData from '../../data/dashboardMockData.json';
const { dashboardMockData: dashboardMockData } = mockData;
const { subjects, recentActivity } = dashboardMockData;

export default function Progress() {
  const avg = Math.round(subjects.reduce((s, x) => s + x.score, 0) / subjects.length);
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <TrendingUpIcon sx={{ fontSize: 32, color: "var(--color-success)" }} />
        <Typography variant="h5" fontWeight="bold" color="var(--color-primary)">आपकी प्रगति</Typography>
        <Chip label={`औसत: ${avg}%`} sx={{ ml: "auto", bgcolor: avg >= 80 ? "color-mix(in srgb, var(--color-success) var(--opacity-sm), transparent)" : "color-mix(in srgb, #f39c12 var(--opacity-sm), transparent)", color: avg >= 80 ? "var(--color-success)" : "var(--color-warning)", fontWeight: "var(--font-bold)" }} />
      </Box>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 'var(--radius-md)', border: "var(--border-thin) solid #e2e8f0", flex: 1, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" color="var(--color-primary)">{avg}%</Typography>
          <Typography fontSize={12} color="text.secondary">कुल औसत</Typography>
        </Paper>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 'var(--radius-md)', border: "var(--border-thin) solid #e2e8f0", flex: 1, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" color="var(--color-success)">4</Typography>
          <Typography fontSize={12} color="text.secondary">पूरे किए टास्क</Typography>
        </Paper>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 'var(--radius-md)', border: "var(--border-thin) solid #e2e8f0", flex: 1, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" color="var(--color-warning)">12</Typography>
          <Typography fontSize={12} color="text.secondary">लर्निंग स्ट्रीक</Typography>
        </Paper>
      </Box>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 'var(--radius-md)', border: "var(--border-thin) solid #e2e8f0", mb: 3 }}>
        <Typography fontWeight="bold" mb={2}>विषयवार प्रदर्शन</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {subjects.map(s => (
            <Box key={s.name}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography fontSize={13} fontWeight="bold">{s.name}</Typography>
                <Typography fontSize={13} color="text.secondary">{s.score}% / लक्ष्य {s.target}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={s.score} sx={{ height: 6, borderRadius: 3, bgcolor: "var(--color-slate-100)", "& .MuiLinearProgress-bar": { bgcolor: s.score >= s.target ? "var(--color-success)" : "var(--color-primary)", borderRadius: 3 } }} />
            </Box>
          ))}
        </Box>
      </Paper>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 'var(--radius-md)', border: "var(--border-thin) solid #e2e8f0" }}>
        <Typography fontWeight="bold" mb={2}>हाल की गतिविधि</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {recentActivity.map((a, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography fontSize={20}>{a.icon}</Typography>
              <Box sx={{ flex: 1 }}>
                <Typography fontSize={13}>{a.desc}</Typography>
                <Typography fontSize={11} color="text.secondary">{a.time}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
