"use client";

import localeData from '../data/localeData.json';
import { lookupMapping } from '../lib/geoNormalize';
const { languageFonts: languageFonts } = localeData;
const { indiaLocationLanguages: locationMappings } = localeData;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { GlobalStyles } from '@mui/material';

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

const dropdownPaperSx = {
  borderRadius: '16px',
  marginTop: '8px',
  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15), 0 4px 10px -5px rgba(0, 86, 179, 0.1)",
  backdropFilter: "blur(20px)",
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  backgroundImage: "none"
};

const dropdownListSx = {
  padding: '8px 0'
};

const highlightedOptionSx = {
  boxSizing: 'border-box',
  borderRadius: "8px",
  margin: '4px 10px',
  width: 'calc(100% - 20px)',
  minHeight: '46.5px',
  padding: '10px 14px',
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
  const [fontFamily, setFontFamily] = useState("'Inter', sans-serif");
  const [language, setLanguage] = useState('hi');
  const [mounted, setMounted] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const autoDetectLanguage = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
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

            let detectedLang = locationMappings.default;

            // Fuzzy-match: handles case, hyphen spacing, aliases, etc.
            const stateLang = lookupMapping(stateName, locationMappings.states);
            if (stateLang) detectedLang = stateLang;

            // District overrides state (more specific)
            const districtLang = lookupMapping(districtName, locationMappings.districts);
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
        setIsDetecting(false);
      }
    );
  };

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedFont = localStorage.getItem('tarang_ui_fontFamily');
    const savedLang = localStorage.getItem('tarang_language');
    if (savedFont) setFontFamily(savedFont);
    if (savedLang) setLanguage(savedLang);
    setMounted(true);
  }, []);

  // Save preferences when they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('tarang_ui_fontFamily', fontFamily);
      localStorage.setItem('tarang_language', language);
    }
  }, [fontFamily, language, mounted]);

  // When language changes, verify font compatibility
  useEffect(() => {
    if (mounted) {
      const currentLangFonts = languageFonts[language] || languageFonts['en'];
      const isSupported = currentLangFonts.some(f => f.value === fontFamily);
      if (!isSupported && currentLangFonts.length > 0) {
        setFontFamily(currentLangFonts[0].value);
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
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap`;
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
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              boxShadow: 'none !important',
              outline: 'none !important'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0056b3',
              borderWidth: '2px',
            }
          }
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
              backgroundColor: 'transparent !important',
              outline: 'none !important',
            }
          }
        }
      },
      MuiCheckbox: {
        defaultProps: {
          icon: <span style={{ width: 22, height: 22, border: '2px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', boxSizing: 'border-box', transition: 'all 0.2s' }} />,
          checkedIcon: <span style={{ width: 22, height: 22, backgroundColor: '#0056b3', border: '2px solid #0056b3', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', transition: 'all 0.2s' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>,
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
      isDetecting
    }}>
      <ThemeProvider theme={theme}>
        <GlobalStyles styles={{
          '*, html, body, button, input, select, textarea, .MuiTypography-root, .MuiButtonBase-root, ::placeholder, input::placeholder, textarea::placeholder': {
            fontFamily: `${fontFamily} !important`,
          },
        }} />
        {children}
      </ThemeProvider>
    </AccessibilityContext.Provider>
  );
};
