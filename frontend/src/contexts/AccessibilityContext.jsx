"use client";

import langFeture from '../data/formated/langFeture.json';
import { lookupMapping } from '../lib/geoNormalize';
const { scriptFonts, languageScripts } = langFeture;

// Helper: get fonts for a language by looking up its script
const getFontsForLanguage = (lang) => {
  const script = languageScripts[lang] || 'Latin';
  return scriptFonts[script] || scriptFonts['Latin'];
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { GlobalStyles } from '@mui/material';

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

const dropdownPaperSx = {
  borderRadius: '16px',
  marginTop: '8px',
  boxShadow: 'none',
  border: '1px solid #e2e8f0',
  backdropFilter: "blur(20px)",
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  backgroundImage: "none"
};

const dropdownListSx = {
  padding: '8px 0'
};

const highlightedOptionSx = {
  boxSizing: 'border-box',
  borderRadius: "6px",
  margin: '2px 8px',
  width: 'calc(100% - 16px)',
  minHeight: '38px',
  padding: '8px 12px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '15px',
  lineHeight: 1.25,
  letterSpacing: 0,
  fontWeight: 600,
  color: '#334155',
  transition: 'background-color 0.2s ease, color 0.2s ease',
  backgroundColor: 'transparent',
  '& > .MuiSvgIcon-root, & > svg': {
    width: '1.45em',
    height: '1.45em',
    fontSize: '1.45em',
    flexShrink: 0
  },
  '&:hover': {
    backgroundColor: '#f1f5f9 !important',
    color: '#0056b3'
  },
  '&.Mui-focused': {
    backgroundColor: 'transparent',
  },
  '&.Mui-selected, &[aria-selected="true"]': {
    backgroundColor: '#f1f5f9 !important',
    color: '#0056b3',
    fontWeight: 700,
    '&:hover': {
      backgroundColor: '#eaf0f7 !important'
    }
  },
  '&:active': {
    backgroundColor: '#e2e8f0'
  }
};

export const AccessibilityProvider = ({ children }) => {
  const [language, setLanguage] = useState('hi');
  const [fontFamily, setFontFamily] = useState(() => {
    const fonts = getFontsForLanguage('hi');
    return fonts[0]?.value ?? "'Noto Sans Devanagari', sans-serif";
  });
  const [mounted, setMounted] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const fetchIPLocation = async (silent = false, savedLang = null) => {
    if (!silent) setIsDetecting(true);
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        if (!silent) console.warn(`IP location service returned ${response.status}`);
        return;
      }
      const data = await response.json();

      if (data && data.latitude && data.longitude) {
        setUserLocation({ lat: data.latitude, lon: data.longitude });

        if (!silent || !savedLang) {
          let detectedLang = 'hi'; // Default
          const stateLang = lookupMapping(data.region, 'states');
          if (stateLang) detectedLang = stateLang;

          const districtLang = lookupMapping(data.city, 'districts');
          if (districtLang) detectedLang = districtLang;

          setLanguage(detectedLang);
        }
      }
    } catch (err) {
      if (!silent) console.warn("IP location failed", err);
    } finally {
      if (!silent) setIsDetecting(false);
    }
  };

  const autoDetectLanguage = async () => {
    if (!navigator.geolocation) {
      fetchIPLocation(false);
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserLocation({ lat, lon });
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lon}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();

          if (data.address) {
            const addr = data.address;
            const stateName = addr.state;
            // state_district is Nominatim's district-level field for India
            // (county is sub-district/tehsil level — too granular for our mapping)
            const districtName = addr.state_district || addr.county || addr.city || addr.town || addr.village;

            let detectedLang = 'hi'; // Default

            // Fuzzy-match: handles case, hyphen spacing, aliases, etc.
            const stateLang = lookupMapping(stateName, 'states');
            if (stateLang) detectedLang = stateLang;

            // District overrides state (more specific)
            const districtLang = lookupMapping(districtName, 'districts');
            if (districtLang) detectedLang = districtLang;

            setLanguage(detectedLang);
          }
        } catch (error) {
          console.error("Error auto-detecting location language", error);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Location access denied", error);
        fetchIPLocation(false);
      }
    );
  };

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedFont = localStorage.getItem('tarang_ui_fontFamily');
    const savedLang = localStorage.getItem('tarang_language');
    if (savedFont) setFontFamily(savedFont);
    if (savedLang) setLanguage(savedLang);

    // Unconditionally fetch IP on mount to initialize location silently
    fetchIPLocation(true, savedLang);

    setMounted(true);
  }, []);

  // Save preferences when they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('tarang_ui_fontFamily', fontFamily);
      localStorage.setItem('tarang_language', language);
    }
  }, [fontFamily, language, mounted]);

  // When language changes, switch font to match the script
  useEffect(() => {
    if (mounted) {
      const scriptFontList = getFontsForLanguage(language);
      // Check if current font is supported by this script's font list
      const isSupported = scriptFontList.some(f => f.value === fontFamily);
      if (!isSupported && scriptFontList.length > 0) {
        setFontFamily(scriptFontList[0].value);
      }
    }
  }, [language, mounted]);

  // Inject Google Font dynamically
  useEffect(() => {
    if (mounted) {
      const fontName = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
      if (fontName) {
        const linkId = 'dynamic-google-font';
        let link = document.getElementById(linkId);
        if (!link) {
          link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}&display=swap`;
      }
    }
  }, [fontFamily, mounted]);

  // Create a dynamic MUI theme based on the selected font
  const theme = createTheme({
    typography: {
      fontFamily: fontFamily,
      button: {
        fontFamily: fontFamily,
        textTransform: 'none'
      },
      h1: { fontFamily },
      h2: { fontFamily },
      h3: { fontFamily },
      h4: { fontFamily },
      h5: { fontFamily },
      h6: { fontFamily },
      body1: { fontFamily },
      body2: { fontFamily },
      subtitle1: { fontFamily },
      subtitle2: { fontFamily },
      caption: { fontFamily },
      overline: { fontFamily },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: "#ffffff",
            borderRadius: '8px',
            transition: 'all 0.2s ease-in-out',
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              boxShadow: 'none !important',
              outline: 'none !important'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0056b3',
              borderWidth: '1.5px',
            },
            '&.Mui-disabled': {
              backgroundColor: '#f1f5f9',
            }
          },
          input: {
            padding: "12px 14px !important",
            fontSize: "15px"
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            boxShadow: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: '16px'
          }
        }
      },
      MuiPickersPopper: {
        styleOverrides: {
          paper: {
            boxShadow: 'none !important',
            border: '1px solid #e2e8f0',
            borderRadius: '16px'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: 'none !important',
            backgroundImage: 'none'
          },
          elevation1: { boxShadow: 'none !important' },
          elevation2: { boxShadow: 'none !important' },
          elevation3: { boxShadow: 'none !important' },
          elevation4: { boxShadow: 'none !important' },
          elevation8: { boxShadow: 'none !important' },
          elevation16: { boxShadow: 'none !important' },
          elevation24: { boxShadow: 'none !important' },
        }
      },
      MuiPopover: {
        styleOverrides: {
          paper: dropdownPaperSx
        }
      },
      MuiMenu: {
        styleOverrides: {
          paper: dropdownPaperSx,
          list: dropdownListSx
        }
      },
      MuiMenuItem: {
        styleOverrides: {
          root: highlightedOptionSx
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: highlightedOptionSx
        }
      },
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
        styleOverrides: {
          root: {
            '&.Mui-focusVisible, &:focus': {
              outline: 'none !important',
            }
          }
        }
      },
      MuiCheckbox: {
        defaultProps: {
          icon: <span style={{ width: 22, height: 22, border: '2px solid #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', boxSizing: 'border-box', transition: 'all 0.2s' }} />,
          checkedIcon: <span style={{ width: 22, height: 22, backgroundColor: '#0056b3', border: '2px solid #0056b3', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', transition: 'all 0.2s' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>,
          indeterminateIcon: <span style={{ width: 22, height: 22, backgroundColor: '#0056b3', border: '2px solid #0056b3', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', transition: 'all 0.2s' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg></span>,
        }
      },
      MuiAutocomplete: {
        styleOverrides: {
          paper: dropdownPaperSx,
          listbox: dropdownListSx,
          option: {
            ...highlightedOptionSx,
            '&[aria-selected="true"], &[aria-selected="true"].Mui-focused': {
              backgroundColor: '#f1f5f9',
              color: '#0056b3',
              fontWeight: 700
            },
            '&[aria-selected="true"]:hover': {
              backgroundColor: '#eaf0f7'
            }
          }
        }
      }
    }
  });

  if (!mounted) return null;

  return (
    <AccessibilityContext.Provider value={{
      fontFamily,
      setFontFamily,
      language,
      setLanguage,
      autoDetectLanguage,
      isDetecting,
      userLocation
    }}>
      <ThemeProvider theme={theme}>
        <GlobalStyles styles={{
          '*, html, body, button, input, select, textarea, .MuiTypography-root, .MuiButtonBase-root, ::placeholder, input::placeholder, textarea::placeholder': {
            fontFamily: `${fontFamily} !important`,
          },
          '.MuiOutlinedInput-notchedOutline legend': {
            width: 'auto !important',
            float: 'none !important',
            padding: '0 !important',
            margin: '0 !important',
          }
        }} />
        {children}
      </ThemeProvider>
    </AccessibilityContext.Provider>
  );
};
