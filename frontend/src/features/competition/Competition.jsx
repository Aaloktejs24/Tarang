"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import FlagIcon from '@mui/icons-material/Flag';
import EmptyState from "../../components/ui/EmptyState";

export default function Competition() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <FlagIcon sx={{ fontSize: 32, color: "var(--color-slate-500)" }} />
        <Typography variant="h5" fontWeight="bold" color="var(--color-primary)">प्रतियोगिताएँ</Typography>
      </Box>
      
      {!loading && items.length === 0 && (
        <Box sx={{ mt: 8 }}>
          <EmptyState 
            title="कोई सक्रिय प्रतियोगिता नहीं" 
            subtitle="वर्तमान में कोई नई प्रतियोगिता उपलब्ध नहीं है। कृपया नई प्रतियोगिताओं के लिए वापस आकर चेक करें।"
          />
        </Box>
      )}
    </Box>
  );
}
