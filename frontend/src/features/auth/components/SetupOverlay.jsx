"use client";

import miscData from '../../../data/miscData.json';
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable security/detect-object-injection */

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
  Stepper,
  Step,
  StepLabel
} from "@mui/material";
import { motion as Motion } from "framer-motion";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PersonIcon from "@mui/icons-material/Person";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useRouter } from "next/navigation";
import { updateProfile } from "../authService";
import { apiClient } from "../../../lib/apiClient";
import Loader from "../../../components/common/Loader";
import useScrollLock from "../../../hooks/useScrollLock";
import gazeteer from '../../../data/formated/gazeteer.json';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { sortLocationsByDistance, getSortedLanguagesByLocation } from '../../../lib/geoNormalize';
import langFeture from '../../../data/formated/langFeture.json';
const INDIA = gazeteer.Countries.find(c => c.code === 'IN');
const INDIA_STATES = INDIA?.states || [];

const LANGUAGE_OPTIONS = Object.entries(langFeture.languageNames).map(([e, h]) => ({ h, e })).sort((a, b) => a.h.localeCompare(b.h));

const fontFam = "inherit";

const { devanagariDigits } = miscData;
const toDevanagari = (numStr) => {
  return numStr.toString().replace(/[0-9]/g, (w) => Reflect.get(devanagariDigits, w));
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    "& fieldset": { borderColor: "#e5e7eb" },
    "&:hover fieldset": { borderColor: "#d1d5db" },
    "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
    "&.Mui-disabled fieldset": { borderColor: "#f3f4f6" },
    "&.Mui-disabled input": { WebkitTextFillColor: "#9ca3af" },
    "&.Mui-error fieldset": { borderColor: "#ef4444" },
    "&.Mui-error:hover fieldset": { borderColor: "#ef4444" },
    "&.Mui-error.Mui-focused fieldset": { borderColor: "#ef4444" },
    "& input, & .MuiSelect-select": { color: "#0f172a", fontSize: "15px" },
    "& input::placeholder": { color: "#9CA3AF", opacity: 1 },
    "&.Mui-disabled": { backgroundColor: "#fafafa" }
  },
  "& .MuiOutlinedInput-root:not(.MuiInputBase-multiline) .MuiOutlinedInput-input": {
    padding: "12.5px 14px"
  },
  "& .MuiOutlinedInput-root.MuiInputBase-multiline": {
    padding: "8px 14px"
  },
  "& .MuiAutocomplete-inputRoot": {
    padding: "4px 8px !important",
  },
  "& .MuiAutocomplete-inputRoot .MuiAutocomplete-input": {
    padding: "8.5px 6px !important",
  },
  "& .MuiFormHelperText-root": { color: "#ef4444", fontSize: "12px", mt: 0.5 },
};

const menuPaperSx = {
  borderRadius: "12px",
  margin: "6px 0",
  boxShadow: "none",
  border: "1px solid #E2E8F0",
  backdropFilter: "blur(20px)",
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  "& .MuiAutocomplete-listbox, & .MuiList-root": {
    padding: "4px",
    maxHeight: "220px",
    overflowY: "auto",
  },
  "& .MuiAutocomplete-option, & .MuiMenuItem-root": {
    borderRadius: "8px",
    margin: "2px 4px",
    padding: "10px 14px",
    fontSize: "15px",
    color: "#334155",
    fontWeight: 500,
    transition: "all 0.15s ease",
    "&[aria-selected='true']": {
      backgroundColor: "rgba(0, 86, 179, 0.08) !important",
      color: "#0056b3",
      fontWeight: 600
    },
    "&.Mui-focused, &:hover": {
      backgroundColor: "#f8fafc",
      color: "#0f172a"
    }
  }
};

import InstituteSetupOverlay from "./InstituteSetupOverlay";
import { useLoading } from '../../../contexts/LoadingContext';

const LabelTypography = ({ children }) => (
  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
    {children}
  </Typography>
);

