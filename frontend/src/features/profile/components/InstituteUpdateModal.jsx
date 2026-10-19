"use client";
import { uploadToMinIO } from '../../../utils/uploadUtil';

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Box, Typography, TextField, Paper, IconButton, CircularProgress, Autocomplete, InputAdornment, Avatar, List, ListItemButton, Button } from "@mui/material";
import { motion as Motion } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import { BroomIcon } from "../../institute/admissions/BroomIcon";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { CustomTooltip } from "../../../components/common/CustomTooltip";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import BusinessIcon from "@mui/icons-material/Business";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Popover from "@mui/material/Popover";
import TarangButton from '../../../components/common/TarangButton';
import AutoSaveIndicator from "../../../components/common/AutoSaveIndicator";
import CustomCheckbox from "../../../components/common/CustomCheckbox";
import CustomTimePicker from "../../institute/admissions/CustomTimePicker";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { CustomFloatingInput, CustomFloatingSelect, CustomFloatingPhoneInput, CustomFloatingSearchableSelect, CustomFloatingFileInput, CustomFloatingMinIOUpload, CustomFloatingCountrySelect } from "../../../components/common/CustomFloatingFields";
import { useAppRouter } from '../../../hooks/useAppRouter';
import { updateProfile } from "../../auth/authService";
import { apiClient } from "../../../lib/apiClient";
import useScrollLock from "../../../hooks/useScrollLock";
import authConfigData from '../../../data/instituteConfig.json';
import gazeteer from '../../../data/formated/gazeteer.json';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { useToast } from '../../../contexts/ToastContext';

import { sortLocationsByDistance } from '../../../lib/geoNormalize';
import { AREA_TYPE_OPTIONS, RURAL_LOCAL_BODY_OPTIONS, URBAN_LOCAL_BODY_OPTIONS } from '../../../lib/admissionFormOptions';
import { FormLoadingProvider } from '../../../contexts/FormLoadingContext';
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

const THEME_BORDER = "var(--card-border)";
const themeBorderSx = `var(--border-thin) solid ${THEME_BORDER}`;

const menuPaperSx = {
  borderRadius: 'var(--radius-md)',
  margin: "6px 0",
  border: "none",
  backdropFilter: "blur(30px)",
  backgroundColor: "var(--glass-bg)", /* Glassy Theme */
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
    color: "var(--color-slate-900)",
    fontWeight: 'var(--font-medium)',
    fontFamily: fontFam,
    transition: "all var(--transition-fast)",
    "&[aria-selected='true']": {
      backgroundColor: "rgba(0, 86, 179, 0.08)",
      color: "var(--color-primary)",
      fontWeight: 'var(--font-semibold)'
    },
    "&.Mui-focused, &:hover": {
      backgroundColor: "var(--color-slate-50)",
      color: "var(--color-slate-900)"
    }
  }
};

