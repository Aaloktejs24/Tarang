import React from "react";
import { Box, Typography, Paper, Chip } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import mockData from '../../data/dashboardMockData.json';
const { dashboardMockData: dashboardMockData } = mockData;
const { subjects, recentActivity } = dashboardMockData;

export default function Progress() {
  const avg = Math.round(subjects.reduce((s, x) => s + x.score, 0) / subjects.length);
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <TrendingUpIcon sx={{ fontSize: 32, color: "#28a745" }} />
        <Typography variant="h5" fontWeight="bold" color="#0056b3">आपकी प्रगति</Typography>
        <Chip label={`औसत: ${avg}%`} sx={{ ml: "auto", bgcolor: avg >= 80 ? "#28a74520" : "#f39c1220", color: avg >= 80 ? "#28a745" : "#f39c12", fontWeight: "bold" }} />
      </Box>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: "8px", border: "1px solid #e0e0e0", flex: 1, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" color="#0056b3">{avg}%</Typography>
          <Typography fontSize={12} color="text.secondary">कुल औसत</Typography>
        </Paper>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: "8px", border: "1px solid #e0e0e0", flex: 1, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" color="#28a745">4</Typography>
          <Typography fontSize={12} color="text.secondary">पूरे किए टास्क</Typography>
        </Paper>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: "8px", border: "1px solid #e0e0e0", flex: 1, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" color="#f39c12">12</Typography>
          <Typography fontSize={12} color="text.secondary">लर्निंग स्ट्रीक</Typography>
        </Paper>
      </Box>
      <Paper elevation={0} sx={{ p: 3, borderRadius: "8px", border: "1px solid #e0e0e0", mb: 3 }}>
        <Typography fontWeight="bold" mb={2}>विषयवार प्रदर्शन</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {subjects.map(s => (
            <Box key={s.name}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography fontSize={13} fontWeight="bold">{s.name}</Typography>
                <Typography fontSize={13} color="text.secondary">{s.score}% / लक्ष्य {s.target}%</Typography>
              </Box>
              
            </Box>
          ))}
        </Box>
      </Paper>
      <Paper elevation={0} sx={{ p: 3, borderRadius: "8px", border: "1px solid #e0e0e0" }}>
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
