"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  TextField,
  IconButton,
  Paper,
  Menu,
  MenuItem,
  InputBase,
  GlobalStyles,
  Tabs,
  Tab,
  Chip,
  Select,
  FormControl,
  FormControlLabel,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { motion, Reorder, useDragControls } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import { CustomAccordion, CustomAccordionSummary, CustomAccordionDetails } from "../../../components/common/Accordion";
import ViewListIcon from '@mui/icons-material/ViewList';
import CustomCheckbox from "../../../components/common/Checkbox";
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import { DropdownListPopup } from "../../../components/common/DropdownListPopup";
import TarangButton from "../../../components/common/TarangButton";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import VideoCameraFrontOutlinedIcon from "@mui/icons-material/VideoCameraFrontOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { BroomIcon } from "../../../components/icons/BroomIcon";
import { CustomTooltip } from "../../../components/common/Tooltip";
import RichQuestionEditor from "../../../components/common/RichQuestionEditor";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import dayjs from "dayjs";
import { useTranslation } from "../../../hooks/useTranslation";
import { useAccessibility } from "../../../contexts/AccessibilityContext";
import { sortLocationsByDistance } from "../../../lib/geoNormalize";
import useScrollLock from "../../../hooks/useScrollLock";
import { apiClient } from "../../../lib/apiClient";
import { useProfile } from "../../../hooks/useProfile";
import { useAppRouter } from '../../../hooks/useAppRouter';
import { FormLoadingProvider } from '../../../contexts/FormLoadingContext';
import TimePicker, { CustomTimePicker } from "../../../components/common/TimePicker";
import { CustomFloatingInput, CustomFloatingSelect, CustomFloatingFileInput, CustomFloatingSearchableSelect } from "../../../components/common/FloatingFields";
import admissionConfig from "../../../data/admissionConfig.json";
import AutoSaveIndicator from "../../../components/common/AutoSaveIndicator";
import gazetteer from "../../../data/formatted/gazetteer.json";

import { globalDatePickerSlotProps } from "../../../styles/datePickerConfig";

const MOCK_QUIZZES = [
  { id: "q1", name: "General Knowledge 2026", size: "1.2 MB" },
  { id: "q2", name: "Mathematics Entrance Test", size: "2.5 MB" },
  { id: "q3", name: "Logical Reasoning Quiz", size: "800 KB" },
  { id: "q4", name: "English Proficiency Exam", size: "1.5 MB" },
];

const roundToFive = (d) => {
  const m = d.minute();
  return d.minute(Math.round(m / 5) * 5).second(0);
};

