"use client";
import React, { useState, useEffect } from "react";
import { Drawer, Box, Typography, Divider, IconButton } from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { usePathname, useSearchParams } from "next/navigation";
import { useAppRouter } from "../../hooks/useAppRouter";
import CustomCheckbox from "../../components/common/Checkbox";

const checkboxStyles = {
  color: "var(--color-slate-500)",
  "&.Mui-checked": {
    color: "var(--color-primary)",
  },
  "& + .MuiFormControlLabel-label": {
    fontSize: 'var(--font-sm)',
    fontWeight: 'var(--font-semibold)',
    color: "var(--color-slate-900)",
  },
};

export default function FeedMobileFilter() {
  const [open, setOpen] = useState(false);
  const router = useAppRouter();
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
            background: "var(--glass-bg)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            borderTop: "var(--border-thin) solid rgba(255,255,255,0.4)",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
          }
        }}
      >
        <Box sx={{ p: 4, pb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "var(--color-slate-900)" }}>
            सामग्री फ़िल्टर
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ color: "var(--color-slate-500)", bgcolor: "rgba(0,0,0,0.04)" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mx: 4, mb: 3, borderColor: "rgba(0,0,0,0.06)" }} />

        <Box sx={{ px: 4, pb: 6, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          
          <Box>
            <Typography variant="subtitle2" sx={{ color: "var(--color-primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.2px", mb: 2, fontSize: 'var(--font-xs)' }}>
              फ़ॉर्मेट
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              <CustomCheckbox size={20} checked={isChecked('video')} onChange={() => handleToggle('video')} label="वीडियो" />
              <CustomCheckbox size={20} checked={isChecked('audio')} onChange={() => handleToggle('audio')} label="आडियो" />
              <CustomCheckbox size={20} checked={isChecked('pdf')} onChange={() => handleToggle('pdf')} label="पीडीऍफ़" />
              <CustomCheckbox size={20} checked={isChecked('ebook')} onChange={() => handleToggle('ebook')} label="ई-बुक" />
              <CustomCheckbox size={20} checked={isChecked('article')} onChange={() => handleToggle('article')} label="लेख" />
              <CustomCheckbox size={20} checked={isChecked('code')} onChange={() => handleToggle('code')} label="कोड" />
              <CustomCheckbox size={20} checked={isChecked('quiz')} onChange={() => handleToggle('quiz')} label="क्विज़" />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)', color: "var(--color-slate-900)", mb: 1.5 }}>
              इवेंट्स और लाइव
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <CustomCheckbox size={20} checked={isChecked('webinar')} onChange={() => handleToggle('webinar')} label="लाइव क्लास" />
              <CustomCheckbox size={20} checked={isChecked('interview')} onChange={() => handleToggle('interview')} label="इंटरव्यू" />
              <CustomCheckbox size={20} checked={isChecked('case_study')} onChange={() => handleToggle('case_study')} label="केस स्टडी" />
              <CustomCheckbox size={20} checked={isChecked('hackathon')} onChange={() => handleToggle('hackathon')} label="हैकथॉन" />
              <CustomCheckbox size={20} checked={isChecked('news')} onChange={() => handleToggle('news')} label="न्यूज़" />
              <CustomCheckbox size={20} checked={isChecked('journal')} onChange={() => handleToggle('journal')} label="जर्नल" />
              <CustomCheckbox size={20} checked={isChecked('poll')} onChange={() => handleToggle('poll')} label="पोल" />
            </Box>
          </Box>

        </Box>
      </Drawer>
    </>
  );
}
