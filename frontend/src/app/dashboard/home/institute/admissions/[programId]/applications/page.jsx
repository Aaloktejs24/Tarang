"use client";
import React from 'react';
import { Box, Typography, Button, Container, Paper, Avatar, Grid, Card, CardContent, Divider, Chip, CircularProgress, IconButton, TextField, MenuItem, FormControl, InputLabel, Select, Tooltip, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useParams } from 'next/navigation';

import { useAppRouter as useRouter } from '../../../../../../../hooks/useAppRouter';
import { apiClient } from '../../../../../../../lib/apiClient';
import { useProfile } from '../../../../../../../hooks/useProfile';
import { useAccessibility } from '../../../../../../../contexts/AccessibilityContext';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import SearchIcon from '@mui/icons-material/Search';

import { useBreadcrumbs } from '../../../../../../../contexts/BreadcrumbContext';
import { formatBreadcrumbName } from '../../../../../../../utils/stringUtils';
import { CustomTooltip } from '../../../../../../../components/common/CustomTooltip';
import { CustomFloatingInput, CustomFloatingSelect } from '../../../../../../../components/common/CustomFloatingFields';
import ApplicationReviewModal from './ApplicationReviewModal';

import { DASHBOARD_PAGE_WRAPPER_NO_HERO_SX, DASHBOARD_CONTAINER_SX } from '../../../../../../../constants/layout';
import { useToast } from '../../../../../../../contexts/ToastContext';
import { useConfirm } from '../../../../../../../contexts/ConfirmContext';
import { getApplicationHistory, updateApplicationProgress } from '../../../../../../../features/admission/admissionService';

