"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Box, Typography, TextField, Paper, IconButton, CircularProgress, Autocomplete, InputAdornment, Avatar, List, ListItemButton, Button } from "@mui/material";
import { motion as Motion } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import BusinessIcon from "@mui/icons-material/Business";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Popover from "@mui/material/Popover";
import TarangButton from '../../../components/common/TarangButton';
import CustomCheckbox from "../../../components/common/CustomCheckbox";
import CustomTimePicker from "../../institute/admissions/CustomTimePicker";
import dayjs from "dayjs";
import { CustomFloatingInput, CustomFloatingSelect, CustomFloatingPhoneInput, CustomFloatingSearchableSelect } from "../../../components/common/CustomFloatingFields";
import { useAppRouter } from '../../../hooks/useAppRouter';
import { updateProfile } from "../authService";
import { apiClient } from "../../../lib/apiClient";
import useScrollLock from "../../../hooks/useScrollLock";
import authConfigData from '../../../data/instituteConfig.json';
import gazeteer from '../../../data/formated/gazeteer.json';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { sortLocationsByDistance } from '../../../lib/geoNormalize';
import { AREA_TYPE_OPTIONS, RURAL_LOCAL_BODY_OPTIONS, URBAN_LOCAL_BODY_OPTIONS } from '../../../lib/admissionFormOptions';
import {
  validateInstitutionName,
  validateRegistrationNumber,
  validateURL,
  validatePincode,
  validateBio,
  validateInstitutePhone,
  validateAddressLine,
  validateCount,
  validateEmail,
} from '../../../utils/validationUtils';

const COUNTRY_CODES = gazeteer.Countries.map(c => ({ ...c, code: c.phoneCode, enName: c.name, label: c.phoneCode }));
const INDIA_STATES = (gazeteer.Countries.find(c => c.code === 'IN')?.states) || [];
const fontFam = "inherit";

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

const THEME_BORDER = "var(--color-slate-200)";
const themeBorderSx = `var(--border-thin) solid ${THEME_BORDER}`;

const menuPaperSx = {
  borderRadius: 'var(--radius-md)',
  margin: "6px 0",
  border: "none",
  backdropFilter: "blur(20px)",
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  "& .MuiAutocomplete-listbox, & .MuiList-root": {
    padding: "4px",
    maxHeight: "220px",
    overflowY: "auto",
  },
  "& .MuiAutocomplete-option, & .MuiMenuItem-root": {
    borderRadius: 'var(--radius-md)',
    margin: "2px 4px",
    padding: "10px 14px",
    fontSize: 'var(--font-base)',
    color: "var(--color-slate-700)",
    fontWeight: 'var(--font-medium)',
    fontFamily: fontFam,
    transition: "all 0.15s ease",
    "&[aria-selected='true']": {
      backgroundColor: "rgba(0, 86, 179, 0.08) !important",
      color: "var(--color-primary)",
      fontWeight: 'var(--font-semibold)'
    },
    "&.Mui-focused, &:hover": {
      backgroundColor: "var(--color-slate-50)",
      color: "var(--color-slate-900)"
    }
  }
};

