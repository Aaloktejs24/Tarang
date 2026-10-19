"use client";
import React, { useState } from 'react';
import { FieldContext } from '../../../../../../contexts/FieldContext';

import { apiClient } from '../../../../../../lib/apiClient';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import { Box, Typography, Container, Paper, Button, Grid, Stepper, Step, StepLabel, Divider, Tooltip, Skeleton, Card, CardContent, TextField, MenuItem, Select, InputLabel, FormControl, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Backdrop, Alert } from '@mui/material';
import CustomCheckbox from '../../../../../../components/common/CustomCheckbox';
import { useParams, useSearchParams } from 'next/navigation';
import { useAppRouter as useRouter } from '../../../../../../hooks/useAppRouter';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useAccessibility } from '../../../../../../contexts/AccessibilityContext';
import gazeteer from '../../../../../../data/formated/gazeteer.json';
import { sortLocationsByDistance } from '../../../../../../lib/geoNormalize';
import { buildSortedLanguages } from '../../../../../../lib/languages';
import { getAcronym, formatBreadcrumbName } from '../../../../../../utils/stringUtils';
import EmptyState from '../../../../../../components/ui/EmptyState';
import { useProfile } from '../../../../../../hooks/useProfile';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { RELIGION_OPTIONS } from '../../../../../../lib/religion';
import { RACE_ETHNICITY_OPTIONS } from '../../../../../../lib/raceEthnicity';
import { RELATION_OPTIONS } from '../../../../../../lib/relation';
import formOptions from '../../../../../../data/formated/formOptions.json';
import relationData from '../../../../../../data/formated/relation.json';
import {
  GENDER_OPTIONS,
  CASTE_OPTIONS,
  getSubcasteOptions,
  ACHIEVEMENT_TYPE_OPTIONS,
  ID_DOCUMENT_OPTIONS,
  GUARDIAN_RELATION_OPTIONS,
  YES_NO_OPTIONS,
  AREA_TYPE_OPTIONS,
  RURAL_LOCAL_BODY_OPTIONS,
  URBAN_LOCAL_BODY_OPTIONS
} from '../../../../../../lib/admissionFormOptions';

import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import EventSeatOutlinedIcon from '@mui/icons-material/EventSeatOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ApplicationSkeleton from '../../../../../../features/admission/ApplicationSkeleton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { FieldCommentTooltip } from '../../../../../../components/common/FieldCommentTooltip';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { useBreadcrumbs } from "../../../../../../contexts/BreadcrumbContext";
import { getApplicationHistory, updateApplicationProgress, getUserApplications, applyForProgram } from '../../../../../../features/admission/admissionService';
import { useAutoSave } from '../../../../../../features/admission/useAutoSave';

import { CustomTooltip } from '../../../../../../components/common/CustomTooltip';

import { CustomFloatingInput, CustomFloatingSelect, CustomFloatingPhoneInput, CustomFloatingDatePicker, CustomFloatingCountrySelect, CustomFloatingFileInput } from '../../../../../../components/common/CustomFloatingFields';

