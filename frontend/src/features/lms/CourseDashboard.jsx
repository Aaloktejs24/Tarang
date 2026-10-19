"use client";
import { useAppRouter as useRouter } from '../../hooks/useAppRouter';
import mockData from '../../data/lmsData.json';
import courseConfig from '../../data/courseConfig.json';
const { lmsData: lmsData } = mockData;
const { courseAccessOptions: accessOptions } = courseConfig;
import React from 'react';
import dayjs from 'dayjs';
import { useBreadcrumbs } from '../../contexts/BreadcrumbContext';
import { formatBreadcrumbName } from '../../utils/stringUtils';
import { useTheme } from '@mui/material';
import { Box, Typography, Button, Container, Grid, CardMedia, CardContent, IconButton, Chip, Fab, SpeedDialIcon, Breadcrumbs, Link, TextField, Paper, Accordion, AccordionSummary, AccordionDetails, Autocomplete, Dialog, Popover, Tooltip, InputAdornment, ListItemButton, Avatar, Skeleton, Stack, Divider } from '@mui/material';
import PremiumCard from '../../components/ui/PremiumCard';
import { ShowMore } from '@re-dev/react-truncate';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import EmptyState from '../../components/ui/EmptyState';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GroupIcon from '@mui/icons-material/Group';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import useScrollLock from "../../hooks/useScrollLock";
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useProfile } from '../../hooks/useProfile';
import UniversalHero from '../../components/hero/UniversalHero';
import { getHeroPropsFromProfile } from '../../utils/heroUtils';
import TarangButton from '../../components/common/TarangButton';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useToast } from '../../contexts/ToastContext';
import { lmsService } from './lmsService';
import PDFRenderer from '../../components/viewer/renderers/PDFRenderer';
import { DialogContent } from '@mui/material';



const { audienceLevels, courseCategories, tagCategories } = lmsData;

const getModuleDateValue = (value) => {
  if (!value) return null;
  const date = dayjs(value);
  return date.isValid() ? date : null;
};

const formatModuleDate = (value) => {
  const date = getModuleDateValue(value);
  return date ? date.format('DD MMM YYYY') : '';
};

const formatModuleDateShort = (value) => {
  const date = getModuleDateValue(value);
  return date ? date.format('DD MMM') : '';
};

const getModuleDateTriggerLabel = (module) => {
  if (module.startDate && module.endDate) {
    return `${formatModuleDateShort(module.startDate)} - ${formatModuleDateShort(module.endDate)}`;
  }

  if (module.startDate) {
    return `Starts ${formatModuleDateShort(module.startDate)}`;
  }

  if (module.endDate) {
    return `Ends ${formatModuleDateShort(module.endDate)}`;
  }

  return 'Timeline';
};

const calendarFont = "inherit";

const timelineCalendarPaperSx = {
  mt: 1,
  width: 'min(340px, calc(100vw - 32px))',
  p: 0.75,
  borderRadius: 'var(--radius-lg)',
  background: `
    radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.1) 0, transparent 55%),
    radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.09) 0, transparent 55%),
    rgba(255, 255, 255, 0.96)
  `,
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: 'var(--border-thin) solid var(--color-slate-200)',
  overflow: 'hidden'
};

