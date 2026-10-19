import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box, Typography, IconButton, CircularProgress,
  InputAdornment, Paper, Avatar, Divider, Checkbox, FormControlLabel, Button
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import TarangButton from "../../../components/common/TarangButton";
import CustomCheckbox from "../../../components/common/CustomCheckbox";
import { apiClient } from "../../../lib/apiClient";
import { CustomFloatingInput, CustomFloatingSelect, CustomFloatingDatePicker, CustomFloatingCountrySelect, CustomFloatingFileInput, CustomFloatingDocumentUpload } from "../../../components/common/CustomFloatingFields";
import { motion as Motion } from "framer-motion";
import useScrollLock from "../../../hooks/useScrollLock";
import { useAccessibility } from "../../../contexts/AccessibilityContext";
import { GENDER_OPTIONS, CASTE_OPTIONS, getSubcasteOptions, ACHIEVEMENT_TYPE_OPTIONS, AREA_TYPE_OPTIONS, RURAL_LOCAL_BODY_OPTIONS, URBAN_LOCAL_BODY_OPTIONS } from "../../../lib/admissionFormOptions";
import { buildSortedLanguages } from "../../../lib/languages";
import { RELIGION_OPTIONS } from "../../../lib/religion";
import { sortLocationsByDistance } from "../../../lib/geoNormalize";
import gazeteer from "../../../data/formated/gazeteer.json";
import authConfigData from "../../../data/instituteConfig.json";
import { CustomFloatingSearchableSelect } from "../../../components/common/CustomFloatingFields";
import { FormLoadingProvider } from '../../../contexts/FormLoadingContext';

const themeBorderSx = "var(--border-thin) solid var(--color-slate-300)";

const ALL_BOARDS_AND_UNIVERSITIES = [
  ...(authConfigData.centralUniversitiesList || []),
  ...(authConfigData.stateUniversitiesList || []),
  ...(authConfigData.privateUniversitiesList || []),
  ...(authConfigData.deemedUniversitiesList || []),
  ...(authConfigData.instituteOfNationalImportanceList || []),
  ...(authConfigData.standaloneInstitutionsList || []),
  ...(authConfigData.nationalBoardsList || []),
  ...(authConfigData.stateBoardsList || []),
  ...(authConfigData.internationalBoardsList || [])
];


const SOCIAL_PLATFORMS = [
  { group: "🌟 Essential", name: "LinkedIn" },
  { group: "🌟 Essential", name: "GitHub" },
  { group: "🌟 Essential", name: "Portfolio / Personal Website" },
  { group: "🌟 Essential", name: "Resume / CV" },

  { group: "💻 Developers & Tech Students", name: "GitLab" },
  { group: "💻 Developers & Tech Students", name: "Bitbucket" },
  { group: "💻 Developers & Tech Students", name: "LeetCode" },
  { group: "💻 Developers & Tech Students", name: "HackerRank" },
  { group: "💻 Developers & Tech Students", name: "Codeforces" },
  { group: "💻 Developers & Tech Students", name: "CodeChef" },
  { group: "💻 Developers & Tech Students", name: "AtCoder" },
  { group: "💻 Developers & Tech Students", name: "GeeksforGeeks Profile" },
  { group: "💻 Developers & Tech Students", name: "Kaggle" },
];

