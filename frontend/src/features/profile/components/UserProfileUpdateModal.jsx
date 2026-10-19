import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box, Typography, IconButton, CircularProgress,
  InputAdornment, Paper, Avatar, Divider, Checkbox, FormControlLabel, Button
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import { BroomIcon } from "../../../components/icons/BroomIcon";
import { CustomTooltip } from "../../../components/common/Tooltip";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import TarangButton from "../../../components/common/TarangButton";
import CustomCheckbox from "../../../components/common/Checkbox";
import { apiClient } from "../../../lib/apiClient";
import AutoSaveIndicator from "../../../components/common/AutoSaveIndicator";
import { CustomFloatingInput, CustomFloatingSelect, CustomFloatingDatePicker, CustomFloatingCountrySelect, CustomFloatingFileInput, CustomFloatingMinIOUpload } from "../../../components/common/FloatingFields";
import { motion as Motion } from "framer-motion";
import useScrollLock from "../../../hooks/useScrollLock";
import { useAccessibility } from "../../../contexts/AccessibilityContext";
import { GENDER_OPTIONS, CASTE_OPTIONS, getSubcasteOptions, ACHIEVEMENT_TYPE_OPTIONS, AREA_TYPE_OPTIONS, RURAL_LOCAL_BODY_OPTIONS, URBAN_LOCAL_BODY_OPTIONS } from "../../../lib/admissionFormOptions";
import { buildSortedLanguages } from "../../../lib/languages";
import { RELIGION_OPTIONS } from "../../../lib/religion";
import { sortLocationsByDistance } from "../../../lib/geoNormalize";
import gazetteer from "../../../data/formatted/gazetteer.json";
import authConfigData from "../../../data/instituteConfig.json";
import { CustomFloatingSearchableSelect } from "../../../components/common/FloatingFields";
import { FormLoadingProvider } from '../../../contexts/FormLoadingContext';
import { useToast } from '../../../contexts/ToastContext';

