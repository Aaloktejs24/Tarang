"use client";

import authConfigData from '../../../data/instituteConfig.json';
import gazeteer from '../../../data/formated/gazeteer.json';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { sortLocationsByDistance } from '../../../lib/geoNormalize';

const COUNTRY_CODES = gazeteer.Countries.map(c => ({ ...c, code: c.phoneCode, enName: c.name, label: c.phoneCode }));
const INDIA_STATES = (gazeteer.Countries.find(c => c.code === 'IN')?.states) || [];
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable security/detect-object-injection */

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Typography, TextField, Button, Paper,
  Stepper, Step, StepLabel, Autocomplete, MenuItem, Select, FormControl, Checkbox, ListItemText, OutlinedInput,
  Avatar, IconButton, InputAdornment, Popover, List, ListItemButton
} from "@mui/material";
import { motion as Motion } from "framer-motion";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import BusinessIcon from "@mui/icons-material/Business";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/navigation";
import { updateProfile } from "../authService";
import { apiClient } from "../../../lib/apiClient";
import Loader from "../../../components/common/Loader";
import useScrollLock from "../../../hooks/useScrollLock";
import { useLoading } from '../../../contexts/LoadingContext';

const fontFam = "inherit";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    fontFamily: fontFam,
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
  "& .MuiAutocomplete-inputRoot": {
    padding: "4px 8px !important",
  },
  "& .MuiAutocomplete-inputRoot .MuiAutocomplete-input": {
    padding: "8.5px 6px !important",
  },
  "& .MuiFormHelperText-root": { color: "#ef4444", fontSize: "12px", mt: 0.5 },
  "& .MuiInputLabel-root": {
    fontFamily: fontFam,
    color: "#64748b",
    fontSize: "14px",
    "&.Mui-focused": {
      color: "#0056b3",
      fontWeight: 500
    }
  }
};

