"use client";

import geoData from '../../../data/geoData.json';
import appConfig from '../../../data/appConfig.json';
const { stateDistricts: stateDistricts } = geoData;
const { miscData: miscData } = appConfig;
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
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  Autocomplete
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
import { Country, State, City } from 'country-state-city';
import {
  INDIAN_DISTRICTS_HINDI,
  LANGUAGES_HINDI_MAP,
  COUNTRIES_HINDI,
  INDIAN_STATES_HINDI,
  transliterateToHindi
} from '../../../lib/localization';

const LANGUAGE_OPTIONS = Object.entries(LANGUAGES_HINDI_MAP).map(([e, h]) => ({ h, e })).sort((a, b) => a.h.localeCompare(b.h));

const fontFam = "inherit";

const { devanagariDigits } = miscData;
const toDevanagari = (numStr) => {
  return numStr.toString().replace(/[0-9]/g, (w) => Reflect.get(devanagariDigits, w));
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(4px)",
    borderRadius: "12px",
    transition: "all 0.2s ease",
    "& fieldset": { borderColor: "rgba(203, 213, 225, 0.8)", borderWidth: "1.5px" },
    "&:hover fieldset": { borderColor: "#94a3b8" },
    "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
    "&.Mui-focused": {
      backgroundColor: "#ffffff",
    },
    "& input, & .MuiSelect-select": {
      color: "#111827",
      fontSize: "15px",
      fontWeight: 500
    },
    "& input::placeholder": { color: "#9CA3AF", opacity: 1 }
  }
};

const menuPaperSx = {
  borderRadius: "16px",
  mt: 1,
  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15), 0 4px 10px -5px rgba(0, 86, 179, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(20px)",
  backgroundColor: "rgba(255, 255, 255, 0.85)"
};

import InstituteSetupOverlay from "./InstituteSetupOverlay";

const LabelTypography = ({ children }) => (
  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "#374151", fontSize: "13px" }}>
    {children}
  </Typography>
);

