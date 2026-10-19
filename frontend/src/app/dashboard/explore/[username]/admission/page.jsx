"use client";
import React, { useState } from 'react';
import { apiClient } from '../../../../../lib/apiClient';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import { Box, Typography, Container, Paper, Button, Grid, Stepper, Step, StepLabel, Divider, Tooltip, Skeleton } from '@mui/material';
import { useParams } from 'next/navigation';
import { useAppRouter as useRouter } from '../../../../../hooks/useAppRouter';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useAccessibility } from '../../../../../contexts/AccessibilityContext';
import { getAcronym, capitalizeFirstLetter, formatBreadcrumbName } from '../../../../../utils/stringUtils';
import EmptyState from '../../../../../components/ui/EmptyState';
import { useProfile } from '../../../../../hooks/useProfile';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import EventSeatOutlinedIcon from '@mui/icons-material/EventSeatOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import UniversalHero from '../../../../../components/hero/UniversalHero';
import { getHeroPropsFromProfile } from '../../../../../utils/heroUtils';
import { useBreadcrumbs } from "../../../../../contexts/BreadcrumbContext";
import { applyForProgram } from '../../../../../features/admission/admissionService';
import Loader from '../../../../../components/common/Loader';

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'rgba(30, 79, 163, 0.65)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.2)',
    fontSize: '0.8rem',
    borderRadius: '12px',
    padding: '8px 12px',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: 'rgba(30, 79, 163, 0.65)',
  },
}));