const menuPaperSx = {
  borderRadius: "8px",
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
  "& .MuiAutocomplete-groupLabel": {
    fontFamily: fontFam,
    fontWeight: 700,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: "#94a3b8",
    backgroundColor: "transparent",
    padding: "16px 16px 6px 16px !important",
    lineHeight: "1.2",
    position: "static"
  },
  "& .MuiAutocomplete-groupUl": {
    padding: 0,
    margin: 0
  },
  "& .MuiAutocomplete-option, & .MuiMenuItem-root": {
    borderRadius: "8px",
    margin: "2px 4px",
    padding: "10px 14px",
    fontSize: "15px",
    color: "#334155",
    fontWeight: 500,
    fontFamily: fontFam,
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

const LabelTypography = ({ children }) => (
  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px", fontFamily: fontFam }}>
    {children}
  </Typography>
);

const {
  steps,
  instituteCategoryOptions,
  educationLevels,
  courseOptions,
  campusTypes,
  centralUniversitiesList,
  noChildTypes
} = authConfigData;

const affiliationOptionsMap = {
  ...authConfigData.affiliationOptionsMap,
  'Constituent College (Central Univ)': centralUniversitiesList,
  'Affiliated Autonomous College (Central Univ)': centralUniversitiesList,
  'Affiliated Non-Autonomous College (Central Univ)': centralUniversitiesList
};

export default function InstituteSetupOverlay({ profile }) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  useScrollLock(true);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingVerificationDoc, setUploadingVerificationDoc] = useState(false);
  const [uploadingContactDoc, setUploadingContactDoc] = useState(false);
  const [uploadedFileNames, setUploadedFileNames] = useState({});

  const [phoneAnchorEl, setPhoneAnchorEl] = useState(null);
  const [activePhoneField, setActivePhoneField] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const verificationDocRef = useRef(null);
  const contactDocRef = useRef(null);

  const [formErrors, setFormErrors] = useState({});

  const ip = profile?.institute_profile || {};

  const [formData, setFormData] = useState({
    institution_name: profile?.institution_name || "",
    bio: profile?.bio || "",
    banner_url: profile?.banner_url || "",
    profile_pic_url: profile?.profile_pic_url || "",

    institute_type: ip.institute_type || "",
    affiliation_board: ip.affiliation_board || "",
    established_year: ip.established_year || "",
    registration_number: ip.registration_number || "",

    primary_contact_name: ip.primary_contact_name || "",
    primary_contact_designation: ip.primary_contact_designation || "",
    official_phone: ip.official_phone || "",
    official_country_code: ip.official_country_code || "+91",
    official_email: ip.official_email || "",
    website_url: ip.website_url || "",
    alternate_contact: ip.alternate_contact || "",
    alternate_country_code: ip.alternate_country_code || "+91",

    location_country: "",
    location_state: "",
    location_city: "",
    address_line: ip.address_line || "",
    pincode: ip.pincode || "",

    courses_offered: (() => {
      if (!ip.courses_offered) return [];
      try {
        const parsed = JSON.parse(ip.courses_offered);
        return Array.isArray(parsed) ? parsed : [String(parsed)];
      } catch (e) {
        return typeof ip.courses_offered === 'string' ? ip.courses_offered.split(',').map(s => s.trim()).filter(Boolean) : [];
      }
    })(),
    education_levels: ip.education_levels ? JSON.parse(ip.education_levels) : [],
    student_count: ip.student_count || "",
    faculty_count: ip.faculty_count || "",
    campus_type: ip.campus_type || "",
    operating_hours: ip.operating_hours || "",

    license_certificate_url: ip.license_certificate_url || "",
    accreditation_docs: ip.accreditation_docs || ""
  });

  const handlePhoneClick = (event, fieldType) => {
    setPhoneAnchorEl(event.currentTarget);
    setActivePhoneField(fieldType);
  };

  const handlePhoneClose = () => {
    setPhoneAnchorEl(null);
    setActivePhoneField(null);
    setSearchQuery("");
  };

  const filteredCountries = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.enName && c.enName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.code.includes(searchQuery)
  );

  const handleCountrySelect = (code) => {
    setFormData(prev => ({
      ...prev,
      [activePhoneField === 'official' ? 'official_country_code' : 'alternate_country_code']: code
    }));
    handlePhoneClose();
  };

  const { userLocation } = useAccessibility();

  const countries = useMemo(() => 
    sortLocationsByDistance(gazeteer.Countries, userLocation?.lat, userLocation?.lon, 'countries')
  , [userLocation]);

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

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: currentYear - 1850 + 1 }, (_, i) => (currentYear - i).toString()), [currentYear]);

  useEffect(() => {
    if (profile?.location) {
      const parts = profile.location.split(", ").map(p => p.trim());
      if (parts.length >= 3) {
        const [cName, sName, cntryName] = parts;
        const foundCountry = countries.find(c => c.name === cntryName);
        if (foundCountry) {
          const cIso = foundCountry.code;
          const foundState = cIso === 'IN' ? sName : null;
          if (foundState) {
            const sIso = foundState;
            const stateObj = INDIA_STATES.find(s => s.name === foundState);
            const districtList = stateObj ? stateObj.districts.map(d => d.name) : [];
            const exactMatch = districtList.find(dist => dist.toLowerCase() === cName.toLowerCase());

            setFormData(p => ({
              ...p,
              location_country: cIso,
              location_state: sIso,
              location_city: exactMatch || cName
            }));
          }
        }
      }
    }
  }, [profile, countries]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (Reflect.get(formErrors, name)) setFormErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleLevelChange = (event) => {
    const { target: { value } } = event;
    setFormData(p => ({ ...p, education_levels: typeof value === 'string' ? value.split(',') : value }));
    if (formErrors.education_levels) setFormErrors(prev => ({ ...prev, education_levels: false }));
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
    if (Reflect.get(formErrors, name)) setFormErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleFileUpload = async (e, fieldName, setUploading) => {
    const file = e.target.files[0];
    if (!file) return;

    let mimeType = file.type;
    if (!mimeType) {
      if (file.name.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';
      else if (file.name.toLowerCase().match(/\.jpe?g$/)) mimeType = 'image/jpeg';
      else if (file.name.toLowerCase().endsWith('.png')) mimeType = 'image/png';
    }

    setUploading(true);
    try {
      const { data } = await apiClient.get(`/s3/sign`, {
        params: { user_id: profile.id, type: fieldName, mime: mimeType }
      });
      await fetch(data.upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });

      if (fieldName === 'banner') {
        await apiClient.post("/user/profile/update-banner", {
          user_id: profile.id,
          url: data.file_url
        });
        setFormData(p => ({ ...p, banner_url: `${data.file_url}?t=${Date.now()}` }));
      } else if (fieldName === 'profile') {
        await apiClient.post("/user/profile/update-pic", {
          user_id: profile.id,
          url: data.file_url
        });
        setFormData(p => ({ ...p, profile_pic_url: `${data.file_url}?t=${Date.now()}` }));
      } else {
        setFormData(p => ({ ...p, [fieldName]: data.file_url }));
        setUploadedFileNames(p => ({ ...p, [fieldName]: file.name }));
      }

    } catch (err) {
      console.error(`${fieldName} upload failed:`, err);
      alert(err.response?.data?.error || "File upload failed. Please ensure the backend is running and the file is a PDF, JPG, or PNG.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (activeStep === 0) {
      if (!formData.profile_pic_url || !formData.banner_url) {
        newErrors.banner = !formData.banner_url;
        newErrors.profile = !formData.profile_pic_url;
      }
      if (!formData.institution_name) newErrors.institution_name = true;
      if (!formData.institute_type) newErrors.institute_type = true;
      if (!formData.established_year) newErrors.established_year = true;
      if (!formData.registration_number) newErrors.registration_number = true;
      if (!formData.bio) newErrors.bio = true;

      const bioWordCount = formData.bio ? formData.bio.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
      if (formData.bio && bioWordCount < 100) newErrors.bio = true;

      if (!noChildTypes.includes(formData.institute_type) && !formData.affiliation_board) {
        newErrors.affiliation_board = true;
      }
    } else if (activeStep === 1) {
      if (!formData.official_phone) newErrors.official_phone = true;
      if (!formData.official_email) newErrors.official_email = true;
      if (!formData.website_url) newErrors.website_url = true;
      if (!formData.alternate_contact) newErrors.alternate_contact = true;
      if (!formData.location_country) newErrors.location_country = true;
      if (!formData.location_state) newErrors.location_state = true;
      if (!formData.location_city) newErrors.location_city = true;
      if (!formData.pincode) newErrors.pincode = true;
    } else if (activeStep === 2) {
      if (!formData.courses_offered || formData.courses_offered.length === 0) newErrors.courses_offered = true;
      if (!formData.education_levels || !formData.education_levels.length) newErrors.education_levels = true;
      if (!formData.accreditation_docs) newErrors.accreditation_docs = true;
      if (!formData.license_certificate_url) newErrors.license_certificate_url = true;
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
      const countryName = gazeteer.Countries.find(c => c.code === formData.location_country)?.name || "";
      const stateName = formData.location_state || "";
      const fullLocationString = [formData.location_city, stateName, countryName].filter(Boolean).join(", ");

      const institute_profile = {
        institute_type: formData.institute_type,
        established_year: parseInt(formData.established_year) || 0,
        registration_number: formData.registration_number,
        primary_contact_name: formData.primary_contact_name,
        primary_contact_designation: formData.primary_contact_designation,
        official_phone: formData.official_phone,
        official_country_code: formData.official_country_code,
        official_email: formData.official_email,
        website_url: formData.website_url,
        alternate_contact: formData.alternate_contact,
        alternate_country_code: formData.alternate_country_code,
        courses_offered: formData.courses_offered,
        education_levels: formData.education_levels,
        student_count: parseInt(formData.student_count) || 0,
        faculty_count: parseInt(formData.faculty_count) || 0,
        campus_type: formData.campus_type,
        operating_hours: formData.operating_hours,
        license_certificate_url: formData.license_certificate_url,
        accreditation_docs: formData.accreditation_docs,
        address_line: formData.address_line,
        pincode: formData.pincode
      };

      await updateProfile({
        user_id: profile.id,
        institution_name: formData.institution_name,
        bio: formData.bio,
        location: fullLocationString,
        institute_profile: institute_profile
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <Box sx={{ mb: 2 }}>
              <LabelTypography>संस्थान की कवर फ़ोटो (Cover Photo) और लोगो (Logo) *</LabelTypography>
              <Box sx={{ position: 'relative', mb: 6 }}>
                <Box
                  sx={{
                    width: '100%', height: 160, borderRadius: '12px',
                    backgroundColor: '#F3F4F6',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    border: formErrors.banner ? '2px dashed #d32f2f' : ((formData.banner_url && formData.banner_url !== 'null' && formData.banner_url !== 'undefined' && formData.banner_url.trim() !== '') ? '1px solid #E5E7EB' : '2px dashed #CBD5E1'), cursor: 'pointer', overflow: 'hidden', position: 'relative'
                  }}
                  onClick={() => { bannerInputRef.current?.click(); if (formErrors.banner) setFormErrors(p => ({ ...p, banner: false })); }}
                >
                  {(formData.banner_url && formData.banner_url !== 'null' && formData.banner_url !== 'undefined' && formData.banner_url.trim() !== '') && (
                    <Box
                      component="img"
                      src={formData.banner_url}
                      alt="Cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
                    />
                  )}
                  {(!formData.banner_url || formData.banner_url === 'null' || formData.banner_url === 'undefined' || formData.banner_url.trim() === '') && !uploadingBanner && <CloudUploadIcon sx={{ color: formErrors.banner ? '#d32f2f' : '#94A3B8', fontSize: 48, position: 'relative', zIndex: 1 }} />}
                  {uploadingBanner && <Box sx={{ position: 'relative', zIndex: 2 }}><Loader mini /></Box>}
                  <input type="file" hidden ref={bannerInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'banner', setUploadingBanner)} />
                </Box>

                <Box sx={{ position: 'absolute', bottom: -44, left: 32, zIndex: 10 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={formData.profile_pic_url}
                      sx={{
                        width: 104,
                        height: 104,
                        border: formErrors.profile ? '4px solid #d32f2f' : '4px solid #ffffff',
                        bgcolor: '#F3F4F6',
                        boxShadow: 'none',
                        border: '1px solid #E2E8F0',
                        fontSize: '36px',
                        fontFamily: fontFam,
                        fontWeight: 600,
                        color: '#9CA3AF'
                      }}
                    >
                      {formData.institution_name?.charAt(0) || <BusinessIcon sx={{ fontSize: 48, color: '#D1D5DB' }} />}
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
                        onChange={(e) => handleFileUpload(e, 'profile', setUploadingAvatar)}
                      />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box>
              <LabelTypography>संस्थान का नाम *</LabelTypography>
              <TextField fullWidth name="institution_name" sx={fieldSx} value={formData.institution_name} onChange={handleChange} required placeholder="संस्थान का पूरा नाम (Full Name of Institution)" error={!!formErrors.institution_name} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '250px' }}>
                <LabelTypography>संस्थान का प्रकार *</LabelTypography>
                <Autocomplete
                  options={instituteCategoryOptions}
                  groupBy={(option) => option.category}
                  getOptionLabel={(option) => option.label}
                  value={instituteCategoryOptions.find(opt => opt.label === formData.institute_type) || null}
                  onChange={(_, val) => setFormData(p => ({ ...p, institute_type: val ? val.label : "", affiliation_board: "" }))}
                  renderInput={(params) => (
                    <TextField
                      id={params.id}
                      disabled={params.disabled}
                      fullWidth={params.fullWidth}
                      size={params.size}
                      InputLabelProps={params.InputLabelProps}
                      InputProps={params.InputProps}
                      inputProps={params.inputProps}
                      sx={fieldSx}
                      required={true}
                      placeholder="चुनें..."
                      error={!!formErrors.institute_type}
                    />
                  )}
                />
              </Box>

              {formData.institute_type && !noChildTypes.includes(formData.institute_type) && (
                <Box sx={{ flex: 1, minWidth: '250px' }}>
                  <LabelTypography>
                    {['National Board', 'State Board', 'International Board'].includes(formData.institute_type)
                      ? "बोर्ड का नाम (Board Name) *"
                      : "विश्वविद्यालय का नाम (Name of University) *"}
                  </LabelTypography>
                  <Autocomplete
                    key={formData.institute_type}
                    freeSolo
                    forcePopupIcon={true}
                    options={Reflect.get(affiliationOptionsMap, formData.institute_type) || []}
                    value={formData.affiliation_board || null}
                    onChange={(_, val) => setFormData(p => ({ ...p, affiliation_board: val || "" }))}
                    onInputChange={(_, val) => setFormData(p => ({ ...p, affiliation_board: val || "" }))}
                    renderInput={(params) => (
                      <TextField
                        id={params.id}
                        disabled={params.disabled}
                        fullWidth={params.fullWidth}
                        size={params.size}
                        InputLabelProps={params.InputLabelProps}
                        InputProps={params.InputProps}
                        inputProps={params.inputProps}
                        sx={fieldSx}
                        required={true}
                        placeholder="नाम दर्ज करें या चुनें..."
                        error={!!formErrors.affiliation_board}
                      />
                    )}
                    slotProps={{ paper: { sx: menuPaperSx } }}
                  />
                </Box>
              )}

            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '250px' }}>
                <LabelTypography>स्थापना वर्ष (Established Year) *</LabelTypography>
                <Autocomplete
                  options={years}
                  value={formData.established_year ? formData.established_year.toString() : null}
                  onChange={(_, v) => setFormData(p => ({ ...p, established_year: v || "" }))}
                  renderInput={(params) => (
                    <TextField
                      id={params.id}
                      disabled={params.disabled}
                      fullWidth={params.fullWidth}
                      size={params.size}
                      InputLabelProps={params.InputLabelProps}
                      InputProps={params.InputProps}
                      inputProps={params.inputProps}
                      sx={fieldSx}
                      required={true}
                      placeholder="वर्ष चुनें..."
                      error={!!formErrors.established_year}
                    />
                  )}
                  slotProps={{ paper: { sx: menuPaperSx } }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: '250px' }}>
                <LabelTypography>पंजीकरण संख्या (Registration Number) *</LabelTypography>
                <TextField fullWidth name="registration_number" sx={fieldSx} required value={formData.registration_number} onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value.toUpperCase() }))} placeholder="e.g. 123456789" error={!!formErrors.registration_number} />
              </Box>
            </Box>
            <Box>
              <LabelTypography>संस्थान के बारे में (About the Institution) * {formErrors.bio && <span style={{ color: '#d32f2f' }}>(कम से कम 100 शब्द आवश्यक)</span>}</LabelTypography>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="bio"
                sx={fieldSx}
                value={formData.bio}
                onChange={handleChange}
                required
                error={!!formErrors.bio}
                placeholder="कम से कम 100 शब्द लिखें... (Minimum 100 words...)"
                helperText={
                  formData.bio && formData.bio.trim().split(/\s+/).filter(w => w.length > 0).length < 100
                    ? `${100 - formData.bio.trim().split(/\s+/).filter(w => w.length > 0).length} शब्द और लिखें (words remaining to reach minimum)`
                    : formData.bio
                      ? `न्यूनतम शब्द सीमा पूरी हुई (${formData.bio.trim().split(/\s+/).filter(w => w.length > 0).length} शब्द)`
                      : ""
                }
                FormHelperTextProps={{
                  sx: {
                    color: (!formData.bio || formData.bio.trim().split(/\s+/).filter(w => w.length > 0).length < 100) ? '#d32f2f' : '#28a745',
                    fontWeight: 500,
                    ml: 0,
                    mt: 1
                  }
                }}
              />
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <LabelTypography>आधिकारिक फ़ोन (Official Phone) *</LabelTypography>
                <TextField
                  fullWidth
                  name="official_phone"
                  sx={fieldSx}
                  required
                  value={formData.official_phone}
                  onChange={handleChange}
                  placeholder="XXXXXXXXXX"
                  error={!!formErrors.official_phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box onClick={(e) => handlePhoneClick(e, 'official')} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mr: 1 }}>
                          <Typography sx={{ fontWeight: 600, color: '#0f172a', mr: 0.5 }}>{formData.official_country_code}</Typography>
                          <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                          <Box sx={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1', ml: 1 }} />
                        </Box>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <LabelTypography>आधिकारिक ईमेल (Official Email) *</LabelTypography>
                <TextField fullWidth name="official_email" sx={fieldSx} required value={formData.official_email} onChange={handleChange} placeholder="जैसे - info@institute.edu" error={!!formErrors.official_email} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <LabelTypography>वेबसाइट URL *</LabelTypography>
                <TextField fullWidth name="website_url" sx={fieldSx} required value={formData.website_url} onChange={handleChange} placeholder="जैसे - https://www.institute.edu" error={!!formErrors.website_url} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <LabelTypography>वैकल्पिक संपर्क (Alternate Contact) *</LabelTypography>
                <TextField
                  fullWidth
                  name="alternate_contact"
                  sx={fieldSx}
                  required
                  value={formData.alternate_contact}
                  onChange={handleChange}
                  placeholder="XXXXXXXXXX"
                  error={!!formErrors.alternate_contact}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box onClick={(e) => handlePhoneClick(e, 'alternate')} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mr: 1 }}>
                          <Typography sx={{ fontWeight: 600, color: '#0f172a', mr: 0.5 }}>{formData.alternate_country_code}</Typography>
                          <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                          <Box sx={{ width: '1px', height: '24px', backgroundColor: '#cbd5e1', ml: 1 }} />
                        </Box>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            </Box>


            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <LabelTypography>पिन कोड (Pincode) *</LabelTypography>
                <TextField fullWidth name="pincode" sx={fieldSx} required value={formData.pincode} onChange={handleChange} placeholder="जैसे - 110001" error={!!formErrors.pincode} />
              </Box>
              <Box>
                <LabelTypography>देश (Country) *</LabelTypography>
                <Autocomplete
                  options={countries}
                  getOptionLabel={(option) => {
                    const iso = typeof option === 'string' ? option : option?.code;
                    const found = countries.find(c => c.code === iso);
                    return found ? found.name : (iso || "");
                  }}
                  value={countries.find(c => c.code === formData.location_country) || null}
                  onChange={(e, val) => handleAutocompleteChange("location_country", val?.code || "")}
                  renderInput={(params) => React.createElement(TextField, { ...params, sx: fieldSx, required: true, placeholder: "चुनें", error: !!formErrors.location_country })}
                  slotProps={{ paper: { sx: menuPaperSx } }}
                />
              </Box>
              <Box>
                <LabelTypography>राज्य (State) *</LabelTypography>
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
                  renderInput={(params) => React.createElement(TextField, { ...params, sx: fieldSx, required: true, placeholder: "चुनें", error: !!formErrors.location_state })}
                  slotProps={{ paper: { sx: menuPaperSx } }}
                />
              </Box>
              <Box>
                <LabelTypography>ज़िला (District) *</LabelTypography>
                <Autocomplete
                  disabled={!formData.location_state}
                  options={cities}
                  getOptionLabel={(option) => {
                    const name = typeof option === 'string' ? option : option?.name;
                    return name || "";
                  }}
                  value={cities.find(c => c.name === formData.location_city) || null}
                  onChange={(e, val) => handleAutocompleteChange("location_city", val?.name || "")}
                  renderInput={(params) => React.createElement(TextField, { ...params, sx: fieldSx, required: true, placeholder: "चुनें", error: !!formErrors.location_city })}
                  slotProps={{ paper: { sx: menuPaperSx } }}
                />
              </Box>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <Box>
              <LabelTypography>ऑफ़र किए गए कोर्स (Courses Offered) *</LabelTypography>
              <Autocomplete
                multiple
                freeSolo
                disableCloseOnSelect
                options={courseOptions}
                value={Array.isArray(formData.courses_offered) ? formData.courses_offered : []}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, courses_offered: newValue }));
                  if (formErrors.courses_offered) setFormErrors(prev => ({ ...prev, courses_offered: false }));
                }}
                renderOption={(props, option, { selected }) => {
                  const { key, id, className, onClick, onTouchStart, 'data-option-index': dataOptionIndex, 'aria-disabled': ariaDisabled, 'aria-selected': ariaSelected } = props;
                  return (
                    <li key={key} id={id} className={className} onClick={onClick} onTouchStart={onTouchStart} data-option-index={dataOptionIndex} aria-disabled={ariaDisabled} aria-selected={ariaSelected}>
                      <Checkbox style={{ marginRight: 8, padding: 0 }} checked={selected} />
                      {option}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    id={params.id}
                    disabled={params.disabled}
                    fullWidth={params.fullWidth}
                    size={params.size}
                    InputLabelProps={params.InputLabelProps}
                    InputProps={params.InputProps}
                    inputProps={params.inputProps}
                    sx={fieldSx}
                    placeholder={!formData.courses_offered || formData.courses_offered.length === 0 ? "कोर्स चुनें या टाइप करें (e.g. B.Tech, MBA)" : ""}
                    error={!!formErrors.courses_offered}
                  />
                )}
                slotProps={{ paper: { sx: menuPaperSx } }}
              />
            </Box>
            <Box>
              <LabelTypography>शिक्षा स्तर (Education Levels) *</LabelTypography>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={educationLevels}
                value={Array.isArray(formData.education_levels) ? formData.education_levels : []}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, education_levels: newValue }));
                  if (formErrors.education_levels) setFormErrors(prev => ({ ...prev, education_levels: false }));
                }}
                renderOption={(props, option, { selected }) => {
                  const { key, id, className, onClick, onTouchStart, 'data-option-index': dataOptionIndex, 'aria-disabled': ariaDisabled, 'aria-selected': ariaSelected } = props;
                  return (
                    <li key={key} id={id} className={className} onClick={onClick} onTouchStart={onTouchStart} data-option-index={dataOptionIndex} aria-disabled={ariaDisabled} aria-selected={ariaSelected}>
                      <Checkbox style={{ marginRight: 8, padding: 0 }} checked={selected} />
                      {option}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    id={params.id}
                    disabled={params.disabled}
                    fullWidth={params.fullWidth}
                    size={params.size}
                    InputLabelProps={params.InputLabelProps}
                    InputProps={params.InputProps}
                    inputProps={params.inputProps}
                    sx={fieldSx}
                    placeholder={!formData.education_levels || formData.education_levels.length === 0 ? "शिक्षा स्तर चुनें (Select levels)" : ""}
                    error={!!formErrors.education_levels}
                  />
                )}
                slotProps={{ paper: { sx: menuPaperSx } }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <LabelTypography>मान्यता / संबद्धता प्रमाणपत्र (Recognition / Affiliation Doc) *</LabelTypography>
                <Button
                  variant={formData.accreditation_docs ? "contained" : "outlined"}
                  component="label"
                  fullWidth
                  startIcon={formData.accreditation_docs && !uploadingVerificationDoc ? <CheckCircleIcon /> : null}
                  sx={{
                    py: 1.5,
                    borderColor: formErrors.accreditation_docs ? '#d32f2f' : (formData.accreditation_docs ? 'transparent' : '#CBD5E1'),
                    color: formErrors.accreditation_docs ? '#d32f2f' : (formData.accreditation_docs ? '#16a34a' : '#374151'),
                    backgroundColor: formData.accreditation_docs ? '#dcfce7' : 'transparent',
                    textTransform: 'none',
                    fontWeight: formData.accreditation_docs ? 600 : 500,
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: formData.accreditation_docs ? '#bbf7d0' : 'rgba(0,0,0,0.04)',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {uploadingVerificationDoc ? <Loader mini /> : (formData.accreditation_docs ? "Uploaded (Click to change)" : "Upload File")}
                  <input type="file" hidden accept=".pdf,image/*" onChange={(e) => { handleFileUpload(e, 'accreditation_docs', setUploadingVerificationDoc); if (formErrors.accreditation_docs) setFormErrors(p => ({ ...p, accreditation_docs: false })); }} />
                </Button>
                {formData.accreditation_docs && (
                  <Typography variant="caption" sx={{ color: '#16a34a', mt: 1, textAlign: 'center', display: 'block', fontWeight: 500, fontFamily: fontFam, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {uploadedFileNames.accreditation_docs ? `File: ${uploadedFileNames.accreditation_docs}` : '✓ Existing Document'}
                  </Typography>
                )}
              </Box>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <LabelTypography>संपर्क विवरण वाला दस्तावेज़ (Document with School Contact) *</LabelTypography>
                <Button
                  variant={formData.license_certificate_url ? "contained" : "outlined"}
                  component="label"
                  fullWidth
                  startIcon={formData.license_certificate_url && !uploadingContactDoc ? <CheckCircleIcon /> : null}
                  sx={{
                    py: 1.5,
                    borderColor: formErrors.license_certificate_url ? '#d32f2f' : (formData.license_certificate_url ? 'transparent' : '#CBD5E1'),
                    color: formErrors.license_certificate_url ? '#d32f2f' : (formData.license_certificate_url ? '#16a34a' : '#374151'),
                    backgroundColor: formData.license_certificate_url ? '#dcfce7' : 'transparent',
                    textTransform: 'none',
                    fontWeight: formData.license_certificate_url ? 600 : 500,
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: formData.license_certificate_url ? '#bbf7d0' : 'rgba(0,0,0,0.04)',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {uploadingContactDoc ? <Loader mini /> : (formData.license_certificate_url ? "Uploaded (Click to change)" : "Upload File")}
                  <input type="file" hidden accept=".pdf,image/*" onChange={(e) => { handleFileUpload(e, 'license_certificate_url', setUploadingContactDoc); if (formErrors.license_certificate_url) setFormErrors(p => ({ ...p, license_certificate_url: false })); }} />
                </Button>
                {formData.license_certificate_url && (
                  <Typography variant="caption" sx={{ color: '#16a34a', mt: 1, textAlign: 'center', display: 'block', fontWeight: 500, fontFamily: fontFam, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {uploadedFileNames.license_certificate_url ? `File: ${uploadedFileNames.license_certificate_url}` : '✓ Existing Document'}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

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
      <Paper elevation={0} component={Motion.div} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} sx={{ 
        width: { xs: "100%", sm: "800px" }, 
        borderRadius: { xs: 0, sm: "28px" }, 
        p: { xs: 3, sm: 5 }, 
        maxHeight: '95vh',
        overflowY: 'auto',
        background: `
          radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.25) 0, transparent 50%), 
          radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.2) 0, transparent 50%), 
          radial-gradient(at 80% 100%, rgba(40, 167, 69, 0.15) 0, transparent 50%),
          radial-gradient(at 20% 100%, rgba(0, 86, 179, 0.1) 0, transparent 50%),
          #ffffff
        `,
        boxShadow: "none",
        border: "1px solid #E2E8F0"
      }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", letterSpacing: "-0.5px", fontSize: "26px", fontFamily: fontFam }}>
              संस्थान सेटअप
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5, fontSize: "14px", fontFamily: fontFam }}>
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

        <form onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}
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
                fontWeight: 600,
                color: '#475569',
                borderColor: '#CBD5E1',
                fontFamily: fontFam,
                '&.Mui-disabled': { color: '#94A3B8', borderColor: '#E2E8F0', opacity: 1 }
              }}
            >
              <span style={{ color: 'inherit' }}>पीछे</span>
            </Button>
            <Button
              type="submit"
              variant="contained" disableElevation
              disabled={loading || uploadingBanner || uploadingAvatar || uploadingVerificationDoc || uploadingContactDoc}
              sx={{ py: 1.2, px: 4, minWidth: { xs: '100px', sm: '130px' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600, background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)', boxShadow: 'none', fontFamily: fontFam }}
            >
              {activeStep === steps.length - 1 ? (loading ? <Loader mini /> : "सबमिट करें") : "आगे"}
            </Button>
          </Box>
        </form>
      </Paper>

      <Popover
        open={Boolean(phoneAnchorEl)}
        anchorEl={phoneAnchorEl}
        onClose={handlePhoneClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        elevation={0}
        PaperProps={{
          sx: { width: 300, overflow: "hidden" },
        }}
      >
        <Box sx={{ p: 1.5, borderBottom: "1px solid #e2e8f0" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="देश खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "& fieldset": { borderColor: "#e2e8f0" },
                "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
              },
            }}
          />
        </Box>
        <List sx={{ p: 0, maxHeight: 300, overflow: "auto" }}>
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => {
              const currentCode = activePhoneField === 'official' ? formData.official_country_code : formData.alternate_country_code;
              const isSelected = currentCode === country.code;
              return (
                <ListItemButton
                  key={`${country.code}-${country.name}`}
                  selected={isSelected}
                  onClick={() => handleCountrySelect(country.code)}
                  sx={{
                    borderBottom: "1px solid #f1f5f9"
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <img src={country.flagUrl} alt={country.isoCode} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />
                      <Box>
                        <Typography sx={{ fontSize: "inherit", fontWeight: "inherit", lineHeight: "inherit", color: "inherit" }}>
                          {country.name}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                          {country.enName}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: "inherit", fontWeight: "inherit", lineHeight: "inherit", color: "inherit" }}>
                      {country.code}
                    </Typography>
                  </Box>
                </ListItemButton>
              );
            })
          ) : (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography sx={{ color: "#64748b", fontSize: "14px" }}>कोई देश नहीं मिला</Typography>
            </Box>
          )}
        </List>
      </Popover>
    </Box>
  );
}
