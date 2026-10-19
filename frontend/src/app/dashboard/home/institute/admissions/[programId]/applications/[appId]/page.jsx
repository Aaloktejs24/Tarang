"use client";
import React from 'react';
import { Box, Typography, Button, Container, Paper, CircularProgress, Chip, Divider, Grid, TextField } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useProfile } from '../../../../../../../../hooks/useProfile';
import { useBreadcrumbs } from '../../../../../../../../contexts/BreadcrumbContext';
import { formatBreadcrumbName } from '../../../../../../../../utils/stringUtils';
import { getApplicationHistory, updateApplicationProgress } from '../../../../../../../../features/admission/admissionService';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ApplicationReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { programId, appId } = params;
  const { profile } = useProfile();

  const [application, setApplication] = React.useState(null);
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [processing, setProcessing] = React.useState(false);
  const [feedback, setFeedback] = React.useState('');

  const rawInstituteName = profile ? (profile.full_name || profile.institution_name || profile.username) : 'Institute';
  const breadcrumbInstituteName = formatBreadcrumbName(rawInstituteName);

  useBreadcrumbs([
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home') },
    { label: breadcrumbInstituteName, onClick: () => router.push('/dashboard/home/institute') },
    { labelEn: 'Admissions', labelHi: 'प्रवेश', onClick: () => router.push('/dashboard/home/institute/admissions') },
    { labelEn: 'Applicants', labelHi: 'आवेदक', onClick: () => router.push(`/dashboard/home/institute/admissions/${programId}/applications`) },
    { label: 'Review', onClick: () => {} }
  ]);

  React.useEffect(() => {
    if (!appId) return;
    const fetchApp = async () => {
      try {
        setLoading(true);
        const data = await getApplicationHistory(appId);
        if (data.application) {
          setApplication(data.application);
          setTransactions(data.transactions || []);
        }
      } catch (err) {
        console.error('Failed to fetch application:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [appId]);

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
      alert(isFinal ? 'Application fully approved!' : 'Stage approved. Student can now proceed.');
      router.push(`/dashboard/home/institute/admissions/${programId}/applications`);
    } catch (err) {
      console.error('Approval failed:', err);
      alert('Failed to approve stage.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!application) return;
    if (!feedback) {
      alert("Please provide a suggestion/reason for rejection.");
      return;
    }
    setProcessing(true);
    try {
      const res = await updateApplicationProgress(appId, 'STAGE_REJECTED', {
        note: feedback
      }, profile?.id || '', application.current_stage_index, 'rejected');
      
      setApplication(res.application);
      alert('Submission rejected. Student has been notified to resubmit.');
      router.push(`/dashboard/home/institute/admissions/${programId}/applications`);
    } catch (err) {
      console.error('Rejection failed:', err);
      alert('Failed to reject stage.');
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
      alert('Application declined.');
      router.push(`/dashboard/home/institute/admissions/${programId}/applications`);
    } catch (err) {
      console.error('Decline failed:', err);
      alert('Failed to decline application.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ position: "relative", minHeight: "calc(100vh - 72px)", bgcolor: "transparent", pt: 12 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!application) {
    return (
      <Box sx={{ position: "relative", minHeight: "calc(100vh - 72px)", bgcolor: "transparent", pt: 12, textAlign: 'center' }}>
        <Typography>Application not found.</Typography>
      </Box>
    );
  }

  // Find the latest SUBMITTED transaction to extract metadata (uploaded docs)
  const latestSubmission = [...transactions].reverse().find(t => t.action_type === 'STAGE_SUBMITTED' || t.action_type === 'PROCEED_NEXT_STAGE');
  let submittedData = {};
  if (latestSubmission && latestSubmission.metadata) {
    try {
      submittedData = JSON.parse(latestSubmission.metadata);
    } catch (e) {
      console.error('Failed to parse metadata', e);
    }
  }

  const isPendingReview = ['pending', 'pending_review', 'pending_final_review'].includes(application.status);
  const stageName = application.program?.stages?.[application.current_stage_index]?.title || `Stage ${application.current_stage_index + 1}`;

  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 72px)", bgcolor: "transparent", mt: "-1px" }}>
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: { xs: 10, md: 12 }, pb: 10, px: { xs: 2, md: 4 } }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push(`/dashboard/home/institute/admissions/${programId}/applications`)}
          sx={{ mb: 3, textTransform: 'none', color: '#1e293b' }}
        >
          Back to Applications
        </Button>
        
        <Paper elevation={0} sx={{ 
          borderRadius: "24px", 
          background: 'rgba(255, 255, 255, 0.6)', 
          backdropFilter: 'blur(30px)', 
          border: '1px solid rgba(30, 79, 163, 0.2)', 
          p: { xs: 3, md: 5 }
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                Review Submission
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569' }}>
                Applicant: <strong>{application.user_id}</strong>
              </Typography>
            </Box>
            <Chip 
              label={application.status.replace(/_/g, ' ')} 
              color={isPendingReview ? 'warning' : application.status === 'approved' ? 'success' : application.status === 'rejected' ? 'error' : 'default'}
              sx={{ fontWeight: 600, textTransform: 'capitalize' }}
            />
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
            Current Stage: {stageName}
          </Typography>

          {submittedData.basic_details && (
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.5)', p: 3, borderRadius: '12px', border: '1px solid #e2e8f0', mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569', mb: 2 }}>
                Applicant Basic Details
              </Typography>
              <Grid container spacing={2}>
                {Object.entries({
                  "Full Name": submittedData.basic_details.fullName,
                  "Email": submittedData.basic_details.email,
                  "Phone": submittedData.basic_details.phone,
                  "DOB": submittedData.basic_details.dob,
                  "Gender": submittedData.basic_details.gender,
                  "Category": submittedData.basic_details.category,
                  "Nationality": submittedData.basic_details.nationality,
                  "Father's Name": submittedData.basic_details.fatherName,
                  "Mother's Name": submittedData.basic_details.motherName,
                }).map(([label, value]) => (
                  <Grid item xs={12} sm={4} key={label}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>{value || 'N/A'}</Typography>
                  </Grid>
                ))}
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Permanent Address</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>{submittedData.basic_details.permanentAddress || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Correspondence Address</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>{submittedData.basic_details.correspondenceAddress || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          <Box sx={{ bgcolor: 'rgba(255,255,255,0.5)', p: 3, borderRadius: '12px', border: '1px solid #e2e8f0', mb: 5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569', mb: 2 }}>
              Submitted Documents / Data
            </Typography>
            
            {submittedData.uploaded_docs && Object.keys(submittedData.uploaded_docs).length > 0 ? (
              <Grid container spacing={2}>
                {Object.entries(submittedData.uploaded_docs).map(([docName, docUrl]) => (
                  <Grid item xs={12} sm={6} key={docName}>
                    <Paper elevation={0} sx={{ p: 2, border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FileOpenOutlinedIcon sx={{ color: '#0056b3' }} />
                      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{docName}</Typography>
                        <Typography component="a" href={docUrl} target="_blank" rel="noopener noreferrer" variant="caption" sx={{ color: '#2563eb', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                          View Document
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                No documents were uploaded for this stage.
              </Typography>
            )}
          </Box>

          {isPendingReview && (
            <Box sx={{ mt: 5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
                Feedback / Suggestions (Optional for Approve, Required for Reject)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="e.g. Please re-upload your Aadhar card clearly..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                sx={{ mb: 3, bgcolor: '#ffffff' }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="text"
                  color="error"
                  startIcon={<BlockOutlinedIcon />}
                  onClick={handleDecline}
                  disabled={processing}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Decline Application
                </Button>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    startIcon={<CancelOutlinedIcon />}
                    onClick={handleReject}
                    disabled={processing}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 4 }}
                  >
                    Reject & Re-upload
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<CheckCircleOutlineIcon />}
                    onClick={handleApprove}
                    disabled={processing}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 4, boxShadow: 'none' }}
                  >
                    Approve Stage
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
