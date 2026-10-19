"use client";

import langFeture from '../../data/formated/langFeture.json';
const { scriptFonts, languageScripts } = langFeture;

const getFontsForLanguage = (lang) => {
  const script = languageScripts[lang] || 'Latin';
  return scriptFonts[script] || scriptFonts['Latin'];
};

import React, { useState } from 'react';
import { Box, Typography, Fab } from '@mui/material';
import SettingsAccessibilityIcon from '@mui/icons-material/SettingsAccessibility';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useTranslation } from '../../hooks/useTranslation';
import { buildSortedLanguages } from '../../lib/languages';
import CentralDropdown from '../common/CentralDropdown';
import { usePathname } from 'next/navigation';
import { GlassPopover } from '../common/GlassPopover';

export default function AccessibilityMenu() {
  const { fontFamily, setFontFamily, language, setLanguage, userLocation } = useAccessibility();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const pathname = usePathname();

  if (pathname && pathname.includes('/viewer')) {
    return null;
  }

  const languageList = React.useMemo(() => buildSortedLanguages(userLocation), [userLocation]);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);
  const id = open ? 'accessibility-popover' : undefined;

  const currentFonts = getFontsForLanguage(language);
  const isValueValid = currentFonts.some(f => f.value === fontFamily);
  const safeFontFamily = isValueValid ? fontFamily : (currentFonts[0]?.value || '');

  const fontOptions = currentFonts.map(f => ({ value: f.value, label: f.name }));
  const langOptions = languageList.map(l => ({ value: l.code, label: l.label, searchStr: l.searchStr }));

  return (
    <>
      <Fab
        color="primary"
        aria-label="accessibility"
        onClick={handleClick}
        style={{ zIndex: 1500 }}
        sx={{
          position: 'fixed',
          bottom: { xs: 24, md: 40 },
          left: { xs: 24, md: 40 },
          width: { xs: 56, md: 64 },
          height: { xs: 56, md: 64 },
          bgcolor: 'var(--color-primary)',
          border: '1.5px solid var(--color-warning)',
          '&:hover, &:focus, &:active': {
            bgcolor: 'var(--color-primary)'
          }
        }}
      >
        <SettingsAccessibilityIcon />
      </Fab>

      <GlassPopover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        style={{ zIndex: 1600 }}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{
          mt: -2, ml: 2,
          p: { xs: 3, sm: 4 },
          minWidth: 320, maxWidth: 380,
          width: 'var(--size-full)',
        }}
      >
        {/* FONT SELECTOR */}
        <Box sx={{ mb: 3 }}>
          <CentralDropdown
            label={t('accessibilityMenu.fontStyle')}
            value={safeFontFamily}
            options={fontOptions}
            onChange={(e) => setFontFamily(e.target.value)}
          />
        </Box>

        {/* LANGUAGE TOGGLE */}
        <Box sx={{ mb: 2 }}>
          <CentralDropdown
            label="Language"
            value={language}
            options={langOptions}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </Box>
      </GlassPopover>
    </>
  );
}
