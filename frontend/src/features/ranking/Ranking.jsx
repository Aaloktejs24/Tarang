import React from "react";
import { Box, Typography, Paper, Avatar, Chip, Divider } from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";

import mockData from '../../data/dashboardMockData.json';
const { dashboardMockData: dashboardMockData } = mockData;
const { rankings } = dashboardMockData;

const subjectColors = { "भौतिकी": "#0056b3", "गणित": "#28a745", "रसायन": "#f39c12", "जीव विज्ञान": "#e74c3c" };
const changeColor = (c) => c.startsWith("+") ? "#28a745" : c === "0" ? "#999" : "#e74c3c";

export default function Ranking() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <SortIcon sx={{ fontSize: 32, color: "#FF8C00" }} />
        <Typography variant="h5" fontWeight="bold" color="#0056b3">क्रमबद्धता रैंकिंग</Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {rankings.map(s => (
          <Paper key={s.rank} elevation={0} sx={{ p: 2, borderRadius: "8px", border: s.isMe ? "2px solid #0056b3" : "1px solid #e0e0e0", bgcolor: s.isMe ? "#f0f6ff" : "white", display: "flex", alignItems: "center", gap: 2 }}>
            <Typography fontWeight="bold" fontSize={15} color={s.rank <= 3 ? "#FFD700" : "#999"} sx={{ width: 28, textAlign: "center" }}>#{s.rank}</Typography>
            <Avatar sx={{ width: 40, height: 40, bgcolor: subjectColors[s.subject] || "#666", color: "white", fontSize: 14, fontWeight: "bold" }}>{s.name[0]}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography fontWeight="bold" fontSize={14}>{s.name}</Typography>
                {s.isMe && <Chip label="आप" size="small" sx={{ bgcolor: "#0056b3", color: "white", fontSize: 10, height: 18 }} />}
              </Box>
              <Chip label={s.subject} size="small" sx={{ bgcolor: `${subjectColors[s.subject]}15`, color: subjectColors[s.subject], fontSize: 11, mt: 0.3 }} />
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography fontWeight="bold" color="#0056b3" fontSize={15}>{s.score}%</Typography>
              <Typography fontSize={12} color={changeColor(s.change)} fontWeight="bold">{s.change !== "0" ? s.change : "—"}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
