"use client";
import React from 'react';
import { Box, Typography, Button, Container, Paper, Avatar, Grid, Card, CardContent, Divider, Chip, CircularProgress, IconButton, TextField, MenuItem, FormControl, InputLabel, Select, Tooltip } from '@mui/material';
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
import EmptyState from '../../../../../../../components/ui/EmptyState';
import { CustomTooltip } from '../../../../../../../components/common/CustomTooltip';
import { CustomFloatingInput, CustomFloatingSelect } from '../../../../../../../components/common/CustomFloatingFields';
import ApplicationReviewDrawer from './ApplicationReviewDrawer';

export default function ApplicationsManagementPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params.programId;
  const { profile } = useProfile();
  const { language } = useAccessibility();

  const [applications, setApplications] = React.useState([]);
  const [programInfo, setProgramInfo] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedAppId, setSelectedAppId] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const cardsRef = React.useRef(null);

  const rawInstituteName = profile ? (profile.institution_name || profile.full_name || profile.username) : 'Institute';
  const breadcrumbInstituteName = formatBreadcrumbName(rawInstituteName);

  useBreadcrumbs([
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home') },
    { label: breadcrumbInstituteName, onClick: () => router.push('/dashboard/home/institute') },
    { labelEn: 'Admissions', labelHi: 'प्रवेश', onClick: () => router.push('/dashboard/home/institute/admissions') },
    { labelEn: 'Applicants', labelHi: 'आवेदक' }
  ]);

  React.useEffect(() => {
    if (!profile?.username || !programId) return;

    const fetchApplications = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/admissions/institutes/${profile.username}/applications`);

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
          const progRes = await apiClient.get(`/admissions/institutes/${profile.username}/programs`);
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
  }, [profile, programId]);

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
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 72px)", bgcolor: "transparent", mt: "-1px" }}>
      <Container maxWidth="xl" sx={{
        position: "relative",
        zIndex: 1,
        px: { xs: 2, md: 4 },
        pb: 0,
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center" }}>
        {showEmptyState ? (
          <EmptyState
            title={language === 'en' ? 'No Applications Yet' : 'कोई आवेदन नहीं'}
            subtitle={language === 'en' ? 'No applications have been submitted for this program yet.' : 'अभी तक इस कार्यक्रम के लिए कोई आवेदन जमा नहीं किया गया है।'}
          />
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
              <Box>


                <CustomFloatingInput
                  label="Search by Applicant ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mb: 3 }}
                  InputProps={{
                    endAdornment: <SearchIcon sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-lg)' }} />
                  }}
                />

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

            <Box sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              py: { xs: 4, md: 6 },
              px: { xs: 3, md: 6 },
              background: "rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              border: "var(--border-thin) solid rgba(30, 79, 163, 0.2)",
              borderRadius: 'var(--radius-lg)',
              m: { xs: 0, md: 1 },
              mr: { xs: 0, md: 2 },
              overflowY: 'auto'
            }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 10 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box sx={{ textAlign: 'center', p: 10, color: 'error.main' }}>{error}</Box>
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
                        <Grid key={app.id} size={{xs: 12, sm: 6, md: 6, lg: 4}}>
                          <Card sx={{
                            transition: 'var(--transition-slow)',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                            }
                          }}>
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar sx={{ width: 42, height: 42, bgcolor: 'var(--color-primary)', fontSize: 'var(--font-lg)', fontWeight: 'var(--font-semibold)' }}>
                                    {applicantName.substring(0, 2).toUpperCase()}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }} title={applicantName}>
                                      {applicantName}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'var(--color-slate-500)', fontWeight: 'var(--font-semibold)', display: 'block' }}>
                                      ID: {app.id.substring(0, 8).toUpperCase()}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>

                              <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.05)' }} />

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

                              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                                {basicDetails && (
                                  <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {basicDetails.email && (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--color-slate-500)' }}>
                                        <EmailOutlinedIcon sx={{ fontSize: 16, color: 'var(--color-slate-500)' }} />
                                        <Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>
                                          {basicDetails.email}
                                        </Typography>
                                      </Box>
                                    )}
                                    {basicDetails.phone && (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--color-slate-500)' }}>
                                        <LocalPhoneOutlinedIcon sx={{ fontSize: 16, color: 'var(--color-slate-500)' }} />
                                        <Typography variant="body2" sx={{ fontWeight: 'var(--font-medium)' }}>
                                          {basicDetails.phone}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                )}
                              </Box>
                            </CardContent>

                            <Box sx={{ px: 3, pb: 3, pt: 0 }}>
                              <Button
                                fullWidth
                                variant="contained"
                                disableElevation
                                startIcon={<VisibilityOutlinedIcon />}
                                sx={{
                                  borderRadius: 'var(--radius-lg)',
                                  textTransform: 'none',
                                  py: 1,
                                  bgcolor: 'rgba(0, 86, 179, 0.08)',
                                  color: 'var(--color-primary)',
                                  fontWeight: 'var(--font-semibold)',
                                  '&:hover': {
                                    bgcolor: 'rgba(0, 86, 179, 0.15)' }
                                }}
                                onClick={() => {
                                  setSelectedAppId(app.id);
                                }}
                              >
                                Review Application
                              </Button>
                            </Box>
                          </Card>
                        </Grid>
                      );
                    })}
                </Grid>
              )}
            </Box>
          </Paper>
        )}
      </Container>
      <ApplicationReviewDrawer
        open={!!selectedAppId}
        onClose={() => setSelectedAppId(null)}
        programId={programId}
        appId={selectedAppId}
      />
    </Box>
  );
}
