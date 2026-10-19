import React from "react";
import { Box, Typography, Paper, Chip, Avatar } from "@mui/material";
import PollIcon from "@mui/icons-material/Poll";

import mockData from '../../data/dashboardMockData.json';
const { dashboardMockData: dashboardMockData } = mockData;
const { results } = dashboardMockData;

const gradeColors = { "A+": "#28a745", "A": "#0056b3", "B+": "#17a2b8", "B": "#f39c12" };

export default function Results() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <PollIcon sx={{ fontSize: 32, color: "#17a2b8" }} />
        <Typography variant="h5" fontWeight="bold" color="#0056b3">परिणाम</Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {results.map(r => (
          <Paper key={r.id} elevation={0} sx={{ p: 3, borderRadius: "8px", border: `1px solid ${r.color}20`, "&:hover": { borderColor: r.color }, transition: "all 0.2s" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ width: 52, height: 52, bgcolor: gradeColors[r.grade] || "#666", fontSize: 18, fontWeight: "bold" }}>{r.grade}</Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight="bold" fontSize={15}>{r.title}</Typography>
                <Typography fontSize={12} color="text.secondary" mb={1}>📅 {r.date}</Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Typography fontSize={13} fontWeight="bold" color={gradeColors[r.grade] || "#666"}>{r.score}/{r.total} अंक</Typography>
                  <Chip label={`रैंक #${r.rank}`} size="small" sx={{ bgcolor: "#f0f0f0", color: "#666", fontSize: 11 }} />
                  <Chip label={`${Math.round((r.score / r.total) * 100)}%`} size="small" sx={{ bgcolor: `${gradeColors[r.grade] || "#666"}20`, color: gradeColors[r.grade] || "#666", fontWeight: "bold", fontSize: 11 }} />
                </Box>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
