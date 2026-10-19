"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import EmptyState from "../../components/ui/EmptyState";

export default function SavedContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <BookmarkIcon sx={{ fontSize: 32, color: "var(--color-error)" }} />
        <Typography variant="h5" fontWeight="bold" color="var(--color-primary)">सहेजी सामग्री</Typography>
      </Box>
      
      {!loading && items.length === 0 && (
        <Box sx={{ mt: 8 }}>
          <EmptyState 
            title="कोई सहेजी गई सामग्री नहीं" 
            subtitle="आपने अभी तक कोई लेख, वीडियो या दस्तावेज़ सहेज कर नहीं रखा है।"
          />
        </Box>
      )}
    </Box>
  );
}