export default function InstituteUpdateModal({ profile, onClose, onSuccess }) {
  const router = useAppRouter();
  const isSubmitting = React.useRef(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  useScrollLock(true);

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingAccreditation, setUploadingAccreditation] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [uploadedFileNames, setUploadedFileNames] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [openTime, setOpenTime] = useState(null);
  const [closeTime, setCloseTime] = useState(null);

  useEffect(() => {
    if (profile?.institute_profile?.operating_hours) {
      const parts = profile.institute_profile.operating_hours.split(' - ');
      if (parts.length === 2 && !parts[0].includes('Invalid Date') && !parts[1].includes('Invalid Date')) {
        setOpenTime(dayjs(parts[0], 'hh:mm A'));
        setCloseTime(dayjs(parts[1], 'hh:mm A'));
      } else {
        setOpenTime(null);
        setCloseTime(null);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (openTime && closeTime && openTime.isValid() && closeTime.isValid()) {
      const newOperatingHours = `${openTime.format('hh:mm A')} - ${closeTime.format('hh:mm A')}`;
      setFormData(prev => {
        if (prev.operating_hours === newOperatingHours) return prev;
        return { ...prev, operating_hours: newOperatingHours };
      });
    } else {
      setFormData(prev => {
        if (prev.operating_hours === "") return prev;
        return { ...prev, operating_hours: "" };
      });
    }
  }, [openTime, closeTime]);

  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const verificationDocRef = useRef(null);
  const contactDocRef = useRef(null);

  const [formErrors, setFormErrors] = useState({});

  const ip = profile?.institute_profile || {};

  const [formData, setFormData] = useState({
    primary_name: profile?.primary_name || "",
    secondary_name: profile?.secondary_name || "",
    bio: profile?.bio || "",
    banner_url: profile?.institute_profile?.banner_url?.split('?')[0] || "",
    profile_pic_url: profile?.institute_profile?.logo_url?.split('?')[0] || "",
    campus_type: ip.campus_type || "",
    operating_hours: ip.operating_hours || "",

    institute_type: ip.institute_type || "",
    affiliation_board: ip.affiliation_board || "",
    established_year: ip.established_year || "",
    registration_number: ip.registration_number || "",

    primary_contact_name: ip.primary_contact_name || "",
    primary_contact_designation: ip.primary_contact_designation || "",
    official_phone: (ip.official_phone || "").startsWith(ip.official_country_code || "+91") ? (ip.official_phone || "").substring((ip.official_country_code || "+91").length) : (ip.official_phone || ""),
    official_country_code: ip.official_country_code || "+91",
    official_email: ip.official_email || "",
    website_url: ip.website_url || "",
    alternate_contact: (ip.alternate_contact || "").startsWith(ip.alternate_country_code || "+91") ? (ip.alternate_contact || "").substring((ip.alternate_country_code || "+91").length) : (ip.alternate_contact || ""),
    alternate_country_code: ip.alternate_country_code || "+91",

    address: (() => {
      let parsed = {};
      try {
        parsed = JSON.parse(ip.address_line || "{}");
      } catch (e) {
        // Fallback for older comma-separated format
        const parts = (ip.address_line || "").split(",").map(p => p.trim()).filter(Boolean);
        if (parts.length >= 3) {
          parsed.country = parts[parts.length - 1] || "";
          parsed.state = parts[parts.length - 2] || "";
          parsed.district = parts[parts.length - 3] || "";
        }
      }
      return {
        country: parsed.country || "",
        state: parsed.state || "",
        district: parsed.district || "",
        areaType: parsed.areaType || "",
        localBodyType: parsed.localBodyType || "",
        localBodyName: parsed.localBodyName || "",
        wardOrSector: parsed.wardOrSector || "",
        houseNoAndName: parsed.houseNoAndName || "",
        landmark: parsed.landmark || "",
        street: parsed.street || "",
        pincode: ip.pincode || "",
      };
    })(),

    courses_offered: (() => {
      if (!ip.courses_offered) return [];
      if (Array.isArray(ip.courses_offered)) return ip.courses_offered;
      try {
        const parsed = JSON.parse(ip.courses_offered);
        return Array.isArray(parsed) ? parsed : [String(parsed)];
      } catch (e) {
        return typeof ip.courses_offered === 'string' ? ip.courses_offered.split(',').map(s => s.trim()).filter(Boolean) : [];
      }
    })(),
    education_levels: (() => {
      if (!ip.education_levels) return [];
      if (Array.isArray(ip.education_levels)) return ip.education_levels;
      try {
        const parsed = JSON.parse(ip.education_levels);
        return Array.isArray(parsed) ? parsed : [String(parsed)];
      } catch (e) {
        return typeof ip.education_levels === 'string' ? ip.education_levels.split(',').map(s => s.trim()).filter(Boolean) : [];
      }
    })(),
    student_count: ip.student_count || "",
    faculty_count: ip.faculty_count || "",
    campus_type: ip.campus_type || "",
    operating_hours: ip.operating_hours || "",

    license_certificate_url: ip.license_certificate_url || "",
    accreditation_docs: Array.isArray(ip.accreditation_docs) && ip.accreditation_docs.length > 0 ? ip.accreditation_docs[0] : (typeof ip.accreditation_docs === 'string' ? ip.accreditation_docs : "")
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState("idle");
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialLoad.current = false;
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const formDataStr = JSON.stringify(formData);

  useEffect(() => {
    if (!isInitialLoad.current && profile?.id) {
      const saveDraftTimeout = setTimeout(() => {
        setAutoSaveStatus('saving');

        const addr = formData.address;
        const fullLocationString = [addr.district, addr.state, addr.country].filter(Boolean).join(", ");
        const address_line = JSON.stringify({
          country: addr.country || "",
          state: addr.state || "",
          district: addr.district || "",
          areaType: addr.areaType || "",
          localBodyType: addr.localBodyType || "",
          localBodyName: addr.localBodyName || "",
          wardOrSector: addr.wardOrSector || "",
          houseNoAndName: addr.houseNoAndName || "",
          landmark: addr.landmark || "",
          street: addr.street || ""
        });

        let final_accreditation = formData.accreditation_docs;
        let final_license = formData.license_certificate_url;

        const institute_profile = {
          institute_type: formData.institute_type,
          established_year: parseInt(formData.established_year) || 0,
          registration_number: formData.registration_number,
          official_phone: (formData.official_country_code && formData.official_phone)
            ? `${formData.official_country_code}${formData.official_phone}`
            : formData.official_phone,
          official_email: formData.official_email,
          website_url: formData.website_url ? (formData.website_url.startsWith('http') ? formData.website_url : `https://${formData.website_url}`) : "",
          alternate_contact: (formData.alternate_country_code && formData.alternate_contact)
            ? `${formData.alternate_country_code}${formData.alternate_contact}`
            : formData.alternate_contact,
          courses_offered: Array.isArray(formData.courses_offered) ? formData.courses_offered : [],
          education_levels: Array.isArray(formData.education_levels) ? formData.education_levels : [],
          student_count: parseInt(formData.student_count) || 0,
          faculty_count: parseInt(formData.faculty_count) || 0,
          campus_type: formData.campus_type,
          operating_hours: formData.operating_hours,
          license_certificate_url: final_license,
          accreditation_docs: final_accreditation ? (Array.isArray(final_accreditation) ? final_accreditation : [final_accreditation]) : [],
          pincode: addr.pincode,
          short_description: formData.bio,
          address_line: address_line,
          logo_url: (formData.profile_pic_url_db || formData.profile_pic_url) ? (formData.profile_pic_url_db || formData.profile_pic_url).split('?')[0] : "",
          banner_url: (formData.banner_url_db || formData.banner_url) ? (formData.banner_url_db || formData.banner_url).split('?')[0] : "",
        };

        updateProfile({
          user_id: profile.id,
          bio: formData.bio,
          location: fullLocationString,
          demographic: addr.areaType || "",
          primary_name: formData.primary_name?.trim() || "",
          secondary_name: formData.secondary_name?.trim() || "",
          institute_profile: institute_profile
        }).then(() => {
          setAutoSaveStatus('saved');
        }).catch(err => {
          console.error("Auto-save failed", err);
          setAutoSaveStatus('idle');
        });
      }, 2000);

      return () => clearTimeout(saveDraftTimeout);
    }
  }, [formDataStr, profile?.id]);

  const filteredCountries = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.enName && c.enName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.code.includes(searchQuery)
  );

  const { userLocation } = useAccessibility();
  const { showToast } = useToast();

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

            setFormData(p => {
              const newCity = exactMatch || cName;
              if (p.location_country === cIso && p.location_state === sIso && p.location_city === newCity) {
                return p;
              }
              return {
                ...p,
                location_country: cIso,
                location_state: sIso,
                location_city: newCity
              };
            });
          }
        }
      }
    }
  }, [profile, countries]);

  const uLat = userLocation?.lat;
  const uLon = userLocation?.lon;


  const renderAddressBlock = () => {
    const sourceData = formData.address || {};
    const errPrefix = 'address';

    const selectedCountryData = gazeteer.Countries.find(c => c.name === sourceData.country);
    let stateOptions = [];
    if (selectedCountryData?.states) {
      const sortedStates = sortLocationsByDistance(selectedCountryData.states, uLat, uLon, 'states');
      stateOptions = sortedStates.map(s => ({ value: s.name, label: s.name }));
    }

    let districtOptions = [];
    const selectedStateData = selectedCountryData?.states?.find(s => s.name === sourceData.state);
    if (selectedStateData?.districts) {
      const sortedDistricts = sortLocationsByDistance(selectedStateData.districts, uLat, uLon, 'districts');
      districtOptions = sortedDistricts.map(d => ({ value: d.name, label: d.name }));
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5, alignItems: 'flex-start' }}>
          <CustomFloatingCountrySelect label="देश" required value={sourceData.country} onChange={handleAddressFieldChange('country')} error={!!formErrors['address.country']} />
          <CustomFloatingSelect label="राज्य" required value={sourceData.state} onChange={handleAddressFieldChange('state')} error={!!formErrors['address.state']} disabled={stateOptions.length === 0} options={stateOptions} />
          <CustomFloatingSelect label="ज़िला" required value={sourceData.district} onChange={handleAddressFieldChange('district')} error={!!formErrors['address.district']} disabled={districtOptions.length === 0} options={districtOptions} />

          <CustomFloatingSelect
            label="क्षेत्र का प्रकार"
            required
            value={sourceData.areaType}
            onChange={(e) => {
              handleAddressFieldChange('areaType')(e);
              handleAddressFieldChange('localBodyType')({ target: { value: '' } });
              handleAddressFieldChange('localBodyName')({ target: { value: '' } });
            }}
            options={AREA_TYPE_OPTIONS}
          />

          {sourceData.areaType === 'Rural Areas' && (
            <CustomFloatingSelect
              label="स्थानीय निकाय का प्रकार"
              required
              value={sourceData.localBodyType}
              onChange={handleAddressFieldChange('localBodyType')}
              options={RURAL_LOCAL_BODY_OPTIONS}
            />
          )}

          {sourceData.areaType === 'Urban Areas' && (
            <CustomFloatingSelect
              label="स्थानीय निकाय का प्रकार"
              required
              value={sourceData.localBodyType}
              onChange={handleAddressFieldChange('localBodyType')}
              options={URBAN_LOCAL_BODY_OPTIONS}
            />
          )}

          {(sourceData.areaType === 'Rural Areas' || sourceData.areaType === 'Urban Areas') && (
            <CustomFloatingInput
              label="स्थानीय निकाय का नाम"
              required
              value={sourceData.localBodyName}
              onChange={handleAddressFieldChange('localBodyName')}
            />
          )}

          <CustomFloatingInput label="वार्ड या सेक्टर" value={sourceData.wardOrSector} onChange={handleAddressFieldChange('wardOrSector')} />
          <CustomFloatingInput label="मकान नंबर और नाम" required value={sourceData.houseNoAndName} onChange={handleAddressFieldChange('houseNoAndName')} />
          <CustomFloatingInput label="लैंडमार्क" value={sourceData.landmark} onChange={handleAddressFieldChange('landmark')} />
          <CustomFloatingInput label="गली / मोहल्ला" value={sourceData.street} onChange={handleAddressFieldChange('street')} />
          <CustomFloatingInput label="पिनकोड" required value={sourceData.pincode} onChange={handleAddressFieldChange('pincode')} error={!!formErrors.pincode} helperText={typeof formErrors.pincode === 'string' ? formErrors.pincode : ''} type="number" />
        </Box>
      </Box>
    );
  };


  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleClear = () => {
    if (activeStep === 0) {
      setFormData(prev => ({ ...prev, primary_name: "", secondary_name: "", institute_type: "", affiliation_board: "", established_year: "", registration_number: "", bio: "" }));
    } else if (activeStep === 1) {
      setFormData(prev => ({ ...prev, official_phone: "", official_email: "", website_url: "", alternate_contact: "", address: { country: "", state: "", district: "", areaType: "", localBodyType: "", localBodyName: "", wardOrSector: "", houseNoAndName: "", landmark: "", street: "", pincode: "" } }));
    } else if (activeStep === 2) {
      setFormData(prev => ({ ...prev, courses_offered: [], education_levels: [], student_count: "", faculty_count: "", campus_type: "", operating_hours: "" }));
      setOpenTime(null);
      setCloseTime(null);
    } else if (activeStep === 3) {
      setFormData(prev => ({ ...prev, accreditation_docs: "", license_certificate_url: "" }));
      setUploadedFileNames(prev => ({ ...prev, accreditation_docs: "", license_certificate_url: "" }));
    }
  };

  const handleDiscard = () => {
    if (window.confirm("क्या आप बदलाव रद्द करना चाहते हैं?")) {
      onClose();
    }
  };


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
      let oldURL = null;
      if (fieldName === 'banner') oldURL = formData.banner_url_db;
      else if (fieldName === 'profile') oldURL = formData.profile_pic_url_db;
      else oldURL = formData[fieldName];

      const fileUrl = await uploadToMinIO(file, profile, fieldName, fieldName, oldURL);

      if (fieldName === 'banner') {
        setFormData(p => ({ ...p, banner_url: URL.createObjectURL(file), banner_url_db: fileUrl }));
      } else if (fieldName === 'profile') {
        setFormData(p => ({ ...p, profile_pic_url: URL.createObjectURL(file), profile_pic_url_db: fileUrl }));
      } else {
        setFormData(p => ({ ...p, [fieldName]: fileUrl }));
        setUploadedFileNames(p => ({ ...p, [fieldName]: file.name }));
      }

    } catch (err) {
      console.error(`${fieldName} upload failed:`, err);
      showToast(err.response?.data?.error || "File upload failed. Please ensure the backend is running and the file is a PDF, JPG, or PNG.");
    } finally {
      setUploading(false);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    const addErr = (key, msg) => { if (msg) newErrors[key] = msg; };

    if (step === 0) {
      addErr('primary_name', validateInstitutionName(formData.primary_name));
      addErr('secondary_name', validateInstitutionName(formData.secondary_name));
      if (!formData.institute_type) newErrors.institute_type = "संस्थान का प्रकार चुनें";
      if (!formData.established_year) newErrors.established_year = "स्थापना वर्ष चुनें";
      addErr('registration_number', validateRegistrationNumber(formData.registration_number));
      addErr('bio', validateBio(formData.bio));

      if (!noChildTypes.includes(formData.institute_type) && !formData.affiliation_board)
        newErrors.affiliation_board = "संबद्धता बोर्ड आवश्यक है";

    } else if (step === 1) {
      addErr('official_phone', validateInstitutePhone(formData.official_phone));
      addErr('official_email', validateEmail(formData.official_email) || (!formData.official_email ? "आधिकारिक ईमेल आवश्यक है" : ""));
      addErr('website_url', validateURL(formData.website_url));
      addErr('alternate_contact', validateInstitutePhone(formData.alternate_contact));
      if (!formData.address.country) newErrors['address.country'] = true;
      if (!formData.address.state) newErrors['address.state'] = true;
      if (!formData.address.district) newErrors['address.district'] = true;
      addErr('pincode', validatePincode(formData.address.pincode));

    } else if (step === 2) {
      if (!formData.courses_offered || formData.courses_offered.length === 0)
        newErrors.courses_offered = "कम से कम एक कोर्स चुनें";
      if (!formData.education_levels || !formData.education_levels.length)
        newErrors.education_levels = "कम से कम एक शिक्षा स्तर चुनें";
      const studentErr = validateCount(formData.student_count, "छात्र संख्या");
      const facultyErr = validateCount(formData.faculty_count, "शिक्षक संख्या");
      addErr('student_count', studentErr);
      addErr('faculty_count', facultyErr);

    } else if (step === 3) {
      if (!formData.accreditation_docs) newErrors.accreditation_docs = "मान्यता दस्तावेज़ अपलोड करें";
      if (!formData.license_certificate_url) newErrors.license_certificate_url = "लाइसेंस प्रमाणपत्र अपलोड करें";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeStep < 3) {
      handleNext();
      return;
    }

    let allErrors = {};
    let firstErrorStep = -1;
    for (let i = 0; i <= 3; i++) {
      const stepErrs = validateStep(i);
      allErrors = { ...allErrors, ...stepErrs };
      if (Object.keys(stepErrs).length > 0 && firstErrorStep === -1) {
        firstErrorStep = i;
      }
    }

    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      setActiveStep(firstErrorStep);
      return;
    }
    setFormErrors({});
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setLoading(true);
    try {

      const addr = formData.address;
      const fullLocationString = [addr.district, addr.state, addr.country].filter(Boolean).join(", ");
      const address_line = JSON.stringify({
        country: addr.country || "",
        state: addr.state || "",
        district: addr.district || "",
        areaType: addr.areaType || "",
        localBodyType: addr.localBodyType || "",
        localBodyName: addr.localBodyName || "",
        wardOrSector: addr.wardOrSector || "",
        houseNoAndName: addr.houseNoAndName || "",
        landmark: addr.landmark || "",
        street: addr.street || ""
      });

      let final_accreditation = formData.accreditation_docs;

      let final_license = formData.license_certificate_url;

      const institute_profile = {
        institute_type: formData.institute_type,
        established_year: parseInt(formData.established_year) || 0,
        registration_number: formData.registration_number,
        official_phone: (formData.official_country_code && formData.official_phone)
          ? `${formData.official_country_code}${formData.official_phone}`
          : formData.official_phone,
        official_email: formData.official_email,
        website_url: formData.website_url ? (formData.website_url.startsWith('http') ? formData.website_url : `https://${formData.website_url}`) : "",
        alternate_contact: (formData.alternate_country_code && formData.alternate_contact)
          ? `${formData.alternate_country_code}${formData.alternate_contact}`
          : formData.alternate_contact,
        courses_offered: Array.isArray(formData.courses_offered) ? formData.courses_offered : [],
        education_levels: Array.isArray(formData.education_levels) ? formData.education_levels : [],
        student_count: parseInt(formData.student_count) || 0,
        faculty_count: parseInt(formData.faculty_count) || 0,
        campus_type: formData.campus_type,
        operating_hours: formData.operating_hours,
        license_certificate_url: final_license,
        accreditation_docs: final_accreditation ? (Array.isArray(final_accreditation) ? final_accreditation : [final_accreditation]) : [],
        pincode: addr.pincode,
        short_description: formData.bio,
        address_line: address_line,
        logo_url: (formData.profile_pic_url_db || formData.profile_pic_url) ? (formData.profile_pic_url_db || formData.profile_pic_url).split('?')[0] : "",
        banner_url: (formData.banner_url_db || formData.banner_url) ? (formData.banner_url_db || formData.banner_url).split('?')[0] : "",
      };

      await updateProfile({
        user_id: profile.id,
        bio: formData.bio,
        location: fullLocationString,
        demographic: addr.areaType || "",
        primary_name: formData.primary_name.trim(),
        secondary_name: formData.secondary_name.trim(),
        institute_profile: institute_profile
      });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || "अद्यतन विफल रहा। कृपया सुनिश्चित करें कि सभी आवश्यक जानकारी सही है।");
    } finally {
      isSubmitting.current = false;
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: "var(--size-full)" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: "flex-start" }}>
              <CustomFloatingInput
                label="संस्थान का नाम (प्राथमिक भाषा)"
                required
                name="primary_name"
                value={formData.primary_name}
                onChange={handleChange}
                error={!!formErrors.primary_name}
                helperText={typeof formErrors.primary_name === 'string' ? formErrors.primary_name : ''}
              />
              <CustomFloatingInput
                label="संस्थान का नाम (द्वितीय भाषा)"
                required
                name="secondary_name"
                value={formData.secondary_name}
                onChange={handleChange}
                error={!!formErrors.secondary_name}
                helperText={typeof formErrors.secondary_name === 'string' ? formErrors.secondary_name : ''}
              />
              <CustomFloatingSelect
                label="संस्थान का प्रकार"
                required
                name="institute_type"
                value={formData.institute_type}
                onChange={(e) => setFormData(p => ({ ...p, institute_type: e.target.value, affiliation_board: "" }))}
                options={instituteCategoryOptions.map(opt => ({ label: opt.label, value: opt.label }))}
                error={!!formErrors.institute_type}
                helperText={typeof formErrors.institute_type === 'string' ? formErrors.institute_type : ''}
              />

              {formData.institute_type && !noChildTypes.includes(formData.institute_type) && (
                <CustomFloatingSearchableSelect
                  label={['National Board', 'State Board', 'International Board'].includes(formData.institute_type) ? "बोर्ड का नाम" : "विश्वविद्यालय का नाम"}
                  required
                  options={Reflect.get(affiliationOptionsMap, formData.institute_type) || []}
                  value={formData.affiliation_board || ""}
                  onChange={(e) => setFormData(p => ({ ...p, affiliation_board: e.target.value }))}
                  error={!!formErrors.affiliation_board}
                  freeSolo={true}
                />
              )}

              <CustomFloatingSelect
                label="स्थापना वर्ष"
                required
                name="established_year"
                value={formData.established_year ? formData.established_year.toString() : ""}
                onChange={(e) => setFormData(p => ({ ...p, established_year: e.target.value }))}
                options={years.map(y => ({ label: y, value: y }))}
                error={!!formErrors.established_year}
                helperText={typeof formErrors.established_year === 'string' ? formErrors.established_year : ''}
              />
              <CustomFloatingInput
                label="पंजीकरण संख्या"
                required
                name="registration_number"
                value={formData.registration_number}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value.toUpperCase() }))}
                error={!!formErrors.registration_number}
                helperText={typeof formErrors.registration_number === 'string' ? formErrors.registration_number : ''}
              />
            </Box>

            <CustomFloatingInput
              label="संस्थान के बारे में"
              required
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: "var(--size-full)" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: "flex-start" }}>
              <CustomFloatingPhoneInput
                label="आधिकारिक फ़ोन"
                required
                countryCode={formData.official_country_code}
                onCountryCodeChange={(val) => setFormData(p => ({ ...p, official_country_code: val }))}
                value={formData.official_phone}
                onChange={(e) => setFormData(p => ({ ...p, official_phone: e.target.value }))}
                error={!!formErrors.official_phone}
                helperText={typeof formErrors.official_phone === 'string' ? formErrors.official_phone : ''}
              />
              <CustomFloatingInput
                label="आधिकारिक ईमेल"
                required
                name="official_email"
                value={formData.official_email}
                onChange={handleChange}
                error={!!formErrors.official_email}
                helperText={typeof formErrors.official_email === 'string' ? formErrors.official_email : ''}
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: "flex-start" }}>
              <CustomFloatingInput
                label="वेबसाइट URL"
                required
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                error={!!formErrors.website_url}
                helperText={typeof formErrors.website_url === 'string' ? formErrors.website_url : ''}
              />
              <CustomFloatingPhoneInput
                label="वैकल्पिक संपर्क"
                required
                countryCode={formData.alternate_country_code}
                onCountryCodeChange={(val) => setFormData(p => ({ ...p, alternate_country_code: val }))}
                value={formData.alternate_contact}
                onChange={(e) => setFormData(p => ({ ...p, alternate_contact: e.target.value }))}
                error={!!formErrors.alternate_contact}
                helperText={typeof formErrors.alternate_contact === 'string' ? formErrors.alternate_contact : ''}
              />
            </Box>


            {/* Detailed Address Section */}
            {renderAddressBlock()}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: "var(--size-full)" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: "flex-start" }}>
              <CustomFloatingSearchableSelect
                multiple={true}
                freeSolo={true}
                label="ऑफ़र किए गए कोर्स"
                required
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
                label="शिक्षा स्तर"
                required
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
                required
                name="student_count"
                value={formData.student_count}
                onChange={handleChange}
                type="number"
              />
              <CustomFloatingInput
                label="कुल शिक्षक संख्या"
                required
                name="faculty_count"
                value={formData.faculty_count}
                onChange={handleChange}
                type="number"
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: "flex-start" }}>
              <CustomFloatingSelect
                label="परिसर का प्रकार"
                required
                name="campus_type"
                value={formData.campus_type}
                onChange={(e) => setFormData(p => ({ ...p, campus_type: e.target.value }))}
                options={campusTypes.map(c => ({ label: c, value: c }))}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, alignItems: 'flex-start' }}>
                <CustomTimePicker
                  label="खुलने का समय"
                  required
                  value={openTime}
                  onChange={(newValue) => setOpenTime(newValue)}
                />
                <CustomTimePicker
                  label="बंद होने का समय"
                  required
                  value={closeTime}
                  onChange={(newValue) => setCloseTime(newValue)}
                />
              </Box>
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: "var(--size-full)" }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: 'flex-start' }}>
              <CustomFloatingMinIOUpload
                label="संबद्धता दस्तावेज़"
                profile={profile}
                required
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={formData.accreditation_docs}
                uploadFunction={async (file) => {
                  const oldURL = formData.accreditation_docs;
                  return await uploadToMinIO(file, profile, 'institute', 'accreditation_docs', typeof oldURL === 'string' && oldURL.startsWith('http') ? oldURL : null);
                }}
                onUploadComplete={(url) => {
                  setFormData(prev => ({ ...prev, accreditation_docs: url || "" }));
                  if (url && formErrors.accreditation_docs) {
                    setFormErrors(p => ({ ...p, accreditation_docs: false }));
                  }
                }}
                error={!!formErrors.accreditation_docs}
                helperText={formErrors.accreditation_docs}
              />
              <CustomFloatingMinIOUpload
                label="पंजीकरण दस्तावेज़"
                profile={profile}
                required
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={formData.license_certificate_url}
                uploadFunction={async (file) => {
                  const oldURL = formData.license_certificate_url;
                  return await uploadToMinIO(file, profile, 'institute', 'license_certificate_url', typeof oldURL === 'string' && oldURL.startsWith('http') ? oldURL : null);
                }}
                onUploadComplete={(url) => {
                  setFormData(prev => ({ ...prev, license_certificate_url: url || "" }));
                  if (url && formErrors.license_certificate_url) {
                    setFormErrors(p => ({ ...p, license_certificate_url: false }));
                  }
                }}
                error={!!formErrors.license_certificate_url}
                helperText={formErrors.license_certificate_url}
              />
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
    <FormLoadingProvider isLoading={loading}>
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
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.45) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.3) 0, transparent 50%), 
            radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.2) 0, transparent 50%),
            radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.15) 0, transparent 50%),
            #eef2f6
          `,
            border: "none",
            overflow: "hidden",
            maxHeight: "92vh",
            position: "relative",
          }}
        >
          {/* Top-Right Absolute Close Button */}
          <Box sx={{ position: "absolute", top: { xs: 16, sm: 24 }, right: { xs: 16, sm: 24 }, zIndex: 10, display: "flex", gap: 1, alignItems: "center" }}>
            <CustomTooltip title="रद्द करें">
              <IconButton onClick={handleDiscard} disableRipple sx={{ color: "var(--color-error)", "&:hover": { bgcolor: "transparent" } }}>
                <DeleteOutlineIcon />
              </IconButton>
            </CustomTooltip>
            <CustomTooltip title="साफ़ करें">
              <IconButton onClick={handleClear} disableRipple sx={{ color: "var(--color-slate-500)", "&:hover": { bgcolor: "transparent" } }}>
                <BroomIcon />
              </IconButton>
            </CustomTooltip>
            <CustomTooltip title="बंद करें">
              <IconButton onClick={onClose} disableRipple sx={{ color: "var(--color-slate-500)", "&:hover": { bgcolor: "transparent" } }}>
                <CloseIcon />
              </IconButton>
            </CustomTooltip>
          </Box>

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
                  संस्थान प्रोफ़ाइल
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.5 }}
                >
                  अपनी प्रोफ़ाइल पूरी करें और आगे बढ़ें।
                </Typography>
              </Box>

              {/* Auto Save Indicator Positioned in Header Right */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AutoSaveIndicator status={autoSaveStatus} />
              </Box>
            </Box>

            {/* Step Indicator Progress Bar */}
            <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
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
                      transition: "all var(--transition-slow)",
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

          <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
            {/* Scrollable Content Area */}
            <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, px: { xs: 3, sm: 8 }, py: 3, display: 'flex', flexDirection: 'column' }}>
              {renderStepContent(activeStep)}
            </Box>

            {/* Fixed Footer */}
            <Box sx={{
              px: { xs: 3, sm: 8 },
              pt: 3,
              pb: { xs: 6, sm: 8 },
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "flex-end",
              alignItems: { xs: "stretch", sm: "center" },
              gap: { xs: 1.5, sm: 2 },
              flexShrink: 0,
            }}>
              <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 }, flexWrap: { xs: "wrap", sm: "nowrap" }, width: { xs: "var(--size-full)", sm: "auto" } }}>
                {activeStep > 0 && (
                  <TarangButton
                    variant="outlined"
                    onClick={handleBack}
                    sx={{
                      flex: { xs: "1 1 calc(50% - 6px)", sm: "0 0 auto" },
                      minWidth: { xs: 0, sm: "120px" },
                      height: { xs: "44px", sm: "48px" },
                      fontSize: { xs: 'var(--font-xs)', sm: 'var(--font-sm)' },
                      order: { xs: 1, sm: 0 },
                    }}
                  >
                    पीछे
                  </TarangButton>
                )}
                <TarangButton
                  type="submit"
                  loading={activeStep === 3 ? loading : false}
                  disabled={loading || uploadingBanner || uploadingAvatar || uploadingAccreditation || uploadingLicense}
                  sx={{
                    flex: { xs: "1 1 calc(50% - 6px)", sm: "0 0 auto" },
                    minWidth: { xs: 0, sm: "120px" },
                    height: { xs: "44px", sm: "48px" },
                    fontSize: { xs: 'var(--font-xs)', sm: 'var(--font-sm)' },
                    order: { xs: 2, sm: 1 },
                  }}
                >
                  {activeStep === 3 ? "सबमिट करें" : "आगे"}
                </TarangButton>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </FormLoadingProvider>
  );
}