export default function ProfileUpdateModal({ open, onClose, profile, onSuccess }) {
  const { userLocation } = useAccessibility();
  const sortedLanguages = useMemo(() => buildSortedLanguages(userLocation), [userLocation]);
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Step 1: Personal
    full_name: "", bio: "", dob: "", gender: "", religion: "", caste: "", subcaste: "", nationality: "", location: "", language: "", languages: "", demographic: "",
    social_links: { linkedin: "", github: "", twitter: "", instagram: "" },
    socialLinksArr: [{ platform: '', url: '' }],
    profile_pic_url: "", banner_url: "",

    // Step 2: Family
    fatherName: "", fatherContact: "", fatherProfession: "", fatherIncome: "",
    motherName: "", motherContact: "", motherProfession: "", motherIncome: "",
    familyIncome: "",

    // Step 3: Address
    permanentAddress: { country: "", state: "", district: "", pincode: "", addressLine: "", areaType: "", localBodyType: "", localBodyName: "", wardOrSector: "", houseNoAndName: "", landmark: "", street: "" },
    correspondenceAddress: { country: "", state: "", district: "", pincode: "", addressLine: "", areaType: "", localBodyType: "", localBodyName: "", wardOrSector: "", houseNoAndName: "", landmark: "", street: "" },
    sameAsPermanent: false,

    // Step 4: Academic
    academicRecords: [{ qualification: "", passingYear: "", percentage: "" }]
  });

  const [loading, setLoading] = useState(false);

  useScrollLock(open);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        dob: profile.dob || "",
        gender: profile.gender || "",
        religion: profile.religion || "",
        caste: profile.caste || "",
        subcaste: profile.subcaste || "",
        nationality: profile.nationality || "",
        location: profile.location || "",
        language: profile.language || (profile.languages && profile.languages.length > 0 ? profile.languages[0] : ""),
        languages: profile.languages ? profile.languages.join(", ") : "",
        demographic: profile.demographic || "",
        socialLinksArr: profile.social_links ? Object.entries(profile.social_links).map(([k, v]) => ({ platform: k, url: v })) : [{ platform: '', url: '' }],
        profile_pic_url: profile.profile_pic_url || "",
        banner_url: profile.banner_url || "",

        // Initialize nested data
        permanentAddress: profile.addresses?.find(a => a.type === 'permanent') ? (() => {
          const a = profile.addresses.find(a => a.type === 'permanent');
          let parsed = {};
          try { parsed = JSON.parse(a.address_line || "{}"); } catch (e) {
            const parts = (a.address_line || "").split(", ");
            parsed = { houseNoAndName: parts[0] || "", street: parts[1] || "", landmark: parts[2] || "", wardOrSector: parts[3] || "" };
          }
          return {
            country: parsed.country || a.country || "",
            state: a.state || "",
            district: a.district || "",
            pincode: a.pincode || "",
            areaType: parsed.areaType || "",
            localBodyType: parsed.localBodyType || "",
            localBodyName: parsed.localBodyName || "",
            wardOrSector: parsed.wardOrSector || "",
            houseNoAndName: parsed.houseNoAndName || "",
            street: parsed.street || "",
            landmark: parsed.landmark || ""
          };
        })() : prev.permanentAddress,

        correspondenceAddress: profile.addresses?.find(a => a.type === 'correspondence') ? (() => {
          const a = profile.addresses.find(a => a.type === 'correspondence');
          let parsed = {};
          try { parsed = JSON.parse(a.address_line || "{}"); } catch (e) {
            const parts = (a.address_line || "").split(", ");
            parsed = { houseNoAndName: parts[0] || "", street: parts[1] || "", landmark: parts[2] || "", wardOrSector: parts[3] || "" };
          }
          return {
            country: parsed.country || a.country || "",
            state: a.state || "",
            district: a.district || "",
            pincode: a.pincode || "",
            areaType: parsed.areaType || "",
            localBodyType: parsed.localBodyType || "",
            localBodyName: parsed.localBodyName || "",
            wardOrSector: parsed.wardOrSector || "",
            houseNoAndName: parsed.houseNoAndName || "",
            street: parsed.street || "",
            landmark: parsed.landmark || ""
          };
        })() : prev.correspondenceAddress,

        academicRecords: profile.academic_records?.length > 0 ? profile.academic_records.map(rec => ({
          qualification: rec.qualification || "",
          boardUniversity: rec.board_university || "",
          passingYear: rec.passing_year || "",
          score: (rec.percentage_cgpa || "").includes('/') ? (rec.percentage_cgpa || "").split('/')[0].trim() : (rec.percentage_cgpa || "").replace(/[^0-9.]/g, ''),
          maxScore: (rec.percentage_cgpa || "").includes('100') ? '100' : ((rec.percentage_cgpa || "").includes('10') ? '10' : ''),
          document_url: rec.document_url || "",
          achievements: rec.achievements || []
        })) : [{ qualification: "", boardUniversity: "", passingYear: "", score: "", maxScore: "", achievements: [] }]
      }));
    }
  }, [profile, open]);

  useEffect(() => {
    if (open) {
      setActiveStep(0);
    }
  }, [open]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (!name) return;
    if (name.startsWith("social_")) {
      const platform = name.replace("social_", "");
      setFormData(prev => ({
        ...prev, social_links: { ...prev.social_links, [platform]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
    setErrors(prev => ({ ...prev, [`${category}_${field}`]: "" }));
  };

  const handleAcademicChange = (index, field, value) => {
    setFormData(prev => {
      const records = [...prev.academicRecords];
      records[index] = { ...records[index], [field]: value };
      return { ...prev, academicRecords: records };
    });
    setErrors(prev => ({ ...prev, [`academic_${index}_${field}`]: "" }));
  };

  const addAcademicRecord = () => {
    setFormData(prev => ({
      ...prev,
      academicRecords: [...prev.academicRecords, { qualification: "", passingYear: "", score: "", maxScore: "" }]
    }));
  };

  const removeAcademicRecord = (index) => {
    setFormData(prev => {
      const records = [...prev.academicRecords];
      records.splice(index, 1);
      return { ...prev, academicRecords: records };
    });
  };

  const addAchievement = (academicIndex) => {
    setFormData(prev => {
      const records = [...prev.academicRecords];
      const record = { ...records[academicIndex] };
      const achs = record.achievements || [];
      record.achievements = [...achs, { type: "", details: "", recognizedBy: "" }];
      records[academicIndex] = record;
      return { ...prev, academicRecords: records };
    });
  };

  const removeAchievement = (academicIndex, achIndex) => {
    setFormData(prev => {
      const records = [...prev.academicRecords];
      const record = { ...records[academicIndex] };
      if (record.achievements) {
        const achs = [...record.achievements];
        achs.splice(achIndex, 1);
        record.achievements = achs;
      }
      records[academicIndex] = record;
      return { ...prev, academicRecords: records };
    });
  };

  const handleAchievementChange = (academicIndex, achIndex, field, value) => {
    setFormData(prev => {
      const records = [...prev.academicRecords];
      const record = { ...records[academicIndex] };
      if (record.achievements) {
        const achs = [...record.achievements];
        achs[achIndex] = { ...achs[achIndex], [field]: value };
        record.achievements = achs;
      }
      records[academicIndex] = record;
      return { ...prev, academicRecords: records };
    });
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!formData.full_name) newErrors.full_name = "Required";
      if (!formData.dob) newErrors.dob = "Required";
      if (!formData.gender) newErrors.gender = "Required";
    } else if (step === 1) {
      const reqFields = ['country', 'state', 'district', 'pincode'];
      reqFields.forEach(f => {
        if (!formData.permanentAddress[f]) newErrors[`permanentAddress_${f}`] = "Required";
      });
      if (!formData.sameAsPermanent) {
        reqFields.forEach(f => {
          if (!formData.correspondenceAddress[f]) newErrors[`correspondenceAddress_${f}`] = "Required";
        });
      }
    } else if (step === 2) {
      formData.academicRecords.forEach((rec, index) => {
        if (!rec.qualification) newErrors[`academic_${index}_qualification`] = "Required";
        if (!rec.passingYear) newErrors[`academic_${index}_passingYear`] = "Required";
        if (!rec.score) newErrors[`academic_${index}_score`] = "Required";
        if (!rec.maxScore) newErrors[`academic_${index}_maxScore`] = "Required";
      });
    } else if (step === 3) {
      formData.socialLinksArr.forEach((link, index) => {
        if (link.platform && !link.url) newErrors[`social_${index}_url`] = "Required";
        if (!link.platform && link.url) newErrors[`social_${index}_platform`] = "Required";
      });
    }
    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(activeStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setActiveStep(prev => prev + 1);
  };

  const handleAddSocialLink = () => {
    setFormData(p => ({ ...p, socialLinksArr: [...p.socialLinksArr, { platform: '', url: '' }] }));
  };

  const handleRemoveSocialLink = (index) => {
    setFormData(p => {
      const newArr = [...p.socialLinksArr];
      newArr.splice(index, 1);
      return { ...p, socialLinksArr: newArr };
    });
  };

  const handleSocialLinkChange = (index, field, value) => {
    setFormData(p => {
      const newArr = [...p.socialLinksArr];
      newArr[index] = { ...newArr[index], [field]: value };
      return { ...p, socialLinksArr: newArr };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeStep < 3) {
      handleNext();
      return;
    }

    const stepErrors = validateStep(activeStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setLoading(true);
    try {
      const formattedSocialLinks = {};
      if (formData.socialLinksArr) {
        formData.socialLinksArr.forEach(link => {
          if (link.platform && link.url) {
            formattedSocialLinks[link.platform] = link.url;
          }
        });
      }

      const formatAddressLine = (addr) => {
        return JSON.stringify({
          country: addr.country || "",
          areaType: addr.areaType || "",
          localBodyType: addr.localBodyType || "",
          localBodyName: addr.localBodyName || "",
          wardOrSector: addr.wardOrSector || "",
          houseNoAndName: addr.houseNoAndName || "",
          street: addr.street || "",
          landmark: addr.landmark || ""
        });
      };

      const formattedAddresses = [
        {
          type: "permanent",
          country: formData.permanentAddress.country || "",
          address_line: formatAddressLine(formData.permanentAddress) || "",
          state: formData.permanentAddress.state || "",
          district: formData.permanentAddress.district || "",
          pincode: formData.permanentAddress.pincode || "",
          is_same_as_permanent: false
        },
        {
          type: "correspondence",
          country: (formData.sameAsPermanent ? formData.permanentAddress.country : formData.correspondenceAddress.country) || "",
          address_line: formData.sameAsPermanent ? formatAddressLine(formData.permanentAddress) : formatAddressLine(formData.correspondenceAddress) || "",
          state: (formData.sameAsPermanent ? formData.permanentAddress.state : formData.correspondenceAddress.state) || "",
          district: (formData.sameAsPermanent ? formData.permanentAddress.district : formData.correspondenceAddress.district) || "",
          pincode: (formData.sameAsPermanent ? formData.permanentAddress.pincode : formData.correspondenceAddress.pincode) || "",
          is_same_as_permanent: formData.sameAsPermanent
        }
      ];

      const formattedAcademicRecords = formData.academicRecords.map(rec => ({
        qualification: rec.qualification || "",
        board_university: rec.boardUniversity || "",
        passing_year: parseInt(rec.passingYear) || 0,
        percentage_cgpa: `${rec.score} / ${rec.maxScore}`,
        document_url: rec.document_url || null,
        achievements: rec.achievements ? rec.achievements.filter(a => a.type || a.details).map(a => ({
          type: a.type || "",
          details: a.details || "",
          recognizedBy: a.recognizedBy || "",
          document_url: a.document_url || null
        })) : []
      }));

      const payload = {
        user_id: profile.id,
        full_name: formData.full_name,
        bio: formData.bio,
        dob: formData.dob,
        gender: formData.gender,
        religion: formData.religion,
        caste: formData.caste,
        subcaste: formData.subcaste,
        nationality: formData.nationality,
        location: [formData.permanentAddress?.district, formData.permanentAddress?.state, formData.permanentAddress?.country].filter(Boolean).join(", ") || formData.location,
        languages: formData.language ? [formData.language] : [],
        demographic: formData.demographic,
        social_links: formattedSocialLinks,
        profile_pic_url: formData.profile_pic_url,
        banner_url: formData.banner_url,
        addresses: formattedAddresses,
        academic_records: formattedAcademicRecords,
        work_experiences: []
      };

      await apiClient.post("/user/profile/update", payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const stepLabels = [
    { hindi: "व्यक्तिगत जानकारी" },
    { hindi: "पते की जानकारी" },
    { hindi: "शैक्षिक रिकॉर्ड" },
    { hindi: "लिंक्स" }
  ];

  const uLat = userLocation?.lat;
  const uLon = userLocation?.lon;

  const renderAddressBlock = (type, title, disabled = false, headerRight = null) => {
    const sourceData = (type === 'correspondenceAddress' && formData.sameAsPermanent)
      ? formData.permanentAddress
      : (formData[type] || {});

    const errPrefix = type;

    const sortedCountries = sortLocationsByDistance(gazeteer.Countries, uLat, uLon, 'countries');
    const countryOptions = sortedCountries.map(c => ({ value: c.name, label: c.name, flagUrl: c.flagUrl }));

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
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-900)' }}>
            {title}
          </Typography>
          {headerRight}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5, opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
          <CustomFloatingCountrySelect label="देश" value={sourceData.country} onChange={(e) => handleNestedChange(type, 'country', e.target.value)} error={!!errors[`${errPrefix}_country`]} disabled={disabled} />
          <CustomFloatingSelect label="राज्य" value={sourceData.state} onChange={(e) => handleNestedChange(type, 'state', e.target.value)} error={!!errors[`${errPrefix}_state`]} disabled={disabled || stateOptions.length === 0} options={stateOptions} />
          <CustomFloatingSelect label="ज़िला" value={sourceData.district} onChange={(e) => handleNestedChange(type, 'district', e.target.value)} error={!!errors[`${errPrefix}_district`]} disabled={disabled || districtOptions.length === 0} options={districtOptions} />

          <CustomFloatingSelect
            label="क्षेत्र का प्रकार"
            value={sourceData.areaType}
            onChange={(e) => {
              handleNestedChange(type, 'areaType', e.target.value);
              handleNestedChange(type, 'localBodyType', "");
              handleNestedChange(type, 'localBodyName', "");
            }}
            disabled={disabled}
            options={AREA_TYPE_OPTIONS}
          />

          {sourceData.areaType === 'Rural Areas' && (
            <CustomFloatingSelect
              label="स्थानीय निकाय का प्रकार"
              value={sourceData.localBodyType}
              onChange={(e) => handleNestedChange(type, 'localBodyType', e.target.value)}
              disabled={disabled}
              options={RURAL_LOCAL_BODY_OPTIONS}
            />
          )}

          {sourceData.areaType === 'Urban Areas' && (
            <CustomFloatingSelect
              label="स्थानीय निकाय का प्रकार"
              value={sourceData.localBodyType}
              onChange={(e) => handleNestedChange(type, 'localBodyType', e.target.value)}
              disabled={disabled}
              options={URBAN_LOCAL_BODY_OPTIONS}
            />
          )}

          {(sourceData.areaType === 'Rural Areas' || sourceData.areaType === 'Urban Areas') && (
            <CustomFloatingInput
              label="स्थानीय निकाय का नाम"
              value={sourceData.localBodyName}
              onChange={(e) => handleNestedChange(type, 'localBodyName', e.target.value)}
              disabled={disabled}
            />
          )}

          <CustomFloatingInput label="वार्ड या सेक्टर" value={sourceData.wardOrSector} onChange={(e) => handleNestedChange(type, 'wardOrSector', e.target.value)} disabled={disabled} />
          <CustomFloatingInput label="मकान नंबर और नाम" value={sourceData.houseNoAndName} onChange={(e) => handleNestedChange(type, 'houseNoAndName', e.target.value)} disabled={disabled} />
          <CustomFloatingInput label="लैंडमार्क" value={sourceData.landmark} onChange={(e) => handleNestedChange(type, 'landmark', e.target.value)} disabled={disabled} />
          <CustomFloatingInput label="गली / मोहल्ला" value={sourceData.street} onChange={(e) => handleNestedChange(type, 'street', e.target.value)} disabled={disabled} />
          <CustomFloatingInput label="पिनकोड" value={sourceData.pincode} onChange={(e) => handleNestedChange(type, 'pincode', e.target.value)} disabled={disabled} type="number" />
        </Box>
      </Box>
    );
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              <CustomFloatingInput label="पूरा नाम *" name="full_name" value={formData.full_name} onChange={handleChange} error={!!errors.full_name} helperText={errors.full_name} />
              <CustomFloatingDatePicker label="जन्म तिथि *" name="dob" value={formData.dob} onChange={(e) => { setFormData(p => ({ ...p, dob: e.target.value })); setErrors(p => ({ ...p, dob: "" })); }} error={!!errors.dob} helperText={errors.dob} disableFuture={true} />
              <CustomFloatingSelect label="लिंग *" name="gender" value={formData.gender} onChange={(e) => { setFormData(p => ({ ...p, gender: e.target.value })); setErrors(p => ({ ...p, gender: "" })); }} options={GENDER_OPTIONS} error={!!errors.gender} helperText={errors.gender} />
              <CustomFloatingSelect label="धर्म" name="religion" value={formData.religion} onChange={(e) => { setFormData(p => ({ ...p, religion: e.target.value })); setErrors(p => ({ ...p, religion: "" })); }} options={RELIGION_OPTIONS || []} />
              <CustomFloatingSelect label="जाति" name="caste" value={formData.caste} onChange={(e) => { setFormData(p => ({ ...p, caste: e.target.value, subcaste: "" })); setErrors(p => ({ ...p, caste: "" })); }} options={CASTE_OPTIONS} />
              {formData.caste && (
                <CustomFloatingSelect label="उपजाति" name="subcaste" value={formData.subcaste} onChange={(e) => { setFormData(p => ({ ...p, subcaste: e.target.value })); setErrors(p => ({ ...p, subcaste: "" })); }} options={getSubcasteOptions(formData.caste)} />
              )}
              <CustomFloatingCountrySelect label="राष्ट्रीयता" name="nationality" value={formData.nationality} onChange={(e) => { setFormData(p => ({ ...p, nationality: e.target.value })); setErrors(p => ({ ...p, nationality: "" })); }} returnNationality={true} />
              <CustomFloatingSelect label="भाषा" name="language" value={formData.language} onChange={(e) => { setFormData(p => ({ ...p, language: e.target.value })); setErrors(p => ({ ...p, language: "" })); }} options={sortedLanguages} />
            </Box>

            <CustomFloatingInput label="बायो" name="bio" multiline rows={4} value={formData.bio} onChange={handleChange} />


          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box>
              {renderAddressBlock('permanentAddress', 'स्थायी पता')}

              <Box sx={{ mt: 3, mb: 3 }}>
                <Divider />
              </Box>

              {renderAddressBlock(
                'correspondenceAddress',
                'पत्राचार पता',
                formData.sameAsPermanent,
                <CustomCheckbox
                  size={20}
                  checked={formData.sameAsPermanent}
                  onChange={(e) => setFormData(p => ({ ...p, sameAsPermanent: e.target.checked }))}
                  label={<Typography variant="body2" sx={{ fontWeight: 600 }}>स्थायी पते के समान</Typography>}
                />
              )}
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {formData.academicRecords.map((record, index) => (
              <Box key={index} sx={{ p: 3, border: themeBorderSx, borderRadius: 2, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>योग्यता {index + 1}</Typography>
                  {formData.academicRecords.length > 1 && (
                    <IconButton onClick={() => removeAcademicRecord(index)} color="error" size="small">
                      <DeleteOutlineIcon />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
                  <CustomFloatingInput label="योग्यता / डिग्री *" value={record.qualification} onChange={(e) => handleAcademicChange(index, 'qualification', e.target.value)} />
                  <CustomFloatingSearchableSelect
                    label="बोर्ड / विश्वविद्यालय *"
                    options={ALL_BOARDS_AND_UNIVERSITIES}
                    value={record.boardUniversity}
                    onChange={(e) => handleAcademicChange(index, 'boardUniversity', e.target.value)}
                    freeSolo={true}
                  />
                  <CustomFloatingInput type="number" label="उत्तीर्ण वर्ष *" value={record.passingYear} onChange={(e) => handleAcademicChange(index, 'passingYear', e.target.value)} />
                  <CustomFloatingInput type="number" label="प्राप्तांक (Score) *" value={record.score} onChange={(e) => handleAcademicChange(index, 'score', e.target.value)} />
                  <CustomFloatingSelect
                    label="पूर्णांक *"
                    value={record.maxScore}
                    onChange={(e) => handleAcademicChange(index, 'maxScore', e.target.value)}
                    options={[
                      { value: '10', label: '10' },
                      { value: '100', label: '100' },
                      { value: '4', label: '4.0' }
                    ]}
                  />
                  <CustomFloatingDocumentUpload 
                    label="दस्तावेज़" 
                    accept=".pdf,.png,.jpg,.jpeg" 
                    savedValue={record.document_url}
                    onChange={(e) => handleAcademicChange(index, 'doc_file', e.target.files[0])}
                    onUploadComplete={(jobId) => handleAcademicChange(index, 'document_url', jobId)}
                  />
                </Box>

                {/* Achievements */}
                {record.achievements && record.achievements.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--color-slate-500)' }}>उपलब्धियां</Typography>
                    {record.achievements.map((ach, achIndex) => (
                      <Box key={achIndex} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, p: 2.5, border: themeBorderSx, borderRadius: 2, position: 'relative' }}>
                        <IconButton onClick={() => removeAchievement(index, achIndex)} sx={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--color-error)' }} size="small">
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ gridColumn: { sm: 'span 2' }, fontWeight: 700, color: 'var(--color-slate-500)' }}>
                          उपलब्धि {achIndex + 1}
                        </Typography>

                        <CustomFloatingSelect label="उपलब्धि का प्रकार" value={ach.type} onChange={(e) => handleAchievementChange(index, achIndex, 'type', e.target.value)} options={ACHIEVEMENT_TYPE_OPTIONS} />
                        <CustomFloatingInput label={`${ach.type || 'उपलब्धि'} का विवरण`} value={ach.details} onChange={(e) => handleAchievementChange(index, achIndex, 'details', e.target.value)} />
                        <CustomFloatingInput label="मान्यता प्राप्त" value={ach.recognizedBy || ''} onChange={(e) => handleAchievementChange(index, achIndex, 'recognizedBy', e.target.value)} />
                        <CustomFloatingDocumentUpload 
                          label="दस्तावेज़" 
                          accept=".pdf,.png,.jpg,.jpeg" 
                          savedValue={ach.document_url}
                          onChange={(e) => handleAchievementChange(index, achIndex, 'doc_file', e.target.files[0])}
                          onUploadComplete={(jobId) => handleAchievementChange(index, achIndex, 'document_url', jobId)}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" onClick={() => addAchievement(index)} size="small" sx={{ textTransform: 'none' }}>
                    + उपलब्धि जोड़ें
                  </Button>
                </Box>
              </Box>
            ))}
            <Button variant="outlined" size="small" onClick={addAcademicRecord} sx={{ alignSelf: 'flex-start', mt: 2, textTransform: 'none' }}>+ योग्यता जोड़ें</Button>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ gridColumn: { xs: '1fr', sm: 'span 2' } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--color-slate-900)" }}>लिंक्स</Typography>
                <Button variant="outlined" size="small" onClick={handleAddSocialLink} sx={{ textTransform: 'none' }}>
                  + लिंक जोड़ें
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {formData.socialLinksArr.map((link, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <CustomFloatingSelect
                        label="प्लेटफ़ॉर्म"
                        value={link.platform}
                        onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                        options={SOCIAL_PLATFORMS.map(p => ({ value: p.name, label: p.name }))}
                        freeSolo
                        error={!!errors[`social_${index}_platform`]}
                      />
                    </Box>
                    <Box sx={{ flex: 2 }}>
                      <CustomFloatingInput
                        label="लिंक"
                        value={link.url}
                        onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                        error={!!errors[`social_${index}_url`]}
                      />
                    </Box>
                    <IconButton onClick={() => handleRemoveSocialLink(index)} color="error" sx={{ mt: 1 }}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <FormLoadingProvider isLoading={loading}>
      <Box
        sx={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          bgcolor: "rgba(255, 255, 255, 0.4)", backdropFilter: "blur(12px)",
          zIndex: 1300, display: "flex", justifyContent: "center", alignItems: "center", p: { xs: 0, sm: 3 },
        }}
      >
        <Paper
          elevation={0}
          component={Motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          sx={{
            display: "flex", flexDirection: "column", width: { xs: "var(--size-full)", sm: "1000px" },
            minHeight: { xs: "var(--size-full)", sm: "auto" }, borderRadius: { xs: 0, sm: "28px" },
            background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.45) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.3) 0, transparent 50%), 
            radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.2) 0, transparent 50%),
            radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.15) 0, transparent 50%),
            #eef2f6
          `,
            border: 'none', overflow: "hidden", maxHeight: "92vh", position: "relative",
          }}
        >
          {/* Header */}
          <Box sx={{ px: { xs: 3, sm: 8 }, pt: { xs: 6, sm: 8 }, pb: 2, width: "var(--size-full)", boxSizing: "border-box", flexShrink: 0 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-slate-900)", letterSpacing: "-0.5px", fontSize: 'var(--font-2xl)' }}>
                  प्रोफ़ाइल अपडेट
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.5, mt: 0.5 }}>
                  अपनी प्रोफ़ाइल की जानकारी अपडेट करें।
                </Typography>
              </Box>
            </Box>

            {/* Stepper Indicator */}
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              {stepLabels.map((s, index) => (
                <Box
                  key={index}
                  sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.75, cursor: "pointer" }}
                  onClick={() => {
                    // Allow navigating back freely, but validate if moving forward
                    if (index < activeStep) {
                      setActiveStep(index);
                    } else if (index > activeStep) {
                      // Only allow moving to next step if current is valid
                      const stepErrors = validateStep(activeStep);
                      if (Object.keys(stepErrors).length === 0) {
                        setActiveStep(index);
                        setErrors({});
                      } else {
                        setErrors(stepErrors);
                      }
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: 4, borderRadius: 'var(--radius-md)',
                      bgcolor: activeStep >= index ? "var(--color-primary)" : "var(--color-slate-200)",
                      transition: "all var(--transition-slow)",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 800, color: activeStep === index ? "var(--color-primary)" : "var(--color-slate-500)", fontSize: "12.5px" }}
                  >
                    {s.hindi}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, px: { xs: 3, sm: 8 }, py: 3, display: 'flex', flexDirection: 'column' }}>
              {renderStepContent(activeStep)}
            </Box>

            {/* Footer */}
            <Box sx={{ px: { xs: 3, sm: 8 }, pt: 3, pb: { xs: 6, sm: 8 }, display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
              <TarangButton variant="outlined" onClick={activeStep === 0 ? onClose : () => setActiveStep(prev => prev - 1)} sx={{ minWidth: { xs: '100px', sm: '130px' } }}>
                {activeStep === 0 ? "रद्द करें" : "पीछे"}
              </TarangButton>
              <TarangButton type="submit" loading={activeStep === 3 ? loading : false} disabled={loading} sx={{ minWidth: { xs: '100px', sm: '130px' } }}>
                {activeStep === 3 ? "सबमिट करें" : "आगे"}
              </TarangButton>
            </Box>
          </form>
        </Paper>
      </Box>
    </FormLoadingProvider>
  );
}