export default function InstituteSetupModal({ profile, onClose }) {
  const router = useAppRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  useScrollLock(true);

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingVerificationDoc, setUploadingVerificationDoc] = useState(false);
  const [uploadingContactDoc, setUploadingContactDoc] = useState(false);
  const [uploadedFileNames, setUploadedFileNames] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [openTime, setOpenTime] = useState(null);
  const [closeTime, setCloseTime] = useState(null);

  useEffect(() => {
    if (profile?.institute_profile?.operating_hours) {
      const parts = profile.institute_profile.operating_hours.split(' - ');
      if (parts.length === 2) {
        setOpenTime(dayjs(parts[0], 'hh:mm A'));
        setCloseTime(dayjs(parts[1], 'hh:mm A'));
      }
    }
  }, [profile]);

  useEffect(() => {
    if (openTime && closeTime) {
      setFormData(prev => ({ ...prev, operating_hours: `${openTime.format('hh:mm A')} - ${closeTime.format('hh:mm A')}` }));
    } else if (!openTime && !closeTime) {
      setFormData(prev => ({ ...prev, operating_hours: "" }));
    }
  }, [openTime, closeTime]);

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
    campus_type: ip.campus_type || "",
    operating_hours: ip.operating_hours || "",

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

    address: {
      country: "",
      state: "",
      district: "",
      areaType: "",
      localBodyType: "",
      localBodyName: "",
      wardOrSector: "",
      houseNoAndName: "",
      landmark: "",
      street: "",
      pincode: ip.pincode || "",
    },

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

  const filteredCountries = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.enName && c.enName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.code.includes(searchQuery)
  );

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

  // Address section computed values
  const addressStates = useMemo(() =>
    formData.address.country === 'India'
      ? sortLocationsByDistance(INDIA_STATES, userLocation?.lat, userLocation?.lon, 'states').map(s => ({ value: s.name, label: s.name }))
      : (gazeteer.Countries.find(c => c.name === formData.address.country)?.states || []).map(s => ({ value: s.name, label: s.name })),
    [formData.address.country, userLocation]
  );

  const addressDistricts = useMemo(() => {
    if (!formData.address.state) return [];
    const stateObj = INDIA_STATES.find(s => s.name === formData.address.state);
    if (!stateObj?.districts) return [];
    return sortLocationsByDistance(stateObj.districts, userLocation?.lat, userLocation?.lon, 'districts').map(d => ({ value: d.name, label: d.name }));
  }, [formData.address.state, userLocation]);

  const addressCountryOptions = useMemo(() =>
    countries.map(c => ({ value: c.name, label: c.name })),
    [countries]
  );

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

  const handleAddressFieldChange = (field) => (e) => {
    const val = e.target.value;
    setFormData(prev => {
      const newAddr = { ...prev.address, [field]: val };
      if (field === 'country') { newAddr.state = ''; newAddr.district = ''; }
      if (field === 'state') { newAddr.district = ''; }
      if (field === 'areaType') { newAddr.localBodyType = ''; newAddr.localBodyName = ''; }
      return { ...prev, address: newAddr };
    });
  };

  const handleCopyFromProfile = () => {
    if (!profile?.location) return;
    const parts = profile.location.split(", ").map(p => p.trim());
    if (parts.length >= 2) {
      const cntryName = parts[parts.length - 1];
      const sName = parts[parts.length - 2];
      const dName = parts.length >= 3 ? parts[0] : '';
      const foundCountry = countries.find(c => c.name === cntryName);
      if (foundCountry) {
        let resolvedState = sName;
        let resolvedDistrict = dName;
        if (foundCountry.code === 'IN') {
          const stateObj = INDIA_STATES.find(s => s.name === sName);
          if (stateObj) {
            resolvedState = stateObj.name;
            const distList = stateObj.districts?.map(d => d.name) || [];
            resolvedDistrict = distList.find(d => d.toLowerCase() === dName.toLowerCase()) || dName;
          }
        }
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            country: cntryName,
            state: resolvedState,
            district: resolvedDistrict,
          }
        }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (Reflect.get(formErrors, name)) setFormErrors(prev => ({ ...prev, [name]: false }));
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
        setFormData(p => ({ ...p, banner_url: `${data.file_url}?t=${Date.now()}` }));
      } else if (fieldName === 'profile') {
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

    const addErr = (key, msg) => { if (msg) newErrors[key] = msg; };

    if (activeStep === 0) {
      if (!formData.banner_url || formData.banner_url === 'null' || formData.banner_url.trim() === '')
        newErrors.banner = "बैनर अपलोड करना आवश्यक है";
      if (!formData.profile_pic_url || formData.profile_pic_url === 'null' || formData.profile_pic_url.trim() === '')
        newErrors.profile = "प्रोफ़ाइल फ़ोटो अपलोड करना आवश्यक है";

      addErr('institution_name', validateInstitutionName(formData.institution_name));
      if (!formData.institute_type) newErrors.institute_type = "संस्थान का प्रकार चुनें";
      if (!formData.established_year) newErrors.established_year = "स्थापना वर्ष चुनें";
      addErr('registration_number', validateRegistrationNumber(formData.registration_number));
      addErr('bio', validateBio(formData.bio));

      if (!noChildTypes.includes(formData.institute_type) && !formData.affiliation_board)
        newErrors.affiliation_board = "संबद्धता बोर्ड आवश्यक है";

    } else if (activeStep === 1) {
      addErr('official_phone', validateInstitutePhone(formData.official_phone));
      addErr('official_email', validateEmail(formData.official_email) || (!formData.official_email ? "आधिकारिक ईमेल आवश्यक है" : ""));
      addErr('website_url', validateURL(formData.website_url));
      addErr('alternate_contact', validateInstitutePhone(formData.alternate_contact));
      if (!formData.address.country) newErrors['address.country'] = true;
      if (!formData.address.state) newErrors['address.state'] = true;
      if (!formData.address.district) newErrors['address.district'] = true;
      addErr('pincode', validatePincode(formData.address.pincode));

    } else if (activeStep === 2) {
      if (!formData.courses_offered || formData.courses_offered.length === 0)
        newErrors.courses_offered = "कम से कम एक कोर्स चुनें";
      if (!formData.education_levels || !formData.education_levels.length)
        newErrors.education_levels = "कम से कम एक शिक्षा स्तर चुनें";
      const studentErr = validateCount(formData.student_count, "छात्र संख्या");
      const facultyErr = validateCount(formData.faculty_count, "शिक्षक संख्या");
      addErr('student_count', studentErr);
      addErr('faculty_count', facultyErr);

    } else if (activeStep === 3) {
      if (!formData.accreditation_docs) newErrors.accreditation_docs = "मान्यता दस्तावेज़ अपलोड करें";
      if (!formData.license_certificate_url) newErrors.license_certificate_url = "लाइसेंस प्रमाणपत्र अपलोड करें";
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }
    setFormErrors({});

    if (activeStep < 3) {
      handleNext();
      return;
    }
    setLoading(true);
    try {
      const addr = formData.address;
      const fullLocationString = [addr.district, addr.state, addr.country].filter(Boolean).join(", ");
      // Build a readable address_line from detailed fields
      const addressParts = [
        addr.houseNoAndName, addr.wardOrSector, addr.localBodyName,
        addr.landmark, addr.street, addr.district, addr.state, addr.country
      ].filter(Boolean);
      const address_line = addressParts.join(', ');

      const institute_profile = {
        institute_type: formData.institute_type,
        established_year: parseInt(formData.established_year) || 0,
        registration_number: formData.registration_number,
        official_phone: formData.official_country_code
          ? `${formData.official_country_code}${formData.official_phone}`
          : formData.official_phone,
        official_email: formData.official_email,
        website_url: formData.website_url,
        courses_offered: Array.isArray(formData.courses_offered) ? formData.courses_offered : [],
        education_levels: Array.isArray(formData.education_levels) ? formData.education_levels : [],
        student_count: parseInt(formData.student_count) || 0,
        faculty_count: parseInt(formData.faculty_count) || 0,
        campus_type: formData.campus_type,
        operating_hours: formData.operating_hours,
        license_certificate_url: formData.license_certificate_url,
        accreditation_docs: formData.accreditation_docs ? [formData.accreditation_docs] : [],
        address_line,
        pincode: addr.pincode,
        short_description: formData.bio,
        logo_url: formData.profile_pic_url,
        banner_url: formData.banner_url
      };

      await updateProfile({
        user_id: profile.id,
        institution_name: formData.institution_name,
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: "var(--size-full)" }}>
            <Box sx={{ position: 'relative', mb: 5.5 }}>
              <Box
                sx={{
                  width: 'var(--size-full)', height: 160, borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-slate-50)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  border: formErrors.banner ? '2px dashed #ef4444' : ((formData.banner_url && formData.banner_url !== 'null' && formData.banner_url !== 'undefined' && formData.banner_url.trim() !== '') ? 'var(--border-thin) solid #E2E8F0' : '2px dashed #CBD5E1'), cursor: 'pointer', overflow: 'hidden', position: 'relative'
                }}
                onClick={() => { bannerInputRef.current?.click(); if (formErrors.banner) setFormErrors(p => ({ ...p, banner: false })); }}
              >
                {(formData.banner_url && formData.banner_url !== 'null' && formData.banner_url !== 'undefined' && formData.banner_url.trim() !== '') && (
                  <Box
                    component="img"
                    src={formData.banner_url}
                    alt="Cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    sx={{ width: 'var(--size-full)', height: 'var(--size-full)', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
                  />
                )}
                {(!formData.banner_url || formData.banner_url === 'null' || formData.banner_url === 'undefined' || formData.banner_url.trim() === '') && !uploadingBanner && <CloudUploadIcon sx={{ color: formErrors.banner ? 'var(--color-error)' : 'var(--color-slate-500)', fontSize: 48, position: 'relative', zIndex: 1 }} />}
                <input type="file" hidden ref={bannerInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'banner', setUploadingBanner)} />
              </Box>

              <Box sx={{ position: 'absolute', bottom: -44, left: 32, zIndex: 'var(--z-sticky)' }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={formData.profile_pic_url}
                    sx={{
                      width: 104,
                      height: 104,
                      border: formErrors.profile ? 'var(--border-heavy) solid #ef4444' : 'var(--border-heavy) solid #ffffff',
                      bgcolor: 'var(--color-slate-50)',
                      fontSize: '36px',
                      fontFamily: fontFam,
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-slate-500)'
                    }}
                  >
                    {formData.institution_name?.charAt(0) || <BusinessIcon sx={{ fontSize: 48, color: 'var(--color-slate-200)' }} />}
                  </Avatar>
                  <IconButton
                    disabled={uploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'var(--color-white)',
                      color: 'var(--color-slate-700)',
                      border: 'var(--border-thin) solid #E2E8F0',
                      '&:hover': { bgcolor: 'var(--color-slate-50)' }
                    }}
                    size="small"
                  >
                    {uploadingAvatar ? null : <PhotoCameraIcon sx={{ fontSize: 16 }} />}
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

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: "flex-start" }}>
              <CustomFloatingInput
                label="संस्थान का नाम *"
                name="institution_name"
                value={formData.institution_name}
                onChange={handleChange}
                error={!!formErrors.institution_name}
                helperText={typeof formErrors.institution_name === 'string' ? formErrors.institution_name : ''}
              />
              <CustomFloatingSelect
                label="संस्थान का प्रकार *"
                name="institute_type"
                value={formData.institute_type}
                onChange={(e) => setFormData(p => ({ ...p, institute_type: e.target.value, affiliation_board: "" }))}
                options={instituteCategoryOptions.map(opt => ({ label: opt.label, value: opt.label }))}
                error={!!formErrors.institute_type}
                helperText={typeof formErrors.institute_type === 'string' ? formErrors.institute_type : ''}
              />
            </Box>

            {formData.institute_type && !noChildTypes.includes(formData.institute_type) && (
              <Box sx={{ width: "var(--size-full)" }}>
                <CustomFloatingSearchableSelect
                  label={['National Board', 'State Board', 'International Board'].includes(formData.institute_type) ? "बोर्ड का नाम *" : "विश्वविद्यालय का नाम *"}
                  options={Reflect.get(affiliationOptionsMap, formData.institute_type) || []}
                  value={formData.affiliation_board || ""}
                  onChange={(e) => setFormData(p => ({ ...p, affiliation_board: e.target.value }))}
                  error={!!formErrors.affiliation_board}
                  freeSolo={true}
                />
              </Box>
            )}

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: "flex-start" }}>
              <CustomFloatingSelect
                label="स्थापना वर्ष *"
                name="established_year"
                value={formData.established_year ? formData.established_year.toString() : ""}
                onChange={(e) => setFormData(p => ({ ...p, established_year: e.target.value }))}
                options={years.map(y => ({ label: y, value: y }))}
                error={!!formErrors.established_year}
                helperText={typeof formErrors.established_year === 'string' ? formErrors.established_year : ''}
              />
              <CustomFloatingInput
                label="पंजीकरण संख्या *"
                name="registration_number"
                value={formData.registration_number}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value.toUpperCase() }))}
                error={!!formErrors.registration_number}
                helperText={typeof formErrors.registration_number === 'string' ? formErrors.registration_number : ''}
              />
            </Box>

            <CustomFloatingInput
              label="संस्थान के बारे में *"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              multiline
              rows={4}
              error={!!formErrors.bio}
              helperText={
                typeof formErrors.bio === 'string'
                  ? formErrors.bio
                  : (formData.bio && formData.bio.trim().split(/\s+/).filter(w => w.length > 0).length < 100
                    ? `${100 - formData.bio.trim().split(/\s+/).filter(w => w.length > 0).length} शब्द और लिखें`
                    : "")
              }
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: "var(--size-full)", mt: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: "flex-start" }}>
              <CustomFloatingPhoneInput
                label="आधिकारिक फ़ोन *"
                countryCode={formData.official_country_code}
                onCountryCodeChange={(val) => setFormData(p => ({ ...p, official_country_code: val }))}
                value={formData.official_phone}
                onChange={(e) => setFormData(p => ({ ...p, official_phone: e.target.value }))}
                error={!!formErrors.official_phone}
                helperText={typeof formErrors.official_phone === 'string' ? formErrors.official_phone : ''}
              />
              <CustomFloatingInput
                label="आधिकारिक ईमेल *"
                name="official_email"
                value={formData.official_email}
                onChange={handleChange}
                error={!!formErrors.official_email}
                helperText={typeof formErrors.official_email === 'string' ? formErrors.official_email : ''}
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: "flex-start" }}>
              <CustomFloatingInput
                label="वेबसाइट URL *"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                error={!!formErrors.website_url}
                helperText={typeof formErrors.website_url === 'string' ? formErrors.website_url : ''}
              />
              <CustomFloatingPhoneInput
                label="वैकल्पिक संपर्क *"
                countryCode={formData.alternate_country_code}
                onCountryCodeChange={(val) => setFormData(p => ({ ...p, alternate_country_code: val }))}
                value={formData.alternate_contact}
                onChange={(e) => setFormData(p => ({ ...p, alternate_contact: e.target.value }))}
                error={!!formErrors.alternate_contact}
                helperText={typeof formErrors.alternate_contact === 'string' ? formErrors.alternate_contact : ''}
              />
            </Box>

            {/* Copy from Profile button */}
            {profile?.location && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box
                  component="button" type="button"
                  onClick={handleCopyFromProfile}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.75,
                    background: 'none', border: '1px solid var(--color-primary)',
                    borderRadius: 'var(--radius-full)', px: 1.5, py: 0.5,
                    cursor: 'pointer', color: 'var(--color-primary)',
                    fontSize: 'var(--font-xs)', fontFamily: 'inherit', fontWeight: 500,
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'rgba(0,86,179,0.08)' },
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  प्रोफ़ाइल से कॉपी करें
                </Box>
              </Box>
            )}

            {/* Detailed Address Section */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
              <CustomFloatingSelect
                label="देश *"
                value={formData.address.country}
                onChange={handleAddressFieldChange('country')}
                options={addressCountryOptions}
                error={!!formErrors['address.country']}
              />
              <CustomFloatingSelect
                label="राज्य *"
                value={formData.address.state}
                onChange={handleAddressFieldChange('state')}
                options={addressStates}
                disabled={!formData.address.country}
                error={!!formErrors['address.state']}
              />
              <CustomFloatingSelect
                label="ज़िला *"
                value={formData.address.district}
                onChange={handleAddressFieldChange('district')}
                options={addressDistricts}
                disabled={!formData.address.state}
                error={!!formErrors['address.district']}
              />
              <CustomFloatingSelect
                label="क्षेत्र का प्रकार"
                value={formData.address.areaType}
                onChange={handleAddressFieldChange('areaType')}
                options={AREA_TYPE_OPTIONS}
              />
              {formData.address.areaType === 'Rural Areas' && (
                <CustomFloatingSelect
                  label="स्थानीय निकाय प्रकार"
                  value={formData.address.localBodyType}
                  onChange={handleAddressFieldChange('localBodyType')}
                  options={RURAL_LOCAL_BODY_OPTIONS}
                />
              )}
              {formData.address.areaType === 'Urban Areas' && (
                <CustomFloatingSelect
                  label="स्थानीय निकाय प्रकार"
                  value={formData.address.localBodyType}
                  onChange={handleAddressFieldChange('localBodyType')}
                  options={URBAN_LOCAL_BODY_OPTIONS}
                />
              )}
              {(formData.address.areaType === 'Rural Areas' || formData.address.areaType === 'Urban Areas') && (
                <CustomFloatingInput
                  label="स्थानीय निकाय का नाम"
                  value={formData.address.localBodyName}
                  onChange={handleAddressFieldChange('localBodyName')}
                />
              )}
              <CustomFloatingInput
                label="वार्ड / सेक्टर"
                value={formData.address.wardOrSector}
                onChange={handleAddressFieldChange('wardOrSector')}
              />
              <CustomFloatingInput
                label="मकान नंबर और नाम"
                value={formData.address.houseNoAndName}
                onChange={handleAddressFieldChange('houseNoAndName')}
              />
              <CustomFloatingInput
                label="लैंडमार्क"
                value={formData.address.landmark}
                onChange={handleAddressFieldChange('landmark')}
              />
              <CustomFloatingInput
                label="गली / स्ट्रीट"
                value={formData.address.street}
                onChange={handleAddressFieldChange('street')}
              />
              <CustomFloatingInput
                label="पिन कोड *"
                value={formData.address.pincode}
                onChange={handleAddressFieldChange('pincode')}
                error={!!formErrors.pincode}
                helperText={typeof formErrors.pincode === 'string' ? formErrors.pincode : ''}
                type="number"
              />
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: "var(--size-full)", mt: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: "flex-start" }}>
              <CustomFloatingSearchableSelect
                multiple={true}
                freeSolo={true}
                label="ऑफ़र किए गए कोर्स *"
                options={courseOptions}
                value={Array.isArray(formData.courses_offered) ? formData.courses_offered : []}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, courses_offered: e.target.value }));
                  if (formErrors.courses_offered) setFormErrors(prev => ({ ...prev, courses_offered: false }));
                }}
                error={!!formErrors.courses_offered}
                helperText={typeof formErrors.courses_offered === 'string' ? formErrors.courses_offered : ''}
              />
              <CustomFloatingSearchableSelect
                multiple={true}
                label="शिक्षा स्तर *"
                options={educationLevels}
                value={Array.isArray(formData.education_levels) ? formData.education_levels : []}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, education_levels: e.target.value }));
                  if (formErrors.education_levels) setFormErrors(prev => ({ ...prev, education_levels: false }));
                }}
                error={!!formErrors.education_levels}
                helperText={typeof formErrors.education_levels === 'string' ? formErrors.education_levels : ''}
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: "flex-start" }}>
              <CustomFloatingInput
                label="कुल छात्र संख्या"
                name="student_count"
                value={formData.student_count}
                onChange={handleChange}
                type="number"
              />
              <CustomFloatingInput
                label="कुल शिक्षक संख्या"
                name="faculty_count"
                value={formData.faculty_count}
                onChange={handleChange}
                type="number"
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: "flex-start" }}>
              <CustomFloatingSelect
                label="परिसर का प्रकार"
                name="campus_type"
                value={formData.campus_type}
                onChange={(e) => setFormData(p => ({ ...p, campus_type: e.target.value }))}
                options={campusTypes.map(c => ({ label: c, value: c }))}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <CustomTimePicker
                  label="खुलने का समय"
                  value={openTime}
                  onChange={(newValue) => setOpenTime(newValue)}
                />
                <CustomTimePicker
                  label="बंद होने का समय"
                  value={closeTime}
                  onChange={(newValue) => setCloseTime(newValue)}
                />
              </Box>
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: "var(--size-full)", mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-700)", fontSize: 'var(--font-sm)', fontFamily: fontFam }}>
                  मान्यता / संबद्धता प्रमाणपत्र *
                </Typography>
                <Button
                  variant={formData.accreditation_docs ? "contained" : "outlined"}
                  component="label"
                  fullWidth
                  startIcon={formData.accreditation_docs && !uploadingVerificationDoc ? <CheckCircleIcon /> : null}
                  sx={{
                    py: 1.5,
                    borderColor: formErrors.accreditation_docs ? 'var(--color-error)' : (formData.accreditation_docs ? 'transparent' : 'var(--color-slate-200)'),
                    color: formErrors.accreditation_docs ? 'var(--color-error)' : (formData.accreditation_docs ? 'var(--color-success)' : 'var(--color-slate-700)'),
                    backgroundColor: formData.accreditation_docs ? 'var(--color-slate-200)' : 'transparent',
                    textTransform: 'none',
                    fontWeight: formData.accreditation_docs ? 600 : 500,
                    '&:hover': {
                      backgroundColor: formData.accreditation_docs ? 'var(--color-slate-200)' : 'rgba(0,0,0,0.04)',
                    }
                  }}
                >
                  {uploadingVerificationDoc ? null : (formData.accreditation_docs ? "Uploaded" : "Upload File")}
                  <input type="file" hidden accept=".pdf,image/*" onChange={(e) => { handleFileUpload(e, 'accreditation_docs', setUploadingVerificationDoc); if (formErrors.accreditation_docs) setFormErrors(p => ({ ...p, accreditation_docs: false })); }} />
                </Button>
                {formData.accreditation_docs && (
                  <Typography variant="caption" sx={{ color: 'var(--color-success)', mt: 1, textAlign: 'center', display: 'block', fontWeight: 'var(--font-medium)', fontFamily: fontFam, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {uploadedFileNames.accreditation_docs ? `File: ${uploadedFileNames.accreditation_docs}` : '✓ Existing Document'}
                  </Typography>
                )}
              </Box>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-700)", fontSize: 'var(--font-sm)', fontFamily: fontFam }}>
                  लाइसेंस/पंजीकरण दस्तावेज़ *
                </Typography>
                <Button
                  variant={formData.license_certificate_url ? "contained" : "outlined"}
                  component="label"
                  fullWidth
                  startIcon={formData.license_certificate_url && !uploadingContactDoc ? <CheckCircleIcon /> : null}
                  sx={{
                    py: 1.5,
                    borderColor: formErrors.license_certificate_url ? 'var(--color-error)' : (formData.license_certificate_url ? 'transparent' : 'var(--color-slate-200)'),
                    color: formErrors.license_certificate_url ? 'var(--color-error)' : (formData.license_certificate_url ? 'var(--color-success)' : 'var(--color-slate-700)'),
                    backgroundColor: formData.license_certificate_url ? 'var(--color-slate-200)' : 'transparent',
                    textTransform: 'none',
                    fontWeight: formData.license_certificate_url ? 600 : 500,
                    '&:hover': {
                      backgroundColor: formData.license_certificate_url ? 'var(--color-slate-200)' : 'rgba(0,0,0,0.04)',
                    }
                  }}
                >
                  {uploadingContactDoc ? null : (formData.license_certificate_url ? "Uploaded" : "Upload File")}
                  <input type="file" hidden accept=".pdf,image/*" onChange={(e) => { handleFileUpload(e, 'license_certificate_url', setUploadingContactDoc); if (formErrors.license_certificate_url) setFormErrors(p => ({ ...p, license_certificate_url: false })); }} />
                </Button>
                {formData.license_certificate_url && (
                  <Typography variant="caption" sx={{ color: 'var(--color-success)', mt: 1, textAlign: 'center', display: 'block', fontWeight: 'var(--font-medium)', fontFamily: fontFam, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

  const stepLabels = [
    { label: "1. Basic Details", hindi: "मूलभूत जानकारी" },
    { label: "2. Contact & Location", hindi: "संपर्क और स्थान" },
    { label: "3. Academic Details", hindi: "शैक्षणिक जानकारी" },
    { label: "4. Documents", hindi: "दस्तावेज़" }
  ];

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 'var(--z-fixed)',
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 86, 179, 0.1)",
          backdropFilter: "blur(15px)",
          p: { xs: 0, sm: 2 },
          overflow: "auto",
        }}
      >
        <Paper
          onClick={(e) => e.stopPropagation()}
          elevation={0}
          component={Motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          sx={{
            display: "flex",
            flexDirection: "column",
            width: { xs: "var(--size-full)", sm: "1000px" },
            minHeight: { xs: "var(--size-full)", sm: "auto" },
            borderRadius: { xs: 0, sm: "28px" },
            background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.18) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.15) 0, transparent 50%), 
            radial-gradient(at 80% 100%, rgba(40, 167, 69, 0.12) 0, transparent 50%),
            radial-gradient(at 20% 100%, rgba(0, 86, 179, 0.1) 0, transparent 50%),
            #ffffff
          `,
            border: themeBorderSx,
            overflow: "hidden",
            maxHeight: "92vh",
            position: "relative",
          }}
        >
          {/* Fixed Header Section */}
          <Box sx={{ px: { xs: 3, sm: 8 }, pt: { xs: 6, sm: 8 }, pb: 2, width: "var(--size-full)", boxSizing: "border-box", flexShrink: 0 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: "var(--color-slate-900)",
                    letterSpacing: "-0.5px",
                    fontSize: 'var(--font-2xl)',
                  }}
                >
                  संस्थान सेटअप
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.5 }}
                >
                  अपनी प्रोफ़ाइल पूरी करें और आगे बढ़ें।
                </Typography>
              </Box>
            </Box>

            {/* Step Indicator Progress Bar */}
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              {stepLabels.map((s, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.75,
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveStep(index)}
                >
                  <Box
                    sx={{
                      height: 4,
                      borderRadius: 'var(--radius-md)',
                      bgcolor: activeStep >= index ? "var(--color-primary)" : "var(--color-slate-200)",
                      transition: "all 0.3s",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: activeStep === index ? "var(--color-primary)" : "var(--color-slate-500)",
                      fontSize: "12.5px",
                    }}
                  >
                    {s.hindi}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
            {/* Scrollable Content Area */}
            <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, px: { xs: 3, sm: 8 }, py: 3, display: 'flex', flexDirection: 'column' }}>
              {renderStepContent(activeStep)}
            </Box>

            {/* Fixed Footer */}
            <Box sx={{ px: { xs: 3, sm: 8 }, pt: 3, pb: { xs: 6, sm: 8 }, display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
              <TarangButton
                variant="outlined"
                onClick={activeStep === 0 ? onClose : handleBack}
                sx={{ minWidth: { xs: '100px', sm: '130px' } }}
              >
                {activeStep === 0 ? "रद्द करें" : "पीछे"}
              </TarangButton>
              <TarangButton
                type="submit"
                loading={activeStep === 3 ? loading : false}
                disabled={loading || uploadingBanner || uploadingAvatar || uploadingVerificationDoc || uploadingContactDoc}
                sx={{ minWidth: { xs: '100px', sm: '130px' } }}
              >
                {activeStep === 3 ? "सबमिट करें" : "आगे"}
              </TarangButton>
            </Box>
          </form>
        </Paper>
      </Box>
    </>
  );
}
