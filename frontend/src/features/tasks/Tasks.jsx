"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmptyState from "../../components/ui/EmptyState";

export default function Tasks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <AssignmentIcon sx={{ fontSize: 32, color: "var(--color-slate-500)" }} />
        <Typography variant="h5" fontWeight="bold" color="var(--color-primary)">आपके टास्क</Typography>
      </Box>
      
      {!loading && items.length === 0 && (
        <Box sx={{ mt: 8 }}>
          <EmptyState 
            title="कोई नया टास्क नहीं" 
            subtitle="बधाई हो! आपका कोई भी टास्क पेंडिंग नहीं है। नए असाइनमेंट मिलने पर वे यहाँ दिखाई देंगे।"
          />
        </Box>
      )}
    </Box>
  );
}
