"use client";
import React, { useState } from 'react';
import { FieldContext } from '../../../../../../contexts/FieldContext';

import { apiClient } from '../../../../../../lib/apiClient';
import { preserveSignedUrls } from '../../../../../../utils/imageUtils';
import { styled } from '@mui/material/styles';
import { uploadToMinIO } from '../../../../../../utils/uploadUtils';
import { tooltipClasses } from '@mui/material/Tooltip';
import { GlassPopover } from '../../../../../../components/common/GlassPopover';
import { Box, Typography, Container, Paper, Button, Grid, Stepper, Step, StepLabel, Divider, Tooltip, Skeleton, Card, CardContent, TextField, MenuItem, Select, InputLabel, FormControl, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Backdrop, Alert, Popover, FormControlLabel, Checkbox } from '@mui/material';
import CustomCheckbox from '../../../../../../components/common/Checkbox';
import { useParams, useSearchParams } from 'next/navigation';
import { useAppRouter as useRouter } from '../../../../../../hooks/useAppRouter';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { BroomIcon } from '../../../../../../components/icons/BroomIcon';
import { useAccessibility } from '../../../../../../contexts/AccessibilityContext';
import gazetteer from '../../../../../../data/formatted/gazetteer.json';
import { sortLocationsByDistance } from '../../../../../../lib/geoNormalize';
import { buildSortedLanguages } from '../../../../../../lib/languages';
import { getAcronym, formatBreadcrumbName } from '../../../../../../utils/stringUtils';
import EmptyState from '../../../../../../components/ui/EmptyState';
import { useProfile } from '../../../../../../hooks/useProfile';
import AutoSaveIndicator from "../../../../../../components/common/AutoSaveIndicator";
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { RELIGION_OPTIONS } from '../../../../../../lib/religion';
import { RACE_ETHNICITY_OPTIONS } from '../../../../../../lib/raceEthnicity';
import { RELATION_OPTIONS } from '../../../../../../lib/relation';
import formOptions from '../../../../../../data/formatted/formOptions.json';
import ApplicationSkeleton from '../../../../../../features/admission/ApplicationSkeleton';
import { DASHBOARD_PAGE_WRAPPER_NO_HERO_SX, DASHBOARD_CONTAINER_SX } from '../../../../../../constants/layout';
import relationData from '../../../../../../data/formatted/relation.json';
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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { FieldCommentTooltip } from '../../../../../../components/common/FieldCommentTooltip';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { useBreadcrumbs } from "../../../../../../contexts/BreadcrumbContext";
import { getApplicationHistory, updateApplicationProgress, getUserApplications, applyForProgram, deleteApplication } from '../../../../../../features/admission/admissionService';
import { useApplicationAutoSave } from '../../../../../../features/admission/useApplicationAutoSave';
import { ErrorBoundary } from '../../../../../../components/common/ErrorBoundary';

import { CustomTooltip } from '../../../../../../components/common/Tooltip';
import { useToast } from "../../../../../../contexts/ToastContext";
import TarangButton from "../../../../../../components/common/TarangButton";