const maskEmail = (email) => {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 2) return `***@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
};

const maskPhone = (phone) => {
  if (!phone) return '';
  const str = String(phone);
  if (str.length <= 4) return str;
  return `${str.slice(0, 2)}${'*'.repeat(Math.max(3, str.length - 5))}${str.slice(-3)}`;
};

export default function AdmissionProgramPage() {
  const router = useRouter();
  const { username, programId } = useParams();
  const { userLocation, language } = useAccessibility();
  const languageOptions = React.useMemo(() => buildSortedLanguages(userLocation), [userLocation]);
  const { profile } = useProfile();
  const cardsRef = React.useRef(null);


  const [instituteProfile, setInstituteProfile] = useState(null);
  const [loadingInstitute, setLoadingInstitute] = useState(true);

  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpTarget, setOtpTarget] = useState(null); // 'email' | 'phone' | null
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const searchParams = useSearchParams();
  const [appId, setAppId] = useState(searchParams.get('appId'));
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [application, setApplication] = useState(null);
  const [loadingApp, setLoadingApp] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [savingProgress, setSavingProgress] = useState(false);

  const [basicDetails, setBasicDetails] = useState({
    dob: '',
    phone: '',
    fullName: '',
    email: '',
    countryCode: '+91',
    gender: '',
    caste: '',
    subcaste: '',
    birthReligion: '',
    currentReligion: '',
    raceEthnicity: '',
    language: '',
    nationality: '',
    nameProof: null,
    dobProof: null,
    genderProof: null,
    casteProof: null,
    nationalityProof: null,
    fatherName: '',
    fatherContact: '',
    fatherProfession: '',
    fatherIncome: '',
    fatherLocation: '',
    fatherIncomeDoc: null,

    fatherRelationDoc: null,
    motherName: '',
    motherContact: '',
    motherProfession: '',
    motherIncome: '',
    motherLocation: '',
    motherIncomeDoc: null,

    motherRelationDoc: null,
    guardianRelation: '',
    guardianRelationOther: '',
    guardianName: '',
    guardianContact: '',
    guardianProfession: '',
    guardianIncome: '',
    guardianLocation: '',
    guardianIncomeDoc: null,

    guardianRelationDoc: null,
    hasSibling: 'No',
    siblings: [{ name: '', relation: '', profession: '', income: '', location: '', incomeDoc: null, relationDoc: null }],
    academicRecords: [{ qualification: '', passingYear: '', percentageCgpa: '', academicDoc: null, achievements: [] }],
    familyIncome: '',
    incomeDoc: null,
    permanentAddress: { country: '', state: '', district: '', areaType: '', localBodyType: '', localBodyName: '', wardOrSector: '', houseNoAndName: '', landmark: '', street: '', pincode: '' },
    correspondenceAddress: { country: '', state: '', district: '', areaType: '', localBodyType: '', localBodyName: '', wardOrSector: '', houseNoAndName: '', landmark: '', street: '', pincode: '' },
    sameAsPermanent: false,
    permanentAddressProof: null,
    correspondenceAddressProof: null,
    hasCriminalRecord: '',
    criminalRecords: [{ type: '', punishment: '', date: '' }],
    policeVerificationDoc: null
  });
  const [basicDetailsErrors, setBasicDetailsErrors] = useState({});

  const { requestedFields, fieldComments } = React.useMemo(() => {
    let metaSource = application?.metadata;

    // Fallback to the latest UPDATE_REQUESTED transaction if application metadata is stale/missing
    if (transactions && transactions.length > 0) {
      const updateTx = [...transactions].reverse().find(t => t.action_type === 'UPDATE_REQUESTED');
      if (updateTx && updateTx.metadata) {
        metaSource = updateTx.metadata;
      }
    }

    if (!metaSource) return { requestedFields: null, fieldComments: {} };
    try {
      const meta = typeof metaSource === 'string' ? JSON.parse(metaSource) : metaSource;
      return {
        requestedFields: meta.selectedFields || null,
        fieldComments: meta.fieldComments || {}
      };
    } catch (e) {
      return { requestedFields: null, fieldComments: {} };
    }
  }, [application, transactions]);




  const isFieldDisabled = React.useCallback((id) => {
    if (application?.status !== 'rejected') return false;
    if (!requestedFields) return false;
    return !requestedFields[id];
  }, [application?.status, requestedFields]);

  const FieldWrapper = React.useCallback(({ id, children }) => {
    const disabled = isFieldDisabled(id);
    const comment = fieldComments[id];

    if (application?.status !== 'rejected') return children;

    return (
      <Box sx={{
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        position: 'relative',
        width: 'var(--size-full)',
        height: 'var(--size-full)'
      }}>
        {children}
        {!disabled && comment && (
          <Typography variant="caption" sx={{ color: 'var(--color-error)', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'var(--font-medium)' }}>
            <InfoOutlinedIcon sx={{ fontSize: 'var(--font-sm)' }} />
            {comment}
          </Typography>
        )}
      </Box>
    );
  }, [isFieldDisabled, fieldComments, application?.status]);


  const { autoSaveStatus } = useAutoSave({
    appId,
    activeStep,
    basicDetails,
    uploadedDocs,
    profile,
    applicationStatus: application?.status
  });

  React.useEffect(() => {
    const parseIncome = (val) => {
      if (!val) return 0;
      const num = parseInt(val.toString().replace(/\D/g, ''), 10);
      return isNaN(num) ? 0 : num;
    };

    let total = 0;
    if (basicDetails.fatherName) total += parseIncome(basicDetails.fatherIncome);
    if (basicDetails.motherName) total += parseIncome(basicDetails.motherIncome);
    if (basicDetails.guardianName) total += parseIncome(basicDetails.guardianIncome);
    if (basicDetails.hasSibling === 'Yes') {
      basicDetails.siblings.forEach(sib => {
        if (sib.name) total += parseIncome(sib.income);
      });
    }

    const totalStr = total > 0 ? total.toString() : '';
    if (basicDetails.familyIncome !== totalStr) {
      setBasicDetails(prev => ({ ...prev, familyIncome: totalStr }));
    }
  }, [
    basicDetails.fatherName, basicDetails.fatherIncome,
    basicDetails.motherName, basicDetails.motherIncome,
    basicDetails.guardianName, basicDetails.guardianIncome,
    basicDetails.hasSibling, basicDetails.siblings,
    basicDetails.familyIncome
  ]);

  React.useEffect(() => {
    if (programs.length > 0 && programId) {
      const prog = programs.find(p => p.id.toString() === programId.toString());
      if (prog) {
        setSelectedProgram(prog);

        const documentStage = prog.stages?.find(s => s.type === 'document');
        // API returns snake_case; fall back to camelCase for local state
        const arcConfig = documentStage?.academic_records_config ?? documentStage?.academicRecordsConfig;
        if (documentStage && arcConfig && arcConfig.length > 0) {
          setBasicDetails(prev => {
            const isDefault = prev.academicRecords.length === 1 && prev.academicRecords[0].qualification === '' && !prev.academicRecords[0].passingYear;
            if (isDefault) {
              const newRecords = arcConfig.map(config => ({
                qualification: typeof config === 'string' ? config : (config?.name || config?.label || config?.id || ''),
                passingYear: '',
                percentageCgpa: '',
                academicDoc: null,
                achievements: [],
                isRequired: true,
                configFlags: typeof config === 'object' ? config : null
              }));
              return { ...prev, academicRecords: newRecords };
            }
            return prev;
          });
        }
      }
    }
  }, [programs, programId]);

  const selectedCountry = gazeteer.Countries.find(c =>
    (c.nationality || c.name) === basicDetails.nationality || c.name === basicDetails.nationality
  );
  const currencySymbol = selectedCountry?.currencySymbol || '₹';

  const enabledLabels = React.useMemo(() => {
    if (application?.status !== 'rejected') return null;
    if (!requestedFields) return [];

    const getExactFormLabels = (key) => {
      if (key.startsWith('sibling_')) return ["Sibling's Name", 'Age', 'Relation', 'Institute / Company', `Income (${currencySymbol})`, "Sibling's Income Proof"];
      if (key.startsWith('academic_')) return ['Qualification', 'Passing Year', 'Percentage / CGPA', 'Qualification Document'];
      if (key.startsWith('criminal_')) return ['Offense Type', 'Status', 'Year', 'Document Proof'];

      const parts = key.split('_');
      if (parts[0] === 'parents') {
        const parent = parts[1];
        const suffix = parts.slice(2).join('_');
        const prefix = parent === 'father' ? "Father's" : parent === 'mother' ? "Mother's" : "Guardian's";
        if (suffix === 'Name') return [`${prefix} Name`, `${prefix} Document Proof`];
        if (suffix === 'Contact') return [`${prefix} Contact Number`];
        if (suffix === 'Profession') return ["Profession"];
        if (suffix === 'Income') return [`Income (${currencySymbol})`, `${prefix} Income Proof`];
        if (suffix === 'Location') return ["Current Location"];
      }

      if (parts[0] === 'personal') {
        const field = parts.slice(1).join('_');
        if (field === 'Date of Birth') return ['Date of Birth', 'Date of Birth Proof'];
        if (field === 'Phone') return ['Phone Number'];
        if (field === 'Gender') return ['Gender', 'Gender Proof'];
        if (field === 'Category') return ['Caste', 'Sub-caste', 'Caste Proof'];
        if (field === 'Religion') return ['Birth Religion', 'Current Religion'];
        if (field === 'Nationality') return ['Nationality', 'Nationality Proof'];
        return [field];
      }

      if (parts[0] === 'other') {
        const field = parts.slice(1).join('_');
        if (field === 'Family Income') return ['Family Income'];
        if (field === 'Has Sibling') return ['Do you have any siblings?'];
        if (field === 'Has Criminal Record') return ['Do you have any past criminal records?'];
        if (field === 'Permanent Address') return ['Country', 'State', 'District', 'Area Type', 'Local Body Type', 'Local Body Name', 'Ward or Sector', 'House No. and Name', 'Landmark', 'Street', 'Pincode / Postal Code', 'Address Proof'];
        if (field === 'Correspondence Address') return ['Country', 'State', 'District', 'Area Type', 'Local Body Type', 'Local Body Name', 'Ward or Sector', 'House No. and Name', 'Landmark', 'Street', 'Pincode / Postal Code', 'Address Proof'];
      }

      if (parts.length > 1) {
        return [parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')];
      }

      return [key];
    };

    const labels = [];
    Object.keys(requestedFields).forEach(key => {
      if (requestedFields[key]) {
        labels.push(...getExactFormLabels(key));
      }
    });
    Object.keys(fieldComments).forEach(key => {
      if (fieldComments[key]) {
        labels.push(...getExactFormLabels(key));
      }
    });
    return [...new Set(labels)];
  }, [application?.status, requestedFields, currencySymbol]);

  const commentsByLabel = React.useMemo(() => {
    if (application?.status !== 'rejected') return {};
    const map = {};

    const getExactFormLabels = (key) => {
      if (key.startsWith('sibling_')) return ["Sibling's Name", 'Age', 'Relation', 'Institute / Company', `Income (${currencySymbol})`, "Sibling's Income Proof"];
      if (key.startsWith('academic_')) return ['Qualification', 'Passing Year', 'Percentage / CGPA', 'Qualification Document'];
      if (key.startsWith('criminal_')) return ['Offense Type', 'Status', 'Year', 'Document Proof'];

      const parts = key.split('_');
      if (parts[0] === 'parents') {
        const parent = parts[1];
        const suffix = parts.slice(2).join('_');
        const prefix = parent === 'father' ? "Father's" : parent === 'mother' ? "Mother's" : "Guardian's";
        if (suffix === 'Name') return [`${prefix} Name`, `${prefix} Document Proof`];
        if (suffix === 'Contact') return [`${prefix} Contact Number`];
        if (suffix === 'Profession') return ["Profession"];
        if (suffix === 'Income') return [`Income (${currencySymbol})`, `${prefix} Income Proof`];
        if (suffix === 'Location') return ["Current Location"];
      }

      if (parts[0] === 'personal') {
        const field = parts.slice(1).join('_');
        if (field === 'Date of Birth') return ['Date of Birth', 'Date of Birth Proof'];
        if (field === 'Phone') return ['Phone Number'];
        if (field === 'Gender') return ['Gender', 'Gender Proof'];
        if (field === 'Category') return ['Caste', 'Sub-caste', 'Caste Proof'];
        if (field === 'Religion') return ['Birth Religion', 'Current Religion'];
        if (field === 'Nationality') return ['Nationality', 'Nationality Proof'];
        return [field];
      }

      if (parts[0] === 'other') {
        const field = parts.slice(1).join('_');
        if (field === 'Family Income') return ['Family Income'];
        if (field === 'Has Sibling') return ['Do you have any siblings?'];
        if (field === 'Has Criminal Record') return ['Do you have any past criminal records?'];
        if (field === 'Permanent Address') return ['Country', 'State', 'District', 'Area Type', 'Local Body Type', 'Local Body Name', 'Ward or Sector', 'House No. and Name', 'Landmark', 'Street', 'Pincode / Postal Code', 'Address Proof'];
        if (field === 'Correspondence Address') return ['Country', 'State', 'District', 'Area Type', 'Local Body Type', 'Local Body Name', 'Ward or Sector', 'House No. and Name', 'Landmark', 'Street', 'Pincode / Postal Code', 'Address Proof'];
      }

      if (parts.length > 1) {
        return [parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')];
      }

      return [key];
    };

    Object.keys(fieldComments).forEach(key => {
      if (fieldComments[key]) {
        const exactLabels = getExactFormLabels(key);
        exactLabels.forEach(l => map[l] = fieldComments[key]);
      }
    });
    return map;
  }, [application?.status, fieldComments, currencySymbol]);

  // Auto-manage breadcrumbs lifecycle for this page
  const rawInstituteName = instituteProfile?.institution_name || instituteProfile?.full_name || instituteProfile?.username || username;
  const breadcrumbInstituteName = formatBreadcrumbName(rawInstituteName);

  useBreadcrumbs([
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home') },
    { labelEn: 'Explore', labelHi: 'खोजें', onClick: () => router.push('/dashboard/explore') },
    { label: breadcrumbInstituteName, onClick: () => router.push(`/dashboard/explore/${username}`) },
    { labelEn: 'Admissions', labelHi: 'प्रवेश', onClick: () => router.push(`/dashboard/explore/${username}/admission`) },
    ...(selectedProgram ? [{ label: getAcronym(selectedProgram.workflowTitle) }] : [])
  ]);

  React.useEffect(() => {
    const fetchProfile = async () => {
      setLoadingInstitute(true);
      try {
        const response = await apiClient.get(`/public/profile/${username}`);
        let apiProfile = response.data;

        const imgUrl = apiProfile.banner_url || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=2500";
        const img = new Image();
        img.src = imgUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });

        setInstituteProfile(apiProfile);
      } catch {
        setInstituteProfile(null);
      } finally {
        setLoadingInstitute(false);
      }
    };
    if (username) fetchProfile();
  }, [username]);

  React.useEffect(() => {
    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      try {
        const progRes = await apiClient.get(`/admissions/institutes/${username}/programs`);
        console.log('[Admission Page] API Response:', progRes.data);
        const data = Array.isArray(progRes.data) ? progRes.data : (progRes.data?.programs || []);
        console.log('[Admission Page] Programs data:', data);

        const mappedPrograms = data.map(p => ({
          id: p.id,
          workflowTitle: p.workflow_title || p.workflowTitle || 'Untitled Program',
          workflowDesc: p.workflow_desc || p.workflowDesc || '',
          lastDate: p.last_date ? new Date(p.last_date).toLocaleDateString() : 'N/A',
          seats: p.seats || 'N/A',
          academicYear: p.academic_year || 'N/A',
          eligibility: p.eligibility || 'N/A',
          fees: p.fees || 'N/A',
          duration: p.duration || 'N/A',
          imageUrl: p.image_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
          stages: typeof p.stages === 'string' ? JSON.parse(p.stages) : (p.stages || [])
        }));

        console.log('[Admission Page] Mapped programs:', mappedPrograms);
        setPrograms(mappedPrograms);
      } catch (err) {
        console.error("[Admission Page] Failed to fetch programs:", err?.response?.status, err?.response?.data, err);
      } finally {
        setLoadingPrograms(false);
      }
    };

    if (username) {
      fetchPrograms();
    }
  }, [username]);

  React.useEffect(() => {
    const fetchAppIdIfMissing = async () => {
      if (appId || !profile?.id || !programId || !instituteProfile?.id) return;
      try {
        const res = await getUserApplications(profile.id);
        const apps = Array.isArray(res?.applications) ? res.applications : (Array.isArray(res) ? res : []);
        const existing = apps.find(a => (a.program_id === programId || a.program?.id === programId) && a.status !== 'withdrawn');
        if (existing) {
          setAppId(existing.id);
          window.history.replaceState({}, '', `/dashboard/explore/${username}/admission/${programId}?appId=${existing.id}`);
        } else {
          // If no application exists, create one so auto-save works!
          const createRes = await applyForProgram(programId, profile.id, instituteProfile.id, { source: 'auto_create_on_form' });
          if (createRes && createRes.application && createRes.application.id) {
            setAppId(createRes.application.id);
            window.history.replaceState({}, '', `/dashboard/explore/${username}/admission/${programId}?appId=${createRes.application.id}`);
          }
        }
      } catch (err) {
        console.error('Failed to find or create existing application for user:', err);
      }
    };
    fetchAppIdIfMissing();
  }, [appId, profile?.id, programId, username, instituteProfile?.id]);

  React.useEffect(() => {
    const fetchApp = async () => {
      if (!appId) return;
      setLoadingApp(true);
      try {
        const data = await getApplicationHistory(appId);
        if (data.application) {
          setApplication(data.application);
          setActiveStep(data.application.current_stage_index || 0);

          if (data.transactions && data.transactions.length > 0) {
            setTransactions(data.transactions);
            const validTx = [...data.transactions].reverse().find(t => t.metadata && (t.action_type === 'AUTO_SAVE' || t.action_type === 'STAGE_SUBMITTED' || t.action_type === 'PROCEED_NEXT_STAGE'));
            if (validTx && validTx.metadata) {
              try {
                const parsedMetadata = JSON.parse(validTx.metadata);
                if (parsedMetadata.uploaded_docs) {
                  setUploadedDocs(parsedMetadata.uploaded_docs);
                }
                if (parsedMetadata.basic_details) {
                  setBasicDetails(prev => ({
                    ...prev,
                    ...parsedMetadata.basic_details
                  }));
                }
              } catch (e) {
                console.error("Failed to parse draft metadata", e);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch application history:', err);
        // If the application doesn't exist (e.g. it was deleted), clear the ID so a new one can be created
        setAppId(null);
        window.history.replaceState({}, '', `/dashboard/explore/${username}/admission/${programId}`);
      } finally {
        setLoadingApp(false);
      }
    };
    fetchApp();
  }, [appId]);

  // Pre-fill phone, name, email from profile if they exist (only once)
  const hasPrefilledProfileInfo = React.useRef(false);
  React.useEffect(() => {
    if (profile && !hasPrefilledProfileInfo.current) {
      setBasicDetails(prev => {
        if (!prev.phone && !prev.fullName && !prev.email) {
          hasPrefilledProfileInfo.current = true;
          return {
            ...prev,
            phone: prev.phone || profile.phone_number || '',
            fullName: prev.fullName || profile.full_name || '',
            email: prev.email || profile.email || ''
          };
        }
        return prev;
      });
    }
  }, [profile]);

  // Program selection is state-only — no URL param persistence so refresh always shows programs list

  const steps = selectedProgram && selectedProgram.stages ? selectedProgram.stages.map(stage => stage.title) : [];

  const handleDiscardApplication = async () => {
    if (!appId) return;
    setIsDiscardDialogOpen(true);
  };

  const executeDiscard = async () => {
    setIsDiscardDialogOpen(false);
    setSavingProgress(true);
    try {
      await updateApplicationProgress(appId, 'WITHDRAWN', { reason: 'User discarded application' }, profile?.id, activeStep, 'withdrawn');
      router.push(`/dashboard/explore/${username}`);
    } catch (err) {
      console.error('Failed to discard application:', err);
      alert("Failed to discard application. Please try again.");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleNext = async () => {
    if (!appId || ['pending_final_review', 'approved', 'enrolled'].includes(application?.status)) {
      if (activeStep < steps.length - 1) setActiveStep(prev => prev + 1);
      return;
    }

    if (activeStep === 0) {
      // Validate basic details
      const errors = {};

      // Personal Info
      if (sf('dob') && !basicDetails.dob) errors.dob = 'Required';
      if (sf('phone') && !basicDetails.phone) errors.phone = 'Required';
      if (sf('gender') && !basicDetails.gender) errors.gender = 'Required';
      if (sf('nationality') && !basicDetails.nationality) errors.nationality = 'Required';
      if (sf('caste') && basicDetails.nationality === 'Indian' && !basicDetails.caste) errors.caste = 'Required';
      if (sf('subcaste') && basicDetails.nationality === 'Indian' && basicDetails.caste && !basicDetails.subcaste) errors.subcaste = 'Required';
      if (sf('birth_religion') && !basicDetails.birthReligion) errors.birthReligion = 'Required';
      if (sf('current_religion') && !basicDetails.currentReligion) errors.currentReligion = 'Required';
      if (sf('race_ethnicity') && !basicDetails.raceEthnicity) errors.raceEthnicity = 'Required';
      if (sf('language') && !basicDetails.language) errors.language = 'Required';

      // Proofs
      if (sf('full_name_proof') && !basicDetails.nameProof) errors.nameProof = 'Required';
      if (sf('dob_proof') && !basicDetails.dobProof) errors.dobProof = 'Required';
      if (sf('gender_proof') && !basicDetails.genderProof) errors.genderProof = 'Required';
      if (sf('caste_proof') && !basicDetails.casteProof) errors.casteProof = 'Required';
      if (sf('nationality_proof') && !basicDetails.nationalityProof) errors.nationalityProof = 'Required';

      // Father Details
      if (sf('father_name') && !basicDetails.fatherName) errors.fatherName = 'Required';
      if (sf('father_contact') && !basicDetails.fatherContact) errors.fatherContact = 'Required';
      if (sf('father_doc_proof') && !basicDetails.fatherRelationDoc) errors.fatherRelationDoc = 'Required';
      if (sf('family_income', 'individual_family_details')) {
        if (!basicDetails.fatherProfession) errors.fatherProfession = 'Required';
        if (!basicDetails.fatherIncome) errors.fatherIncome = 'Required';
        if (!basicDetails.fatherLocation) errors.fatherLocation = 'Required';
        if (!basicDetails.fatherIncomeDoc) errors.fatherIncomeDoc = 'Required';
      }

      // Mother Details
      if (sf('mother_name') && !basicDetails.motherName) errors.motherName = 'Required';
      if (sf('mother_contact') && !basicDetails.motherContact) errors.motherContact = 'Required';
      if (sf('mother_doc_proof') && !basicDetails.motherRelationDoc) errors.motherRelationDoc = 'Required';
      if (sf('family_income', 'individual_family_details')) {
        if (!basicDetails.motherProfession) errors.motherProfession = 'Required';
        if (!basicDetails.motherIncome) errors.motherIncome = 'Required';
        if (!basicDetails.motherLocation) errors.motherLocation = 'Required';
        if (!basicDetails.motherIncomeDoc) errors.motherIncomeDoc = 'Required';
      }

      // Guardian Details
      if (!basicDetails.guardianRelation) errors.guardianRelation = 'Required';
      if (basicDetails.guardianRelation === 'Other') {
        if (!basicDetails.guardianRelationOther) errors.guardianRelationOther = 'Required';
        if (!basicDetails.guardianName) errors.guardianName = 'Required';
        if (!basicDetails.guardianContact) errors.guardianContact = 'Required';
        if (!basicDetails.guardianRelationDoc) errors.guardianRelationDoc = 'Required';
        if (sf('family_income', 'individual_family_details')) {
          if (!basicDetails.guardianProfession) errors.guardianProfession = 'Required';
          if (!basicDetails.guardianIncome) errors.guardianIncome = 'Required';
          if (!basicDetails.guardianLocation) errors.guardianLocation = 'Required';
          if (!basicDetails.guardianIncomeDoc) errors.guardianIncomeDoc = 'Required';
        }
      }

      // Siblings
      if (sf('has_sibling') && !basicDetails.hasSibling) errors.hasSibling = 'Required';
      if (basicDetails.hasSibling === 'Yes') {
        basicDetails.siblings.forEach((sib, index) => {
          if (!sib.name) errors[`sibling_${index}_name`] = 'Required';
          if (!sib.relation) errors[`sibling_${index}_relation`] = 'Required';
          if (!sib.relationDoc) errors[`sibling_${index}_relationDoc`] = 'Required';
          if (sf('family_income', 'individual_family_details')) {
            if (!sib.profession) errors[`sibling_${index}_profession`] = 'Required';
            if (!sib.income) errors[`sibling_${index}_income`] = 'Required';
            if (!sib.location) errors[`sibling_${index}_location`] = 'Required';
            if (!sib.incomeDoc) errors[`sibling_${index}_incomeDoc`] = 'Required';
          }
        });
      }

      // Academic Records
      if (basicDetails.academicRecords && basicDetails.academicRecords.length > 0 && basicDetails.academicRecords[0].qualification !== '') {
        basicDetails.academicRecords.forEach((rec, index) => {
          if (!rec.qualification) errors[`academic_${index}_qualification`] = 'Required';
          if (!rec.passingYear) errors[`academic_${index}_passingYear`] = 'Required';
          if (!rec.percentageCgpa) errors[`academic_${index}_percentageCgpa`] = 'Required';
          if (!rec.academicDoc) errors[`academic_${index}_academicDoc`] = 'Required';
          rec.achievements.forEach((ach, achIndex) => {
            if (!ach.type) errors[`academic_${index}_achievement_${achIndex}_type`] = 'Required';
            if (!ach.details) errors[`academic_${index}_achievement_${achIndex}_details`] = 'Required';
            if (!ach.recognizedBy) errors[`academic_${index}_achievement_${achIndex}_recognizedBy`] = 'Required';
            if (!ach.doc) errors[`academic_${index}_achievement_${achIndex}_doc`] = 'Required';
          });
        });
      }

      if (sf('family_income') && !basicDetails.familyIncome) errors.familyIncome = 'Required';
      if (sf('family_income') && !basicDetails.incomeDoc) errors.incomeDoc = 'Required';

      // Addresses
      if (sf('perm_address', 'perm_country', 'perm_state')) {
        if (sf('perm_address_proof') && !basicDetails.permanentAddressProof) errors.permanentAddressProof = 'Required';
        const requiredAddressFields = ['country', 'state', 'district', 'areaType', 'wardOrSector', 'houseNoAndName', 'landmark', 'pincode'];
        requiredAddressFields.forEach(field => {
          if (!basicDetails.permanentAddress[field]) errors[`permanentAddress_${field}`] = 'Required';
        });
        if (basicDetails.permanentAddress.areaType) {
          if (!basicDetails.permanentAddress.localBodyType) errors[`permanentAddress_localBodyType`] = 'Required';
          if (!basicDetails.permanentAddress.localBodyName) errors[`permanentAddress_localBodyName`] = 'Required';
        }
      }

      if (sf('corr_address', 'corr_country', 'corr_state') && !basicDetails.sameAsPermanent) {
        if (sf('corr_address_proof') && !basicDetails.correspondenceAddressProof) errors.correspondenceAddressProof = 'Required';
        const requiredAddressFields = ['country', 'state', 'district', 'areaType', 'wardOrSector', 'houseNoAndName', 'landmark', 'pincode'];
        requiredAddressFields.forEach(field => {
          if (!basicDetails.correspondenceAddress[field]) errors[`correspondenceAddress_${field}`] = 'Required';
        });
        if (basicDetails.correspondenceAddress.areaType) {
          if (!basicDetails.correspondenceAddress.localBodyType) errors[`correspondenceAddress_localBodyType`] = 'Required';
          if (!basicDetails.correspondenceAddress.localBodyName) errors[`correspondenceAddress_localBodyName`] = 'Required';
        }
      }

      if (sf('criminal_record')) {
        if (!basicDetails.hasCriminalRecord) errors.hasCriminalRecord = 'Required';
        if (basicDetails.hasCriminalRecord === 'Yes') {
          basicDetails.criminalRecords.forEach((record, index) => {
            if (!record.type) errors[`criminalRecord_${index}_type`] = 'Required';
            if (!record.punishment) errors[`criminalRecord_${index}_punishment`] = 'Required';
            if (!record.date) errors[`criminalRecord_${index}_date`] = 'Required';
          });
          if (!basicDetails.policeVerificationDoc) errors.policeVerificationDoc = 'Required';
        }
      }

      if (Object.keys(errors).length > 0) {
        setBasicDetailsErrors(errors);
        return;
      }
      setBasicDetailsErrors({});
    }

    setSavingProgress(true);
    try {
      const isCompleted = activeStep >= steps.length - 1;

      const payloadMetadata = {
        completed_stage: activeStep,
        uploaded_docs: uploadedDocs,
      };

      if (activeStep === 0) {
        let newUploadedDocs = { ...uploadedDocs };

        const uploadFile = async (file) => {
          let mimeType = file.type;
          if (!mimeType) {
            if (file.name.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';
            else if (file.name.toLowerCase().match(/\.jpe?g$/)) mimeType = 'image/jpeg';
            else if (file.name.toLowerCase().endsWith('.png')) mimeType = 'image/png';
          }
          const { data } = await apiClient.get(`/s3/sign`, {
            params: { user_id: profile.id, type: 'document', mime: mimeType }
          });
          await fetch(data.upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
          return data.file_url;
        };

        const processFiles = async (obj, path = '') => {
          if (!obj) return;
          for (const key of Object.keys(obj)) {
            if (obj[key] instanceof File) {
              const url = await uploadFile(obj[key]);
              obj[key] = url;
              let readableName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              newUploadedDocs[`${path ? path + ' - ' : ''}${readableName}`] = url;
            } else if (Array.isArray(obj[key])) {
              obj[key] = [...obj[key]];
              for (let i = 0; i < obj[key].length; i++) {
                if (typeof obj[key][i] === 'object' && obj[key][i] !== null && !(obj[key][i] instanceof File)) {
                  obj[key][i] = { ...obj[key][i] };
                  await processFiles(obj[key][i], `${key} ${i + 1}`);
                }
              }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              obj[key] = { ...obj[key] };
              await processFiles(obj[key], key);
            }
          }
        };

        const basicDetailsClone = { ...basicDetails };
        await processFiles(basicDetailsClone);

        payloadMetadata.uploaded_docs = newUploadedDocs;
        setUploadedDocs(newUploadedDocs);

        payloadMetadata.basic_details = {
          ...basicDetailsClone,
          correspondenceAddress: basicDetailsClone.sameAsPermanent ? basicDetailsClone.permanentAddress : basicDetailsClone.correspondenceAddress,
          fullName: basicDetailsClone.fullName || profile?.full_name || '',
          email: basicDetailsClone.email || profile?.email || '',
          phone: basicDetailsClone.phone
        };
      }

      const res = await updateApplicationProgress(appId, 'STAGE_SUBMITTED', payloadMetadata, profile.id, activeStep, isCompleted ? 'pending_final_review' : 'in_progress');

      if (res.application) {
        setApplication(res.application);
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
      alert("Failed to submit step. Please try again.");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleFileUpload = async (e, reqName) => {
    const file = e.target.files[0];
    if (!file || !profile?.id) return;

    let mimeType = file.type;
    if (!mimeType) {
      if (file.name.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';
      else if (file.name.toLowerCase().match(/\.jpe?g$/)) mimeType = 'image/jpeg';
      else if (file.name.toLowerCase().endsWith('.png')) mimeType = 'image/png';
    }

    setUploadingDoc(reqName);
    try {
      const { data } = await apiClient.get(`/s3/sign`, {
        params: { user_id: profile.id, type: 'document', mime: mimeType }
      });
      await fetch(data.upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });

      setUploadedDocs(prev => ({
        ...prev,
        [reqName]: data.file_url
      }));
    } catch (err) {
      console.error(`Upload failed for ${reqName}:`, err);
      alert("File upload failed.");
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleBasicDetailsChange = (field) => (e) => {
    const value = e.target.value;
    setBasicDetails(prev => ({
      ...prev,
      [field]: value,
      // Reset sub-caste whenever caste changes
      ...(field === 'caste' ? { subcaste: '' } : {}),
    }));
    if (basicDetailsErrors[field]) {
      setBasicDetailsErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddressChange = (type, field) => (e) => {
    setBasicDetails(prev => {
      const newAddress = { ...prev[type], [field]: e.target.value };
      if (field === 'country') {
        newAddress.state = '';
        newAddress.district = '';
      } else if (field === 'state') {
        newAddress.district = '';
      }
      return {
        ...prev,
        [type]: newAddress
      };
    });
    const errorKey = `${type}_${field}`;
    if (basicDetailsErrors[errorKey]) {
      setBasicDetailsErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  // Derive which fields the institute admin enabled for the document stage
  const docStage = selectedProgram?.stages?.find(s => s.type === 'document');
  // Prefer snake_case from API, fall back to camelCase (local state)
  const _rawSelectedFields = docStage?.selected_fields ?? docStage?.selectedFields;
  // If the property is null/undefined (no config yet), default to undefined (show all).
  // If it's an explicit array (even empty), use it as-is so admin's choices are respected.
  const selectedFields = Array.isArray(_rawSelectedFields) ? _rawSelectedFields : undefined;
  // sf(...keys): returns true if any of the given keys is in the admin's selection.
  const sf = (...keys) => selectedFields === undefined || keys.some(k => selectedFields.includes(k));

  const renderAddressBlock = (type, title, disabled = false) => {
    // If sameAsPermanent is true and this is correspondenceAddress, we use permanentAddress values
    const sourceData = (type === 'correspondenceAddress' && basicDetails.sameAsPermanent)
      ? basicDetails.permanentAddress
      : (basicDetails[type] || {});

    const errPrefix = type;

    // Calculate distances based on user location or default to India's center if unavailable
    const uLat = userLocation?.lat || 20.5937;
    const uLon = userLocation?.lon || 78.9629;

    // Derived options from gazeteer
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
      <Box sx={{ mb: 4, opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-700)', mb: 2 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          <CustomFloatingSelect label="Country" value={sourceData.country} onChange={handleAddressChange(type, 'country')} error={!!basicDetailsErrors[`${errPrefix}_country`]} disabled={disabled} options={countryOptions} />
          <CustomFloatingSelect label="State" value={sourceData.state} onChange={handleAddressChange(type, 'state')} error={!!basicDetailsErrors[`${errPrefix}_state`]} disabled={disabled || stateOptions.length === 0} options={stateOptions} />
          <CustomFloatingSelect label="District" value={sourceData.district} onChange={handleAddressChange(type, 'district')} error={!!basicDetailsErrors[`${errPrefix}_district`]} disabled={disabled || districtOptions.length === 0} options={districtOptions} />

          <CustomFloatingSelect
            label="Area Type"
            value={sourceData.areaType}
            onChange={handleAddressChange(type, 'areaType')}
            error={!!basicDetailsErrors[`${errPrefix}_areaType`]}
            disabled={disabled}
            options={AREA_TYPE_OPTIONS}
          />

          {sourceData.areaType === 'Rural Areas' && (
            <CustomFloatingSelect
              label="Local Body Type"
              value={sourceData.localBodyType}
              onChange={handleAddressChange(type, 'localBodyType')}
              error={!!basicDetailsErrors[`${errPrefix}_localBodyType`]}
              disabled={disabled}
              options={RURAL_LOCAL_BODY_OPTIONS}
            />
          )}

          {sourceData.areaType === 'Urban Areas' && (
            <CustomFloatingSelect
              label="Local Body Type"
              value={sourceData.localBodyType}
              onChange={handleAddressChange(type, 'localBodyType')}
              error={!!basicDetailsErrors[`${errPrefix}_localBodyType`]}
              disabled={disabled}
              options={URBAN_LOCAL_BODY_OPTIONS}
            />
          )}

          {(sourceData.areaType === 'Rural Areas' || sourceData.areaType === 'Urban Areas') && (
            <CustomFloatingInput
              label="Local Body Name"
              value={sourceData.localBodyName}
              onChange={handleAddressChange(type, 'localBodyName')}
              error={!!basicDetailsErrors[`${errPrefix}_localBodyName`]}
              disabled={disabled}
            />
          )}

          <CustomFloatingInput label="Ward or Sector" value={sourceData.wardOrSector} onChange={handleAddressChange(type, 'wardOrSector')} error={!!basicDetailsErrors[`${errPrefix}_wardOrSector`]} disabled={disabled} />
          <CustomFloatingInput label="House No. and Name" value={sourceData.houseNoAndName} onChange={handleAddressChange(type, 'houseNoAndName')} error={!!basicDetailsErrors[`${errPrefix}_houseNoAndName`]} disabled={disabled} />
          <CustomFloatingInput label="Landmark" value={sourceData.landmark} onChange={handleAddressChange(type, 'landmark')} disabled={disabled} />
          <CustomFloatingInput label="Street" value={sourceData.street} onChange={handleAddressChange(type, 'street')} error={!!basicDetailsErrors[`${errPrefix}_street`]} disabled={disabled} />
          <CustomFloatingInput label="Pincode / Postal Code" value={sourceData.pincode} onChange={handleAddressChange(type, 'pincode')} error={!!basicDetailsErrors[`${errPrefix}_pincode`]} disabled={disabled} type="number" />

          {/* Address Proof Upload */}
          {!disabled && (type === 'permanentAddress' ? sf('perm_address_proof') : sf('corr_address_proof')) && (
            <Box sx={{ gridColumn: 'auto' }}>
              <CustomFloatingFileInput
                label="Address Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleBasicDetailsFile(`${type}Proof`)}
                error={!!basicDetailsErrors[`${type}Proof`]}
                helperText={basicDetailsErrors[`${type}Proof`]}
              />
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const renderBasicDetailsForm = () => (
    <Box sx={{ width: 'var(--size-full)' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 4 }}>
        Basic Applicant Details
      </Typography>

      {/* Section: Personal Information */}
      {sf('full_name', 'email', 'phone', 'dob', 'gender', 'nationality', 'caste', 'subcaste', 'birth_religion', 'current_religion', 'race_ethnicity', 'language') && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-500)', mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Personal Information
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(12, 1fr)' }, gap: 3, mb: 4, width: 'var(--size-full)' }}>
            {sf('full_name') && <Box sx={{ gridColumn: { md: 'span 6' } }}>
              <CustomFloatingInput
                label="Full Name"
                value={basicDetails.fullName}
                onChange={handleBasicDetailsChange('fullName')}
                error={!!basicDetailsErrors.fullName}
              />
            </Box>}
            {sf('email') && <Box sx={{ gridColumn: { md: 'span 6' }, position: 'relative' }}>
              <CustomFloatingInput
                label="Email"
                value={basicDetails.email}
                onChange={handleBasicDetailsChange('email')}
                error={!!basicDetailsErrors.email}
                InputProps={{
                  endAdornment: (isEmailVerified || !!profile?.email) ? (
                    <Typography sx={{ color: 'var(--color-success)', fontSize: 'var(--font-xs)', fontWeight: 'var(--font-bold)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Verified
                    </Typography>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => { setOtpTarget('email'); setOtp(''); }}
                      sx={{ minWidth: 'unset', px: 1.5, py: 0.5, fontSize: 'var(--font-xs)', fontWeight: 'var(--font-semibold)', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)', bgcolor: 'transparent', textTransform: 'none', '&:hover': { bgcolor: 'transparent' } }}
                    >
                      Verify
                    </Button>
                  )
                }}
              />
              {otpTarget === 'email' && (
                <Box sx={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 'var(--z-sticky)',
                  p: 2.5, bgcolor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)',
                  border: 'var(--border-thin) solid #cbd5e1', borderRadius: 'var(--radius-lg)',
                  display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: 'column'
                }}>
                  <Typography sx={{ fontSize: 'var(--font-xs)', color: 'var(--color-slate-500)', fontWeight: 'var(--font-medium)' }}>
                    Enter OTP sent to <strong>{maskEmail(profile?.email)}</strong>
                  </Typography>
                  <CustomFloatingInput
                    label="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 'var(--size-full)' }}>
                    <Typography sx={{ fontSize: 'var(--font-xs)', color: 'var(--color-slate-500)' }}>
                      {resendTimer > 0 ? (
                        <>Resend in <strong style={{ color: 'var(--color-slate-500)' }}>{resendTimer}s</strong></>
                      ) : (
                        <Button
                          size="small"
                          onClick={handleResendOtp}
                          sx={{ px: 2, py: 0.5, borderRadius: 'var(--radius-md)', color: 'var(--color-primary)', border: 'var(--border-thin) solid #0056b3', textTransform: 'none', fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-xs)', bgcolor: 'transparent', '&:hover': { bgcolor: 'rgba(0,86,179,0.07)' } }}
                        >
                          Resend
                        </Button>
                      )}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Button
                        onClick={() => { setOtpTarget(null); setOtp(''); }}
                        sx={{ height: '38px', px: 2.5, color: 'var(--color-slate-500)', border: 'var(--border-thin) solid #cbd5e1', textTransform: 'none', fontWeight: 'var(--font-medium)', fontSize: 'var(--font-sm)', bgcolor: 'transparent', '&:hover': { bgcolor: 'var(--color-slate-50)', borderColor: 'var(--color-slate-500)' } }}
                      >
                        Cancel
                      </Button>
                      <Button variant="contained" onClick={handleVerifyOtp} disableElevation
                        sx={{ height: '38px', px: 3, bgcolor: 'var(--color-primary)', textTransform: 'none', fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', '&:hover': { bgcolor: 'var(--color-primary-hover)' } }}
                      >
                        Submit
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>}
            {sf('phone') && <Box sx={{ gridColumn: { md: 'span 6' }, position: 'relative' }}>
              <CustomFloatingPhoneInput
                label="Phone Number"
                countryCode={basicDetails.countryCode}
                onCountryCodeChange={(e) => setBasicDetails(prev => ({ ...prev, countryCode: e.target.value }))}
                value={basicDetails.phone}
                onChange={handleBasicDetailsChange('phone')}
                error={!!basicDetailsErrors.phone}
                helperText={basicDetailsErrors.phone}
                endAdornment={(isPhoneVerified || (!!profile?.phone_number && profile?.phone_number === basicDetails.phone)) ? (
                  <Typography sx={{ color: 'var(--color-success)', fontSize: 'var(--font-xs)', fontWeight: 'var(--font-bold)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Verified
                  </Typography>
                ) : (((basicDetails.countryCode || '+91') === '+91' ? ((basicDetails.phone || '').replace(/\D/g, '').length === 10) : ((basicDetails.phone || '').replace(/\D/g, '').length >= 7)) ? (
                  <Button
                    size="small"
                    onClick={() => { setOtpTarget('phone'); setOtp(''); }}
                    sx={{ minWidth: 'unset', px: 1.5, py: 0.5, fontSize: 'var(--font-xs)', fontWeight: 'var(--font-semibold)', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)', bgcolor: 'transparent', textTransform: 'none', '&:hover': { bgcolor: 'transparent' } }}
                  >
                    Verify
                  </Button>
                ) : null)}
              />
              {otpTarget === 'phone' && (
                <Box sx={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 'var(--z-sticky)',
                  p: 2.5, bgcolor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)',
                  border: 'var(--border-thin) solid #cbd5e1', borderRadius: 'var(--radius-lg)',
                  display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: 'column'
                }}>
                  <Typography sx={{ fontSize: 'var(--font-xs)', color: 'var(--color-slate-500)', fontWeight: 'var(--font-medium)' }}>
                    Enter OTP sent to <strong>{basicDetails.countryCode || '+91'} {maskPhone(basicDetails.phone)}</strong>
                  </Typography>
                  <CustomFloatingInput
                    label="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 'var(--size-full)' }}>
                    <Typography sx={{ fontSize: 'var(--font-xs)', color: 'var(--color-slate-500)' }}>
                      {resendTimer > 0 ? (
                        <>Resend in <strong style={{ color: 'var(--color-slate-500)' }}>{resendTimer}s</strong></>
                      ) : (
                        <Button
                          size="small"
                          onClick={handleResendOtp}
                          sx={{ px: 2, py: 0.5, borderRadius: 'var(--radius-md)', color: 'var(--color-primary)', border: 'var(--border-thin) solid #0056b3', textTransform: 'none', fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-xs)', bgcolor: 'transparent', '&:hover': { bgcolor: 'rgba(0,86,179,0.07)' } }}
                        >
                          Resend
                        </Button>
                      )}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Button
                        onClick={() => { setOtpTarget(null); setOtp(''); }}
                        sx={{ height: '38px', px: 2.5, color: 'var(--color-slate-500)', border: 'var(--border-thin) solid #cbd5e1', textTransform: 'none', fontWeight: 'var(--font-medium)', fontSize: 'var(--font-sm)', bgcolor: 'transparent', '&:hover': { bgcolor: 'var(--color-slate-50)', borderColor: 'var(--color-slate-500)' } }}
                      >
                        Cancel
                      </Button>
                      <Button variant="contained" onClick={handleVerifyOtp} disableElevation
                        sx={{ height: '38px', px: 3, bgcolor: 'var(--color-primary)', textTransform: 'none', fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', '&:hover': { bgcolor: 'var(--color-primary-hover)' } }}
                      >
                        Submit
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>}
            {sf('dob') && <Box sx={{ gridColumn: { md: 'span 6' } }}>
              <CustomFloatingDatePicker
                label="Date of Birth"
                value={basicDetails.dob}
                onChange={(e) => setBasicDetails(prev => ({ ...prev, dob: e.target.value }))}
                error={!!basicDetailsErrors.dob}
                helperText={basicDetailsErrors.dob}
                disableFuture={true}
              />
            </Box>}

            {sf('nationality') && <Box sx={{ gridColumn: { md: 'span 4' } }}>
              <CustomFloatingCountrySelect
                label="Nationality"
                value={basicDetails.nationality}
                onChange={handleBasicDetailsChange('nationality')}
                error={!!basicDetailsErrors.nationality}
              />
            </Box>}
            {sf('gender') && <Box sx={{ gridColumn: { md: 'span 4' } }}>
              <CustomFloatingSelect
                label="Gender"
                value={basicDetails.gender}
                onChange={handleBasicDetailsChange('gender')}
                error={!!basicDetailsErrors.gender}
                options={GENDER_OPTIONS}
              />
            </Box>}
            {sf('caste') && basicDetails.nationality === 'Indian' && (
              <Box sx={{ gridColumn: { md: 'span 4' } }}>
                <CustomFloatingSelect
                  label="Caste"
                  value={basicDetails.caste}
                  onChange={handleBasicDetailsChange('caste')}
                  error={!!basicDetailsErrors.caste}
                  options={CASTE_OPTIONS}
                />
              </Box>
            )}
            {sf('subcaste') && basicDetails.nationality === 'Indian' && basicDetails.caste && (
              <Box sx={{ gridColumn: { md: 'span 4' } }}>
                <CustomFloatingSelect
                  label="Sub-caste"
                  value={basicDetails.subcaste}
                  onChange={handleBasicDetailsChange('subcaste')}
                  error={!!basicDetailsErrors.subcaste}
                  options={getSubcasteOptions(
                    basicDetails.caste,
                    basicDetails.permanentAddress?.state,
                    userLocation?.lat || 20.5937,
                    userLocation?.lon || 78.9629
                  )}
                  disabled={!basicDetails.caste}
                />
              </Box>
            )}
            {sf('birth_religion') && <Box sx={{ gridColumn: { md: 'span 4' } }}>
              <CustomFloatingSelect
                label="Birth Religion"
                value={basicDetails.birthReligion}
                onChange={handleBasicDetailsChange('birthReligion')}
                error={!!basicDetailsErrors.birthReligion}
                options={RELIGION_OPTIONS.map(v => ({ value: v, label: v }))}
              />
            </Box>}
            {sf('current_religion') && <Box sx={{ gridColumn: { md: 'span 4' } }}>
              <CustomFloatingSelect
                label="Current Religion"
                value={basicDetails.currentReligion}
                onChange={handleBasicDetailsChange('currentReligion')}
                error={!!basicDetailsErrors.currentReligion}
                options={RELIGION_OPTIONS.map(v => ({ value: v, label: v }))}
              />
            </Box>}
            {sf('race_ethnicity') && <Box sx={{ gridColumn: { md: 'span 4' } }}>
              <CustomFloatingSelect
                label="Race/Ethnicity"
                value={basicDetails.raceEthnicity}
                onChange={handleBasicDetailsChange('raceEthnicity')}
                error={!!basicDetailsErrors.raceEthnicity}
                options={RACE_ETHNICITY_OPTIONS.map(v => ({ value: v, label: v }))}
              />
            </Box>}
            {sf('language') && <Box sx={{ gridColumn: { md: 'span 4' } }}>
              <CustomFloatingSelect
                label="Language"
                value={basicDetails.language}
                onChange={handleBasicDetailsChange('language')}
                error={!!basicDetailsErrors.language}
                options={languageOptions}
              />
            </Box>}
          </Box>

          {/* Section: Identity & Basic Proofs */}
          {sf('full_name_proof', 'dob_proof', 'gender_proof', 'caste_proof', 'nationality_proof') && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4, width: 'var(--size-full)' }}>
              {sf('full_name_proof') && <Box sx={{ gridColumn: 'auto' }}>
                <CustomFloatingFileInput
                  label="Full Name Proof"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleBasicDetailsFile('nameProof')}
                  error={!!basicDetailsErrors.nameProof}
                />
              </Box>}
              {sf('dob_proof') && <Box sx={{ gridColumn: 'auto' }}>
                <CustomFloatingFileInput
                  label="Date of Birth Proof"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleBasicDetailsFile('dobProof')}
                  error={!!basicDetailsErrors.dobProof}
                />
              </Box>}
              {sf('gender_proof') && <Box sx={{ gridColumn: 'auto' }}>
                <CustomFloatingFileInput
                  label="Gender Proof"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleBasicDetailsFile('genderProof')}
                  error={!!basicDetailsErrors.genderProof}
                />
              </Box>}
              {sf('caste_proof') && <Box sx={{ gridColumn: 'auto' }}>
                <CustomFloatingFileInput
                  label="Caste Proof"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleBasicDetailsFile('casteProof')}
                  error={!!basicDetailsErrors.casteProof}
                />
              </Box>}
              {sf('nationality_proof') && <Box sx={{ gridColumn: 'auto' }}>
                <CustomFloatingFileInput
                  label="Nationality Proof"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleBasicDetailsFile('nationalityProof')}
                  error={!!basicDetailsErrors.nationalityProof}
                />
              </Box>}
            </Box>
          )}

        </>
      )}

      {sf('full_name', 'email', 'phone', 'dob', 'gender', 'nationality', 'caste', 'subcaste', 'birth_religion', 'current_religion', 'race_ethnicity', 'language') && basicDetails.academicRecords.length > 0 && (
        <Divider sx={{ mb: 4, opacity: 0.5 }} />
      )}

      {/* Section: Academic Record — always shown when there are academic records configured */}
      <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-500)', mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Academic Record
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
        {basicDetails.academicRecords.map((rec, index) => (
          <Box key={index} sx={{
            display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 3, p: 3, border: 'var(--border-thin) solid #cbd5e1', borderRadius: 'var(--radius-lg)', position: 'relative',
            bgcolor: 'var(--color-slate-50)'
          }}>
            {/* Only show delete button for user-added (non-config) records */}
            {!rec.isRequired && basicDetails.academicRecords.filter(r => !r.isRequired).length > 0 && (
              <IconButton
                onClick={() => removeAcademicRecord(index)}
                sx={{ position: 'absolute', top: 8, right: 8, color: 'var(--color-error)' }}
                size="small"
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            )}
            <Typography variant="subtitle2" sx={{ gridColumn: { sm: 'span 2' }, fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-700)' }}>
              Qualification {index + 1}
            </Typography>

            {/* For config records: qualification field is read-only; for user-added: editable */}
            <CustomFloatingInput
              label="Qualification"
              value={rec.qualification}
              onChange={rec.isRequired ? undefined : handleAcademicChange(index, 'qualification')}
              disabled={rec.isRequired}
              error={!!basicDetailsErrors[`academic_${index}_qualification`]}
            />
            <CustomFloatingInput
              label="Passing Year"
              type="number"
              value={rec.passingYear}
              onChange={handleAcademicChange(index, 'passingYear')}
              error={!!basicDetailsErrors[`academic_${index}_passingYear`]}
            />
            <CustomFloatingInput
              label="Percentage / CGPA"
              value={rec.percentageCgpa}
              onChange={handleAcademicChange(index, 'percentageCgpa')}
              error={!!basicDetailsErrors[`academic_${index}_percentageCgpa`]}
            />
            <Box sx={{ gridColumn: 'auto' }}>
              <CustomFloatingFileInput
                label="Qualification Document"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => handleAcademicFile(index, 'academicDoc', e.target.files[0])}
                error={!!basicDetailsErrors[`academic_${index}_academicDoc`]}
                helperText={basicDetailsErrors[`academic_${index}_academicDoc`]}
              />
            </Box>

            {/* Achievements Section */}
            {rec.achievements && rec.achievements.length > 0 && (
              <Box sx={{ gridColumn: { xs: '1fr', sm: 'span 2' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {rec.achievements.map((ach, achIndex) => (
                  <Box key={achIndex} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, p: 2, border: '1px dashed #cbd5e1', position: 'relative', bgcolor: 'var(--color-white)' }}>
                    <IconButton
                      onClick={() => removeAchievement(index, achIndex)}
                      sx={{ position: 'absolute', top: 4, right: 4, color: 'var(--color-error)' }}
                      size="small"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="subtitle2" sx={{ gridColumn: { sm: 'span 2' }, fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-500)' }}>
                      Achievement {achIndex + 1}
                    </Typography>

                    <CustomFloatingSelect
                      label="Achievement Type"
                      value={ach.type}
                      onChange={handleAchievementChange(index, achIndex, 'type')}
                      error={!!basicDetailsErrors[`academic_${index}_achievement_${achIndex}_type`]}
                      options={ACHIEVEMENT_TYPE_OPTIONS}
                    />
                    <CustomFloatingInput
                      label={`${ach.type || 'Achievement'} Details`}
                      value={ach.details}
                      onChange={handleAchievementChange(index, achIndex, 'details')}
                      error={!!basicDetailsErrors[`academic_${index}_achievement_${achIndex}_details`]}
                    />
                    <CustomFloatingInput
                      label="Recognized By"
                      value={ach.recognizedBy || ''}
                      onChange={handleAchievementChange(index, achIndex, 'recognizedBy')}
                      error={!!basicDetailsErrors[`academic_${index}_achievement_${achIndex}_recognizedBy`]}
                    />
                    <Box sx={{ gridColumn: 'auto' }}>
                      <CustomFloatingFileInput
                        label="Achievement Document"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleAchievementFile(index, achIndex, e.target.files[0])}
                        error={!!basicDetailsErrors[`academic_${index}_achievement_${achIndex}_doc`]}
                        helperText={basicDetailsErrors[`academic_${index}_achievement_${achIndex}_doc`]}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            <Box sx={{ gridColumn: { xs: '1fr', sm: 'span 2' } }}>
              <Button
                variant="outlined"
                onClick={() => addAchievement(index)}
                startIcon={<AddIcon />}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Add Achievement
              </Button>
            </Box>
          </Box>
        ))}
        <Button
          variant="outlined"
          onClick={addAcademicRecord}
          startIcon={<AddIcon />}
          sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
        >
          Add Qualification
        </Button>
      </Box>

      {sf('father_name', 'father_contact', 'mother_name', 'mother_contact', 'has_sibling') && (
        <Divider sx={{ mb: 4, opacity: 0.5 }} />
      )}

      {/* Section: Family Details */}
      {sf('father_name', 'father_contact', 'mother_name', 'mother_contact', 'has_sibling') && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-500)', mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Family Details
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4, width: 'var(--size-full)' }}>
            {sf('father_name') && <CustomFloatingInput
              label="Father&apos;s Name"
              value={basicDetails.fatherName}
              onChange={handleBasicDetailsChange('fatherName')}
              error={!!basicDetailsErrors.fatherName}
            />}
            {sf('father_contact') && <CustomFloatingInput
              label="Father&apos;s Contact Number"
              type="tel"
              value={basicDetails.fatherContact}
              onChange={handleBasicDetailsChange('fatherContact')}
              error={!!basicDetailsErrors.fatherContact}
            />}

            {sf('father_doc_proof') && <Box sx={{ gridColumn: 'auto' }}>
              <CustomFloatingFileInput
                label="Father&apos;s Document Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setBasicDetails(prev => ({ ...prev, fatherRelationDoc: file }));
                  }
                }}
                error={!!basicDetailsErrors.fatherRelationDoc}
              />
            </Box>}

            {sf('mother_name') && <CustomFloatingInput
              label="Mother&apos;s Name"
              value={basicDetails.motherName}
              onChange={handleBasicDetailsChange('motherName')}
              error={!!basicDetailsErrors.motherName}
            />}
            {sf('mother_contact') && <CustomFloatingInput
              label="Mother&apos;s Contact Number"
              type="tel"
              value={basicDetails.motherContact}
              onChange={handleBasicDetailsChange('motherContact')}
              error={!!basicDetailsErrors.motherContact}
            />}

            {sf('mother_doc_proof') && <Box sx={{ gridColumn: 'auto' }}>
              <CustomFloatingFileInput
                label="Mother&apos;s Document Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setBasicDetails(prev => ({ ...prev, motherRelationDoc: file }));
                  }
                }}
                error={!!basicDetailsErrors.motherRelationDoc}
              />
            </Box>}
            <CustomFloatingSelect
              label="Relation with Guardian"
              value={basicDetails.guardianRelation}
              onChange={handleBasicDetailsChange('guardianRelation')}
              error={!!basicDetailsErrors.guardianRelation}
              options={GUARDIAN_RELATION_OPTIONS}
            />
            {basicDetails.guardianRelation === 'Other' && (
              <>
                <CustomFloatingInput
                  label="Specify Relation"
                  value={basicDetails.guardianRelationOther}
                  onChange={handleBasicDetailsChange('guardianRelationOther')}
                  error={!!basicDetailsErrors.guardianRelationOther}
                />
                <CustomFloatingInput
                  label="Guardian&apos;s Name"
                  value={basicDetails.guardianName}
                  onChange={handleBasicDetailsChange('guardianName')}
                  error={!!basicDetailsErrors.guardianName}
                />
                <CustomFloatingInput
                  label="Guardian&apos;s Contact Number"
                  type="tel"
                  value={basicDetails.guardianContact}
                  onChange={handleBasicDetailsChange('guardianContact')}
                  error={!!basicDetailsErrors.guardianContact}
                />

                <Box sx={{ gridColumn: 'auto' }}>
                  <CustomFloatingFileInput
                    label="Guardian&apos;s Document Proof"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setBasicDetails(prev => ({ ...prev, guardianRelationDoc: file }));
                      }
                    }}
                    error={!!basicDetailsErrors.guardianRelationDoc}
                  />
                </Box>
              </>
            )}
            {sf('has_sibling') && <CustomFloatingSelect
              label="Do you have a Sibling?"
              value={basicDetails.hasSibling}
              onChange={handleBasicDetailsChange('hasSibling')}
              options={YES_NO_OPTIONS}
            />}
            {basicDetails.hasSibling === 'Yes' && (
              <Box sx={{ gridColumn: { sm: 'span 3' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {basicDetails.siblings.map((sib, index) => (
                  <Box key={index} sx={{
                    display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: 3, p: 3, border: 'var(--border-thin) solid #cbd5e1', borderRadius: 'var(--radius-lg)', position: 'relative',
                    bgcolor: 'var(--color-slate-50)'
                  }}>
                    {basicDetails.siblings.length > 1 && (
                      <IconButton
                        onClick={() => removeSibling(index)}
                        sx={{ position: 'absolute', top: 8, right: 8, color: 'var(--color-error)' }}
                        size="small"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                    <Typography variant="subtitle2" sx={{ gridColumn: { sm: 'span 3' }, fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-700)' }}>
                      Sibling {index + 1}
                    </Typography>

                    <CustomFloatingInput
                      label="Sibling's Name"
                      value={sib.name}
                      onChange={handleSiblingChange(index, 'name')}
                      error={!!basicDetailsErrors[`sibling_${index}_name`]}
                    />
                    <CustomFloatingSelect
                      label="Relation with Sibling"
                      value={sib.relation}
                      onChange={handleSiblingChange(index, 'relation')}
                      error={!!basicDetailsErrors[`sibling_${index}_relation`]}
                      options={relationData.options.map(v => ({ value: v, label: v }))}
                    />

                    <Box sx={{ gridColumn: 'auto' }}>
                      <CustomFloatingFileInput
                        label="Sibling's Document Proof"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleSiblingFile(index, e.target.files[0])}
                        error={!!basicDetailsErrors[`sibling_${index}_relationDoc`]}
                      />
                    </Box>
                  </Box>
                ))}

                <Button
                  variant="outlined"
                  onClick={addSibling}
                  startIcon={<AddIcon />}
                  sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                >
                  Add Another Sibling
                </Button>
              </Box>
            )}
          </Box>
        </>
      )}

      {sf('family_income', 'individual_family_details') && (
        <Divider sx={{ mb: 4, opacity: 0.5 }} />
      )}

      {/* Section: Family Income */}
      {sf('family_income', 'individual_family_details') && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-500)', mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Family Income & Details
          </Typography>

          {/* Individual Member Incomes */}
          {basicDetails.fatherName && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-700)', mb: 2 }}>
                Father&apos;s Details ({basicDetails.fatherName})
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                <CustomFloatingInput
                  label="Profession"
                  value={basicDetails.fatherProfession}
                  onChange={handleBasicDetailsChange('fatherProfession')}
                  error={!!basicDetailsErrors.fatherProfession}
                />
                <CustomFloatingInput
                  label={`Income (${currencySymbol})`}
                  type="number"
                  value={basicDetails.fatherIncome}
                  onChange={handleBasicDetailsChange('fatherIncome')}
                  error={!!basicDetailsErrors.fatherIncome}
                />
                <CustomFloatingInput
                  label="Current Location"
                  value={basicDetails.fatherLocation}
                  onChange={handleBasicDetailsChange('fatherLocation')}
                  error={!!basicDetailsErrors.fatherLocation}
                />
                <Box sx={{ gridColumn: 'auto' }}>
                  <CustomFloatingFileInput
                    label="Father&apos;s Income Proof"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleBasicDetailsFile('fatherIncomeDoc')}
                    error={!!basicDetailsErrors.fatherIncomeDoc}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {basicDetails.motherName && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-700)', mb: 2 }}>
                Mother&apos;s Details ({basicDetails.motherName})
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                <CustomFloatingInput
                  label="Profession"
                  value={basicDetails.motherProfession}
                  onChange={handleBasicDetailsChange('motherProfession')}
                  error={!!basicDetailsErrors.motherProfession}
                />
                <CustomFloatingInput
                  label={`Income (${currencySymbol})`}
                  type="number"
                  value={basicDetails.motherIncome}
                  onChange={handleBasicDetailsChange('motherIncome')}
                  error={!!basicDetailsErrors.motherIncome}
                />
                <CustomFloatingInput
                  label="Current Location"
                  value={basicDetails.motherLocation}
                  onChange={handleBasicDetailsChange('motherLocation')}
                  error={!!basicDetailsErrors.motherLocation}
                />
                <Box sx={{ gridColumn: 'auto' }}>
                  <CustomFloatingFileInput
                    label="Mother&apos;s Income Proof"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleBasicDetailsFile('motherIncomeDoc')}
                    error={!!basicDetailsErrors.motherIncomeDoc}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {basicDetails.guardianName && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-700)', mb: 2 }}>
                Guardian&apos;s Details ({basicDetails.guardianName})
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                <CustomFloatingInput
                  label="Profession"
                  value={basicDetails.guardianProfession}
                  onChange={handleBasicDetailsChange('guardianProfession')}
                  error={!!basicDetailsErrors.guardianProfession}
                />
                <CustomFloatingInput
                  label={`Income (${currencySymbol})`}
                  type="number"
                  value={basicDetails.guardianIncome}
                  onChange={handleBasicDetailsChange('guardianIncome')}
                  error={!!basicDetailsErrors.guardianIncome}
                />
                <CustomFloatingInput
                  label="Current Location"
                  value={basicDetails.guardianLocation}
                  onChange={handleBasicDetailsChange('guardianLocation')}
                  error={!!basicDetailsErrors.guardianLocation}
                />
                <Box sx={{ gridColumn: 'auto' }}>
                  <CustomFloatingFileInput
                    label="Guardian&apos;s Income Proof"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleBasicDetailsFile('guardianIncomeDoc')}
                    error={!!basicDetailsErrors.guardianIncomeDoc}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {basicDetails.hasSibling === 'Yes' && basicDetails.siblings.map((sib, index) => (
            sib.name && (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-700)', mb: 2 }}>
                  Sibling {index + 1}&apos;s Details ({sib.name})
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                  <CustomFloatingInput
                    label="Profession"
                    value={sib.profession}
                    onChange={handleSiblingChange(index, 'profession')}
                    error={!!basicDetailsErrors[`sibling_${index}_profession`]}
                  />
                  <CustomFloatingInput
                    label={`Income (${currencySymbol})`}
                    type="number"
                    value={sib.income}
                    onChange={handleSiblingChange(index, 'income')}
                    error={!!basicDetailsErrors[`sibling_${index}_income`]}
                  />
                  <CustomFloatingInput
                    label="Current Location"
                    value={sib.location}
                    onChange={handleSiblingChange(index, 'location')}
                    error={!!basicDetailsErrors[`sibling_${index}_location`]}
                  />
                  <Box sx={{ gridColumn: 'auto' }}>
                    <CustomFloatingFileInput
                      label="Sibling's Income Proof"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => handleSiblingFile(index, e.target.files[0], 'incomeDoc')}
                      error={!!basicDetailsErrors[`sibling_${index}_incomeDoc`]}
                    />
                  </Box>
                </Box>
              </Box>
            )
          ))}

          <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-700)', mb: 2, mt: 4 }}>
            Overall Family Income
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, mb: 4, width: 'var(--size-full)' }}>
            <CustomFloatingInput
              label="Annual Family Income (Auto-calculated)"
              disabled={true}
              value={basicDetails.familyIncome}
              error={!!basicDetailsErrors.familyIncome}
            />
            <Box sx={{ gridColumn: 'auto' }}>
              <CustomFloatingFileInput
                label="Family Income Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleBasicDetailsFile('incomeDoc')}
                error={!!basicDetailsErrors.incomeDoc}
              />
            </Box>
          </Box>
        </>
      )}

      {sf('perm_country', 'perm_state', 'perm_district', 'perm_area_type', 'perm_ward', 'perm_house', 'perm_landmark', 'perm_street', 'perm_pincode', 'perm_address', 'corr_country', 'corr_state', 'corr_district', 'corr_area_type', 'corr_ward', 'corr_house', 'corr_landmark', 'corr_street', 'corr_pincode', 'corr_address') && (
        <Divider sx={{ mb: 4, opacity: 0.5 }} />
      )}

      {/* Section: Contact Address */}
      {sf('perm_country', 'perm_state', 'perm_district', 'perm_area_type', 'perm_ward', 'perm_house', 'perm_landmark', 'perm_street', 'perm_pincode', 'perm_address', 'corr_country', 'corr_state', 'corr_district', 'corr_area_type', 'corr_ward', 'corr_house', 'corr_landmark', 'corr_street', 'corr_pincode', 'corr_address') && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-500)', mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Contact Address
          </Typography>
          <Box sx={{ mb: 2, ml: 1 }}>
            <CustomCheckbox
              checked={basicDetails.sameAsPermanent}
              onChange={(e) => {
                setBasicDetails(prev => ({ ...prev, sameAsPermanent: e.target.checked }));
                if (e.target.checked && basicDetailsErrors.correspondenceAddress) {
                  setBasicDetailsErrors(prev => ({ ...prev, correspondenceAddress: undefined }));
                }
              }}
              label={<Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>Correspondence Address is same as Permanent Address</Typography>}
            />
          </Box>
          {renderAddressBlock('permanentAddress', 'Permanent Address', false)}
          {renderAddressBlock('correspondenceAddress', 'Correspondence Address', basicDetails.sameAsPermanent)}
        </>
      )}
      {sf('criminal_record') && (
        <Divider sx={{ mb: 4, opacity: 0.5 }} />
      )}

      {/* Section: Criminal and Character Record */}
      {sf('criminal_record') && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-500)', mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Criminal and Character Record
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
            <CustomFloatingSelect
              label="Any criminal record"
              value={basicDetails.hasCriminalRecord}
              onChange={handleBasicDetailsChange('hasCriminalRecord')}
              options={[
                { value: 'Yes', label: 'Yes' },
                { value: 'No', label: 'No' }
              ]}
              error={!!basicDetailsErrors.hasCriminalRecord}
            />

            <CustomFloatingFileInput
              label="Police Verification Proof"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleBasicDetailsFile('policeVerificationDoc')}
              error={!!basicDetailsErrors.policeVerificationDoc}
            />
          </Box>

          {basicDetails.hasCriminalRecord === 'Yes' && (
            <Box sx={{ mb: 4 }}>
              {basicDetails.criminalRecords.map((record, index) => (
                <Box key={index} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 2, position: 'relative' }}>
                  <CustomFloatingInput
                    label="Type of Offence"
                    value={record.type}
                    onChange={handleCriminalRecordChange(index, 'type')}
                    error={!!basicDetailsErrors[`criminalRecord_${index}_type`]}
                  />
                  <CustomFloatingInput
                    label="Punishment Received"
                    value={record.punishment}
                    onChange={handleCriminalRecordChange(index, 'punishment')}
                    error={!!basicDetailsErrors[`criminalRecord_${index}_punishment`]}
                  />
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <CustomFloatingDatePicker
                        label="Date of Incident"
                        value={record.date}
                        onChange={(e) => handleCriminalRecordDateChange(index, e.target.value)}
                        error={!!basicDetailsErrors[`criminalRecord_${index}_date`]}
                      />
                    </Box>
                    <IconButton onClick={() => removeCriminalRecord(index)} color="error" size="small" sx={{ p: 1 }}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={addCriminalRecord}
                startIcon={<AddIcon />}
                sx={{
                  mt: 1,
                  textTransform: 'none'
                }}
              >
                Add Another Record
              </Button>
            </Box>
          )}
        </>
      )}

      <Dialog
        open={isDiscardDialogOpen}
        onClose={() => setIsDiscardDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 'var(--radius-lg)',
            p: 1,
            maxWidth: 400,
            width: '90%',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
          }
        }}
        BackdropProps={{
          sx: { backdropFilter: 'blur(6px)', backgroundColor: 'rgba(15,23,42,0.4)' }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, fontWeight: 800, color: 'var(--color-slate-900)', fontSize: '1.15rem' }}>
          {language === 'en' ? 'Discard Application?' : 'एप्लीकेशन हटाएँ?'}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Typography sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-base)', lineHeight: 1.6 }}>
            {language === 'en'
              ? 'Are you sure you want to discard this application? This action cannot be undone.'
              : 'क्या आप वाकई इस एप्लीकेशन को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
          <Button
            onClick={() => setIsDiscardDialogOpen(false)}
            variant="outlined"
            sx={{
              fontWeight: 'var(--font-semibold)', textTransform: 'none',
              borderColor: 'var(--color-slate-200)', color: 'var(--color-slate-500)', px: 2.5,
              '&:hover': { borderColor: 'var(--color-slate-500)', bgcolor: 'var(--color-slate-50)' }
            }}
          >
            {language === 'en' ? 'Cancel' : 'रद्द करें'}
          </Button>
          <Button
            onClick={executeDiscard}
            variant="contained"
            disableElevation
            sx={{
              fontWeight: 'var(--font-bold)', textTransform: 'none',
              bgcolor: 'var(--color-error)', color: 'white', px: 2.5,
              '&:hover': { bgcolor: 'var(--color-error)' }
            }}
          >
            {language === 'en' ? 'Discard' : 'हटाएँ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const uploadFileToS3 = async (file, fieldName) => {
    if (!file || !profile?.id) return null;
    let mimeType = file.type;
    if (!mimeType) {
      if (file.name.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';
      else if (file.name.toLowerCase().match(/\.jpe?g$/)) mimeType = 'image/jpeg';
      else if (file.name.toLowerCase().endsWith('.png')) mimeType = 'image/png';
    }
    try {
      setUploadingDoc(fieldName);
      const { data } = await apiClient.get(`/s3/sign`, {
        params: { user_id: profile.id, type: 'document', mime: mimeType }
      });
      await fetch(data.upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });
      return data.file_url;
    } catch (err) {
      console.error(`Upload failed for ${fieldName}:`, err);
      alert("File upload failed.");
      return null;
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleBasicDetailsFile = (field) => async (e) => {
    const file = e.target.files[0];
    const url = await uploadFileToS3(file, field);
    if (url) {
      setBasicDetails(prev => ({ ...prev, [field]: url }));
      setBasicDetailsErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCriminalRecordChange = (index, field) => (e) => {
    const value = e.target.value;
    setBasicDetails(prev => {
      const newRecords = [...prev.criminalRecords];
      newRecords[index] = { ...newRecords[index], [field]: value };
      return { ...prev, criminalRecords: newRecords };
    });
    setBasicDetailsErrors(prev => ({ ...prev, [`criminalRecord_${index}_${field}`]: '' }));
  };

  const handleCriminalRecordDateChange = (index, val) => {
    setBasicDetails(prev => {
      const newRecords = [...prev.criminalRecords];
      newRecords[index] = { ...newRecords[index], date: val };
      return { ...prev, criminalRecords: newRecords };
    });
    setBasicDetailsErrors(prev => ({ ...prev, [`criminalRecord_${index}_date`]: '' }));
  };

  const addCriminalRecord = () => {
    setBasicDetails(prev => ({
      ...prev,
      criminalRecords: [...prev.criminalRecords, { type: '', punishment: '', date: '' }]
    }));
  };

  const removeCriminalRecord = (index) => {
    setBasicDetails(prev => {
      let newRecords = prev.criminalRecords.filter((_, i) => i !== index);
      if (newRecords.length === 0) {
        newRecords = [{ type: '', punishment: '', date: '' }];
      }
      return { ...prev, criminalRecords: newRecords };
    });
  };

  const handleSiblingChange = (index, field) => (e) => {
    const value = e.target.value;
    setBasicDetails(prev => {
      const newSiblings = [...prev.siblings];
      newSiblings[index] = { ...newSiblings[index], [field]: value };
      return { ...prev, siblings: newSiblings };
    });
    setBasicDetailsErrors(prev => ({ ...prev, [`sibling_${index}_${field}`]: '' }));
  };

  const handleSiblingFile = async (index, file, field = 'relationDoc') => {
    const url = await uploadFileToS3(file, `sibling_${index}_${field}`);
    if (url) {
      setBasicDetails(prev => {
        const newSiblings = [...prev.siblings];
        newSiblings[index] = { ...newSiblings[index], [field]: url };
        return { ...prev, siblings: newSiblings };
      });
      setBasicDetailsErrors(prev => ({ ...prev, [`sibling_${index}_${field}`]: '' }));
    }
  };

  const addSibling = () => {
    setBasicDetails(prev => ({
      ...prev,
      siblings: [...prev.siblings, { name: '', relation: '', profession: '', income: '', location: '', incomeDoc: null, relationDoc: null }]
    }));
  };

  const removeSibling = (index) => {
    setBasicDetails(prev => ({
      ...prev,
      siblings: prev.siblings.filter((_, i) => i !== index)
    }));
  };

  const handleAcademicChange = (index, field) => (e) => {
    const value = e.target.value;
    setBasicDetails(prev => {
      const newRecords = [...prev.academicRecords];
      newRecords[index] = { ...newRecords[index], [field]: value };
      return { ...prev, academicRecords: newRecords };
    });
    setBasicDetailsErrors(prev => ({ ...prev, [`academic_${index}_${field}`]: '' }));
  };

  const handleAcademicFile = async (index, field, file) => {
    const url = await uploadFileToS3(file, `academic_${index}_${field}`);
    if (url) {
      setBasicDetails(prev => {
        const newRecords = [...prev.academicRecords];
        newRecords[index] = { ...newRecords[index], [field]: url };
        return { ...prev, academicRecords: newRecords };
      });
      setBasicDetailsErrors(prev => ({ ...prev, [`academic_${index}_${field}`]: '' }));
    }
  };

  const addAcademicRecord = () => {
    setBasicDetails(prev => ({
      ...prev,
      academicRecords: [...prev.academicRecords, { qualification: '', passingYear: '', percentageCgpa: '', academicDoc: null, achievements: [] }]
    }));
  };

  const addAchievement = (academicIndex) => {
    setBasicDetails(prev => {
      const newRecords = [...prev.academicRecords];
      newRecords[academicIndex] = {
        ...newRecords[academicIndex],
        achievements: [
          ...(newRecords[academicIndex].achievements || []),
          { type: '', details: '', recognizedBy: '', doc: null }
        ]
      };
      return { ...prev, academicRecords: newRecords };
    });
  };

  const removeAchievement = (academicIndex, achIndex) => {
    setBasicDetails(prev => {
      const newRecords = [...prev.academicRecords];
      newRecords[academicIndex] = {
        ...newRecords[academicIndex],
        achievements: newRecords[academicIndex].achievements.filter((_, i) => i !== achIndex)
      };
      return { ...prev, academicRecords: newRecords };
    });
  };

  const handleAchievementChange = (academicIndex, achIndex, field) => (e) => {
    const value = e.target.value;
    setBasicDetails(prev => {
      const newRecords = [...prev.academicRecords];
      const academicRecord = { ...newRecords[academicIndex] };
      const newAchievements = [...(academicRecord.achievements || [])];
      newAchievements[achIndex] = { ...newAchievements[achIndex], [field]: value };
      academicRecord.achievements = newAchievements;
      newRecords[academicIndex] = academicRecord;
      return { ...prev, academicRecords: newRecords };
    });
    setBasicDetailsErrors(prev => ({ ...prev, [`academic_${academicIndex}_achievement_${achIndex}_${field}`]: '' }));
  };

  const handleAchievementFile = async (academicIndex, achIndex, file) => {
    const url = await uploadFileToS3(file, `academic_${academicIndex}_achievement_${achIndex}_doc`);
    if (url) {
      setBasicDetails(prev => {
        const newRecords = [...prev.academicRecords];
        const academicRecord = { ...newRecords[academicIndex] };
        const newAchievements = [...(academicRecord.achievements || [])];
        newAchievements[achIndex] = { ...newAchievements[achIndex], doc: url };
        academicRecord.achievements = newAchievements;
        newRecords[academicIndex] = academicRecord;
        return { ...prev, academicRecords: newRecords };
      });
      setBasicDetailsErrors(prev => ({ ...prev, [`academic_${academicIndex}_achievement_${achIndex}_doc`]: '' }));
    }
  };

  const removeAcademicRecord = (index) => {
    setBasicDetails(prev => ({
      ...prev,
      academicRecords: prev.academicRecords.filter((_, i) => i !== index)
    }));
  };

  const handleVerifyOtp = () => {
    if (otp.length > 3) {
      if (otpTarget === 'email') setIsEmailVerified(true);
      if (otpTarget === 'phone') setIsPhoneVerified(true);
      setOtpTarget(null);
      setOtp('');
    } else {
      alert("Please enter a valid OTP.");
    }
  };

  // Start 30s resend countdown whenever OTP panel opens
  React.useEffect(() => {
    if (!otpTarget) return;
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTarget]);

  const handleResendOtp = () => {
    setOtp('');
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    // TODO: call actual resend API here
  };

  const renderStageContent = (stage) => {
    switch (stage.type) {
      case 'document':
        return (
          <Box sx={{ pb: 1, width: 'var(--size-full)' }}>
            <FieldContext.Provider value={{ isRejected: application?.status === 'rejected', enabledLabels, commentsByLabel }}>
              {activeStep === 0 && renderBasicDetailsForm()}
            </FieldContext.Provider>

            {stage.requirements && stage.requirements.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', mb: 0.5 }}>
                  Other Requirement Document
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', mb: 2, fontSize: 'var(--font-sm)' }}>
                  Please upload clear, scanned copies. Max size: 5MB.
                </Typography>
              </>
            )}
            <Box sx={{ p: 0.5 }}>
              <Grid container spacing={2}>
                {(stage.requirements || []).map((req, index) => {
                  const isUploaded = !!uploadedDocs[req];
                  const isUploading = uploadingDoc === req;
                  const comment = commentsByLabel[req];
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                      <Box sx={{
                        position: 'relative',
                        width: 'var(--size-full)',
                        '& .comment-icon': { opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' },
                        '&:hover .comment-icon': { opacity: 1, pointerEvents: 'auto' }
                      }}>
                        <FieldCommentTooltip comment={comment} />
                        <Paper
                          component="label"
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            borderRadius: 'var(--radius-lg)',
                            border: isUploaded ? 'var(--border-thick) solid #10b981' : comment ? '2px dashed #f59e0b' : '2px dashed #cbd5e1',
                            bgcolor: isUploaded ? 'var(--color-slate-50)' : 'var(--color-slate-50)',
                            cursor: 'pointer',
                            transition: 'var(--transition-base)',
                            display: 'block',
                            '&:hover': { borderColor: isUploaded ? 'var(--color-success)' : comment ? 'var(--color-warning)' : 'var(--color-primary)', bgcolor: isUploaded ? 'var(--color-slate-50)' : 'var(--color-slate-50)' }
                          }}
                        >
                          <input
                            type="file"
                            hidden
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload(e, req)}
                          />
                          {isUploading ? (
                            <Box sx={{ mb: 1 }}>null</Box>
                          ) : isUploaded ? (
                            <CheckCircleOutlineIcon sx={{ fontSize: 28, color: 'var(--color-success)', mb: 0.5 }} />
                          ) : (
                            <CloudUploadIcon sx={{ fontSize: 28, color: 'var(--color-primary)', mb: 0.5 }} />
                          )}
                          <Typography sx={{ fontWeight: 'var(--font-semibold)', color: isUploaded ? 'var(--color-success)' : 'var(--color-slate-900)', fontSize: 'var(--font-sm)', mb: 0.25 }}>{req}</Typography>
                          <Typography variant="caption" sx={{ color: isUploaded ? 'var(--color-success)' : 'var(--color-slate-500)', fontSize: 'var(--font-xs)' }}>
                            {isUploaded ? 'Uploaded successfully' : 'Browse or drag & drop'}
                          </Typography>
                        </Paper>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Box>
        );
      case 'quiz': {
        const quizzes = stage.quizzes || (stage.quizAttachment ? [stage.quizAttachment] : []);

        if (quizzes.length === 0) {
          return (
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Box sx={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', mx: 'auto', mb: 1.5 }}>
                <QuizOutlinedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', mb: 0.5 }}>
                No Quizzes Available
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', mb: 3, fontSize: 'var(--font-sm)' }}>
                There are currently no entrance quizzes scheduled for this step.
              </Typography>
            </Box>
          );
        }

        return (
          <Box sx={{ py: 1, width: 'var(--size-full)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', mb: 2 }}>
              Available Quizzes ({quizzes.length})
            </Typography>
            <Grid container spacing={3}>
              {quizzes.map((quiz, idx) => (
                <Grid key={idx} size={{ xs: 12, sm: 6 }}>
                  <Card sx={{
                    borderRadius: 'var(--radius-lg)',
                    border: 'var(--border-thin) solid #cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'var(--size-full)',
                    bgcolor: 'rgba(255, 255, 255, 0.4)'
                  }}>
                    <CardContent sx={{ flexGrow: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5 }}>
                        <Box sx={{ width: 42, height: 42, bgcolor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', mr: 2, flexShrink: 0 }}>
                          <QuizOutlinedIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', lineHeight: 1.3, mb: 0.5 }}>
                            {quiz.name || "Entrance Quiz"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'var(--color-slate-500)', display: 'block' }}>
                            Size: {quiz.size || "Unknown"} • Time: 45 mins
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        fullWidth
                        disableRipple
                        disableElevation
                        sx={{
                          background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%) !important',
                          color: '#ffffff !important',
                          border: 'none',
                          py: 1.2,
                          textTransform: 'none',
                          fontWeight: 'var(--font-semibold)'
                        }}
                      >
                        Start Quiz Now
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      }
      case 'interview':
        return (
          <Box sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)' }}>
                <VideoCameraFrontOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)' }}>
                  Interview Schedule
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-sm)' }}>
                  Awaiting dates from the institute
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', lineHeight: 1.5, fontSize: 'var(--font-sm)' }}>
              Once you complete the previous steps, the institute will review your profile and assign you an interview slot. You will receive an email notification with the meeting link and passcode.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  // If we are still fetching core data (like the institute or the programs list)
  // or fetching the application itself, we show the skeleton layout to avoid flashing.
  if (loadingInstitute || loadingPrograms || loadingApp) {
    return <ApplicationSkeleton />;
  }

  const showEmptyState = !loadingPrograms && programs.length === 0;

  return (
    <>
      <Box sx={{ position: "relative", minHeight: "calc(100vh - 72px)", overflowX: "hidden", bgcolor: "transparent", mt: "-1px" }}>

        {/* ─── MAIN CONTENT CONTAINER ─── */}
        <Container ref={cardsRef} maxWidth="xl" sx={{
          position: "relative",
          zIndex: 1,
          px: { xs: 2, md: 4 },
          pb: showEmptyState || !!selectedProgram ? 0 : 10,
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Box sx={{ width: 'var(--size-full)', display: 'flex', flexDirection: 'column' }}>
            {!selectedProgram ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                {loadingPrograms ? <Typography>Loading program...</Typography> : <Typography>Program not found</Typography>}
              </Box>
            ) : (
              <Paper elevation={0} sx={{
                borderRadius: 'var(--radius-lg)',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'stretch',
                width: 'var(--size-full)',
                height: { xs: 'auto', md: '82vh' },
                maxHeight: { xs: 'none', md: '820px' },
                minHeight: { xs: 'auto', md: '600px' },
                overflow: 'hidden'
              }}>
                {/* Left Sidebar (Progress) */}
                <Box sx={{
                  width: { xs: 'var(--size-full)', md: '350px' },
                  flexShrink: 0,
                  background: 'transparent',
                  border: 'none',
                  p: { xs: 3, md: 5 },
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto'
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 0.5, letterSpacing: '-0.02em' }}>
                    {selectedProgram.workflowTitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', mb: 5, fontSize: 'var(--font-sm)', lineHeight: 1.6 }}>
                    {selectedProgram.workflowDesc}
                  </Typography>

                  <Stepper activeStep={activeStep} orientation="vertical" sx={{
                    mb: 0,
                    '.MuiStepConnector-line': { minHeight: '32px', borderLeftWidth: '2px', borderColor: 'var(--color-slate-200)' },
                    '.MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: 'var(--color-primary)' },
                    '.MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: 'var(--color-primary)' }
                  }}>
                    {steps.map((label, index) => {
                      const stage = selectedProgram.stages[index];
                      const getIcon = () => {
                        if (stage.type === 'document') return <FileUploadOutlinedIcon />;
                        if (stage.type === 'quiz') return <QuizOutlinedIcon />;
                        return <VideoCameraFrontOutlinedIcon />;
                      };

                      return (
                        <Step key={label}>
                          <StepLabel StepIconComponent={() => (
                            <Box sx={{
                              width: 36, height: 36,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: 'var(--radius-full)',
                              bgcolor: activeStep >= index ? 'var(--color-primary)' : 'var(--color-slate-50)',
                              color: activeStep >= index ? 'var(--color-white)' : 'var(--color-slate-500)',
                              transition: 'var(--transition-slow)'
                            }}>
                              {React.cloneElement(getIcon(), { sx: { fontSize: 20 } })}
                            </Box>
                          )}>
                            <Typography sx={{
                              fontWeight: activeStep === index ? 700 : 500,
                              color: activeStep === index ? 'var(--color-slate-900)' : 'var(--color-slate-500)',
                              fontSize: 'var(--font-base)',
                              letterSpacing: '-0.01em'
                            }}>
                              {typeof label === 'string' ? label.replace(/^Stage/i, 'Step') : label}
                            </Typography>
                          </StepLabel>
                        </Step>
                      );
                    })}
                  </Stepper>

                  <Box sx={{ flexGrow: 1 }} />

                  {application?.status !== 'pending_review' && application?.status !== 'pending_final_review' && (
                    <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', gap: 2, width: 'var(--size-full)' }}>
                      <Box sx={{ display: 'flex', gap: 2, width: 'var(--size-full)' }}>
                        <Button
                          variant="outlined"
                          size="large"
                          fullWidth
                          disabled={activeStep === 0 || savingProgress}
                          onClick={handleBack}
                          sx={{
                            borderColor: 'rgba(30, 41, 59, 0.2)',
                            color: 'var(--color-slate-700)',
                            py: 1.2,
                            textTransform: 'none',
                            fontWeight: 'var(--font-semibold)',
                            borderRadius: 'var(--radius-lg)',
                            '&:hover': {
                              borderColor: 'rgba(30, 41, 59, 0.5)',
                              bgcolor: 'rgba(30, 41, 59, 0.04)'
                            }
                          }}
                        >
                          Back
                        </Button>
                        {(!['pending_final_review', 'approved', 'enrolled'].includes(application?.status) || activeStep < steps.length - 1) && (
                          <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={handleNext}
                            disabled={savingProgress || uploadingDoc !== null}
                            disableRipple
                            disableElevation
                            sx={{
                              background: 'linear-gradient(135deg, #0056b3 0%, #004494 100%) !important',
                              color: '#ffffff !important',
                              border: 'none',
                              py: 1.2,
                              textTransform: 'none',
                              fontWeight: 'var(--font-semibold)',
                              borderRadius: 'var(--radius-lg)'
                            }}
                          >
                            {savingProgress ? <CircularProgress size={24} color="inherit" /> :
                              (['pending_final_review', 'approved', 'enrolled'].includes(application?.status) ? 'Next' :
                                (activeStep === steps.length - 1 ? 'Finish' : 'Submit'))}
                          </Button>
                        )}
                      </Box>
                      {appId && (
                        <Button
                          variant="outlined"
                          size="large"
                          fullWidth
                          color="error"
                          onClick={handleDiscardApplication}
                          disabled={savingProgress}
                          sx={{
                            py: 1.2,
                            textTransform: 'none',
                            fontWeight: 'var(--font-semibold)',
                            borderRadius: 'var(--radius-lg)'
                          }}
                        >
                          Discard
                        </Button>
                      )}
                    </Box>
                  )}

                </Box>

                {/* Right Content Area */}
                <Box sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center', // Center inner container
                  py: { xs: 6, md: 8 },
                  px: { xs: 3, md: 8 },
                  background: "rgba(255, 255, 255, 0.3)",
                  backdropFilter: "blur(30px)",
                  WebkitBackdropFilter: "blur(30px)",
                  border: "none",
                  borderRadius: 'var(--radius-lg)',
                  m: { xs: 0, md: 1 }, // Small margin so it floats slightly like Google Drive
                  mr: { xs: 0, md: 2 },
                  position: 'relative' // Added for absolute positioning of save indicator
                }}>
                  {/* Auto-Save Indicator - Standard Top Right Placement */}
                  {appId && activeStep !== steps.length && (
                    <Box sx={{ position: 'absolute', top: { xs: 16, md: 24 }, right: { xs: 16, md: 32 }, display: 'flex', alignItems: 'center', zIndex: 'var(--z-sticky)' }}>
                      {autoSaveStatus === 'waiting' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: 'var(--radius-lg)', bgcolor: 'rgba(245,158,11,0.1)', backdropFilter: 'blur(10px)', border: 'var(--border-thin) solid rgba(245,158,11,0.2)' }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', bgcolor: 'var(--color-warning)' }} />
                          <Typography variant="caption" sx={{ color: 'var(--color-error)', fontWeight: 'var(--font-semibold)' }}>Unsaved changes</Typography>
                        </Box>
                      )}
                      {autoSaveStatus === 'saving' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: 'var(--radius-lg)', bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', border: 'var(--border-thin) solid rgba(0,0,0,0.05)' }}>
                          <CircularProgress size={14} sx={{ color: 'var(--color-slate-500)' }} />
                          <Typography variant="caption" sx={{ color: 'var(--color-slate-500)', fontWeight: 'var(--font-semibold)' }}>Saving...</Typography>
                        </Box>
                      )}
                      {autoSaveStatus === 'saved' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: 'var(--radius-lg)', bgcolor: 'rgba(16, 185, 129, 0.1)', backdropFilter: 'blur(10px)', border: 'var(--border-thin) solid rgba(16, 185, 129, 0.2)' }}>
                          <CloudUploadIcon sx={{ fontSize: 16, color: 'var(--color-success)' }} />
                          <Typography variant="caption" sx={{ color: 'var(--color-success)', fontWeight: 'var(--font-semibold)' }}>Saved to Drafts</Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  <Box sx={{ width: 'var(--size-full)', display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                    {activeStep === steps.length ? (
                      <Box sx={{ textAlign: 'center', py: 5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'var(--color-success)', mb: 2 }} />
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 1, letterSpacing: '-0.02em' }}>
                          Process Completed
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'var(--color-slate-500)', mb: 5, maxWidth: '400px', lineHeight: 1.6 }}>
                          You have successfully completed all the required steps for this admission process. The institute will review your profile.
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => router.push(`/dashboard/explore/${username}`)}
                          disableRipple
                          sx={{
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important',
                            color: '#ffffff !important',
                            px: 4, py: 1.5,
                            textTransform: 'none',
                            fontWeight: 'var(--font-semibold)',
                            transition: 'all 0.2s'
                          }}
                        >
                          Return to Institute
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: { md: 2 } }}>
                          {application?.status === 'rejected' && (
                            <Box sx={{
                              p: 2, mb: 3,
                              background: 'rgba(245, 158, 11, 0.05)',
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)',
                              borderRadius: 'var(--radius-lg)',
                              border: 'var(--border-thin) solid rgba(245, 158, 11, 0.3)'
                            }}>
                              <Typography sx={{ color: 'var(--color-error)', fontWeight: 'var(--font-semibold)' }}>
                                The institute has requested updates to your application. Please review the highlighted fields, make the necessary changes, and re-submit.
                              </Typography>
                            </Box>
                          )}

                          {['pending_final_review', 'approved', 'enrolled'].includes(application?.status) && (
                            <Box sx={{
                              p: 2.5, mb: 3,
                              background: 'rgba(16, 185, 129, 0.05)',
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)',
                              borderRadius: 'var(--radius-lg)',
                              border: 'var(--border-thin) solid rgba(16, 185, 129, 0.2)',
                              display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap'
                            }}>
                              <Box sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--color-success)',
                                flexShrink: 0
                              }}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 28 }} />
                              </Box>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography sx={{ color: 'var(--color-slate-900)', fontWeight: 'var(--font-bold)', fontSize: 'var(--font-base)', mb: 0.5 }}>
                                  {application?.status === 'pending_final_review' ? 'Application Submitted!' : (application?.status === 'approved' ? 'Application Approved!' : 'Application Enrolled!')}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'var(--color-success)', opacity: 0.9 }}>
                                  {application?.status === 'pending_final_review' ? 'Your application has been successfully submitted and is under review.' : 'You can track further updates from your dashboard.'}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                          <fieldset
                            disabled={['pending_final_review', 'approved', 'enrolled'].includes(application?.status)}
                            style={{
                              border: 'none', margin: 0, padding: 0,
                              opacity: ['pending_final_review', 'approved', 'enrolled'].includes(application?.status) ? 0.6 : 1,
                              pointerEvents: ['pending_final_review', 'approved', 'enrolled'].includes(application?.status) ? 'none' : 'auto',
                              '--floating-bg': ['pending_final_review', 'approved', 'enrolled'].includes(application?.status) ? 'var(--color-slate-50)' : 'var(--color-white)'
                            }}
                          >
                            {renderStageContent(selectedProgram.stages[activeStep])}
                          </fieldset>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        </Container>
        <Backdrop
          sx={{ color: 'var(--color-white)', zIndex: (theme) => theme.zIndex.drawer + 1, flexDirection: 'column', gap: 2 }}
          open={savingProgress}
        >
          <CircularProgress color="inherit" />
          <Typography variant="h6">Processing...</Typography>
        </Backdrop>
      </Box>

    </>
  );
}