const timelineCalendarSx = {
  width: 'var(--size-full)',
  height: 'auto',
  maxHeight: 'none',
  color: 'var(--color-slate-900)',
  fontFamily: calendarFont,
  '& *': {
    fontFamily: `${calendarFont}`
  },
  '& .MuiPickersCalendarHeader-root': {
    minHeight: 42,
    maxHeight: 42,
    mt: 0,
    px: 1,
    pt: 0.5,
    pb: 0,
    gap: 1,
    alignItems: 'center'
  },
  '& .MuiPickersCalendarHeader-labelContainer': {
    mr: 'auto',
    minWidth: 0
  },
  '& .MuiPickersCalendarHeader-label': {
    color: 'var(--color-slate-900)',
    fontSize: '15.5px',
    fontWeight: 850,
    letterSpacing: 0,
    lineHeight: 1.5,
    paddingTop: '4px',
    paddingBottom: '4px'
  },
  '& .MuiPickersArrowSwitcher-root': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
    p: 0.35,
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--glass-bg)',
    border: 'var(--border-thin) solid var(--color-slate-200)'
  },
  '& .MuiPickersCalendarHeader-switchViewButton, & .MuiPickersArrowSwitcher-button': {
    width: 36,
    height: 32,
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-slate-500)',
    m: 0,
    transition: 'var(--transition-base)',
    '& svg': {
      fontSize: '1.45rem',
      strokeWidth: 1.5
    },
    '&:hover': {
      color: 'var(--color-primary)',
      backgroundColor: 'rgba(0, 86, 179, 0.08)'
    }
  },
  '& .MuiPickersArrowSwitcher-spacer': {
    display: 'none'
  },
  '& .MuiDayCalendar-header': {
    justifyContent: 'space-around',
    px: 1,
    mt: 0.75,
    mb: 0
  },
  '& .MuiDayCalendar-weekDayLabel': {
    width: 34,
    height: 28,
    m: 0,
    color: 'var(--color-slate-500)',
    fontSize: '11.5px',
    fontWeight: 800
  },
  '& .MuiPickersSlideTransition-root': {
    minHeight: 180
  },
  '& .MuiDayCalendar-weekContainer': {
    justifyContent: 'space-around',
    mx: 1,
    my: 0
  },
  '& .MuiPickersDay-root': {
    width: 34,
    height: 34,
    m: 0,
    borderRadius: 'var(--radius-md)',
    border: 'var(--border-thin) solid transparent',
    color: 'var(--color-slate-900)',
    fontSize: 'var(--font-sm)',
    fontWeight: 'var(--font-bold)',
    transition: 'all 0.18s ease',
    '&:hover': {
      color: 'var(--color-primary)',
      backgroundColor: 'rgba(0, 86, 179, 0.08)'
    }
  },
  '& .MuiPickersDay-today': {
    borderColor: 'rgba(40, 167, 69, 0.6)',
    backgroundColor: 'rgba(40, 167, 69, 0.08)'
  },
  '& .MuiPickersDay-root.Mui-selected': {
    color: 'var(--color-white)',
    borderColor: 'transparent',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%)', border: 'var(--border-thin) solid var(--color-slate-200)'
  },
  '& .MuiPickersDay-root.Mui-disabled': {
    color: 'var(--color-slate-200)'
  },
  '& .MuiYearCalendar-root, & .MuiMonthCalendar-root': {
    width: 'var(--size-full)',
    maxHeight: 228,
    p: 1
  },
  '& .MuiPickersYear-yearButton, & .MuiPickersMonth-monthButton': {
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-slate-900)',
    fontSize: 'var(--font-sm)',
    fontWeight: 'var(--font-bold)',
    '&:hover': {
      color: 'var(--color-primary)',
      backgroundColor: 'rgba(0, 86, 179, 0.08)'
    }
  },
  '& .MuiPickersYear-yearButton.Mui-selected, & .MuiPickersMonth-monthButton.Mui-selected': {
    color: 'var(--color-white)',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%)'
  }
};



import CourseModal from './components/CourseModal';
import { CustomTooltip } from '../../components/common/CustomTooltip';
import { DASHBOARD_PAGE_WRAPPER_SX, DASHBOARD_CONTAINER_SX } from '../../constants/layout';
import SearchIcon from '@mui/icons-material/Search';
import CentralDropdown from '../../components/common/CentralDropdown';

