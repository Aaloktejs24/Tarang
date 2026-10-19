import React from "react";
import { Box, Typography, Paper, Chip, IconButton } from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ArticleIcon from "@mui/icons-material/Article";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import mockData from '../../data/dashboardMockData.json';
const { dashboardMockData: dashboardMockData } = mockData;
const { savedItems } = dashboardMockData;

const typeConfig = {
  video: { label: "वीडियो", color: "#e74c3c", icon: <PlayCircleOutlineIcon fontSize="small" /> },
  document: { label: "दस्तावेज़", color: "#0056b3", icon: <ArticleIcon fontSize="small" /> },
  audio: { label: "ऑडियो", color: "#8e44ad", icon: <AudiotrackIcon fontSize="small" /> },
  article: { label: "लेख", color: "#28a745", icon: <ArticleIcon fontSize="small" /> },
};

export default function SavedContent() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <BookmarkIcon sx={{ fontSize: 32, color: "#FF6347" }} />
        <Typography variant="h5" fontWeight="bold" color="#0056b3">सहेजी सामग्री</Typography>
        <Chip label={`${savedItems.length} आइटम`} sx={{ ml: "auto", bgcolor: "#FF634720", color: "#FF6347", fontWeight: "bold" }} />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {savedItems.map(item => {
          const cfg = typeConfig[item.type];
          return (
            <Paper key={item.id} elevation={0} sx={{ p: 2.5, borderRadius: "8px", border: "1px solid #e0e0e0", display: "flex", alignItems: "center", gap: 2, "&:hover": { borderColor: "#0056b3" }, transition: "all 0.2s", cursor: "pointer" }}>
              <Box sx={{ width: 48, height: 48, borderRadius: "8px", bgcolor: `${cfg.color}20`, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color, flexShrink: 0 }}>
                {cfg.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight="bold" fontSize={14} mb={0.5}>{item.title}</Typography>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <Chip label={cfg.label} size="small" sx={{ bgcolor: `${cfg.color}15`, color: cfg.color, fontWeight: "bold", fontSize: 11 }} />
                  <Typography fontSize={11} color="text.secondary">📚 {item.subject}</Typography>
                  <Typography fontSize={11} color="text.secondary">⏱ {item.duration}</Typography>
                  <Typography fontSize={11} color="text.secondary">{item.savedOn}</Typography>
                </Box>
              </Box>
              <IconButton size="small" sx={{ color: "#ccc", "&:hover": { color: "#e74c3c" } }}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
