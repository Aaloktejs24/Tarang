"use client";
import React from 'react';
import { Box, Typography, Container, Paper, CircularProgress, Chip, Divider, Grid, TextField, Tooltip, IconButton, Snackbar, Alert, Stepper, Step, StepLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import TarangButton from '../../../components/common/TarangButton';
import { useParams } from 'next/navigation';

import { useAppRouter as useRouter } from '../../../hooks/useAppRouter';
import { useProfile } from '../../../hooks/useProfile';
import { useBreadcrumbs } from '../../../contexts/BreadcrumbContext';
import { useToast } from '../../../contexts/ToastContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import { getApplicationHistory, updateApplicationProgress } from '../admissionService';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomFloatingInput } from '../../../components/common/FloatingFields';
import CustomCheckbox from '../../../components/common/Checkbox';
import { GlassPopover } from '../../../components/common/GlassPopover';
import { CustomTooltip } from '../../../components/common/Tooltip';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';


export default function ApplicationReviewModal({ open, onClose, programId, appId, preloadedData }) {
  const router = useRouter();
  const { profile } = useProfile();
  const isSubmitting = React.useRef(false);

  const [application, setApplication] = React.useState(null);
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [processingAction, setProcessingAction] = React.useState(null);
  const [feedback, setFeedback] = React.useState('');
  const [selectedFields, setSelectedFields] = React.useState({});
  const [fieldComments, setFieldComments] = React.useState({});
  const [commentAnchorEl, setCommentAnchorEl] = React.useState(null);
  const [isSelectionMode, setIsSelectionMode] = React.useState(false);
  const saveTimeoutRef = React.useRef(null);
  const isFetchingRef = React.useRef(false);
  const initialLoadDoneRef = React.useRef(false);
  const { showToast } = useToast();
  const confirm = useConfirm();
  const handleToggleField = (id) => {
    setSelectedFields(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isGroupSelected = (fieldIds) => {
    if (!fieldIds || fieldIds.length === 0) return false;
    return fieldIds.every(id => selectedFields[id]);
  };

  const isGroupIndeterminate = (fieldIds) => {
    if (!fieldIds || fieldIds.length === 0) return false;
    const selectedCount = fieldIds.filter(id => selectedFields[id]).length;
    return selectedCount > 0 && selectedCount < fieldIds.length;
  };


  const handleToggleGroup = (fieldIds, isChecked) => {
    if (!fieldIds) return;
    setSelectedFields(prev => {
      const next = { ...prev };
      fieldIds.forEach(id => {
        next[id] = isChecked;
      });
      return next;
    });
  };

  const rawInstituteName = profile ? (profile.primary_name || profile.full_name || profile.username) : 'Institute';
  const breadcrumbInstituteName = formatBreadcrumbName(rawInstituteName);

  React.useEffect(() => {
    if (!appId) return;
    const fetchApp = async () => {
      try {
        isFetchingRef.current = true;
        let data = preloadedData;
        const hasPreloaded = data && data.application?.id === appId;
        if (!hasPreloaded) {
          setLoading(true);
          data = await getApplicationHistory(appId);
        }
        if (data.application) {
          setApplication(data.application);
          setTransactions(data.transactions || []);

          let dbFields = {};
          let dbComments = {};
          try {
            if (typeof data.application.metadata === 'string') {
              const meta = JSON.parse(data.application.metadata);
              dbFields = meta.selectedFields || {};
              dbComments = meta.fieldComments || {};
            } else if (data.application.metadata) {
              dbFields = data.application.metadata.selectedFields || {};
              dbComments = data.application.metadata.fieldComments || {};
            }
          } catch (e) {
            console.error('Metadata parse error', e);
          }
          setSelectedFields(dbFields);
          setFieldComments(dbComments);
        }
      } catch (err) {
        console.error('Failed to fetch application:', err);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
        setTimeout(() => initialLoadDoneRef.current = true, 100);
      }
    };
    fetchApp();
  }, [appId]);

  React.useEffect(() => {
    if (!initialLoadDoneRef.current || isFetchingRef.current || !application || !appId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        let currentMeta = {};
        try {
          if (typeof application.metadata === 'string') {
            currentMeta = JSON.parse(application.metadata);
          } else if (application.metadata) {
            currentMeta = { ...application.metadata };
          }
        } catch (e) { }

        const newMeta = { ...currentMeta, selectedFields, fieldComments };
        await updateApplicationProgress(appId, 'AUTO_SAVE_SELECTION', newMeta, profile?.id || '', application.current_stage_index, application.status);
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 1000);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [selectedFields, fieldComments, application, appId, profile]);
  const handleViewProof = (url, name) => {
    if (!url) return;
    const lowerUrl = url.toLowerCase();
    const isPdf = lowerUrl.endsWith('.pdf') || lowerUrl.includes('.pdf?') || lowerUrl.includes('mime=application%2fpdf') || lowerUrl.includes('response-content-type=application%2fpdf');
    if (isPdf) {
      window.open(`/viewer/pdf?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name || 'Document')}`, '_blank');
    } else {
      window.open(url, '_blank');
    }
  };

  const handleApprove = async () => {
    if (!application) return;
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setProcessingAction('approve');
    try {
      const isFinal = application.status === 'pending_final_review';
      const newIndex = application.current_stage_index + (isFinal ? 0 : 1);
      const newStatus = isFinal ? 'approved' : 'in_progress';

      const res = await updateApplicationProgress(appId, 'STAGE_APPROVED', {
        note: feedback || 'Approved by institute'
      }, profile?.id || '', newIndex, newStatus);

      setApplication(res.application);
      showToast(isFinal ? 'Application fully approved!' : 'Step approved. Student can now proceed.', 'success');
      setTimeout(() => {
        onClose();
        isSubmitting.current = false;
        setProcessingAction(null);
      }, 1500);
    } catch (err) {
      console.error('Approval failed:', err);
      showToast('Failed to approve step.', 'error');
      isSubmitting.current = false;
      setProcessingAction(null);
    }
  };

  const handleReject = async () => {
    if (!application) return;
    if (!feedback) {
      showToast("Please provide a suggestion/reason for rejection.", "error");
      return;
    }
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setProcessingAction('reject');
    try {
      const res = await updateApplicationProgress(appId, 'STAGE_REJECTED', {
        note: feedback
      }, profile?.id || '', application.current_stage_index, 'rejected');

      setApplication(res.application);
      showToast('Submission rejected. Student has been notified to resubmit.', 'warning');
      setTimeout(() => {
        onClose();
        isSubmitting.current = false;
        setProcessingAction(null);
      }, 1500);
    } catch (err) {
      console.error('Rejection failed:', err);
      showToast('Failed to reject step.', 'error');
      isSubmitting.current = false;
      setProcessingAction(null);
    }
  };

  const handleRequestUpdate = async () => {
    if (!application) return;
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setProcessingAction('requestUpdate');
    try {
      let currentMeta = {};
      if (application.metadata) {
        try {
          if (typeof application.metadata === 'string') {
            currentMeta = JSON.parse(application.metadata);
          } else {
            currentMeta = { ...application.metadata };
          }
        } catch (e) { }
      }
      const newMeta = { ...currentMeta, selectedFields, fieldComments };

      const res = await updateApplicationProgress(
        appId,
        'UPDATE_REQUESTED',
        newMeta,
        profile?.id || '',
        application.current_stage_index,
        'rejected'
      );

      setApplication(res.application);
      showToast('Update requested. Student has been notified to resubmit specific fields.', 'info');
      setTimeout(() => {
        onClose();
        isSubmitting.current = false;
        setProcessingAction(null);
      }, 1500);
    } catch (err) {
      console.error('Update request failed:', err);
      showToast('Failed to request update.', 'error');
      isSubmitting.current = false;
      setProcessingAction(null);
    }
  };

  const handleDecline = async () => {
    if (!application) return;
    
    const isConfirmed = await confirm({
      title: "Decline Application",
      message: "Are you sure you want to permanently decline this application?",
      confirmText: "Decline",
      cancelText: "Cancel",
      variant: "danger"
    });
    
    if (!isConfirmed) return;

    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setProcessingAction('decline');
    try {
      const res = await updateApplicationProgress(appId, 'APPLICATION_DECLINED', {
        note: feedback || 'Application declined by institute'
      }, profile?.id || '', application.current_stage_index, 'declined');

      setApplication(res.application);
      showToast('Application permanently declined.', 'success');
      setTimeout(() => {
        onClose();
        isSubmitting.current = false;
        setProcessingAction(null);
      }, 1500);
    } catch (err) {
      console.error('Decline failed:', err);
      showToast(err.response?.data?.message || 'Failed to decline application', 'error');
      isSubmitting.current = false;
      setProcessingAction(null);
    }
  };

  const latestSubmission = [...transactions].reverse().find(t => t.action_type === 'STAGE_SUBMITTED' || t.action_type === 'PROCEED_NEXT_STAGE');
  let submittedData = {};
  if (latestSubmission && latestSubmission.metadata) {
    try {
      submittedData = JSON.parse(latestSubmission.metadata);
    } catch (e) {
      console.error('Failed to parse metadata', e);
    }
  }

  const isPendingReview = ['pending', 'pending_review', 'pending_final_review', 'rejected'].includes(application?.status);
  const currentStageIndex = application?.current_stage_index || 0;
  const stageName = application?.program?.stages?.[currentStageIndex]?.title || `Step ${currentStageIndex + 1}`;

  const groups = React.useMemo(() => {
    if (!submittedData.basic_details) return {};

    const personal = [
      'personal_Full Name', 'personal_Email', 'personal_Phone', 'personal_DOB',
      'personal_Nationality', 'personal_Gender', 'personal_Caste',
      'personal_Sub-caste', 'personal_Birth Religion', 'personal_Current Religion',
      'personal_Race/Ethnicity', 'personal_Language'
    ];

    const father = ['father_Name', 'father_Contact', 'father_Profession', 'father_Income', 'father_Location'].map(id => `parents_${id}`);
    const mother = ['mother_Name', 'mother_Contact', 'mother_Profession', 'mother_Income', 'mother_Location'].map(id => `parents_${id}`);
    const guardian = ['guardian_Name', 'guardian_Contact', 'guardian_Profession', 'guardian_Income', 'guardian_Location'].map(id => `parents_${id}`);
    const parents = [...father, ...mother, ...guardian];

    const otherInfo = [
      { id: 'other_Family Income', val: submittedData.basic_details.familyIncome },
      { id: 'other_Has Sibling', val: submittedData.basic_details.hasSibling },
      { id: 'other_Has Criminal Record', val: submittedData.basic_details.hasCriminalRecord },
      { id: 'other_Permanent Address', val: submittedData.basic_details.permanentAddress },
      { id: 'other_Correspondence Address', val: submittedData.basic_details.correspondenceAddress }
    ].filter(f => !!f.val).map(f => f.id);

    const academic = (submittedData.basic_details.academicRecords || []).map((_, i) => `academic_${i}`);
    const siblings = (submittedData.basic_details.siblings || []).map((_, i) => `sibling_${i}`);
    const criminal = (submittedData.basic_details.criminalRecords || []).map((_, i) => `criminal_${i}`);

    const basicDetailsAll = [...personal, ...parents, ...otherInfo, ...academic, ...siblings, ...criminal];

    return { personal, father, mother, guardian, parents, otherInfo, academic, siblings, criminal, basicDetailsAll };
  }, [submittedData.basic_details]);
  const isAllSelected = React.useMemo(() => {
    if (!submittedData?.basic_details || !groups) return false;
    const allFieldIds = [
      ...(groups.personal || []), ...(groups.parents || []), ...(groups.father || []), ...(groups.mother || []), ...(groups.guardian || []), ...(groups.otherInfo || []),
      ...(submittedData.basic_details.academicRecords?.map((_, i) => `academic_${i}`) || []),
      ...(submittedData.basic_details.siblings?.map((_, i) => `sibling_${i}`) || []),
      ...(submittedData.basic_details.criminalRecords?.map((_, i) => `criminal_${i}`) || [])
    ];
    return allFieldIds.length > 0 && allFieldIds.every(id => selectedFields[id]);
  }, [groups, submittedData, selectedFields]);

  const isAnySelected = Object.keys(selectedFields).some(id => selectedFields[id]);


  const renderDetailItem = (id, label, value, proofDoc, colProps) => {
    if (!value) return null;
    return (
      <TableRow key={id} sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
        <TableCell component="th" scope="row" sx={{ width: { xs: '35%', sm: '25%' }, bgcolor: 'transparent', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1.5, px: 2, textAlign: 'left', verticalAlign: 'middle' }}>
          {label}
        </TableCell>
        <TableCell sx={{ color: 'var(--color-slate-900)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1.5, px: 2, textAlign: 'left', verticalAlign: 'middle' }}>
          <Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)', wordBreak: 'break-word', textAlign: 'left' }}>{value}</Typography>
        </TableCell>
        <TableCell align="center" sx={{ width: '60px', verticalAlign: 'middle', borderBottom: '1px solid var(--color-slate-300)', borderRight: isSelectionMode ? '1px solid var(--color-slate-300)' : 'none', py: 1.5, px: 1 }}>
          {proofDoc && (
            <CustomTooltip title="View Proof">
              <IconButton size="small" sx={{ p: 0.5 }} onClick={() => handleViewProof(proofDoc, label)}>
                <AttachFileIcon sx={{ fontSize: 16, color: 'var(--color-slate-500)' }} />
              </IconButton>
            </CustomTooltip>
          )}
        </TableCell>
        {isSelectionMode && (
          <TableCell align="center" sx={{ width: '48px', verticalAlign: 'middle', borderBottom: '1px solid var(--color-slate-300)', py: 1.5, px: 1 }}>
            <CustomCheckbox
              size={18}
              sx={{ p: 0, display: 'inline-flex' }}
              checked={!!selectedFields[id]}
              onChange={() => handleToggleField(id)}
            />
          </TableCell>
        )}
      </TableRow>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
            overflow: "auto"
          }}
        >
          <Paper
            onClick={(e) => e.stopPropagation()}
            elevation={0}
            component={motion.div}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
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
              overflowY: "hidden",
              maxHeight: "92vh",
              position: "relative"
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: { xs: 12, sm: 20 },
                right: { xs: 12, sm: 24 },
                display: 'flex',
                gap: 1,
                zIndex: 'var(--z-sticky)'
              }}
            >
              <CustomTooltip title="Close">
                <IconButton
                  onClick={onClose}
                  disableRipple
                  sx={{
                    color: 'var(--color-slate-500)',
                    '&:hover': { bgcolor: 'transparent' },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </CustomTooltip>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
                <CircularProgress />
              </Box>
            ) : !application ? (
              <Box sx={{ textAlign: 'center', p: 10 }}>
                <Typography variant="h6" color="text.secondary">Application not found</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ pt: { xs: 6, sm: 8 }, px: { xs: 3, sm: 8 }, pb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)' }}>
                        Review Submission
                      </Typography>
                    </Box>
                    {isSelectionMode && (
                      <CustomCheckbox size={18}
                        label="Select All"
                        checked={isAllSelected}
                        indeterminate={isAnySelected && !isAllSelected}
                        onChange={(e) => {
                          const allFieldIds = [
                            ...groups.personal, ...groups.parents, ...groups.father, ...groups.mother, ...groups.guardian, ...groups.otherInfo,
                            ...(application.academic_records ? application.academic_records.map((_, i) => `academic_${i}`) : []),
                            ...(application.siblings ? application.siblings.map((_, i) => `sibling_${i}`) : []),
                            ...(application.criminal_records ? application.criminal_records.map((_, i) => `criminal_${i}`) : []),
                            ...(submittedData.uploaded_docs ? Object.keys(submittedData.uploaded_docs).map(reqName => `doc_${reqName}`) : [])
                          ];
                          handleToggleGroup(allFieldIds, e.target.checked);
                        }}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                </Box>

                <Box sx={{ minHeight: 0, overflowY: 'auto', px: { xs: 3, sm: 8 }, pt: 0, pb: 0 }}>
                  {application?.program?.stages && application.program.stages.length > 0 && (
                    <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
                      {application.program.stages.map((stage, index) => (
                        <Box key={index} sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
                          <Box sx={{ height: 4, borderRadius: 'var(--radius-md)', bgcolor: currentStageIndex >= index ? "var(--color-primary)" : "var(--color-slate-200)", transition: "all var(--transition-slow)" }} />
                          <Typography variant="caption" sx={{ fontWeight: 'var(--font-bold)', color: currentStageIndex >= index ? "var(--color-primary)" : "var(--color-slate-500)", fontSize: "var(--font-xs)" }}>
                            {stage.title}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  {submittedData.basic_details && (
                    <Box sx={{ bgcolor: 'var(--card-bg)', backdropFilter: 'var(--card-blur)', pt: 3, px: 3, pb: 0, borderRadius: 'var(--radius-lg)', border: 'var(--border-thin) solid var(--card-border)', mb: 2, display: 'flex', flexDirection: 'column', maxHeight: '55vh' }}>
                      <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-slate-800)' }}>
                            Applicant Basic Details
                          </Typography>
                          {isSelectionMode && (
                            <CustomCheckbox size={18}
                              sx={{ p: 0.5 }}
                              checked={isGroupSelected(groups.basicDetailsAll)}
                              indeterminate={isGroupIndeterminate(groups.basicDetailsAll)}
                              onChange={(e) => handleToggleGroup(groups.basicDetailsAll, e.target.checked)}
                            />
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isSelectionMode && (
                            <>
                              <TarangButton
                                variant="primary"
                                size="sm"
                                onClick={(e) => setCommentAnchorEl(e.currentTarget)}
                                sx={{ height: '36px' }}
                              >
                                Comment
                              </TarangButton>
                              <GlassPopover
                                open={Boolean(commentAnchorEl)}
                                anchorEl={commentAnchorEl}
                                onClose={() => setCommentAnchorEl(null)}
                                anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'right'
                                }}
                                transformOrigin={{
                                  vertical: 'top',
                                  horizontal: 'right'
                                }}
                                sx={{ width: 450, maxHeight: 400, mt: 1, display: 'flex', flexDirection: 'column' }}
                              >
                                <Box sx={{ p: 2, pb: 1.5, borderBottom: 'var(--border-thin) solid var(--color-slate-200)', flexShrink: 0 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)' }}>Comments</Typography>
                                </Box>
                                <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
                                  {Object.keys(selectedFields).filter(id => selectedFields[id]).length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">No fields selected.</Typography>
                                  ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                                      {Object.keys(selectedFields).filter(id => selectedFields[id]).map(id => {
                                        const formatFieldLabel = (id) => {
                                          if (id.startsWith('personal_')) return id.replace('personal_', '');
                                          if (id.startsWith('parents_father_')) return 'Father ' + id.replace('parents_father_', '');
                                          if (id.startsWith('parents_mother_')) return 'Mother ' + id.replace('parents_mother_', '');
                                          if (id.startsWith('parents_guardian_')) return 'Guardian ' + id.replace('parents_guardian_', '');
                                          if (id.startsWith('other_')) return id.replace('other_', '');
                                          if (id.startsWith('academic_')) return `Academic Record ${parseInt(id.replace('academic_', '')) + 1}`;
                                          if (id.startsWith('sibling_')) return `Sibling ${parseInt(id.replace('sibling_', '')) + 1}`;
                                          if (id.startsWith('criminal_')) return `Criminal Record ${parseInt(id.replace('criminal_', '')) + 1}`;
                                          return id;
                                        };
                                        return (
                                          <CustomFloatingInput
                                            key={id}
                                            label={formatFieldLabel(id)}
                                            multiline={true}
                                            rows={2}
                                            value={fieldComments[id] || ''}
                                            onChange={(e) => setFieldComments(prev => ({ ...prev, [id]: e.target.value }))}
                                          />
                                        );
                                      })}
                                    </Box>
                                  )}
                                </Box>
                              </GlassPopover>
                            </>
                          )}
                          {!['approved', 'enrolled'].includes(application?.status) && (
                            <TarangButton
                              variant="outlined"
                              size="sm"
                              onClick={() => setIsSelectionMode(!isSelectionMode)}
                              sx={{ height: '36px' }}
                            >
                              {isSelectionMode ? 'Cancel Selection' : 'Select Fields'}
                            </TarangButton>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 1, pb: 3, mr: -1 }}>
                      {/* Personal Information */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, mt: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--color-slate-700)' }}>Personal Information</Typography>
                        {isSelectionMode && (<Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CustomCheckbox size={18} sx={{ p: 0.5 }} checked={isGroupSelected(groups.personal)} indeterminate={isGroupIndeterminate(groups.personal)} onChange={(e) => handleToggleGroup(groups.personal, e.target.checked)} />
                        </Box>)}
                      </Box>
                      <TableContainer sx={{ mb: 3, borderRadius: 0, border: '1px solid var(--color-slate-300)', overflow: 'hidden' }}>
                        <Table size="small">
                          <TableBody>
                            {[
                              { label: "Full Name", value: submittedData.basic_details.fullName, proof: submittedData.basic_details.nameProof },
                              { label: "Email", value: submittedData.basic_details.email },
                              { label: "Phone", value: submittedData.basic_details.phone },
                              { label: "DOB", value: submittedData.basic_details.dob, proof: submittedData.basic_details.dobProof },
                              { label: "Nationality", value: submittedData.basic_details.nationality, proof: submittedData.basic_details.nationalityProof },
                              { label: "Gender", value: submittedData.basic_details.gender, proof: submittedData.basic_details.genderProof },
                              { label: "Caste", value: submittedData.basic_details.caste, proof: submittedData.basic_details.casteProof },
                              { label: "Sub-caste", value: submittedData.basic_details.subcaste },
                              { label: "Birth Religion", value: submittedData.basic_details.religionByBirth },
                              { label: "Current Religion", value: submittedData.basic_details.currentReligion },
                              { label: "Race/Ethnicity", value: submittedData.basic_details.raceEthnicity },
                              { label: "Language", value: submittedData.basic_details.language },
                            ].map((item, idx) => renderDetailItem(`personal_${item.label}`, item.label, item.value, item.proof))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Divider sx={{ mb: 2, borderColor: 'rgba(226, 232, 240, 0.6)' }} />

                      {/* Parents & Guardian Details */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--color-slate-700)' }}>Parents & Guardian Details</Typography>
                        {isSelectionMode && (<Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CustomCheckbox size={18} sx={{ p: 0.5 }} checked={isGroupSelected(groups.parents)} indeterminate={isGroupIndeterminate(groups.parents)} onChange={(e) => handleToggleGroup(groups.parents, e.target.checked)} />
                        </Box>)}
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5, mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', fontSize: '0.75rem' }}>Father&apos;s Details</Typography>
                          {isSelectionMode && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CustomCheckbox size={18} sx={{ p: 0.5 }} checked={isGroupSelected(groups.father)} indeterminate={isGroupIndeterminate(groups.father)} onChange={(e) => handleToggleGroup(groups.father, e.target.checked)} />
                            </Box>
                          )}
                        </Box>
                        <TableContainer sx={{ borderRadius: 0, border: '1px solid var(--color-slate-300)', overflow: 'hidden' }}>
                          <Table size="small">
                            <TableBody>
                              {[
                                { label: "Name", value: submittedData.basic_details.fatherName, proof: submittedData.basic_details.fatherRelationDoc },
                                { label: "Contact", value: submittedData.basic_details.fatherContact },
                                { label: "Profession", value: submittedData.basic_details.fatherProfession },
                                { label: "Income", value: submittedData.basic_details.fatherIncome, proof: submittedData.basic_details.fatherIncomeDoc },
                                { label: "Location", value: submittedData.basic_details.fatherLocation },
                              ].map((item, idx) => renderDetailItem(`parents_father_${item.label}`, item.label, item.value, item.proof))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5, mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', fontSize: '0.75rem' }}>Mother&apos;s Details</Typography>
                          {isSelectionMode && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CustomCheckbox size={18} sx={{ p: 0.5 }} checked={isGroupSelected(groups.mother)} indeterminate={isGroupIndeterminate(groups.mother)} onChange={(e) => handleToggleGroup(groups.mother, e.target.checked)} />
                            </Box>
                          )}
                        </Box>
                        <TableContainer sx={{ borderRadius: 0, border: '1px solid var(--color-slate-300)', overflow: 'hidden' }}>
                          <Table size="small">
                            <TableBody>
                              {[
                                { label: "Name", value: submittedData.basic_details.motherName, proof: submittedData.basic_details.motherRelationDoc },
                                { label: "Contact", value: submittedData.basic_details.motherContact },
                                { label: "Profession", value: submittedData.basic_details.motherProfession },
                                { label: "Income", value: submittedData.basic_details.motherIncome, proof: submittedData.basic_details.motherIncomeDoc },
                                { label: "Location", value: submittedData.basic_details.motherLocation },
                              ].map((item, idx) => renderDetailItem(`parents_mother_${item.label}`, item.label, item.value, item.proof))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>

                      {submittedData.basic_details.guardianName && (
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5, mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', fontSize: '0.75rem' }}>Guardian&apos;s Details</Typography>
                            {isSelectionMode && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CustomCheckbox size={18} sx={{ p: 0.5 }} checked={isGroupSelected(groups.guardian)} indeterminate={isGroupIndeterminate(groups.guardian)} onChange={(e) => handleToggleGroup(groups.guardian, e.target.checked)} />
                              </Box>
                            )}
                          </Box>
                          <TableContainer sx={{ borderRadius: 0, border: '1px solid var(--color-slate-300)', overflow: 'hidden' }}>
                            <Table size="small">
                              <TableBody>
                                {[
                                  { label: "Relation", value: submittedData.basic_details.guardianRelation === 'Other' ? submittedData.basic_details.guardianRelationOther : submittedData.basic_details.guardianRelation },
                                  { label: "Name", value: submittedData.basic_details.guardianName, proof: submittedData.basic_details.guardianRelationDoc },
                                  { label: "Contact", value: submittedData.basic_details.guardianContact },
                                  { label: "Profession", value: submittedData.basic_details.guardianProfession },
                                  { label: "Income", value: submittedData.basic_details.guardianIncome, proof: submittedData.basic_details.guardianIncomeDoc },
                                  { label: "Location", value: submittedData.basic_details.guardianLocation },
                                ].map((item, idx) => renderDetailItem(`parents_guardian_${item.label}`, item.label, item.value, item.proof))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}

                      <Divider sx={{ mb: 2, borderColor: 'rgba(226, 232, 240, 0.6)' }} />

                      {/* Other Info & Addresses */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--color-slate-700)' }}>Other Info & Addresses</Typography>
                        {isSelectionMode && (<Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CustomCheckbox size={18} sx={{ p: 0.5 }} checked={isGroupSelected(groups.otherInfo)} indeterminate={isGroupIndeterminate(groups.otherInfo)} onChange={(e) => handleToggleGroup(groups.otherInfo, e.target.checked)} />
                        </Box>)}
                      </Box>
                      <TableContainer sx={{ mb: 2, borderRadius: 0, border: '1px solid var(--color-slate-300)', overflow: 'hidden' }}>
                        <Table size="small">
                          <TableBody>
                            {[
                              { label: "Family Income", value: submittedData.basic_details.familyIncome },
                              { label: "Has Sibling", value: submittedData.basic_details.hasSibling },
                              { label: "Has Criminal Record", value: submittedData.basic_details.hasCriminalRecord },
                            ].map((item, idx) => renderDetailItem(`other_${item.label}`, item.label, item.value))}
                            {renderDetailItem("other_Permanent Address", "Permanent Address", (() => {
                              const addr = submittedData.basic_details.permanentAddress;
                              if (!addr || typeof addr === 'string') return addr || 'N/A';
                              const parts = [addr.houseNoAndName, addr.street, addr.landmark, addr.wardOrSector, addr.localBodyName, addr.district, addr.state, addr.country, addr.pincode].filter(Boolean);
                              return parts.length > 0 ? parts.join(', ') : 'N/A';
                            })(), submittedData.basic_details.permanentAddressProof)}
                            {renderDetailItem("other_Correspondence Address", "Correspondence Address", (() => {
                              const addr = submittedData.basic_details.correspondenceAddress;
                              if (!addr || typeof addr === 'string') return addr || 'N/A';
                              const parts = [addr.houseNoAndName, addr.street, addr.landmark, addr.wardOrSector, addr.localBodyName, addr.district, addr.state, addr.country, addr.pincode].filter(Boolean);
                              return parts.length > 0 ? parts.join(', ') : 'N/A';
                            })(), submittedData.basic_details.correspondenceAddressProof)}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {submittedData.basic_details.academicRecords && submittedData.basic_details.academicRecords.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5, mb: 1, mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', fontSize: '0.75rem' }}>Academic Records</Typography>
                            {isSelectionMode && (<Box sx={{ display: 'flex', alignItems: 'center' }}><CustomCheckbox size={18} sx={{ p: 0.5 }} checked={isGroupSelected(groups.academicRecords)} indeterminate={isGroupIndeterminate(groups.academicRecords)} onChange={(e) => handleToggleGroup(groups.academicRecords, e.target.checked)} /></Box>)}
                          </Box>
                          <TableContainer sx={{ borderRadius: 0, border: '1px solid var(--color-slate-300)', overflow: 'hidden' }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1, px: 2, textAlign: 'left' }}>Qualification</TableCell>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1, px: 2, textAlign: 'left' }}>Passing Year</TableCell>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1, px: 2, textAlign: 'left' }}>Percentage/CGPA</TableCell>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: isSelectionMode ? '1px solid var(--color-slate-300)' : 'none', py: 1, px: 1, textAlign: 'center', width: '60px' }}>Proof</TableCell>
                                  {isSelectionMode && (
                                    <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', py: 1, px: 1, textAlign: 'center', width: '48px' }}>Select</TableCell>
                                  )}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {submittedData.basic_details.academicRecords.map((rec, idx) => (
                                  <TableRow key={`academic_${idx}`} sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                                    <TableCell sx={{ color: 'var(--color-slate-900)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1.5, px: 2, textAlign: 'left', verticalAlign: 'middle' }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>{rec.qualification || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: 'var(--color-slate-900)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1.5, px: 2, textAlign: 'left', verticalAlign: 'middle' }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>{rec.passingYear || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: 'var(--color-slate-900)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1.5, px: 2, textAlign: 'left', verticalAlign: 'middle' }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>{rec.percentageCgpa || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ width: '60px', verticalAlign: 'middle', borderBottom: '1px solid var(--color-slate-300)', borderRight: isSelectionMode ? '1px solid var(--color-slate-300)' : 'none', py: 1.5, px: 1 }}>
                                      {rec.proof && (
                                        <CustomTooltip title="View Proof">
                                          <IconButton size="small" sx={{ p: 0.5 }} onClick={() => handleViewProof(rec.proof, `${rec.qualification || 'Academic'} Proof`)}>
                                            <AttachFileIcon sx={{ fontSize: 16, color: 'var(--color-slate-500)' }} />
                                          </IconButton>
                                        </CustomTooltip>
                                      )}
                                    </TableCell>
                                    {isSelectionMode && (
                                      <TableCell align="center" sx={{ width: '48px', verticalAlign: 'middle', borderBottom: '1px solid var(--color-slate-300)', py: 1.5, px: 1 }}>
                                        <CustomCheckbox size={18} sx={{ p: 0, display: 'inline-flex' }} checked={!!selectedFields[`academic_${idx}`]} onChange={() => handleToggleField(`academic_${idx}`)} />
                                      </TableCell>
                                    )}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}

                      {submittedData.basic_details.hasSibling === 'Yes' && submittedData.basic_details.siblings && submittedData.basic_details.siblings.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5, mb: 1, mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', fontSize: '0.75rem' }}>Siblings Details</Typography>
                            {isSelectionMode && (<Box sx={{ display: 'flex', alignItems: 'center' }}><CustomCheckbox size={18} sx={{ p: 0.5 }} checked={isGroupSelected(groups.siblings)} indeterminate={isGroupIndeterminate(groups.siblings)} onChange={(e) => handleToggleGroup(groups.siblings, e.target.checked)} /></Box>)}
                          </Box>
                          <TableContainer sx={{ borderRadius: 0, border: '1px solid var(--color-slate-300)', overflow: 'hidden' }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1, px: 2, textAlign: 'left' }}>Name</TableCell>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1, px: 2, textAlign: 'left' }}>Relation</TableCell>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1, px: 2, textAlign: 'left' }}>Profession</TableCell>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1, px: 2, textAlign: 'left' }}>Location</TableCell>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1, px: 2, textAlign: 'left' }}>Income</TableCell>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: isSelectionMode ? '1px solid var(--color-slate-300)' : 'none', py: 1, px: 1, textAlign: 'center', width: '60px' }}>Proof</TableCell>
                                  {isSelectionMode && (
                                    <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', py: 1, px: 1, textAlign: 'center', width: '48px' }}>Select</TableCell>
                                  )}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {submittedData.basic_details.siblings.map((sib, idx) => (
                                  <TableRow key={`sibling_${idx}`} sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                                    <TableCell sx={{ color: 'var(--color-slate-900)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1.5, px: 2, textAlign: 'left', verticalAlign: 'middle' }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>{sib.name || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: 'var(--color-slate-900)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1.5, px: 2, textAlign: 'left', verticalAlign: 'middle' }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>{sib.relation || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: 'var(--color-slate-900)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1.5, px: 2, textAlign: 'left', verticalAlign: 'middle' }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>{sib.profession || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: 'var(--color-slate-900)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1.5, px: 2, textAlign: 'left', verticalAlign: 'middle' }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>{sib.location || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: 'var(--color-slate-900)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1.5, px: 2, textAlign: 'left', verticalAlign: 'middle' }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>{sib.income || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ width: '60px', verticalAlign: 'middle', borderBottom: '1px solid var(--color-slate-300)', borderRight: isSelectionMode ? '1px solid var(--color-slate-300)' : 'none', py: 1.5, px: 1 }}>
                                      {sib.proof && (
                                        <CustomTooltip title="View Proof">
                                          <IconButton size="small" sx={{ p: 0.5 }} onClick={() => handleViewProof(sib.proof, `${sib.name || 'Sibling'} Proof`)}>
                                            <AttachFileIcon sx={{ fontSize: 16, color: 'var(--color-slate-500)' }} />
                                          </IconButton>
                                        </CustomTooltip>
                                      )}
                                    </TableCell>
                                    {isSelectionMode && (
                                      <TableCell align="center" sx={{ width: '48px', verticalAlign: 'middle', borderBottom: '1px solid var(--color-slate-300)', py: 1.5, px: 1 }}>
                                        <CustomCheckbox size={18} sx={{ p: 0, display: 'inline-flex' }} checked={!!selectedFields[`sibling_${idx}`]} onChange={() => handleToggleField(`sibling_${idx}`)} />
                                      </TableCell>
                                    )}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}

                      {submittedData.basic_details.hasCriminalRecord === 'Yes' && submittedData.basic_details.criminalRecords && submittedData.basic_details.criminalRecords.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5, mb: 1, mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', fontSize: '0.75rem' }}>Criminal Records</Typography>
                            {isSelectionMode && (<Box sx={{ display: 'flex', alignItems: 'center' }}><CustomCheckbox size={18} sx={{ p: 0.5 }} checked={isGroupSelected(groups.criminalRecords)} indeterminate={isGroupIndeterminate(groups.criminalRecords)} onChange={(e) => handleToggleGroup(groups.criminalRecords, e.target.checked)} /></Box>)}
                          </Box>
                          <TableContainer sx={{ borderRadius: 0, border: '1px solid var(--color-slate-300)', overflow: 'hidden' }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1, px: 2, textAlign: 'left' }}>Offense Type</TableCell>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1, px: 2, textAlign: 'left' }}>Status</TableCell>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1, px: 2, textAlign: 'left' }}>Year</TableCell>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: isSelectionMode ? '1px solid var(--color-slate-300)' : 'none', py: 1, px: 1, textAlign: 'center', width: '60px' }}>Proof</TableCell>
                                  {isSelectionMode && (
                                    <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', py: 1, px: 1, textAlign: 'center', width: '48px' }}>Select</TableCell>
                                  )}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {submittedData.basic_details.criminalRecords.map((rec, idx) => (
                                  <TableRow key={`criminal_${idx}`} sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                                    <TableCell sx={{ color: 'var(--color-slate-900)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1.5, px: 2, textAlign: 'left', verticalAlign: 'middle' }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>{rec.offenseType || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: 'var(--color-slate-900)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1.5, px: 2, textAlign: 'left', verticalAlign: 'middle' }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>{rec.status || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: 'var(--color-slate-900)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1.5, px: 2, textAlign: 'left', verticalAlign: 'middle' }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>{rec.year || 'N/A'}</Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ width: '60px', verticalAlign: 'middle', borderBottom: '1px solid var(--color-slate-300)', borderRight: isSelectionMode ? '1px solid var(--color-slate-300)' : 'none', py: 1.5, px: 1 }}>
                                      {rec.proof && (
                                        <CustomTooltip title="View Proof">
                                          <IconButton size="small" sx={{ p: 0.5 }} onClick={() => handleViewProof(rec.proof, `Criminal Record Proof`)}>
                                            <AttachFileIcon sx={{ fontSize: 16, color: 'var(--color-slate-500)' }} />
                                          </IconButton>
                                        </CustomTooltip>
                                      )}
                                    </TableCell>
                                    {isSelectionMode && (
                                      <TableCell align="center" sx={{ width: '48px', verticalAlign: 'middle', borderBottom: '1px solid var(--color-slate-300)', py: 1.5, px: 1 }}>
                                        <CustomCheckbox size={18} sx={{ p: 0, display: 'inline-flex' }} checked={!!selectedFields[`criminal_${idx}`]} onChange={() => handleToggleField(`criminal_${idx}`)} />
                                      </TableCell>
                                    )}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                      {submittedData.uploaded_docs && Object.keys(submittedData.uploaded_docs).length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5, mb: 1, mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', fontSize: '0.75rem' }}>Document Submissions</Typography>
                          </Box>
                          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1, px: 2, textAlign: 'left' }}>Document Name</TableCell>
                                  <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', borderRight: isSelectionMode ? '1px solid var(--color-slate-300)' : 'none', py: 1, px: 1, textAlign: 'center', width: '60px' }}>Proof</TableCell>
                                  {isSelectionMode && (
                                    <TableCell sx={{ bgcolor: 'var(--color-slate-50)', color: 'var(--color-slate-600)', fontWeight: 'var(--font-semibold)', borderBottom: '1px solid var(--color-slate-300)', py: 1, px: 1, textAlign: 'center', width: '48px' }}>Select</TableCell>
                                  )}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {Object.entries(submittedData.uploaded_docs).map(([reqName, url], idx) => (
                                  <TableRow key={`doc_${idx}`} sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                                    <TableCell sx={{ color: 'var(--color-slate-900)', borderBottom: '1px solid var(--color-slate-300)', borderRight: '1px solid var(--color-slate-300)', py: 1.5, px: 2, textAlign: 'left', verticalAlign: 'middle' }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>{reqName}</Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ width: '60px', verticalAlign: 'middle', borderBottom: '1px solid var(--color-slate-300)', borderRight: isSelectionMode ? '1px solid var(--color-slate-300)' : 'none', py: 1.5, px: 1 }}>
                                      {url && (
                                        <CustomTooltip title="View Proof">
                                          <IconButton size="small" sx={{ p: 0.5 }} onClick={() => handleViewProof(url, reqName)}>
                                            <AttachFileIcon sx={{ fontSize: 16, color: 'var(--color-slate-500)' }} />
                                          </IconButton>
                                        </CustomTooltip>
                                      )}
                                    </TableCell>
                                    {isSelectionMode && (
                                      <TableCell align="center" sx={{ width: '48px', verticalAlign: 'middle', borderBottom: '1px solid var(--color-slate-300)', py: 1.5, px: 1 }}>
                                        <CustomCheckbox size={18} sx={{ p: 0, display: 'inline-flex' }} checked={!!selectedFields[`doc_${reqName}`]} onChange={() => handleToggleField(`doc_${reqName}`)} />
                                      </TableCell>
                                    )}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                      </Box>
                    </Box>
                  )}
                </Box>

                <Box sx={{ px: { xs: 3, sm: 8 }, pt: 1, pb: { xs: 6, sm: 8 } }}>
                  <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', alignItems: 'center' }}>
                    {isPendingReview && !isSelectionMode && (
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <TarangButton
                          variant="dangerOutlined"
                          onClick={handleDecline}
                          disabled={!!processingAction}
                          loading={processingAction === 'decline'}
                        >
                          Decline
                        </TarangButton>
                        {isPendingReview && (
                          <TarangButton
                            variant="success"
                            size="lg"
                            onClick={handleApprove}
                            disabled={!!processingAction}
                            loading={processingAction === 'approve'}
                            sx={{ px: 4 }}
                          >
                            Approve
                          </TarangButton>
                        )}
                      </Box>
                    )}
                    {isSelectionMode && (
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <TarangButton
                          variant="primary"
                          size="lg"
                          onClick={handleRequestUpdate}
                          disabled={
                            !!processingAction || 
                            Object.keys(selectedFields).filter(id => selectedFields[id]).length === 0 || 
                            !Object.keys(selectedFields).filter(id => selectedFields[id]).every(id => fieldComments[id]?.trim())
                          }
                          loading={processingAction === 'requestUpdate'}
                          sx={{ px: 4 }}
                        >
                          Request Update
                        </TarangButton>
                      </Box>
                    )}
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      )}
    </AnimatePresence>
  );
}
