import React from "react";
import { Box, Typography, Paper, Avatar, Chip } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import mockData from '../../data/dashboardMockData.json';
const { dashboardMockData: dashboardMockData } = mockData;
const { students } = dashboardMockData;

const medalColors = { gold: "#FFD700", silver: "#C0C0C0", bronze: "#CD7F32" };

export default function Leaderboard() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <EmojiEventsIcon sx={{ fontSize: 32, color: "#FFD700" }} />
        <Typography variant="h5" fontWeight="bold" color="#0056b3">उत्कृष्ठता तालिका</Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {students.map(s => (
          <Paper key={s.rank} elevation={0} sx={{ p: 2, borderRadius: "8px", border: s.isMe ? "2px solid #0056b3" : "1px solid #e0e0e0", bgcolor: s.isMe ? "#f0f6ff" : "white", display: "flex", alignItems: "center", gap: 2 }}>
            <Typography fontWeight="bold" fontSize={16} sx={{ width: 30, textAlign: "center", color: s.badge ? medalColors[s.badge] : "#666" }}>
              {s.badge ? <EmojiEventsIcon sx={{ fontSize: 22, color: medalColors[s.badge] }} /> : `#${s.rank}`}
            </Typography>
            <Avatar sx={{ width: 40, height: 40, bgcolor: s.isMe ? "#0056b3" : "#e0e0e0", color: s.isMe ? "white" : "#666", fontWeight: "bold" }}>{s.name[0]}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography fontWeight="bold" fontSize={14}>{s.name}</Typography>
                {s.isMe && <Chip label="आप" size="small" sx={{ bgcolor: "#0056b3", color: "white", fontSize: 10, height: 18 }} />}
              </Box>
              <Typography fontSize={12} color="text.secondary">{s.institute}</Typography>
            </Box>
            <Typography fontWeight="bold" color="#0056b3" fontSize={16}>{s.score.toLocaleString("hi-IN")}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
