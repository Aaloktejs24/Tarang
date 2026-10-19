"use client";

import localeData from '../../data/localeData.json';
import geoData from '../../data/geoData.json';
import appConfig from '../../data/appConfig.json';
import { lookupMapping, resolveCanonicalName } from '../../lib/geoNormalize';
const { indiaLocationLanguages: locationMappings } = localeData;
const { languageNames: languageNames } = localeData;
const { stateDistricts: stateDistricts } = geoData;
const { miscData: miscData } = appConfig;

import React, { useState, useEffect } from 'react';
import {
  Dialog, Box, Typography, Button, IconButton, Select,
  MenuItem, FormControl, InputLabel, CircularProgress,
  Autocomplete, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import TranslateIcon from '@mui/icons-material/Translate';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import useScrollLock from '../../hooks/useScrollLock';
import { Country, State, City } from 'country-state-city';
import countryToCurrency from 'country-to-currency';

const { POPULAR_COUNTRIES } = miscData;

export default function LanguagePromptModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  useScrollLock(open);

  // States for detected/selected location
  const [countryName, setCountryName] = useState(null);
  const [stateName, setStateName] = useState(null);
  const [districtName, setDistrictName] = useState(null);
  const [localDialectCode, setLocalDialectCode] = useState("");
  const [stateLanguageCode, setStateLanguageCode] = useState("");

  const { language, setLanguage } = useAccessibility();

  useEffect(() => {
    // Check if the user has already seen the popup
    const hasSeen = localStorage.getItem('hasSeenLanguagePopup');
    if (!hasSeen) {
      // Small delay so it doesn't jarringly block the immediate page render
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenLanguagePopup', 'true');
    setOpen(false);
  };

  const selectLanguage = (code) => {
    if (code) {
      setLanguage(code);
    }
    handleClose();
  };

  // Helper to get friendly name for a language code
  const getLanguageName = (code) => {
    return Reflect.get(languageNames, code) || code;
  };

  const handleDetectLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${latitude}&lon=${longitude}`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const data = await response.json();
            
            const st = data.address?.state;
            // state_district is Nominatim's district-level field for India
            // (county is sub-district/tehsil level — too granular for our mapping)
            const dist = data.address?.state_district || data.address?.county || data.address?.city || data.address?.town || data.address?.village;
            
            // Resolve to canonical names from our mapping (handles case, hyphen spacing, aliases)
            const canonicalSt = resolveCanonicalName(st, locationMappings.states) || st;
            const canonicalDist = resolveCanonicalName(dist, locationMappings.districts) || dist;

            setStateName(canonicalSt);
            setDistrictName(canonicalDist);
            
            const stateLang = lookupMapping(st, locationMappings.states);
            if (stateLang) setStateLanguageCode(stateLang);

            const districtLang = lookupMapping(dist, locationMappings.districts);
            if (districtLang) setLocalDialectCode(districtLang);
          } catch (error) {
            console.error("Error detecting location:", error);
            setManualMode(true);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLoading(false);
          setManualMode(true);
        }
      );
    } else {
      setLoading(false);
      setManualMode(true);
    }
  };

  const handleCountryChange = (e, val) => {
    setCountryName(val || null);
    // Reset lower fields on country change
    setStateName(null);
    setDistrictName(null);
    setStateLanguageCode("");
    setLocalDialectCode("");
  };

  const handleManualStateChange = (e, val) => {
    const st = val || null;
    setStateName(st);
    setDistrictName(null);
    setLocalDialectCode("");
    if (st && locationMappings.states[st]) {
      setStateLanguageCode(locationMappings.states[st]);
    } else {
      setStateLanguageCode("");
    }
  };

  const handleManualDistrictChange = (e, val) => {
    const dist = val || null;
    setDistrictName(dist);
    if (dist && locationMappings.districts[dist]) {
      setLocalDialectCode(locationMappings.districts[dist]);
    } else {
      setLocalDialectCode("");
    }
  };


  const countryNationalLanguages = {
    "India": "hi",
    "Bangladesh": "bn",
    "Pakistan": "ur",
    "Nepal": "ne",
    "Sri Lanka": "si",
    "United States": "en",
    "United Kingdom": "en",
    "Canada": "en",
    "Australia": "en",
    "United Arab Emirates": "ar",
    "Saudi Arabia": "ar",
    "Singapore": "zh",
    "New Zealand": "en",
    "Germany": "de",
    "France": "fr",
    "Spain": "es",
    "Italy": "it",
    "China": "zh",
    "Japan": "ja",
    "Russia": "ru",
    "Brazil": "pt",
    "Mexico": "es",
    "South Africa": "af"
  };

  const autocompleteSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#f8fafc',
      borderRadius: "8px",
      color: '#0f172a',
      transition: 'all 0.2s ease-in-out',
      padding: '2px 14px !important',
      '& fieldset': { 
        borderColor: '#e2e8f0',
      },
      '&:hover fieldset': { 
        borderColor: '#cbd5e1' 
      },
      '&.Mui-focused fieldset': { 
        borderColor: '#0056b3', 
        borderWidth: '1.5px' 
      },
      '&.Mui-disabled': {
        backgroundColor: '#f1f5f9',
        '& fieldset': { borderColor: '#e2e8f0' },
      }
    },
    '& .MuiOutlinedInput-input': {
      padding: '10px 0px !important',
      fontSize: '15px',
    },
    '& .MuiSvgIcon-root': { 
      color: '#64748b' 
    },
    '& .MuiInputBase-input::placeholder': {
      opacity: 0.6,
      fontWeight: 400
    },
    '& .Mui-disabled .MuiSvgIcon-root': { color: '#94a3b8' },
    '& .Mui-disabled .MuiInputBase-input': { 
      color: '#94a3b8',
      WebkitTextFillColor: '#94a3b8'
    }
  };
  const autocompletePaperSx = {
    maxHeight: 280, 
    borderRadius: '12px', 
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    '& .MuiAutocomplete-listbox': {
      padding: '8px',
      '& .MuiAutocomplete-option': {
        borderRadius: "8px",
        margin: '2px 4px',
        padding: '10px 14px',
        fontSize: '15px',
        color: '#334155',
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
        transition: 'all 0.15s ease',
        '&[aria-selected="true"]': {
          backgroundColor: 'rgba(0, 86, 179, 0.08) !important',
          color: '#0056b3',
          fontWeight: 600,
        },
        '&.Mui-focused, &:hover': {
          backgroundColor: '#f8fafc',
          color: '#0f172a'
        }
      }
    }
  };

  // Global list of countries
  const allCountries = Country.getAllCountries();
  const countryOptions = allCountries.map(c => c.name);

  // Derive country code for selected country
  const selectedCountryObj = allCountries.find(c => c.name === countryName);
  const countryCode = selectedCountryObj ? selectedCountryObj.isoCode : null;

  // Derive states for the selected country
  const stateOptions = countryCode 
    ? State.getStatesOfCountry(countryCode).map(s => s.name).sort() 
    : [];

  // Derive state code for selected state
  const selectedStateObj = countryCode ? State.getStatesOfCountry(countryCode).find(s => s.name === stateName) : null;
  const stateCode = selectedStateObj ? selectedStateObj.isoCode : null;

  // Derive districts/cities
  let districtOptions = [];
  if (countryName === "India") {
    districtOptions = (Reflect.get(stateDistricts, stateName) || []).sort();
  } else if (countryCode && stateCode) {
    districtOptions = City.getCitiesOfState(countryCode, stateCode).map(c => c.name).sort();
  }

  // Determine which buttons to show
  const hasStates = stateOptions.length > 0;
  const hasDistricts = districtOptions.length > 0;

  const showOptions = manualMode 
    ? (
        !!countryName &&
        (!hasStates || !!stateName) &&
        (!hasDistricts || !!districtName)
      )
    : !!(stateName || districtName);

  const isIndia = !countryName || countryName === "India";
  const baseNationalLangCode = isIndia ? "hi" : (Reflect.get(countryNationalLanguages, countryName) || null);

  const priorityLangs = [];
  if (localDialectCode && localDialectCode !== 'en') {
    priorityLangs.push(localDialectCode);
  }
  if (stateLanguageCode && stateLanguageCode !== 'en' && !priorityLangs.includes(stateLanguageCode)) {
    priorityLangs.push(stateLanguageCode);
  }
  if (!isIndia && baseNationalLangCode && baseNationalLangCode !== 'en' && !priorityLangs.includes(baseNationalLangCode)) {
    priorityLangs.push(baseNationalLangCode);
  }

  let primaryLang = priorityLangs[0] || null;
  const secondaryLang = priorityLangs[1] || null;

  if (!primaryLang && baseNationalLangCode && baseNationalLangCode !== 'en') {
    primaryLang = baseNationalLangCode;
  }

  const showSideBySideNationalLang = isIndia && primaryLang !== 'hi' && secondaryLang !== 'hi';

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      disableScrollLock
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(15px)',
            backgroundColor: 'rgba(0, 86, 179, 0.1)',
          }
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: '28px' },
          margin: { xs: 0, sm: 4 },
          minHeight: { xs: '100vh', sm: 'auto' },
          maxHeight: { xs: '100vh', sm: 'calc(100% - 64px)' },
          padding: { xs: '48px 24px', sm: '64px 64px' },
          width: '100%',
          maxWidth: '560px',
          background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.45) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.3) 0, transparent 50%), 
            radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.2) 0, transparent 50%),
            radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.15) 0, transparent 50%),
            #eef2f6
          `,
          backdropFilter: 'blur(28px) saturate(200%)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
          border: 'none',
          textAlign: 'center',
          position: 'relative'
        }
      }}
    >


      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          width: 72, height: 72, borderRadius: '50%', 
          background: 'linear-gradient(135deg, rgba(0, 86, 179, 0.1) 0%, rgba(40, 167, 69, 0.1) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', color: '#0056b3',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)',
        }}>
          <TranslateIcon sx={{ fontSize: 34 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, letterSpacing: '-0.5px' }}>
          {"Choose Your Language"}
        </Typography>
        <Typography variant="body1" sx={{ color: '#475569', mb: 4, px: { xs: 1, sm: 3 }, lineHeight: 1.6 }}>
          {"We detect dialect preferences by region to provide the most localized experience."}
        </Typography>

        {/* Loading State */}
        {loading && (
          <Box sx={{ py: 4 }}>
            <CircularProgress 
              size={48} 
              thickness={4} 
              sx={{ 
                color: '#0056b3',
                '& .MuiCircularProgress-circle': { strokeLinecap: 'round' }
              }} 
            />
            <Typography variant="body2" sx={{ mt: 2, color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
              {"Detecting location..."}
            </Typography>
          </Box>
        )}

        {/* Initial Prompt to Detect */}
        {!loading && !showOptions && !manualMode && (
          <Box>
            <Button
              variant="contained" disableElevation
              fullWidth
              onClick={handleDetectLocation}
              startIcon={<MyLocationIcon sx={{ fontSize: '20px !important' }} />}
              sx={{
                py: 1.5,
                borderRadius: "8px",
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '16px',
                background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)',
                mb: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #004494 0%, #218838 100%)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {"Detect My Location"}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setManualMode(true)}
              sx={{ 
                textTransform: 'none', 
                color: '#64748b', 
                fontWeight: 600,
                fontSize: '16px',
                py: 1.5,
                borderRadius: "8px",
                borderColor: 'rgba(0,0,0,0.12)',
                '&:hover': { 
                  color: '#0f172a', 
                  background: 'rgba(0,0,0,0.02)',
                  borderColor: 'rgba(0,0,0,0.2)'
                }
              }}
            >
              {"Select location manually"}
            </Button>
          </Box>
        )}

        {/* Manual Selection Mode */}
        {!loading && manualMode && !showOptions && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, textAlign: 'left', mb: 3 }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px", textAlign: 'left' }}>
                {"Select Country"}
              </Typography>
              <Autocomplete
                fullWidth
                size="small"
                options={countryOptions}
                value={countryName}
                onChange={handleCountryChange}
                renderInput={(params) => (
                  <TextField 
                    id={params.id}
                    disabled={params.disabled}
                    fullWidth={params.fullWidth}
                    size={params.size}
                    InputProps={params.InputProps}
                    inputProps={params.inputProps}
                    InputLabelProps={params.InputLabelProps}
                    placeholder="Search Country" 
                    sx={autocompleteSx} 
                  />
                )}
                slotProps={{ paper: { sx: autocompletePaperSx } }}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px", textAlign: 'left' }}>
                {"Select State"}
              </Typography>
              <Autocomplete
                fullWidth
                size="small"
                options={stateOptions}
                value={stateName || null}
                onChange={handleManualStateChange}
                disabled={!countryName}
                renderInput={(params) => (
                  <TextField 
                    id={params.id}
                    disabled={params.disabled}
                    fullWidth={params.fullWidth}
                    size={params.size}
                    InputProps={params.InputProps}
                    inputProps={params.inputProps}
                    InputLabelProps={params.InputLabelProps}
                    placeholder="Search State" 
                    sx={autocompleteSx} 
                  />
                )}
                slotProps={{ paper: { sx: autocompletePaperSx } }}
              />
            </Box>
            
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px", textAlign: 'left' }}>
                {countryName === "India" ? "Select District" : "Select City"}
              </Typography>
              <Autocomplete
                fullWidth
                size="small"
                options={districtOptions}
                value={districtName || null}
                onChange={handleManualDistrictChange}
                disabled={!countryName || !stateName || !hasDistricts}
                renderInput={(params) => (
                  <TextField 
                    id={params.id}
                    disabled={params.disabled}
                    fullWidth={params.fullWidth}
                    size={params.size}
                    InputProps={params.InputProps}
                    inputProps={params.inputProps}
                    InputLabelProps={params.InputLabelProps}
                    placeholder={countryName === "India" ? "Search District" : "Search City"} 
                    sx={autocompleteSx} 
                  />
                )}
                slotProps={{ paper: { sx: autocompletePaperSx } }}
              />
            </Box>
          </Box>
        )}

      {/* Options Mode */}
      {showOptions && !loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          
          {/* Dynamic local/state languages stacked full-width */}
          {primaryLang && (
            <Button
              variant="contained" disableElevation
              fullWidth
              onClick={() => selectLanguage(primaryLang)}
              sx={{ 
                height: '48px', borderRadius: '12px', textTransform: 'none', fontWeight: 600,
                bgcolor: '#28a745',
                color: '#ffffff',
                fontSize: '14px',
                lineHeight: 1,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', px: 2,
                '&:hover': { 
                  bgcolor: '#218838',
                },
                transition: 'all 0.2s ease'
              }}
            >
              {getLanguageName(primaryLang)}
            </Button>
          )}

          {secondaryLang && (
            <Button
              variant="contained" disableElevation
              fullWidth
              onClick={() => selectLanguage(secondaryLang)}
              sx={{ 
                height: '48px', borderRadius: '12px', textTransform: 'none', fontWeight: 600,
                bgcolor: '#0056b3',
                color: '#ffffff',
                fontSize: '14px',
                lineHeight: 1,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', px: 2,
                '&:hover': { 
                  bgcolor: '#004494',
                },
                transition: 'all 0.2s ease'
              }}
            >
              {getLanguageName(secondaryLang)}
            </Button>
          )}

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {showSideBySideNationalLang && (
              <Button
                variant="contained" disableElevation
                fullWidth
                onClick={() => selectLanguage('hi')}
                sx={{ 
                  height: '48px', borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                  fontSize: '15px',
                  lineHeight: 1,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', px: 2,
                  bgcolor: '#ffffff',
                  color: '#0056b3',
                  border: '1px solid rgba(0, 86, 179, 0.2)',
                  '&:hover': { 
                    bgcolor: '#f8fafc',
                    borderColor: '#0056b3',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {"हिन्दी"}
              </Button>
            )}

            <Button
              variant="contained" disableElevation
              fullWidth
              onClick={() => selectLanguage('en')}
              sx={{ 
                height: '48px', borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                fontSize: '15px',
                lineHeight: 1,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', px: 2,
                bgcolor: '#ffffff',
                color: '#0056b3',
                border: '1px solid rgba(0, 86, 179, 0.2)',
                '&:hover': { 
                  bgcolor: '#f8fafc',
                  borderColor: '#0056b3',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {"English"}
            </Button>
          </Box>
        </Box>
      )}
      
      {!loading && (showOptions || manualMode) && (
        <Box>
          {!manualMode ? (
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mt: 1.5, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                {"Wrong location?"}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <Button
                  variant="text"
                  onClick={() => {
                    handleDetectLocation();
                  }}
                  sx={{ 
                    textTransform: 'none', color: '#0056b3', fontWeight: 600, fontSize: '13px', p: 0, minWidth: 'auto',
                    '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                  }}
                >
                  {"Try Again"}
                </Button>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                  {"or"}
                </Typography>
                <Button
                  variant="text"
                  onClick={() => {
                    setManualMode(true);
                    setCountryName(null);
                    setStateName(null);
                    setDistrictName(null);
                    setLocalDialectCode("");
                    setStateLanguageCode("");
                  }}
                  sx={{ 
                    textTransform: 'none', color: '#0056b3', fontWeight: 600, fontSize: '13px', p: 0, minWidth: 'auto',
                    '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                  }}
                >
                  {"Select Manually"}
                </Button>
              </Box>
            </Box>
          ) : showOptions ? (
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mt: 1.5, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                {"Wrong location?"}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <Button
                  variant="text"
                  onClick={() => {
                    setCountryName(null);
                    setStateName(null);
                    setDistrictName(null);
                    setLocalDialectCode("");
                    setStateLanguageCode("");
                  }}
                  sx={{ 
                    textTransform: 'none', color: '#0056b3', fontWeight: 600, fontSize: '13px', p: 0, minWidth: 'auto',
                    '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                  }}
                >
                  {"Select Again"}
                </Button>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                  {"or"}
                </Typography>
                <Button
                  variant="text"
                  onClick={() => {
                    setManualMode(false);
                    setCountryName(null);
                    setStateName(null);
                    setDistrictName(null);
                    setLocalDialectCode("");
                    setStateLanguageCode("");
                    handleDetectLocation();
                  }}
                  sx={{ 
                    textTransform: 'none', color: '#0056b3', fontWeight: 600, fontSize: '13px', p: 0, minWidth: 'auto',
                    '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                  }}
                >
                  {"Auto Detect"}
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
              <Button
                variant="text"
                onClick={() => {
                  setManualMode(false);
                  setCountryName(null);
                  setStateName(null);
                  setDistrictName(null);
                  setLocalDialectCode("");
                  setStateLanguageCode("");
                  handleDetectLocation();
                }}
                sx={{ 
                  textTransform: 'none', color: '#0056b3', fontWeight: 600, fontSize: '13px', p: 0, minWidth: 'auto',
                  '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                }}
              >
                {"Auto Detect"}
              </Button>
            </Box>
          )}
        </Box>
      )}
      </Box>
    </Dialog>
  );
}
