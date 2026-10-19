"use client";
import React from 'react';
import { Box, Typography, Button, Container, Paper, CircularProgress, Chip, Divider, Grid, TextField, Tooltip, IconButton, Popover, Snackbar, Alert } from '@mui/material';
import { useParams } from 'next/navigation';

import { useAppRouter as useRouter } from '../../../../../../../hooks/useAppRouter';
import { useProfile } from '../../../../../../../hooks/useProfile';
import { useBreadcrumbs } from '../../../../../../../contexts/BreadcrumbContext';
import { formatBreadcrumbName } from '../../../../../../../utils/stringUtils';
import { getApplicationHistory, updateApplicationProgress } from '../../../../../../../features/admission/admissionService';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomFloatingInput } from '../../../../../../../components/common/CustomFloatingFields';
import CustomCheckbox from '../../../../../../../components/common/CustomCheckbox';

export default function ApplicationReviewDrawer({ open, onClose, programId, appId }) {
  const router = useRouter();
  const { profile } = useProfile();

  const [application, setApplication] = React.useState(null);
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [processing, setProcessing] = React.useState(false);
  const [feedback, setFeedback] = React.useState('');
  const [selectedFields, setSelectedFields] = React.useState({});
  const [fieldComments, setFieldComments] = React.useState({});
  const [commentAnchorEl, setCommentAnchorEl] = React.useState(null);
  const [isSelectionMode, setIsSelectionMode] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' });
  const saveTimeoutRef = React.useRef(null);
  const isFetchingRef = React.useRef(false);
  const initialLoadDoneRef = React.useRef(false);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

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

  const rawInstituteName = profile ? (profile.institution_name || profile.full_name || profile.username) : 'Institute';
  const breadcrumbInstituteName = formatBreadcrumbName(rawInstituteName);

  React.useEffect(() => {
    if (!appId) return;
    const fetchApp = async () => {
      try {
        isFetchingRef.current = true;
        setLoading(true);
        const data = await getApplicationHistory(appId);
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
        } catch(e) {}

        const newMeta = { ...currentMeta, selectedFields, fieldComments };
        await updateApplicationProgress(appId, 'AUTO_SAVE_SELECTION', newMeta, profile?.id || '', application.current_stage_index, application.status);
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 1000);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [selectedFields, fieldComments, application, appId, profile]);

  const handleApprove = async () => {
    if (!application) return;
    setProcessing(true);
    try {
      const isFinal = application.status === 'pending_final_review';
      const newIndex = application.current_stage_index + (isFinal ? 0 : 1);
      const newStatus = isFinal ? 'approved' : 'in_progress';
      
      const res = await updateApplicationProgress(appId, 'STAGE_APPROVED', {
        note: feedback || 'Approved by institute'
      }, profile?.id || '', newIndex, newStatus);
      
      setApplication(res.application);
      showSnackbar(isFinal ? 'Application fully approved!' : 'Step approved. Student can now proceed.', 'success');
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error('Approval failed:', err);
      showSnackbar('Failed to approve step.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!application) return;
    if (!feedback) {
      showSnackbar("Please provide a suggestion/reason for rejection.", "error");
      return;
    }
    setProcessing(true);
    try {
      const res = await updateApplicationProgress(appId, 'STAGE_REJECTED', {
        note: feedback
      }, profile?.id || '', application.current_stage_index, 'rejected');
      
      setApplication(res.application);
      showSnackbar('Submission rejected. Student has been notified to resubmit.', 'warning');
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error('Rejection failed:', err);
      showSnackbar('Failed to reject step.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestUpdate = async () => {
    if (!application) return;
    setProcessing(true);
    try {
      let currentMeta = {};
      if (application.metadata) {
        try {
          if (typeof application.metadata === 'string') {
            currentMeta = JSON.parse(application.metadata);
          } else {
            currentMeta = { ...application.metadata };
          }
        } catch(e) {}
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
      showSnackbar('Update requested. Student has been notified to resubmit specific fields.', 'info');
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error('Update request failed:', err);
      showSnackbar('Failed to request update.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!application) return;
    if (!window.confirm("Are you sure you want to permanently decline this application?")) return;
    
    setProcessing(true);
    try {
      const res = await updateApplicationProgress(appId, 'APPLICATION_DECLINED', {
        note: feedback || 'Application declined by institute'
      }, profile?.id || '', application.current_stage_index, 'declined');
      
      setApplication(res.application);
      showSnackbar('Application declined.', 'error');
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error('Decline failed:', err);
      showSnackbar('Failed to decline application.', 'error');
    } finally {
      setProcessing(false);
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

  const renderDetailItem = (id, label, value, colProps) => {
    if (!value) return null;
    return (
      <Grid {...colProps}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: 'var(--color-slate-500)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-900)', wordBreak: 'break-word' }}>{value}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Tooltip title="View Proof">
              <IconButton size="small" sx={{ p: 0.5 }}>
                <AttachFileIcon sx={{ fontSize: 16, color: 'var(--color-slate-500)' }} />
              </IconButton>
            </Tooltip>
            {isSelectionMode && (
              <CustomCheckbox 
                size={16} 
                sx={{ p: 0.5 }} 
                checked={!!selectedFields[id]}
                onChange={() => handleToggleField(id)}
              />
            )}
          </Box>
        </Box>
      </Grid>
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
            overflow: "auto" }}
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
                radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.18) 0, transparent 50%), 
                radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.15) 0, transparent 50%), 
                radial-gradient(at 80% 100%, rgba(40, 167, 69, 0.12) 0, transparent 50%),
                radial-gradient(at 20% 100%, rgba(0, 86, 179, 0.1) 0, transparent 50%),
                #ffffff
              `,
              border: 'var(--border-thin) solid rgba(255, 255, 255, 0.8)',
              overflowY: "hidden",
              maxHeight: "92vh",
              position: "relative"
            }}
          >

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
                <Box sx={{ pt: { xs: 5, sm: 6 }, px: { xs: 3, sm: 8 }, pb: 2, borderBottom: 'var(--border-thin) solid rgba(226, 232, 240, 0.6)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 1 }}>
                        Review Submission
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'var(--color-slate-500)' }}>
                        Applicant: <strong>{application.user_id}</strong>
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 3, sm: 8 }, pt: 2, pb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)' }}>
                      Current Step: {stageName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isSelectionMode && (
                        <>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={(e) => setCommentAnchorEl(e.currentTarget)}
                            sx={{ textTransform: 'none', height: '36px', }}
                          >
                            Comment
                          </Button>
                          <Popover
                            open={Boolean(commentAnchorEl)}
                            anchorEl={commentAnchorEl}
                            onClose={() => setCommentAnchorEl(null)}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right' }}
                            transformOrigin={{
                              vertical: 'top',
                              horizontal: 'right' }}
                            PaperProps={{
                              sx: { width: 300, maxHeight: 400, mt: 1, borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column' }
                            }}
                          >
                            <Box sx={{ p: 2, pb: 1.5, borderBottom: 'var(--border-thin) solid #e2e8f0', flexShrink: 0 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)' }}>Comments</Typography>
                            </Box>
                            <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
                              {Object.keys(selectedFields).filter(id => selectedFields[id]).length === 0 ? (
                                <Typography variant="body2" color="text.secondary">No fields selected.</Typography>
                              ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
                          </Popover>
                        </>
                      )}
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                        sx={{ textTransform: 'none', height: '36px' }}
                      >
                        {isSelectionMode ? 'Cancel Selection' : 'Select Fields'}
                      </Button>
                    </Box>
                  </Box>

          {submittedData.basic_details && (
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.5)', p: 3, borderRadius: 'var(--radius-lg)', border: 'var(--border-thin) solid #e2e8f0', mb: 3, maxHeight: '55vh', overflowY: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-500)' }}>
                  Applicant Basic Details
                </Typography>
                {isSelectionMode && (
                  <CustomCheckbox 
                    size={16} 
                    sx={{ p: 0.5 }} 
                    checked={isGroupSelected(groups.basicDetailsAll)}
                    indeterminate={isGroupIndeterminate(groups.basicDetailsAll)}
                    onChange={(e) => handleToggleGroup(groups.basicDetailsAll, e.target.checked)}
                  />
                )}
              </Box>
              {/* Personal Information */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-700)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: 'var(--font-xs)' }}>Personal Information</Typography>
                {isSelectionMode && (                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CustomCheckbox size={16} sx={{ p: 0.5 }} checked={isGroupSelected(groups.personal)} indeterminate={isGroupIndeterminate(groups.personal)} onChange={(e) => handleToggleGroup(groups.personal, e.target.checked)} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)' }}>व्यक्तिगत जानकारी (Personal Information)</Typography>
                </Box>)}
              </Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: "Full Name", value: submittedData.basic_details.fullName },
                  { label: "Email", value: submittedData.basic_details.email },
                  { label: "Phone", value: submittedData.basic_details.phone },
                  { label: "DOB", value: submittedData.basic_details.dob },
                  { label: "Nationality", value: submittedData.basic_details.nationality },
                  { label: "Gender", value: submittedData.basic_details.gender },
                  { label: "Caste", value: submittedData.basic_details.caste },
                  { label: "Sub-caste", value: submittedData.basic_details.subcaste },
                  { label: "Birth Religion", value: submittedData.basic_details.religionByBirth },
                  { label: "Current Religion", value: submittedData.basic_details.currentReligion },
                  { label: "Race/Ethnicity", value: submittedData.basic_details.raceEthnicity },
                  { label: "Language", value: submittedData.basic_details.language },
                ].map((item, idx) => renderDetailItem(`personal_${item.label}`, item.label, item.value, { xs: 12, sm: 6, md: 3, key: idx }))}
              </Grid>

              <Divider sx={{ mb: 2, borderColor: 'rgba(226, 232, 240, 0.6)' }} />

              {/* Parents & Guardian Details */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-700)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: 'var(--font-xs)' }}>Parents & Guardian Details</Typography>
                {isSelectionMode && (                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CustomCheckbox size={16} sx={{ p: 0.5 }} checked={isGroupSelected(groups.parents)} indeterminate={isGroupIndeterminate(groups.parents)} onChange={(e) => handleToggleGroup(groups.parents, e.target.checked)} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)' }}>अभिभावक/माता-पिता का विवरण (Parents/Guardian Details)</Typography>
                </Box>)}
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', pb: 0.5, mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-900)', display: 'block' }}>Father&apos;s Details</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <CustomCheckbox size={16} sx={{ p: 0.5 }} checked={isGroupSelected(groups.father)} indeterminate={isGroupIndeterminate(groups.father)} onChange={(e) => handleToggleGroup(groups.father, e.target.checked)} />
                    <Typography variant="body2" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-700)' }}>पिता (Father)</Typography>
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  {[
                    { label: "Name", value: submittedData.basic_details.fatherName },
                    { label: "Contact", value: submittedData.basic_details.fatherContact },
                    { label: "Profession", value: submittedData.basic_details.fatherProfession },
                    { label: "Income", value: submittedData.basic_details.fatherIncome },
                    { label: "Location", value: submittedData.basic_details.fatherLocation },
                  ].map((item, idx) => renderDetailItem(`parents_father_${item.label}`, item.label, item.value, { xs: 12, sm: 6, md: 2, key: `f-${idx}` }))}
                </Grid>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', pb: 0.5, mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-900)', display: 'block' }}>Mother&apos;s Details</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <CustomCheckbox size={16} sx={{ p: 0.5 }} checked={isGroupSelected(groups.mother)} indeterminate={isGroupIndeterminate(groups.mother)} onChange={(e) => handleToggleGroup(groups.mother, e.target.checked)} />
                    <Typography variant="body2" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-700)' }}>माता (Mother)</Typography>
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  {[
                    { label: "Name", value: submittedData.basic_details.motherName },
                    { label: "Contact", value: submittedData.basic_details.motherContact },
                    { label: "Profession", value: submittedData.basic_details.motherProfession },
                    { label: "Income", value: submittedData.basic_details.motherIncome },
                    { label: "Location", value: submittedData.basic_details.motherLocation },
                  ].map((item, idx) => renderDetailItem(`parents_mother_${item.label}`, item.label, item.value, { xs: 12, sm: 6, md: 2, key: `m-${idx}` }))}
                </Grid>
              </Box>

              {submittedData.basic_details.guardianName && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', pb: 0.5, mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-900)', display: 'block' }}>Guardian&apos;s Details</Typography>
                    {isSelectionMode && (                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <CustomCheckbox size={16} sx={{ p: 0.5 }} checked={isGroupSelected(groups.guardian)} indeterminate={isGroupIndeterminate(groups.guardian)} onChange={(e) => handleToggleGroup(groups.guardian, e.target.checked)} />
                      <Typography variant="body2" sx={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-700)' }}>स्थानीय अभिभावक (Local Guardian)</Typography>
                    </Box>)}
                  </Box>
                  <Grid container spacing={2}>
                    {[
                      { label: "Name", value: submittedData.basic_details.guardianName },
                      { label: "Contact", value: submittedData.basic_details.guardianContact },
                      { label: "Profession", value: submittedData.basic_details.guardianProfession },
                      { label: "Income", value: submittedData.basic_details.guardianIncome },
                      { label: "Location", value: submittedData.basic_details.guardianLocation },
                    ].map((item, idx) => renderDetailItem(`parents_guardian_${item.label}`, item.label, item.value, { xs: 12, sm: 6, md: 2, key: `g-${idx}` }))}
                  </Grid>
                </Box>
              )}

              <Divider sx={{ mb: 2, borderColor: 'rgba(226, 232, 240, 0.6)' }} />

              {/* Other Info & Addresses */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-700)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: 'var(--font-xs)' }}>Other Info & Addresses</Typography>
                {isSelectionMode && (                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CustomCheckbox size={16} sx={{ p: 0.5 }} checked={isGroupSelected(groups.otherInfo)} indeterminate={isGroupIndeterminate(groups.otherInfo)} onChange={(e) => handleToggleGroup(groups.otherInfo, e.target.checked)} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)' }}>अन्य जानकारी (Other Information)</Typography>
                </Box>)}
              </Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {[
                  { label: "Family Income", value: submittedData.basic_details.familyIncome },
                  { label: "Has Sibling", value: submittedData.basic_details.hasSibling },
                  { label: "Has Criminal Record", value: submittedData.basic_details.hasCriminalRecord },
                ].map((item, idx) => renderDetailItem(`other_${item.label}`, item.label, item.value, { xs: 12, sm: 6, md: 3, key: `o-${idx}` }))}
              </Grid>

              <Grid container spacing={2}>
                {renderDetailItem("other_Permanent Address", "Permanent Address", (() => {
                  const addr = submittedData.basic_details.permanentAddress;
                  if (!addr || typeof addr === 'string') return addr || 'N/A';
                  const parts = [addr.houseNoAndName, addr.street, addr.landmark, addr.wardOrSector, addr.localBodyName, addr.district, addr.state, addr.country, addr.pincode].filter(Boolean);
                  return parts.length > 0 ? parts.join(', ') : 'N/A';
                })(), { xs: 12, sm: 6 })}
                {renderDetailItem("other_Correspondence Address", "Correspondence Address", (() => {
                  const addr = submittedData.basic_details.correspondenceAddress;
                  if (!addr || typeof addr === 'string') return addr || 'N/A';
                  const parts = [addr.houseNoAndName, addr.street, addr.landmark, addr.wardOrSector, addr.localBodyName, addr.district, addr.state, addr.country, addr.pincode].filter(Boolean);
                  return parts.length > 0 ? parts.join(', ') : 'N/A';
                })(), { xs: 12, sm: 6 })}
              </Grid>
              {submittedData.basic_details.academicRecords && submittedData.basic_details.academicRecords.length > 0 && (
                <>
                  <Divider sx={{ mb: 2, mt: 2, borderColor: 'rgba(226, 232, 240, 0.6)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-700)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: 'var(--font-xs)' }}>Academic Records</Typography>
                    {isSelectionMode && (                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <CustomCheckbox size={16} sx={{ p: 0.5 }} checked={isGroupSelected(groups.academic)} indeterminate={isGroupIndeterminate(groups.academic)} onChange={(e) => handleToggleGroup(groups.academic, e.target.checked)} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)' }}>शैक्षणिक रिकॉर्ड (Academic Records)</Typography>
                    </Box>)}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                    {submittedData.basic_details.academicRecords.map((rec, idx) => (
                      <Box key={idx} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.7)', border: 'var(--border-thin) solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)' }}>{rec.qualification || 'N/A'}</Typography>
                          <Typography variant="caption" sx={{ color: 'var(--color-slate-500)' }}>
                            Passing Year: {rec.passingYear || 'N/A'} | Percentage/CGPA: {rec.percentageCgpa || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                          <Tooltip title="View Proof">
                            <IconButton size="small" sx={{ p: 0.5 }}>
                              <AttachFileIcon sx={{ fontSize: 16, color: 'var(--color-slate-500)' }} />
                            </IconButton>
                          </Tooltip>
                          {isSelectionMode && <CustomCheckbox size={16} sx={{ p: 0.5 }} checked={!!selectedFields[`academic_${idx}`]} onChange={() => handleToggleField(`academic_${idx}`)} />}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              {submittedData.basic_details.hasSibling === 'Yes' && submittedData.basic_details.siblings && submittedData.basic_details.siblings.length > 0 && (
                <>
                  <Divider sx={{ mb: 2, mt: 2, borderColor: 'rgba(226, 232, 240, 0.6)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-700)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: 'var(--font-xs)' }}>Siblings Details</Typography>
                    {isSelectionMode && (                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <CustomCheckbox size={16} sx={{ p: 0.5 }} checked={isGroupSelected(groups.siblings)} indeterminate={isGroupIndeterminate(groups.siblings)} onChange={(e) => handleToggleGroup(groups.siblings, e.target.checked)} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)' }}>भाई-बहन का विवरण (Siblings Details)</Typography>
                    </Box>)}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                    {submittedData.basic_details.siblings.map((sib, idx) => (
                      <Box key={idx} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.7)', border: 'var(--border-thin) solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)' }}>{sib.name} ({sib.relation})</Typography>
                          <Typography variant="caption" sx={{ color: 'var(--color-slate-500)' }}>
                            Age: {sib.age} | Institute: {sib.institute || 'N/A'} | Income: {sib.income || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                          <Tooltip title="View Proof">
                            <IconButton size="small" sx={{ p: 0.5 }}>
                              <AttachFileIcon sx={{ fontSize: 16, color: 'var(--color-slate-500)' }} />
                            </IconButton>
                          </Tooltip>
                          {isSelectionMode && <CustomCheckbox size={16} sx={{ p: 0.5 }} checked={!!selectedFields[`sibling_${idx}`]} onChange={() => handleToggleField(`sibling_${idx}`)} />}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              {submittedData.basic_details.hasCriminalRecord === 'Yes' && submittedData.basic_details.criminalRecords && submittedData.basic_details.criminalRecords.length > 0 && (
                <>
                  <Divider sx={{ mb: 2, mt: 2, borderColor: 'rgba(226, 232, 240, 0.6)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-700)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: 'var(--font-xs)' }}>Criminal Records</Typography>
                    {isSelectionMode && (                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <CustomCheckbox size={16} sx={{ p: 0.5 }} checked={isGroupSelected(groups.criminal)} indeterminate={isGroupIndeterminate(groups.criminal)} onChange={(e) => handleToggleGroup(groups.criminal, e.target.checked)} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)' }}>आपराधिक रिकॉर्ड (Criminal Records)</Typography>
                    </Box>)}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                    {submittedData.basic_details.criminalRecords.map((rec, idx) => (
                      <Box key={idx} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.7)', border: 'var(--border-thin) solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)' }}>{rec.offenseType || 'N/A'}</Typography>
                          <Typography variant="caption" sx={{ color: 'var(--color-slate-500)' }}>
                            Status: {rec.status || 'N/A'} | Year: {rec.year || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                          <Tooltip title="View Proof">
                            <IconButton size="small" sx={{ p: 0.5 }}>
                              <AttachFileIcon sx={{ fontSize: 16, color: 'var(--color-slate-500)' }} />
                            </IconButton>
                          </Tooltip>
                          {isSelectionMode && <CustomCheckbox size={16} sx={{ p: 0.5 }} checked={!!selectedFields[`criminal_${idx}`]} onChange={() => handleToggleField(`criminal_${idx}`)} />}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          )}
          </Box>

          <Box sx={{ borderTop: 'var(--border-thin) solid rgba(226, 232, 240, 0.6)', px: { xs: 3, sm: 8 }, pt: 2, pb: { xs: 4, sm: 6 } }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                variant="outlined"
                color="inherit"
                onClick={onClose}
                sx={{ textTransform: 'none', fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-500)', borderColor: 'var(--color-slate-200)' }}
              >
                Cancel
              </Button>
              
              {isPendingReview && !isSelectionMode && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDecline}
                    disabled={processing}
                    sx={{ textTransform: 'none', fontWeight: 'var(--font-semibold)' }}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={handleApprove}
                    disabled={processing}
                    sx={{ textTransform: 'none', fontWeight: 'var(--font-semibold)', px: 4, }}
                  >
                    Approve
                  </Button>
                </Box>
              )}
              {isSelectionMode && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <CustomCheckbox 
                    size={16}
                    checked={isAllSelected}
                    indeterminate={isAnySelected && !isAllSelected}
                    onChange={(e) => {
                      const allFieldIds = [
                        ...groups.personal, ...groups.parents, ...groups.father, ...groups.mother, ...groups.guardian, ...groups.otherInfo,
                        ...application.academic_records.map((_, i) => `academic_${i}`),
                        ...application.siblings.map((_, i) => `sibling_${i}`),
                        ...application.criminal_records.map((_, i) => `criminal_${i}`),
                        ...application.document_submissions.map(d => `doc_${d.id}`)
                      ];
                      handleToggleGroup(allFieldIds, e.target.checked);
                    }}
                    sx={{ p: 0 }}
                  />
                  <Button
                    variant="contained"
                    color="warning"
                    size="large"
                    onClick={handleRequestUpdate}
                    disabled={processing || Object.keys(selectedFields).filter(id => selectedFields[id]).length === 0 || !Object.keys(selectedFields).some(id => selectedFields[id] && fieldComments[id]?.trim())}
                    sx={{ textTransform: 'none', fontWeight: 'var(--font-semibold)', px: 4, }}
                  >
                    Request Update
                  </Button>
                </Box>
              )}
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Box>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: 'var(--size-full)' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AnimatePresence>
  );
}
