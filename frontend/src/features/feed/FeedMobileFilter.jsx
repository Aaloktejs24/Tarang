"use client";
import React, { useState, useEffect } from "react";
import { Drawer, Box, Typography, Divider, Checkbox, FormControlLabel, IconButton } from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const checkboxStyles = {
  color: "#64748b",
  "&.Mui-checked": {
    color: "#0056b3",
  },
  "& + .MuiFormControlLabel-label": {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    fontSize: "14px",
    fontWeight: 600,
    color: "#334155",
  },
};

export default function FeedMobileFilter() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleToggle = (type) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    const values = current.getAll("filter");
    
    current.delete("filter"); 
    if (values.includes(type)) {
      values.filter(v => v !== type).forEach(v => current.append("filter", v));
    } else {
      values.push(type);
      values.forEach(v => current.append("filter", v));
    }
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const isChecked = (type) => searchParams.getAll("filter").includes(type);

  // Decoupled DOM Listener to be controlled exclusively by the Global SpeedDial View Switcher
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    document.addEventListener("open-feed-filter", handleOpen);
    return () => document.removeEventListener("open-feed-filter", handleOpen);
  }, []);

  return (
    <>
      {/* Premium Mobile Bottom-Sheet Modal */}
      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: "28px",
            borderTopRightRadius: "28px",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            borderTop: "1px solid rgba(255,255,255,0.4)",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
          }
        }}
      >
        <Box sx={{ p: 4, pb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
            सामग्री फ़िल्टर
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ color: "#64748b", bgcolor: "rgba(0,0,0,0.04)" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mx: 4, mb: 3, borderColor: "rgba(0,0,0,0.06)" }} />

        <Box sx={{ px: 4, pb: 6, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          
          <Box>
            <Typography variant="subtitle2" sx={{ color: "#0056b3", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.2px", mb: 2, fontSize: "0.75rem" }}>
              फ़ॉर्मेट
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              <FormControlLabel control={<Checkbox size="small" sx={checkboxStyles} checked={isChecked('video')} onChange={() => handleToggle('video')} />} label="वीडियो" />
              <FormControlLabel control={<Checkbox size="small" sx={checkboxStyles} checked={isChecked('audio')} onChange={() => handleToggle('audio')} />} label="आडियो" />
              <FormControlLabel control={<Checkbox size="small" sx={checkboxStyles} checked={isChecked('pdf')} onChange={() => handleToggle('pdf')} />} label="पीडीऍफ़" />
              <FormControlLabel control={<Checkbox size="small" sx={checkboxStyles} checked={isChecked('ebook')} onChange={() => handleToggle('ebook')} />} label="ई-बुक" />
              <FormControlLabel control={<Checkbox size="small" sx={checkboxStyles} checked={isChecked('article')} onChange={() => handleToggle('article')} />} label="लेख" />
              <FormControlLabel control={<Checkbox size="small" sx={checkboxStyles} checked={isChecked('code')} onChange={() => handleToggle('code')} />} label="कोड" />
              <FormControlLabel control={<Checkbox size="small" sx={checkboxStyles} checked={isChecked('quiz')} onChange={() => handleToggle('quiz')} />} label="क्विज़" />
            </Box>
          </Box>

          <Divider sx={{ borderColor: "rgba(0,0,0,0.04)" }} />

          <Box>
            <Typography variant="subtitle2" sx={{ color: "#0056b3", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.2px", mb: 2, fontSize: "0.75rem" }}>
              श्रेणी
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              <FormControlLabel control={<Checkbox size="small" sx={checkboxStyles} checked={isChecked('webinar')} onChange={() => handleToggle('webinar')} />} label="लाइव क्लास" />
              <FormControlLabel control={<Checkbox size="small" sx={checkboxStyles} checked={isChecked('interview')} onChange={() => handleToggle('interview')} />} label="इंटरव्यू" />
              <FormControlLabel control={<Checkbox size="small" sx={checkboxStyles} checked={isChecked('case_study')} onChange={() => handleToggle('case_study')} />} label="केस स्टडी" />
              <FormControlLabel control={<Checkbox size="small" sx={checkboxStyles} checked={isChecked('hackathon')} onChange={() => handleToggle('hackathon')} />} label="हैकथॉन" />
              <FormControlLabel control={<Checkbox size="small" sx={checkboxStyles} checked={isChecked('news')} onChange={() => handleToggle('news')} />} label="न्यूज़" />
              <FormControlLabel control={<Checkbox size="small" sx={checkboxStyles} checked={isChecked('journal')} onChange={() => handleToggle('journal')} />} label="जर्नल" />
              <FormControlLabel control={<Checkbox size="small" sx={checkboxStyles} checked={isChecked('poll')} onChange={() => handleToggle('poll')} />} label="पोल" />
            </Box>
          </Box>

        </Box>
      </Drawer>
    </>
  );
}