export default function SetupOverlay({ profile }) {
  const isInstitute = profile?.role === 'institute' || profile?.role === 'organisation';
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

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


  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(() =>
    formData.location_country ? State.getStatesOfCountry(formData.location_country) : [],
    [formData.location_country]
  );
  const cities = useMemo(() => {
    if (!formData.location_country || !formData.location_state) return [];
    if (formData.location_country === 'IN') {
      const stateObj = State.getStateByCodeAndCountry(formData.location_state, 'IN');
      if (stateObj) {
        const districtList = Reflect.get(stateDistricts, stateObj.name) || [];
        if (districtList.length > 0) return districtList.map(name => ({ name }));
      }
      return [];
    }
    return City.getCitiesOfState(formData.location_country, formData.location_state);
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
            countryIso = foundCountry.isoCode;
            const foundState = State.getStatesOfCountry(foundCountry.isoCode).find(s => s.name === sName);
            if (foundState) {
              stateIso = foundState.isoCode;
              const districtList = Reflect.get(stateDistricts, foundState.name) || [];
              const exactMatch = districtList.find(dist => dist.toLowerCase() === cName.toLowerCase());
              cityValue = exactMatch || "";
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutocompleteChange = (name, value) => {
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
        setFormData(p => ({ ...p, profile_pic_url: data.file_url }));
      } else {
        await apiClient.post("/user/profile/update-banner", {
          user_id: profile.id,
          url: data.file_url
        });
        setFormData(p => ({ ...p, banner_url: data.file_url }));
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
    setLoading(true);
    try {
      const formattedDob = (formData.dob_year && formData.dob_month && formData.dob_day)
        ? `${formData.dob_year}-${formData.dob_month.padStart(2, '0')}-${formData.dob_day.padStart(2, '0')}`
        : "";

      const countryName = Country.getCountryByCode(formData.location_country)?.name || "";
      const stateName = State.getStateByCodeAndCountry(formData.location_state, formData.location_country)?.name || "";
      const cityName = formData.location_city;
      const fullLocationString = [cityName, stateName, countryName].filter(Boolean).join(", ");

      await updateProfile({
        user_id: profile.id,
        full_name: !isInstitute ? formData.full_name : undefined,
        institution_name: isInstitute ? formData.institution_name : undefined,
        bio: formData.bio,
        location: fullLocationString,
        languages: formData.languages ? [formData.languages.e || formData.languages] : [],
        gender: !isInstitute ? formData.gender : undefined,
        dob: !isInstitute ? formattedDob : undefined
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
      overflow: 'auto'
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
          boxShadow: { sm: "0 25px 50px -12px rgba(0,0,0,0.3)" },
          overflowY: 'auto',
          maxHeight: '92vh',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#CBD5E1', borderRadius: "8px" }
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

          {/* Banner & Avatar Upload Zone */}
          <Box sx={{ position: 'relative', mb: 7 }}>

            {/* Banner Upload Box */}
            <Box sx={{
              height: '160px',
              borderRadius: { xs: 0, sm: "28px" },
              backgroundColor: formData.banner_url ? 'transparent' : '#F3F4F6',
              backgroundImage: formData.banner_url ? `url(${formData.banner_url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: formData.banner_url ? '1px solid #E5E7EB' : '2px dashed #D1D5DB',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 0.2s',
              cursor: 'pointer',
              '&:hover': {
                borderColor: formData.banner_url ? '#D1D5DB' : '#9CA3AF',
                backgroundColor: formData.banner_url ? 'transparent' : '#E5E7EB'
              }
            }}
              onClick={() => !uploadingBanner && bannerInputRef.current?.click()}
            >
              {uploadingBanner ? (
                <Loader mini />
              ) : (
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  backgroundColor: formData.banner_url ? 'rgba(255,255,255,0.9)' : 'transparent',
                  backdropFilter: formData.banner_url ? 'blur(4px)' : 'none',
                  px: 2, py: 1, borderRadius: '8px',
                  color: '#4B5563', fontWeight: 600, fontSize: '13px',
                  boxShadow: formData.banner_url ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}>
                  <PhotoCameraIcon fontSize="small" sx={{ color: '#6B7280' }} />
                  {formData.banner_url ? "कवर बदलें" : "कवर फ़ोटो अपलोड करें"}
                </Box>
              )}
              <input
                type="file"
                ref={bannerInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "banner")}
              />
            </Box>

            {/* Avatar Overlap */}
            {!isInstitute && (
              <Box sx={{ position: 'absolute', bottom: -44, left: 32, zIndex: 10 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={formData.profile_pic_url}
                    sx={{
                      width: 104,
                      height: 104,
                      border: '4px solid #ffffff',
                      bgcolor: '#F3F4F6',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      fontSize: '36px',
                      fontWeight: 600,
                      color: '#9CA3AF'
                    }}
                  >
                    {formData.full_name?.charAt(0) || <PersonIcon sx={{ fontSize: 48, color: '#D1D5DB' }} />}
                  </Avatar>

                  <IconButton
                    disabled={uploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: '#ffffff',
                      color: '#374151',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
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
            )}
          </Box>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>

              {!isInstitute ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr' }, gap: 1.25 }}>
                  <Box>
                    <LabelTypography>पूरा नाम *</LabelTypography>
                    <TextField
                      fullWidth
                      value={formData.full_name}
                      onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
                      required
                      placeholder="अपना नाम दर्ज करें"
                      sx={fieldSx}
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
                      renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "चुनें", sx: fieldSx })}
                      slotProps={{ paper: { sx: menuPaperSx } }}
                    />
                  </Box>
                </Box>
              ) : (
                <Box>
                  <LabelTypography>संस्थान का नाम *</LabelTypography>
                  <TextField
                    fullWidth
                    value={formData.institution_name}
                    onChange={(e) => setFormData(p => ({ ...p, institution_name: e.target.value }))}
                    required
                    placeholder="संस्थान का नाम दर्ज करें"
                    sx={fieldSx}
                  />
                </Box>
              )}

              <Box>
                <LabelTypography>बायो / विवरण *</LabelTypography>
                <TextField
                  fullWidth
                  value={formData.bio}
                  onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                  multiline
                  rows={2}
                  required
                  placeholder="अपने बारे में कुछ लिखें..."
                  sx={fieldSx}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.25 }}>
                <Box>
                  <LabelTypography>देश *</LabelTypography>
                  <Autocomplete
                    options={countries}
                    getOptionLabel={(option) => {
                      const iso = typeof option === 'string' ? option : option?.isoCode;
                      const found = countries.find(c => c.isoCode === iso);
                      return found ? (Reflect.get(COUNTRIES_HINDI, found.isoCode) || transliterateToHindi(found.name)) : (iso || "");
                    }}
                    value={countries.find(c => c.isoCode === formData.location_country) || null}
                    onChange={(e, val) => handleAutocompleteChange("location_country", val?.isoCode || "")}
                    renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "चुनें", sx: fieldSx })}
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
                      return found ? (Reflect.get(INDIAN_STATES_HINDI, found.isoCode) || transliterateToHindi(found.name)) : (iso || "");
                    }}
                    value={states.find(s => s.isoCode === formData.location_state) || null}
                    onChange={(e, val) => handleAutocompleteChange("location_state", val?.isoCode || "")}
                    renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "चुनें", sx: fieldSx })}
                    slotProps={{ paper: { sx: menuPaperSx } }}
                  />
                </Box>

                <Box>
                  <LabelTypography>ज़िला *</LabelTypography>
                  <Autocomplete
                    disabled={!formData.location_state}
                    options={cities.map(c => c.name)}
                    getOptionLabel={(option) => typeof option === 'string' ? (Reflect.get(INDIAN_DISTRICTS_HINDI, option) || transliterateToHindi(option)) : ""}
                    value={formData.location_city || null}
                    onChange={(e, val) => handleAutocompleteChange("location_city", val || "")}
                    renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "चुनें", sx: fieldSx })}
                    slotProps={{ paper: { sx: menuPaperSx } }}
                  />
                </Box>
              </Box>

              {!isInstitute ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.5fr 1fr' }, gap: 1.25 }}>
                  <Box>
                    <LabelTypography>जन्म तिथि *</LabelTypography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 1.5 }}>
                      <Autocomplete
                          options={Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: toDevanagari(i + 1) }))}
                          getOptionLabel={(option) => typeof option === 'string' ? option : (option.label || "")}
                          value={Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: toDevanagari(i + 1) })).find(o => o.value === formData.dob_day) || null}
                          onChange={(e, val) => setFormData(p => ({ ...p, dob_day: val ? val.value : "" }))}
                          renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "दिन", sx: fieldSx })}
                          slotProps={{ paper: { sx: menuPaperSx } }}
                      />
                      <Autocomplete
                          options={["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"].map((m, i) => ({ label: m, value: (i + 1).toString() }))}
                          getOptionLabel={(option) => typeof option === 'string' ? option : (option.label || "")}
                          value={["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"].map((m, i) => ({ label: m, value: (i + 1).toString() })).find(o => o.value === formData.dob_month) || null}
                          onChange={(e, val) => setFormData(p => ({ ...p, dob_month: val ? val.value : "" }))}
                          renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "महीना", sx: fieldSx })}
                          slotProps={{ paper: { sx: menuPaperSx } }}
                      />
                      <Autocomplete
                          options={Array.from({ length: 100 }, (_, i) => { const y = new Date().getFullYear() - i; return { value: y.toString(), label: toDevanagari(y) }; })}
                          getOptionLabel={(option) => typeof option === 'string' ? option : (option.label || "")}
                          value={Array.from({ length: 100 }, (_, i) => { const y = new Date().getFullYear() - i; return { value: y.toString(), label: toDevanagari(y) }; }).find(o => o.value === formData.dob_year) || null}
                          onChange={(e, val) => setFormData(p => ({ ...p, dob_year: val ? val.value : "" }))}
                          renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "वर्ष", sx: fieldSx })}
                          slotProps={{ paper: { sx: menuPaperSx } }}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <LabelTypography>भाषा *</LabelTypography>
                    <Autocomplete
                      options={LANGUAGE_OPTIONS}
                      getOptionLabel={(option) => typeof option === 'string' ? option : (option?.h || "")}
                      value={(() => {
                        if (!formData.languages) return null;
                        const found = LANGUAGE_OPTIONS.find(lo => lo.e === formData.languages || lo.h === formData.languages);
                        return found || { h: formData.languages, e: formData.languages };
                      })()}
                      onChange={(e, val) => handleAutocompleteChange("languages", val)}
                      renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "चुनें", sx: fieldSx })}
                      slotProps={{ paper: { sx: menuPaperSx } }}
                    />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr' } }}>
                  <Box>
                    <LabelTypography>भाषा *</LabelTypography>
                    <Autocomplete
                      options={LANGUAGE_OPTIONS}
                      getOptionLabel={(option) => typeof option === 'string' ? option : (option?.h || "")}
                      value={(() => {
                        if (!formData.languages) return null;
                        const found = LANGUAGE_OPTIONS.find(lo => lo.e === formData.languages || lo.h === formData.languages);
                        return found || { h: formData.languages, e: formData.languages };
                      })()}
                      onChange={(e, val) => handleAutocompleteChange("languages", val)}
                      renderInput={(params) => React.createElement(TextField, { ...params, required: true, placeholder: "चुनें", sx: fieldSx })}
                      slotProps={{ paper: { sx: menuPaperSx } }}
                    />
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, mt: 3, pt: 3, borderTop: '1px solid #F3F4F6' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => router.push("/")}
                  disabled={loading}
                  disableElevation
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    textTransform: "none",
                    fontSize: "15px",
                    fontWeight: 600,
                    borderColor: "#D1D5DB",
                    color: "#374151",
                    "&:hover": {
                      borderColor: "#9CA3AF",
                      backgroundColor: "#F9FAFB"
                    }
                  }}
                >
                  बाद में
                </Button>
                <Button
                  fullWidth
                  variant="contained" disableElevation
                  type="submit"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    textTransform: "none",
                    fontSize: "16px",
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)',
                    color: '#ffffff',
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #004494 0%, #218838 100%)',
                    }
                  }}
                >
                  {loading ? <Loader mini /> : "प्रोफ़ाइल सहेजें"}
                </Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Paper>
    </Box>
  );
}
