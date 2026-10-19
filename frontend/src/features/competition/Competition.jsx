import React from "react";
import { Box, Typography, Paper, Chip, Button, LinearProgress } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FlagIcon from "@mui/icons-material/Flag";

import mockData from '../../data/dashboardMockData.json';
const { dashboardMockData: dashboardMockData } = mockData;
const { competitions } = dashboardMockData;

const statusColors = { active: "#28a745", upcoming: "#f39c12", closed: "#6c757d" };
const statusLabels = { active: "चल रहा है", upcoming: "जल्द आ रहा है", closed: "बंद" };

export default function Competition() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <FlagIcon sx={{ fontSize: 28, color: "#6c757d" }} />
        <Typography variant="h5" fontWeight="bold" color="#0056b3">प्रतियोगिताएँ</Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {competitions.map(c => (
          <Paper key={c.id} elevation={0} sx={{ p: 3, borderRadius: "8px", border: "1px solid #e0e0e0", "&:hover": { borderColor: "#0056b3" }, transition: "all 0.2s" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box>
                <Typography fontWeight="bold" fontSize={16} mb={0.5}>{c.title}</Typography>
                <Chip label={c.subject} size="small" sx={{ bgcolor: "#f0f6ff", color: "#0056b3", fontWeight: "bold" }} />
              </Box>
              <Chip label={statusLabels[c.status]} sx={{ bgcolor: `${statusColors[c.status]}20`, color: statusColors[c.status], fontWeight: "bold" }} />
            </Box>
            <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <CalendarTodayIcon fontSize="small" sx={{ color: "#e74c3c" }} />
                <Typography fontSize={13} color="text.secondary">अंतिम तारीख: {c.deadline}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <EmojiEventsIcon fontSize="small" sx={{ color: "#FFD700" }} />
                <Typography fontSize={13} color="text.secondary">पुरस्कार: {c.prize}</Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography fontSize={12} color="text.secondary">{c.participants} प्रतिभागी</Typography>
                <Typography fontSize={12} color="text.secondary">{c.seats} सीटें शेष</Typography>
              </Box>
              <LinearProgress variant="determinate" value={Math.min(100, (c.participants / (c.participants + c.seats)) * 100)} sx={{ height: 6, borderRadius: "8px", bgcolor: "#f0f0f0", "& .MuiLinearProgress-bar": { bgcolor: "#0056b3", borderRadius: "8px" } }} />
            </Box>
            <Button variant="contained" disableElevation size="small" disabled={c.status === "closed"} sx={{ borderRadius: "8px", bgcolor: "#0056b3", "&:hover": { bgcolor: "#004494" }, textTransform: "none", fontWeight: "bold" }}>
              {c.status === "closed" ? "बंद" : "अभी आवेदन करें"}
            </Button>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
