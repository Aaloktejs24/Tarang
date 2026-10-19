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
  const { t } = useTranslation();
  const { language } = useAccessibility();
  const [isBuilderOpen, setIsBuilderOpen] = React.useState(false);
  const [editingAdmission, setEditingAdmission] = React.useState(null);
  const [admissions, setAdmissions] = React.useState([]);
  const [draftAdmissions, setDraftAdmissions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [confirmDeleteInfo, setConfirmDeleteInfo] = React.useState(null); // { id, isDraft }
  const [deleteError, setDeleteError] = React.useState('');
  const { profile } = useProfile();

  const rawInstituteName = profile ? (profile.institution_name || profile.full_name || profile.username) : 'Institute';
  const breadcrumbInstituteName = formatBreadcrumbName(rawInstituteName);

  // Auto-manage breadcrumbs
  useBreadcrumbs([
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home') },
    { label: breadcrumbInstituteName, onClick: () => router.push('/dashboard/home/institute') },
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
    if (!profile?.username) return;

    const fetchPrograms = async () => {
      try {
        const [progRes, draftRes] = await Promise.allSettled([
          apiClient.get(`/admissions/institutes/${profile.username}/programs`),
          apiClient.get(`/admissions/drafts?institute_id=${profile.username}`)
        ]);

        if (progRes.status === 'fulfilled' && progRes.value.data) {
          const data = Array.isArray(progRes.value.data) ? progRes.value.data : (progRes.value.data.programs || []);
          setAdmissions(data.map(p => {
            const rawStages = typeof p.stages === 'string' ? JSON.parse(p.stages) : (p.stages || []);
            return {
              ...p,
              id: p.id,
              title: p.workflow_title,
              description: p.workflow_desc,
              status: 'Active',
              startDate: formatFullDate(p.publish_date || p.created_at),
              endDate: formatFullDate(p.last_date),
              applicants: 0,
              seats: p.seats || 0,
              stages: rawStages,
              // also expose top-level API fields for AdmissionModal to read
              academic_year: p.academic_year,
              workflow_desc: p.workflow_desc,
              workflow_title: p.workflow_title,
              publish_date: p.publish_date,
              last_date: p.last_date };
          }));
        }

        if (draftRes.status === 'fulfilled' && draftRes.value.data?.drafts) {
          const draftsList = draftRes.value.data.drafts || [];
          const parsedDrafts = draftsList.map(draftObj => {
            try {
              const parsed = JSON.parse(draftObj.draft_data);
              return {
                id: draftObj.id,
                isDraft: true,
                target_program_id: draftObj.program_id,
                title: parsed.workflowTitle || 'Untitled Draft',
                description: parsed.workflowDesc || '',
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

  const handleDeleteAdmission = (id, isDraft) => {
    setConfirmDeleteInfo({ id, isDraft });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteInfo) return;
    const { id, isDraft } = confirmDeleteInfo;
    setConfirmDeleteInfo(null);
    try {
      if (isDraft) {
        await apiClient.delete(`/admissions/drafts?institute_id=${profile.username}&draft_id=${id}`);
        setDraftAdmissions(prev => prev.filter(d => d.id !== id));
      } else {
        await apiClient.delete(`/admissions/programs/${id}`);
        setAdmissions(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete", err);
      setDeleteError(language === 'en' ? "Failed to delete. Please try again." : "हटाने में विफल। कृपया पुनः प्रयास करें।");
    }
  };

  // Bilingual name parsing is handled by getHeroPropsFromProfile via heroUtils

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
      <Box sx={{ position: "relative", minHeight: "calc(100vh - 72px)", bgcolor: "transparent", mt: "-1px" }}>
        <UniversalHero
          {...getHeroPropsFromProfile(profile, language)}
          loading={loading}
          hideContent={showEmptyState}
          showSpacer={!showEmptyState}
          fadeAnchorRef={cardsRef}
        />

        <Container ref={cardsRef} maxWidth="xl" sx={{
          position: "relative",
          zIndex: 1,
          pb: showEmptyState ? 0 : 10,
          px: { xs: 3, md: 6, lg: 8 },
          ...(showEmptyState && {
            height: "calc(100vh - 72px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center" })
        }}>
          {loading ? (
            <Grid container spacing={3}>
              {Array.from(new Array(3)).map((_, index) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={`skeleton-${index}`}>
                  <Card sx={{
                    height: 'var(--size-full)', display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-lg)',
                    background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(30px)',
                    border: 'var(--border-thin) solid rgba(30, 79, 163, 0.2)', p: 4
                  }}>
                    <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="90%" height={20} />
                    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />
                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 4 }}>
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
                          background: 'rgba(255, 255, 255, 0.4)',
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
                          {!admission.isDraft && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Typography sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-xs)', fontWeight: 'var(--font-semibold)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTimeOutlinedIcon sx={{ fontSize: 16, mb: '2px', color: 'var(--color-success)' }} /> {admission.startDate}
                              </Typography>
                              <Box component="span" sx={{ color: 'var(--color-slate-200)' }}>|</Box>
                              <Typography sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-xs)', fontWeight: 'var(--font-semibold)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTimeOutlinedIcon sx={{ fontSize: 16, mb: '2px', color: 'var(--color-error)' }} /> {admission.endDate}
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 4 }}>
                            {!admission.isDraft ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} title="Applicants">
                                  <PeopleOutlinedIcon sx={{ color: 'var(--color-primary)' }} />
                                  <Typography sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-700)', fontSize: 'var(--font-lg)' }}>{admission.applicants}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} title="Total Seats">
                                  <EventSeatOutlinedIcon sx={{ color: 'var(--color-primary)' }} />
                                  <Typography sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-700)', fontSize: 'var(--font-lg)' }}>{admission.seats}</Typography>
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
                                sx={{ border: 'var(--border-thin) solid currentColor', borderRadius: 'var(--radius-md)', width: 32, height: 32 }}
                              >
                                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingAdmission(admission.hasDraft ? admission.draftObj : admission);
                                  setIsBuilderOpen(true);
                                }}
                                sx={{ borderRadius: 'var(--radius-md)', textTransform: 'none', fontWeight: 'var(--font-bold)', height: 32, fontSize: 'var(--font-xs)' }}
                              >
                                {admission.isDraft || admission.hasDraft ? 'Resume Draft' : 'Edit'}
                              </Button>
                              {!admission.isDraft && (
                                <Button
                                  variant="contained"
                                  disableElevation
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/home/institute/admissions/${admission.id}/applications`);
                                  }}
                                  sx={{ borderRadius: 'var(--radius-md)', textTransform: 'none', fontWeight: 'var(--font-bold)', height: 32, fontSize: 'var(--font-xs)', bgcolor: 'var(--color-primary)', color: 'white', '&:hover': { bgcolor: 'var(--color-primary-hover)' } }}
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
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" style={{ width: 20, height: 20, transition: 'transform 0.2s' }}>
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
            bgcolor: 'var(--color-primary)', color: 'white',
            borderRadius: 'var(--radius-full)',
            width: { xs: 56, md: 64 },
            height: { xs: 56, md: 64 },
            minWidth: 0,
            p: 0,
            border: '1.5px solid #f59e0b',
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

      {/* Custom Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDeleteInfo}
        onClose={() => setConfirmDeleteInfo(null)}
        PaperProps={{
          sx: {
            borderRadius: 'var(--radius-lg)',
            p: 1,
            maxWidth: 400,
            width: '90%',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)', }
        }}
        BackdropProps={{
          sx: { backdropFilter: 'blur(6px)', backgroundColor: 'rgba(15,23,42,0.4)' }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, fontWeight: 800, color: 'var(--color-slate-900)', fontSize: '1.15rem' }}>
          {confirmDeleteInfo?.isDraft
            ? (language === 'en' ? 'Delete Draft?' : 'ड्राफ्ट हटाएं?')
            : (language === 'en' ? 'Delete Admission Program?' : 'प्रवेश कार्यक्रम हटाएं?')}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Typography sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-base)', lineHeight: 1.6 }}>
            {confirmDeleteInfo?.isDraft
              ? (language === 'en' ? 'Are you sure you want to delete this draft? This action cannot be undone.' : 'क्या आप वाकई इस ड्राफ्ट को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।')
              : (language === 'en' ? 'Are you sure you want to delete this admission program? This action cannot be undone.' : 'क्या आप वाकई इस प्रवेश कार्यक्रम को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।')
            }
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmDeleteInfo(null)}
            variant="outlined"
            sx={{
              borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-semibold)', textTransform: 'none',
              borderColor: 'var(--color-slate-200)', color: 'var(--color-slate-500)', px: 2.5,
              '&:hover': { borderColor: 'var(--color-slate-500)', bgcolor: 'var(--color-slate-50)' }
            }}
          >
            {language === 'en' ? 'Cancel' : 'रद्द करें'}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            disableElevation
            sx={{
              borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-bold)', textTransform: 'none',
              bgcolor: 'var(--color-error)', color: 'white', px: 2.5,
              '&:hover': { bgcolor: 'var(--color-error)' },
            }}
          >
            {language === 'en' ? 'Delete' : 'हटाएं'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!deleteError}
        autoHideDuration={4000}
        onClose={() => setDeleteError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setDeleteError('')} severity="error" sx={{ borderRadius: 'var(--radius-lg)' }}>
          {deleteError}
        </Alert>
      </Snackbar>
    </>
  );
}