const themeBorderSx = "var(--border-thin) solid var(--card-border)";

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
  const isSubmitting = React.useRef(false);
  const { userLocation } = useAccessibility();
  const { showToast } = useToast();
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

  const hasInitializedForCurrentSession = useRef(false);

  useEffect(() => {
    if (open) {
      if (profile && !hasInitializedForCurrentSession.current) {
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
        hasInitializedForCurrentSession.current = true;
      }
    } else {
      hasInitializedForCurrentSession.current = false;
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

  const [autoSaveStatus, setAutoSaveStatus] = useState("idle");
  const isInitialLoad = useRef(true);
  const formDataStr = JSON.stringify(formData);

  useEffect(() => {
    if (!isInitialLoad.current && profile?.id) {
      const saveDraftTimeout = setTimeout(async () => {
        setAutoSaveStatus('saving');
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
          setAutoSaveStatus('saved');
        } catch (error) {
          console.error("AutoSave failed:", error);
          setAutoSaveStatus('idle');
        }
      }, 1500);
      return () => clearTimeout(saveDraftTimeout);
    }
  }, [formDataStr, profile?.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialLoad.current = false;
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!formData.full_name) newErrors.full_name = "Required";
      if (!formData.dob) newErrors.dob = "Required";
      if (!formData.gender) newErrors.gender = "Required";
      if (!formData.bio) newErrors.bio = "Required";
    } else if (step === 1) {
      const reqFields = ['country', 'state', 'district', 'pincode', 'houseNoAndName'];
      reqFields.forEach(f => {
        if (!formData.permanentAddress[f]) newErrors[`permanentAddress_${f}`] = "Required";
      });
      
      if (!formData.permanentAddress.areaType) newErrors[`permanentAddress_areaType`] = "Required";
      if (formData.permanentAddress.areaType === 'Rural Areas' || formData.permanentAddress.areaType === 'Urban Areas') {
        if (!formData.permanentAddress.localBodyType) newErrors[`permanentAddress_localBodyType`] = "Required";
        if (!formData.permanentAddress.localBodyName) newErrors[`permanentAddress_localBodyName`] = "Required";
      }

      if (!formData.sameAsPermanent) {
        reqFields.forEach(f => {
          if (!formData.correspondenceAddress[f]) newErrors[`correspondenceAddress_${f}`] = "Required";
        });
        
        if (!formData.correspondenceAddress.areaType) newErrors[`correspondenceAddress_areaType`] = "Required";
        if (formData.correspondenceAddress.areaType === 'Rural Areas' || formData.correspondenceAddress.areaType === 'Urban Areas') {
          if (!formData.correspondenceAddress.localBodyType) newErrors[`correspondenceAddress_localBodyType`] = "Required";
          if (!formData.correspondenceAddress.localBodyName) newErrors[`correspondenceAddress_localBodyName`] = "Required";
        }
      }
    } else if (step === 2) {
      formData.academicRecords.forEach((rec, index) => {
        if (!rec.qualification) newErrors[`academic_${index}_qualification`] = "Required";
        if (!rec.passingYear) newErrors[`academic_${index}_passingYear`] = "Required";
        if (!rec.score) newErrors[`academic_${index}_score`] = "Required";
        if (!rec.maxScore) newErrors[`academic_${index}_maxScore`] = "Required";
        if (!rec.document_url) newErrors[`academic_${index}_document_url`] = "Required";
        
        if (rec.achievements) {
          rec.achievements.forEach((ach, achIndex) => {
            if (!ach.type) newErrors[`academic_${index}_achievement_${achIndex}_type`] = "Required";
            if (!ach.details) newErrors[`academic_${index}_achievement_${achIndex}_details`] = "Required";
            if (!ach.recognizedBy) newErrors[`academic_${index}_achievement_${achIndex}_recognizedBy`] = "Required";
            if (!ach.document_url) newErrors[`academic_${index}_achievement_${achIndex}_document_url`] = "Required";
          });
        }
      });
    } else if (step === 3) {
      formData.socialLinksArr.forEach((link, index) => {
        if (!link.platform) newErrors[`social_${index}_platform`] = "Required";
        if (!link.url) newErrors[`social_${index}_url`] = "Required";
      });
    }
    return newErrors;
  };


  const handleClear = () => {
    // Reset form to blank state
    const blankForm = {
      full_name: "",
      dob: "",
      gender: "",
      religion: "",
      caste: "",
      subcaste: "",
      nationality: "India",
      language: "",
      bio: "",
      permanentAddress: { country: "India", state: "", district: "", areaType: "", localBodyType: "", localBodyName: "", wardSector: "", addressLine: "", pincode: "" },
      correspondenceAddress: { country: "India", state: "", district: "", areaType: "", localBodyType: "", localBodyName: "", wardSector: "", addressLine: "", pincode: "" },
      sameAsPermanent: false,
      academicRecords: [{ qualification: "", boardUniversity: "", passingYear: "", percentageCgpa: "", majorSubjects: "", marksheetUrl: "" }],
      achievements: [{ title: "", description: "", certificateUrl: "" }],
      socialLinksArr: [{ platform: "", url: "" }]
    };
    setFormData(blankForm);
    setErrors({});
  };

  const handleDiscard = () => {
    if (window.confirm("क्या आप बदलाव रद्द करना चाहते हैं?")) {
      onClose();
    }
  };

  const handleNext = () => {
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

    if (activeStep < stepLabels.length - 1) {
      handleNext();
      return;
    }

    let allErrors = {};
    let firstErrorStep = -1;
    for (let i = 0; i < stepLabels.length; i++) {
      const stepErrs = validateStep(i);
      allErrors = { ...allErrors, ...stepErrs };
      if (Object.keys(stepErrs).length > 0 && firstErrorStep === -1) {
        firstErrorStep = i;
      }
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setActiveStep(firstErrorStep);
      return;
    }
    setErrors({});

    if (isSubmitting.current) return;
    isSubmitting.current = true;
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
      showToast("Failed to update profile. Please try again.");
    } finally {
      isSubmitting.current = false;
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

    const sortedCountries = sortLocationsByDistance(gazetteer.Countries, uLat, uLon, 'countries');
    const countryOptions = sortedCountries.map(c => ({ value: c.name, label: c.name, flagUrl: c.flagUrl }));

    const selectedCountryData = gazetteer.Countries.find(c => c.name === sourceData.country);
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
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-900)' }}>
            {title}
          </Typography>
          {headerRight}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5, alignItems: 'flex-start', opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
          <CustomFloatingCountrySelect label="देश" required value={sourceData.country} onChange={(e) => handleNestedChange(type, 'country', e.target.value)} error={!!errors[`${errPrefix}_country`]} disabled={disabled} />
          <CustomFloatingSelect label="राज्य" required value={sourceData.state} onChange={(e) => handleNestedChange(type, 'state', e.target.value)} error={!!errors[`${errPrefix}_state`]} disabled={disabled || stateOptions.length === 0} options={stateOptions} />
          <CustomFloatingSelect label="ज़िला" required value={sourceData.district} onChange={(e) => handleNestedChange(type, 'district', e.target.value)} error={!!errors[`${errPrefix}_district`]} disabled={disabled || districtOptions.length === 0} options={districtOptions} />

          <CustomFloatingSelect
            label="क्षेत्र का प्रकार"
            required
            value={sourceData.areaType}
            onChange={(e) => {
              handleNestedChange(type, 'areaType', e.target.value);
              handleNestedChange(type, 'localBodyType', "");
              handleNestedChange(type, 'localBodyName', "");
            }}
            disabled={disabled}
            options={AREA_TYPE_OPTIONS}
            error={!!errors[`${errPrefix}_areaType`]}
            helperText={errors[`${errPrefix}_areaType`]}
          />

          {sourceData.areaType === 'Rural Areas' && (
            <CustomFloatingSelect
              label="स्थानीय निकाय का प्रकार"
              required
              value={sourceData.localBodyType}
              onChange={(e) => {
                handleNestedChange(type, 'localBodyType', e.target.value);
                handleNestedChange(type, 'localBodyName', "");
              }}
              disabled={disabled}
              options={RURAL_LOCAL_BODY_OPTIONS}
              error={!!errors[`${errPrefix}_localBodyType`]}
              helperText={errors[`${errPrefix}_localBodyType`]}
            />
          )}

          {sourceData.areaType === 'Urban Areas' && (
            <CustomFloatingSelect
              label="स्थानीय निकाय का प्रकार"
              required
              value={sourceData.localBodyType}
              onChange={(e) => {
                handleNestedChange(type, 'localBodyType', e.target.value);
                handleNestedChange(type, 'localBodyName', "");
              }}
              disabled={disabled}
              options={URBAN_LOCAL_BODY_OPTIONS}
              error={!!errors[`${errPrefix}_localBodyType`]}
              helperText={errors[`${errPrefix}_localBodyType`]}
            />
          )}

          {(sourceData.areaType === 'Rural Areas' || sourceData.areaType === 'Urban Areas') && (
            <CustomFloatingInput
              label="स्थानीय निकाय का नाम"
              required
              value={sourceData.localBodyName}
              onChange={(e) => handleNestedChange(type, 'localBodyName', e.target.value)}
              disabled={disabled}
              error={!!errors[`${errPrefix}_localBodyName`]}
              helperText={errors[`${errPrefix}_localBodyName`]}
            />
          )}

          <CustomFloatingInput label="वार्ड या सेक्टर" value={sourceData.wardOrSector} onChange={(e) => handleNestedChange(type, 'wardOrSector', e.target.value)} disabled={disabled} />
          <CustomFloatingInput label="मकान नंबर और नाम" required value={sourceData.houseNoAndName} onChange={(e) => handleNestedChange(type, 'houseNoAndName', e.target.value)} disabled={disabled} error={!!errors[`${errPrefix}_houseNoAndName`]} helperText={errors[`${errPrefix}_houseNoAndName`]} />
          <CustomFloatingInput label="लैंडमार्क" value={sourceData.landmark} onChange={(e) => handleNestedChange(type, 'landmark', e.target.value)} disabled={disabled} />
          <CustomFloatingInput label="गली / मोहल्ला" value={sourceData.street} onChange={(e) => handleNestedChange(type, 'street', e.target.value)} disabled={disabled} />
          <CustomFloatingInput label="पिनकोड" required value={sourceData.pincode} onChange={(e) => handleNestedChange(type, 'pincode', e.target.value)} disabled={disabled} type="number" error={!!errors[`${errPrefix}_pincode`]} helperText={errors[`${errPrefix}_pincode`]} />
        </Box>
      </Box>
    );
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, alignItems: 'flex-start' }}>
              <CustomFloatingInput label="पूरा नाम" required name="full_name" value={formData.full_name} onChange={handleChange} error={!!errors.full_name} helperText={errors.full_name} />
              <CustomFloatingDatePicker label="जन्म तिथि" required name="dob" value={formData.dob} onChange={(e) => { setFormData(p => ({ ...p, dob: e.target.value })); setErrors(p => ({ ...p, dob: "" })); }} error={!!errors.dob} helperText={errors.dob} disableFuture={true} />
              <CustomFloatingSelect label="लिंग" required name="gender" value={formData.gender} onChange={(e) => { setFormData(p => ({ ...p, gender: e.target.value })); setErrors(p => ({ ...p, gender: "" })); }} options={GENDER_OPTIONS} error={!!errors.gender} helperText={errors.gender} />
              <CustomFloatingSelect label="धर्म" name="religion" value={formData.religion} onChange={(e) => { setFormData(p => ({ ...p, religion: e.target.value })); setErrors(p => ({ ...p, religion: "" })); }} options={RELIGION_OPTIONS || []} />
              <CustomFloatingSelect label="जाति" name="caste" value={formData.caste} onChange={(e) => { setFormData(p => ({ ...p, caste: e.target.value, subcaste: "" })); setErrors(p => ({ ...p, caste: "" })); }} options={CASTE_OPTIONS} />
              {getSubcasteOptions(formData.caste).length > 0 && (
                <CustomFloatingSelect label="उपजाति" name="subcaste" value={formData.subcaste} onChange={(e) => { setFormData(p => ({ ...p, subcaste: e.target.value })); setErrors(p => ({ ...p, subcaste: "" })); }} options={getSubcasteOptions(formData.caste)} />
              )}
              <CustomFloatingCountrySelect label="राष्ट्रीयता" name="nationality" value={formData.nationality} onChange={(e) => { setFormData(p => ({ ...p, nationality: e.target.value })); setErrors(p => ({ ...p, nationality: "" })); }} returnNationality={true} />
              <CustomFloatingSelect label="भाषा" name="language" value={formData.language} onChange={(e) => { setFormData(p => ({ ...p, language: e.target.value })); setErrors(p => ({ ...p, language: "" })); }} options={sortedLanguages} />
            </Box>

            <CustomFloatingInput label="बायो" name="bio" multiline rows={4} value={formData.bio} onChange={handleChange} required error={!!errors.bio} />


          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {renderAddressBlock('permanentAddress', 'स्थायी पता')}
            <Divider sx={{ my: 2 }} />
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
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {formData.academicRecords.map((record, index) => (
              <Box key={index} sx={{ p: 3, border: themeBorderSx, borderRadius: 2, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>योग्यता {index + 1}</Typography>
                  {formData.academicRecords.length > 1 && (
                    <IconButton onClick={() => removeAcademicRecord(index)} color="error" size="small">
                      <DeleteOutlineIcon />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: 'flex-start' }}>
                  <CustomFloatingInput label="योग्यता / डिग्री" required value={record.qualification} onChange={(e) => handleAcademicChange(index, 'qualification', e.target.value)} />
                  <CustomFloatingSearchableSelect
                    label="बोर्ड / विश्वविद्यालय"
                    required
                    options={ALL_BOARDS_AND_UNIVERSITIES}
                    value={record.boardUniversity}
                    onChange={(e) => handleAcademicChange(index, 'boardUniversity', e.target.value)}
                    freeSolo={true}
                  />
                  <CustomFloatingInput type="number" label="उत्तीर्ण वर्ष" required value={record.passingYear} onChange={(e) => handleAcademicChange(index, 'passingYear', e.target.value)} />
                  <CustomFloatingInput type="number" label="प्राप्तांक (Score)" required value={record.score} onChange={(e) => handleAcademicChange(index, 'score', e.target.value)} />
                  <CustomFloatingSelect
                    label="पूर्णांक"
                    required
                    value={record.maxScore}
                    onChange={(e) => handleAcademicChange(index, 'maxScore', e.target.value)}
                    options={[
                      { value: '10', label: '10' },
                      { value: '100', label: '100' },
                      { value: '4', label: '4.0' }
                    ]}
                  />
                  <CustomFloatingMinIOUpload
                    variant="box"
                    label="दस्तावेज़"
                    profile={profile}
                    required
                    accept=".pdf,.png,.jpg,.jpeg"
                    savedValue={record.document_url}
                    onChange={(e) => handleAcademicChange(index, 'doc_file', e.target.files[0])}
                    onUploadComplete={(jobId) => handleAcademicChange(index, 'document_url', jobId)}
                    error={!!errors[`academic_${index}_document_url`]}
                    helperText={errors[`academic_${index}_document_url`]}
                  />
                </Box>

                {/* Achievements */}
                {record.achievements && record.achievements.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 4 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--color-slate-500)' }}>उपलब्धियां</Typography>
                    {record.achievements.map((ach, achIndex) => (
                      <Box key={achIndex} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: 'flex-start', p: 2.5, border: themeBorderSx, borderRadius: 2, position: 'relative' }}>
                        <IconButton onClick={() => removeAchievement(index, achIndex)} sx={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--color-error)' }} size="small">
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ gridColumn: { sm: 'span 2' }, fontWeight: 700, color: 'var(--color-slate-500)' }}>
                          उपलब्धि {achIndex + 1}
                        </Typography>

                        <CustomFloatingSelect label="उपलब्धि का प्रकार" required value={ach.type} onChange={(e) => handleAchievementChange(index, achIndex, 'type', e.target.value)} options={ACHIEVEMENT_TYPE_OPTIONS} error={!!errors[`academic_${index}_achievement_${achIndex}_type`]} />
                        <CustomFloatingInput label={`${ach.type || 'उपलब्धि'} का विवरण`} required value={ach.details} onChange={(e) => handleAchievementChange(index, achIndex, 'details', e.target.value)} error={!!errors[`academic_${index}_achievement_${achIndex}_details`]} />
                        <CustomFloatingInput label="मान्यता प्राप्त" required value={ach.recognizedBy || ''} onChange={(e) => handleAchievementChange(index, achIndex, 'recognizedBy', e.target.value)} error={!!errors[`academic_${index}_achievement_${achIndex}_recognizedBy`]} />
                        <CustomFloatingMinIOUpload
                          variant="box"
                          label="दस्तावेज़"
                          profile={profile}
                          required
                          savedValue={ach.document_url}
                          onChange={(e) => handleAchievementChange(index, achIndex, 'doc_file', e.target.files[0])}
                          onUploadComplete={(jobId) => handleAchievementChange(index, achIndex, 'document_url', jobId)}
                          error={!!errors[`academic_${index}_achievement_${achIndex}_document_url`]}
                          helperText={errors[`academic_${index}_achievement_${achIndex}_document_url`]}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => addAchievement(index)} 
                    size="small" 
                    sx={{ 
                      alignSelf: 'flex-start',
                      textTransform: 'none',
                      color: "var(--color-primary)",
                      fontWeight: 'var(--font-bold)',
                      borderColor: "var(--color-primary)",
                      borderRadius: 'var(--radius-sm)',
                      "&:hover": {
                        borderColor: "var(--color-primary-hover)",
                        bgcolor: "rgba(0,86,179,0.04)",
                      }
                    }}
                  >
                    + उपलब्धि जोड़ें
                  </Button>
                </Box>
              </Box>
            ))}
            <Button 
              variant="outlined" 
              size="small" 
              onClick={addAcademicRecord} 
              sx={{ 
                alignSelf: 'flex-start', 
                mt: 2, 
                textTransform: 'none',
                color: "var(--color-primary)",
                fontWeight: 'var(--font-bold)',
                borderColor: "var(--color-primary)",
                borderRadius: 'var(--radius-sm)',
                "&:hover": {
                  borderColor: "var(--color-primary-hover)",
                  bgcolor: "rgba(0,86,179,0.04)",
                }
              }}
            >
              + योग्यता जोड़ें
            </Button>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ gridColumn: { xs: '1fr', sm: 'span 2' } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
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
                        required
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
                        required
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
          <Box sx={{ position: "absolute", top: { xs: 16, sm: 24 }, right: { xs: 16, sm: 24 }, zIndex: 10, display: "flex", gap: 1 }}>
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
              
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AutoSaveIndicator status={autoSaveStatus} />
              </Box>
            </Box>

            {/* Stepper Indicator */}
            <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
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

          <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, px: { xs: 3, sm: 8 }, pt: activeStep === 1 ? 0.5 : 2, pb: 3, display: 'flex', flexDirection: 'column' }}>
              {renderStepContent(activeStep)}
            </Box>

            {/* Footer */}
            <Box sx={{ px: { xs: 3, sm: 8 }, pt: 3, pb: { xs: 6, sm: 8 }, display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "flex-end", alignItems: { xs: "stretch", sm: "center" }, gap: { xs: 1.5, sm: 2 }, flexShrink: 0 }}>
              <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 }, flexWrap: { xs: "wrap", sm: "nowrap" }, width: { xs: "var(--size-full)", sm: "auto" } }}>
                {activeStep > 0 && (
                  <TarangButton variant="outlined" onClick={() => setActiveStep(prev => prev - 1)} sx={{ flex: { xs: 1, sm: "initial" }, minWidth: { sm: "120px" } }}>
                    पीछे
                  </TarangButton>
                )}
                <TarangButton type="submit" loading={activeStep === stepLabels.length - 1 ? loading : false} disabled={loading} sx={{ flex: { xs: 1, sm: "initial" }, minWidth: { sm: "140px" } }}>
                  {activeStep === stepLabels.length - 1 ? "अपडेट करें" : "आगे"}
                </TarangButton>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </FormLoadingProvider>
  );
}
