"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EmptyState from "../../components/ui/EmptyState";

export default function Leaderboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <EmojiEventsIcon sx={{ fontSize: 32, color: "var(--color-warning)" }} />
        <Typography variant="h5" fontWeight="bold" color="var(--color-primary)">उत्कृष्ठता तालिका</Typography>
      </Box>
      
      {!loading && items.length === 0 && (
        <Box sx={{ mt: 8 }}>
          <EmptyState 
            title="लीडरबोर्ड जल्द आ रहा है" 
            subtitle="छात्रों की रैंकिंग और प्रदर्शन देखने की सुविधा पर काम चल रहा है। कृपया बाद में दोबारा जांचें।"
          />
        </Box>
      )}
    </Box>
  );
}
