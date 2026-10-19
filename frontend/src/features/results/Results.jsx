"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import PollIcon from '@mui/icons-material/Poll';
import EmptyState from "../../components/ui/EmptyState";

export default function Results() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <PollIcon sx={{ fontSize: 32, color: "var(--color-success)" }} />
        <Typography variant="h5" fontWeight="bold" color="var(--color-primary)">परिणाम</Typography>
      </Box>
      
      {!loading && items.length === 0 && (
        <Box sx={{ mt: 8 }}>
          <EmptyState 
            title="परिणाम उपलब्ध नहीं" 
            subtitle="अभी तक कोई परीक्षा परिणाम घोषित नहीं किया गया है। जब भी परिणाम आएंगे, वे यहाँ दिखाई देंगे।"
          />
        </Box>
      )}
    </Box>
  );
}