export default function AdmissionPage() {
  const router = useRouter();
  const { username } = useParams();
  const { language } = useAccessibility();
  const { profile } = useProfile();
  const cardsRef = React.useRef(null);

  const isOwner = profile?.username === username;

  const instituteName = username ? username.toUpperCase() : 'Institute';

  const [instituteProfile, setInstituteProfile] = useState(null);
  const [loadingInstitute, setLoadingInstitute] = useState(true);

  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [applyingTo, setApplyingTo] = useState(null);

  // Auto-manage breadcrumbs lifecycle for this page
  const rawInstituteName = instituteProfile?.full_name || instituteProfile?.institution_name || instituteProfile?.username || username;
  const breadcrumbInstituteName = formatBreadcrumbName(rawInstituteName);

  useBreadcrumbs([
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home') },
    { labelEn: 'Explore', labelHi: 'खोजें', onClick: () => router.push('/dashboard/explore') },
    { label: breadcrumbInstituteName, onClick: () => router.push(`/dashboard/explore/${username}`) },
    { labelEn: 'Admissions', labelHi: 'प्रवेश' }
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

        setInstituteProfile(apiProfile);
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
      setLoadingPrograms(true);
      try {
        const progRes = await apiClient.get(`/admissions/institutes/${username}/programs`);
        console.log('[Admission Page] API Response:', progRes.data);
        const data = Array.isArray(progRes.data) ? progRes.data : (progRes.data?.programs || []);
        console.log('[Admission Page] Programs data:', data);

        const mappedPrograms = data.map(p => ({
          id: p.id,
          workflowTitle: p.workflow_title || p.workflowTitle || 'Untitled Program',
          workflowDesc: p.workflow_desc || p.workflowDesc || '',
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
      } catch (err) {
        console.error("[Admission Page] Failed to fetch programs:", err?.response?.status, err?.response?.data, err);
      } finally {
        setLoadingPrograms(false);
      }
    };

    if (username) {
      fetchPrograms();
    }
  }, [username]);

  const handleApply = async (prog) => {
    if (!profile?.id) {
      // Typically shouldn't happen if user is logged in
      return;
    }
    setApplyingTo(prog.id);
    try {
      const response = await applyForProgram(prog.id, profile.id, instituteProfile.username, {
        source: 'explore_page'
      });
      console.log('Application started:', response);
      
      const appId = response.application?.id;
      if (appId) {
        router.push(`/dashboard/explore/${username}/admission/${prog.id}?appId=${appId}`);
      } else {
        router.push(`/dashboard/explore/${username}/admission/${prog.id}`);
      }
    } catch (err) {
      console.error('Failed to apply:', err);
      // Even if it fails (maybe already applied), route there to let the page fetch the existing application
      router.push(`/dashboard/explore/${username}/admission/${prog.id}`);
    } finally {
      setApplyingTo(null);
    }
  };

  const showEmptyState = !loadingPrograms && programs.length === 0;

  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 72px)", overflowX: "hidden", bgcolor: "transparent", mt: "-1px" }}>
      <UniversalHero
        {...getHeroPropsFromProfile(instituteProfile, language)}
        loading={loadingInstitute || loadingPrograms}
        hideContent={showEmptyState}
        showSpacer={!showEmptyState}
        fadeAnchorRef={cardsRef}
      />

      <Container ref={cardsRef} maxWidth="xl" sx={{
        position: "relative",
        zIndex: 1,
        px: { xs: 2, md: 4 },
        pb: showEmptyState ? 0 : 10,
        ...(showEmptyState && {
          height: "calc(100vh - 72px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        })
      }}>
        <Box sx={{ width: '100%' }}>
          {isOwner && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => router.push('/dashboard/settings/admissions/create')}
                sx={{ bgcolor: '#1e4fa3', borderRadius: '8px' }}
              >
                Create Program
              </Button>
            </Box>
          )}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
              gap: 3
            }}
          >
            {loadingPrograms ? (
              <>
                {Array.from(new Array(3)).map((_, index) => (
                  <Paper key={`skeleton-${index}`} elevation={0} sx={{
                    borderRadius: "24px",
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(30, 79, 163, 0.2)',
                    boxShadow: 'none',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden'
                  }}>
                    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative' }}>
                      <Box sx={{ position: 'absolute', top: 38, right: 32 }}>
                        <Skeleton variant="circular" width={10} height={10} />
                      </Box>
                      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
                          {Array.from(new Array(6)).map((_, i) => (
                            <Skeleton key={i} variant="circular" width={24} height={24} />
                          ))}
                        </Box>
                        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: '8px' }} />
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </>
            ) : programs.length === 0 ? (
              <Box sx={{ gridColumn: '1 / -1', width: '100%' }}>
                <EmptyState
                  title={
                    isOwner
                      ? (language === 'en' ? "No Programs Created" : "कोई प्रोग्राम नहीं बनाया गया")
                      : (language === 'en' ? "No Programs Available" : "कोई प्रोग्राम उपलब्ध नहीं है")
                  }
                  subtitle={
                    isOwner
                      ? (language === 'en' ? "Start accepting students by creating your first admission program." : "अपना पहला प्रवेश कार्यक्रम बनाकर छात्रों को स्वीकार करना शुरू करें।")
                      : (language === 'en' ? "This institute hasn't listed any admission programs yet. Please check back later." : "इस संस्थान ने अभी तक कोई प्रवेश कार्यक्रम सूचीबद्ध नहीं किया है। कृपया बाद में दोबारा जाँचें।")
                  }
                  actionLabel={isOwner ? (language === 'en' ? "Create Program" : "प्रोग्राम बनाएं") : undefined}
                  actionIcon={isOwner ? <AddCircleOutlineIcon /> : undefined}
                  onAction={isOwner ? () => router.push('/dashboard/settings/admissions/create') : undefined}
                />
              </Box>
            ) : (
              programs.map((prog) => (
                <Paper
                  key={prog.id}
                  elevation={0}
                  sx={{
                    borderRadius: "24px",
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(30, 79, 163, 0.2)',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box sx={{ p: 4, position: 'relative', display: 'flex', flexDirection: 'column', flexGrow: 1, cursor: 'default' }}>
                    <Box sx={{ position: 'absolute', top: 38, right: 32, display: 'flex', alignItems: 'center' }}>
                      <Box sx={{
                        width: 10, height: 10, borderRadius: '50%',
                        bgcolor: '#10b981'
                      }} title={prog.academicYear !== 'N/A' ? prog.academicYear : 'Admission Open'} />
                    </Box>

                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, lineHeight: 1.3, pr: 4 }}>
                      {prog.workflowTitle}
                    </Typography>

                    {prog.workflowDesc ? (
                      <Typography sx={{ color: '#475569', fontSize: '0.9rem', mb: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {prog.workflowDesc}
                      </Typography>
                    ) : (
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', mb: 3 }}>
                        Description ....
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
                        <CustomTooltip
                          title={
                            <Box sx={{ p: 0.5 }}>
                              <Typography sx={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>
                                {language === 'en' ? 'Last Date' : 'अंतिम तिथि'}
                              </Typography>
                              <Typography sx={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
                                {prog.lastDate}
                              </Typography>
                            </Box>
                          }
                          arrow placement="top-start"
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s', cursor: 'pointer', '&:hover': { color: '#0056b3', transform: 'scale(1.1)' } }}>
                            <EventOutlinedIcon sx={{ fontSize: '1.4rem' }} />
                          </Box>
                        </CustomTooltip>

                        <CustomTooltip
                          title={
                            <Box sx={{ p: 0.5 }}>
                              <Typography sx={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>
                                {language === 'en' ? 'Seats' : 'सीटें'}
                              </Typography>
                              <Typography sx={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
                                {prog.seats}
                              </Typography>
                            </Box>
                          }
                          arrow placement="top-start"
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s', cursor: 'pointer', '&:hover': { color: '#0056b3', transform: 'scale(1.1)' } }}>
                            <EventSeatOutlinedIcon sx={{ fontSize: '1.4rem' }} />
                          </Box>
                        </CustomTooltip>

                        <CustomTooltip
                          title={
                            <Box sx={{ p: 0.5 }}>
                              <Typography sx={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>
                                {language === 'en' ? 'Academic Year' : 'शैक्षणिक वर्ष'}
                              </Typography>
                              <Typography sx={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
                                {prog.academicYear}
                              </Typography>
                            </Box>
                          }
                          arrow placement="top-start"
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s', cursor: 'pointer', '&:hover': { color: '#0056b3', transform: 'scale(1.1)' } }}>
                            <SchoolOutlinedIcon sx={{ fontSize: '1.4rem' }} />
                          </Box>
                        </CustomTooltip>

                        <CustomTooltip
                          title={
                            <Box sx={{ p: 0.5 }}>
                              <Typography sx={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>
                                {language === 'en' ? 'Eligibility' : 'योग्यता'}
                              </Typography>
                              <Typography sx={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
                                {prog.eligibility}
                              </Typography>
                            </Box>
                          }
                          arrow placement="top-start"
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s', cursor: 'pointer', '&:hover': { color: '#0056b3', transform: 'scale(1.1)' } }}>
                            <InfoOutlinedIcon sx={{ fontSize: '1.4rem' }} />
                          </Box>
                        </CustomTooltip>

                        <CustomTooltip
                          title={
                            <Box sx={{ p: 0.5 }}>
                              <Typography sx={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>
                                {language === 'en' ? 'Fees' : 'फीस'}
                              </Typography>
                              <Typography sx={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
                                {prog.fees}
                              </Typography>
                            </Box>
                          }
                          arrow placement="top-start"
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s', cursor: 'pointer', '&:hover': { color: '#0056b3', transform: 'scale(1.1)' } }}>
                            <AccountBalanceWalletOutlinedIcon sx={{ fontSize: '1.4rem' }} />
                          </Box>
                        </CustomTooltip>

                        <CustomTooltip
                          title={
                            <Box sx={{ p: 0.5 }}>
                              <Typography sx={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>
                                {language === 'en' ? 'Duration' : 'अवधि'}
                              </Typography>
                              <Typography sx={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
                                {prog.duration}
                              </Typography>
                            </Box>
                          }
                          arrow placement="top-start"
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s', cursor: 'pointer', '&:hover': { color: '#0056b3', transform: 'scale(1.1)' } }}>
                            <AccessTimeOutlinedIcon sx={{ fontSize: '1.4rem' }} />
                          </Box>
                        </CustomTooltip>
                      </Box>

                      {isOwner ? (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => { e.stopPropagation(); router.push('/dashboard/home/institute/admissions'); }}
                          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                        >
                          Manage in Dashboard
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={applyingTo === prog.id}
                          onClick={() => handleApply(prog)}
                          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, height: 32, fontSize: '0.8rem', position: 'relative' }}
                        >
                          {applyingTo === prog.id ? <Loader size={16} /> : (language === 'en' ? 'Apply Now' : 'आवेदन करें')}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
