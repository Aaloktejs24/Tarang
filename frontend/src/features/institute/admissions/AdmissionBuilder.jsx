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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  MenuItem,
  InputBase,
  GlobalStyles,
  Tabs,
  Tab,
  Chip,
  Checkbox,
  Select,
  FormControl,
  FormControlLabel,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion, Reorder, useDragControls } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
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
import RichQuestionEditor from "../../../components/RichQuestionEditor";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import dayjs from "dayjs";
import { useTranslation } from "../../../hooks/useTranslation";
import useScrollLock from "../../../hooks/useScrollLock";
import { apiClient } from "../../../lib/apiClient";
import { useProfile } from "../../../hooks/useProfile";
import { useRouter } from "next/navigation";
import CustomTimePicker from "./CustomTimePicker";
import { CustomFloatingInput, CustomFloatingSelect } from "../../../components/common/CustomFloatingFields";

import { globalDatePickerSlotProps } from "./datePickerConfig";

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

export default function AdmissionBuilder({ open, onClose, editData }) {
  const { t } = useTranslation();

  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [workflowTitle, setWorkflowTitle] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [workflowDesc, setWorkflowDesc] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [maxCandidates, setMaxCandidates] = useState("");
  const [loading, setLoading] = useState(false);
  const { profile } = useProfile();
  const router = useRouter();
  const [draftId, setDraftId] = useState(null);

  useScrollLock(open);

  const [stages, setStages] = useState([]);
  const [activeStageTab, setActiveStageTab] = useState(0);

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
          setWorkflowTitle(parsed.workflowTitle || "");
          setAcademicYear(parsed.academicYear || "");
          setWorkflowDesc(parsed.workflowDesc || "");
          setPublishDate(parsed.publishDate || "");
          setExpiryDate(parsed.expiryDate || "");
          setMaxCandidates(parsed.maxCandidates || "");
          setStages((parsed.stages || []).map(s => ({
            ...s,
            title: (s.title || "").replace(/Document Request|PI/g, "Applicant Details")
          })));
          setActiveStep(parsed.activeStep || 0);
        } catch (e) { }
      } else if (editData && editData.isDraft) {
        setDraftId(editData.id);
        const parsed = editData.draftObj
          ? JSON.parse(editData.draftObj.draft_data)
          : editData.rawDraft;
        if (parsed) {
          setWorkflowTitle(parsed.workflowTitle || "");
          setAcademicYear(parsed.academicYear || "");
          setWorkflowDesc(parsed.workflowDesc || "");
          setPublishDate(parsed.publishDate || "");
          setExpiryDate(parsed.expiryDate || "");
          setMaxCandidates(parsed.maxCandidates || "");
          setStages((parsed.stages || []).map(s => ({
            ...s,
            title: (s.title || "").replace(/Document Request|PI/g, "Applicant Details")
          })));
          setActiveStep(parsed.activeStep || 0);
        }
      } else if (editData && !editData.isDraft) {
        setDraftId(null);
        setWorkflowTitle(editData.title || "");
        setAcademicYear(editData.academic_year || "");
        setWorkflowDesc(editData.workflow_desc || "");
        if (editData.stages && editData.stages.length > 0) {
          console.log("[AdmissionBuilder] Loading live stages:", editData.stages);
          setStages(
            editData.stages.map((s) => {
              console.log("[AdmissionBuilder] Mapping stage:", s.title, "selected_fields:", s.selected_fields, "selectedFields:", s.selectedFields);
              return {
                id: s.id || `${Date.now()}-${Math.random()}`,
                title: (s.title || "").replace(/Document Request|PI/g, "Applicant Details"),
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
        setActiveStep(0);
      } else {
        setDraftId(null);
        setWorkflowTitle("");
        setAcademicYear("");
        setWorkflowDesc("");
        setPublishDate("");
        setExpiryDate("");
        setMaxCandidates("");
        setStages([]);
        setActiveStep(0);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [open, editData, profile]);

  const isInitialLoad = React.useRef(true);
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
      const isTitleFilled = workflowTitle && workflowTitle.trim() !== "";
      const isDescFilled = workflowDesc && workflowDesc.trim() !== "";
      const isCandidatesFilled =
        maxCandidates && maxCandidates.toString().trim() !== "";
      const hasStages = stages && stages.length > 0;

      if (
        !isTitleFilled &&
        !isDescFilled &&
        !isCandidatesFilled &&
        !hasStages
      ) {
        return;
      }

      const draftTitle = isTitleFilled ? workflowTitle : "Untitled";

      const draftData = {
        workflowTitle: draftTitle,
        academicYear,
        workflowDesc,
        publishDate,
        expiryDate,
        maxCandidates,
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

      const payload = {
        institute_id: profile.username,
        program_id:
          editData && !editData.isDraft
            ? editData.id
            : editData?.target_program_id || "",
        draft_data: JSON.stringify(draftData),
      };
      if (draftId) {
        payload.draft_id = draftId;
      }

      const saveDraftTimeout = setTimeout(() => {
        apiClient
          .post("/admissions/drafts", payload)
          .then((res) => {
            if (res.data?.draft?.id && !draftId) {
              setDraftId(res.data.draft.id);
            }
          })
          .catch((err) =>
            console.error("Failed to auto-save draft to DB", err),
          );
      }, 1000); // 1s debounce

      return () => clearTimeout(saveDraftTimeout);
    }
  }, [
    workflowTitle,
    academicYear,
    workflowDesc,
    publishDate,
    expiryDate,
    maxCandidates,
    stages,
    activeStep,
    open,
    editData,
    profile,
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

  const hasEnteredData =
    workflowTitle.trim().length > 0 ||
    workflowDesc.trim().length > 0 ||
    maxCandidates.toString().trim().length > 0 ||
    (stages && stages.length > 0);
  const THEME_BORDER = "#cbd5e1";

  const themeInputSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(4px)",
      borderRadius: "8px",
      transition: "all 0.2s ease",
      "& fieldset": {
        borderColor: THEME_BORDER,
        borderWidth: "1.5px",
      },
      "&:hover fieldset": { borderColor: "#94a3b8" },
      "&.Mui-focused fieldset": {
        borderColor: "#0056b3",
        borderWidth: "1.5px",
      },
      "&.Mui-disabled": {
        backgroundColor: "#f1f5f9",
      },
      "&.Mui-disabled fieldset": {
        borderColor: THEME_BORDER,
        borderWidth: "1.5px",
      },
      "&.Mui-focused": { backgroundColor: "#ffffff", boxShadow: "none" },
      "& input, & textarea": {
        color: "#111827",
        fontSize: "15px",
        fontWeight: 800,
        fontFamily: "'Rozha One', serif",
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
      fontSize: "1rem",
    },
    "& .MuiInputAdornment-root .MuiIconButton-root": {
      padding: "4px",
      marginRight: "4px",
    },
  };

  const themeBorderSx = `1px solid ${THEME_BORDER}`;

  const handleAddClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const addStage = (type) => {
    handleMenuClose();
    const newStage = {
      id: Date.now(),
      title: `Stage ${stages.length + 1}: ${type === "document" ? "Applicant Details" : type === "quiz" ? "Quiz" : type === "interview" ? "Interview" : "Payment"}`,
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
          ? { amount: "", currency: "USD", instructions: "" }
          : undefined,
    };
    const newStages = [...stages, newStage];
    setStages(newStages);
    setActiveStageTab(newStages.length - 1); // auto-switch to new tab
  };

  const deleteStage = (id) => {
    const remainingStages = stages.filter((s) => s.id !== id);
    const updatedStages = remainingStages.map((stage, idx) => ({
      ...stage,
      title: stage.title?.replace(/^Stage \d+:/, `Stage ${idx + 1}:`),
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
    setLoading(true);
    try {
      const payload = {
        institute_id: profile?.username || "unknown",
        workflow_title: workflowTitle,
        academic_year: academicYear,
        workflow_desc: workflowDesc,
        image_url: "",
        last_date: expiryDate || "To be announced",
        seats: maxCandidates ? parseInt(maxCandidates) : 0,
        publish_date: publishDate || "",
        eligibility: "",
        fees: "",
        duration: "",
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
          payment_details: s.type === "payment" ? s.paymentDetails : undefined,
          quiz_attachments: s.type === "quiz" ? s.quizAttachments : undefined,
          interview_details: s.type === "interview" ? s.interviewDetails : undefined,
        })),
      };

      if (editData && editData.id) {
        await apiClient.put(`/admissions/programs/${editData.id}`, payload);
        setSnackbar({
          open: true,
          message: "Admission workflow updated successfully!",
          severity: "success",
        });
      } else {
        await apiClient.post("/admissions/programs", payload);
        setSnackbar({
          open: true,
          message: "Admission workflow published successfully!",
          severity: "success",
        });
      }

      // Remove draft from DB on success
      if (profile?.username) {
        if (draftId) {
          apiClient
            .delete(
              `/admissions/drafts?institute_id=${profile.username}&draft_id=${draftId}`,
            )
            .catch(console.error);
        }
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message:
          "Failed to publish workflow: " +
          (error.response?.data || error.message),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDiscard = async () => {
    // Delete draft from DB if exists
    if (draftId && profile?.username) {
      try {
        await apiClient.delete(
          `/admissions/drafts?institute_id=${profile.username}&draft_id=${draftId}`,
        );
      } catch (e) {
        console.error("Failed to delete draft on discard", e);
      }
    }
    // Clear sessionStorage recovery
    if (typeof window !== "undefined")
      sessionStorage.removeItem("admissionBuilderRecovery");
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 1200,
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
            width: { xs: "100%", sm: "1000px" },
            minHeight: { xs: "100%", sm: "auto" },
            borderRadius: { xs: 0, sm: "28px" },
            background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.18) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.15) 0, transparent 50%), 
            radial-gradient(at 80% 100%, rgba(40, 167, 69, 0.12) 0, transparent 50%),
            radial-gradient(at 20% 100%, rgba(0, 86, 179, 0.1) 0, transparent 50%),
            #ffffff
          `,
            border: themeBorderSx,
            boxShadow: "none",
            overflowY: "auto",
            maxHeight: "92vh",
            position: "relative",
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              position: "absolute",
              top: 16,
              right: 16,
              color: "#64748b",
              "&:hover": { color: "#0f172a", bgcolor: "rgba(0,0,0,0.05)" },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box
            sx={{
              px: { xs: 3, sm: 6 },
              py: { xs: 5, sm: 6 },
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                mb: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: "#111827",
                    letterSpacing: "-0.5px",
                    fontSize: "24px",
                  }}
                >
                  {editData
                    ? "Edit Admission Workflow"
                    : t("admissionBuilder.title")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#6B7280", mt: 0.5, fontSize: "14px" }}
                >
                  {t("admissionBuilder.subtitle")}
                </Typography>
              </Box>
            </Box>

            {/* Step Indicator Progress Bar */}
            <Box sx={{ display: "flex", gap: 2, mb: 4, mt: 1 }}>
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
                    borderRadius: "8px",
                    bgcolor: activeStep >= 0 ? "#0056b3" : "#cbd5e1",
                    transition: "all 0.3s",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: activeStep === 0 ? "#0056b3" : "#64748b",
                    fontSize: "11.5px",
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
                onClick={() => {
                  if (workflowTitle) setActiveStep(1);
                }}
              >
                <Box
                  sx={{
                    height: 4,
                    borderRadius: "8px",
                    bgcolor: activeStep >= 1 ? "#0056b3" : "#cbd5e1",
                    transition: "all 0.3s",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: activeStep === 1 ? "#0056b3" : "#64748b",
                    fontSize: "11.5px",
                  }}
                >
                  2. Schedule & Limits
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
                onClick={() => {
                  if (workflowTitle) setActiveStep(2);
                }}
              >
                <Box
                  sx={{
                    height: 4,
                    borderRadius: "8px",
                    bgcolor: activeStep >= 2 ? "#0056b3" : "#cbd5e1",
                    transition: "all 0.3s",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: activeStep === 2 ? "#0056b3" : "#64748b",
                    fontSize: "11.5px",
                  }}
                >
                  3. Admission Stages
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                width: "100%",
              }}
            >
              {/* STEP 1: WORKFLOW DETAILS */}
              {activeStep === 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    width: "100%",
                  }}
                >
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2.5, alignItems: "flex-start" }}>
                    <CustomFloatingInput
                      label={`${t("admissionBuilder.titleField")} *`}
                      value={workflowTitle}
                      onChange={(e) => setWorkflowTitle(e.target.value)}
                    />
                    <CustomFloatingSelect
                      label={`${t("admissionBuilder.academicYear") || "Academic Year"} *`}
                      value={academicYear}
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
                  <CustomFloatingInput
                    label={`${t("admissionBuilder.descField")} *`}
                    value={workflowDesc}
                    onChange={(e) => setWorkflowDesc(e.target.value)}
                    multiline
                    rows={4}
                  />
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
                      gap: 3,
                      width: "100%",
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <DesktopDatePicker
                            label="Publish Date *"
                            showToolbar
                            toolbarFormat="DD MMMM YYYY"
                            format="DD/MM/YYYY"
                            disabled={Boolean(editData && !editData.isDraft && editData.publish_date && dayjs(editData.publish_date).isBefore(dayjs()))}
                            slots={{ textField: CustomFloatingInput }}
                            slotProps={globalDatePickerSlotProps}
                            sx={{ width: "100%", ...themePickerSx }}
                            minDate={publishDate && dayjs(publishDate).isBefore(dayjs(), "day") ? dayjs(publishDate) : dayjs()}
                            maxDate={expiryDate ? dayjs(expiryDate) : undefined}
                            value={publishDate ? dayjs(publishDate) : null}
                            onChange={(newDate) => {
                              if (!newDate) return setPublishDate("");
                              const hasTime = publishDate && publishDate.includes("T");
                              const timePart = hasTime ? publishDate.split("T")[1] : "";
                              const newD = newDate.format("YYYY-MM-DD");
                              setPublishDate(hasTime ? `${newD}T${timePart}` : newD);
                              setExpiryDate("");
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <CustomTimePicker
                            label="Publish Time"
                            disabled={!publishDate || Boolean(editData && !editData.isDraft && editData.publish_date && dayjs(editData.publish_date).isBefore(dayjs()))}
                            minuteStep={5}
                            sx={{ width: "100%", ...themePickerSx }}
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
                                setExpiryDate("");
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Box>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <DesktopDatePicker
                            label="Expiry Date *"
                            showToolbar
                            toolbarFormat="DD MMMM YYYY"
                            format="DD/MM/YYYY"
                            disabled={!publishDate}
                            slots={{ textField: CustomFloatingInput }}
                            slotProps={globalDatePickerSlotProps}
                            sx={{ width: "100%", ...themePickerSx }}
                            minDate={publishDate ? dayjs(publishDate) : dayjs()}
                            value={expiryDate ? dayjs(expiryDate) : null}
                            onChange={(newDate) => {
                              if (!newDate) return setExpiryDate("");
                              const hasTime = expiryDate && expiryDate.includes("T");
                              const timePart = hasTime ? expiryDate.split("T")[1] : "";
                              const newD = newDate.format("YYYY-MM-DD");
                              setExpiryDate(hasTime ? `${newD}T${timePart}` : newD);
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <CustomTimePicker
                            label="Expiry Time"
                            disabled={!expiryDate}
                            minuteStep={5}
                            sx={{ width: "100%", ...themePickerSx }}
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
                        label="Seats Available *"
                        type="number"
                        placeholder="E.G. 100"
                        value={maxCandidates}
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
                    gap: 2,
                    width: "100%",
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
                      variant="h5"
                      sx={{ fontWeight: 800, color: "#0f172a" }}
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
                        borderRadius: "8px",
                        fontWeight: 700,
                        borderColor: "#0056b3",
                        color: "#0056b3",
                        fontSize: "12px",
                        py: 0.5,
                        border: "1.5px solid #0056b3",
                        "&:hover": {
                          border: "1.5px solid #004494",
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
                          borderRadius: "12px",
                          mt: 0.5,
                          boxShadow: "none",
                          border: themeBorderSx,
                          background: "rgba(255, 255, 255, 0.9)",
                          backdropFilter: "blur(30px)",
                          minWidth: "220px",
                          "& .MuiList-root": {
                            py: 0.5,
                          },
                          "& .MuiMenuItem-root": {
                            gap: 1.5,
                            px: 2,
                            py: 1,
                            fontWeight: 500,
                            color: "#1e293b",
                            fontSize: "14px",
                            transition: "all 0.2s",
                            "&:hover": {
                              backgroundColor: "rgba(0, 86, 179, 0.06)",
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem
                        sx={{ gap: 1.5, alignItems: "center" }}
                        disabled={stages.some((s) => s.type === "document")}
                        onClick={() => addStage("document")}
                      >
                        <FileUploadOutlinedIcon
                          sx={{
                            color: stages.some((s) => s.type === "document")
                              ? "text.disabled"
                              : "#0056b3",
                            fontSize: "14px !important",
                          }}
                        />{" "}
                        Applicant Details
                      </MenuItem>
                      <MenuItem
                        sx={{ gap: 1.5, alignItems: "center" }}
                        disabled={stages.some((s) => s.type === "quiz")}
                        onClick={() => addStage("quiz")}
                      >
                        <QuizOutlinedIcon
                          sx={{
                            color: stages.some((s) => s.type === "quiz")
                              ? "text.disabled"
                              : "#0056b3",
                            fontSize: "14px !important",
                          }}
                        />{" "}
                        {t("admissionBuilder.menuCreateQuiz")}
                      </MenuItem>
                      <MenuItem
                        sx={{ gap: 1.5, alignItems: "center" }}
                        disabled={stages.some((s) => s.type === "interview")}
                        onClick={() => addStage("interview")}
                      >
                        <VideoCameraFrontOutlinedIcon
                          sx={{
                            color: stages.some((s) => s.type === "interview")
                              ? "text.disabled"
                              : "#0056b3",
                            fontSize: "14px !important",
                          }}
                        />{" "}
                        {t("admissionBuilder.menuScheduleInterview")}
                      </MenuItem>
                      <MenuItem
                        sx={{ gap: 1.5, alignItems: "center" }}
                        disabled={stages.some((s) => s.type === "payment")}
                        onClick={() => addStage("payment")}
                      >
                        <PaymentOutlinedIcon
                          sx={{
                            color: stages.some((s) => s.type === "payment")
                              ? "text.disabled"
                              : "#0056b3",
                            fontSize: "14px !important",
                          }}
                        />{" "}
                        Request Payment
                      </MenuItem>
                    </Menu>
                  </Box>

                  {stages.length === 0 ? (
                    <Box
                      sx={{
                        p: 6,
                        textAlign: "center",
                        borderRadius: "24px",
                        bgcolor: "rgba(255,255,255,0.4)",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#64748b",
                          fontWeight: 600,
                          fontSize: "1.1rem",
                        }}
                      >
                        {t("admissionBuilder.noStagesTitle")}
                      </Typography>
                      <Typography sx={{ color: "#94a3b8", mt: 1 }}>
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
                          mb: 2,
                          px: 1,
                          overflowX: "auto",
                          listStyle: "none",
                          margin: 0,
                          padding: "4px",
                          "&::-webkit-scrollbar": { height: "4px" },
                          "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "rgba(0,0,0,0.1)",
                            borderRadius: "4px",
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
                              style={{ listStyle: "none", flex: 1, minWidth: "160px" }}
                            >
                              <Box
                                onClick={() => setActiveStageTab(idx)}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  px: 2,
                                  py: 1,
                                  flex: 1,
                                  width: "100%",
                                  minWidth: 0,
                                  flexShrink: 0,
                                  borderRadius: "10px",
                                  cursor: "pointer",
                                  border: isActive
                                    ? "1.5px solid #0056b3"
                                    : "1.5px solid rgba(203,213,225,0.8)",
                                  backgroundColor: isActive
                                    ? "rgba(0,86,179,0.06)"
                                    : "rgba(255,255,255,0.7)",
                                  transition:
                                    "background-color 0.18s, border-color 0.18s",
                                  "&:active": { cursor: "grabbing" },
                                  "&:hover": {
                                    borderColor: "#0056b3",
                                    backgroundColor: "rgba(0,86,179,0.04)",
                                  },
                                }}
                              >
                                <DragIndicatorIcon
                                  sx={{
                                    fontSize: "14px",
                                    color: "#cbd5e1",
                                    flexShrink: 0,
                                    mr: -0.5,
                                  }}
                                />
                                <StageIcon
                                  sx={{
                                    fontSize: "15px",
                                    color: isActive ? "#0056b3" : "#64748b",
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography
                                  sx={{
                                    flex: 1,
                                    fontSize: "13px",
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? "#0056b3" : "#374151",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {stage.title || `Stage ${idx + 1}`}
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
                            <Accordion
                              elevation={0}
                              key={stage.id}
                              disableGutters
                              defaultExpanded
                              sx={{
                                borderRadius: "12px !important",
                                border: "1.5px solid rgba(30,79,163,0.15)",
                                boxShadow: "none !important",
                                background: "rgba(255,255,255,0.5)",
                                backdropFilter: "blur(20px)",
                                "&::before": { display: "none !important" },
                                overflow: "hidden",
                                transform: "translateZ(0)",
                              }}
                            >
                              {/* Header — AccordionSummary */}
                              <AccordionSummary
                                expandIcon={
                                  <ExpandMoreIcon sx={{ color: "#0056b3" }} />
                                }
                                sx={{
                                  px: { xs: 1.5, sm: 2.25 },
                                  py: 0,
                                  height: "64px",
                                  minHeight: "64px",
                                  borderBottom: "none",
                                  transition: "none",
                                  "&&, &&:focus, &&:hover, &&:active, &&.Mui-expanded, &&.Mui-focusVisible":
                                  {
                                    background: "#e6f0fa !important",
                                    backgroundColor: "#e6f0fa !important",
                                  },
                                  "& .MuiAccordionSummary-content": {
                                    alignItems: "center",
                                    gap: 1.5,
                                    m: 0,
                                  },
                                  "& .MuiAccordionSummary-content.Mui-expanded":
                                    { m: 0 },
                                }}
                              >
                                {stage.type === "document" ? (
                                  <FileUploadOutlinedIcon
                                    sx={{
                                      color: "#0056b3",
                                      fontSize: "14px",
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : stage.type === "quiz" ? (
                                  <QuizOutlinedIcon
                                    sx={{
                                      color: "#0056b3",
                                      fontSize: "14px",
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : stage.type === "interview" ? (
                                  <VideoCameraFrontOutlinedIcon
                                    sx={{
                                      color: "#0056b3",
                                      fontSize: "14px",
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : (
                                  <PaymentOutlinedIcon
                                    sx={{
                                      color: "#0056b3",
                                      fontSize: "14px",
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                                <TextField
                                  value={stage.title}
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
                                      fontWeight: 700,
                                      color: "#1e293b",
                                      fontSize: "15px",
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
                                  sx={{ color: "#ef4444" }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </AccordionSummary>

                              {/* Content — AccordionDetails */}
                              <AccordionDetails
                                sx={{
                                  pt: 2,
                                  pb: 3,
                                  pl: { xs: 2, sm: "46px" },
                                  pr: 2,
                                  background: "rgba(255,255,255,0.65)",
                                  borderBottomLeftRadius: "12px",
                                  borderBottomRightRadius: "12px",
                                  maxHeight: "calc(92vh - 534px)",
                                  overflowY: "auto",
                                  "&::-webkit-scrollbar": { width: "6px" },
                                  "&::-webkit-scrollbar-thumb": {
                                    backgroundColor: "rgba(0,0,0,0.15)",
                                    borderRadius: "4px",
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
                                          mb: 3,
                                          p: 2,
                                          bgcolor: "#ffffff",
                                          borderRadius: "12px",
                                          border: themeBorderSx,
                                        }}
                                      >
                                        <Typography
                                          variant="subtitle2"
                                          sx={{
                                            fontWeight: 600,
                                            color: "#0f172a",
                                            mb: 2,
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          <AccessTimeOutlinedIcon
                                            sx={{
                                              fontSize: 16,
                                              mr: 1,
                                              color: "#0056b3",
                                            }}
                                          />
                                          Stage Timeline
                                        </Typography>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: {
                                              xs: "column",
                                              md: "row",
                                            },
                                            gap: 2,
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              flex: 1,
                                              display: "flex",
                                              gap: 1,
                                              alignItems: "center",
                                            }}
                                          >
                                            <DesktopDatePicker
                                              showToolbar
                                              toolbarFormat="DD MMMM YYYY"
                                              label="Start Date"
                                              format="DD/MM/YYYY"
                                              slots={{ textField: CustomFloatingInput }}
                                              slotProps={globalDatePickerSlotProps}
                                              disabled={isStageStarted}
                                              sx={{
                                                width: "100%",
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
                                            <CustomTimePicker
                                              label="Start Time"
                                              disabled={!stage.startDateOnly || isStageStarted}
                                              minuteStep={5}
                                              sx={{ width: "100%", ...themePickerSx }}
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
                                          <Box
                                            sx={{
                                              flex: 1,
                                              display: "flex",
                                              gap: 1,
                                              alignItems: "center",
                                            }}
                                          >
                                            <DesktopDatePicker
                                              showToolbar
                                              toolbarFormat="DD MMMM YYYY"
                                              label="End Date"
                                              format="DD/MM/YYYY"
                                              disabled={!stage.startDateOnly || !stage.startTimeOnly || isStageStarted}
                                              slotProps={globalDatePickerSlotProps}
                                              sx={{
                                                width: "100%",
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
                                            <CustomTimePicker
                                              label="End Time"
                                              disabled={!stage.endDateOnly || !stage.startDateOnly || !stage.startTimeOnly || isStageStarted}
                                              minuteStep={5}
                                              sx={{ width: "100%", ...themePickerSx }}
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
                                                color: "#ef4444",
                                                fontSize: "12px",
                                                mt: 1.5,
                                                fontWeight: 500,
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
                                        { key: "full_name", label: "Full Name", proofKey: "full_name_proof" },
                                        { key: "email", label: "Email" },
                                        { key: "phone", label: "Phone Number" },
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
                                    <Box sx={{ mt: 2, p: { xs: 0, sm: 1 } }}>
                                      <Box
                                        sx={{
                                          border: themeBorderSx,
                                          borderRadius: "12px",
                                          bgcolor: "#ffffff",
                                          p: 2,
                                          mb: 2,
                                        }}
                                      >
                                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                                        <Typography sx={{ fontWeight: 600, color: "#0f172a", fontSize: "1rem" }}>
                                          Applicant Details
                                        </Typography>
                                        <Typography
                                          onClick={() => {
                                            const allOn = allVisibleFields.every(f => selected.includes(f.key));
                                            const allKeys = allVisibleFields.flatMap(f => [f.key, ...(f.proofKey ? [f.proofKey] : [])]);
                                            setStages(stages.map(s => s.id === stage.id ? { ...s, selectedFields: allOn ? [] : allKeys } : s));
                                          }}
                                          sx={{ fontSize: "0.8rem", color: "#3b82f6", cursor: "pointer", fontWeight: 500, "&:hover": { textDecoration: "underline" } }}
                                        >
                                          {allVisibleFields.every(f => selected.includes(f.key)) ? "Deselect All" : "Select All"}
                                        </Typography>
                                      </Box>
                                      <Typography sx={{ fontWeight: 400, color: "#64748b", mb: 3, fontSize: "0.875rem" }}>
                                        Select the fields that students must fill during this stage.
                                      </Typography>

                                      {ALL_PI_FIELDS.map((group) => {
                                        if (group.isCustomBuilder) {
                                          return (
                                            <Box key={group.group} sx={{ mb: 3 }}>
                                              <Typography sx={{ fontWeight: 700, color: "#374151", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.5 }}>
                                                {group.group}
                                              </Typography>
                                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1, pl: 0 }}>
                                                {acRecords.map((rec, i) => (
                                                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.5, bgcolor: '#fff', border: themeBorderSx, borderRadius: '8px' }}>
                                                    <input
                                                      type="text"
                                                      placeholder="e.g. 10th Marksheet, B.Tech Degree…"
                                                      value={rec.name}
                                                      onChange={(e) => updateAcRecord(i, 'name', e.target.value)}
                                                      style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit', color: '#0f172a', background: 'transparent' }}
                                                    />
                                                    <IconButton size="small" onClick={() => removeAcRecord(i)} sx={{ color: '#ef4444', p: 0.4 }}>
                                                      <DeleteOutlineIcon sx={{ fontSize: '16px' }} />
                                                    </IconButton>
                                                  </Box>
                                                ))}
                                              </Box>
                                              <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={addAcRecord}
                                                startIcon={<AddIcon sx={{ fontSize: '15px !important' }} />}
                                                sx={{ textTransform: 'none', fontSize: '0.78rem', borderRadius: '8px' }}
                                              >
                                                Add Academic Record
                                              </Button>
                                            </Box>
                                          );
                                        }
                                        const allGroupChecked = group.fields.every(f => selected.includes(f.key));
                                        const someGroupChecked = group.fields.some(f => selected.includes(f.key));
                                        return (
                                          <Box key={group.group} sx={{ mb: 3 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                                              <Checkbox
                                                checked={allGroupChecked}
                                                indeterminate={someGroupChecked && !allGroupChecked}
                                                onChange={() => toggleGroup(group.fields)}
                                                sx={{ p: 0.5 }}
                                              />
                                              <Typography sx={{ fontWeight: 700, color: "#374151", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                                {group.group}
                                              </Typography>
                                            </Box>
                                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 0.5, pl: 3.5 }}>
                                              {group.fields.map(field => (
                                                <FormControlLabel
                                                  key={field.key}
                                                  control={
                                                    <Checkbox
                                                      checked={selected.includes(field.key)}
                                                      onChange={() => toggleField(field)}
                                                      sx={{ p: 0.5 }}
                                                    />
                                                  }
                                                  label={
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                                      <Typography sx={{ fontSize: "0.875rem", color: "#374151" }}>
                                                        {field.label}
                                                      </Typography>
                                                      {field.proofKey && (
                                                        <Typography sx={{ fontSize: "0.7rem", color: "#64748b", bgcolor: "#e2e8f0", borderRadius: "4px", px: 0.75, py: 0.25, lineHeight: 1.4 }}>
                                                          + proof
                                                        </Typography>
                                                      )}
                                                    </Box>
                                                  }
                                                  sx={{ ml: 0, mr: 0 }}
                                                />
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
                                  <Box>
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        color: "#475569",
                                        mb: 3,
                                      }}
                                    >
                                      {t("admissionBuilder.attachQuiz")}
                                    </Typography>
                                    {!(stage.quizAttachments || []).length ? (
                                      <Paper
                                        elevation={0}
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
                                          mb: 2,
                                          p: 1.25,
                                          borderRadius: "8px",
                                          bgcolor: "#ffffff",
                                          border:
                                            "1px solid rgba(30,79,163,0.1)",
                                          display: "flex",
                                          flexDirection: "row",
                                          alignItems: "center",
                                          gap: 2,
                                          cursor: "pointer",
                                          transition: "all 0.2s",
                                          "&:hover": {
                                            borderColor: "#0056b3",
                                            bgcolor: "rgba(0,86,179,0.03)",
                                          },
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "10px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#0056b3",
                                            flexShrink: 0,
                                          }}
                                        >
                                          <QuizOutlinedIcon />
                                        </Box>
                                        <Box>
                                          <Typography
                                            sx={{
                                              fontWeight: 700,
                                              color: "#1e293b",
                                              fontSize: "14px",
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
                                            color: "#0056b3",
                                            fontWeight: 700,
                                            ml: "auto",
                                          }}
                                        >
                                          + Click to select
                                        </Typography>
                                      </Paper>
                                    ) : (
                                      <Box
                                        sx={{
                                          mb: 4,
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: 2,
                                        }}
                                      >
                                        {(stage.quizAttachments || []).map(
                                          (quiz) => (
                                            <Box
                                              key={quiz.id}
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                p: 1.25,
                                                bgcolor: "#ffffff",
                                                border:
                                                  "1px solid rgba(30,79,163,0.1)",
                                                borderRadius: "8px",
                                                transition: "all 0.2s",
                                                "&:hover": {
                                                  borderColor: "#0056b3",
                                                },
                                                width: "100%",
                                                maxWidth: "600px",
                                              }}
                                            >
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: 1.5,
                                                  flex: 1,
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: "8px",
                                                    bgcolor: "transparent",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "#0056b3",
                                                    flexShrink: 0,
                                                  }}
                                                >
                                                  <QuizOutlinedIcon
                                                    sx={{ fontSize: 22 }}
                                                  />
                                                </Box>
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent:
                                                      "space-between",
                                                    flex: 1,
                                                    pr: 3,
                                                  }}
                                                >
                                                  <Typography
                                                    noWrap
                                                    sx={{
                                                      fontWeight: 700,
                                                      color: "#1e293b",
                                                      fontSize: "1rem",
                                                      fontFamily:
                                                        '"Rozha One", serif',
                                                      overflow: "hidden",
                                                      textOverflow: "ellipsis",
                                                      maxWidth: "260px",
                                                    }}
                                                  >
                                                    {quiz.name}
                                                  </Typography>
                                                  <Typography
                                                    variant="body2"
                                                    sx={{
                                                      color: "#64748b",
                                                      fontWeight: 800,
                                                      fontSize: "0.9rem",
                                                    }}
                                                  >
                                                    {quiz.size}
                                                  </Typography>
                                                </Box>
                                              </Box>
                                              <IconButton
                                                onClick={() =>
                                                  handleRemoveQuiz(
                                                    stage.id,
                                                    quiz.id,
                                                  )
                                                }
                                                size="small"
                                                sx={{ color: "#ef4444" }}
                                              >
                                                <DeleteOutlineIcon fontSize="small" />
                                              </IconButton>
                                            </Box>
                                          ),
                                        )}
                                        <Box>
                                          <Button
                                            size="small"
                                            startIcon={<AddIcon />}
                                            variant="outlined"
                                            sx={{
                                              textTransform: "none",
                                              color: "#0056b3",
                                              fontWeight: 700,
                                              borderColor: "#0056b3",
                                              borderRadius: "8px",
                                              "&:hover": {
                                                borderColor: "#004494",
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
                                            Attach Quiz
                                          </Button>
                                        </Box>
                                      </Box>
                                    )}
                                  </Box>
                                )}

                                {/* Interview stage */}
                                {stage.type === "interview" && (
                                  <Box>
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        color: "#475569",
                                        mb: 3,
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
                                        gap: 3,
                                      }}
                                    >

                                      <Box sx={{ display: "flex", gap: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              mb: 1,
                                              fontWeight: 800,
                                              color: "#374151",
                                              fontSize: "13px",
                                            }}
                                          >
                                            {t("admissionBuilder.meetingLink")}{" "}
                                            <span style={{ color: "#111827" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <TextField
                                            type="url"
                                            placeholder={t(
                                              "admissionBuilder.meetingLinkPlaceholder",
                                            )}
                                            fullWidth
                                            sx={themeInputSx}
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
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              mb: 1,
                                              fontWeight: 800,
                                              color: "#374151",
                                              fontSize: "13px",
                                            }}
                                          >
                                            {t("admissionBuilder.passcode")}{" "}
                                            <span style={{ color: "#111827" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <TextField
                                            type="text"
                                            placeholder={t(
                                              "admissionBuilder.passcodePlaceholder",
                                            )}
                                            fullWidth
                                            sx={themeInputSx}
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
                                      <Box sx={{ mb: 3 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            mb: 1,
                                            fontWeight: 800,
                                            color: "#374151",
                                            fontSize: "13px",
                                          }}
                                        >
                                          {t(
                                            "admissionBuilder.interviewInstructionsField",
                                          )}
                                        </Typography>
                                        <TextField
                                          fullWidth
                                          multiline
                                          rows={3}
                                          placeholder={t(
                                            "admissionBuilder.interviewInstructionsPlaceholder",
                                          )}
                                          sx={themeInputSx}
                                        />
                                      </Box>
                                    </Box>
                                  </Box>
                                )}

                                {/* Payment stage */}
                                {stage.type === "payment" && (
                                  <Box>
                                    <Typography
                                      sx={{
                                        fontWeight: 600,
                                        color: "#475569",
                                        mb: 3,
                                      }}
                                    >
                                      Payment Configuration
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 3,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 2,
                                          alignItems: "flex-start",
                                        }}
                                      >
                                        <Box sx={{ flex: 1 }}>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              mb: 1,
                                              fontWeight: 800,
                                              color: "#374151",
                                              fontSize: "13px",
                                            }}
                                          >
                                            Outstanding Amount{" "}
                                            <span style={{ color: "#111827" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <TextField
                                            type="number"
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
                                            placeholder="0.00"
                                            fullWidth
                                            sx={themeInputSx}
                                          />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              mb: 1,
                                              fontWeight: 800,
                                              color: "#374151",
                                              fontSize: "13px",
                                            }}
                                          >
                                            Currency{" "}
                                            <span style={{ color: "#111827" }}>
                                              *
                                            </span>
                                          </Typography>
                                          <TextField
                                            value={
                                              stage.paymentDetails?.currency ||
                                              "INR"
                                            }
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
                                            placeholder="INR"
                                            fullWidth
                                            sx={themeInputSx}
                                          />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              mb: 1,
                                              fontWeight: 800,
                                              color: "#374151",
                                              fontSize: "13px",
                                            }}
                                          >
                                            Fee Details{" "}
                                            <span style={{ color: "#111827" }}>
                                              *
                                            </span>
                                          </Typography>
                                          {!stage.paymentDetails?.attachment ? (
                                            <Button
                                              variant="outlined"
                                              component="label"
                                              startIcon={
                                                <FileUploadOutlinedIcon />
                                              }
                                              sx={{
                                                textTransform: "none",
                                                borderRadius: "8px",
                                                fontWeight: 600,
                                                color: "#0056b3",
                                                borderColor:
                                                  "rgba(0,86,179,0.3)",
                                                "&:hover": {
                                                  borderColor: "#0056b3",
                                                  bgcolor:
                                                    "rgba(0,86,179,0.04)",
                                                },
                                                height: "46.5px",
                                                width: "100%",
                                              }}
                                            >
                                              Upload PDF
                                              <input
                                                type="file"
                                                hidden
                                                accept=".pdf"
                                                onChange={(e) => {
                                                  const file =
                                                    e.target.files[0];
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
                                                                size:
                                                                  (
                                                                    file.size /
                                                                    1024 /
                                                                    1024
                                                                  ).toFixed(
                                                                    2,
                                                                  ) + " MB",
                                                              },
                                                            },
                                                          }
                                                          : s,
                                                      ),
                                                    );
                                                  }
                                                }}
                                              />
                                            </Button>
                                          ) : (
                                            <Box
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                p: "8.5px 12px",
                                                bgcolor: "#ffffff",
                                                border:
                                                  "1px solid rgba(30,79,163,0.1)",
                                                borderRadius: "8px",
                                                width: "100%",
                                                transition: "all 0.2s",
                                                "&:hover": {
                                                  borderColor: "#0056b3",
                                                },
                                              }}
                                            >
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: 1.5,
                                                  flex: 1,
                                                  pr: 1,
                                                  minWidth: 0,
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: "6px",
                                                    bgcolor: "#e0e7ff",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "#0056b3",
                                                    flexShrink: 0,
                                                  }}
                                                >
                                                  <FileUploadOutlinedIcon
                                                    sx={{ fontSize: 16 }}
                                                  />
                                                </Box>
                                                <Box sx={{ minWidth: 0 }}>
                                                  <Typography
                                                    noWrap
                                                    sx={{
                                                      fontWeight: 700,
                                                      color: "#1e293b",
                                                      fontSize: "0.85rem",
                                                    }}
                                                  >
                                                    {
                                                      stage.paymentDetails
                                                        .attachment.name
                                                    }
                                                  </Typography>
                                                  <Typography
                                                    variant="body2"
                                                    sx={{
                                                      color: "#64748b",
                                                      fontWeight: 600,
                                                      fontSize: "0.75rem",
                                                      lineHeight: 1,
                                                    }}
                                                  >
                                                    {
                                                      stage.paymentDetails
                                                        .attachment.size
                                                    }
                                                  </Typography>
                                                </Box>
                                              </Box>
                                              <IconButton
                                                size="small"
                                                sx={{
                                                  color: "#ef4444",
                                                  p: 0.5,
                                                }}
                                                onClick={() => {
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
                                            </Box>
                                          )}
                                        </Box>
                                      </Box>
                                      <Box sx={{ mb: 3 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            mb: 1,
                                            fontWeight: 800,
                                            color: "#374151",
                                            fontSize: "13px",
                                          }}
                                        >
                                          Payment Instructions{" "}
                                          <span style={{ color: "#111827" }}>
                                            *
                                          </span>
                                        </Typography>
                                        <TextField
                                          fullWidth
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
                                          placeholder="Enter payment instructions for the candidate..."
                                          sx={themeInputSx}
                                        />
                                      </Box>
                                    </Box>
                                  </Box>
                                )}
                              </AccordionDetails>
                            </Accordion>
                          );
                        })()}
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            <Box
              sx={{
                mt: "auto",
                pt: 4,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: { sm: "space-between" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              {/* Left: Discard (always) */}
              <Button
                variant="outlined"
                onClick={handleDiscard}
                disabled={loading}
                sx={{
                  borderRadius: "8px",
                  borderColor: "#fca5a5",
                  color: "#ef4444",
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { xs: 0, sm: "120px" },
                  px: { xs: 2, sm: 3 },
                  height: { xs: "44px", sm: "48px" },
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: { xs: "14px", sm: "15px" },
                  order: { xs: 3, sm: 0 },
                  "&:hover": {
                    borderColor: "#ef4444",
                    bgcolor: "rgba(239,68,68,0.05)",
                  },
                }}
              >
                {hasEnteredData
                  ? t("admissionBuilder.discardBtn")
                  : t("admissionBuilder.cancelBtn")}
              </Button>

              {/* Right group: Save Draft + Back + Next/Publish */}
              <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 }, flexWrap: { xs: "wrap", sm: "nowrap" }, width: { xs: "100%", sm: "auto" } }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSnackbar({
                      open: true,
                      message: t("admissionBuilder.draftSaved") || "Draft saved successfully",
                      severity: "success",
                    });
                    setTimeout(() => onClose(), 1500);
                  }}
                  disabled={loading}
                  sx={{
                    borderRadius: "8px",
                    borderColor: THEME_BORDER,
                    color: "#475569",
                    flex: { xs: "1 1 calc(50% - 6px)", sm: "0 0 auto" },
                    minWidth: { xs: 0, sm: "120px" },
                    px: { xs: 2, sm: 3 },
                    height: { xs: "44px", sm: "48px" },
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: { xs: "13px", sm: "15px" },
                    order: { xs: 2, sm: 0 },
                    "&:hover": {
                      borderColor: "#94a3b8",
                      bgcolor: "rgba(0,0,0,0.02)",
                    },
                  }}
                >
                  {t("admissionBuilder.saveDraftBtn") || "Save as Draft"}
                </Button>
                {activeStep > 0 && (
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(activeStep - 1)}
                    disabled={loading}
                    sx={{
                      borderRadius: "8px",
                      borderColor: THEME_BORDER,
                      color: "#475569",
                      flex: { xs: "1 1 calc(50% - 6px)", sm: "0 0 auto" },
                      minWidth: { xs: 0, sm: "120px" },
                      px: { xs: 2, sm: 3 },
                      height: { xs: "44px", sm: "48px" },
                      fontWeight: 700,
                      textTransform: "none",
                      fontSize: { xs: "13px", sm: "15px" },
                      order: { xs: 1, sm: 0 },
                      "&:hover": {
                        borderColor: "#94a3b8",
                        bgcolor: "rgba(0,0,0,0.02)",
                      },
                    }}
                  >
                    {t("admissionBuilder.backBtn")}
                  </Button>
                )}
                <Button
                  variant="contained"
                  disableElevation
                  onClick={
                    activeStep < 2
                      ? () => setActiveStep(activeStep + 1)
                      : handleSubmit
                  }
                  disabled={
                    loading ||
                    (() => {
                      if (activeStep === 0)
                        return (
                          !workflowTitle.trim() ||
                          !academicYear ||
                          !workflowDesc.trim()
                        );
                      if (activeStep === 1)
                        return !publishDate || !expiryDate || !maxCandidates;
                      if (activeStep === 2) {
                        if (stages.length === 0) return true;
                        return stages.some((s) => {
                          if (
                            !s.title.trim() ||
                            !s.startDateOnly ||
                            !s.startTimeOnly ||
                            !s.endDateOnly ||
                            !s.endTimeOnly
                          )
                            return true;
                          if (s.type === "document") {
                            const hasSelection = (s.selectedFields && s.selectedFields.length > 0) || (s.academicRecordsConfig && s.academicRecordsConfig.length > 0);
                            const hasEmptyRecord = s.academicRecordsConfig && s.academicRecordsConfig.some(r => !r.name.trim());
                            return !hasSelection || hasEmptyRecord;
                          }
                          if (s.type === "payment")
                            return (
                              !s.paymentDetails?.amount ||
                              !s.paymentDetails?.currency
                            );
                          if (s.type === "quiz")
                            return (
                              !s.quizAttachments || s.quizAttachments.length === 0
                            );
                          if (s.type === "interview")
                            return (
                              !s.interviewDetails?.meetingLink?.trim() ||
                              !s.interviewDetails?.passcode?.trim()
                            );
                          return false;
                        });
                      }
                      return false;
                    })()
                  }
                  sx={{
                    borderRadius: "8px",
                    flex: { xs: "0 0 100%", sm: "0 0 auto" },
                    minWidth: { xs: 0, sm: "140px" },
                    px: { xs: 2, sm: 3 },
                    height: { xs: "44px", sm: "48px" },
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: { xs: "14px", sm: "15px" },
                    order: { xs: 0, sm: 0 },
                    background: (() => {
                      const stageIncomplete =
                        activeStep === 2 &&
                        (stages.length === 0 ||
                          stages.some(
                            (s) =>
                              !s.title.trim() ||
                              !s.startDateOnly ||
                              !s.startTimeOnly ||
                              !s.endDateOnly ||
                              !s.endTimeOnly ||
                              (s.type === "document" &&
                                (!((s.selectedFields && s.selectedFields.length > 0) || (s.academicRecordsConfig && s.academicRecordsConfig.length > 0)) ||
                                  (s.academicRecordsConfig && s.academicRecordsConfig.some(r => !r.name.trim())))) ||
                              (s.type === "payment" &&
                                (!s.paymentDetails?.amount ||
                                  !s.paymentDetails?.currency)),
                          ));
                      const isDisabled =
                        loading ||
                        (activeStep === 0 &&
                          (!workflowTitle.trim() ||
                            !academicYear ||
                            !workflowDesc.trim())) ||
                        (activeStep === 1 &&
                          (!publishDate || !expiryDate || !maxCandidates)) ||
                        stageIncomplete;
                      return isDisabled
                        ? "#e2e8f0"
                        : "linear-gradient(135deg, #0056b3 0%, #28a745 100%)";
                    })(),
                    color: (() => {
                      const stageIncomplete =
                        activeStep === 2 &&
                        (stages.length === 0 ||
                          stages.some(
                            (s) =>
                              !s.title.trim() ||
                              !s.startDateOnly ||
                              !s.startTimeOnly ||
                              !s.endDateOnly ||
                              !s.endTimeOnly ||
                              (s.type === "document" &&
                                (!((s.selectedFields && s.selectedFields.length > 0) || (s.academicRecordsConfig && s.academicRecordsConfig.length > 0)) ||
                                  (s.academicRecordsConfig && s.academicRecordsConfig.some(r => !r.name.trim())))) ||
                              (s.type === "payment" &&
                                (!s.paymentDetails?.amount ||
                                  !s.paymentDetails?.currency)),
                          ));
                      const isDisabled =
                        loading ||
                        (activeStep === 0 &&
                          (!workflowTitle.trim() ||
                            !academicYear ||
                            !workflowDesc.trim())) ||
                        (activeStep === 1 &&
                          (!publishDate || !expiryDate || !maxCandidates)) ||
                        stageIncomplete;
                      return isDisabled ? "#94a3b8" : "#ffffff";
                    })(),
                    boxShadow: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: (() => {
                        const stageIncomplete =
                          activeStep === 2 &&
                          (stages.length === 0 ||
                            stages.some(
                              (s) =>
                                !s.title.trim() ||
                                !s.startDateOnly ||
                                !s.startTimeOnly ||
                                !s.endDateOnly ||
                                !s.endTimeOnly ||
                                (s.type === "document" &&
                                  (!((s.selectedFields && s.selectedFields.length > 0) || (s.academicRecordsConfig && s.academicRecordsConfig.length > 0)) ||
                                    (s.academicRecordsConfig && s.academicRecordsConfig.some(r => !r.name.trim())))) ||
                                (s.type === "payment" &&
                                  (!s.paymentDetails?.amount ||
                                    !s.paymentDetails?.currency)),
                            ));
                        const isDisabled =
                          loading ||
                          (activeStep === 0 &&
                            (!workflowTitle.trim() ||
                              !academicYear ||
                              !workflowDesc.trim())) ||
                          (activeStep === 1 &&
                            (!publishDate || !expiryDate || !maxCandidates)) ||
                          stageIncomplete;
                        return isDisabled
                          ? "#e2e8f0"
                          : "linear-gradient(135deg, #004494 0%, #218838 100%)";
                      })(),
                      boxShadow: "none",
                    },
                    "&.Mui-disabled": {
                      background: "#f1f5f9",
                      color: "#94a3b8",
                    },
                  }}
                >
                  {activeStep < 2
                    ? t("admissionBuilder.nextBtn")
                    : loading
                      ? editData
                        ? "Updating..."
                        : "Publishing..."
                      : editData
                        ? "Update Workflow"
                        : t("admissionBuilder.publishBtn")}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Menu
          onClick={(e) => e.stopPropagation()}
          anchorReference={quizMenuAnchorPos ? "anchorPosition" : "anchorEl"}
          anchorPosition={
            quizMenuAnchorPos
              ? { top: quizMenuAnchorPos.top, left: quizMenuAnchorPos.left }
              : undefined
          }
          anchorEl={quizMenuAnchorEl}
          open={Boolean(quizMenuAnchorPos || quizMenuAnchorEl)}
          onClose={() => {
            setQuizMenuAnchorEl(null);
            setQuizMenuAnchorPos(null);
          }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: "8px",
              minWidth: "320px",
              maxHeight: "320px",
              boxShadow: "none",
              border: themeBorderSx,
            },
          }}
        >
          <Box sx={{ p: 1.5, pb: 0.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#f1f5f9",
                borderRadius: "8px",
                px: 1.5,
                py: 0.5,
              }}
            >
              <SearchIcon sx={{ color: "#64748b", fontSize: 20, mr: 1 }} />
              <InputBase
                placeholder={t("admissionBuilder.searchQuizzesPlaceholder")}
                value={quizSearchQuery}
                onChange={(e) => setQuizSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                sx={{ flex: 1, fontSize: "0.875rem" }}
              />
            </Box>
          </Box>
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 1,
              display: "block",
              color: "#64748b",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {t("admissionBuilder.cloudQuizzesLabel")}
          </Typography>
          {MOCK_QUIZZES.filter((q) =>
            q.name.toLowerCase().includes(quizSearchQuery.toLowerCase()),
          ).map((quiz) => {
            const isSelected =
              activeQuizStageId &&
              stages
                .find((s) => s.id === activeQuizStageId)
                ?.quizAttachments?.find((q) => q.id === quiz.id);
            return (
              <MenuItem
                key={quiz.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSelected) {
                    handleRemoveQuiz(activeQuizStageId, quiz.id);
                  } else {
                    handleAttachQuiz(activeQuizStageId, quiz);
                  }
                }}
                sx={{ py: 1, "&:hover": { bgcolor: "#f1f5f9" } }}
              >
                <Checkbox
                  checked={!!isSelected}
                  size="small"
                  icon={
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 3,
                        border: "1.5px solid #94a3b8",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                  }
                  checkedIcon={
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 3,
                        background: "#0056b3",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg viewBox="0 0 12 12" width="10" height="10">
                        <polyline
                          points="1.5,6 5,9.5 10.5,2.5"
                          stroke="white"
                          strokeWidth="1.8"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  }
                  sx={{ mr: 1, p: 0 }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    pr: 2,
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    noWrap
                    sx={{
                      fontWeight: 700,
                      color: "#1e293b",
                      fontSize: "1rem",
                      fontFamily: '"Rozha One", serif',
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "260px",
                    }}
                  >
                    {quiz.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      fontFamily: '"Inter", sans-serif',
                      flexShrink: 0,
                      ml: 2,
                    }}
                  >
                    {quiz.size}
                  </Typography>
                </Box>
              </MenuItem>
            );
          })}
          {MOCK_QUIZZES.filter((q) =>
            q.name.toLowerCase().includes(quizSearchQuery.toLowerCase()),
          ).length === 0 && (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  {t("admissionBuilder.noQuizzesFound")}
                </Typography>
              </Box>
            )}
        </Menu>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
