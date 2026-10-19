"use client";

import langFeature from '../../data/formatted/langFeature.json';
import gazetteer from '../../data/formatted/gazetteer.json';
import { lookupMapping, resolveCanonicalName } from '../../lib/geoNormalize';
const { languageNames: languageNames } = langFeature;
const INDIA_STATES = (gazetteer.Countries.find(c => c.code === 'IN')?.states) || [];

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, IconButton,
  Autocomplete, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import TranslateIcon from '@mui/icons-material/Translate';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import BackdropBlur from '../common/BackdropBlur';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import TarangButton from '../common/TarangButton';
import { glassPaperSx } from '../../styles/commonStyles';
import useScrollLock from '../../hooks/useScrollLock';
import countryToCurrency from 'country-to-currency';



export default function LanguagePromptModal() {
  const isSubmitting = React.useRef(false);
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
    if (isSubmitting.current) return;
    isSubmitting.current = true;
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
            const canonicalSt = resolveCanonicalName(st, 'states') || st;
            const canonicalDist = resolveCanonicalName(dist, 'districts') || dist;

            setStateName(canonicalSt);
            setDistrictName(canonicalDist);

            const stateLang = lookupMapping(st, 'states');
            if (stateLang) setStateLanguageCode(stateLang);

            const districtLang = lookupMapping(dist, 'districts');
            if (districtLang) setLocalDialectCode(districtLang);
          } catch (error) {
            console.error("Error detecting location:", error);
            setManualMode(true);
          } finally {
            isSubmitting.current = false;
            setLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          isSubmitting.current = false;
          setLoading(false);
          setManualMode(true);
        }
      );
    } else {
      isSubmitting.current = false;
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
    const lang = lookupMapping(st, 'states');
    if (st && lang) {
      setStateLanguageCode(lang);
    } else {
      setStateLanguageCode("");
    }
  };

  const handleManualDistrictChange = (e, val) => {
    const dist = val || null;
    setDistrictName(dist);
    const lang = lookupMapping(dist, 'districts');
    if (dist && lang) {
      setLocalDialectCode(lang);
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
      color: 'var(--color-slate-900)',
      padding: '2px 14px',
    },
    '& .MuiOutlinedInput-input': {
      padding: '10px 0px',
      fontSize: 'var(--font-base)',
    },
    '& .MuiSvgIcon-root': {
      color: 'var(--color-slate-500)'
    },
    '& .MuiInputBase-input::placeholder': {
      color: 'var(--input-placeholder)',
      opacity: 0.6,
      fontWeight: 'var(--font-regular)'
    },
    '& .Mui-disabled .MuiSvgIcon-root': { color: 'var(--color-slate-500)' },
    '& .Mui-disabled .MuiInputBase-input': {
      color: 'var(--color-slate-500)',
      WebkitTextFillColor: 'var(--color-slate-500)'
    }
  };
  const autocompletePaperSx = {
    ...glassPaperSx,
    '& .MuiAutocomplete-listbox': {
      maxHeight: 280,
      padding: '8px',
      overflowY: 'auto',
      '& .MuiAutocomplete-option': {
        borderRadius: 'var(--radius-md)',
        margin: '2px 4px',
        padding: '10px 14px',
        fontSize: 'var(--font-base)',
        color: 'var(--color-slate-900)',
        fontWeight: 'var(--font-medium)',
        transition: 'all var(--transition-fast)',
        '&[aria-selected="true"]': {
          backgroundColor: 'rgba(0, 86, 179, 0.08)',
          color: 'var(--color-primary)',
          fontWeight: 'var(--font-semibold)',
        },
        '&.Mui-focused, &:hover': {
          backgroundColor: 'var(--color-slate-50)',
          color: 'var(--color-slate-900)'
        }
      }
    }
  };

  // Global list of countries
  const allCountries = gazetteer.Countries;
  const countryOptions = allCountries.map(c => c.name);

  // Derive country code for selected country
  const selectedCountryObj = allCountries.find(c => c.name === countryName);
  const countryCode = selectedCountryObj ? selectedCountryObj.code : null;

  // Derive states for the selected country (only India)
  const stateOptions = countryName === "India" ? INDIA_STATES.map(s => s.name).sort() : [];

  // Derive districts/cities (only India)
  let districtOptions = [];
  if (countryName === "India") {
    districtOptions = (INDIA_STATES.find(s => s.name === stateName)?.districts.map(d => d.name) || []).sort();
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
    <BackdropBlur
      open={open}
      onClick={handleClose}
      zIndex={1300}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          borderRadius: { xs: 0, sm: '28px' },
          margin: { xs: 0, sm: 4 },
          minHeight: { xs: 'var(--size-screen-h)', sm: 'auto' },
          maxHeight: { xs: 'var(--size-screen-h)', sm: 'calc(100% - 64px)' },
          padding: { xs: '48px 24px', sm: '64px 64px' },
          width: 'var(--size-full)',
          maxWidth: '560px',
          background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.45) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.3) 0, transparent 50%), 
            radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.2) 0, transparent 50%),
            radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.15) 0, transparent 50%),
            #eef2f6
          `,
          backdropFilter: 'blur(28px) saturate(200%)',
          border: 'none',
          textAlign: 'center',
          position: 'relative',
          overflowY: 'auto'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(0, 86, 179, 0.1) 0%, rgba(40, 167, 69, 0.1) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: 'var(--color-primary)',
            border: 'var(--border-thin) solid var(--color-slate-200)',
          }}>
            <TranslateIcon sx={{ fontSize: 34 }} />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 1, letterSpacing: '-0.5px' }}>
            {"Choose Your Language"}
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--color-slate-500)', mb: 4, px: { xs: 1, sm: 3 }, lineHeight: 1.6 }}>
            {"We detect dialect preferences by region to provide the most localized experience."}
          </Typography>

          {/* Loading State */}
          {loading && (
            <Box sx={{ py: 4 }}>

              <Typography variant="body2" sx={{ mt: 2, color: 'var(--color-slate-500)', fontSize: 'var(--font-sm)', fontWeight: 'var(--font-medium)' }}>
                {"Detecting location..."}
              </Typography>
            </Box>
          )}

          {/* Initial Prompt to Detect */}
          {!loading && !showOptions && !manualMode && (
            <Box>
              <TarangButton
                variant="gradient"
                fullWidth
                onClick={handleDetectLocation}
                startIcon={<MyLocationIcon sx={{ fontSize: '20px' }} />}
                sx={{ mb: 2 }}
              >
                {"Detect My Location"}
              </TarangButton>
              <TarangButton
                variant="outlined"
                fullWidth
                onClick={() => setManualMode(true)}
              >
                {"Select location manually"}
              </TarangButton>
            </Box>
          )}

          {/* Manual Selection Mode */}
          {!loading && manualMode && !showOptions && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, textAlign: 'left', mb: 3 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-900)", fontSize: 'var(--font-sm)', textAlign: 'left' }}>
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
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-900)", fontSize: 'var(--font-sm)', textAlign: 'left' }}>
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
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-900)", fontSize: 'var(--font-sm)', textAlign: 'left' }}>
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

          {showOptions && !loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

              {primaryLang && (
                <TarangButton
                  variant="success"
                  fullWidth
                  onClick={() => selectLanguage(primaryLang)}
                  sx={{ height: 'var(--box-height)', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {getLanguageName(primaryLang)}
                </TarangButton>
              )}

              {secondaryLang && (
                <TarangButton
                  variant="primary"
                  fullWidth
                  onClick={() => selectLanguage(secondaryLang)}
                  sx={{ height: 'var(--box-height)', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {getLanguageName(secondaryLang)}
                </TarangButton>
              )}

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {showSideBySideNationalLang && (
                  <TarangButton
                    variant="white"
                    fullWidth
                    onClick={() => selectLanguage('hi')}
                    sx={{ height: 'var(--box-height)', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {"हिन्दी"}
                  </TarangButton>
                )}
                <TarangButton
                  variant="white"
                  fullWidth
                  onClick={() => selectLanguage('en')}
                  sx={{ height: 'var(--box-height)', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {"English"}
                </TarangButton>
              </Box>
            </Box>
          )}

          {!loading && (showOptions || manualMode) && (
            <Box>
              {!manualMode ? (
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mt: 1.5, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-sm)', fontWeight: 'var(--font-semibold)' }}>
                    {"Wrong location?"}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <TarangButton variant="text" size="sm" onClick={handleDetectLocation}>{"Try Again"}</TarangButton>
                    <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-sm)', fontWeight: 'var(--font-semibold)' }}>{"or"}</Typography>
                    <TarangButton variant="text" size="sm" onClick={() => { setManualMode(true); setCountryName(null); setStateName(null); setDistrictName(null); setLocalDialectCode(""); setStateLanguageCode(""); }}>{"Select Manually"}</TarangButton>
                  </Box>
                </Box>
              ) : showOptions ? (
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mt: 1.5, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-sm)', fontWeight: 'var(--font-semibold)' }}>
                    {"Wrong location?"}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <TarangButton variant="text" size="sm" onClick={() => { setCountryName(null); setStateName(null); setDistrictName(null); setLocalDialectCode(""); setStateLanguageCode(""); }}>{"Select Again"}</TarangButton>
                    <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-sm)', fontWeight: 'var(--font-semibold)' }}>{"or"}</Typography>
                    <TarangButton variant="text" size="sm" onClick={() => { setManualMode(false); setCountryName(null); setStateName(null); setDistrictName(null); setLocalDialectCode(""); setStateLanguageCode(""); handleDetectLocation(); }}>{"Auto Detect"}</TarangButton>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
                  <TarangButton variant="text" size="sm" onClick={() => { setManualMode(false); setCountryName(null); setStateName(null); setDistrictName(null); setLocalDialectCode(""); setStateLanguageCode(""); handleDetectLocation(); }}>{"Auto Detect"}</TarangButton>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </BackdropBlur>
  );
}