export default function SetupOverlay({ profile }) {
  const isInstitute = profile?.role === 'institute' || profile?.role === 'organisation';
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const steps = ["बुनियादी जानकारी", "अन्य विवरण"];

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);


  useScrollLock(true);

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [formData, setFormData] = useState({
    full_name: "",
    institution_name: "",
    bio: "",
    location_country: "",
    location_state: "",
    location_city: "",
    languages: "",
    gender: "",
    dob_day: "",
    dob_month: "",
    dob_year: "",
    profile_pic_url: "",
    banner_url: ""
  });


  const { userLocation } = useAccessibility();

  const countries = useMemo(() => 
    sortLocationsByDistance(gazeteer.Countries, userLocation?.lat, userLocation?.lon, 'countries')
  , [userLocation]);

  const sortedLanguages = useMemo(() => {
    let lat = userLocation?.lat;
    let lon = userLocation?.lon;
    if (!lat || !lon) {
      // Fallback to center of India if location is blocked
      lat = 22.9074872;
      lon = 79.1322059;
    }
    const langData = getSortedLanguagesByLocation(lat, lon);

    // Ensure English and Hindi are at the top if no location
    if (!userLocation) {
      langData.set('hi', { priority: 1, distance: Infinity });
      langData.set('en', { priority: 2, distance: Infinity });
    }

    return [...LANGUAGE_OPTIONS].sort((a, b) => {
      const dataA = langData.get(a.e) || { priority: Infinity, distance: Infinity };
      const dataB = langData.get(b.e) || { priority: Infinity, distance: Infinity };
      if (dataA.priority !== dataB.priority) {
        return dataA.priority - dataB.priority;
      }
      if (dataA.distance !== dataB.distance) {
        return dataA.distance - dataB.distance;
      }
      return a.h.localeCompare(b.h);
    });
  }, [userLocation]);

  const states = useMemo(() =>
    formData.location_country === 'IN' 
      ? sortLocationsByDistance(INDIA_STATES, userLocation?.lat, userLocation?.lon, 'states').map(s => ({ name: s.name, isoCode: s.name })) 
      : [],
    [formData.location_country, userLocation]
  );

  const cities = useMemo(() => {
    if (!formData.location_country || !formData.location_state) return [];
    if (formData.location_country === 'IN') {
      const stateObj = INDIA_STATES.find(s => s.name === formData.location_state);
      const districtList = stateObj ? stateObj.districts : [];
      if (districtList.length > 0) {
        return sortLocationsByDistance(districtList, userLocation?.lat, userLocation?.lon, 'districts').map(d => ({ name: d.name }));
      }
    }
    return [];
  }, [formData.location_country, formData.location_state]);

  useEffect(() => {
    if (profile) {
      let d = "", m = "", y = "";
      if (profile.dob) {
        const parts = profile.dob.split("-");
        if (parts.length === 3) {
          y = parts[0];
          m = parseInt(parts[1]).toString();
          d = parseInt(parts[2]).toString();
        }
      }

      let countryIso = "";
      let stateIso = "";
      let cityValue = "";

      if (profile.location) {
        const parts = profile.location.split(", ").map(p => p.trim());
        if (parts.length >= 3) {
          const [cName, sName, cntryName] = parts;
          const foundCountry = countries.find(c => c.name === cntryName);
          if (foundCountry) {
            countryIso = foundCountry.code;
            const foundState = countryIso === 'IN' ? sName : null;
            if (foundState) {
              stateIso = foundState;
              const stateObj = INDIA_STATES.find(s => s.name === foundState);
              const districtList = stateObj ? stateObj.districts.map(d => d.name) : [];
              const exactMatch = districtList.find(dist => dist.toLowerCase() === cName.toLowerCase());
              cityValue = exactMatch || cName;
            }
          }
        }
      }

      setFormData({
        full_name: profile.full_name || "",
        institution_name: profile.institution_name || "",
        bio: profile.bio || "",
        location_country: countryIso,
        location_state: stateIso,
        location_city: stateIso ? cityValue : "",
        languages: (profile.languages && profile.languages.length > 0) ? profile.languages[0] : "",
        gender: profile.gender || "",
        dob_day: d,
        dob_month: m,
        dob_year: y,
        profile_pic_url: profile.profile_pic_url || "",
        banner_url: profile.banner_url || ""
      });
    }
  }, [profile, countries]);

  const handleChange = (e) => {
    if (formErrors[e.target.name]) setFormErrors(prev => ({ ...prev, [e.target.name]: false }));
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutocompleteChange = (name, value) => {
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: false }));
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "location_country") {
        newData.location_state = "";
        newData.location_city = "";
      } else if (name === "location_state") {
        newData.location_city = "";
      }
      return newData;
    });
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "profile") setUploadingAvatar(true);
    else setUploadingBanner(true);

    try {
      const { data } = await apiClient.get(`/s3/sign`, {
        params: { user_id: profile.id, type: type, mime: file.type }
      });

      await fetch(data.upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });

      if (type === "profile") {
        await apiClient.post("/user/profile/update-pic", {
          user_id: profile.id,
          url: data.file_url
        });
        setFormData(p => ({ ...p, profile_pic_url: `${data.file_url}?t=${Date.now()}` }));
      } else {
        await apiClient.post("/user/profile/update-banner", {
          user_id: profile.id,
          url: data.file_url
        });
        setFormData(p => ({ ...p, banner_url: `${data.file_url}?t=${Date.now()}` }));
      }

    } catch (err) {
      console.error(`${type} upload failed:`, err);
    } finally {
      if (type === "profile") setUploadingAvatar(false);
      else setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (activeStep === 0) {
      if (!formData.full_name) newErrors.full_name = true;
      if (!formData.gender) newErrors.gender = true;
      if (!formData.profile_pic_url) newErrors.profile = true;
      if (!formData.banner_url) newErrors.banner = true;
    } else if (activeStep === 1) {
      if (!formData.bio) newErrors.bio = true;
      if (!formData.location_country) newErrors.location_country = true;
      if (!formData.location_state) newErrors.location_state = true;
      if (!formData.location_city) newErrors.location_city = true;
      if (!formData.dob_day || !formData.dob_month || !formData.dob_year) newErrors.dob = true;
      if (!formData.languages) newErrors.languages = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }
    setFormErrors({});

    if (activeStep < steps.length - 1) {
      handleNext();
      return;
    }

    setLoading(true);
    try {
      const formattedDob = (formData.dob_year && formData.dob_month && formData.dob_day)
        ? `${formData.dob_year}-${formData.dob_month.padStart(2, '0')}-${formData.dob_day.padStart(2, '0')}`
        : "";

      const countryName = gazeteer.Countries.find(c => c.code === formData.location_country)?.name || "";
      const stateName = formData.location_state || "";
      const cityName = formData.location_city;
      const fullLocationString = [cityName, stateName, countryName].filter(Boolean).join(", ");

      await updateProfile({
        user_id: profile.id,
        full_name: formData.full_name,
        bio: formData.bio,
        location: fullLocationString,
        languages: formData.languages ? [formData.languages.e || formData.languages] : [],
        gender: formData.gender,
        dob: formattedDob
      });

      window.location.reload();
    } catch (err) {
      console.error("Setup failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isInstitute) {
    return <InstituteSetupOverlay profile={profile} />;
  }

  return (
    <Box sx={{
      position: 'fixed',
      inset: 0,
      zIndex: 1200,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 86, 179, 0.1)',
      backdropFilter: 'blur(15px)',
      p: { xs: 0, sm: 2 },
      overflow: 'hidden'
    }}>
      <Paper
        elevation={0}
        component={Motion.div}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        sx={{

          display: "flex",
          flexDirection: "column",
          width: { xs: "100%", sm: "680px" },
          minHeight: { xs: "100%", sm: "auto" },
          borderRadius: { xs: 0, sm: "28px" },
          background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.25) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.2) 0, transparent 50%), 
            radial-gradient(at 80% 100%, rgba(40, 167, 69, 0.15) 0, transparent 50%),
            radial-gradient(at 20% 100%, rgba(0, 86, 179, 0.1) 0, transparent 50%),
            #ffffff
          `,
          border: "1px solid #E2E8F0",
          boxShadow: "none"
        }}
      >
        <Box sx={{ px: { xs: 3, sm: 8 }, py: { xs: 6, sm: 8 } }}>

          {/* Header / Title Section */}
          <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", letterSpacing: "-0.5px", fontSize: "26px" }}>
                {isInstitute ? "संस्थान सेटअप" : "प्रोफ़ाइल सेटअप"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5, fontSize: "14px" }}>
                अपनी प्रोफ़ाइल पूरी करें और आगे बढ़ें।
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box component="img" src="/logo.svg" alt="Tarang Logo" sx={{ width: 48, height: 48, objectFit: "contain" }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", letterSpacing: "-1px", fontSize: "26px", fontFamily: "'Rozha One', serif" }}>{"Tarang"}</Typography>
            </Box>
          </Box>

          
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {activeStep === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ position: 'relative', mb: 5 }}>
                  <Box
                    sx={{
                      width: '100%', height: 160, borderRadius: '12px',
                      backgroundColor: '#F3F4F6',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      border: formErrors.banner ? '2px dashed #ef4444' : ((formData.banner_url && formData.banner_url !== 'null' && formData.banner_url !== 'undefined' && formData.banner_url.trim() !== '') ? '1px solid #E5E7EB' : '2px dashed #CBD5E1'),
                      cursor: 'pointer', overflow: 'hidden', position: 'relative',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: (formData.banner_url && formData.banner_url !== 'null' && formData.banner_url !== 'undefined' && formData.banner_url.trim() !== '') ? '#D1D5DB' : '#9CA3AF',
                      }
                    }}
                    onClick={() => { bannerInputRef.current?.click(); if(formErrors.banner) setFormErrors(p => ({...p, banner: false})); }}
                  >
                    {(formData.banner_url && formData.banner_url !== 'null' && formData.banner_url !== 'undefined' && formData.banner_url.trim() !== '') && (
                      <Box
                        component="img"
                        src={formData.banner_url}
                        alt=""
                        onError={(e) => { e.target.style.display = 'none'; }}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
                      />
                    )}
                    {(!formData.banner_url || formData.banner_url === 'null' || formData.banner_url === 'undefined' || formData.banner_url.trim() === '') && !uploadingBanner && <CloudUploadIcon sx={{ color: formErrors.banner ? '#ef4444' : '#94A3B8', fontSize: 48, position: 'relative', zIndex: 1 }} />}
                    {uploadingBanner && <Box sx={{ position: 'relative', zIndex: 2 }}><Loader mini /></Box>}
                    <input
                      type="file"
                      ref={bannerInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "banner")}
                    />
                  </Box>

                  <Box sx={{ position: 'absolute', bottom: -44, left: 32, zIndex: 10 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        src={formData.profile_pic_url}
                        sx={{
                          width: 104,
                          height: 104,
                          border: formErrors.profile ? '4px solid #ef4444' : '4px solid #ffffff',
                          bgcolor: '#F3F4F6',
                          boxShadow: 'none',
                          fontSize: '36px',
                          fontWeight: 600,
                          color: '#9CA3AF'
                        }}
                      >
                        {formData.full_name?.charAt(0) || <PersonIcon sx={{ fontSize: 48, color: '#D1D5DB' }} />}
                      </Avatar>

                      <IconButton
                        disabled={uploadingAvatar}
                        onClick={() => { avatarInputRef.current?.click(); if(formErrors.profile) setFormErrors(p => ({...p, profile: false})); }}
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          bgcolor: '#ffffff',
                          color: '#374151',
                          border: '1px solid #E5E7EB',
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#F9FAFB' }
                        }}
                        size="small"
                      >
                        {uploadingAvatar ? <Loader mini /> : <PhotoCameraIcon sx={{ fontSize: 16 }} />}
                        <input
                          type="file"
                          ref={avatarInputRef}
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "profile")}
                        />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr' }, gap: 2 }}>
                  <Box>
                    <LabelTypography>पूरा नाम *</LabelTypography>
                    <TextField
                      fullWidth
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      placeholder="अपना नाम दर्ज करें"
                      sx={fieldSx}
                      error={!!formErrors.full_name}
                    />
                  </Box>
                  <Box>
                    <LabelTypography>लिंग *</LabelTypography>
                    <Autocomplete
                      options={["पुरुष", "महिला", "अन्य"]}
                      value={formData.gender === "Male" ? "पुरुष" : formData.gender === "Female" ? "महिला" : formData.gender === "Other" ? "अन्य" : (formData.gender || null)}
                      onChange={(e, val) => {
                        const mapping = { "पुरुष": "Male", "महिला": "Female", "अन्य": "Other" };
                        handleAutocompleteChange("gender", Reflect.get(mapping, val) || val || "");
                      }}
                      renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "चुनें", sx: fieldSx, error: !!formErrors.gender })}
                      slotProps={{ paper: { sx: menuPaperSx } }}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {activeStep === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <LabelTypography>बायो / विवरण *</LabelTypography>
                  <TextField
                    fullWidth
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    multiline
                    minRows={2}
                    maxRows={2}
                    required
                    placeholder="अपने बारे में कुछ लिखें..."
                    sx={[fieldSx, { "& .MuiOutlinedInput-root": { height: "76px", padding: "10px 14px", alignItems: "flex-start" } }]}
                    error={!!formErrors.bio}
                  />
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <LabelTypography>देश *</LabelTypography>
                    <Autocomplete
                      options={countries}
                      getOptionLabel={(option) => {
                        const iso = typeof option === 'string' ? option : option?.code;
                        const found = countries.find(c => c.code === iso);
                        return found ? found.name : (iso || "");
                      }}
                      value={countries.find(c => c.code === formData.location_country) || null}
                      onChange={(e, val) => handleAutocompleteChange("location_country", val?.code || "")}
                      renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "चुनें", sx: fieldSx, error: !!formErrors.location_country })}
                      slotProps={{ paper: { sx: menuPaperSx } }}
                    />
                  </Box>

                  <Box>
                    <LabelTypography>राज्य *</LabelTypography>
                    <Autocomplete
                      disabled={!formData.location_country}
                      options={states}
                      getOptionLabel={(option) => {
                        const iso = typeof option === 'string' ? option : option?.isoCode;
                        const found = states.find(s => s.isoCode === iso);
                        return found ? found.name : (iso || "");
                      }}
                      value={states.find(s => s.isoCode === formData.location_state) || null}
                      onChange={(e, val) => handleAutocompleteChange("location_state", val?.isoCode || "")}
                      renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "चुनें", sx: fieldSx, error: !!formErrors.location_state })}
                      slotProps={{ paper: { sx: menuPaperSx } }}
                    />
                  </Box>

                  <Box>
                    <LabelTypography>ज़िला *</LabelTypography>
                    <Autocomplete
                      disabled={!formData.location_state}
                      options={cities.map(c => c.name)}
                      getOptionLabel={(option) => typeof option === 'string' ? option : ""}
                      value={formData.location_city || null}
                      onChange={(e, val) => handleAutocompleteChange("location_city", val || "")}
                      renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "चुनें", sx: fieldSx, error: !!formErrors.location_city })}
                      slotProps={{ paper: { sx: menuPaperSx } }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.5fr 1fr' }, gap: 2 }}>
                  <Box>
                    <LabelTypography>जन्म तिथि *</LabelTypography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 1.5 }}>
                      <Autocomplete
                        options={Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: toDevanagari(i + 1) }))}
                        getOptionLabel={(option) => typeof option === 'string' ? option : (option.label || "")}
                        value={Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: toDevanagari(i + 1) })).find(o => o.value === formData.dob_day) || null}
                        onChange={(e, val) => {
                           setFormData(p => ({ ...p, dob_day: val ? val.value : "" }));
                           if(formErrors.dob) setFormErrors(prev => ({...prev, dob: false}));
                        }}
                        renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "दिन", sx: fieldSx, error: !!formErrors.dob })}
                        slotProps={{ paper: { sx: menuPaperSx } }}
                      />
                      <Autocomplete
                        options={["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"].map((m, i) => ({ label: m, value: (i + 1).toString() }))}
                        getOptionLabel={(option) => typeof option === 'string' ? option : (option.label || "")}
                        value={["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"].map((m, i) => ({ label: m, value: (i + 1).toString() })).find(o => o.value === formData.dob_month) || null}
                        onChange={(e, val) => {
                           setFormData(p => ({ ...p, dob_month: val ? val.value : "" }));
                           if(formErrors.dob) setFormErrors(prev => ({...prev, dob: false}));
                        }}
                        renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "महीना", sx: fieldSx, error: !!formErrors.dob })}
                        slotProps={{ paper: { sx: menuPaperSx } }}
                      />
                      <Autocomplete
                        options={Array.from({ length: 100 }, (_, i) => { const y = new Date().getFullYear() - i; return { value: y.toString(), label: toDevanagari(y) }; })}
                        getOptionLabel={(option) => typeof option === 'string' ? option : (option.label || "")}
                        value={Array.from({ length: 100 }, (_, i) => { const y = new Date().getFullYear() - i; return { value: y.toString(), label: toDevanagari(y) }; }).find(o => o.value === formData.dob_year) || null}
                        onChange={(e, val) => {
                           setFormData(p => ({ ...p, dob_year: val ? val.value : "" }));
                           if(formErrors.dob) setFormErrors(prev => ({...prev, dob: false}));
                        }}
                        renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "वर्ष", sx: fieldSx, error: !!formErrors.dob })}
                        slotProps={{ paper: { sx: menuPaperSx } }}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <LabelTypography>भाषा *</LabelTypography>
                    <Autocomplete
                      options={sortedLanguages}
                      getOptionLabel={(option) => typeof option === 'string' ? option : (option?.h || "")}
                      value={(() => {
                        if (!formData.languages) return null;
                        const found = sortedLanguages.find(lo => lo.e === formData.languages || lo.h === formData.languages);
                        return found || { h: formData.languages, e: formData.languages };
                      })()}
                      onChange={(e, val) => handleAutocompleteChange("languages", val?.e || "")}
                      renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "चुनें", sx: fieldSx, error: !!formErrors.languages })}
                      slotProps={{ paper: { sx: menuPaperSx } }}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2.5, borderTop: '1px solid #F3F4F6' }}>
              <Button 
                disabled={activeStep === 0} 
                onClick={handleBack} 
                variant="outlined"
                sx={{ 
                  py: 1.2, 
                  px: 4, 
                  minWidth: { xs: '100px', sm: '130px' },
                  borderRadius: '8px', 
                  textTransform: 'none', 
                  fontSize: '15px', 
                  fontWeight: 600, 
                  color: '#475569', 
                  borderColor: '#CBD5E1', 
                  '&.Mui-disabled': { color: '#94A3B8', borderColor: '#E2E8F0', opacity: 1 } 
                }}
              >
                पीछे
              </Button>
              <Button 
                type="submit" 
                variant="contained" disableElevation 
                disabled={
                  loading || uploadingBanner || uploadingAvatar || 
                  (activeStep === 0 && (!formData.full_name?.trim() || !formData.gender)) ||
                  (activeStep === 1 && (!formData.bio?.trim() || !formData.location_country || !formData.location_state || !formData.location_city || !formData.dob_day || !formData.dob_month || !formData.dob_year || !formData.languages))
                }
                sx={{ 
                  py: 1.2, 
                  px: 4, 
                  minWidth: { xs: '100px', sm: '130px' }, 
                  borderRadius: '12px', 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)', 
                  boxShadow: 'none',
                  '&.Mui-disabled': { background: '#e2e8f0', color: '#94a3b8' }
                }}
              >
                {activeStep === steps.length - 1 ? (loading ? <Loader mini /> : "प्रोफ़ाइल सहेजें") : "आगे"}
              </Button>
            </Box>
          </form>
</Box>
      </Paper>
    </Box>
  );
}