export default function ApplicationsManagementPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params.programId;
  const { profile } = useProfile();
  const { language } = useAccessibility();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [processingAppId, setProcessingAppId] = React.useState(null);

  const [applications, setApplications] = React.useState([]);
  const [programInfo, setProgramInfo] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedAppId, setSelectedAppId] = React.useState(null);
  const [openingAppId, setOpeningAppId] = React.useState(null);
  const [preloadedAppData, setPreloadedAppData] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const cardsRef = React.useRef(null);

  const rawInstituteName = profile ? (profile.primary_name || profile.full_name || profile.username) : 'Institute';
  const breadcrumbInstituteName = formatBreadcrumbName(rawInstituteName);

  useBreadcrumbs([
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home/institute') },
    { labelEn: 'Student Affairs', labelHi: 'छात्र मामले', onClick: () => router.push('/dashboard/home/institute?category=student_affairs') },
    { labelEn: 'Admissions', labelHi: 'प्रवेश', onClick: () => router.push('/dashboard/home/institute/admissions') },
    { labelEn: 'Applicants', labelHi: 'आवेदक' }
  ]);

  React.useEffect(() => {
    const handleMutation = () => setRefreshTrigger(prev => prev + 1);
    window.addEventListener("tarang:application-mutated", handleMutation);
    return () => window.removeEventListener("tarang:application-mutated", handleMutation);
  }, []);

  const handleReviewClick = async (appId) => {
    setOpeningAppId(appId);
    try {
      const data = await getApplicationHistory(appId);
      setPreloadedAppData(data);
      setSelectedAppId(appId);
    } catch (err) {
      console.error(err);
      showToast('Failed to load application data.', 'error');
    } finally {
      setOpeningAppId(null);
    }
  };

  React.useEffect(() => {
    if (!profile?.id || !programId) return;

    const fetchApplications = async () => {
      try {
        setLoading(true);
        // FIX: Use profile.id instead of profile.username to match backend changes
        const res = await apiClient.get(`/admissions/institutes/${profile.id}/applications`);

        let allApps = res.data?.applications || [];
        // Filter out applications that haven't been submitted by the student yet (draft/'pending' state)
        const programApps = allApps.filter(app =>
          app.program_id === programId &&
          app.status !== 'pending' &&
          app.status !== 'draft' &&
          app.status !== 'started'
        );

        setApplications(programApps);

        try {
          const progRes = await apiClient.get(`/admissions/institutes/${profile.id}/programs`);
          if (progRes.data?.programs) {
            const prog = progRes.data.programs.find(p => p.id === programId);
            if (prog) {
              const parsedStages = typeof prog.stages === 'string' ? JSON.parse(prog.stages) : (prog.stages || []);
              setProgramInfo({ ...prog, stages: parsedStages });
            }
          }
        } catch (e) {
          console.error('Failed to fetch program info:', e);
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError('Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [profile, programId, refreshTrigger]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };
  const showEmptyState = !loading && !error && applications.length === 0;

  return (
    <Box sx={DASHBOARD_PAGE_WRAPPER_NO_HERO_SX}>
      <Container maxWidth={false} sx={{
        ...DASHBOARD_CONTAINER_SX,
        pb: showEmptyState ? 0 : 10,
        minHeight: "calc(100vh - 72px)",
        ...(showEmptyState && {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        })
      }}>
        {showEmptyState ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState
              title={language === 'en' ? 'No Applications Yet' : 'कोई आवेदन नहीं'}
              subtitle={language === 'en' ? 'No applications have been submitted for this program yet.' : 'अभी तक इस कार्यक्रम के लिए कोई आवेदन जमा नहीं किया गया है।'}
            />
          </Box>
        ) : (

          <Box sx={{ width: 'var(--size-full)', pb: 8 }}>
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              mb: 4,
              alignItems: { xs: 'stretch', md: 'center' }
            }}>
              <Box sx={{ flexGrow: 1 }}>
                <CustomFloatingInput
                  label="Search by Applicant ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: <SearchIcon sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-lg)' }} />
                  }}
                />
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <CustomFloatingSelect
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { label: 'All Statuses', value: 'all' },
                    { label: 'Approved', value: 'approved' },
                    { label: 'Update Requested', value: 'rejected' },
                    { label: 'Submitted', value: 'submitted' },
                    { label: 'Under Review', value: 'under_review' }
                  ]}
                />
              </Box>
            </Box>

            {loading ? (
              <Grid container spacing={3}>
                {Array.from(new Array(6)).map((_, i) => (
                  <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }} key={i}>
                    <Card sx={{ height: '100%', borderRadius: 'var(--radius-lg)', background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', border: 'var(--border-thin) solid rgba(30, 79, 163, 0.2)' }}>
                      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Skeleton variant="circular" width={42} height={42} />
                            <Box>
                              <Skeleton variant="text" width={120} height={24} />
                              <Skeleton variant="text" width={80} height={16} />
                            </Box>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.05)' }} />

                        {/* Progress Bar Skeleton */}
                        <Box sx={{ display: 'flex', alignItems: 'center', width: 'var(--size-full)', mb: 3 }}>
                          {Array.from(new Array(4)).map((_, j) => (
                            <React.Fragment key={j}>
                              <Skeleton variant="circular" width={24} height={24} />
                              {j < 3 && <Skeleton variant="rectangular" height={2} sx={{ flexGrow: 1, mx: 0.5, borderRadius: 1 }} />}
                            </React.Fragment>
                          ))}
                        </Box>

                        {/* Details Skeleton */}
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Skeleton variant="text" width="60%" height={20} />
                          <Skeleton variant="text" width="40%" height={20} />
                        </Box>

                        {/* Footer Skeleton */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 2, borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                          <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: '12px' }} />
                          <Skeleton variant="text" width={60} height={24} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : error ? (
              <EmptyState
                title={language === 'en' ? 'Oops, something went wrong!' : 'उफ़, कुछ गलत हो गया!'}
                subtitle={language === 'en' ? 'We could not load the applications at this time. Please try again later.' : 'हम इस समय आवेदनों को लोड नहीं कर सके। कृपया बाद में पुनः प्रयास करें।'}
              />
            ) : (
              <Grid container spacing={3}>
                {applications
                  .filter(app => {
                    const matchesSearch = app.id.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesStatus = statusFilter === 'all' || app.status.toLowerCase() === statusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .map((app) => {
                    let applicantName = null;
                    let basicDetails = null;
                    try {
                      const data = typeof app.submitted_data === 'string' ? JSON.parse(app.submitted_data) : app.submitted_data;
                      if (data?.basic_details) {
                        basicDetails = data.basic_details;
                        applicantName = basicDetails.fullName;
                      }
                    } catch (e) { }

                    if (!applicantName) {
                      if (app.applicant_name) applicantName = app.applicant_name;
                      else if (app.user?.full_name) applicantName = app.user.full_name;
                      else applicantName = "Applicant";
                    }

                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                    if (uuidRegex.test(applicantName)) {
                      applicantName = "Applicant";
                    }

                    return (
                      <Grid key={app.id} size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}>
                        <Card sx={{
                          borderRadius: 'var(--radius-lg)',
                          transition: 'var(--transition-slow)',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                          },
                          background: 'var(--glass-bg)',
                          backdropFilter: 'blur(30px)',
                          WebkitBackdropFilter: 'blur(30px)',
                          border: 'var(--border-thin) solid rgba(30, 79, 163, 0.2)'
                        }}>
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                <Avatar sx={{ width: 42, height: 42, bgcolor: 'var(--color-primary)', fontSize: 'var(--font-lg)', fontWeight: 'var(--font-semibold)' }}>
                                  {applicantName.substring(0, 2).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }} title={applicantName}>
                                    {applicantName}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'var(--color-slate-500)', fontWeight: 'var(--font-semibold)', display: 'block', mb: 1 }}>
                                    ID: {app.id.substring(0, 8).toUpperCase()}
                                  </Typography>

                                  {basicDetails && (
                                    <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                      {basicDetails.email && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--color-slate-500)' }}>
                                          <EmailOutlinedIcon sx={{ fontSize: 14, color: 'var(--color-slate-500)' }} />
                                          <Typography variant="caption" sx={{ fontWeight: 'var(--font-medium)' }}>
                                            {basicDetails.email}
                                          </Typography>
                                        </Box>
                                      )}
                                      {basicDetails.phone && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--color-slate-500)' }}>
                                          <LocalPhoneOutlinedIcon sx={{ fontSize: 14, color: 'var(--color-slate-500)' }} />
                                          <Typography variant="caption" sx={{ fontWeight: 'var(--font-medium)' }}>
                                            {basicDetails.phone}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', width: 'var(--size-full)' }}>
                              {(() => {
                                const rawStages = programInfo?.stages || app.program?.stages;
                                let parsedStages = [];
                                try {
                                  parsedStages = typeof rawStages === 'string' ? JSON.parse(rawStages) : (rawStages || []);
                                } catch (e) { }
                                const nStages = parsedStages.length > 0 ? parsedStages.length : 4;
                                const totalDots = nStages + 1;
                                const currentStep = app.current_stage_index ?? 0;
                                const isCompleted = app.status === 'approved' || app.status === 'enrolled';
                                const currentProgressIndex = isCompleted ? nStages : Math.min(currentStep, nStages - 1);

                                const tooltipTitle = (
                                  <React.Fragment>
                                    <Typography variant="body2" sx={{ fontWeight: 'var(--font-semibold)' }}>Applied: {new Date(app.created_at).toLocaleDateString()}</Typography>
                                    {app.status === 'approved' && <Typography variant="body2" sx={{ mt: 0.5 }}>Approved: {new Date(app.updated_at).toLocaleDateString()}</Typography>}
                                    {app.status === 'rejected' && <Typography variant="body2" sx={{ mt: 0.5 }}>Update Req: {new Date(app.updated_at).toLocaleDateString()}</Typography>}
                                    {app.status === 'enrolled' && <Typography variant="body2" sx={{ mt: 0.5 }}>Enrolled: {new Date(app.updated_at).toLocaleDateString()}</Typography>}
                                    {app.status !== 'approved' && app.status !== 'rejected' && app.status !== 'enrolled' && app.status !== 'submitted' && <Typography variant="body2" sx={{ mt: 0.5 }}>Updated: {new Date(app.updated_at).toLocaleDateString()}</Typography>}
                                  </React.Fragment>
                                );

                                return Array.from({ length: totalDots }).map((_, index) => {
                                  const isFinalDot = index === nStages;
                                  const isActive = index === currentProgressIndex;
                                  const isPast = index < currentProgressIndex;
                                  const tipPlacement = index === 0 ? "top-start" : isFinalDot ? "top-end" : "top";

                                  return (
                                    <React.Fragment key={index}>
                                      <CustomTooltip title={tooltipTitle} arrow placement={tipPlacement}>
                                        <Box sx={{
                                          width: 24,
                                          height: 24,
                                          borderRadius: 'var(--radius-full)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          bgcolor: isPast || (isFinalDot && isCompleted) ? 'var(--color-success)' : isActive ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)',
                                          color: isPast || isActive || (isFinalDot && isCompleted) ? 'var(--color-white)' : 'var(--color-slate-500)',
                                          fontSize: isFinalDot ? '0.85rem' : '0.75rem',
                                          fontWeight: 'var(--font-bold)',
                                          flexShrink: 0,
                                          cursor: 'pointer'
                                        }}>
                                          {isFinalDot ? '✓' : index + 1}
                                        </Box>
                                      </CustomTooltip>
                                      {index < totalDots - 1 && (
                                        <Box sx={{
                                          flexGrow: 1,
                                          height: 2,
                                          bgcolor: isPast ? 'var(--color-success)' : 'rgba(0,0,0,0.05)',
                                          mx: 0.5,
                                          borderRadius: 1
                                        }} />
                                      )}
                                    </React.Fragment>
                                  );
                                });
                              })()}
                            </Box>

                          </CardContent>

                          <Box sx={{ px: 3, pb: 3, pt: 0, display: 'flex', gap: 1 }}>
                            <Button
                              fullWidth
                              variant="outlined"
                              color="primary"
                              disabled={openingAppId === app.id}
                              sx={{
                                textTransform: 'none',
                                py: 1,
                                fontWeight: 'var(--font-bold)',
                              }}
                              onClick={() => {
                                handleReviewClick(app.id);
                              }}
                            >
                              {openingAppId === app.id ? <CircularProgress size={24} /> : 'Review Application'}
                            </Button>
                            {app.status === 'approved' && (
                              <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                disableElevation
                                disabled={processingAppId === app.id}
                                sx={{
                                  textTransform: 'none',
                                  py: 1,
                                  fontWeight: 'var(--font-bold)',
                                }}
                                onClick={async () => {
                                  const isConfirmed = await confirm({
                                    title: "Revert Approval",
                                    message: "Are you sure you want to revert the approval of this application? It will be sent back under review.",
                                    confirmText: "Revert Approval",
                                    cancelText: "Cancel",
                                    variant: "danger"
                                  });
                                  if (isConfirmed) {
                                    setProcessingAppId(app.id);
                                    try {
                                      await updateApplicationProgress(app.id, 'APPROVAL_REVERTED', {
                                        note: 'Approval reverted by institute'
                                      }, profile?.id || '', app.current_stage_index, 'pending_final_review');
                                      showToast('Approval reverted. Application is back under review.', 'info');
                                    } catch (err) {
                                      showToast('Failed to revert approval.', 'error');
                                    } finally {
                                      setProcessingAppId(null);
                                    }
                                  }
                                }}
                              >
                                {processingAppId === app.id ? <CircularProgress size={24} /> : 'Reject Approval'}
                              </Button>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
              </Grid>
            )}
          </Box>
        )}
      </Container>
      <ApplicationReviewModal
        open={!!selectedAppId}
        onClose={() => setSelectedAppId(null)}
        programId={programId}
        appId={selectedAppId}
        preloadedData={preloadedAppData}
      />
    </Box>
  );
}