import { CustomFloatingInput, CustomFloatingSelect, CustomFloatingPhoneInput, CustomFloatingDatePicker, CustomFloatingCountrySelect, CustomFloatingMinIOUpload } from '../../../../../../components/common/FloatingFields';

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
  const { showToast } = useToast();
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
  const [otpAnchorEl, setOtpAnchorEl] = useState(null);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const searchParams = useSearchParams();
  const rawAppId = searchParams.get('appId');
  const [appId, setAppId] = useState((rawAppId && rawAppId !== 'undefined' && rawAppId !== 'null') ? rawAppId : null);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [application, setApplication] = useState(null);
  const [loadingApp, setLoadingApp] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [activeUploads, setActiveUploads] = useState(0);
  

  const [savingProgress, setSavingProgress] = useState(false);
  const isSubmitting = React.useRef(false);

  const [basicDetails, setBasicDetails] = useState({
    eligibilityChecklist: [],
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
    fatherCountryCode: '+91',
    fatherProfession: '',
    fatherIncome: '',
    fatherLocation: '',
    fatherIncomeDoc: null,

    fatherRelationDoc: null,
    motherName: '',
    motherContact: '',
    motherCountryCode: '+91',
    motherProfession: '',
    motherIncome: '',
    motherLocation: '',
    motherIncomeDoc: null,

    motherRelationDoc: null,
    guardianRelation: '',
    guardianRelationOther: '',
    guardianName: '',
    guardianContact: '',
    guardianCountryCode: '+91',
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


  const { autoSaveStatus } = useApplicationAutoSave({
    appId,
    activeStep,
    basicDetails,
    uploadedDocs,
    profile,
    applicationStatus: application?.status
  });

  React.useEffect(() => {
    if (!application) return;
    if (application.status === 'rejected') {
      showToast('The institute has requested updates to your application. Please review the highlighted fields and re-submit.', 'warning', null);
    } else if (application.status === 'pending_final_review') {
      showToast('Application Submitted! Your application has been successfully submitted and is under review.', 'success', null);
    } else if (application.status === 'approved') {
      showToast('Application Approved! You can track further updates from your dashboard.', 'success', null);
    } else if (application.status === 'enrolled') {
      showToast('Application Enrolled! You can track further updates from your dashboard.', 'success', null);
    }
  }, [application?.status, showToast]);

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

  const selectedCountry = gazetteer.Countries.find(c =>
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
        if (field === 'Date of Birth' || field === 'DOB') return ['Date of Birth', 'Date of Birth Proof'];
        if (field === 'Full Name') return ['Full Name', 'Full Name Proof'];
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
        if (field === 'Date of Birth' || field === 'DOB') return ['Date of Birth', 'Date of Birth Proof'];
        if (field === 'Full Name') return ['Full Name', 'Full Name Proof'];
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
  const rawInstituteName = instituteProfile?.primary_name || instituteProfile?.full_name || instituteProfile?.username || username;
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

        setInstituteProfile(prev => preserveSignedUrls(prev, apiProfile, [
          'profile_pic_url',
          'banner_url',
          'institute_profile.logo_url',
          'institute_profile.banner_url'
        ]));
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
      if (loadingInstitute) return;
      if (!instituteProfile?.id) {
        setLoadingPrograms(false);
        return;
      }
      setLoadingPrograms(true);
      try {
        const progRes = await apiClient.get(`/admissions/institutes/${instituteProfile.id}/programs`);
        console.log('[Admission Page] API Response:', progRes.data);
        const data = Array.isArray(progRes.data) ? progRes.data : (progRes.data?.programs || []);
        console.log('[Admission Page] Programs data:', data);

        const mappedPrograms = data.map(p => ({
          id: p.id,
          workflowTitle: p.form_title || p.formTitle || p.workflow_title || p.workflowTitle || 'Untitled Program',
          workflowDesc: p.form_desc || p.formDesc || p.workflow_desc || p.workflowDesc || '',
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

        if (programId) {
          const prog = mappedPrograms.find(p => p.id.toString() === programId.toString());
          if (prog) {
            setSelectedProgram(prog);
          }
        }
      } catch (err) {
        console.error("[Admission Page] Failed to fetch programs:", err?.response?.status, err?.response?.data, err);
      } finally {
        setLoadingPrograms(false);
      }
    };
    fetchPrograms();
  }, [instituteProfile, programId, loadingInstitute]);

  const isFetchingApp = React.useRef(false);

  React.useEffect(() => {
    const fetchAppIdIfMissing = async () => {
      if (appId || !profile?.id || !programId || !instituteProfile?.id) return;
      if (isFetchingApp.current) return;

      isFetchingApp.current = true;
      try {
        const res = await getUserApplications(profile.id);
        const apps = Array.isArray(res?.applications) ? res.applications : (Array.isArray(res) ? res : []);

        // Use toString() to prevent integer vs string mismatch!
        const existing = apps.find(a =>
          a.program_id?.toString() === programId.toString() || a.program?.id?.toString() === programId.toString()
        );

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
      } finally {
        isFetchingApp.current = false;
      }
    };
    fetchAppIdIfMissing();
  }, [appId, profile?.id, programId, username, instituteProfile?.id]);

  React.useEffect(() => {
    const fetchApp = async () => {
      if (!appId || appId === 'undefined' || appId === 'null') return;
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
                  // Sanitize: some fields may have been saved as {value, label} objects
                  // (e.g. from old select components). Unwrap them to plain strings.
                  const sanitize = (obj) => {
                    if (!obj || typeof obj !== 'object') return obj;
                    if (Array.isArray(obj)) return obj.map(sanitize);
                    if ('value' in obj && 'label' in obj && Object.keys(obj).length <= 3) return obj.value ?? '';
                    const result = {};
                    for (const [k, v] of Object.entries(obj)) {
                      result[k] = sanitize(v);
                    }
                    return result;
                  };
                  const sanitizedDetails = sanitize(parsedMetadata.basic_details);
                  setBasicDetails(prev => ({
                    ...prev,
                    ...sanitizedDetails
                  }));

                  // Populate fileNames from existing URLs
                  const newFileNames = {};
                  const extractFileName = (val) => {
                    if (typeof val === 'string' && val.startsWith('http')) {
                      return val.split('/').pop().split('?')[0]; // Remove query params if any
                    }
                    return null;
                  };

                  // Top level fields
                  Object.entries(sanitizedDetails).forEach(([k, v]) => {
                    const fn = extractFileName(v);
                    if (fn) newFileNames[k] = fn;
                  });

                  // Siblings
                  if (Array.isArray(sanitizedDetails.siblings)) {
                    sanitizedDetails.siblings.forEach((sib, i) => {
                      ['incomeDoc', 'relationDoc'].forEach(f => {
                        const fn = extractFileName(sib[f]);
                        if (fn) newFileNames[`sibling_${i}_${f}`] = fn;
                      });
                    });
                  }

                  // Academic Records
                  if (Array.isArray(sanitizedDetails.academicRecords)) {
                    sanitizedDetails.academicRecords.forEach((ac, i) => {
                      const fn = extractFileName(ac.academicDoc);
                      if (fn) newFileNames[`academic_${i}_academicDoc`] = fn;

                      if (Array.isArray(ac.achievements)) {
                        ac.achievements.forEach((ach, j) => {
                          const fn2 = extractFileName(ach.doc);
                          if (fn2) newFileNames[`academic_${i}_achievement_${j}_doc`] = fn2;
                        });
                      }
                    });
                  }

                  // Criminal Records
                  if (Array.isArray(sanitizedDetails.criminalRecords)) {
                    sanitizedDetails.criminalRecords.forEach((cr, i) => {
                      const fn = extractFileName(cr.doc);
                      if (fn) newFileNames[`criminal_${i}_doc`] = fn;
                    });
                  }

                  
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
    if (!appId) {
      router.push(`/dashboard/explore/${username}`);
      return;
    }
    setIsDiscardDialogOpen(true);
  };

  const executeDiscard = async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setIsDiscardDialogOpen(false);
    setSavingProgress(true);
    try {
      await deleteApplication(appId);
      router.push(`/dashboard/explore/${username}`);
    } catch (err) {
      console.error('Failed to discard application:', err);
      showToast("Failed to discard application. Please try again.");
    } finally {
      setSavingProgress(false);
      isSubmitting.current = false;
    }
  };

  const handleNext = async () => {
    if (isSubmitting.current) return;
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

    const isCompleted = activeStep >= steps.length - 1;

    if (isCompleted) {
      let eligibilityList = [];
      try {
        const parsed = JSON.parse(selectedProgram?.eligibility || "[]");
        eligibilityList = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        eligibilityList = [selectedProgram?.eligibility].filter(Boolean);
      }
      if (eligibilityList.length > 0 && (basicDetails.eligibilityChecklist || []).length !== eligibilityList.length) {
        showToast("Please declare that you meet all Eligibility Criteria before submitting.", "error");
        return;
      }
    }

    isSubmitting.current = true;
    setSavingProgress(true);
    try {

      const payloadMetadata = {
        completed_stage: activeStep,
        uploaded_docs: uploadedDocs,
      };

      if (activeStep === 0) {
        let newUploadedDocs = { ...uploadedDocs };

        const uploadFile = async (file, fieldKey) => {
          let mimeType = file.type;
          if (!mimeType) {
            if (file.name.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';
            else if (file.name.toLowerCase().match(/\.jpe?g$/)) mimeType = 'image/jpeg';
            else if (file.name.toLowerCase().endsWith('.png')) mimeType = 'image/png';
          }

          // Frontend converts name to snake case label
          const formattedFieldName = fieldKey
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .replace(/[\s-]/g, '_')
            .toLowerCase();

          const { data } = await apiClient.get(`/s3/sign`, {
            params: { user_id: profile.id, username: profile.username, type: 'document', filename: formattedFieldName, mime: mimeType }
          });
          const response = await fetch(data.upload_url, { method: "PUT", body: file, headers: { "Content-Type": mimeType } });
          if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);
          return data.file_url;
        };

        const processFiles = async (obj, path = '') => {
          if (!obj) return;
          for (const key of Object.keys(obj)) {
            if (obj[key] instanceof File) {
              const url = await uploadFile(obj[key], key);
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
      showToast("Failed to submit step. Please try again.");
    } finally {
      setSavingProgress(false);
      isSubmitting.current = false;
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

    

    // Cascade: delete old file if re-uploading
    const oldURL = uploadedDocs[reqName];
    if (oldURL && typeof oldURL === 'string' && oldURL.startsWith('http')) {
      deleteOldFile(oldURL);
    }

    setActiveUploads(prev => prev + 1);
    try {
      const { data } = await apiClient.get(`/s3/sign`, {
        params: { user_id: profile.id, username: profile.username, type: 'document', filename: reqName, mime: mimeType }
      });
      const response = await fetch(data.upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": mimeType }
      });
      if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);

      setUploadedDocs(prev => ({
        ...prev,
        [reqName]: data.file_url
      }));
      
    } catch (err) {
      console.error(`Upload failed for ${reqName}:`, err);
      showToast("File upload failed.");
    } finally {
      setActiveUploads(prev => prev + 1);
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
    if (field === 'email') setIsEmailVerified(false);
    if (field === 'phone') setIsPhoneVerified(false);

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

  const renderAddressBlock = (type, title, disabled = false, actionComponent = null) => {
    // If sameAsPermanent is true and this is correspondenceAddress, we use permanentAddress values
    const sourceData = (type === 'correspondenceAddress' && basicDetails.sameAsPermanent)
      ? basicDetails.permanentAddress
      : (basicDetails[type] || {});

    const errPrefix = type;

    // Calculate distances based on user location or default to India's center if unavailable
    const uLat = userLocation?.lat || 20.5937;
    const uLon = userLocation?.lon || 78.9629;

    // Derived options from gazetteer
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
      <Box sx={{ mb: 3, opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)' }}>
            {title}
          </Typography>
          {actionComponent}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>
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
              <CustomFloatingMinIOUpload
                label="Address Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={basicDetails[`${type}Proof`]}
                profile={profile}
                type="document"
                fieldName={`${type}Proof`}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => ({ ...prev, [`${type}Proof`]: url || '' })); if (url && basicDetailsErrors[`${type}Proof`]) setBasicDetailsErrors(prev => ({ ...prev, [`${type}Proof`]: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
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

      {(() => {
        let eligibilityList = [];
        try {
          const parsed = JSON.parse(selectedProgram?.eligibility || "[]");
          eligibilityList = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          eligibilityList = [selectedProgram?.eligibility].filter(Boolean);
        }

        if (eligibilityList.length > 0) {
          return (
            <>
              <Box sx={{ width: 'var(--size-full)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--font-base)', color: 'var(--color-slate-700)', mb: 2 }}>
                  Eligibility Declaration
                </Typography>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  p: 3,
                  border: 'var(--border-thin) solid var(--card-border)',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  {eligibilityList.map((criteria, idx) => (
                    <CustomCheckbox
                      key={idx}
                      disabled={['pending_final_review', 'approved', 'enrolled'].includes(application?.status)}
                      checked={(basicDetails.eligibilityChecklist || []).includes(idx)}
                      onChange={(e) => {
                        const currentList = basicDetails.eligibilityChecklist || [];
                        if (e.target.checked) {
                          setBasicDetails(prev => ({ ...prev, eligibilityChecklist: [...currentList, idx] }));
                        } else {
                          setBasicDetails(prev => ({ ...prev, eligibilityChecklist: currentList.filter(i => i !== idx) }));
                        }
                      }}
                      label={<Typography sx={{ fontSize: 'var(--font-base)', color: 'var(--color-slate-800)', lineHeight: 1.5 }}>{criteria}</Typography>}
                      alignTop={true}
                      sx={{ m: 0 }}
                    />
                  ))}
                </Box>
              </Box>
              <Divider sx={{ my: 3, opacity: 0.5 }} />
            </>
          );
        }
        return null;
      })()}

      {/* Section: Personal Information */}
      {sf('full_name', 'email', 'phone', 'dob', 'gender', 'nationality', 'caste', 'subcaste', 'birth_religion', 'current_religion', 'race_ethnicity', 'language') && (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--font-base)', color: 'var(--color-slate-700)', mb: 2 }}>
            Personal Information
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(12, minmax(0, 1fr))' }, gap: 1.5, mb: 1.5, width: 'var(--size-full)' }}>
            {sf('full_name') && <Box sx={{ gridColumn: { md: 'span 6' } }}>
              <CustomFloatingInput
                label="Full Name"
                value={basicDetails.fullName}
                onChange={handleBasicDetailsChange('fullName')}
                error={!!basicDetailsErrors.fullName}
              />
            </Box>}
            {sf('email') && <Box id="email-field-box" sx={{ gridColumn: { md: 'span 6' }, position: 'relative' }}>
              <CustomFloatingInput
                label="Email"
                value={basicDetails.email}
                onChange={handleBasicDetailsChange('email')}
                error={!!basicDetailsErrors.email}
                InputProps={{
                  endAdornment: (isEmailVerified || (!!profile?.email && profile?.email === basicDetails.email)) ? (
                    <Typography sx={{ color: 'var(--color-success)', fontSize: 'var(--font-xs)', fontWeight: 'var(--font-bold)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Verified
                    </Typography>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => { setOtpTarget('email'); setOtp(''); setOtpAnchorEl(document.getElementById('email-field-box')); }}
                      sx={{ minWidth: 'unset', px: 1.5, py: 0.5, fontSize: 'var(--font-xs)', fontWeight: 'var(--font-semibold)', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)', bgcolor: 'transparent', textTransform: 'none', '&:hover': { bgcolor: 'transparent' } }}
                    >
                      Verify
                    </Button>
                  )
                }}
              />
              <GlassPopover
                open={otpTarget === 'email'}
                anchorEl={otpAnchorEl}
                onClose={() => { setOtpTarget(null); setOtpAnchorEl(null); setOtp(''); }}
                width="match-anchor"
                sx={{ p: 2, gap: 1.5 }}
              >
                <Box sx={{}}>
                  <Typography sx={{ fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)', fontWeight: 'var(--font-medium)' }}>
                    Enter OTP sent to <strong>{maskEmail(basicDetails.email)}</strong>
                  </Typography>
                </Box>
                <Box sx={{}}>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.04)',
                    borderRadius: 'var(--radius-md)', px: 1.5, py: 1
                  }}>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      style={{
                        border: 'none', background: 'transparent', outline: 'none',
                        width: 'var(--size-full)', fontSize: 'var(--font-sm)',
                        color: 'var(--color-slate-900)'
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    disabled={resendTimer > 0}
                    onClick={handleResendOtp}
                    sx={{ p: 0, minWidth: 'auto', minHeight: 'auto', color: resendTimer > 0 ? 'var(--color-slate-700)' : 'var(--color-primary)', textTransform: 'none', fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', '&.Mui-disabled': { color: 'var(--color-slate-700)', opacity: 1 }, '&:hover': { background: 'transparent', textDecoration: resendTimer > 0 ? 'none' : 'underline' } }}
                  >
                    {resendTimer > 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: '15px' }} />
                        <Box component="div" sx={{ fontSize: '13px', fontWeight: 'var(--font-medium)' }}>
                          Resend in {resendTimer}s
                        </Box>
                      </Box>
                    ) : "Resend"}
                  </Button>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                      onClick={() => { setOtpTarget(null); setOtp(''); }}
                      sx={{ height: '30px', px: 2, color: 'var(--color-slate-500)', border: '1px solid var(--color-slate-400)', borderRadius: 'var(--radius-sm)', textTransform: 'none', fontWeight: 'var(--font-medium)', fontSize: 'var(--font-sm)', bgcolor: 'transparent', '&:hover': { bgcolor: 'var(--color-slate-50)' } }}
                    >
                      Cancel
                    </Button>
                    <Button variant="contained" onClick={handleVerifyOtp} disableElevation
                      sx={{ height: '30px', px: 2.5, borderRadius: 'var(--radius-sm)', bgcolor: 'var(--color-primary)', textTransform: 'none', fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', '&:hover': { bgcolor: 'var(--color-primary-hover)' } }}
                    >
                      Submit
                    </Button>
                  </Box>
                </Box>
              </GlassPopover>
            </Box>}
            {sf('phone') && <Box id="phone-field-box" sx={{ gridColumn: { md: 'span 6' }, position: 'relative' }}>
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
                    onClick={() => { setOtpTarget('phone'); setOtp(''); setOtpAnchorEl(document.getElementById('phone-field-box')); }}
                    sx={{ minWidth: 'unset', px: 1.5, py: 0.5, fontSize: 'var(--font-xs)', fontWeight: 'var(--font-semibold)', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)', bgcolor: 'transparent', textTransform: 'none', '&:hover': { bgcolor: 'transparent' } }}
                  >
                    Verify
                  </Button>
                ) : null)}
              />
              <GlassPopover
                open={otpTarget === 'phone'}
                anchorEl={otpAnchorEl}
                onClose={() => { setOtpTarget(null); setOtpAnchorEl(null); setOtp(''); }}
                width="match-anchor"
                sx={{ p: 2, gap: 1.5 }}
              >
                <Box sx={{}}>
                  <Typography sx={{ fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)', fontWeight: 'var(--font-medium)' }}>
                    Enter OTP sent to <strong>{basicDetails.countryCode || '+91'} {maskPhone(basicDetails.phone)}</strong>
                  </Typography>
                </Box>
                <Box sx={{}}>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.04)',
                    borderRadius: 'var(--radius-md)', px: 1.5, py: 1
                  }}>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      style={{
                        border: 'none', background: 'transparent', outline: 'none',
                        width: 'var(--size-full)', fontSize: 'var(--font-sm)',
                        color: 'var(--color-slate-900)'
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    disabled={resendTimer > 0}
                    onClick={handleResendOtp}
                    sx={{ p: 0, minWidth: 'auto', minHeight: 'auto', color: resendTimer > 0 ? 'var(--color-slate-700)' : 'var(--color-primary)', textTransform: 'none', fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', '&.Mui-disabled': { color: 'var(--color-slate-700)', opacity: 1 }, '&:hover': { background: 'transparent', textDecoration: resendTimer > 0 ? 'none' : 'underline' } }}
                  >
                    {resendTimer > 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: '15px' }} />
                        <Box component="div" sx={{ fontSize: '13px', fontWeight: 'var(--font-medium)' }}>
                          Resend in {resendTimer}s
                        </Box>
                      </Box>
                    ) : "Resend"}
                  </Button>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                      onClick={() => { setOtpTarget(null); setOtp(''); }}
                      sx={{ height: '30px', px: 2, color: 'var(--color-slate-500)', border: '1px solid var(--color-slate-400)', borderRadius: 'var(--radius-sm)', textTransform: 'none', fontWeight: 'var(--font-medium)', fontSize: 'var(--font-sm)', bgcolor: 'transparent', '&:hover': { bgcolor: 'var(--color-slate-50)' } }}
                    >
                      Cancel
                    </Button>
                    <Button variant="contained" onClick={handleVerifyOtp} disableElevation
                      sx={{ height: '30px', px: 2.5, borderRadius: 'var(--radius-sm)', bgcolor: 'var(--color-primary)', textTransform: 'none', fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', '&:hover': { bgcolor: 'var(--color-primary-hover)' } }}
                    >
                      Submit
                    </Button>
                  </Box>
                </Box>
              </GlassPopover>

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
                returnNationality={true}
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
                options={RELIGION_OPTIONS}
              />
            </Box>}
            {sf('current_religion') && <Box sx={{ gridColumn: { md: 'span 4' } }}>
              <CustomFloatingSelect
                label="Current Religion"
                value={basicDetails.currentReligion}
                onChange={handleBasicDetailsChange('currentReligion')}
                error={!!basicDetailsErrors.currentReligion}
                options={RELIGION_OPTIONS}
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
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5, mb: 3, width: 'var(--size-full)' }}>
              {sf('full_name_proof') && <Box sx={{ gridColumn: 'auto' }}>
                <CustomFloatingMinIOUpload
                label="Full Name Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={basicDetails['nameProof']}
                profile={profile}
                type="document"
                fieldName={'nameProof'}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => ({ ...prev, nameProof: url || '' })); if (url && basicDetailsErrors['nameProof']) setBasicDetailsErrors(prev => ({ ...prev, nameProof: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors.nameProof}
                helperText={undefined}
              />
              </Box>}
              {sf('dob_proof') && <Box sx={{ gridColumn: 'auto' }}>
                <CustomFloatingMinIOUpload
                label="Date of Birth Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={basicDetails['dobProof']}
                profile={profile}
                type="document"
                fieldName={'dobProof'}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => ({ ...prev, dobProof: url || '' })); if (url && basicDetailsErrors['dobProof']) setBasicDetailsErrors(prev => ({ ...prev, dobProof: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors.dobProof}
                helperText={undefined}
              />
              </Box>}
              {sf('gender_proof') && <Box sx={{ gridColumn: 'auto' }}>
                <CustomFloatingMinIOUpload
                label="Gender Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={basicDetails['genderProof']}
                profile={profile}
                type="document"
                fieldName={'genderProof'}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => ({ ...prev, genderProof: url || '' })); if (url && basicDetailsErrors['genderProof']) setBasicDetailsErrors(prev => ({ ...prev, genderProof: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors.genderProof}
                helperText={undefined}
              />
              </Box>}
              {sf('caste_proof') && <Box sx={{ gridColumn: 'auto' }}>
                <CustomFloatingMinIOUpload
                label="Caste Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={basicDetails['casteProof']}
                profile={profile}
                type="document"
                fieldName={'casteProof'}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => ({ ...prev, casteProof: url || '' })); if (url && basicDetailsErrors['casteProof']) setBasicDetailsErrors(prev => ({ ...prev, casteProof: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors.casteProof}
                helperText={undefined}
              />
              </Box>}
              {sf('nationality_proof') && <Box sx={{ gridColumn: 'auto' }}>
                <CustomFloatingMinIOUpload
                label="Nationality Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={basicDetails['nationalityProof']}
                profile={profile}
                type="document"
                fieldName={'nationalityProof'}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => ({ ...prev, nationalityProof: url || '' })); if (url && basicDetailsErrors['nationalityProof']) setBasicDetailsErrors(prev => ({ ...prev, nationalityProof: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors.nationalityProof}
                helperText={undefined}
              />
              </Box>}
            </Box>
          )}

        </>
      )}

      {sf('full_name', 'email', 'phone', 'dob', 'gender', 'nationality', 'caste', 'subcaste', 'birth_religion', 'current_religion', 'race_ethnicity', 'language') && basicDetails.academicRecords.length > 0 && (
        <Divider sx={{ my: 3, opacity: 0.5 }} />
      )}

      {/* Section: Academic Record — always shown when there are academic records configured */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--font-base)', color: 'var(--color-slate-700)', mb: 2 }}>
        Academic Record
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
        {basicDetails.academicRecords.map((rec, index) => (
          <Box key={index} sx={{
            display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1.5, p: 3, border: 'var(--border-thin) solid var(--card-border)', borderRadius: 'var(--radius-lg)', position: 'relative'
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
            <Typography variant="subtitle2" sx={{ gridColumn: { sm: 'span 2' }, fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)' }}>
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
            <CustomFloatingDatePicker
              label="Passing Year"
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
              <CustomFloatingMinIOUpload
                label="Qualification Document"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={rec.academicDoc}
                profile={profile}
                type="document"
                fieldName={`academic_${index}_academicDoc`}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => { const newRecs = [...prev.academicRecords]; newRecs[index] = { ...newRecs[index], academicDoc: url || '' }; return { ...prev, academicRecords: newRecs }; }); if (url && basicDetailsErrors[`academic_${index}_academicDoc`]) setBasicDetailsErrors(prev => ({ ...prev, [`academic_${index}_academicDoc`]: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors[`academic_${index}_academicDoc`]}
                helperText={basicDetailsErrors[`academic_${index}_academicDoc`]}
              />
            </Box>

            {/* Achievements Section */}
            {rec.achievements && rec.achievements.length > 0 && (
              <Box sx={{ gridColumn: { xs: '1fr', sm: 'span 2' }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {rec.achievements.map((ach, achIndex) => (
                  <Box key={achIndex} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5, p: 2, border: 'var(--border-thin) solid var(--card-border)', position: 'relative', borderRadius: 'var(--radius-md)' }}>
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
                      <CustomFloatingMinIOUpload
                label="Achievement Document"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={ach.doc_url}
                profile={profile}
                type="document"
                fieldName={`academic_${index}_achievement_${achIndex}_doc`}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => { const newRecs = [...prev.academicRecords]; const achs = [...newRecs[index].achievements]; achs[achIndex] = { ...achs[achIndex], doc_url: url || '' }; newRecs[index] = { ...newRecs[index], achievements: achs }; return { ...prev, academicRecords: newRecs }; });
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
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
                sx={{ textTransform: 'none', borderRadius: 'var(--radius-sm)' }}
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
          sx={{ alignSelf: 'flex-start', textTransform: 'none', borderRadius: 'var(--radius-sm)' }}
        >
          Add Qualification
        </Button>
      </Box>

      {sf('father_name', 'father_contact', 'mother_name', 'mother_contact', 'has_sibling') && (
        <Divider sx={{ my: 3, opacity: 0.5 }} />
      )}

      {/* Section: Family Details */}
      {sf('father_name', 'father_contact', 'mother_name', 'mother_contact', 'has_sibling') && (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--font-base)', color: 'var(--color-slate-700)', mb: 2 }}>
            Family Details
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5, mb: 3, width: 'var(--size-full)' }}>
            {sf('father_name') && <CustomFloatingInput
              label="Father&apos;s Name"
              value={basicDetails.fatherName}
              onChange={handleBasicDetailsChange('fatherName')}
              error={!!basicDetailsErrors.fatherName}
            />}
            {sf('father_contact') && <CustomFloatingPhoneInput
              label="Father&apos;s Contact Number"
              countryCode={basicDetails.fatherCountryCode}
              onCountryCodeChange={(e) => setBasicDetails(prev => ({ ...prev, fatherCountryCode: e.target.value }))}
              value={basicDetails.fatherContact}
              onChange={handleBasicDetailsChange('fatherContact')}
              error={!!basicDetailsErrors.fatherContact}
            />}

            {sf('father_doc_proof') && <Box sx={{ gridColumn: 'auto' }}>
              <CustomFloatingMinIOUpload
                label="Father&apos;s Document Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={basicDetails['fatherRelationDoc']}
                profile={profile}
                type="document"
                fieldName={'fatherRelationDoc'}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => ({ ...prev, fatherRelationDoc: url || '' })); if (url && basicDetailsErrors['fatherRelationDoc']) setBasicDetailsErrors(prev => ({ ...prev, fatherRelationDoc: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors.fatherRelationDoc}
                helperText={undefined}
              />
            </Box>}

            {sf('mother_name') && <CustomFloatingInput
              label="Mother&apos;s Name"
              value={basicDetails.motherName}
              onChange={handleBasicDetailsChange('motherName')}
              error={!!basicDetailsErrors.motherName}
            />}
            {sf('mother_contact') && <CustomFloatingPhoneInput
              label="Mother&apos;s Contact Number"
              countryCode={basicDetails.motherCountryCode}
              onCountryCodeChange={(e) => setBasicDetails(prev => ({ ...prev, motherCountryCode: e.target.value }))}
              value={basicDetails.motherContact}
              onChange={handleBasicDetailsChange('motherContact')}
              error={!!basicDetailsErrors.motherContact}
            />}

            {sf('mother_doc_proof') && <Box sx={{ gridColumn: 'auto' }}>
              <CustomFloatingMinIOUpload
                label="Mother&apos;s Document Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={basicDetails['motherRelationDoc']}
                profile={profile}
                type="document"
                fieldName={'motherRelationDoc'}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => ({ ...prev, motherRelationDoc: url || '' })); if (url && basicDetailsErrors['motherRelationDoc']) setBasicDetailsErrors(prev => ({ ...prev, motherRelationDoc: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors.motherRelationDoc}
                helperText={undefined}
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
                <CustomFloatingPhoneInput
                  label="Guardian&apos;s Contact Number"
                  countryCode={basicDetails.guardianCountryCode}
                  onCountryCodeChange={(e) => setBasicDetails(prev => ({ ...prev, guardianCountryCode: e.target.value }))}
                  value={basicDetails.guardianContact}
                  onChange={handleBasicDetailsChange('guardianContact')}
                  error={!!basicDetailsErrors.guardianContact}
                />

                <Box sx={{ gridColumn: 'auto' }}>
                  <CustomFloatingMinIOUpload
                label="Guardian&apos;s Document Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={basicDetails['guardianRelationDoc']}
                profile={profile}
                type="document"
                fieldName={'guardianRelationDoc'}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => ({ ...prev, guardianRelationDoc: url || '' })); if (url && basicDetailsErrors['guardianRelationDoc']) setBasicDetailsErrors(prev => ({ ...prev, guardianRelationDoc: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors.guardianRelationDoc}
                helperText={undefined}
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
              <Box sx={{ gridColumn: { sm: 'span 3' }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {basicDetails.siblings.map((sib, index) => (
                  <Box key={index} sx={{
                    display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                    gap: 1.5, p: 3, border: 'var(--border-thin) solid var(--card-border)', borderRadius: 'var(--radius-lg)', position: 'relative'
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
                    <Typography variant="subtitle2" sx={{ gridColumn: { sm: 'span 3' }, fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)' }}>
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
                      <CustomFloatingMinIOUpload
                label="Sibling's Document Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={sib.siblingDoc}
                profile={profile}
                type="document"
                fieldName={`sibling_${index}_siblingDoc`}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => { const newSibs = [...prev.siblings]; newSibs[index] = { ...newSibs[index], siblingDoc: url || '' }; return { ...prev, siblings: newSibs }; }); if (url && basicDetailsErrors[`sibling_${index}_siblingDoc`]) setBasicDetailsErrors(prev => ({ ...prev, [`sibling_${index}_siblingDoc`]: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors[`sibling_${index}_siblingDoc`]}
                helperText={undefined}
              />
                    </Box>
                  </Box>
                ))}

                <Button
                  variant="outlined"
                  onClick={addSibling}
                  startIcon={<AddIcon />}
                  sx={{ alignSelf: 'flex-start', textTransform: 'none', borderRadius: 'var(--radius-sm)' }}
                >
                  Add Another Sibling
                </Button>
              </Box>
            )}
          </Box>
        </>
      )}

      {sf('family_income', 'individual_family_details') && (
        <Divider sx={{ my: 3, opacity: 0.5 }} />
      )}

      {/* Section: Family Income */}
      {sf('family_income', 'individual_family_details') && (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--font-base)', color: 'var(--color-slate-700)', mb: 2 }}>
            Family Income & Details
          </Typography>

          {/* Individual Member Incomes */}
          {basicDetails.fatherName && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)', mb: 2 }}>
                Father&apos;s Details ({basicDetails.fatherName})
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}>
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
                  <CustomFloatingMinIOUpload
                label="Father&apos;s Income Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={basicDetails['fatherIncomeDoc']}
                profile={profile}
                type="document"
                fieldName={'fatherIncomeDoc'}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => ({ ...prev, fatherIncomeDoc: url || '' })); if (url && basicDetailsErrors['fatherIncomeDoc']) setBasicDetailsErrors(prev => ({ ...prev, fatherIncomeDoc: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors.fatherIncomeDoc}
                helperText={undefined}
              />
                </Box>
              </Box>
            </Box>
          )}

          {basicDetails.motherName && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)', mb: 2 }}>
                Mother&apos;s Details ({basicDetails.motherName})
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}>
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
                  <CustomFloatingMinIOUpload
                label="Mother&apos;s Income Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={basicDetails['motherIncomeDoc']}
                profile={profile}
                type="document"
                fieldName={'motherIncomeDoc'}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => ({ ...prev, motherIncomeDoc: url || '' })); if (url && basicDetailsErrors['motherIncomeDoc']) setBasicDetailsErrors(prev => ({ ...prev, motherIncomeDoc: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors.motherIncomeDoc}
                helperText={undefined}
              />
                </Box>
              </Box>
            </Box>
          )}

          {basicDetails.guardianName && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)', mb: 2 }}>
                Guardian&apos;s Details ({basicDetails.guardianName})
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}>
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
                  <CustomFloatingMinIOUpload
                label="Guardian&apos;s Income Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={basicDetails['guardianIncomeDoc']}
                profile={profile}
                type="document"
                fieldName={'guardianIncomeDoc'}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => ({ ...prev, guardianIncomeDoc: url || '' })); if (url && basicDetailsErrors['guardianIncomeDoc']) setBasicDetailsErrors(prev => ({ ...prev, guardianIncomeDoc: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors.guardianIncomeDoc}
                helperText={undefined}
              />
                </Box>
              </Box>
            </Box>
          )}

          {basicDetails.hasSibling === 'Yes' && basicDetails.siblings.map((sib, index) => (
            sib.name && (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)', mb: 2 }}>
                  Sibling {index + 1}&apos;s Details ({sib.name})
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}>
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
                    <CustomFloatingMinIOUpload
                label="Sibling's Income Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={sib.incomeDoc}
                profile={profile}
                type="document"
                fieldName={`sibling_${index}_incomeDoc`}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => { const newSibs = [...prev.siblings]; newSibs[index] = { ...newSibs[index], incomeDoc: url || '' }; return { ...prev, siblings: newSibs }; });
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors[`sibling_${index}_incomeDoc`]}
                helperText={undefined}
              />
                  </Box>
                </Box>
              </Box>
            )
          ))}

          <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)', mb: 2 }}>
            Overall Family Income
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5, mb: 3, width: 'var(--size-full)' }}>
            <CustomFloatingInput
              label="Annual Family Income (Auto-calculated)"
              disabled={true}
              value={basicDetails.familyIncome}
              error={!!basicDetailsErrors.familyIncome}
            />
            <Box sx={{ gridColumn: 'auto' }}>
              <CustomFloatingMinIOUpload
                label="Family Income Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={basicDetails['incomeDoc']}
                profile={profile}
                type="document"
                fieldName={'incomeDoc'}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => ({ ...prev, incomeDoc: url || '' })); if (url && basicDetailsErrors['incomeDoc']) setBasicDetailsErrors(prev => ({ ...prev, incomeDoc: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors.incomeDoc}
                helperText={undefined}
              />
            </Box>
          </Box>
        </>
      )}

      {sf('perm_country', 'perm_state', 'perm_district', 'perm_area_type', 'perm_ward', 'perm_house', 'perm_landmark', 'perm_street', 'perm_pincode', 'perm_address', 'corr_country', 'corr_state', 'corr_district', 'corr_area_type', 'corr_ward', 'corr_house', 'corr_landmark', 'corr_street', 'corr_pincode', 'corr_address') && (
        <Divider sx={{ my: 3, opacity: 0.5 }} />
      )}

      {/* Section: Contact Address */}
      {sf('perm_country', 'perm_state', 'perm_district', 'perm_area_type', 'perm_ward', 'perm_house', 'perm_landmark', 'perm_street', 'perm_pincode', 'perm_address', 'corr_country', 'corr_state', 'corr_district', 'corr_area_type', 'corr_ward', 'corr_house', 'corr_landmark', 'corr_street', 'corr_pincode', 'corr_address') && (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--font-base)', color: 'var(--color-slate-700)', mb: 2 }}>
            Contact Address
          </Typography>
          {renderAddressBlock('permanentAddress', 'Permanent Address', false)}
          {renderAddressBlock('correspondenceAddress', 'Correspondence Address', basicDetails.sameAsPermanent, (
            <CustomCheckbox
              checked={basicDetails.sameAsPermanent}
              onChange={(e) => {
                setBasicDetails(prev => ({ ...prev, sameAsPermanent: e.target.checked }));
                if (e.target.checked && basicDetailsErrors.correspondenceAddress) {
                  setBasicDetailsErrors(prev => ({ ...prev, correspondenceAddress: undefined }));
                }
              }}
              label={<Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>Same as Permanent Address</Typography>}
            />
          ))}
        </>
      )}
      {sf('criminal_record') && (
        <Divider sx={{ my: 3, opacity: 0.5 }} />
      )}

      {/* Section: Criminal and Character Record */}
      {sf('criminal_record') && (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--font-base)', color: 'var(--color-slate-700)', mb: 2 }}>
            Criminal and Character Record
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5, mb: 3 }}>
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

            <CustomFloatingMinIOUpload
                label="Police Verification Proof"
                accept=".pdf,.png,.jpg,.jpeg"
                savedValue={basicDetails['policeVerificationDoc']}
                profile={profile}
                type="document"
                fieldName={'policeVerificationDoc'}
                onUploadStart={() => setActiveUploads(prev => prev + 1)}
                onUploadComplete={(url) => {
                  setBasicDetails(prev => ({ ...prev, policeVerificationDoc: url || '' })); if (url && basicDetailsErrors['policeVerificationDoc']) setBasicDetailsErrors(prev => ({ ...prev, policeVerificationDoc: '' }));
                  setActiveUploads(prev => Math.max(0, prev - 1));
                }}
                onUploadError={() => setActiveUploads(prev => Math.max(0, prev - 1))}
                error={!!basicDetailsErrors.policeVerificationDoc}
                helperText={undefined}
              />
          </Box>

          {basicDetails.hasCriminalRecord === 'Yes' && (
            <Box sx={{ mb: 3 }}>
              {basicDetails.criminalRecords.map((record, index) => (
                <Box key={index} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5, mb: 2, position: 'relative' }}>
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
                        disableFuture={true}
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
                  textTransform: 'none',
                  borderRadius: 'var(--radius-sm)'
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
            background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.45) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.3) 0, transparent 50%), 
            radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.2) 0, transparent 50%),
            radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.15) 0, transparent 50%),
            #eef2f6
          `,
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
              bgcolor: 'var(--color-error)', color: 'var(--color-white)', px: 2.5,
              '&:hover': { bgcolor: 'var(--color-error)' }
            }}
          >
            {language === 'en' ? 'Discard' : 'हटाएँ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // Upload handled via centralized uploadToMinIO

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
          { type: '', details: '', recognizedBy: '', doc_url: null }
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
    const oldURL = basicDetails.academicRecords[academicIndex]?.achievements?.[achIndex]?.doc;

    if (!file) {
      
      setBasicDetails(prev => {
        const newRecords = [...prev.academicRecords];
        const academicRecord = { ...newRecords[academicIndex] };
        const newAchievements = [...(academicRecord.achievements || [])];
        newAchievements[achIndex] = { ...newAchievements[achIndex], doc: null };
        academicRecord.achievements = newAchievements;
        newRecords[academicIndex] = academicRecord;
        return { ...prev, academicRecords: newRecords };
      });
      return;
    }
    

    try {
      setActiveUploads(prev => prev + 1);
      const url = await uploadToMinIO(file, profile, 'document', `academic_${academicIndex}_achievement_${achIndex}_doc`, typeof oldURL === 'string' && oldURL.startsWith('http') ? oldURL : null);
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
    } catch (err) {
      console.error(`Upload failed for achievement:`, err);
      showToast("File upload failed.");
    } finally {
      setActiveUploads(prev => prev + 1);
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
      showToast("Please enter a valid OTP.");
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
                  const isUploading = activeUploads > 0 && false === req;
                  const comment = commentsByLabel[req];
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                      <Box sx={{
                        position: 'relative',
                        width: 'var(--size-full)',
                        '& .comment-icon': { opacity: 0, transition: 'opacity var(--transition-base)', pointerEvents: 'none' },
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
                            border: isUploaded ? 'var(--border-thick) solid #10b981' : comment ? '1px solid var(--color-warning)' : '2px dashed rgba(30, 79, 163, 0.3)',
                            bgcolor: isUploaded ? 'rgba(16, 185, 129, 0.05)' : 'var(--glass-bg)',
                            backdropFilter: 'blur(30px)',
                            cursor: 'pointer',
                            transition: 'var(--transition-base)',
                            display: 'block',
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
                          <Typography variant="caption" sx={{ color: isUploaded ? 'var(--color-success)' : 'var(--color-slate-500)', fontSize: 'var(--font-xs)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '100%' }}>
                            {isUploaded ? (fileNames[req] || 'Uploaded successfully') : 'Browse or drag & drop'}
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
                    border: 'var(--border-thin) solid var(--card-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'var(--size-full)',
                    bgcolor: 'var(--glass-bg)'
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
                          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%)',
                          color: 'var(--color-white)',
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
    <ErrorBoundary>
      <React.Suspense fallback={<ApplicationSkeleton />}>
        <Box sx={{ ...DASHBOARD_PAGE_WRAPPER_NO_HERO_SX, pt: 0, minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>

          {/* ─── MAIN CONTENT CONTAINER ─── */}
          <Container ref={cardsRef} maxWidth={false} sx={{
            ...DASHBOARD_CONTAINER_SX,
            px: { xs: 2, md: 4 },
            pb: showEmptyState || !!selectedProgram ? 0 : 10,
            flexGrow: 1,
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
                    overflow: 'hidden'
                  }}>
                    <Stepper activeStep={activeStep} orientation="horizontal" sx={{
                      mb: 2,
                      '.MuiStepConnector-line': { borderTopWidth: '2px', borderColor: 'var(--color-slate-200)' },
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
                            )} />
                          </Step>
                        );
                      })}
                    </Stepper>

                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 2, letterSpacing: '-0.02em', flexShrink: 0 }}>
                      {selectedProgram.workflowTitle}
                    </Typography>

                    <Box sx={{ overflowY: 'auto', flexGrow: 1, pr: 1, pb: 2 }}>
                      <Typography variant="body2" sx={{
                        color: 'var(--color-slate-500)',
                        fontSize: 'var(--font-sm)',
                        lineHeight: 1.6
                      }}>
                        {selectedProgram.workflowDesc}
                      </Typography>
                    </Box>

                    <Box sx={{ flexShrink: 0 }} />



                  </Box>

                  {/* Right Content Area */}
                  <Box sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center', // Center inner container
                    py: { xs: 3, md: 4 },
                    px: { xs: 3, md: 8 },
                    background: "var(--popover-bg)",
                    backdropFilter: "var(--popover-blur)",
                    WebkitBackdropFilter: "var(--popover-blur)",
                    border: "var(--border-thin) solid var(--card-border)",
                    borderRadius: 'var(--radius-lg)',
                    m: { xs: 0, md: 1 }, // Small margin so it floats slightly like Google Drive
                    mr: { xs: 0, md: 2 },
                    position: 'relative' // Added for absolute positioning of save indicator
                  }}>
                    {/* Icon Buttons & Auto-Save Indicator - Standard Top Right Placement */}
                    <Box sx={{ position: 'absolute', top: { xs: 16, md: 24 }, right: { xs: 16, md: 32 }, display: 'flex', gap: 1, alignItems: 'center', zIndex: 'var(--z-sticky)' }}>
                      {appId && activeStep !== steps.length && (
                        <AutoSaveIndicator status={autoSaveStatus} />
                      )}
                      <CustomTooltip title="Delete">
                        <IconButton
                          onClick={handleDiscardApplication}
                          disabled={savingProgress}
                          disableRipple
                          sx={{ color: "var(--color-error)", "&:hover": { bgcolor: "transparent" } }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </CustomTooltip>
                      <CustomTooltip title="Clear">
                        <IconButton
                          onClick={() => window.location.reload()}
                          disabled={savingProgress}
                          disableRipple
                          sx={{ color: "var(--color-slate-500)", "&:hover": { bgcolor: "transparent" } }}
                        >
                          <BroomIcon />
                        </IconButton>
                      </CustomTooltip>
                    </Box>

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
                              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                              color: 'var(--color-white)',
                              px: 4, py: 1.5,
                              textTransform: 'none',
                              fontWeight: 'var(--font-semibold)',
                              transition: 'all var(--transition-base)'
                            }}
                          >
                            Return to Institute
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                          {activeStep === 0 && (
                            <Typography variant="h6" sx={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--font-xl)', color: 'var(--color-slate-900)', mb: 2, flexShrink: 0 }}>
                              Basic Applicant Details
                            </Typography>
                          )}
                          <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: { md: 2 } }}>


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

                          {application?.status !== 'pending_review' && application?.status !== 'pending_final_review' && (
                            <Box
                              sx={{
                                mt: 2,
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                justifyContent: "flex-end",
                                alignItems: { xs: "stretch", sm: "center" },
                                gap: { xs: 1.5, sm: 2 },
                              }}
                            >
                              <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 }, flexWrap: { xs: "wrap", sm: "nowrap" }, width: { xs: "var(--size-full)", sm: "auto" } }}>
                                {activeStep > 0 && (
                                  <TarangButton
                                    variant="outlined"
                                    onClick={handleBack}
                                    disabled={savingProgress}
                                    sx={{
                                      flex: { xs: "1 1 calc(50% - 6px)", sm: "0 0 auto" },
                                      minWidth: { xs: 0, sm: "120px" },
                                      height: { xs: "44px", sm: "48px" },
                                      fontSize: { xs: 'var(--font-xs)', sm: 'var(--font-sm)' },
                                      order: { xs: 1, sm: 0 },
                                    }}
                                  >
                                    Back
                                  </TarangButton>
                                )}
                                {(!['pending_final_review', 'approved', 'enrolled'].includes(application?.status) || activeStep < steps.length - 1) && (
                                  <TarangButton
                                    variant="gradient"
                                    onClick={handleNext}
                                    disabled={savingProgress || activeUploads > 0}
                                    loading={savingProgress}
                                    sx={{
                                      flex: { xs: "0 0 100%", sm: "0 0 auto" },
                                      minWidth: { xs: 0, sm: "140px" },
                                      height: { xs: "44px", sm: "48px" },
                                      fontSize: { xs: 'var(--font-sm)', sm: 'var(--font-base)' },
                                      order: { xs: 0, sm: 0 },
                                    }}
                                  >
                                    {['pending_final_review', 'approved', 'enrolled'].includes(application?.status) ? 'Next' :
                                      (activeStep === steps.length - 1 ? 'Finish' : 'Submit')}
                                  </TarangButton>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              )}
            </Box>
          </Container>
        </Box>
      </React.Suspense>
    </ErrorBoundary>
  );
}
