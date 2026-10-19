"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import SortIcon from '@mui/icons-material/Sort';
import EmptyState from "../../components/ui/EmptyState";

export default function Ranking() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <SortIcon sx={{ fontSize: 32, color: "var(--color-warning)" }} />
        <Typography variant="h5" fontWeight="bold" color="var(--color-primary)">क्रमबद्धता रैंकिंग</Typography>
      </Box>
      
      {!loading && items.length === 0 && (
        <Box sx={{ mt: 8 }}>
          <EmptyState 
            title="रैंकिंग जल्द आ रही है" 
            subtitle="विषयवार रैंकिंग सिस्टम पर काम चल रहा है। जल्द ही आप अपनी रैंकिंग देख पाएंगे।"
          />
        </Box>
      )}
    </Box>
  );
}