export default function CourseDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { language, lmsTheme } = useAccessibility();
  const { showToast } = useToast();

  // Initialize selected category filter based on profile
  const { profile, loading: isProfileLoading } = useProfile();
  const isManagement = profile?.role === 'institute' || profile?.role === 'admin' || profile?.user_type === 'institute' || profile?.is_institute;
  
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("newest");

  React.useEffect(() => {
    if (profile?.institute_profile?.courses_offered?.length > 0) {
      // Logic for selected category if needed
    }
  }, [profile]);
  const rawInstituteName = profile ? (profile.primary_name || profile.full_name || profile.username) : 'Institute';
  const breadcrumbInstituteName = formatBreadcrumbName(rawInstituteName);

  useBreadcrumbs([
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home/institute') },
    { labelEn: 'Academic Affairs', labelHi: 'शैक्षणिक मामले', onClick: () => router.push('/dashboard/home/institute?category=academic_affairs') },
    { labelEn: 'Courses', labelHi: 'पाठ्यक्रम' }
  ]);

  const [courses, setCourses] = React.useState([]);
  const [enrolledCourses, setEnrolledCourses] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [enrollLoading, setEnrollLoading] = React.useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [courseToEdit, setCourseToEdit] = React.useState(null);

  React.useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        if (!isManagement && profile?.id) {
          const [allData, enrolledData] = await Promise.all([
            lmsService.listCourses(),
            lmsService.getEnrolledCourses(profile.id)
          ]);
          if (allData) setCourses(allData);
          if (enrolledData) setEnrolledCourses(enrolledData);
        } else {
          const data = await lmsService.listCourses();
          if (data) setCourses(data);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [profile?.id, isManagement]);

  const handleEnroll = async (e, courseId) => {
    e.stopPropagation();
    if (!profile?.id) return;
    try {
      setEnrollLoading(prev => ({ ...prev, [courseId]: true }));
      await lmsService.enrollCourse(courseId, profile.id, profile?.full_name || profile?.username, profile?.email, profile?.profile_pic_url);
      
      const newEnrolledData = await lmsService.getEnrolledCourses(profile.id);
      if (newEnrolledData) {
        setEnrolledCourses(newEnrolledData);
        showToast(language === 'en' ? 'Successfully enrolled!' : 'सफलतापूर्वक नामांकित!', 'success');
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
      showToast(language === 'en' ? 'Failed to enroll' : 'नामांकन में विफल', 'error');
    } finally {
      setEnrollLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const heroContentRef = React.useRef(null);
  useScrollLock(isCreateModalOpen);
  const isFullyLoading = isLoading || isProfileLoading;

  const filteredAndSortedCourses = courses
    .filter(course => {
      const titleMatch = (course.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = (course.description || course.desc || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      let typeMatch = true;
      const isEnrolled = enrolledCourses.some(c => c.id === course.id);
      if (filterType === 'enrolled') {
        typeMatch = isEnrolled;
      } else if (filterType === 'not_enrolled') {
        typeMatch = !isEnrolled;
      }
      return (titleMatch || descMatch) && typeMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'alphabetical') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'newest') return (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0));
      if (sortBy === 'oldest') return (new Date(a.createdAt || 0)) - (new Date(b.createdAt || 0));
      return 0;
    });

  return (
    <>
      <Box sx={{ minHeight: "calc(100vh - 64px)", pt: { xs: 4, md: 4 }, pb: 10, position: "relative", zIndex: 1 }}>
        <Container ref={heroContentRef} maxWidth={false} sx={{
          px: { xs: 2, sm: 4, md: 8, lg: 12, xl: 16 },
          ...(!isFullyLoading && courses.length === 0 && {
            height: "calc(100vh - 72px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column"
          })
        }}>

          {!isFullyLoading && courses.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5, mb: 6, mt: 2, alignItems: 'center', justifyContent: 'space-between' }}>
              <TextField
                fullWidth
                placeholder={language === 'en' ? "Search courses by name or description..." : "नाम या विवरण से पाठ्यक्रम खोजें..."}
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'var(--color-slate-500)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--glass-bg)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    height: 'var(--box-height, 48px)',
                    fontSize: 'var(--font-base)',
                    color: 'var(--color-slate-900)',
                    fontFamily: 'inherit',
                    '& fieldset': {
                      borderColor: 'rgba(30, 79, 163, 0.2)',
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(30, 79, 163, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--color-primary)',
                      borderWidth: '1.5px',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '0 14px',
                    height: '100%',
                    boxSizing: 'border-box',
                  }
                }}
              />
              <Box sx={{ display: 'flex', gap: 1.5, width: { xs: 'var(--size-full)', md: 'auto' } }}>
                <Box sx={{ minWidth: 160, flex: 1 }}>
                  <CentralDropdown
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    options={[
                      { value: "all", label: language === 'en' ? "All Courses" : "सभी पाठ्यक्रम" },
                      { value: "enrolled", label: language === 'en' ? "My Courses" : "मेरे पाठ्यक्रम" },
                      { value: "not_enrolled", label: language === 'en' ? "Not Enrolled" : "नामांकित नहीं" }
                    ]}
                    searchable={false}
                  />
                </Box>
                <Box sx={{ minWidth: 160, flex: 1 }}>
                  <CentralDropdown
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    options={[
                      { value: 'newest', label: language === 'en' ? 'Newest First' : 'नवीनतम पहले' },
                      { value: 'oldest', label: language === 'en' ? 'Oldest First' : 'पुराने पहले' },
                      { value: 'alphabetical', label: language === 'en' ? 'Alphabetical (A-Z)' : 'वर्णानुक्रम (A-Z)' }
                    ]}
                    searchable={false}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {/* Content Area */}
          {isFullyLoading ? (
            <Grid container spacing={4}>
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={idx}>
                  <PremiumCard
                    disableHover
                    sx={{
                      height: 'var(--size-full)',
                      display: "flex",
                      flexDirection: "column",
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ position: 'relative', width: 'var(--size-full)', aspectRatio: "16/9", borderTopLeftRadius: "calc(var(--radius-lg) - 1px)", borderTopRightRadius: "calc(var(--radius-lg) - 1px)", flexShrink: 0, overflow: 'hidden' }}>
                      <Skeleton variant="rectangular" sx={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.06)' }} />
                      {/* Status Chip Skeleton */}
                      <Skeleton variant="rounded" sx={{ position: 'absolute', top: 12, left: 12, width: 60, height: 24, borderRadius: 'var(--radius-sm)' }} />
                      {/* Icon Button Skeleton */}
                      <Skeleton variant="circular" sx={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32 }} />
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 3, pt: 2.5, display: "flex", flexDirection: "column" }}>
                      {/* Category */}
                      <Skeleton variant="text" width="30%" sx={{ fontSize: 'var(--font-xs)', mb: 1 }} />

                      {/* Title */}
                      <Skeleton variant="text" width="100%" sx={{ fontSize: '1.25rem', mb: 0.5 }} />
                      <Skeleton variant="text" width="60%" sx={{ fontSize: '1.25rem', mb: 2 }} />

                      {/* Description (2 lines) */}
                      <Skeleton variant="text" width="100%" sx={{ fontSize: '0.875rem', mb: 0.5 }} />
                      <Skeleton variant="text" width="80%" sx={{ fontSize: '0.875rem', mb: 2.5 }} />

                      {/* Chips */}
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 3 }}>
                        <Skeleton variant="rounded" width={50} height={20} sx={{ borderRadius: 'var(--radius-md)' }} />
                        <Skeleton variant="rounded" width={70} height={20} sx={{ borderRadius: 'var(--radius-md)' }} />
                        <Skeleton variant="rounded" width={60} height={20} sx={{ borderRadius: 'var(--radius-md)' }} />
                      </Box>

                      {/* Bottom Info Row */}
                      <Box sx={{ mt: 'auto', pt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Skeleton variant="text" width="40%" sx={{ fontSize: '0.75rem' }} />
                        <Skeleton variant="text" width="30%" sx={{ fontSize: '0.75rem' }} />
                      </Box>
                    </CardContent>
                  </PremiumCard>
                </Grid>
              ))}
            </Grid>
          ) : courses.length === 0 ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: { xs: 4, md: 6 },
              px: 3,
              textAlign: 'center',
              position: 'relative'
            }}>
              <EmptyState
                title={isManagement ? t('courseDashboard.emptyStateTitle') : (language === 'en' ? 'No courses available' : 'कोई पाठ्यक्रम उपलब्ध नहीं है')}
                subtitle={isManagement ? t('courseDashboard.emptyStateSubtitle') : (language === 'en' ? 'There are no courses currently available.' : 'वर्तमान में कोई पाठ्यक्रम उपलब्ध नहीं है।')}
                actionLabel={isManagement ? t('courseDashboard.createCourseBtn') : null}
                actionIcon={
                  isManagement ? (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" style={{ width: 20, height: 20, transition: 'transform var(--transition-base)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
                    </svg>
                  ) : null
                }
                onAction={isManagement ? () => setIsCreateModalOpen(true) : null}
                illustration={
                  <svg viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 'var(--size-full)', height: 'var(--size-full)', animation: 'float 6s ease-in-out infinite' }}>
                    <style>
                      {`
                      @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-8px); }
                      }
                      @keyframes floatSlow {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-4px) rotate(5deg); }
                      }
                      @keyframes pulseGlow {
                        0%, 100% { opacity: 0.5; r: 65px; }
                        50% { opacity: 0.7; r: 68px; }
                      }
                    `}
                    </style>
                    {/* Ground Shadow Blob */}
                    <ellipse cx="130" cy="165" rx="110" ry="12" fill="rgba(0, 0, 0, 0.04)" />

                    {/* Background Ambient Glow */}
                    <circle cx="170" cy="80" r="65" fill="rgba(37, 99, 235, 0.05)" style={{ animation: 'pulseGlow 4s ease-in-out infinite' }} />

                    {/* Floating decorative elements (Learning theme) */}
                    <path d="M 40 35 Q 40 45 30 45 Q 40 45 40 55 Q 40 45 50 45 Q 40 45 40 35" fill="var(--color-warning)" opacity="0.9" style={{ animation: 'floatSlow 4s ease-in-out infinite', transformOrigin: '40px 45px' }} />
                    <rect x="220" y="30" width="12" height="12" rx="3" fill="var(--color-success)" opacity="0.8" style={{ animation: 'float 5s ease-in-out infinite', transformOrigin: '226px 36px' }} transform="rotate(15 226 36)" />
                    <path d="M 210 120 L 222 128 L 210 136 Z" fill="var(--color-primary)" opacity="0.7" style={{ animation: 'floatSlow 6s ease-in-out infinite' }} />

                    {/* ================= BOARD (Modern Filled) ================= */}
                    {/* Back Leg */}
                    <line x1="180" y1="100" x2="180" y2="155" stroke="var(--color-slate-500)" strokeWidth="5" strokeLinecap="round" />

                    {/* Main Board Frame */}
                    <rect x="130" y="30" width="100" height="70" rx="8" fill="var(--color-slate-200)" />

                    {/* Inner Board Canvas */}
                    <rect x="136" y="36" width="88" height="58" rx="4" fill="var(--color-white)" />

                    {/* Content on Board: Video Player & Text Lines */}
                    <rect x="146" y="46" width="34" height="24" rx="4" fill="var(--color-slate-50)" />
                    <polygon points="159,53 159,63 167,58" fill="var(--color-primary)" />

                    <line x1="188" y1="48" x2="212" y2="48" stroke="var(--color-slate-200)" strokeWidth="3" strokeLinecap="round" />
                    <line x1="188" y1="56" x2="204" y2="56" stroke="var(--color-slate-200)" strokeWidth="3" strokeLinecap="round" />
                    <line x1="188" y1="64" x2="210" y2="64" stroke="var(--color-slate-200)" strokeWidth="3" strokeLinecap="round" />

                    {/* Progress bar on board */}
                    <rect x="146" y="78" width="68" height="6" rx="3" fill="var(--color-slate-50)" />
                    <rect x="146" y="78" width="40" height="6" rx="3" fill="var(--color-success)" />

                    {/* Board Marker Tray */}
                    <rect x="120" y="100" width="120" height="8" rx="4" fill="var(--color-slate-200)" />

                    {/* Little Eraser & Marker on Tray */}
                    <rect x="190" y="94" width="14" height="6" rx="1" fill="var(--color-slate-500)" />
                    <circle cx="180" cy="97" r="3" fill="var(--color-error)" />

                    {/* Front Legs */}
                    <line x1="150" y1="106" x2="140" y2="160" stroke="var(--color-slate-500)" strokeWidth="5" strokeLinecap="round" />
                    <line x1="210" y1="106" x2="220" y2="160" stroke="var(--color-slate-500)" strokeWidth="5" strokeLinecap="round" />

                    {/* ================= CHARACTER (Modern Flat Design) ================= */}
                    {/* Back Arm (Right Arm) */}
                    <path d="M 98 70 L 116 80 L 112 86 L 94 76 Z" fill="var(--color-primary-hover)" />
                    {/* Back Hand */}
                    <circle cx="116" cy="83" r="4.5" fill="var(--color-slate-200)" />

                    {/* Stick */}
                    <line x1="116" y1="83" x2="166" y2="60" stroke="var(--color-slate-900)" strokeWidth="3" strokeLinecap="round" />

                    {/* Pants & Legs */}
                    {/* Left Leg */}
                    <path d="M 75 115 L 84 115 L 82 165 L 73 165 Z" fill="var(--color-slate-900)" />
                    {/* Right Leg */}
                    <path d="M 86 115 L 95 115 L 97 165 L 88 165 Z" fill="var(--color-slate-900)" />

                    {/* Shoes */}
                    <path d="M 71 165 L 84 165 Q 84 170 78 170 Q 69 170 71 165 Z" fill="var(--color-slate-900)" />
                    <path d="M 86 165 L 99 165 Q 101 170 92 170 Q 86 170 86 165 Z" fill="var(--color-slate-900)" />

                    {/* Torso (Suit Jacket) */}
                    <path d="M 65 65 Q 85 62 105 65 L 95 120 L 75 120 Z" fill="var(--color-primary)" />

                    {/* Shirt Collar / V-neck */}
                    <polygon points="85,64 92,82 78,82" fill="var(--color-slate-50)" />
                    <polygon points="85,74 88,80 85,95 82,80" fill="var(--color-warning)" />

                    {/* Neck */}
                    <rect x="81" y="48" width="8" height="18" fill="var(--color-slate-200)" />

                    {/* Front Arm (Left Arm) */}
                    <path d="M 72 68 L 60 85 L 67 89 L 77 72 Z" fill="var(--color-primary-hover)" />
                    <path d="M 60 84 L 70 102 L 77 98 L 66 81 Z" fill="var(--color-primary-hover)" />
                    {/* Front Hand */}
                    <circle cx="73" cy="100" r="4.5" fill="var(--color-slate-200)" />

                    {/* Head */}
                    <circle cx="85" cy="38" r="14" fill="var(--color-slate-200)" />

                    {/* Hair */}
                    <path d="M 71 38 Q 69 20 85 22 Q 101 20 99 38 Q 93 27 85 28 Q 77 27 71 38 Z" fill="var(--color-slate-900)" />

                    {/* Glasses (Modern half-frame) */}
                    <line x1="76" y1="36" x2="98" y2="36" stroke="var(--color-slate-900)" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 78 36 L 84 36 Q 84 42 81 42 Q 78 42 78 36 Z" fill="var(--color-white)" opacity="0.8" stroke="var(--color-slate-900)" strokeWidth="1" />
                    <path d="M 90 36 L 96 36 Q 96 42 93 42 Q 90 42 90 36 Z" fill="var(--color-white)" opacity="0.8" stroke="var(--color-slate-900)" strokeWidth="1" />
                  </svg>
                }
              />
            </Box>
          ) : (
            /* ─── COURSE GRID ─── */
            <Grid container spacing={4}>
              {filteredAndSortedCourses.map((course) => {
                const isEnrolled = enrolledCourses.some(c => c.id === course.id);
                return (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={course.id}>
                  <PremiumCard sx={{
                    height: 'var(--size-full)',
                    display: "flex",
                    flexDirection: "column",
                    overflow: 'hidden'
                  }}>
                    <Box
                      sx={{
                        aspectRatio: "16/9",
                        width: 'var(--size-full)',
                        borderTopLeftRadius: "calc(var(--radius-lg) - 1px)",
                        borderTopRightRadius: "calc(var(--radius-lg) - 1px)",
                        backgroundImage: `url(${course.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column", "&:last-child": { pb: 3 } }}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
                          <Typography variant="h6" sx={{
                            fontWeight: 'var(--font-bold)',
                            color: 'var(--color-slate-900)',
                            lineHeight: 1.3,
                            overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            flexGrow: 1
                          }}>
                            {course.title}
                          </Typography>

                          {(course.category || (course.tags && course.tags.length > 0) || course.document) && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end', flexShrink: 0, maxWidth: '60%', alignItems: 'center' }}>
                              {course.document && (
                                <Box
                                  onClick={(e) => { e.stopPropagation(); window.open(`/viewer/pdf?url=${encodeURIComponent(course.document)}&name=${encodeURIComponent(course.title + ' Document')}`, '_blank'); }}
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: 'var(--theme-blue)', fontSize: '12px', fontWeight: 600, mr: 0.5, cursor: 'pointer', transition: 'opacity 0.2s', '&:hover': { opacity: 0.7 } }}
                                >
                                  <AttachFileIcon sx={{ fontSize: 16 }} />
                                </Box>
                              )}
                              {course.category && (
                                <Chip
                                  label={course.category}
                                  size="small"
                                  sx={{
                                    bgcolor: 'transparent',
                                    color: 'var(--theme-blue)',
                                    fontWeight: 600,
                                    fontSize: '10px',
                                    border: 'var(--border-thin) solid rgba(0, 86, 179, 0.2)',
                                    borderRadius: 'var(--radius-sm)',
                                    px: 0.25,
                                    height: 20,
                                    backdropFilter: 'var(--card-blur)',
                                    transition: 'var(--transition-slow)',
                                    '&:hover': { transform: 'translateY(-2px)', borderColor: 'var(--theme-blue)' }
                                  }}
                                />
                              )}
                              {course.tags && course.tags.slice(0, course.category ? 1 : 2).map((tag, idx) => (
                                <Chip
                                  key={idx}
                                  label={tag.includes(' / ') ? tag.split(' / ')[1] : tag}
                                  size="small"
                                  sx={{
                                    bgcolor: 'transparent',
                                    color: 'var(--theme-blue)',
                                    fontWeight: 600,
                                    fontSize: '10px',
                                    border: 'var(--border-thin) solid rgba(0, 86, 179, 0.2)',
                                    borderRadius: 'var(--radius-sm)',
                                    px: 0.25,
                                    height: 20,
                                    backdropFilter: 'var(--card-blur)',
                                    transition: 'var(--transition-slow)',
                                    '&:hover': { transform: 'translateY(-2px)', borderColor: 'var(--theme-blue)' }
                                  }}
                                />
                              ))}
                              {course.tags && course.tags.length > (course.category ? 1 : 2) && (
                                <CustomTooltip title={course.tags.slice(course.category ? 1 : 2).join(', ')} arrow placement="top">
                                  <Chip
                                    label={`+${course.tags.length - (course.category ? 1 : 2)} more`}
                                    size="small"
                                    sx={{
                                      bgcolor: 'transparent',
                                      color: 'var(--theme-green)',
                                      fontWeight: 600,
                                      fontSize: '10px',
                                      border: 'var(--border-thin) solid rgba(40, 167, 69, 0.3)',
                                      borderRadius: 'var(--radius-sm)',
                                      px: 0.25,
                                      height: 20,
                                      backdropFilter: 'var(--card-blur)',
                                      transition: 'var(--transition-slow)',
                                      '&:hover': { transform: 'translateY(-2px)', borderColor: 'var(--theme-green)' }
                                    }}
                                  />
                                </CustomTooltip>
                              )}
                            </Box>
                          )}
                        </Box>

                        {(course.desc || course.description) && (
                          <Typography variant="body2" sx={{
                            color: 'var(--color-slate-500)',
                            lineHeight: 1.6,
                            overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                          }}>
                            {course.desc || course.description}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ mt: 'auto', pt: 1 }}>

                        {/* Meta Info Row */}
                        <Box sx={{
                          display: 'flex',
                          flexWrap: 'nowrap',
                          rowGap: 1,
                          columnGap: { xs: 1.5, lg: 2 },
                          alignItems: 'center',
                          mb: 2.5,
                          overflow: 'hidden'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'var(--theme-blue)', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            <MenuBookIcon sx={{ fontSize: 18, color: 'var(--theme-green)' }} />
                            <span>{Array.isArray(course.modules) ? course.modules.length : (course.modules || 0)} Modules</span>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'var(--theme-blue)', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            <PersonOutlineIcon sx={{ fontSize: 18, color: 'var(--theme-green)' }} />
                            <span>{course.students || 0} Students</span>
                          </Box>
                          {course.audience && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'var(--theme-blue)', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', minWidth: 0, overflow: 'hidden' }}>
                              <GroupIcon sx={{ fontSize: 18, color: 'var(--theme-green)', flexShrink: 0 }} />
                              {(() => {
                                const audList = Array.isArray(course.audience)
                                  ? course.audience
                                  : (typeof course.audience === 'string' ? course.audience.split(',').map(a => a.trim()) : []);
                                if (audList.length === 0) return null;
                                if (audList.length === 1) return <span>{audList[0]}</span>;
                                return (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{audList[0]}</span>
                                    <CustomTooltip title={audList.slice(1).join(', ')} arrow placement="top">
                                      <Chip
                                        label={`+${audList.length - 1} more`}
                                        size="small"
                                        sx={{
                                          bgcolor: 'transparent',
                                          color: 'var(--theme-green)',
                                          fontWeight: 600,
                                          fontSize: '10px',
                                          border: 'var(--border-thin) solid rgba(40, 167, 69, 0.3)',
                                          borderRadius: 'var(--radius-sm)',
                                          px: 0.25,
                                          height: 20,
                                          backdropFilter: 'var(--card-blur)',
                                          transition: 'var(--transition-slow)',
                                          '&:hover': { transform: 'translateY(-2px)', borderColor: 'var(--theme-green)' }
                                        }}
                                      />
                                    </CustomTooltip>
                                  </Box>
                                );
                              })()}
                            </Box>
                          )}
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          {isManagement && (
                            <TarangButton
                              variant="outlined"
                              fullWidth
                              onClick={(e) => {
                                e.stopPropagation();
                                setCourseToEdit(course);
                                setIsCreateModalOpen(true);
                              }}
                            >
                              {t('Edit')}
                            </TarangButton>
                          )}
                          {!isManagement && (
                            <TarangButton
                              variant="outlined"
                              fullWidth
                              onClick={() => router.push(`/dashboard/home/institute/courses/${course.id}`)}
                            >
                              {t('View Course')}
                            </TarangButton>
                          )}
                          {!isManagement && (
                            isEnrolled ? (
                              <TarangButton
                                variant="primary"
                                fullWidth
                                onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/lms/course/${course.id}/access`); }}
                              >
                                {language === 'en' ? 'Access Course' : 'पाठ्यक्रम देखें'}
                              </TarangButton>
                            ) : (
                              <TarangButton
                                variant="primary"
                                fullWidth
                                onClick={(e) => handleEnroll(e, course.id)}
                                loading={enrollLoading[course.id]}
                              >
                                {language === 'en' ? 'Enroll' : 'नामांकन'}
                              </TarangButton>
                            )
                          )}
                          {isManagement && (
                            <TarangButton
                              variant="primary"
                              fullWidth
                              onClick={() => router.push(`/dashboard/home/institute/courses/${course.id}`)}
                            >
                              {t('View Course')}
                            </TarangButton>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </PremiumCard>
                </Grid>
              )})}
            </Grid>
          )}

        </Container>
      </Box>

      {/* ─── FLOATING ACTION BUTTON (SPEED DIAL STYLE) ─── */}
      {isManagement && (
        <Box sx={{ position: 'fixed', bottom: { xs: 80, md: 32 }, right: { xs: 24, md: 32 }, zIndex: 'var(--z-sticky)' }}>
          <Fab
            aria-label={t('Create Course')}
            onClick={() => { setCourseToEdit(null); setIsCreateModalOpen(true); }}
            sx={{
              width: { xs: 56, md: 64 },
              height: { xs: 56, md: 64 },
              bgcolor: 'var(--color-primary)',
              color: 'var(--color-white)',
              border: "1.5px solid var(--color-warning)",
              '&:hover, &:focus, &:active': { bgcolor: 'var(--color-primary-hover)', }
            }}
          >
            <SpeedDialIcon />
          </Fab>
        </Box>
      )}

      {/* ─── CREATE COURSE OVERLAY ─── */}

      <CourseModal
        open={isCreateModalOpen}
        onClose={() => { setCourseToEdit(null); setIsCreateModalOpen(false); }}
        initialData={courseToEdit}
        onSuccess={(updatedCourse) => {
          setCourses(prev => {
            if (prev.some(c => c.id === updatedCourse.id)) {
              return prev.map(c => c.id === updatedCourse.id ? updatedCourse : c);
            }
            return [updatedCourse, ...prev];
          });
        }}
        onDelete={async (id) => {
          try {
            await lmsService.deleteCourse(id);
          } catch (e) {
            console.error("Failed to delete course", e);
          }
          setCourses(courses.filter(c => c.id !== id));
          setCourseToEdit(null);
          setIsCreateModalOpen(false);
        }}
      />
    </>
  );
}
