"use client";

import langFeture from '../data/formated/langFeture.json';
import { lookupMapping } from '../lib/geoNormalize';
import { buildSortedLanguages } from '../lib/languages';
const { scriptFonts, languageScripts } = langFeture;

// Helper: get fonts for a language by looking up its script
const getFontsForLanguage = (lang) => {
  const script = languageScripts[lang] || 'Latin';
  return scriptFonts[script] || scriptFonts['Latin'];
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { GlobalStyles } from '@mui/material';

const AccessibilityContext = createContext();
const LOCATION_CACHE_KEY = 'tarang_user_location';
const LOCATION_FAILURE_KEY = 'tarang_user_location_failed_at';
const LOCATION_CACHE_TTL = 24 * 60 * 60 * 1000;
const LOCATION_FAILURE_COOLDOWN = 60 * 60 * 1000;

export const useAccessibility = () => useContext(AccessibilityContext);

import { glassPaperSx } from '../styles/commonStyles';



const dropdownListSx = {
  padding: '8px 0'
};

const highlightedOptionSx = {
  boxSizing: 'border-box',
  borderRadius: 'var(--radius-sm)',
  margin: '2px 8px',
  width: 'calc(100% - 16px)',
  minHeight: '38px',
  padding: '8px 12px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: 'var(--font-base)',
  lineHeight: 1.25,
  letterSpacing: 0,
  fontWeight: 'var(--font-semibold)',
  color: 'var(--color-slate-900)',
  transition: 'background-color var(--transition-base), color var(--transition-base)',
  backgroundColor: 'transparent',
  '& > .MuiSvgIcon-root, & > svg': {
    width: '1.45em',
    height: '1.45em',
    fontSize: '1.45em',
    flexShrink: 0
  },
  '&:hover': {
    backgroundColor: '#f1f5f9',
    color: 'var(--color-primary)'
  },
  '&.Mui-focused': {
    backgroundColor: 'transparent',
  },
  '&.Mui-selected, &[aria-selected="true"]': {
    backgroundColor: '#f1f5f9',
    color: 'var(--color-primary)',
    fontWeight: 'var(--font-bold)',
    '&:hover': {
      backgroundColor: '#eaf0f7'
    }
  },
  '&:active': {
    backgroundColor: 'var(--color-slate-200)'
  }
};

export const AccessibilityProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [fontFamily, setFontFamily] = useState(() => {
    const fonts = getFontsForLanguage('en');
    return fonts[0]?.value ?? "'Inter', sans-serif";
  });
  const [mounted, setMounted] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState(null);

  const applyLocationData = useCallback((data, silent, savedLang) => {
    if (!data?.latitude || !data?.longitude) return false;

    setUserLocation({ lat: data.latitude, lon: data.longitude });

    if (data.city || data.region) {
      const parts = [];
      if (data.city) parts.push(data.city);
      if (data.region) parts.push(data.region);
      if (data.country_name || data.country) parts.push(data.country_name || data.country);
      else parts.push("India"); // Default country if omitted
      setLocationName(parts.join(", "));
    }

    if (!silent || !savedLang) {
      let detectedLang = 'hi';
      const stateLang = lookupMapping(data.region, 'states');
      const districtLang = lookupMapping(data.city, 'districts');

      if (districtLang) {
        detectedLang = districtLang;
      } else if (stateLang) {
        detectedLang = stateLang;
      } else {
        const sortedLangs = buildSortedLanguages({ lat: data.latitude, lon: data.longitude });
        if (sortedLangs && sortedLangs.length > 0) {
          detectedLang = sortedLangs[0].code;
        }
      }

      setLanguage(detectedLang);
    }

    return true;
  }, []);

  const fetchIPLocation = useCallback(async (silent = false, savedLang = null, forceRefetch = false) => {
    if (!silent) setIsDetecting(true);
    try {
      if (!forceRefetch) {
        const cachedLocation = localStorage.getItem(LOCATION_CACHE_KEY);
        if (cachedLocation) {
          try {
            const cached = JSON.parse(cachedLocation);
            if (Date.now() - cached.createdAt < LOCATION_CACHE_TTL && applyLocationData(cached.data, silent, savedLang)) {
              return;
            }
          } catch {
            localStorage.removeItem(LOCATION_CACHE_KEY);
          }
        }
      }

      const lastFailure = Number(localStorage.getItem(LOCATION_FAILURE_KEY) || 0);
      if (Date.now() - lastFailure < LOCATION_FAILURE_COOLDOWN) {
        return;
      }

      const response = await fetch('/api/location');
      if (!response.ok) {
        localStorage.setItem(LOCATION_FAILURE_KEY, String(Date.now()));
        if (!silent) console.warn(`IP location service unavailable (${response.status})`);
        return;
      }
      const data = await response.json();

      if (applyLocationData(data, silent, savedLang)) {
        localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ data, createdAt: Date.now() }));
        localStorage.removeItem(LOCATION_FAILURE_KEY);
      } else {
        localStorage.setItem(LOCATION_FAILURE_KEY, String(Date.now()));
      }
    } catch (err) {
      localStorage.setItem(LOCATION_FAILURE_KEY, String(Date.now()));
      if (!silent) console.warn("IP location failed", err);
    } finally {
      if (!silent) setIsDetecting(false);
    }
  }, [applyLocationData]);

  const autoDetectLanguage = async () => {
    if (!navigator.geolocation) {
      fetchIPLocation(false, null, true);
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

            const stateLang = lookupMapping(stateName, 'states');
            const districtLang = lookupMapping(districtName, 'districts');

            if (districtLang) {
              detectedLang = districtLang;
            } else if (stateLang) {
              detectedLang = stateLang;
            } else {
              const sortedLangs = buildSortedLanguages({ lat, lon });
              if (sortedLangs && sortedLangs.length > 0) {
                detectedLang = sortedLangs[0].code;
              }
            }

            setLanguage(detectedLang);

            // Update cache so reloading uses this new geolocation
            const locNameParts = [];
            if (districtName) locNameParts.push(districtName);
            if (stateName) locNameParts.push(stateName);
            if (addr.country) locNameParts.push(addr.country);
            else locNameParts.push("India");
            setLocationName(locNameParts.join(", "));

            localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({
              data: { latitude: lat, longitude: lon, region: stateName, city: districtName, country: addr.country },
              createdAt: Date.now()
            }));
            localStorage.removeItem(LOCATION_FAILURE_KEY);
          }
        } catch (error) {
          console.error("Error auto-detecting location language", error);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Location access denied", error);
        fetchIPLocation(false, null, true);
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
  }, [fetchIPLocation]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    shadows: Array(25).fill('none'),
    palette: {
      warning: {
        main: '#ffc107',
      },
    },
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
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 'var(--radius-lg)',
            background: "var(--glass-bg)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "var(--border-thin) solid rgba(30, 79, 163, 0.2)",
            transition: 'transform var(--transition-base)',
            '&:hover': {
              transform: 'var(--hover-lift)',
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 'var(--radius-md)',
            textTransform: 'none',
            '&.Mui-disabled': {
              cursor: 'not-allowed',
              pointerEvents: 'auto',
            },
          },
          sizeSmall: {
            borderRadius: 'var(--radius-sm)',
          },
          contained: {
            '&.Mui-disabled': {
              backgroundColor: 'rgba(0, 86, 179, 0.35)',
              color: 'rgba(255, 255, 255, 0.7)',
            },
          },
          outlined: {
            borderWidth: 'var(--border-thin)',
            '&:hover': {
              borderWidth: 'var(--border-thin)',
            },
            '&.Mui-disabled': {
              backgroundColor: 'transparent',
              color: 'rgba(0, 86, 179, 0.45)',
              borderColor: 'rgba(0, 86, 179, 0.25)',
              borderWidth: 'var(--border-thin)',
            },
          },
          text: {
            '&.Mui-disabled': {
              color: 'rgba(0, 86, 179, 0.4)',
            },
          },
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: 'transparent',
            },
            '&.Mui-disabled': {
              opacity: 0.4,
              cursor: 'not-allowed',
              pointerEvents: 'auto',
            },
          },
        }
      },
      MuiFormLabel: {
        styleOverrides: {
          asterisk: {
            color: 'var(--color-error)',
            '&$error': {
              color: 'var(--color-error)'
            }
          }
        }
      },
      MuiInputLabel: {
        styleOverrides: {
          asterisk: {
            color: 'var(--color-error)',
          }
        }
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            color: 'var(--input-text)',
          },
          input: {
            '&::placeholder': {
              color: 'var(--input-placeholder)',
              opacity: 1,
            }
          }
        }
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: 'var(--input-label)',
            overflow: 'visible !important',
            lineHeight: 'var(--line-height-base) !important',
            whiteSpace: 'normal !important',
          },
          asterisk: {
            color: 'var(--color-error)',
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: "var(--glass-bg)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            borderRadius: 'var(--radius-md)',
            transition: 'all var(--transition-base)',
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(203, 213, 225, 0.8)",
              borderWidth: "1.5px"
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--color-slate-500)"
            },
            '&.Mui-focused': {
              backgroundColor: 'var(--glass-bg)',
              outline: 'none'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-primary)',
              borderWidth: '1.5px',
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(241, 245, 249, 0.5)',
            }
          },
          input: {
            padding: "12px 14px",
            fontSize: 'var(--font-base)'
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 'var(--radius-lg)'
          }
        }
      },
      MuiPickersPopper: {
        styleOverrides: {
          paper: glassPaperSx
        }
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            lineHeight: 'var(--line-height-base)',
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none'
          },
          elevation1: {},
          elevation2: {},
          elevation3: {},
          elevation4: {},
          elevation8: {},
          elevation16: {},
          elevation24: {},
        }
      },
      MuiPopover: {
        styleOverrides: {
          paper: glassPaperSx
        }
      },
      MuiMenu: {
        styleOverrides: {
          paper: glassPaperSx,
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
              outline: 'none',
            }
          }
        }
      },
      MuiCheckbox: {
        defaultProps: {
          icon: <span style={{ width: 22, height: 22, border: '1.5px solid rgba(203, 213, 225, 0.8)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', boxSizing: 'border-box', transition: 'all var(--transition-base)' }} />,
          checkedIcon: <span style={{ width: 22, height: 22, backgroundColor: 'var(--color-primary)', border: '1.5px solid var(--color-primary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', transition: 'all var(--transition-base)' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>,
          indeterminateIcon: <span style={{ width: 22, height: 22, backgroundColor: 'var(--color-primary)', border: '1.5px solid var(--color-primary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', transition: 'all var(--transition-base)' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg></span>,
        },
        styleOverrides: {
          root: {
            '&:hover .MuiSvgIcon-root, &:hover span': {
              borderColor: 'var(--color-slate-500)',
            },
            '&.Mui-focusVisible span, &:focus-within span': {
              borderColor: 'var(--color-primary)',

            }
          }
        }
      },
      MuiAutocomplete: {
        styleOverrides: {
          paper: glassPaperSx,
          listbox: dropdownListSx,
          option: {
            ...highlightedOptionSx,
            '&[aria-selected="true"], &[aria-selected="true"].Mui-focused': {
              backgroundColor: 'var(--color-slate-50)',
              color: 'var(--color-primary)',
              fontWeight: 'var(--font-bold)'
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
      userLocation,
      locationName
    }}>
      <ThemeProvider theme={theme}>
        <GlobalStyles styles={{
          '*, html, body, button, input, select, textarea, .MuiTypography-root, .MuiButtonBase-root, ::placeholder, input::placeholder, textarea::placeholder': {
            fontFamily: `${fontFamily} !important`,
          },
          '.MuiOutlinedInput-notchedOutline legend': {
            width: 'auto',
            float: 'none',
            padding: '0',
            margin: '0',
          }
        }} />
        {children}
      </ThemeProvider>
    </AccessibilityContext.Provider>
  );
};
