"use client";
import { useAppRouter as useRouter } from '../../../hooks/useAppRouter';
import React from 'react';
import { Box, Typography, Button, Container, Card, CardContent, Grid, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Skeleton } from '@mui/material';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EmptyState from '../../../components/ui/EmptyState';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import EventSeatOutlinedIcon from '@mui/icons-material/EventSeatOutlined';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../hooks/useTranslation';
import AdmissionModal from './AdmissionModal';


import { DASHBOARD_PAGE_WRAPPER_SX, DASHBOARD_CONTAINER_SX } from '../../../constants/layout';
import { useConfirm } from '../../../contexts/ConfirmContext';
import { useToast } from '../../../contexts/ToastContext';
import { useProfile } from '../../../hooks/useProfile';
import { apiClient } from '../../../lib/apiClient';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import UniversalHero from '../../../components/hero/UniversalHero';
import { getAcronym, capitalizeFirstLetter, formatBreadcrumbName } from '../../../utils/stringUtils';
import { getHeroPropsFromProfile } from '../../../utils/heroUtils';
import { useBreadcrumbs } from '../../../contexts/BreadcrumbContext';

const MotionDiv = motion.div;

export default function AdmissionsDashboard() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const confirm = useConfirm();
  const { showToast } = useToast();
  const { fontSizeClass } = useAccessibility();
  const [isBuilderOpen, setIsBuilderOpen] = React.useState(false);
  const [editingAdmission, setEditingAdmission] = React.useState(null);
  const [admissions, setAdmissions] = React.useState([]);
  const [draftAdmissions, setDraftAdmissions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { profile } = useProfile();

  const rawInstituteName = profile ? (profile.primary_name || profile.full_name || profile.username) : 'Institute';
  const breadcrumbInstituteName = formatBreadcrumbName(rawInstituteName);

  useBreadcrumbs([
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home/institute') },
    { labelEn: 'Student Affairs', labelHi: 'छात्र मामले', onClick: () => router.push('/dashboard/home/institute?category=student_affairs') },
    { labelEn: 'Admissions', labelHi: 'प्रवेश' }
  ]);

  const formatFullDate = (dateString) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return `${day} ${month} ${year}, ${time}`;
  };
  const cardsRef = React.useRef(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('admissionBuilderRecovery')) {
      setIsBuilderOpen(true);
    }
  }, []);

  React.useEffect(() => {
    if (!profile?.id) return;

    const fetchPrograms = async () => {
      try {
        const [progRes, draftRes] = await Promise.allSettled([
          apiClient.get(`/admissions/institutes/${profile.id}/programs`),
          apiClient.get(`/admissions/drafts?institute_id=${profile.id}`)
        ]);

        if (progRes.status === 'fulfilled' && progRes.value.data) {
          const data = Array.isArray(progRes.value.data) ? progRes.value.data : (progRes.value.data.programs || []);
          setAdmissions(data.map(p => {
            const rawStages = typeof p.stages === 'string' ? JSON.parse(p.stages) : (p.stages || []);
            return {
              ...p,
              id: p.id || p.Id || p._id,
              title: p.form_title || p.formTitle,
              description: p.form_desc || p.formDesc,
              status: 'Active',
              startDate: formatFullDate(p.publish_date || p.publishDate || p.created_at),
              endDate: formatFullDate(p.last_date || p.lastDate),
              applicants: 0,
              seats: p.seats || 0,
              stages: rawStages,
              // also expose top-level API fields for AdmissionModal to read
              academic_year: p.academic_year || p.academicYear,
              form_desc: p.form_desc || p.formDesc,
              form_title: p.form_title || p.formTitle,
              publish_date: p.publish_date || p.publishDate,
              last_date: p.last_date || p.lastDate
            };
          }));
        }

        if (draftRes.status === 'fulfilled' && draftRes.value.data?.drafts) {
          const draftsList = draftRes.value.data.drafts || [];
          const parsedDrafts = draftsList.map(draftObj => {
            try {
              const parsed = JSON.parse(draftObj.draft_data || draftObj.draftData || "{}");
              return {
                id: draftObj.id || draftObj.Id || draftObj._id,
                isDraft: true,
                target_program_id: draftObj.program_id || draftObj.programId,
                title: parsed.formTitle || 'Untitled Draft',
                description: parsed.formDesc || '',
                status: 'Draft',
                startDate: formatFullDate(parsed.publishDate || draftObj.updated_at),
                endDate: formatFullDate(parsed.expiryDate),
                applicants: 0,
                seats: parsed.maxCandidates || 0,
                draftObj: draftObj
              };
            } catch { return null; }
          }).filter(Boolean);
          setDraftAdmissions(parsedDrafts);
        } else {
          setDraftAdmissions([]);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [profile, isBuilderOpen]); // re-fetch when builder closes

  const handleDeleteAdmission = async (id, isDraft) => {
    const isConfirmed = await confirm({
      title: isDraft ? (language === 'en' ? 'Delete Draft?' : 'ड्राफ्ट हटाएं?') : (language === 'en' ? 'Delete Admission Program?' : 'प्रवेश कार्यक्रम हटाएं?'),
      message: isDraft 
        ? (language === 'en' ? 'Are you sure you want to delete this draft? This action cannot be undone.' : 'क्या आप वाकई इस ड्राफ्ट को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।')
        : (language === 'en' ? 'Are you sure you want to delete this admission program? This action cannot be undone.' : 'क्या आप वाकई इस प्रवेश कार्यक्रम को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।'),
      confirmText: language === 'en' ? 'Delete' : 'हटाएं',
      cancelText: language === 'en' ? 'Cancel' : 'रद्द करें',
      variant: 'danger'
    });

    if (!isConfirmed) return;

    try {
      if (isDraft) {
        await apiClient.delete(`/admissions/drafts?institute_id=${profile.id}&draft_id=${id}`);
        setDraftAdmissions(prev => prev.filter(a => a.id !== id));
      } else {
        await apiClient.delete(`/admissions/programs/${id}`);
        setAdmissions(prev => prev.filter(a => String(a.id) !== String(id)));
      }
    } catch (err) {
      console.error("Failed to delete", err);
      showToast(language === 'en' ? "Failed to delete. Please try again." : "हटाने में विफल। कृपया पुनः प्रयास करें।", "error");
    }
  };

  // Combine drafts and admissions, ensuring if a draft targets an existing program, we merge it.
  const standaloneDrafts = draftAdmissions.filter(d => !d.target_program_id || !admissions.some(a => a.id.toString() === d.target_program_id.toString()));
  const mergedAdmissions = admissions.map(a => {
    const associatedDraft = draftAdmissions.find(d => d.target_program_id && d.target_program_id.toString() === a.id.toString());
    if (associatedDraft) {
      return { ...a, hasDraft: true, draftObj: associatedDraft };
    }
    return a;
  });

  const displayItems = [...standaloneDrafts, ...mergedAdmissions];
  const showEmptyState = !loading && displayItems.length === 0;

  return (
    <>
      <Box sx={DASHBOARD_PAGE_WRAPPER_SX}>
        <UniversalHero
          {...getHeroPropsFromProfile(profile, language)}
          loading={loading}
          hideContent={!loading && showEmptyState}
          showSpacer={loading || !showEmptyState}
          fadeAnchorRef={cardsRef}
        />

        <Container ref={cardsRef} maxWidth={false} sx={{
          ...DASHBOARD_CONTAINER_SX,
          pb: showEmptyState ? 0 : 10,
          ...(!loading && showEmptyState && {
            height: "calc(100vh - 72px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          })
        }}>
          {loading ? (
            <Grid container spacing={3}>
              {Array.from(new Array(3)).map((_, index) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={`skeleton-${index}`}>
                  <Card sx={{
                    height: 'var(--size-full)', display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-lg)',
                    background: 'var(--card-bg)', border: 'var(--border-thin) solid var(--card-border)', p: 4
                  }}>
                    <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="90%" height={20} />
                    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />
                    <Box sx={{ mt: 'auto' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0 }}>
                      <Box sx={{ display: 'flex', gap: 4 }}>
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton variant="circular" width={24} height={24} />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 'var(--radius-md)' }} />
                        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 'var(--radius-md)' }} />
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : displayItems.length > 0 ? (
            <>
              {/* Header removed as requested, button moved to floating */}
              <Grid container spacing={3}>
                {displayItems.map((admission, index) => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={admission.id}>
                    <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }} style={{ height: 'var(--size-full)' }}>
                      <Card
                        sx={{
                          height: 'var(--size-full)',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 'var(--radius-lg)',
                          background: 'var(--glass-bg)',
                          backdropFilter: 'blur(30px)',
                          border: 'var(--border-thin) solid rgba(30, 79, 163, 0.2)',
                          transition: 'var(--transition-slow)',
                          '&:hover': {
                            transform: 'translateY(-4px)'
                          }
                        }}>
                        <CardContent sx={{ p: 4, position: 'relative', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                          <Box sx={{ position: 'absolute', top: 38, right: 32, display: 'flex', alignItems: 'center' }}>
                            <Box sx={{
                              width: 10, height: 10, borderRadius: 'var(--radius-full)',
                              bgcolor: admission.status === 'Active' ? 'var(--color-success)' : (admission.status === 'Draft' ? 'var(--color-warning)' : 'var(--color-slate-900)')
                            }} title={admission.status} />
                          </Box>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 1, lineHeight: 1.3, pr: 4 }}>
                            {admission.title}
                          </Typography>
                          {admission.description ? (
                            <Typography sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-sm)', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {admission.description}
                            </Typography>
                          ) : (
                            <Typography sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-sm)', mb: 2 }}>
                              Description ....
                            </Typography>
                          )}
                          <Box sx={{ mt: 'auto' }} />
                          {!admission.isDraft && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                              <Typography sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-xs)', fontWeight: 'var(--font-semibold)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTimeOutlinedIcon sx={{ fontSize: 16, mb: '2px', color: 'var(--color-success)' }} /> {admission.startDate}
                              </Typography>
                              <Box component="span" sx={{ color: 'var(--color-slate-200)' }}>|</Box>
                              <Typography sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-xs)', fontWeight: 'var(--font-semibold)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTimeOutlinedIcon sx={{ fontSize: 16, mb: '2px', color: 'var(--color-error)' }} /> {admission.endDate}
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0 }}>
                            {!admission.isDraft ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} title="Applicants">
                                  <PeopleOutlinedIcon sx={{ color: 'var(--color-primary)' }} />
                                  <Typography sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', fontSize: 'var(--font-lg)' }}>{admission.applicants}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} title="Total Seats">
                                  <EventSeatOutlinedIcon sx={{ color: 'var(--color-primary)' }} />
                                  <Typography sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', fontSize: 'var(--font-lg)' }}>{admission.seats}</Typography>
                                </Box>
                              </Box>
                            ) : (
                              <Box sx={{ flex: 1 }} />
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAdmission(admission.id, admission.isDraft);
                                }}
                                sx={{ border: 'var(--border-thin) solid currentColor', borderRadius: 'var(--radius-sm)', width: 32, height: 32 }}
                              >
                                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                              {admission.isDraft && (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingAdmission(admission.draftObj ?? admission);
                                  setIsBuilderOpen(true);
                                }}
                                sx={{ borderRadius: 'var(--radius-sm)', textTransform: 'none', fontWeight: 'var(--font-bold)', height: 32, fontSize: 'var(--font-xs)' }}
                              >
                                Resume Draft
                              </Button>
                              )}
                              {!admission.isDraft && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingAdmission(admission);
                                    setIsBuilderOpen(true);
                                  }}
                                  sx={{ borderRadius: 'var(--radius-sm)', textTransform: 'none', fontWeight: 'var(--font-bold)', height: 32, fontSize: 'var(--font-xs)' }}
                                >
                                  Update
                                </Button>
                              )}
                              {!admission.isDraft && (
                                <Button
                                  variant="contained"
                                  disableElevation
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/home/institute/admissions/${admission.id}/applications`);
                                  }}
                                  sx={{ borderRadius: 'var(--radius-sm)', textTransform: 'none', fontWeight: 'var(--font-bold)', height: 32, fontSize: 'var(--font-xs)', bgcolor: 'var(--color-primary)', color: 'var(--color-white)', '&:hover': { bgcolor: 'var(--color-primary-hover)' } }}
                                >
                                  Manage
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </MotionDiv>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <EmptyState
              title={t('admissionsDashboard.emptyStateTitle')}
              subtitle={t('admissionsDashboard.emptyStateSubtitle')}
              actionLabel={t('admissionsDashboard.startBuildingBtn')}
              actionIcon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" style={{ width: 20, height: 20, transition: 'transform var(--transition-base)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
                </svg>
              }
              onAction={() => setIsBuilderOpen(true)}
            />
          )}
        </Container>

        {/* Floating Action Button */}
        <Button
          variant="contained" disableElevation
          onClick={() => {
            setEditingAdmission(null);
            setIsBuilderOpen(true);
          }}
          sx={{
            position: 'fixed',
            bottom: { xs: 24, md: 40 },
            right: { xs: 24, md: 40 },
            zIndex: 'var(--z-dropdown)',
            bgcolor: 'var(--color-primary)', color: 'var(--color-white)',
            borderRadius: 'var(--radius-full)',
            width: { xs: 56, md: 64 },
            height: { xs: 56, md: 64 },
            minWidth: 0,
            p: 0,
            border: '1.5px solid var(--color-warning)',
            '&:hover': { bgcolor: 'var(--color-primary-hover)', },
            transition: 'var(--transition-slow)'
          }}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" style={{ width: 28, height: 28 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
          </svg>
        </Button>
      </Box>

      {/* Admission Builder Layover */}
      <AdmissionModal
        open={isBuilderOpen}
        onClose={() => {
          if (typeof window !== 'undefined') sessionStorage.removeItem('admissionBuilderRecovery');
          setIsBuilderOpen(false);
          setTimeout(() => setEditingAdmission(null), 300); // clear after animation
        }}
        editData={editingAdmission}
      />
    </>
  );
}
