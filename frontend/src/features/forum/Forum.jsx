"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import ForumIcon from '@mui/icons-material/Forum';
import EmptyState from "../../components/ui/EmptyState";

export default function Forum() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <ForumIcon sx={{ fontSize: 32, color: "var(--color-primary)" }} />
        <Typography variant="h5" fontWeight="bold" color="var(--color-primary)">वार्तालाप मंच</Typography>
      </Box>
      
      {!loading && items.length === 0 && (
        <Box sx={{ mt: 8 }}>
          <EmptyState 
            title="मंच जल्द आ रहा है" 
            subtitle="हम आपके लिए एक बेहतरीन कम्युनिटी फोरम बना रहे हैं। जल्द ही आप यहाँ सवाल पूछ सकेंगे और दूसरों के साथ ज्ञान साझा कर सकेंगे।"
          />
        </Box>
      )}
    </Box>
  );
}
