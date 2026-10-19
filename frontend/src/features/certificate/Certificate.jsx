import React from "react";
import { Box, Typography, Paper, Chip, Button } from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import DownloadIcon from "@mui/icons-material/Download";

import mockData from '../../data/dashboardMockData.json';
const { dashboardMockData: dashboardMockData } = mockData;
const { certificates } = dashboardMockData;

export default function Certificate() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <WorkspacePremiumIcon sx={{ fontSize: 32, color: "#f39c12" }} />
        <Typography variant="h5" fontWeight="bold" color="#0056b3">आपके प्रमाण-पत्र</Typography>
        <Chip label={`${certificates.length} प्रमाण-पत्र`} sx={{ ml: "auto", bgcolor: "#f39c1220", color: "#f39c12", fontWeight: "bold" }} />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {certificates.map(c => (
          <Paper key={c.id} elevation={0} sx={{ p: 3, borderRadius: "8px", border: `1px solid ${c.color}30`, background: `linear-gradient(135deg, ${c.color}05 0%, white 60%)` }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <Box sx={{ width: 52, height: 52, borderRadius: "8px", bgcolor: `${c.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <WorkspacePremiumIcon sx={{ color: c.color, fontSize: 28 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography fontWeight="bold" fontSize={15}>{c.title}</Typography>
                    <Typography fontSize={12} color="text.secondary" mb={1}>{c.issuer} • {c.date}</Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Chip label={c.type} size="small" sx={{ bgcolor: `${c.color}20`, color: c.color, fontWeight: "bold", fontSize: 11 }} />
                      <Chip label={c.score} size="small" sx={{ bgcolor: "#f0f0f0", color: "#666", fontSize: 11 }} />
                    </Box>
                  </Box>
                  <Button startIcon={<DownloadIcon />} size="small" variant="outlined" sx={{ borderColor: c.color, color: c.color, "&:hover": { bgcolor: `${c.color}10` }, borderRadius: "8px", textTransform: "none", fontWeight: "bold", whiteSpace: "nowrap" }}>
                    डाउनलोड
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}