export default function AdmissionModal({ open, onClose, editData }) {
  const { t, language } = useTranslation();
  const { userLocation } = useAccessibility();
  const confirm = useConfirm();
  const { showToast } = useToast();

  const currencyOptions = React.useMemo(() => {
    const uLat = userLocation?.lat || 20.5937;
    const uLon = userLocation?.lon || 78.9629;
    const sortedCountries = sortLocationsByDistance(gazetteer.Countries, uLat, uLon, 'countries');
    return Array.from(
      new Set(sortedCountries.map((c) => c.currency.split(" ")[0]))
    ).filter(Boolean);
  }, [userLocation]);

  const [activeStep, setActiveStep] = useState(0);
  const [formTitle, setWorkflowTitle] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [formDesc, setWorkflowDesc] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [maxCandidates, setMaxCandidates] = useState("");
  const [eligibility, setEligibility] = useState([""]);
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const { profile } = useProfile();
  const router = useAppRouter();
  const [draftId, setDraftId] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState("idle");
  const [errors, setErrors] = useState({});

  useScrollLock(open);

  const [stages, setStages] = useState([]);
  const [activeStageTab, setActiveStageTab] = useState(0);

  const getTranslatedTitle = (title, type) => {
    const prefix = t("admissionBuilder.stagePrefix") || "Stage";
    const typeStr = type === "document" ? (t("admissionBuilder.stageTypeDoc") || "Applicant Details")
      : type === "quiz" ? (t("admissionBuilder.stageTypeQuiz") || "Quiz")
        : type === "interview" ? (t("admissionBuilder.stageTypeInt") || "Interview")
          : (t("admissionBuilder.stageTypePay") || "Payment");

    // Match any existing stage title like "Stage 1: Applicant Details" or "Stage 1: PI"
    const match = (title || "").match(/(?:Stage|चरण)\s*(\d+):?/i);
    if (match) {
      return `${prefix} ${match[1]}: ${typeStr}`;
    }
    return title || `${prefix} 1: ${typeStr}`;
  };

  const parseEligibility = (val) => {
    if (!val) return [""];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return [val];
      }
    }
    return [""];
  };

  React.useEffect(() => {
    let isMounted = true;
    if (open && profile?.username && isMounted) {
      const recovered =
        typeof window !== "undefined"
          ? sessionStorage.getItem("admissionBuilderRecovery")
          : null;
      if (recovered) {
        try {
          const { draftId: rId, draftData: parsed } = JSON.parse(recovered);
          setDraftId(rId);
          setWorkflowTitle(parsed.formTitle || "");
          setAcademicYear(parsed.academicYear || "");
          setWorkflowDesc(parsed.formDesc || "");
          setPublishDate(parsed.publishDate || "");
          setExpiryDate(parsed.expiryDate || "");
          setMaxCandidates(parsed.maxCandidates || "");
          setEligibility(parseEligibility(parsed.eligibility));
          setDuration(parsed.duration || "");
          setStages((parsed.stages || []).map(s => ({
            ...s,
            id: s.id || `${Date.now()}-${Math.random()}`,
            title: getTranslatedTitle(s.title, s.type || "document")
          })));
          setActiveStep(parsed.activeStep || 0);
        } catch (e) { }
      } else if (editData && editData.isDraft) {
        setDraftId(editData.id);
        const parsed = editData.draftObj
          ? JSON.parse(editData.draftObj.draft_data)
          : editData.rawDraft;
        if (parsed) {
          setWorkflowTitle(parsed.formTitle || "");
          setAcademicYear(parsed.academicYear || "");
          setWorkflowDesc(parsed.formDesc || "");
          setPublishDate(parsed.publishDate || "");
          setExpiryDate(parsed.expiryDate || "");
          setMaxCandidates(parsed.maxCandidates || "");
          setEligibility(parseEligibility(parsed.eligibility || editData.eligibility));
          setDuration(parsed.duration || editData.duration || "");
          setStages((parsed.stages || []).map(s => ({
            ...s,
            id: s.id || `${Date.now()}-${Math.random()}`,
            title: getTranslatedTitle(s.title, s.type || "document")
          })));
          setActiveStep(parsed.activeStep || 0);
        }
      } else if (editData && !editData.isDraft) {
        setDraftId(null);
        setWorkflowTitle(editData.title || "");
        setAcademicYear(editData.academic_year || "");
        setWorkflowDesc(editData.form_desc || "");
        if (editData.stages && editData.stages.length > 0) {
          console.log("[AdmissionModal] Loading live stages:", editData.stages);
          setStages(
            editData.stages.map((s) => {
              console.log("[AdmissionModal] Mapping stage:", s.title, "selected_fields:", s.selected_fields, "selectedFields:", s.selectedFields);
              return {
                id: s.id || `${Date.now()}-${Math.random()}`,
                title: getTranslatedTitle(s.title, s.type || "document"),
                type: s.type || "document",
                // map snake_case API fields → camelCase state
                startDate: s.startDate || s.start_date || "",
                endDate: s.endDate || s.end_date || "",
                startDateOnly: s.startDateOnly || s.start_date_only || "",
                startTimeOnly: s.startTimeOnly || s.start_time_only || "",
                endDateOnly: s.endDateOnly || s.end_date_only || "",
                endTimeOnly: s.endTimeOnly || s.end_time_only || "",
                requirements: s.requirements || [],
                selectedFields: s.selected_fields || s.selectedFields || [],
                academicRecordsConfig: s.academic_records_config || s.academicRecordsConfig || [],
                paymentDetails: s.paymentDetails || s.payment_details || {},
                quizAttachments: s.quizAttachments || s.quiz_attachments || [],
                interviewDetails: s.interviewDetails || s.interview_details || {},
              };
            })
          );
        }
        setPublishDate(editData.publish_date || "");
        setExpiryDate(editData.last_date || "");
        setMaxCandidates(editData.seats || "");
        setEligibility(parseEligibility(editData.eligibility));
        setDuration(editData.duration || "");
        setActiveStep(0);
      } else {
        setDraftId(null);
        setWorkflowTitle("");
        setAcademicYear("");
        setWorkflowDesc("");
        setPublishDate("");
        setExpiryDate("");
        setMaxCandidates("");
        setEligibility([""]);
        setDuration("");
        setStages([]);
        setActiveStep(0);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [open, editData, profile]);

  const isInitialLoad = React.useRef(true);
  const isSubmitting = React.useRef(false);

  React.useEffect(() => {
    if (open) {
      // Small timeout to allow state to settle after load
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 500);
    } else {
      isInitialLoad.current = true;
    }
  }, [open]);

  React.useEffect(() => {
    if (open && !isInitialLoad.current && profile?.username) {
      const isTitleFilled = formTitle && formTitle.trim() !== "";
      const isDescFilled = formDesc && formDesc.trim() !== "";
      const isCandidatesFilled =
        maxCandidates && maxCandidates.toString().trim() !== "";
      const hasStages = stages && stages.length > 0;

      if (
        !draftId &&
        !isTitleFilled &&
        !isDescFilled &&
        !isCandidatesFilled &&
        !hasStages
      ) {
        setAutoSaveStatus('idle');
        return;
      }

      const draftData = {
        formTitle,
        academicYear,
        formDesc,
        publishDate,
        expiryDate,
        maxCandidates,
        eligibility,
        duration,
        stages,
        activeStep,
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "admissionBuilderRecovery",
          JSON.stringify({
            draftId,
            draftData,
          }),
        );
      }

      if (!isInitialLoad.current) {
        setAutoSaveStatus('saving');
      }

      const payload = {
        institute_id: profile.id,
        program_id:
          (editData && !editData.isDraft)
            ? (editData.id || editData.Id || editData._id)
            : (editData?.target_program_id || editData?.targetProgramId || ""),
        draft_data: JSON.stringify(draftData),
      };
      if (draftId) {
        payload.draft_id = draftId;
      }

      const saveDraftTimeout = setTimeout(() => {
        if (!isInitialLoad.current) {
          setAutoSaveStatus('saving');
        }
        apiClient
          .post("/admissions/drafts", payload)
          .then((res) => {
            if (res.data?.draft?.id && !draftId) {
              setDraftId(res.data.draft.id);
            }
            if (!isInitialLoad.current) {
              setAutoSaveStatus('saved');
            }
          })
          .catch((err) => {
            console.error("Failed to auto-save draft to DB", err);
            if (!isInitialLoad.current) {
              setAutoSaveStatus('error');
            }
          });
      }, 1000); // 1s debounce

      return () => clearTimeout(saveDraftTimeout);
    }
  }, [
    formTitle,
    academicYear,
    formDesc,
    publishDate,
    expiryDate,
    maxCandidates,
    JSON.stringify(eligibility),
    JSON.stringify(duration),
    JSON.stringify(stages),
    activeStep,
    open,
    JSON.stringify(editData),
    profile?.id,
    draftId,
  ]);

  // Watchdog: auto-fix any criss-cross stage timeline state the moment it appears
  React.useEffect(() => {
    let needsUpdate = false;
    const corrected = stages.map((stage) => {
      let s = { ...stage };
      // If same day and endTime <= startTime, clear endTime
      if (
        s.startDateOnly &&
        s.endDateOnly &&
        s.startDateOnly === s.endDateOnly &&
        s.startTimeOnly &&
        s.endTimeOnly &&
        s.endTimeOnly <= s.startTimeOnly
      ) {
        needsUpdate = true;
        return { ...s, endTimeOnly: "", endDate: "" };
      }
      // If endDate is strictly before startDate, clear endDate and endTime
      if (s.startDateOnly && s.endDateOnly && s.endDateOnly < s.startDateOnly) {
        needsUpdate = true;
        return { ...s, endDateOnly: "", endDate: "", endTimeOnly: "" };
      }
      return s;
    });
    if (needsUpdate) setStages(corrected);
  }, [stages]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [quizMenuAnchorEl, setQuizMenuAnchorEl] = useState(null);
  const [quizMenuAnchorPos, setQuizMenuAnchorPos] = useState(null);
  const [activeQuizStageId, setActiveQuizStageId] = useState(null);
  const [quizSearchQuery, setQuizSearchQuery] = useState("");
  const openMenu = Boolean(anchorEl);

  const quizDropdownRef = React.useRef(null);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      const inAnchor = quizMenuAnchorEl && quizMenuAnchorEl.contains(event.target);
      const inDropdown = quizDropdownRef.current && quizDropdownRef.current.contains(event.target);
      if (!inAnchor && !inDropdown) {
        setQuizMenuAnchorEl(null);
        setQuizMenuAnchorPos(null);
      }
    };
    if (quizMenuAnchorEl || quizMenuAnchorPos) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [quizMenuAnchorEl, quizMenuAnchorPos]);

  const hasEnteredData =
    formTitle.trim().length > 0 ||
    formDesc.trim().length > 0 ||
    eligibility.some(e => e.trim().length > 0) ||
    duration.trim().length > 0 ||
    maxCandidates.toString().trim().length > 0 ||
    (stages && stages.length > 0);
  const THEME_BORDER = "var(--card-border)";

  const themeInputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 'var(--radius-md)',
      "&.Mui-disabled": {
        backgroundColor: "var(--color-slate-50)",
      },
      "&.Mui-disabled fieldset": {
        borderColor: THEME_BORDER,
      },
      "& input, & textarea": {
        color: "var(--color-slate-900)",
        fontSize: 'var(--font-sm)',
      },
    },
  };

  const themePickerSx = {
    ...themeInputSx,
    "& .MuiOutlinedInput-root": {
      ...themeInputSx["& .MuiOutlinedInput-root"],
      cursor: "text",
      height: "46px",
      "& .MuiOutlinedInput-input": { padding: "0px 14px" },
      "& .MuiInputAdornment-root": { marginLeft: 0 },
    },
    "& .MuiInputLabel-root": { top: "-4px" },
    "& .MuiInputLabel-shrink": { top: "0px" },
    "& .MuiInputAdornment-root .MuiIconButton-root svg": {
      fontSize: 'var(--font-sm)',
    },
    "& .MuiInputAdornment-root .MuiIconButton-root": {
      padding: "4px",
      marginRight: "4px",
    },
  };

  const themeBorderSx = `var(--border-thin) solid ${THEME_BORDER}`;

  const handleAddClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const addStage = (type) => {
    handleMenuClose();
    const prefix = t("admissionBuilder.stagePrefix") || "Stage";
    const typeName = type === "document"
      ? t("admissionBuilder.stageTypeDoc") || "Applicant Details"
      : type === "quiz"
        ? t("admissionBuilder.stageTypeQuiz") || "Quiz"
        : type === "interview"
          ? t("admissionBuilder.stageTypeInt") || "Interview"
          : t("admissionBuilder.stageTypePay") || "Payment";

    const newStage = {
      id: Date.now(),
      title: `${prefix} ${stages.length + 1}: ${typeName}`,
      type: type,
      startDate: "",
      startDateOnly: "",
      startTimeOnly: "",
      endDate: "",
      endDateOnly: "",
      endTimeOnly: "",
      requirements: type === "document" ? [] : undefined,
      quizAttachments: type === "quiz" ? [] : undefined,
      interviewDetails: type === "interview" ? { meetingLink: "", passcode: "" } : undefined,
      paymentDetails:
        type === "payment"
          ? { amount: "", currency: "", instructions: "" }
          : undefined,
    };
    const newStages = [...stages, newStage];
    setStages(newStages);
    setActiveStageTab(newStages.length - 1); // auto-switch to new tab
  };

  const deleteStage = (id) => {
    const remainingStages = stages.filter((s) => s.id !== id);
    const prefix = t("admissionBuilder.stagePrefix") || "Stage";

    // We need to match whatever the prefix is in the current language, or fallback to english "Stage" just in case.
    // A safe regex that matches either the localized prefix or "Stage"
    const regex = new RegExp(`^(${prefix}|Stage) \\d+:`);

    const updatedStages = remainingStages.map((stage, idx) => ({
      ...stage,
      title: stage.title?.replace(regex, `${prefix} ${idx + 1}:`),
    }));
    setStages(updatedStages);
    setActiveStageTab((prev) =>
      Math.max(0, Math.min(prev, updatedStages.length - 1)),
    );
  };

  const handleAttachQuiz = (stageId, quiz) => {
    setStages(
      stages.map((s) => {
        if (s.id === stageId) {
          const existing = s.quizAttachments || [];
          if (!existing.find((q) => q.id === quiz.id)) {
            return { ...s, quizAttachments: [...existing, quiz] };
          }
        }
        return s;
      }),
    );
  };

  const handleRemoveQuiz = (stageId, quizId) => {
    setStages(
      stages.map((s) => {
        if (s.id === stageId) {
          return {
            ...s,
            quizAttachments: (s.quizAttachments || []).filter(
              (q) => q.id !== quizId,
            ),
          };
        }
        return s;
      }),
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting.current) return;
    
    const validation = validateForm();
    if (Object.keys(validation.errors).length > 0) {
      setErrors(validation.errors);
      if (validation.firstErrorStep !== -1) {
        setActiveStep(validation.firstErrorStep);
      }
      return;
    }
    setErrors({});

    isSubmitting.current = true;
    setLoading(true);
    try {
      const targetProgramId = (editData && !editData.isDraft) 
        ? (editData.id || editData.Id || editData._id) 
        : (editData?.target_program_id || editData?.targetProgramId || null);

      const totalFees = stages
        .filter(s => s.type === "payment" && s.paymentDetails?.amount)
        .reduce((sum, s) => sum + parseFloat(s.paymentDetails.amount), 0);
      const currency = stages.find(s => s.type === "payment" && s.paymentDetails?.currency)?.paymentDetails.currency || "INR";
      const calculatedFees = totalFees > 0 ? `${totalFees} ${currency}` : "Free";

      const payload = {
        id: targetProgramId || undefined,
        institute_id: profile?.id || "unknown",
        form_title: formTitle,
        academic_year: academicYear,
        form_desc: formDesc,
        image_url: "",
        last_date: expiryDate || "To be announced",
        seats: maxCandidates ? parseInt(maxCandidates) : 0,
        publish_date: publishDate || "",
        eligibility: JSON.stringify(eligibility.filter(e => e.trim())),
        fees: calculatedFees,
        duration: duration || "",
        stages: stages.map((s) => ({
          title: s.title,
          type: s.type,
          start_date: s.startDate || (s.startDateOnly && s.startTimeOnly ? `${s.startDateOnly}T${s.startTimeOnly}` : s.startDateOnly || ""),
          end_date: s.endDate || (s.endDateOnly && s.endTimeOnly ? `${s.endDateOnly}T${s.endTimeOnly}` : s.endDateOnly || ""),
          start_date_only: s.startDateOnly || "",
          start_time_only: s.startTimeOnly || "",
          end_date_only: s.endDateOnly || "",
          end_time_only: s.endTimeOnly || "",
          requirements: [],
          selected_fields: s.type === "document" ? (s.selectedFields || []) : [],
          academic_records_config: s.type === "document" ? (s.academicRecordsConfig || []).map(r => ({ name: r.name })) : [],
          payment_details: s.type === "payment" ? { ...s.paymentDetails, amount: s.paymentDetails?.amount ? parseFloat(s.paymentDetails.amount) : 0 } : undefined,
          quiz_attachments: s.type === "quiz" ? s.quizAttachments : undefined,
          interview_details: s.type === "interview" ? s.interviewDetails : undefined,
        })),
      };

      if (targetProgramId) {
        await apiClient.put(`/admissions/programs/${targetProgramId}`, payload);
        showToast("Admission form updated successfully!", "success");
      } else {
        await apiClient.post("/admissions/programs", payload);
        showToast("Admission form published successfully!", "success");
      }

      // Remove draft from DB on success
      if (profile?.id) {
        if (draftId) {
          apiClient
            .delete(
              `/admissions/drafts?institute_id=${profile.id}&draft_id=${draftId}`,
            )
            .catch(console.error);
        }
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      let errorMsg = error.response?.data?.message || error.response?.data?.error;
      if (!errorMsg) {
        errorMsg = error.response?.status === 500
          ? "Our server encountered a temporary issue. Please try again later."
          : error.message;
      }
      if (typeof errorMsg === 'object') {
        errorMsg = "An unexpected error occurred.";
      }
      showToast("Failed to publish form: " + errorMsg, "error");
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let firstErrorStep = -1;

    // Step 0
    if (!formTitle || !formTitle.trim()) newErrors.formTitle = true;
    if (!academicYear) newErrors.academicYear = true;
    if (!duration || !duration.trim()) newErrors.duration = true;
    if (!formDesc || !formDesc.trim()) newErrors.formDesc = true;
    
    eligibility.forEach((e, i) => {
      if (!e || !e.trim()) newErrors[`eligibility_${i}`] = true;
    });
    if (!eligibility.some(e => e && e.trim() !== "")) newErrors.eligibility = true; // At least one

    if (Object.keys(newErrors).length > 0 && firstErrorStep === -1) firstErrorStep = 0;

    // Step 1
    const step1Errors = {};
    if (!publishDate || !publishDate.includes("T")) step1Errors.publishDate = true;
    if (!expiryDate || !expiryDate.includes("T")) step1Errors.expiryDate = true;
    if (!maxCandidates) step1Errors.maxCandidates = true;
    
    Object.assign(newErrors, step1Errors);
    if (Object.keys(step1Errors).length > 0 && firstErrorStep === -1) firstErrorStep = 1;

    // Step 2
    const step2Errors = {};
    if (stages.length === 0) step2Errors.stages = true;
    stages.forEach((s, i) => {
      if (!s.title.trim()) step2Errors[`stage_${i}_title`] = true;
      if (!s.startDateOnly || !s.startTimeOnly) step2Errors[`stage_${i}_start`] = true;
      if (!s.endDateOnly || !s.endTimeOnly) step2Errors[`stage_${i}_end`] = true;
      
      if (s.type === "document") {
        const hasSelection = (s.selectedFields && s.selectedFields.length > 0) || (s.academicRecordsConfig && s.academicRecordsConfig.length > 0);
        if (!hasSelection) step2Errors[`stage_${i}_doc_selection`] = true;
        if (s.academicRecordsConfig) {
          s.academicRecordsConfig.forEach((r, rIdx) => {
            if (!r.name.trim()) step2Errors[`stage_${i}_doc_rec_${rIdx}`] = true;
          });
        }
      }
      if (s.type === "payment") {
        if (!s.paymentDetails?.amount) step2Errors[`stage_${i}_pay_amount`] = true;
        if (!s.paymentDetails?.currency) step2Errors[`stage_${i}_pay_currency`] = true;
      }
      if (s.type === "quiz") {
        if (!s.quizAttachments || s.quizAttachments.length === 0) step2Errors[`stage_${i}_quiz_attach`] = true;
      }
      if (s.type === "interview") {
        if (!s.interviewDetails?.meetingLink?.trim()) step2Errors[`stage_${i}_int_link`] = true;
        if (!s.interviewDetails?.passcode?.trim()) step2Errors[`stage_${i}_int_pass`] = true;
      }
    });

    Object.assign(newErrors, step2Errors);
    if (Object.keys(step2Errors).length > 0 && firstErrorStep === -1) firstErrorStep = 2;

    return { errors: newErrors, firstErrorStep };
  };

  const handleClear = async () => {
    const isConfirmed = await confirm({
      title: language === 'en' ? 'Clear Form?' : 'फ़ॉर्म साफ़ करें?',
      message: language === 'en'
        ? 'Are you sure you want to clear all form fields? This will reset all your unsaved changes.'
        : 'क्या आप वाकई फ़ॉर्म के सभी फ़ील्ड साफ़ करना चाहते हैं? इससे आपके सभी सहेजे न गए बदलाव मिट जाएंगे।',
      confirmText: language === 'en' ? 'Clear' : 'साफ़ करें',
      cancelText: language === 'en' ? 'Cancel' : 'रद्द करें',
      variant: 'primary'
    });
    if (!isConfirmed) return;
    setWorkflowTitle("");
    setAcademicYear("");
    setEligibility([""]);
    setDuration("");
    setWorkflowDesc("");
    setPublishDate("");
    setExpiryDate("");
    setMaxCandidates("");
    setStages([]);
    setActiveStep(0);
    setActiveStageTab(0);
    showToast(language === 'en' ? 'Form cleared successfully.' : 'फ़ॉर्म सफलतापूर्वक साफ़ कर दिया गया।', 'success');
  };

  const handleDiscard = async () => {
    const isLive = editData && !editData.isDraft && editData.id;
    const isConfirmed = await confirm({
      title: language === 'en' ? 'Delete Program?' : 'प्रोग्राम हटाएं?',
      message: language === 'en' ? 'Are you sure you want to delete this? This action cannot be undone.' : 'क्या आप वाकई इसे हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
      confirmText: language === 'en' ? 'Delete' : 'हटाएं',
      cancelText: language === 'en' ? 'Cancel' : 'रद्द करें',
      variant: 'danger'
    });
    if (!isConfirmed) return;
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setLoading(true);
    try {
      if (editData && !editData.isDraft && editData.id) {
        // Delete live program
        await apiClient.delete(`/admissions/programs/${editData.id}`);
        showToast(language === 'en' ? "Program deleted successfully" : "प्रोग्राम सफलतापूर्वक हटा दिया गया", "success");
      } else if (draftId && profile?.id) {
        // Delete draft from DB if exists
        await apiClient.delete(
          `/admissions/drafts?institute_id=${profile.id}&draft_id=${draftId}`,
        );
        showToast(language === 'en' ? "Draft deleted successfully" : "ड्राफ्ट सफलतापूर्वक हटा दिया गया", "success");
      }
    } catch (e) {
      console.error("Failed to delete on discard", e);
      showToast(language === 'en' ? "Failed to delete. Please try again." : "हटाने में विफल। कृपया पुनः प्रयास करें।", "error");
      isSubmitting.current = false;
      setLoading(false);
      return;
    }

    // Clear sessionStorage recovery
    if (typeof window !== "undefined")
      sessionStorage.removeItem("admissionBuilderRecovery");

    // Explicitly reset all state
    setDraftId(null);
    setWorkflowTitle("");
    setAcademicYear("");
    setEligibility([""]);
    setDuration("");
    setWorkflowDesc("");
    setPublishDate("");
    setExpiryDate("");
    setMaxCandidates("");
    setStages([]);
    setActiveStep(0);

    onClose();
    isSubmitting.current = false;
    setLoading(false);
  };

  if (!open) return null;

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
          component={motion.div}
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
            border: 'none',
            overflow: "hidden",
            maxHeight: "92vh",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: { xs: 12, sm: 20 },
              right: { xs: 12, sm: 24 },
              display: "flex",
              gap: 1,
              zIndex: 'var(--z-sticky)'
            }}
          >
            <CustomTooltip title={t('admissionBuilder.discardBtn') || 'Discard'}>
              <IconButton
                onClick={handleDiscard}
                disabled={loading}
                disableRipple
                sx={{
                  color: "var(--color-error)",
                  "&:hover": { bgcolor: "transparent" },
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </CustomTooltip>

            <CustomTooltip title={language === 'en' ? 'Clear' : 'साफ़ करें'}>
              <IconButton
                onClick={handleClear}
                disabled={loading}
                disableRipple
                sx={{
                  color: "var(--color-slate-500)",
                  "&:hover": { bgcolor: "transparent" },
                }}
              >
                <BroomIcon />
              </IconButton>
            </CustomTooltip>

            <CustomTooltip title={t('admissionBuilder.cancelBtn') || 'Close'}>
              <IconButton
                onClick={() => {
                  if (autoSaveStatus !== "idle") setAutoSaveStatus("idle");
                  onClose();
                }}
                disableRipple
                sx={{
                  color: "var(--color-slate-500)",
                  "&:hover": { bgcolor: "transparent" },
                }}
              >
                <CloseIcon />
              </IconButton>
            </CustomTooltip>
          </Box>

          <Box
            sx={{
              px: { xs: 3, sm: 8 },
              pt: { xs: 6, sm: 8 },
              pb: 2,
              width: "var(--size-full)",
              boxSizing: "border-box",
              flexShrink: 0,
            }}
          >
            {/* Header */}
            <Box
              sx={{
                mb: 2,
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
                  {t("admissionBuilder.title")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "var(--color-slate-500)", mt: 0.5, fontSize: 'var(--font-base)' }}
                >
                  {t("admissionBuilder.subtitle")}
                </Typography>
              </Box>

              {/* Auto Save Indicator Positioned in Header Right */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AutoSaveIndicator status={autoSaveStatus} />
              </Box>
            </Box>

            {/* Step Indicator Progress Bar */}
            <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.75,
                  cursor: "pointer",
                }}
                onClick={() => setActiveStep(0)}
              >
                <Box
                  sx={{
                    height: 4,
                    borderRadius: 'var(--radius-md)',
                    bgcolor: activeStep >= 0 ? "var(--color-primary)" : "var(--color-slate-200)",
                    transition: "all var(--transition-slow)",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 'var(--font-bold)',
                    color: activeStep === 0 ? "var(--color-primary)" : "var(--color-slate-500)",
                    fontSize: "var(--font-xs)",
                  }}
                >
                  {t("admissionBuilder.step1Label")}
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.75,
                  cursor: "pointer",
                }}
                onClick={() => setActiveStep(1)}
              >
                <Box
                  sx={{
                    height: 4,
                    borderRadius: 'var(--radius-md)',
                    bgcolor: activeStep >= 1 ? "var(--color-primary)" : "var(--color-slate-200)",
                    transition: "all var(--transition-slow)",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 'var(--font-bold)',
                    color: activeStep === 1 ? "var(--color-primary)" : "var(--color-slate-500)",
                    fontSize: "var(--font-xs)",
                  }}
                >
                  {t("admissionBuilder.step2Label")}
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.75,
                  cursor: "pointer",
                }}
                onClick={() => setActiveStep(2)}
              >
                <Box
                  sx={{
                    height: 4,
                    borderRadius: 'var(--radius-md)',
                    bgcolor: activeStep >= 2 ? "var(--color-primary)" : "var(--color-slate-200)",
                    transition: "all var(--transition-slow)",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 'var(--font-bold)',
                    color: activeStep === 2 ? "var(--color-primary)" : "var(--color-slate-500)",
                    fontSize: "var(--font-xs)",
                  }}
                >
                  {t("admissionBuilder.step3Label")}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, px: { xs: 3, sm: 8 }, py: 3, display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                width: "var(--size-full)",
              }}
            >
              {/* STEP 1: FORM DETAILS */}
              {activeStep === 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    width: "var(--size-full)",
                  }}
                >
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: "flex-start" }}>
                    <CustomFloatingInput
                      label={t("admissionBuilder.titleField")}
                      required
                      value={formTitle}
                      error={!!errors.formTitle}
                      onChange={(e) => setWorkflowTitle(e.target.value)}
                    />
                    <CustomFloatingSelect
                      label={t("admissionBuilder.academicYear") || "Academic Year"}
                      required
                      value={academicYear}
                      error={!!errors.academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      options={(() => {
                        const currentYear = new Date().getFullYear();
                        return Array.from({ length: 6 }, (_, i) => {
                          const y = currentYear + i - 1;
                          const label = `${y}-${String(y + 1).slice(2)}`;
                          return { value: label, label };
                        });
                      })()}
                    />
                  </Box>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: "flex-start", width: "var(--size-full)" }}>
                    <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <CustomFloatingSelect
                        label={t("admissionBuilder.duration") || "Duration"}
                        required
                        value={duration}
                        error={!!errors.duration}
                        onChange={(e) => setDuration(e.target.value)}
                        options={admissionConfig.durationOptions}
                      />
                      <CustomFloatingInput
                        label={t("admissionBuilder.descField")}
                        required
                        value={formDesc}
                        error={!!errors.formDesc}
                        onChange={(e) => setWorkflowDesc(e.target.value)}
                        multiline
                        rows={4}
                      />
                    </Box>
                    <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', p: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-700)', mb: 0.5 }}>
                        {t("admissionBuilder.eligibility") || "Eligibility"}&nbsp;
                        <Box component="span" sx={{ color: 'var(--color-error)' }}>*</Box>
                      </Typography>
                      {eligibility.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                          <CustomFloatingInput
                            label={(t("admissionBuilder.eligibility") || "Eligibility") + (eligibility.length > 1 ? ` ${index + 1}` : "")}
                            value={item}
                            error={!!errors[`eligibility_${index}`]}
                            onChange={(e) => {
                              const newEligibility = [...eligibility];
                              newEligibility[index] = e.target.value;
                              setEligibility(newEligibility);
                            }}
                          />
                          {eligibility.length > 1 && (
                            <IconButton
                              size="small"
                              sx={{ color: 'var(--color-error)', mt: 1 }}
                              onClick={() => setEligibility(eligibility.filter((_, i) => i !== index))}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      ))}
                      <Button size="small" onClick={() => setEligibility([...eligibility, ""])} sx={{ alignSelf: 'flex-start', textTransform: 'none', color: 'var(--color-primary)' }}>
                        + Add Point
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* STEP 2: SCHEDULE & LIMITS */}
              {activeStep === 1 && (
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  localeText={{
                    fieldHoursPlaceholder: () => "HH",
                    fieldMinutesPlaceholder: () => "MM",
                    fieldMeridiemPlaceholder: () => "AM/PM",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      width: "var(--size-full)",
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Box sx={{ flex: 1 }}>
                          <DesktopDatePicker
                            label={t("admissionBuilder.publishDate")}
                            showToolbar
                            toolbarFormat="DD MMMM YYYY"
                            format="DD/MM/YYYY"
                            disabled={Boolean(editData && !editData.isDraft && editData.publish_date && dayjs(editData.publish_date).isBefore(dayjs()))}
                            slots={{ textField: CustomFloatingInput }}
                            slotProps={{ ...globalDatePickerSlotProps, textField: { required: true, error: !!errors[`stage_${activeStageTab}_start`] } }}
                            sx={{ width: "var(--size-full)", ...themePickerSx }}
                            minDate={publishDate && dayjs(publishDate).isBefore(dayjs(), "day") ? dayjs(publishDate) : dayjs()}
                            maxDate={expiryDate ? dayjs(expiryDate) : undefined}
                            value={publishDate ? dayjs(publishDate) : null}
                            error={!!errors.publishDate}
                            onChange={(newDate) => {
                              if (!newDate) return setPublishDate("");
                              const hasTime = publishDate && publishDate.includes("T");
                              const timePart = hasTime ? publishDate.split("T")[1] : "";
                              const newD = newDate.format("YYYY-MM-DD");
                              const newPublishFull = hasTime ? `${newD}T${timePart}` : newD;
                              setPublishDate(newPublishFull);
                              if (expiryDate && dayjs(newPublishFull).isAfter(dayjs(expiryDate))) {
                                setExpiryDate(expiryDate.split("T")[0]);
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <CustomTimePicker
                            label={t("admissionBuilder.publishTime")}
                            disabled={!publishDate || Boolean(editData && !editData.isDraft && editData.publish_date && dayjs(editData.publish_date).isBefore(dayjs()))}
                            minuteStep={5}
                            required
                            sx={{ width: "var(--size-full)", ...themePickerSx }}
                            maxTime={
                              publishDate && expiryDate && expiryDate.includes("T") && dayjs(publishDate).isSame(dayjs(expiryDate), "day")
                                ? dayjs(expiryDate)
                                : undefined
                            }
                            value={publishDate && publishDate.includes("T") ? dayjs(publishDate) : null}
                            onChange={(newTime) => {
                              if (!newTime) {
                                setPublishDate(publishDate ? publishDate.split("T")[0] : "");
                                return;
                              }
                              const baseDate = publishDate ? publishDate.split("T")[0] : dayjs().format("YYYY-MM-DD");
                              const newPublishFull = `${baseDate}T${newTime.format("HH:mm")}`;
                              setPublishDate(newPublishFull);
                              if (expiryDate && dayjs(newPublishFull).isAfter(dayjs(expiryDate))) {
                                setExpiryDate(expiryDate.split("T")[0]);
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Box>
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Box sx={{ flex: 1 }}>
                          <DesktopDatePicker
                            label={t("admissionBuilder.expiryDate")}
                            showToolbar
                            toolbarFormat="DD MMMM YYYY"
                            format="DD/MM/YYYY"
                            disabled={!publishDate}
                            slots={{ textField: CustomFloatingInput }}
                            slotProps={{ ...globalDatePickerSlotProps, textField: { required: true, error: !!errors[`stage_${activeStageTab}_end`] } }}
                            sx={{ width: "var(--size-full)", ...themePickerSx }}
                            minDate={publishDate ? dayjs(publishDate) : dayjs()}
                            value={expiryDate ? dayjs(expiryDate) : null}
                            error={!!errors.expiryDate}
                            onChange={(newDate) => {
                              if (!newDate) return setExpiryDate("");
                              const hasTime = expiryDate && expiryDate.includes("T");
                              const timePart = hasTime ? expiryDate.split("T")[1] : "";
                              const newD = newDate.format("YYYY-MM-DD");
                              let newExpiryFull = hasTime ? `${newD}T${timePart}` : newD;

                              if (hasTime && publishDate && publishDate.includes("T")) {
                                if (dayjs(newExpiryFull).isBefore(dayjs(publishDate))) {
                                  newExpiryFull = newD; // wipe time if invalid
                                }
                              }
                              setExpiryDate(newExpiryFull);
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <CustomTimePicker
                            label={t("admissionBuilder.expiryTime")}
                            disabled={!expiryDate}
                            minuteStep={5}
                            required
                            sx={{ width: "var(--size-full)", ...themePickerSx }}
                            minTime={
                              publishDate && publishDate.includes("T") && expiryDate && dayjs(publishDate).isSame(dayjs(expiryDate), "day")
                                ? dayjs(publishDate)
                                : undefined
                            }
                            value={expiryDate && expiryDate.includes("T") ? dayjs(expiryDate) : null}
                            onChange={(newTime) => {
                              if (!newTime) {
                                setExpiryDate(expiryDate ? expiryDate.split("T")[0] : "");
                                return;
                              }
                              if (publishDate && publishDate.includes("T") && expiryDate && dayjs(publishDate).isSame(dayjs(expiryDate), "day")) {
                                const eTime = newTime.format("HH:mm");
                                const pTime = publishDate.split("T")[1];
                                if (eTime < pTime) {
                                  setExpiryDate(expiryDate.split("T")[0]);
                                  return;
                                }
                              }
                              const baseDate = expiryDate ? expiryDate.split("T")[0] : dayjs().format("YYYY-MM-DD");
                              setExpiryDate(`${baseDate}T${newTime.format("HH:mm")}`);
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Box>
                      <CustomFloatingInput
                        label={t("admissionBuilder.seatsAvailable")}
                        type="number"
                        required
                        value={maxCandidates}
                        error={!!errors.maxCandidates}
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-", ".", ","].includes(e.key))
                            e.preventDefault();
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setMaxCandidates(val);
                        }}
                      />
                    </Box>
                  </Box>
                </LocalizationProvider>
              )}

              {/* STEP 3: ADMISSION STAGES */}
              {activeStep === 2 && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    width: "var(--size-full)",
                  }}
                >
                  {/* Header row */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'var(--font-bold)', color: "var(--color-slate-900)", fontSize: 'var(--font-lg)' }}
                    >
                      {t("admissionBuilder.stagesHeading")}
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      onClick={handleAddClick}
                      size="small"
                      sx={{
                        textTransform: "none",
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 'var(--font-bold)',
                        borderColor: "var(--color-primary)",
                        color: "var(--color-primary)",
                        fontSize: 'var(--font-sm)',
                        py: 0.5,
                        "&:hover": {
                          borderColor: "#004494",
                          backgroundColor: "rgba(0, 86, 179, 0.04)",
                        },
                      }}
                    >
                      {t("admissionBuilder.addStage")}
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={openMenu}
                      onClose={handleMenuClose}
                      PaperProps={{
                        sx: {
                          borderRadius: 'var(--radius-lg)',
                          mt: 0.5,
                          border: themeBorderSx,
                          backgroundColor: "var(--card-bg)",
                          backdropFilter: "var(--card-blur)",
                          minWidth: "180px",
                          "& .MuiList-root": {
                            py: 0.5,
                          },
                          "& .MuiMenuItem-root": {
                            gap: 1,
                            px: 1.5,
                            py: 0.75,
                            fontWeight: 'var(--font-medium)',
                            color: "var(--color-slate-900)",
                            fontSize: 'var(--font-xs)',
                            transition: "all var(--transition-base)",
                            "&:hover": {
                              backgroundColor: "rgba(0, 86, 179, 0.06)",
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem
                        disabled={stages.some((s) => s.type === "document")}
                        onClick={() => addStage("document")}
                      >
                        <FileUploadOutlinedIcon
                          sx={{
                            color: stages.some((s) => s.type === "document")
                              ? "text.disabled"
                              : "var(--color-primary)",
                            fontSize: 'var(--font-lg)',
                          }}
                        />
                        {t("admissionBuilder.menuDocRequest") || "Applicant Details"}
                      </MenuItem>
                      <MenuItem
                        disabled={stages.some((s) => s.type === "quiz")}
                        onClick={() => addStage("quiz")}
                      >
                        <QuizOutlinedIcon
                          sx={{
                            color: stages.some((s) => s.type === "quiz")
                              ? "text.disabled"
                              : "var(--color-primary)",
                            fontSize: 'var(--font-lg)',
                          }}
                        />
                        {t("admissionBuilder.menuCreateQuiz")}
                      </MenuItem>
                      <MenuItem
                        disabled={stages.some((s) => s.type === "interview")}
                        onClick={() => addStage("interview")}
                      >
                        <VideoCameraFrontOutlinedIcon
                          sx={{
                            color: stages.some((s) => s.type === "interview")
                              ? "text.disabled"
                              : "var(--color-primary)",
                            fontSize: 'var(--font-lg)',
                          }}
                        />
                        {t("admissionBuilder.menuScheduleInterview")}
                      </MenuItem>
                      <MenuItem
                        disabled={stages.some((s) => s.type === "payment")}
                        onClick={() => addStage("payment")}
                      >
                        <PaymentOutlinedIcon
                          sx={{
                            color: stages.some((s) => s.type === "payment")
                              ? "text.disabled"
                              : "var(--color-primary)",
                            fontSize: 'var(--font-lg)',
                          }}
                        />
                        {t("admissionBuilder.menuSetupPayment") || "Request Payment"}
                      </MenuItem>
                    </Menu>
                  </Box>

                  {stages.length === 0 ? (
                    <Box
                      sx={{
                        p: 6,
                        textAlign: "center",
                        borderRadius: 'var(--radius-lg)',
                        bgcolor: "var(--card-bg)",
                        backdropFilter: "var(--card-blur)",
                        border: "var(--border-thin) solid var(--card-border)",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "var(--color-slate-500)",
                          fontWeight: 'var(--font-semibold)',
                          fontSize: 'var(--font-lg)',
                        }}
                      >
                        {t("admissionBuilder.noStagesTitle")}
                      </Typography>
                      <Typography sx={{ color: "var(--color-slate-500)", mt: 1 }}>
                        {t("admissionBuilder.noStagesSubtitle")}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      {/* Tab strip */}
                      <Box
                        component={Reorder.Group}
                        axis="x"
                        values={stages}
                        onReorder={(newStages) => {
                          const activeId = stages[activeStageTab]?.id;
                          const updatedStages = newStages.map((stage, idx) => ({
                            ...stage,
                            title: stage.title?.replace(
                              /^Stage \d+:/,
                              `Stage ${idx + 1}:`,
                            ),
                          }));
                          setStages(updatedStages);
                          const newIdx = updatedStages.findIndex(
                            (s) => s.id === activeId,
                          );
                          if (newIdx !== -1) setActiveStageTab(newIdx);
                        }}
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "nowrap",
                          m: 0,
                          mb: 1, // Reduced gap as requested
                          overflowX: "auto",
                          listStyle: "none",
                          p: 0, // Removed padding so width perfectly aligns with the stage below
                          "&::-webkit-scrollbar": { height: "4px" },
                          "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "rgba(0,0,0,0.1)",
                            borderRadius: 'var(--radius-sm)',
                          },
                        }}
                      >
                        {stages.map((stage, idx) => {
                          const StageIcon =
                            stage.type === "document"
                              ? FileUploadOutlinedIcon
                              : stage.type === "quiz"
                                ? QuizOutlinedIcon
                                : stage.type === "interview"
                                  ? VideoCameraFrontOutlinedIcon
                                  : PaymentOutlinedIcon;
                          const isActive = activeStageTab === idx;
                          return (
                            <Reorder.Item
                              key={stage.id}
                              value={stage}
                              style={{ listStyle: "none", flex: 1, minWidth: "160px", display: "flex" }}
                            >
                              <Box
                                onClick={() => setActiveStageTab(idx)}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  px: 2,
                                  py: 1,
                                  height: "48px", // Force exact height for all tabs
                                  flex: 1,
                                  width: "var(--size-full)",
                                  minWidth: 0,
                                  flexShrink: 0,
                                  borderRadius: 'var(--radius-md)',
                                  cursor: "pointer",
                                  border: isActive
                                    ? "var(--border-thin) solid var(--color-primary)"
                                    : "var(--border-thin) solid var(--card-border)",
                                  backgroundColor: isActive
                                    ? "rgba(0,86,179,0.06)"
                                    : "var(--card-bg)",
                                  backdropFilter: "var(--card-blur)",
                                  transition: "background-color 0.18s, border-color 0.18s",
                                  "&:active": { cursor: "grabbing" },
                                  "&:hover": {
                                    borderColor: "var(--color-primary)",
                                    backgroundColor: "rgba(0,86,179,0.04)",
                                  },
                                }}
                              >
                                <DragIndicatorIcon
                                  sx={{
                                    fontSize: 'var(--font-sm)',
                                    color: "var(--color-slate-400)",
                                    flexShrink: 0,
                                    mr: -0.5,
                                  }}
                                />
                                <StageIcon
                                  sx={{
                                    fontSize: 'var(--font-sm)',
                                    color: isActive ? "var(--color-primary)" : "var(--color-slate-500)",
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography
                                  sx={{
                                    flex: 1,
                                    fontSize: 'var(--font-sm)',
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? "var(--color-primary)" : "var(--color-slate-900)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {getTranslatedTitle(stage.title, stage.type || "document")}
                                </Typography>
                              </Box>
                            </Reorder.Item>
                          );
                        })}
                      </Box>

                      {/* Active stage content */}
                      {stages[activeStageTab] &&
                        (() => {
                          const stage = stages[activeStageTab];
                          return (
                            <CustomAccordion
                              key={stage.id}
                              defaultExpanded
                            >
                              {/* Header — AccordionSummary */}
                              <CustomAccordionSummary
                                expandIcon={
                                  <ExpandMoreIcon sx={{ color: "var(--color-primary)" }} />
                                }
                                sx={{
                                  px: { xs: 1.5, sm: 2.25 },
                                  height: "64px",
                                  minHeight: "64px",
                                  "& .MuiAccordionSummary-content": {
                                    alignItems: "center",
                                    gap: 1.5,
                                  },
                                }}
                              >
                                {stage.type === "document" ? (
                                  <FileUploadOutlinedIcon
                                    sx={{
                                      color: "var(--color-primary)",
                                      fontSize: 'var(--font-sm)',
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : stage.type === "quiz" ? (
                                  <QuizOutlinedIcon
                                    sx={{
                                      color: "var(--color-primary)",
                                      fontSize: 'var(--font-sm)',
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : stage.type === "interview" ? (
                                  <VideoCameraFrontOutlinedIcon
                                    sx={{
                                      color: "var(--color-primary)",
                                      fontSize: 'var(--font-sm)',
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : (
                                  <PaymentOutlinedIcon
                                    sx={{
                                      color: "var(--color-primary)",
                                      fontSize: 'var(--font-sm)',
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                                <TextField
                                  value={getTranslatedTitle(stage.title, stage.type || "document")}
                                  error={!!errors[`stage_${activeStageTab}_title`]}
                                  onChange={(e) =>
                                    setStages(
                                      stages.map((s) =>
                                        s.id === stage.id
                                          ? { ...s, title: e.target.value }
                                          : s,
                                      ),
                                    )
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  onFocus={(e) => e.stopPropagation()}
                                  placeholder={t(
                                    "admissionBuilder.stageTitlePlaceholder",
                                  )}
                                  variant="standard"
                                  InputProps={{ disableUnderline: true }}
                                  sx={{
                                    flex: 1,
                                    input: {
                                      fontWeight: 'var(--font-bold)',
                                      color: "var(--color-slate-900)",
                                      fontSize: 'var(--font-sm)',
                                      py: 0.5,
                                    },
                                    "& .MuiInputBase-input": { p: 0 },
                                  }}
                                />
                                <IconButton
                                  component="div"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteStage(stage.id);
                                  }}
                                  sx={{ color: "var(--color-error)" }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </CustomAccordionSummary>

                              {/* Content — AccordionDetails */}
                              <CustomAccordionDetails
                                sx={{
                                  pt: 2,
                                  pb: 3,
                                  pl: { xs: 2, sm: "46px" },
                                  pr: 2,
                                  background: "transparent",
                                  borderTop: "var(--border-thin) solid var(--card-border)",
                                  maxHeight: "calc(92vh - 534px)",
                                  overflowY: "auto",
                                  "&::-webkit-scrollbar": { width: "6px" },
                                  "&::-webkit-scrollbar-thumb": {
                                    backgroundColor: "rgba(0,0,0,0.15)",
                                    borderRadius: 'var(--radius-sm)',
                                  },
                                }}
                              >
                                {/* Stage Timeline Block */}
                                {(() => {
                                  const combinedStart = stage.startDate || (stage.startDateOnly && stage.startTimeOnly ? `${stage.startDateOnly}T${stage.startTimeOnly}` : "");
                                  const isStageStarted = Boolean(editData && !editData.isDraft && combinedStart && dayjs(combinedStart).isBefore(dayjs()));
                                  return (
                                    <LocalizationProvider
                                      dateAdapter={AdapterDayjs}
                                      localeText={{
                                        fieldHoursPlaceholder: () => "HH",
                                        fieldMinutesPlaceholder: () => "MM",
                                        fieldMeridiemPlaceholder: () => "AM/PM",
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          mb: 2,
                                          p: 2,
                                          bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)",
                                          borderRadius: 'var(--radius-lg)',
                                          border: themeBorderSx,
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            fontWeight: 'var(--font-semibold)',
                                            color: "var(--color-slate-900)",
                                            fontSize: 'var(--font-sm)',
                                            mb: 2,
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          {t("admissionBuilder.timeline")}
                                        </Typography>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 1.5 }}>
                                            <Box sx={{ flex: 1 }}>
                                              <DesktopDatePicker
                                                showToolbar
                                                toolbarFormat="DD MMMM YYYY"
                                                label={t("admissionBuilder.startDate")}
                                                format="DD/MM/YYYY"
                                                slots={{ textField: CustomFloatingInput }}
                                                slotProps={{ ...globalDatePickerSlotProps, textField: { required: true } }}
                                                disabled={isStageStarted}
                                                sx={{
                                                  flex: 1,
                                                  width: "var(--size-full)",
                                                  ...themePickerSx,
                                                }}
                                                minDate={
                                                  publishDate
                                                    ? dayjs(publishDate)
                                                    : undefined
                                                }
                                                maxDate={
                                                  stage.endDateOnly
                                                    ? dayjs(stage.endDateOnly)
                                                    : expiryDate
                                                      ? dayjs(expiryDate)
                                                      : undefined
                                                }
                                                value={stage.startDateOnly ? dayjs(stage.startDateOnly) : null}
                                                onChange={(newDate) => {
                                                  if (!newDate) {
                                                    setStages(stages.map((s) => s.id === stage.id ? { ...s, startDateOnly: "", startDate: "" } : s));
                                                    return;
                                                  }
                                                  const d = newDate.format("YYYY-MM-DD");

                                                  // Hard validation to prevent typing invalid dates
                                                  if (publishDate && dayjs(d).isBefore(dayjs(publishDate), "day")) {
                                                    setStages(stages.map((s) => s.id === stage.id ? { ...s, startDateOnly: "", startDate: "", startTimeOnly: "", endDateOnly: "", endTimeOnly: "", endDate: "" } : s));
                                                    return;
                                                  }
                                                  if (expiryDate && dayjs(d).isAfter(dayjs(expiryDate), "day")) {
                                                    setStages(stages.map((s) => s.id === stage.id ? { ...s, startDateOnly: "", startDate: "", startTimeOnly: "", endDateOnly: "", endTimeOnly: "", endDate: "" } : s));
                                                    return;
                                                  }

                                                  const combined = stage.startTimeOnly ? `${d}T${stage.startTimeOnly}` : "";
                                                  setStages(
                                                    stages.map((s) =>
                                                      s.id === stage.id
                                                        ? {
                                                          ...s,
                                                          startDateOnly: d,
                                                          startDate: combined,
                                                          startTimeOnly: "",
                                                          endDateOnly: "",
                                                          endTimeOnly: "",
                                                          endDate: "",
                                                        }
                                                        : s,
                                                    ),
                                                  );
                                                }}
                                              />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                              <CustomTimePicker
                                                required
                                                label={t("admissionBuilder.startTime")}
                                                disabled={!stage.startDateOnly || isStageStarted}
                                                minuteStep={5}
                                                sx={{ flex: 1, width: "var(--size-full)", ...themePickerSx }}
                                                maxTime={
                                                  stage.startDateOnly && stage.endDateOnly && stage.startDateOnly === stage.endDateOnly && stage.endTimeOnly
                                                    ? dayjs(`2000-01-01T${stage.endTimeOnly}`)
                                                    : undefined
                                                }
                                                value={stage.startTimeOnly ? dayjs(`2000-01-01T${stage.startTimeOnly}`) : null}
                                                onChange={(newTime) => {
                                                  if (!newTime) {
                                                    setStages(stages.map((s) => s.id === stage.id ? { ...s, startTimeOnly: "", startDate: "" } : s));
                                                    return;
                                                  }
                                                  const t = newTime.format("HH:mm");
                                                  const combined = stage.startDateOnly ? `${stage.startDateOnly}T${t}` : "";
                                                  setStages(stages.map((s) => s.id === stage.id ? {
                                                    ...s,
                                                    startTimeOnly: t,
                                                    startDate: combined,
                                                    endDateOnly: "",
                                                    endTimeOnly: "",
                                                    endDate: "",
                                                  } : s));
                                                }}
                                              />
                                            </Box>
                                          </Box>

                                          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 1.5 }}>
                                            <Box sx={{ flex: 1 }}>
                                              <DesktopDatePicker
                                                showToolbar
                                                toolbarFormat="DD MMMM YYYY"
                                                label={t("admissionBuilder.endDate")}
                                                format="DD/MM/YYYY"
                                                slots={{ textField: CustomFloatingInput }}
                                                slotProps={{ ...globalDatePickerSlotProps, textField: { required: true } }}
                                                disabled={!stage.startDateOnly || !stage.startTimeOnly || isStageStarted}
                                                sx={{
                                                  flex: 1,
                                                  width: "var(--size-full)",
                                                  ...themePickerSx,
                                                }}
                                                minDate={
                                                  stage.startDateOnly
                                                    ? dayjs(stage.startDateOnly)
                                                    : publishDate
                                                      ? dayjs(publishDate)
                                                      : undefined
                                                }
                                                maxDate={
                                                  expiryDate
                                                    ? dayjs(expiryDate)
                                                    : undefined
                                                }
                                                value={stage.endDateOnly ? dayjs(stage.endDateOnly) : null}
                                                onChange={(newDate) => {
                                                  if (!newDate) {
                                                    setStages(stages.map((s) => s.id === stage.id ? { ...s, endDateOnly: "", endDate: "" } : s));
                                                    return;
                                                  }
                                                  const d = newDate.format("YYYY-MM-DD");

                                                  // Hard validation to prevent typing invalid dates
                                                  if (stage.startDateOnly && d < stage.startDateOnly) {
                                                    setStages(stages.map((s) => s.id === stage.id ? { ...s, endDateOnly: "", endDate: "", endTimeOnly: "" } : s));
                                                    return;
                                                  }
                                                  if (publishDate && dayjs(d).isBefore(dayjs(publishDate), "day")) {
                                                    setStages(stages.map((s) => s.id === stage.id ? { ...s, endDateOnly: "", endDate: "", endTimeOnly: "" } : s));
                                                    return;
                                                  }
                                                  if (expiryDate && dayjs(d).isAfter(dayjs(expiryDate), "day")) {
                                                    setStages(stages.map((s) => s.id === stage.id ? { ...s, endDateOnly: "", endDate: "", endTimeOnly: "" } : s));
                                                    return;
                                                  }

                                                  const combined = stage.endTimeOnly ? `${d}T${stage.endTimeOnly}` : "";
                                                  setStages(
                                                    stages.map((s) =>
                                                      s.id === stage.id
                                                        ? {
                                                          ...s,
                                                          endDateOnly: d,
                                                          endDate: combined,
                                                          endTimeOnly: "",
                                                        }
                                                        : s,
                                                    ),
                                                  );
                                                }}
                                              />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                              <CustomTimePicker
                                                required
                                                label={t("admissionBuilder.endTime")}
                                                disabled={!stage.endDateOnly || !stage.startDateOnly || !stage.startTimeOnly || isStageStarted}
                                                minuteStep={5}
                                                sx={{ flex: 1, width: "var(--size-full)", ...themePickerSx }}
                                                minTime={
                                                  stage.startDateOnly &&
                                                    stage.endDateOnly &&
                                                    stage.startDateOnly === stage.endDateOnly &&
                                                    stage.startTimeOnly
                                                    ? dayjs(`2000-01-01T${stage.startTimeOnly}`)
                                                    : undefined
                                                }
                                                value={stage.endTimeOnly ? dayjs(`2000-01-01T${stage.endTimeOnly}`) : null}
                                                onChange={(newTime) => {
                                                  if (!newTime) {
                                                    setStages(stages.map((s) => s.id === stage.id ? { ...s, endTimeOnly: "", endDate: "" } : s));
                                                    return;
                                                  }
                                                  const t = newTime.format("HH:mm");

                                                  // Hard validation to prevent selecting AM when disabled or typing invalid time
                                                  if (
                                                    stage.startDateOnly &&
                                                    stage.endDateOnly &&
                                                    stage.startDateOnly === stage.endDateOnly &&
                                                    stage.startTimeOnly
                                                  ) {
                                                    if (t < stage.startTimeOnly) {
                                                      setStages(stages.map((s) => s.id === stage.id ? { ...s, endTimeOnly: "", endDate: "" } : s));
                                                      return; // Force clear
                                                    }
                                                  }

                                                  const combined = stage.endDateOnly ? `${stage.endDateOnly}T${t}` : "";
                                                  setStages(stages.map((s) => s.id === stage.id ? { ...s, endTimeOnly: t, endDate: combined } : s));
                                                }}
                                              />
                                            </Box>
                                          </Box>

                                        </Box>
                                        {((stage.startDate &&
                                          publishDate &&
                                          dayjs(stage.startDate).isBefore(
                                            dayjs(publishDate),
                                            "day",
                                          )) ||
                                          (stage.endDate &&
                                            expiryDate &&
                                            dayjs(stage.endDate).isAfter(
                                              dayjs(expiryDate),
                                              "day",
                                            )) ||
                                          (stage.startDate &&
                                            stage.endDate &&
                                            dayjs(stage.startDate).isAfter(
                                              dayjs(stage.endDate),
                                              "minute",
                                            ))) && (
                                            <Typography
                                              sx={{
                                                color: "var(--color-error)",
                                                fontSize: 'var(--font-xs)',
                                                mt: 1.5,
                                                fontWeight: 'var(--font-medium)',
                                                display: "flex",
                                                alignItems: "center",
                                              }}
                                            >
                                              <span style={{ marginRight: "4px" }}>
                                                ⚠️
                                              </span>
                                              Warning: Selected dates are outside the
                                              allowed global publish/expiry range or
                                              the end date is before the start date.
                                            </Typography>
                                          )}
                                      </Box>
                                    </LocalizationProvider>
                                  );
                                })()}

                                {stage.type === "document" && (() => {
                                  // Proof fields are NOT separate checkboxes.
                                  // Each field with `proofKey` auto-includes its proof when selected.
                                  const ALL_PI_FIELDS = [
                                    {
                                      group: "Personal Information", fields: [
                                        { key: "full_name", label: "Full Name", proofKey: "full_name_proof", required: true },
                                        { key: "email", label: "Email", required: true },
                                        { key: "phone", label: "Phone Number", required: true },
                                        { key: "dob", label: "Date of Birth", proofKey: "dob_proof" },
                                        { key: "gender", label: "Gender", proofKey: "gender_proof" },
                                        { key: "nationality", label: "Nationality", proofKey: "nationality_proof" },
                                        { key: "caste", label: "Caste", proofKey: "caste_proof" },
                                        { key: "subcaste", label: "Subcaste", proofKey: "caste_proof" },
                                        { key: "birth_religion", label: "Birth Religion" },
                                        { key: "current_religion", label: "Current Religion" },
                                        { key: "race_ethnicity", label: "Race / Ethnicity" },
                                        { key: "language", label: "Language" },
                                      ]
                                    },
                                    { group: "Academic Record", isCustomBuilder: true, fields: [] },
                                    {
                                      group: "Family Details", fields: [
                                        { key: "father_name", label: "Father's Name", proofKey: "father_doc_proof" },
                                        { key: "father_contact", label: "Father's Contact Number" },
                                        { key: "mother_name", label: "Mother's Name", proofKey: "mother_doc_proof" },
                                        { key: "mother_contact", label: "Mother's Contact Number" },
                                        { key: "has_sibling", label: "Sibling Details" },
                                      ]
                                    },
                                    {
                                      group: "Family Income", fields: [
                                        { key: "family_income", label: "Annual Family Income", proofKey: "income_proof" },
                                        { key: "individual_family_details", label: "Individual Family Details", proofKey: "individual_family_proof" },
                                      ]
                                    },
                                    {
                                      group: "Permanent Address", fields: [
                                        { key: "perm_country", label: "Country" },
                                        { key: "perm_state", label: "State" },
                                        { key: "perm_district", label: "District" },
                                        { key: "perm_area_type", label: "Area Type" },
                                        { key: "perm_ward", label: "Ward / Sector" },
                                        { key: "perm_house", label: "House No. & Name" },
                                        { key: "perm_landmark", label: "Landmark" },
                                        { key: "perm_street", label: "Street" },
                                        { key: "perm_pincode", label: "Pincode" },
                                        { key: "perm_address", label: "Address Proof", proofKey: "perm_address_proof" },
                                      ]
                                    },
                                    {
                                      group: "Correspondence Address", fields: [
                                        { key: "corr_country", label: "Country" },
                                        { key: "corr_state", label: "State" },
                                        { key: "corr_district", label: "District" },
                                        { key: "corr_area_type", label: "Area Type" },
                                        { key: "corr_ward", label: "Ward / Sector" },
                                        { key: "corr_house", label: "House No. & Name" },
                                        { key: "corr_landmark", label: "Landmark" },
                                        { key: "corr_street", label: "Street" },
                                        { key: "corr_pincode", label: "Pincode" },
                                        { key: "corr_address", label: "Address Proof", proofKey: "corr_address_proof" },
                                      ]
                                    },
                                    {
                                      group: "Criminal & Character Record", fields: [
                                        { key: "criminal_record", label: "Criminal Record", proofKey: "police_verification" },
                                      ]
                                    },
                                  ];

                                  const selected = stage.selectedFields || [];

                                  // When toggling a field, also toggle its proof if it has one
                                  const toggleField = (field) => {
                                    const keys = [field.key, ...(field.proofKey ? [field.proofKey] : [])];
                                    const isOn = selected.includes(field.key);
                                    const next = isOn
                                      ? selected.filter(k => !keys.includes(k))
                                      : [...new Set([...selected, ...keys])];
                                    setStages(stages.map(s => s.id === stage.id ? { ...s, selectedFields: next } : s));
                                  };

                                  const toggleGroup = (groupFields) => {
                                    const keys = groupFields.flatMap(f => [f.key, ...(f.proofKey ? [f.proofKey] : [])]);
                                    const allChecked = groupFields.every(f => selected.includes(f.key));
                                    const next = allChecked
                                      ? selected.filter(k => !keys.includes(k))
                                      : [...new Set([...selected, ...keys])];
                                    setStages(stages.map(s => s.id === stage.id ? { ...s, selectedFields: next } : s));
                                  };

                                  const allVisibleFields = ALL_PI_FIELDS.flatMap(g => g.fields);

                                  // Academic Records config helpers
                                  const acRecords = stage.academicRecordsConfig || [];
                                  const updateAcRecords = (newRecs) =>
                                    setStages(stages.map(s => s.id === stage.id ? { ...s, academicRecordsConfig: newRecs } : s));
                                  const addAcRecord = () => updateAcRecords([...acRecords, { name: '', requireProof: false }]);
                                  const removeAcRecord = (i) => updateAcRecords(acRecords.filter((_, idx) => idx !== i));
                                  const updateAcRecord = (i, field, val) =>
                                    updateAcRecords(acRecords.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

                                  return (
                                    <Box sx={{ p: 0, mt: 0 }}>
                                      <Box
                                        sx={{
                                          border: errors[`stage_${activeStageTab}_doc_selection`] ? '1px solid var(--color-error)' : themeBorderSx,
                                          borderRadius: 'var(--radius-lg)',
                                          bgcolor: errors[`stage_${activeStageTab}_doc_selection`] ? 'rgba(239, 68, 68, 0.05)' : "var(--card-bg)", 
                                          backdropFilter: "var(--card-blur)",
                                          p: 2,
                                          mb: 0,
                                        }}
                                      >
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                                          <Typography sx={{ fontWeight: 'var(--font-semibold)', color: "var(--color-slate-900)", fontSize: 'var(--font-base)', lineHeight: 1.2 }}>
                                            {t("admissionBuilder.applicantDetailsTitle") || "Applicant Details"}
                                          </Typography>
                                          <Typography
                                            onClick={() => {
                                              const allOn = allVisibleFields.every(f => selected.includes(f.key));
                                              const allKeys = allVisibleFields.flatMap(f => [f.key, ...(f.proofKey ? [f.proofKey] : [])]);
                                              setStages(stages.map(s => s.id === stage.id ? { ...s, selectedFields: allOn ? [] : allKeys } : s));
                                            }}
                                            sx={{ fontSize: 'var(--font-xs)', color: "var(--color-primary)", cursor: "pointer", fontWeight: 'var(--font-medium)', "&:hover": { textDecoration: "underline" } }}
                                          >
                                            {allVisibleFields.every(f => selected.includes(f.key)) ? (t("admissionBuilder.deselectAll") || "Deselect All") : (t("admissionBuilder.selectAll") || "Select All")}
                                          </Typography>
                                        </Box>
                                        <Typography sx={{ fontWeight: 'var(--font-regular)', color: "var(--color-slate-500)", mb: 3, fontSize: 'var(--font-base)', lineHeight: 1.4 }}>
                                          {t("admissionBuilder.applicantDetailsSub") || "Select the fields that students must fill during this stage."}
                                        </Typography>
                                        {errors[`stage_${activeStageTab}_doc_selection`] && (
                                          <Typography sx={{ color: 'var(--color-error)', fontSize: 'var(--font-sm)', mb: 2, fontWeight: 'var(--font-medium)' }}>
                                            {language === 'en' ? "Please select at least one field or add an academic record." : "कृपया कम से कम एक फ़ील्ड चुनें या शैक्षणिक रिकॉर्ड जोड़ें।"}
                                          </Typography>
                                        )}

                                        {ALL_PI_FIELDS.map((group) => {
                                          if (group.isCustomBuilder) {
                                            return (
                                              <Box key={group.group} sx={{ mb: 1.5 }}>
                                                <Typography sx={{ fontWeight: 'var(--font-semibold)', color: "var(--color-slate-900)", fontSize: 'var(--font-base)', mb: 0.5 }}>
                                                  {t(`admissionBuilder.groups.${group.group.replace(/[^A-Za-z]/g, '')}`) || group.group}
                                                </Typography>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: 'flex-start', mb: 1.5, pl: 0 }}>
                                                  {acRecords.map((rec, i) => (
                                                    <Box key={i}>
                                                      <CustomFloatingInput
                                                        label={language === 'en' ? `Record ${i + 1}` : `रिकॉर्ड ${i + 1}`}
                                                        value={rec.name}
                                                        error={!!errors[`stage_${activeStageTab}_doc_rec_${i}`]}
                                                        onChange={(e) => updateAcRecord(i, 'name', e.target.value)}
                                                        InputProps={{
                                                          endAdornment: (
                                                            <IconButton size="small" onClick={() => removeAcRecord(i)} color="error" sx={{ color: 'var(--color-error) !important', mr: -1 }}>
                                                              <DeleteOutlineIcon sx={{ fontSize: 'var(--font-base)' }} />
                                                            </IconButton>
                                                          )
                                                        }}
                                                      />
                                                    </Box>
                                                  ))}
                                                </Box>
                                                <Button
                                                  variant="outlined"
                                                  size="small"
                                                  onClick={addAcRecord}
                                                  startIcon={<AddIcon sx={{ fontSize: 'var(--font-base)' }} />}
                                                  sx={{
                                                    textTransform: 'none',
                                                    color: "var(--color-primary)",
                                                    fontWeight: 'var(--font-bold)',
                                                    borderColor: "var(--color-primary)",
                                                    borderRadius: 'var(--radius-sm)',
                                                    "&:hover": {
                                                      borderColor: "var(--color-primary-hover)",
                                                      bgcolor: "rgba(0,86,179,0.04)",
                                                    },
                                                  }}
                                                >
                                                  {t("admissionBuilder.addAcademicRecordBtn") || "Add Academic Record"}
                                                </Button>
                                              </Box>
                                            );
                                          }
                                          const allGroupChecked = group.fields.every(f => selected.includes(f.key));
                                          const someGroupChecked = group.fields.some(f => selected.includes(f.key));
                                          return (
                                            <Box key={group.group} sx={{ mb: 1.5 }}>
                                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                                <CustomCheckbox
                                                  checked={allGroupChecked}
                                                  indeterminate={someGroupChecked && !allGroupChecked}
                                                  onChange={() => toggleGroup(group.fields)}
                                                  sx={{ p: 0 }}
                                                />
                                                <Typography sx={{ fontWeight: 'var(--font-semibold)', color: "var(--color-slate-900)", fontSize: 'var(--font-base)' }}>
                                                  {t(`admissionBuilder.groups.${group.group.replace(/[^A-Za-z]/g, '')}`) || group.group}
                                                </Typography>
                                              </Box>
                                              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 0, pl: 3.5 }}>
                                                {group.fields.map(field => (
                                                  <Box key={field.key} sx={{ width: "100%", display: "flex", alignItems: "center" }}>
                                                    <CustomCheckbox
                                                      checked={selected.includes(field.key)}
                                                      onChange={() => toggleField(field)}
                                                      label={
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                                          <Typography sx={{ fontSize: 'var(--font-sm)', color: "var(--color-slate-800)", fontWeight: 'var(--font-medium)' }}>
                                                            {t(`admissionBuilder.fields.${field.key}`) || field.label}
                                                          </Typography>
                                                        </Box>
                                                      }
                                                      sx={{ p: 0, width: "100%" }}
                                                    />
                                                  </Box>
                                                ))}
                                              </Box>
                                            </Box>
                                          );
                                        })}
                                      </Box> {/* end bordered Applicant Details card */}
                                    </Box>
                                  );
                                })()}


                                {/* Quiz stage */}
                                {stage.type === "quiz" && (
                                  <Box
                                    sx={{
                                      border: themeBorderSx,
                                      borderRadius: 'var(--radius-lg)',
                                      bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {!(stage.quizAttachments || []).length ? (
                                      <Box
                                        onClick={(e) => {
                                          const rect =
                                            e.currentTarget.getBoundingClientRect();
                                          setQuizMenuAnchorPos({
                                            top: rect.bottom + 8,
                                            left: rect.left,
                                          });
                                          setQuizMenuAnchorEl(e.currentTarget);
                                          setActiveQuizStageId(stage.id);
                                        }}
                                        sx={{
                                          p: 2,
                                          display: "flex",
                                          flexDirection: "row",
                                          alignItems: "center",
                                          gap: 1.5,
                                          cursor: "pointer",
                                          transition: "all var(--transition-base)",
                                          "&:hover": {
                                            bgcolor: "rgba(0,86,179,0.03)",
                                          },
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 'var(--radius-lg)',
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "var(--color-primary)",
                                            flexShrink: 0,
                                          }}
                                        >
                                          <QuizOutlinedIcon />
                                        </Box>
                                        <Box>
                                          <Typography
                                            sx={{
                                              fontWeight: 'var(--font-bold)',
                                              color: "var(--color-slate-900)",
                                              fontSize: 'var(--font-sm)',
                                            }}
                                          >
                                            {t(
                                              "admissionBuilder.noQuizAttached",
                                            )}
                                          </Typography>
                                        </Box>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "var(--color-primary)",
                                            fontWeight: 'var(--font-bold)',
                                            ml: "auto",
                                          }}
                                        >
                                          + Click to select
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            flexWrap: "wrap",
                                            gap: 1.5,
                                            p: 2,
                                          }}
                                        >
                                          {(stage.quizAttachments || []).map((quiz) => (
                                            <Box
                                              key={quiz.id}
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                py: 0.75,
                                                px: 1.5,
                                                border: themeBorderSx,
                                                borderRadius: 'var(--radius-md)',
                                                bgcolor: "var(--card-bg)",
                                                transition: "all var(--transition-base)",
                                                "&:hover": {
                                                  borderColor: "var(--color-primary)",
                                                },
                                                gap: 1,
                                                flex: "1 1 calc(50% - 12px)",
                                                maxWidth: "calc(50% - 12px)",
                                                minWidth: 0,
                                              }}
                                            >
                                              <QuizOutlinedIcon sx={{ fontSize: 'var(--font-base)', color: "var(--color-primary)", flexShrink: 0 }} />
                                              <Typography noWrap sx={{ fontWeight: 'var(--font-medium)', color: "var(--color-slate-900)", fontSize: 'var(--font-sm)', flex: 1, minWidth: 0 }}>
                                                {quiz.name}
                                              </Typography>
                                              <IconButton onClick={() => handleRemoveQuiz(stage.id, quiz.id)} size="small" sx={{ p: 0.25, flexShrink: 0, color: "var(--color-error)" }}>
                                                <DeleteOutlineIcon sx={{ fontSize: 'var(--font-base)' }} />
                                              </IconButton>
                                            </Box>
                                          ))}
                                        </Box>
                                        <Box sx={{ px: 2, pb: 1.5 }}>
                                          <Button
                                            size="small"
                                            startIcon={<AddIcon />}
                                            variant="outlined"
                                            sx={{
                                              textTransform: "none",
                                              color: "var(--color-primary)",
                                              fontWeight: 'var(--font-bold)',
                                              borderColor: "var(--color-primary)",
                                              borderRadius: 'var(--radius-sm)',
                                              "&:hover": {
                                                borderColor: "var(--color-primary-hover)",
                                                bgcolor: "rgba(0,86,179,0.04)",
                                              },
                                            }}
                                            onClick={(e) => {
                                              const rect =
                                                e.currentTarget.getBoundingClientRect();
                                              setQuizMenuAnchorPos({
                                                top: rect.bottom + 8,
                                                left: rect.left,
                                              });
                                              setQuizMenuAnchorEl(
                                                e.currentTarget,
                                              );
                                              setActiveQuizStageId(stage.id);
                                            }}
                                          >
                                            {t("admissionBuilder.attachQuizBtn")}
                                          </Button>
                                        </Box>
                                      </Box>
                                    )}
                                  </Box>
                                )}

                                {/* Interview stage */}
                                {stage.type === "interview" && (
                                  <Box
                                    sx={{
                                      border: themeBorderSx,
                                      borderRadius: 'var(--radius-lg)',
                                      bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)",
                                      p: 2,
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontWeight: 'var(--font-semibold)',
                                        color: "var(--color-slate-900)",
                                        fontSize: 'var(--font-sm)',
                                        mb: 2,
                                      }}
                                    >
                                      {t(
                                        "admissionBuilder.interviewInstructions",
                                      )}
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1.5,
                                      }}
                                    >

                                      <Box sx={{ display: "flex", gap: 1.5 }}>
                                        <Box sx={{ flex: 1 }}>
                                          <CustomFloatingInput
                                            type="url"
                                            label={t("admissionBuilder.meetingLink")}
                                            error={!!errors[`stage_${activeStageTab}_int_link`]}
                                            required
                                            value={stage.interviewDetails?.meetingLink || ""}
                                            onChange={(e) =>
                                              setStages(stages.map((s) =>
                                                s.id === stage.id
                                                  ? { ...s, interviewDetails: { ...s.interviewDetails, meetingLink: e.target.value } }
                                                  : s
                                              ))
                                            }
                                          />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                          <CustomFloatingInput
                                            type="text"
                                            label={t("admissionBuilder.passcode")}
                                            error={!!errors[`stage_${activeStageTab}_int_pass`]}
                                            required
                                            value={stage.interviewDetails?.passcode || ""}
                                            onChange={(e) =>
                                              setStages(stages.map((s) =>
                                                s.id === stage.id
                                                  ? { ...s, interviewDetails: { ...s.interviewDetails, passcode: e.target.value } }
                                                  : s
                                              ))
                                            }
                                          />
                                        </Box>
                                      </Box>
                                      <Box>
                                        <CustomFloatingInput
                                          label={t("admissionBuilder.interviewInstructionsField")}
                                          multiline
                                          rows={3}
                                          value={stage.interviewDetails?.instructions || ""}
                                          onChange={(e) =>
                                            setStages(stages.map((s) =>
                                              s.id === stage.id
                                                ? { ...s, interviewDetails: { ...s.interviewDetails, instructions: e.target.value } }
                                                : s
                                            ))
                                          }
                                        />
                                      </Box>
                                    </Box>
                                  </Box>
                                )}

                                {/* Payment stage */}
                                {stage.type === "payment" && (
                                  <Box
                                    sx={{
                                      border: themeBorderSx,
                                      borderRadius: 'var(--radius-lg)',
                                      bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)",
                                      p: 2,
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontWeight: 'var(--font-semibold)',
                                        color: "var(--color-slate-900)",
                                        fontSize: 'var(--font-sm)',
                                        mb: 2,
                                      }}
                                    >
                                      {t("admissionBuilder.paymentConfiguration")}
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1.5,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 1.5,
                                          alignItems: "flex-start",
                                        }}
                                      >
                                        <Box sx={{ flex: 1 }}>
                                          <CustomFloatingInput
                                            type="number"
                                            required
                                            label={t("admissionBuilder.outstandingAmount")}
                                            value={
                                              stage.paymentDetails?.amount || ""
                                            }
                                            onChange={(e) => {
                                              setStages(
                                                stages.map((s) =>
                                                  s.id === stage.id
                                                    ? {
                                                      ...s,
                                                      paymentDetails: {
                                                        ...s.paymentDetails,
                                                        amount:
                                                          e.target.value,
                                                      },
                                                    }
                                                    : s,
                                                ),
                                              );
                                            }}
                                          />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                          <CustomFloatingSearchableSelect
                                            required
                                            label={t("admissionBuilder.currency")}
                                            error={!!errors[`stage_${activeStageTab}_pay_currency`]}
                                            value={
                                              stage.paymentDetails?.currency ||
                                              ""
                                            }
                                            options={currencyOptions}
                                            onChange={(e) => {
                                              setStages(
                                                stages.map((s) =>
                                                  s.id === stage.id
                                                    ? {
                                                      ...s,
                                                      paymentDetails: {
                                                        ...s.paymentDetails,
                                                        currency:
                                                          e.target.value,
                                                      },
                                                    }
                                                    : s,
                                                ),
                                              );
                                            }}
                                          />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                          <Box sx={{ position: 'relative' }}>
                                            <CustomFloatingFileInput
                                              required
                                              key={stage.paymentDetails?.attachment ? 'has-file' : 'no-file'}
                                              label={t("admissionBuilder.feeDetails")}
                                              accept=".pdf"
                                              customDisplayText={
                                                stage.paymentDetails?.attachment
                                                  ? `${stage.paymentDetails.attachment.name} (${stage.paymentDetails.attachment.size})`
                                                  : "Upload PDF"
                                              }
                                              success={Boolean(stage.paymentDetails?.attachment)}
                                              onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                  setStages(
                                                    stages.map((s) =>
                                                      s.id === stage.id
                                                        ? {
                                                          ...s,
                                                          paymentDetails: {
                                                            ...s.paymentDetails,
                                                            attachment: {
                                                              name: file.name,
                                                              size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                                                            },
                                                          },
                                                        }
                                                        : s,
                                                    ),
                                                  );
                                                }
                                              }}
                                            />
                                            {stage.paymentDetails?.attachment && (
                                              <IconButton
                                                size="small"
                                                sx={{
                                                  position: 'absolute',
                                                  right: '36px',
                                                  top: '50%',
                                                  transform: 'translateY(-50%)',
                                                  zIndex: 20,
                                                  color: 'var(--color-error)',
                                                  p: 0.5,
                                                  bgcolor: 'var(--glass-bg)',
                                                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
                                                }}
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  setStages(
                                                    stages.map((s) =>
                                                      s.id === stage.id
                                                        ? {
                                                          ...s,
                                                          paymentDetails: {
                                                            ...s.paymentDetails,
                                                            attachment: null,
                                                          },
                                                        }
                                                        : s,
                                                    ),
                                                  );
                                                }}
                                              >
                                                <DeleteOutlineIcon fontSize="small" />
                                              </IconButton>
                                            )}
                                          </Box>
                                        </Box>
                                      </Box>
                                      <Box>
                                        <CustomFloatingInput
                                          required
                                          label={t("admissionBuilder.paymentInstructions")}
                                          multiline
                                          rows={3}
                                          value={
                                            stage.paymentDetails
                                              ?.instructions || ""
                                          }
                                          onChange={(e) => {
                                            setStages(
                                              stages.map((s) =>
                                                s.id === stage.id
                                                  ? {
                                                    ...s,
                                                    paymentDetails: {
                                                      ...s.paymentDetails,
                                                      instructions:
                                                        e.target.value,
                                                    },
                                                  }
                                                  : s,
                                              ),
                                            );
                                          }}
                                        />
                                      </Box>
                                    </Box>
                                  </Box>
                                )}
                              </CustomAccordionDetails>
                            </CustomAccordion>
                          );
                        })()}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              px: { xs: 3, sm: 8 },
              pb: { xs: 6, sm: 8 },
              pt: 3,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "flex-end",
              alignItems: { xs: "stretch", sm: "center" },
              gap: { xs: 1.5, sm: 2 },
              flexShrink: 0,
            }}
          >
            {/* Navigation and Actions */}
            <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 }, flexWrap: { xs: "wrap", sm: "nowrap" }, width: { xs: "var(--size-full)", sm: "auto" } }}>
              {activeStep > 0 && (
                <TarangButton
                  variant="outlined"
                  onClick={() => setActiveStep(activeStep - 1)}
                  disabled={loading}
                  sx={{
                    flex: { xs: "1 1 calc(50% - 6px)", sm: "0 0 auto" },
                    minWidth: { xs: 0, sm: "120px" },
                    height: { xs: "44px", sm: "48px" },
                    fontSize: { xs: 'var(--font-xs)', sm: 'var(--font-sm)' },
                    order: { xs: 1, sm: 0 },
                  }}
                >
                  {t("admissionBuilder.backBtn")}
                </TarangButton>
              )}
              <TarangButton
                loading={loading}
                onClick={
                  activeStep < 2
                    ? () => setActiveStep(activeStep + 1)
                    : handleSubmit
                }
                disabled={loading}
                sx={{
                  flex: { xs: "0 0 100%", sm: "0 0 auto" },
                  minWidth: { xs: 0, sm: "140px" },
                  height: { xs: "44px", sm: "48px" },
                  fontSize: { xs: 'var(--font-sm)', sm: 'var(--font-base)' },
                  order: { xs: 0, sm: 0 },
                }}
              >
                {activeStep < 2
                  ? t("admissionBuilder.nextBtn")
                  : editData
                    ? t("admissionBuilder.updateBtn")
                    : t("admissionBuilder.publishBtn")}
              </TarangButton>
            </Box>
          </Box>
        </Paper>

        <DropdownListPopup
          isOpen={Boolean(quizMenuAnchorPos || quizMenuAnchorEl)}
          setIsOpen={(open) => {
            if (!open) {
              setQuizMenuAnchorEl(null);
              setQuizMenuAnchorPos(null);
            }
          }}
          options={MOCK_QUIZZES.map(q => ({
            value: q.id,
            label: q.name,
            searchStr: q.name.toLowerCase(),
            renderLabel: () => (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", pr: 1, overflow: "hidden" }}>
                <Typography noWrap sx={{ fontSize: 'inherit', fontWeight: 'inherit', overflow: "hidden", textOverflow: "ellipsis" }}>{q.name}</Typography>
                <Typography sx={{ color: "var(--color-slate-400)", fontSize: 'var(--font-xs)', flexShrink: 0, ml: 2 }}>{q.size}</Typography>
              </Box>
            )
          }))}
          value={activeQuizStageId ? (stages.find(s => s.id === activeQuizStageId)?.quizAttachments || []).map(q => q.id) : []}
          onChange={(e) => {
            const newIds = e.target.value;
            const newAttachments = newIds.map(id => MOCK_QUIZZES.find(q => q.id === id));
            setStages(stages.map(s => s.id === activeQuizStageId ? { ...s, quizAttachments: newAttachments } : s));
          }}
          searchQuery={quizSearchQuery}
          setSearchQuery={setQuizSearchQuery}
          anchorRef={{ current: quizMenuAnchorEl }}
          dropdownRef={quizDropdownRef}
          multiple={true}
          searchable={true}
        />
      </Box>
    </FormLoadingProvider>
  );
}
