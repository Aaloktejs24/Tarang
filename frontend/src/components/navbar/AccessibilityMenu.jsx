"use client";

import langFeture from '../../data/formated/langFeture.json';
const { scriptFonts, languageScripts } = langFeture;

// Helper: get fonts for a language by looking up its script
const getFontsForLanguage = (lang) => {
  const script = languageScripts[lang] || 'Latin';
  return scriptFonts[script] || scriptFonts['Latin'];
};

import React, { useState } from 'react';
import { Box, Typography, Button, Select, MenuItem, FormControl, Fab, Popover, TextField, ListSubheader, InputAdornment } from '@mui/material';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import SettingsAccessibilityIcon from '@mui/icons-material/SettingsAccessibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useTranslation } from '../../hooks/useTranslation';
import { buildSortedLanguages } from '../../lib/languages';

export default function AccessibilityMenu() {
  const { fontFamily, setFontFamily, language, setLanguage, autoDetectLanguage, isDetecting, userLocation } = useAccessibility();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const languageList = React.useMemo(() => buildSortedLanguages(userLocation), [userLocation]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFontChange = (e) => {
    setFontFamily(e.target.value);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'accessibility-popover' : undefined;

  return (
    <>
      <Fab
        color="primary"
        aria-label="accessibility"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: { xs: 24, md: 40 },
          left: { xs: 24, md: 40 },
          width: { xs: 56, md: 64 },
          height: { xs: 56, md: 64 },
          zIndex: 10001,
          bgcolor: '#0056b3 !important',
          boxShadow: 'none',
          border: '1.5px solid #ffc107',
          '&:hover, &:focus': {
            bgcolor: '#004494 !important',
          }
        }}
      >
        <SettingsAccessibilityIcon />
      </Fab>

      <Popover
        id={id}
        elevation={0}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        sx={{ zIndex: 10002 }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: -2,
            ml: 2,
            p: { xs: 3, sm: 4 },
            background: `
              radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.25) 0, transparent 50%), 
              radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.2) 0, transparent 50%), 
              radial-gradient(at 80% 100%, rgba(40, 167, 69, 0.15) 0, transparent 50%),
              radial-gradient(at 20% 100%, rgba(0, 86, 179, 0.1) 0, transparent 50%),
              #ffffff
            `,
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: 'none',
            minWidth: 320,
            maxWidth: 380,
            width: '100%'
          }
        }}
      >

        {/* FONT SELECTOR */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 800, color: '#1e293b', mb: 1, fontSize: '0.95rem', fontFamily: "'Inter', sans-serif" }}>
            {t('accessibilityMenu.fontStyle')}
          </Typography>
          <FormControl fullWidth>
            {(() => {
              const currentFonts = getFontsForLanguage(language);
              const isValueValid = currentFonts.some(f => f.value === fontFamily);
              const safeFontFamily = isValueValid ? fontFamily : (currentFonts[0]?.value || '');
              
              return (
                <Select
                  value={safeFontFamily}
                  onChange={handleFontChange}
                  sx={{
                    color: '#111827',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '15px',
                    fontWeight: 500,
                    backgroundColor: '#f8fafc',
                    borderRadius: "8px",
                    transition: 'all 0.2s ease',
                    '& .MuiSelect-select': {
                      padding: '12px 14px',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e2e8f0',
                      borderWidth: '1px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#cbd5e1',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1e293b',
                      borderWidth: '1px',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                    }
                  }}
                  MenuProps={{
                    sx: { zIndex: 11000 },
                    PaperProps: {
                      elevation: 0,
                      sx: { boxShadow: 'none', border: '1px solid #E2E8F0' }
                    },
                    MenuListProps: {
                      sx: { maxHeight: 320, overflowY: 'auto' }
                    }
                  }}
                >
                  {getFontsForLanguage(language).map((font, idx) => (
                    <MenuItem 
                      key={idx} 
                      value={font.value} 
                      sx={{ fontFamily: `${font.value} !important` }}
                    >
                      {font.name}
                    </MenuItem>
                  ))}
                </Select>
              );
            })()}
          </FormControl>
        </Box>

        {/* LANGUAGE TOGGLE */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 700, 
              color: '#334155',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Choose Language
            </Typography>
            <Button 
              size="small" 
              variant="text" 
              onClick={autoDetectLanguage}
              disabled={isDetecting}
              startIcon={isDetecting ? <LocationOnIcon fontSize="small" /> : <LocationOnIcon fontSize="small" />}
              sx={{ 
                fontSize: '12px', 
                textTransform: 'none', 
                fontWeight: 600,
                color: '#0056b3',
                minWidth: 'auto',
                p: '4px 8px'
              }}
            >
              {isDetecting ? 'Detecting...' : 'Auto-Detect'}
            </Button>
          </Box>
          <FormControl fullWidth variant="outlined">
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              sx={{
                color: '#111827',
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                fontWeight: 500,
                backgroundColor: '#ffffff',
                borderRadius: "8px",
                transition: 'all 0.2s ease',
                '& .MuiSelect-select': {
                  padding: '12px 14px',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e2e8f0',
                  borderWidth: '1px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#cbd5e1',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1e293b',
                  borderWidth: '1px',
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                }
              }}
              MenuProps={{
                sx: { zIndex: 11000 },
                PaperProps: {
                  elevation: 0,
                  sx: { boxShadow: 'none', border: '1px solid #E2E8F0' }
                },
                MenuListProps: {
                  sx: { p: 0, maxHeight: 320, overflowY: 'auto' }
                }
              }}
            >
              <ListSubheader sx={{ p: 1.5, borderBottom: "1px solid #e2e8f0", backgroundColor: '#fff', zIndex: 2, lineHeight: 'normal', m: 0 }}>
                <TextField
                  size="medium"
                  autoFocus
                  placeholder="Search language..."
                  fullWidth
                  variant="outlined"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                        backgroundColor: "#f8fafc",
                        borderRadius: "8px",
                        transition: "all 0.2s ease-in-out",
                        "& fieldset": { borderColor: "#e2e8f0" },
                        "&:hover fieldset": { borderColor: "#cbd5e1" },
                        "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
                    },
                    "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "15px" },
                  }}
                />
              </ListSubheader>
              {languageList.map(lang => {
                const q = searchQuery.toLowerCase();
                const isVisible = !searchQuery || lang.searchStr.includes(q) || language === lang.code;
                return (
                  <MenuItem
                    key={lang.code}
                    value={lang.code}
                    sx={isVisible ? {} : { display: 'none' }}
                  >
                    {lang.label}
                    <span style={{ display: 'none' }}>{lang.code}</span>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      </Popover>
    </>
  );
}
