"use client";

import mockData from '../../data/lmsData.json';
const { lmsData: lmsData } = mockData;
import React from 'react';
import dayjs from 'dayjs';
import { Box, Typography, Button, Container, Grid, Card, CardMedia, CardContent, IconButton, Chip, Fab, SpeedDialIcon, Breadcrumbs, Link, TextField, Paper, Accordion, AccordionSummary, AccordionDetails, Autocomplete, Dialog, Popover, Tooltip, InputAdornment, ListItemButton } from '@mui/material';
import { useRouter } from 'next/navigation';
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
  borderRadius: '16px',
  border: '1.5px solid rgba(255, 255, 255, 0.78)',
  background: `
    radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.1) 0, transparent 55%),
    radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.09) 0, transparent 55%),
    rgba(255, 255, 255, 0.96)
  `,
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  boxShadow: '0 18px 50px -18px rgba(0, 86, 179, 0.42), 0 12px 28px -18px rgba(15, 23, 42, 0.35)',
  overflow: 'hidden'
};

const timelineCalendarSx = {
  width: '100%',
  height: 'auto',
  maxHeight: 'none',
  color: '#0f172a',
  fontFamily: calendarFont,
  '& *': {
    fontFamily: `${calendarFont} !important`
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
    color: '#0f172a',
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
    borderRadius: "12px",
    border: '1px solid rgba(203, 213, 225, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 12px 24px -18px rgba(15, 23, 42, 0.35)'
  },
  '& .MuiPickersCalendarHeader-switchViewButton, & .MuiPickersArrowSwitcher-button': {
    width: 36,
    height: 32,
    borderRadius: "8px",
    color: '#64748b',
    m: 0,
    transition: 'all 0.2s ease',
    '& svg': {
      fontSize: '1.45rem',
      strokeWidth: 1.5,
    },
    '&:hover': {
      color: '#0056b3',
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
    color: '#64748b',
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
    borderRadius: "8px",
    border: '1px solid transparent',
    color: '#0f172a',
    fontSize: '13px',
    fontWeight: 700,
    transition: 'all 0.18s ease',
    '&:hover': {
      color: '#0056b3',
      backgroundColor: 'rgba(0, 86, 179, 0.08)'
    }
  },
  '& .MuiPickersDay-today': {
    borderColor: 'rgba(40, 167, 69, 0.6)',
    backgroundColor: 'rgba(40, 167, 69, 0.08)'
  },
  '& .MuiPickersDay-root.Mui-selected': {
    color: '#ffffff',
    borderColor: 'transparent',
    background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%) !important',
    boxShadow: '0 10px 20px -12px rgba(0, 86, 179, 0.7)'
  },
  '& .MuiPickersDay-root.Mui-disabled': {
    color: '#cbd5e1'
  },
  '& .MuiYearCalendar-root, & .MuiMonthCalendar-root': {
    width: '100%',
    maxHeight: 228,
    p: 1
  },
  '& .MuiPickersYear-yearButton, & .MuiPickersMonth-monthButton': {
    borderRadius: "8px",
    color: '#0f172a',
    fontSize: '13px',
    fontWeight: 700,
    '&:hover': {
      color: '#0056b3',
      backgroundColor: 'rgba(0, 86, 179, 0.08)'
    }
  },
  '& .MuiPickersYear-yearButton.Mui-selected, & .MuiPickersMonth-monthButton.Mui-selected': {
    color: '#ffffff',
    background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%) !important'
  }
};



export default function CourseDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [courses, setCourses] = React.useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  useScrollLock(isCreateModalOpen);

  const [courseTitle, setCourseTitle] = React.useState("");
  const [courseDesc, setCourseDesc] = React.useState("");
  const [courseThumbnail, setCourseThumbnail] = React.useState("");
  const [courseDoc, setCourseDoc] = React.useState("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = React.useState(false);
  const thumbnailInputRef = React.useRef(null);
  const docInputRef = React.useRef(null);
  const tagsContainerRef = React.useRef(null);
  const [activeStep, setActiveStep] = React.useState(0);
  const [audienceLevel, setAudienceLevel] = React.useState("");
  const [courseCategory, setCourseCategory] = React.useState("");
  const [courseTags, setCourseTags] = React.useState([]);
  const [courseAccess, setCourseAccess] = React.useState('enrolled');
  const [courseAccessPopoverAnchor, setCourseAccessPopoverAnchor] = React.useState(null);
  const [isTagsSectionExpanded, setIsTagsSectionExpanded] = React.useState(false);
  const [tagSearchQuery, setTagSearchQuery] = React.useState("");
  const [moduleCalendarAnchorEl, setModuleCalendarAnchorEl] = React.useState(null);
  const [activeCalendarModuleId, setActiveCalendarModuleId] = React.useState(null);
  const [activeCalendarField, setActiveCalendarField] = React.useState(null);
  const [accessPopoverAnchorEl, setAccessPopoverAnchorEl] = React.useState(null);
  const [activeAccessModuleId, setActiveAccessModuleId] = React.useState(null);
  const [expandedDescModules, setExpandedDescModules] = React.useState({});
  const [editingDescId, setEditingDescId] = React.useState(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (tagsContainerRef.current && !tagsContainerRef.current.contains(event.target)) {
        setIsTagsSectionExpanded(false);
      }
    }
    if (isTagsSectionExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTagsSectionExpanded]);

  const [modules, setModules] = React.useState([
    {
      id: 1,
      title: 'Module 1: Introduction',
      startDate: '',
      endDate: '',
      access: 'enrolled',
      lessons: []
    }
  ]);

  const handleCourseAccessChange = (newAccess) => {
    setCourseAccess(newAccess);
    setCourseAccessPopoverAnchor(null);
    
    setModules(prevModules => prevModules.map(module => {
      let newModuleAccess = module.access;
      
      if (newAccess === 'locked') {
        newModuleAccess = 'locked';
      } else if (newAccess === 'enrolled') {
        if (module.access === 'public') {
          newModuleAccess = 'enrolled';
        }
      }
      
      return { ...module, access: newModuleAccess };
    }));
  };

  const addModule = () => {
    setModules([
      ...modules,
      {
        id: Date.now(),
        title: `Module ${modules.length + 1}: New Module`,
        startDate: '',
        endDate: '',
        access: courseAccess === 'locked' ? 'locked' : 'enrolled',
        lessons: []
      }
    ]);
  };

  const deleteModule = (moduleId) => {
    setModules(modules.filter(mod => mod.id !== moduleId));
  };

  const deleteLesson = (moduleId, lessonId) => {
    setModules(modules.map(mod => {
      if (mod.id === moduleId) {
        return {
          ...mod,
          lessons: mod.lessons.filter(les => les.id !== lessonId)
        };
      }
      return mod;
    }));
  };

  const updateModuleTitle = (moduleId, newTitle) => {
    setModules(modules.map(mod => {
      if (mod.id === moduleId) {
        return { ...mod, title: newTitle };
      }
      return mod;
    }));
  };

  const updateModuleDescription = (moduleId, description) => {
    setModules(modules.map(mod => {
      if (mod.id === moduleId) {
        return { ...mod, description };
      }
      return mod;
    }));
  };

  const updateModuleDate = (moduleId, field, value) => {
    setModules(modules.map(mod => {
      if (mod.id === moduleId) {
        const nextModule = { ...mod, [field]: value };

        if (field === 'startDate' && mod.endDate && dayjs(value).isAfter(dayjs(mod.endDate), 'day')) {
          nextModule.endDate = '';
        }

        return nextModule;
      }
      return mod;
    }));
  };

  const openModuleCalendar = (event, moduleId, field) => {
    event.stopPropagation();
    setModuleCalendarAnchorEl(event.currentTarget);
    setActiveCalendarModuleId(moduleId);
    setActiveCalendarField(field);
  };

  const closeModuleCalendar = () => {
    setModuleCalendarAnchorEl(null);
    setActiveCalendarModuleId(null);
    setActiveCalendarField(null);
  };

  const activeCalendarModule = modules.find((mod) => mod.id === activeCalendarModuleId) || null;

  const clearModuleDate = (moduleId, field) => {
    updateModuleDate(moduleId, field, '');
  };

  const openAccessPopover = (event, moduleId) => {
    event.stopPropagation();
    setAccessPopoverAnchorEl(event.currentTarget);
    setActiveAccessModuleId(moduleId);
  };

  const closeAccessPopover = () => {
    setAccessPopoverAnchorEl(null);
    setActiveAccessModuleId(null);
  };

  const updateModuleAccess = (moduleId, accessType) => {
    setModules(modules.map(mod => {
      if (mod.id === moduleId) {
        return { ...mod, access: accessType };
      }
      return mod;
    }));
    closeAccessPopover();
  };

  const accessOptions = [
    { label: 'Public (Everyone)', value: 'public' },
    { label: 'Accessible only to enrolled students', value: 'enrolled' },
    { label: 'Locked (Hidden)', value: 'locked' }
  ];

  const updateLessonTitle = (moduleId, lessonId, newTitle) => {
    setModules(modules.map(mod => {
      if (mod.id === moduleId) {
        return {
          ...mod,
          lessons: mod.lessons.map(les => {
            if (les.id === lessonId) {
              return { ...les, title: newTitle };
            }
            return les;
          })
        };
      }
      return mod;
    }));
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingThumbnail(true);
    try {
      const url = URL.createObjectURL(file);
      setCourseThumbnail(url);
    } catch (err) {
      console.error("Failed to generate preview URL:", err);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleCourseDocUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseDoc(file.name);
    }
  };

  return (
    <>
      {/* ─── FIXED BACKGROUND LAYER ─── */}
      <Box
        sx={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: -1,
          background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.55) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.4) 0, transparent 50%), 
            radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.3) 0, transparent 50%),
            radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.3) 0, transparent 50%),
            #eef2f6
          `
        }}
      >
        <Box sx={{ position: "absolute", width: "50vw", height: "50vw", top: "-10%", left: "-10%", background: "rgba(16, 185, 129, 0.05)", filter: "blur(120px)", borderRadius: "50%", pointerEvents: "none" }} />
      </Box>

      <Box sx={{ minHeight: 'calc(100vh - 64px)', pb: 10, pt: 4, position: 'relative' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 4, md: 6, lg: 8 }, zIndex: 1, position: "relative" }}>

          {/* Minimalist Bold Breadcrumbs (Screenshot Style) */}
          <Box sx={{ mb: 4, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              onClick={() => router.push('/dashboard/home')}
              sx={{ color: '#64748b', fontWeight: 700, fontSize: "1.2rem", cursor: 'pointer', '&:hover': { color: '#0056b3' } }}
            >
              {t('courseDashboard.breadcrumbs.dashboard')}
            </Typography>
            <Typography sx={{ color: '#334155', fontWeight: 900, fontSize: "1.2rem" }}>/</Typography>
            <Typography
              onClick={() => router.push('/dashboard/home/institute')}
              sx={{ color: '#64748b', fontWeight: 700, fontSize: "1.2rem", cursor: 'pointer', '&:hover': { color: '#0056b3' } }}
            >
              {t('courseDashboard.breadcrumbs.academicAffairs')}
            </Typography>
            <Typography sx={{ color: '#334155', fontWeight: 900, fontSize: "1.2rem" }}>/</Typography>
            <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: "1.2rem" }}>
              {t('courseDashboard.breadcrumbs.courses')}
            </Typography>
          </Box>

          {/* Content Area */}
          {courses.length === 0 ? (
            /* ─── CREATIVE EMPTY STATE ─── */
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: { xs: 8, md: 12 },
              px: 3,
              textAlign: 'center',
              position: 'relative'
            }}>
              {/* Full Body Person & Aesthetic Whiteboard Illustration */}
              <Box sx={{
                width: '100%',
                maxWidth: 420,
                height: 240,
                mb: 5,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}>
                {/* Subtle ambient glow behind illustration */}
                <Box sx={{
                  position: 'absolute',
                  top: '-20%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80%',
                  height: '400px',
                  background: 'radial-gradient(ellipse, rgba(0, 86, 179, 0.06) 0%, rgba(255,255,255,0) 70%)',
                  pointerEvents: 'none'
                }} />
                <svg viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', animation: 'float 6s ease-in-out infinite' }}>
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
                  <path d="M 40 35 Q 40 45 30 45 Q 40 45 40 55 Q 40 45 50 45 Q 40 45 40 35" fill="#f59e0b" opacity="0.9" style={{ animation: 'floatSlow 4s ease-in-out infinite', transformOrigin: '40px 45px' }} />
                  <rect x="220" y="30" width="12" height="12" rx="3" fill="#10b981" opacity="0.8" style={{ animation: 'float 5s ease-in-out infinite', transformOrigin: '226px 36px' }} transform="rotate(15 226 36)" />
                  <path d="M 210 120 L 222 128 L 210 136 Z" fill="#3b82f6" opacity="0.7" style={{ animation: 'floatSlow 6s ease-in-out infinite' }} />

                  {/* ================= BOARD (Modern Filled) ================= */}
                  {/* Back Leg */}
                  <line x1="180" y1="100" x2="180" y2="155" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />

                  {/* Main Board Frame */}
                  <rect x="130" y="30" width="100" height="70" rx="8" fill="#e2e8f0" />

                  {/* Inner Board Canvas */}
                  <rect x="136" y="36" width="88" height="58" rx="4" fill="#ffffff" />

                  {/* Content on Board: Video Player & Text Lines */}
                  <rect x="146" y="46" width="34" height="24" rx="4" fill="#eff6ff" />
                  <polygon points="159,53 159,63 167,58" fill="#3b82f6" />

                  <line x1="188" y1="48" x2="212" y2="48" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                  <line x1="188" y1="56" x2="204" y2="56" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                  <line x1="188" y1="64" x2="210" y2="64" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />

                  {/* Progress bar on board */}
                  <rect x="146" y="78" width="68" height="6" rx="3" fill="#f1f5f9" />
                  <rect x="146" y="78" width="40" height="6" rx="3" fill="#10b981" />

                  {/* Board Marker Tray */}
                  <rect x="120" y="100" width="120" height="8" rx="4" fill="#cbd5e1" />

                  {/* Little Eraser & Marker on Tray */}
                  <rect x="190" y="94" width="14" height="6" rx="1" fill="#64748b" />
                  <circle cx="180" cy="97" r="3" fill="#ef4444" />

                  {/* Front Legs */}
                  <line x1="150" y1="106" x2="140" y2="160" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
                  <line x1="210" y1="106" x2="220" y2="160" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />

                  {/* ================= CHARACTER (Modern Flat Design) ================= */}
                  {/* Back Arm (Right Arm) */}
                  <path d="M 98 70 L 116 80 L 112 86 L 94 76 Z" fill="#004b9c" />
                  {/* Back Hand */}
                  <circle cx="116" cy="83" r="4.5" fill="#fad6ca" />

                  {/* Stick */}
                  <line x1="116" y1="83" x2="166" y2="60" stroke="#334155" strokeWidth="3" strokeLinecap="round" />

                  {/* Pants & Legs */}
                  {/* Left Leg */}
                  <path d="M 75 115 L 84 115 L 82 165 L 73 165 Z" fill="#1e293b" />
                  {/* Right Leg */}
                  <path d="M 86 115 L 95 115 L 97 165 L 88 165 Z" fill="#1e293b" />

                  {/* Shoes */}
                  <path d="M 71 165 L 84 165 Q 84 170 78 170 Q 69 170 71 165 Z" fill="#0f172a" />
                  <path d="M 86 165 L 99 165 Q 101 170 92 170 Q 86 170 86 165 Z" fill="#0f172a" />

                  {/* Torso (Suit Jacket) */}
                  <path d="M 65 65 Q 85 62 105 65 L 95 120 L 75 120 Z" fill="#0056b3" />

                  {/* Shirt Collar / V-neck */}
                  <polygon points="85,64 92,82 78,82" fill="#f1f5f9" />
                  <polygon points="85,74 88,80 85,95 82,80" fill="#f59e0b" />

                  {/* Neck */}
                  <rect x="81" y="48" width="8" height="18" fill="#fad6ca" />

                  {/* Front Arm (Left Arm) */}
                  <path d="M 72 68 L 60 85 L 67 89 L 77 72 Z" fill="#004b9c" />
                  <path d="M 60 84 L 70 102 L 77 98 L 66 81 Z" fill="#004b9c" />
                  {/* Front Hand */}
                  <circle cx="73" cy="100" r="4.5" fill="#fad6ca" />

                  {/* Head */}
                  <circle cx="85" cy="38" r="14" fill="#fad6ca" />

                  {/* Hair */}
                  <path d="M 71 38 Q 69 20 85 22 Q 101 20 99 38 Q 93 27 85 28 Q 77 27 71 38 Z" fill="#0f172a" />

                  {/* Glasses (Modern half-frame) */}
                  <line x1="76" y1="36" x2="98" y2="36" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 78 36 L 84 36 Q 84 42 81 42 Q 78 42 78 36 Z" fill="#ffffff" opacity="0.8" stroke="#0f172a" strokeWidth="1" />
                  <path d="M 90 36 L 96 36 Q 96 42 93 42 Q 90 42 90 36 Z" fill="#ffffff" opacity="0.8" stroke="#0f172a" strokeWidth="1" />
                </svg>
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, zIndex: 1 }}>
                {t('courseDashboard.emptyStateTitle')}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#475569', maxWidth: 540, mb: 5, fontWeight: 500, lineHeight: 1.6, zIndex: 1, fontSize: '1.05rem' }}>
                {t('courseDashboard.emptyStateSubtitle')}
              </Typography>

              <Button
                variant="contained" disableElevation
                onClick={() => setIsCreateModalOpen(true)}
                sx={{
                  bgcolor: '#0056b3',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: "8px",
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#004494',
                    boxShadow: 'none'
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.2
                }}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" style={{ width: 20, height: 20, transition: 'transform 0.2s' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
                </svg>
                {t('courseDashboard.createCourseBtn')}
              </Button>

            </Box>
          ) : (
            /* ─── COURSE GRID ─── */
            <Grid container spacing={4}>
              {courses.map((course) => (
                <Grid item xs={12} sm={6} lg={4} key={course.id}>
                  <Card sx={{
                    height: '100%',
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "16px",
                    background: "rgba(255, 255, 255, 0.3)",
                    backdropFilter: "blur(30px)",
                    WebkitBackdropFilter: "blur(30px)",
                    border: "1px solid rgba(30, 79, 163, 0.2)",
                    boxShadow: "none",
                    transition: "all 0.3s ease",
                    cursor: 'pointer',
                    overflow: 'hidden',
                    '&:hover': {
                      border: "1px solid rgba(30, 79, 163, 0.5)",
                      background: "rgba(255, 255, 255, 0.45)",
                    }
                  }}>
                    <Box
                      sx={{
                        aspectRatio: "16/9",
                        width: '100%',
                        borderTopLeftRadius: "15px",
                        borderTopRightRadius: "15px",
                        backgroundImage: `url(${course.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        flexShrink: 0,
                        boxShadow: "none",
                      }}
                    >
                      <Chip
                        label={course.status}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          bgcolor: course.status === 'Active' ? '#28a745' : '#f59e0b',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          px: 1,
                          border: 'none',
                        }}
                      />
                      <IconButton sx={{
                        position: 'absolute', top: 8, right: 8,
                        bgcolor: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(10px)',
                        p: 0.5,
                        '&:hover': { bgcolor: 'white', transform: 'scale(1.05)' },
                        transition: 'all 0.2s'
                      }}>
                        <MoreVertIcon fontSize="small" sx={{ color: '#0f172a' }} />
                      </IconButton>
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 3, pt: 2.5, display: "flex", flexDirection: "column" }}>
                      {course.category && (
                        <Typography variant="caption" sx={{ color: '#0056b3', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', mb: 0.5, fontSize: '11px' }}>
                          {course.category}
                        </Typography>
                      )}
                      <Typography variant="h6" sx={{ 
                        fontWeight: 800, 
                        color: '#0f172a', 
                        lineHeight: 1.3, 
                        mb: 1.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {course.title}
                      </Typography>
                      {course.description && (
                        <Typography variant="body2" sx={{
                          color: "#475569",
                          mb: 2,
                          lineHeight: 1.5,
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {course.description}
                        </Typography>
                      )}
                      {course.tags && course.tags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                          {course.tags.map((tag, idx) => (
                            <Chip
                              key={idx}
                              label={tag.includes(' / ') ? tag.split(' / ')[1] : tag}
                              size="small"
                              sx={{
                                fontSize: '10px',
                                fontWeight: 750,
                                bgcolor: 'rgba(0, 86, 179, 0.05)',
                                color: '#0056b3',
                                border: '1px solid rgba(30, 79, 163, 0.15)',
                                borderRadius: "8px",
                                height: '20px',
                                "& .MuiChip-label": { px: 1, py: 0 }
                              }}
                            />
                          ))}
                        </Box>
                      )}
                      
                      <Box sx={{ mt: 'auto', pt: 2 }}>
                        <Typography variant="caption" component="div" sx={{
                          color: "#475569", fontWeight: 600,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          <Box component="span" sx={{ color: "#0056b3" }}>
                            <MenuBookIcon sx={{ fontSize: 15, verticalAlign: "text-bottom", mr: 0.4 }} />
                            {course.modules} Modules
                          </Box>
                          <Box component="span" sx={{ mx: 1, color: "#cbd5e1" }}>•</Box>
                          <Box component="span">
                            <PersonOutlineIcon sx={{ fontSize: 15, verticalAlign: "text-bottom", mr: 0.4 }} />
                            {course.students} Students
                          </Box>
                          {course.audience && (
                            <>
                              <Box component="span" sx={{ mx: 1, color: "#cbd5e1" }}>•</Box>
                              <Box component="span">
                                <GroupIcon sx={{ fontSize: 15, verticalAlign: "text-bottom", mr: 0.4 }} />
                                {course.audience}
                              </Box>
                            </>
                          )}
                        </Typography>
                        <Typography sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
                          {t('Add Module')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

        </Container>
      </Box>

      {/* ─── FLOATING ACTION BUTTON (SPEED DIAL STYLE) ─── */}
      <Box sx={{ position: 'fixed', bottom: { xs: 80, md: 32 }, right: { xs: 24, md: 32 }, zIndex: 100 }}>
        <Fab
          aria-label={t('Create Course')}
          onClick={() => setIsCreateModalOpen(true)}
          sx={{
            width: { xs: 56, md: 64 },
            height: { xs: 56, md: 64 },
            bgcolor: '#0056b3',
            color: 'white',
            boxShadow: 'none',
            border: "1.5px solid #ffc107",
            '&:hover': { bgcolor: '#004494' }
          }}
        >
          <SpeedDialIcon />
        </Fab>
      </Box>

      {/* ─── CREATE COURSE OVERLAY ─── */}
      {isCreateModalOpen && (
        <Box 
          onClick={() => { setIsCreateModalOpen(false); setActiveStep(0); setAudienceLevel(""); }}
          sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 86, 179, 0.1)',
          backdropFilter: 'blur(15px)',
          p: { xs: 0, sm: 2 },
          overflow: 'auto'
        }}>
          <Paper
            onClick={(e) => e.stopPropagation()}
            elevation={0}
            component={motion.div}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            sx={{
              display: "flex",
              flexDirection: "column",
              width: { xs: "100%", sm: "720px" },
              minHeight: { xs: "100%", sm: "auto" },
              borderRadius: { xs: 0, sm: "28px" },
              background: `
                radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.18) 0, transparent 50%), 
                radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.15) 0, transparent 50%), 
                radial-gradient(at 80% 100%, rgba(40, 167, 69, 0.12) 0, transparent 50%),
                radial-gradient(at 20% 100%, rgba(0, 86, 179, 0.1) 0, transparent 50%),
                #ffffff
              `,
              boxShadow: { sm: "0 25px 50px -12px rgba(0,0,0,0.3)" },
              overflowY: 'auto',
              maxHeight: '92vh',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <IconButton
              onClick={() => { setIsCreateModalOpen(false); setActiveStep(0); setAudienceLevel(""); }}
              sx={{
                display: { xs: 'inline-flex', md: 'none' },
                position: 'absolute',
                top: 16,
                right: 16,
                color: '#64748b',
                '&:hover': { color: '#0f172a', bgcolor: 'rgba(0,0,0,0.05)' }
              }}
            >
              <CloseIcon />
            </IconButton>

            <Box sx={{ px: { xs: 3, sm: 6 }, py: { xs: 5, sm: 6 }, width: '100%', boxSizing: 'border-box' }}>
              {/* Header */}
              <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", letterSpacing: "-0.5px", fontSize: "24px" }}>
                    {t('courseDashboard.modal.createCourse')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5, fontSize: "14px" }}>
                    {activeStep === 0 ? t("courseDashboard.modal.basicDetails") : t("Outline the course curriculum and content.")}
                  </Typography>
                </Box>
              </Box>

              {/* Step Indicator Progress Bar */}
              <Box sx={{ display: 'flex', gap: 2, mb: 4, mt: 1 }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Box sx={{ height: 4, borderRadius: "8px", bgcolor: activeStep >= 0 ? '#0056b3' : '#cbd5e1', transition: 'all 0.3s' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: activeStep === 0 ? '#0056b3' : '#64748b', fontSize: '11.5px' }}>
                    {t('courseDashboard.modal.stepDetails')}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Box sx={{ height: 4, borderRadius: "8px", bgcolor: activeStep >= 1 ? '#0056b3' : '#cbd5e1', transition: 'all 0.3s' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: activeStep === 1 ? '#0056b3' : '#64748b', fontSize: '11.5px' }}>
                    {t('courseDashboard.modal.stepCurriculum')}
                  </Typography>
                </Box>
              </Box>

              <Box component="form" onSubmit={(e) => {
                e.preventDefault();
                const selectedAudience = audienceLevels.find(al => Reflect.get(al, 'value') === audienceLevel);
                const selectedCategory = courseCategories.find(cc => Reflect.get(cc, 'value') === courseCategory);
                const newCourse = {
                  id: Date.now(),
                  title: courseTitle || t("Untitled Course"),
                  desc: courseDesc,
                  audience: selectedAudience ? Reflect.get(selectedAudience, 'label').split(' / ')[1] : "",
                  category: selectedCategory ? Reflect.get(selectedCategory, 'label').split(' / ')[1] : "",
                  tags: courseTags,
                  modules: modules.length,
                  students: 0,
                  status: 'Active',
                  image: courseThumbnail || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800'
                };
                setCourses([newCourse, ...courses]);
                setIsCreateModalOpen(false);
                setCourseTitle("");
                setCourseDesc("");
                setCourseThumbnail("");
                setAudienceLevel("");
                setCourseCategory("");
                setCourseTags([]);
                setIsTagsSectionExpanded(false);
                setModules([
                  {
                    id: 1,
                    title: 'Module 1: Introduction',
                    startDate: '',
                    endDate: '',
                    lessons: []
                  }
                ]);
                setActiveStep(0);
              }} sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>

                {/* STEP 1: COURSE DETAILS */}
                {activeStep === 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                    {/* Top Row: Columns */}
                    <Box sx={{
                      display: { xs: 'flex', sm: 'grid' },
                      flexDirection: 'column',
                      gridTemplateColumns: '1fr 1fr',
                      rowGap: 3,
                      columnGap: 4,
                      width: '100%'
                    }}>

                      {/* Left Column: Course Details */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, gridColumn: '1', gridRow: '1' }}>
                        {/* Course Title */}
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#374151", fontSize: "13px" }}>
                            {t('courseDashboard.modal.courseTitle')}
                          </Typography>
                          <TextField
                            fullWidth
                            value={courseTitle}
                            onChange={(e) => setCourseTitle(e.target.value)}
                            required
                            placeholder={t('courseDashboard.modal.courseTitlePlaceholder')}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                backdropFilter: "blur(4px)",
                                borderRadius: "12px",
                                transition: "all 0.2s ease",
                                "& fieldset": { borderColor: "rgba(203, 213, 225, 0.8)", borderWidth: "1.5px" },
                                "&:hover fieldset": { borderColor: "#94a3b8" },
                                "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
                                "&.Mui-focused": {
                                  backgroundColor: "#ffffff",
                                  boxShadow: "none"
                                },
                                "& input": { color: "#111827", fontSize: "15px", fontWeight: 500 }
                              }
                            }}
                          />
                        </Box>

                        {/* Target Audience / Educational Level */}
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#374151", fontSize: "13px" }}>
                            {t('courseDashboard.modal.targetAudience')}
                          </Typography>
                          <Autocomplete
                            fullWidth
                            options={audienceLevels}
                            getOptionLabel={(option) => typeof option === 'string' ? option : (Reflect.get(option, 'label') || "")}
                            value={audienceLevels.find(al => Reflect.get(al, 'value') === audienceLevel) || null}
                            onChange={(e, val) => setAudienceLevel(val ? Reflect.get(val, 'value') : "")}
                            // Explicitly extracting props instead of spreading to satisfy securecoder
                            renderInput={(params) => {
                              const { id, disabled, fullWidth, size, InputLabelProps, InputProps, inputProps } = params;
                              return <TextField 
                                id={id} 
                                disabled={disabled} 
                                fullWidth={fullWidth} 
                                size={size} 
                                InputLabelProps={InputLabelProps} 
                                InputProps={InputProps} 
                                inputProps={inputProps} 
                                required 
                                placeholder={t('courseDashboard.modal.selectAudience')}
                                sx={{
                                "& .MuiOutlinedInput-root": {
                                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                                  backdropFilter: "blur(4px)",
                                  borderRadius: "12px",
                                  transition: "all 0.2s ease",
                                  "& fieldset": { borderColor: "rgba(203, 213, 225, 0.8)", borderWidth: "1.5px" },
                                  "&:hover fieldset": { borderColor: "#94a3b8" },
                                  "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
                                  "&.Mui-focused": {
                                    backgroundColor: "#ffffff",
                                    boxShadow: "none"
                                  },
                                  "& input": { color: "#111827", fontSize: "15px", fontWeight: 500 }
                                }
                              }}
                            />}}
                          />
                        </Box>

                      </Box>

                      {/* Course Category */}
                      <Box sx={{ gridColumn: '1', gridRow: '2', minWidth: 0 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#374151", fontSize: "13px" }}>
                          {t('courseDashboard.modal.courseCategory')}
                        </Typography>
                        <Autocomplete
                          fullWidth
                          options={courseCategories}
                          getOptionLabel={(option) => typeof option === 'string' ? option : (Reflect.get(option, 'label') || "")}
                          value={courseCategories.find(cc => Reflect.get(cc, 'value') === courseCategory) || null}
                          onChange={(e, val) => setCourseCategory(val ? Reflect.get(val, 'value') : "")}
                          // Explicitly extracting props instead of spreading to satisfy securecoder
                          renderInput={(params) => {
                            const { id, disabled, fullWidth, size, InputLabelProps, InputProps, inputProps } = params;
                            return <TextField 
                              id={id} 
                              disabled={disabled} 
                              fullWidth={fullWidth} 
                              size={size} 
                              InputLabelProps={InputLabelProps} 
                              InputProps={InputProps} 
                              inputProps={inputProps} 
                              required 
                              placeholder={t('courseDashboard.modal.selectCategory')}
                              sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                backdropFilter: "blur(4px)",
                                borderRadius: "12px",
                                transition: "all 0.2s ease",
                                "& fieldset": { borderColor: "rgba(203, 213, 225, 0.8)", borderWidth: "1.5px" },
                                "&:hover fieldset": { borderColor: "#94a3b8" },
                                "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
                                "&.Mui-focused": {
                                  backgroundColor: "#ffffff",
                                  boxShadow: "none"
                                },
                                "& input": { color: "#111827", fontSize: "15px", fontWeight: 500 }
                              }
                            }}
                          />}}
                        />
                      </Box>

                      {/* Right Column: 16:9 Aspect-Ratio Course Thumbnail */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', minWidth: 0, gridColumn: '2', gridRow: '1' }}>
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#374151", fontSize: "13px" }}>
                            {t('courseDashboard.modal.courseThumbnail')}
                          </Typography>

                          {/* Wrapper with relative position so lock icon can float over thumbnail */}
                          <Box sx={{ position: 'relative', width: '100%' }}>

                            {/* Thumbnail clickable area */}
                            <Box
                              sx={{
                                width: '100%',
                                aspectRatio: '16/9',
                                borderRadius: '12px',
                                backgroundColor: courseThumbnail ? 'transparent' : 'rgba(0, 86, 179, 0.03)',
                                backgroundImage: courseThumbnail ? `url(${courseThumbnail})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                border: '2px dashed rgba(30, 79, 163, 0.25)',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                position: 'relative',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: '#0056b3',
                                  backgroundColor: 'rgba(0, 86, 179, 0.05)'
                                }
                              }}
                              onClick={() => thumbnailInputRef.current?.click()}
                            >
                              {courseThumbnail ? (
                                <Box sx={{
                                  position: 'absolute',
                                  inset: 0,
                                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  opacity: 0,
                                  transition: 'opacity 0.2s',
                                  '&:hover': { opacity: 1 }
                                }}>
                                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', bgcolor: 'rgba(0,0,0,0.6)', px: 2, py: 1, borderRadius: '8px' }}>
                                    {t('courseDashboard.modal.changeImage')}
                                  </Typography>
                                </Box>
                              ) : isUploadingThumbnail ? (
                                <>
                                  <CloudUploadIcon sx={{ color: '#94a3b8', fontSize: 36, mb: 0.5 }} />
                                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0056b3' }}>
                                    {t('courseDashboard.modal.uploading')}
                                  </Typography>
                                </>
                              ) : (
                                <>
                                  <CloudUploadIcon sx={{ color: '#0056b3', fontSize: 36, mb: 0.5 }} />
                                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                                    {t('courseDashboard.modal.uploadThumbnail')}
                                  </Typography>
                                  <Typography sx={{ fontSize: '11px', color: '#94a3b8', mt: 0.5 }}>
                                    {t('courseDashboard.modal.fileFormats')}
                                  </Typography>
                                </>
                              )}
                              <input
                                type="file"
                                hidden
                                ref={thumbnailInputRef}
                                accept="image/*"
                                onChange={handleThumbnailUpload}
                              />
                            </Box>

                            <input
                              type="file"
                              hidden
                              ref={docInputRef}
                              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={handleCourseDocUpload}
                            />

                            {/* Attachment icon - positioned OUTSIDE the clickable thumbnail box */}
                            <Tooltip title={courseDoc ? `Attached: ${courseDoc}` : "Attach Course Document (PDF)"} arrow placement="top">
                              <IconButton
                                size="small"
                                onClick={() => docInputRef.current?.click()}
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 38,
                                  zIndex: 10,
                                  p: 0.75,
                                  '&:hover': { backgroundColor: 'transparent', transform: 'scale(1.15)' },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <AttachFileIcon sx={{ color: courseDoc ? '#0056b3' : '#94a3b8', fontSize: '18px' }} />
                              </IconButton>
                            </Tooltip>

                            {/* Lock icon - positioned OUTSIDE the clickable thumbnail box */}
                            <Tooltip title="Course Access" arrow placement="top">
                              <IconButton
                                size="small"
                                onClick={(e) => setCourseAccessPopoverAnchor(e.currentTarget)}
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  zIndex: 10,
                                  p: 0.75,
                                  '&:hover': { backgroundColor: 'transparent', transform: 'scale(1.15)' },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <LockOutlinedIcon sx={{ color: courseAccess === 'public' ? '#28a745' : courseAccess === 'locked' ? '#ef4444' : '#94a3b8', fontSize: '18px' }} />
                              </IconButton>
                            </Tooltip>

                            <Popover
                              open={Boolean(courseAccessPopoverAnchor)}
                              anchorEl={courseAccessPopoverAnchor}
                              onClose={() => setCourseAccessPopoverAnchor(null)}
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                              slotProps={{
                                paper: {
                                  sx: { p: 1, minWidth: '260px' }
                                }
                              }}
                            >
                              <Typography variant="caption" sx={{ display: 'block', px: 1, py: 0.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                {t('Course Access')}
                              </Typography>
                              {[
                                { label: 'Public (Everyone)', value: 'public' },
                                { label: 'Accessible only to enrolled students', value: 'enrolled' },
                                { label: 'Locked (Hidden)', value: 'locked' }
                              ].map(option => (
                                <ListItemButton
                                  key={option.value}
                                  selected={courseAccess === option.value}
                                  onClick={() => handleCourseAccessChange(option.value)}
                                  sx={{
                                    mt: 0.5
                                  }}
                                >
                                  <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit', color: 'inherit' }}>
                                    {option.label}
                                  </Typography>
                                </ListItemButton>
                              ))}
                            </Popover>

                          </Box>
                        </Box>

                      </Box>

                      {/* Course Tags */}
                      <Box ref={tagsContainerRef} sx={{ position: "relative", gridColumn: '2', gridRow: '2', minWidth: 0 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#374151", fontSize: "13px" }}>
                          {t('courseDashboard.modal.courseTags')}
                        </Typography>

                        <Button
                          fullWidth
                          disableRipple
                          onClick={() => setIsTagsSectionExpanded(!isTagsSectionExpanded)}
                          sx={{
                            py: 1.75,
                            borderRadius: "12px",
                            textTransform: "none",
                            fontSize: "15px",
                            fontWeight: 400,
                            color: "#9ca3af",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(4px)",
                            border: "1.5px solid rgba(203, 213, 225, 0.8)",
                            "&:hover": {
                              border: "1.5px solid #94a3b8",
                              backgroundColor: "rgba(255, 255, 255, 0.8)",
                            },
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            flexWrap: "nowrap",
                            gap: 0.75,
                            px: 1.75,
                            mb: 1.5,
                            height: "48px",
                            overflowX: "auto",
                            overflowY: "hidden",
                            scrollbarWidth: "none",
                            "&::-webkit-scrollbar": { display: "none" }
                          }}
                        >
                          {courseTags.length === 0 ? (
                            <span># Tags</span>
                          ) : (
                            courseTags.map((tag, idx) => (
                              <Chip
                                key={idx}
                                label={tag.includes(' / ') ? tag.split(' / ')[1] : tag}
                                size="small"
                                onDelete={(e) => {
                                  e.stopPropagation();
                                  setCourseTags(courseTags.filter(t => t !== tag));
                                }}
                                sx={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  bgcolor: "rgba(0, 86, 179, 0.08)",
                                  color: "#0056b3",
                                  border: "none",
                                  borderRadius: "8px",
                                  height: "26px",
                                  "& .MuiChip-deleteIcon": {
                                    color: "rgba(0, 86, 179, 0.5)",
                                    "&:hover": { color: "#0056b3" }
                                  }
                                }}
                              />
                            ))
                          )}
                        </Button>

                        {/* Floating Dropdown Overlay Checklist Section */}
                        {isTagsSectionExpanded && (
                          <Paper
                            elevation={0}
                            sx={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              zIndex: 100,
                              mt: 0.1,
                              border: "1.5px solid rgba(255, 255, 255, 0.8)",
                              borderRadius: "16px",
                              backgroundColor: "rgba(255, 255, 255, 0.96)",
                              backdropFilter: "blur(30px)",
                              WebkitBackdropFilter: "blur(30px)",
                              boxShadow: "0 20px 50px -15px rgba(0, 86, 179, 0.18)",
                              background: `
                                  radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.08) 0, transparent 55%), 
                                  radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.06) 0, transparent 55%), 
                                  #ffffff`,
                              p: 2,
                              display: "flex",
                              flexDirection: "column",
                              height: "280px"
                            }}
                          >
                            {/* Search input */}
                            <TextField
                              fullWidth
                              size="small"
                              placeholder={t('courseDashboard.modal.searchTagsPlaceholder')}
                              value={tagSearchQuery}
                              onChange={(e) => setTagSearchQuery(e.target.value)}
                              sx={{
                                mb: 1.5,
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "8px",
                                  backgroundColor: "#ffffff",
                                  "& fieldset": { borderColor: "rgba(203, 213, 225, 0.6)" }
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" style={{ width: 14, height: 14, color: '#64748b', marginRight: 6 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                                  </svg>
                                )
                              }}
                            />

                            {/* Scrollable List */}
                            <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
                              {tagCategories.map((cat, catIdx) => {
                                const filteredTags = cat.tags.filter(tag =>
                                  tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
                                );

                                if (filteredTags.length === 0) return null;

                                return (
                                  <Box key={catIdx} sx={{ mb: 2 }}>
                                    <Typography sx={{ fontWeight: 800, color: "#0056b3", fontSize: "11px", borderBottom: "1px solid rgba(0, 86, 179, 0.08)", pb: 0.25, mb: 1, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                      {cat.category}
                                    </Typography>

                                    {/* Inline Tags Grid (2 Columns) */}
                                    <Grid container spacing={0.5}>
                                      {filteredTags.map((tag, tagIdx) => {
                                        const isChecked = courseTags.includes(tag);
                                        return (
                                          <Grid item xs={6} key={tagIdx}>
                                            <Box
                                              onClick={() => {
                                                if (isChecked) {
                                                  setCourseTags(courseTags.filter(t => t !== tag));
                                                } else {
                                                  setCourseTags([...courseTags, tag]);
                                                }
                                              }}
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.75,
                                                p: 0.5,
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                transition: "all 0.1s ease",
                                                backgroundColor: isChecked ? "rgba(0, 86, 179, 0.04)" : "transparent",
                                                border: "1px solid",
                                                borderColor: isChecked ? "rgba(0, 86, 179, 0.2)" : "transparent",
                                                "&:hover": {
                                                  backgroundColor: "rgba(0, 0, 0, 0.02)"
                                                }
                                              }}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => { }}
                                                style={{
                                                  width: "14px",
                                                  height: "14px",
                                                  cursor: "pointer",
                                                  accentColor: "#0056b3"
                                                }}
                                              />
                                              <Typography sx={{ fontSize: "11.5px", fontWeight: isChecked ? 700 : 500, color: isChecked ? "#0056b3" : "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {tag.split(' / ')[1]}
                                              </Typography>
                                            </Box>
                                          </Grid>
                                        );
                                      })}
                                    </Grid>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Paper>
                        )}

                      </Box>
                    </Box>

                    {/* Full Width Row: Course Description */}
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#374151", fontSize: "13px" }}>
                        {t('courseDashboard.modal.courseDescription')}
                      </Typography>
                      <TextField
                        fullWidth
                        value={courseDesc}
                        onChange={(e) => setCourseDesc(e.target.value)}
                        multiline
                        rows={3}
                        placeholder={t('courseDashboard.modal.courseDescPlaceholder')}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(4px)",
                            borderRadius: "12px",
                            transition: "all 0.2s ease",
                            "& fieldset": { borderColor: "rgba(203, 213, 225, 0.8)", borderWidth: "1.5px" },
                            "&:hover fieldset": { borderColor: "#94a3b8" },
                            "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
                            "&.Mui-focused": {
                              backgroundColor: "#ffffff",
                              boxShadow: "none"
                            },
                            "& textarea": { color: "#111827", fontSize: "15px", fontWeight: 500 }
                          }
                        }}
                      />
                    </Box>

                    {/* Step 1 Actions */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 2, pt: 3, borderTop: '1px solid #F3F4F6' }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => { setIsCreateModalOpen(false); setActiveStep(0); setAudienceLevel(""); setCourseCategory(""); setCourseTags([]); setIsTagsSectionExpanded(false); }}
                        disableElevation
                        sx={{
                          py: 1.5,
                          borderRadius: '12px',
                          textTransform: "none",
                          fontSize: "15px",
                          fontWeight: 600,
                          borderColor: "#D1D5DB",
                          color: "#374151",
                          "&:hover": {
                            borderColor: "#9CA3AF",
                            backgroundColor: "#F9FAFB"
                          }
                        }}
                      >
                        {t('courseDashboard.modal.cancel')}
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        disableElevation
                        onClick={() => {
                          if (courseTitle.trim() && audienceLevel && courseCategory && courseDesc.trim() && courseThumbnail) {
                            setActiveStep(1);
                          }
                        }}
                        disabled={!courseTitle.trim() || !audienceLevel || !courseCategory || !courseDesc.trim() || !courseThumbnail}
                        sx={{
                          py: 1.5,
                          borderRadius: '12px',
                          textTransform: "none",
                          fontSize: "16px",
                          fontWeight: 700,
                          background: (courseTitle.trim() && audienceLevel && courseCategory && courseDesc.trim() && courseThumbnail) ? 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)' : '#e2e8f0',
                          color: '#ffffff',
                          transition: 'all 0.2s',
                          '&.Mui-disabled': {
                            color: '#94a3b8',
                            background: '#e2e8f0',
                            WebkitTextFillColor: '#94a3b8'
                          },
                          '&:hover': {
                            background: 'linear-gradient(135deg, #004494 0%, #218838 100%)',
                          }
                        }}
                      >
                        {t('courseDashboard.modal.proceed')}
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* STEP 2: CURRICULUM BUILDER */}
                {activeStep === 1 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                    {/* Curriculum Builder */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>
                          {t('courseDashboard.modal.curriculumHeading')}
                        </Typography>
                        <Button
                          startIcon={<AddIcon />}
                          variant="outlined"
                          onClick={addModule}
                          size="small"
                          sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            borderColor: '#0056b3',
                            color: '#0056b3',
                            fontSize: '12px',
                            py: 0.5,
                            '&:hover': { borderWidth: 1.5 }
                          }}
                        >
                          {t('Add Module')}
                        </Button>
                      </Box>

                      {modules.map((module) => (
                        <Accordion
                          key={module.id}
                          sx={{
                            margin: '0 0 16px 0 !important',
                            borderRadius: '12px !important',
                            border: '1.5px solid rgba(30, 79, 163, 0.15)',
                            boxShadow: 'none',
                            background: "rgba(255, 255, 255, 0.4)",
                            backdropFilter: "blur(20px)",
                            '&:before': { display: 'none' }
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon sx={{ color: '#0056b3' }} />}
                            disableRipple
                            sx={{
                              borderTopLeftRadius: '12px',
                              borderTopRightRadius: '12px',
                              borderBottomLeftRadius: 0,
                              borderBottomRightRadius: 0,
                              px: { xs: 1.5, sm: 2.25 },
                              py: 0,
                              height: '64px',
                              minHeight: '64px',
                              maxHeight: '64px',
                              '&.Mui-expanded': {
                                minHeight: '64px',
                                maxHeight: '64px',
                                m: 0
                              },
                              '&:hover': {
                                backgroundColor: 'transparent'
                              },
                              '&.Mui-focusVisible': {
                                backgroundColor: 'transparent'
                              },
                              '& .MuiAccordionSummary-content': {
                                my: 0,
                                minWidth: 0,
                                '&.Mui-expanded': {
                                  m: 0
                                }
                              }
                            }}
                          >
                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' },
                                alignItems: 'center',
                                gap: { xs: 1.5, lg: 2 },
                                width: '100%',
                                minWidth: 0
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                                <DragIndicatorIcon sx={{ color: '#94a3b8', fontSize: '18px', flexShrink: 0 }} />
                                <TextField
                                  value={module.title}
                                  onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                                  placeholder="Module Title"
                                  variant="standard"
                                  InputProps={{ disableUnderline: true }}
                                  onClick={(e) => e.stopPropagation()} // Prevent accordion expansion
                                  sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    input: {
                                      fontWeight: 800,
                                      color: '#0f172a',
                                      fontSize: '0.95rem',
                                      py: 0.2,
                                      textOverflow: 'ellipsis'
                                    }
                                  }}
                                />
                                <Tooltip title={courseAccess === 'locked' ? "Course is locked" : "Change Access"} arrow placement="top">
                                  <IconButton
                                    component="span"
                                    size="small"
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      if (courseAccess !== 'locked') {
                                        openAccessPopover(e, module.id);
                                      }
                                    }}
                                    sx={{ ml: 0.5, p: 0.5, cursor: courseAccess === 'locked' ? 'not-allowed' : 'pointer' }}
                                  >
                                    <LockOutlinedIcon sx={{ color: module.access === 'public' ? '#28a745' : module.access === 'locked' ? '#ef4444' : '#94a3b8', fontSize: '18px' }} />
                                  </IconButton>
                                </Tooltip>
                                <Popover
                                  open={activeAccessModuleId === module.id}
                                  anchorEl={accessPopoverAnchorEl}
                                  onClose={closeAccessPopover}
                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                  transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                                  slotProps={{
                                    paper: {
                                      onClick: (e) => e.stopPropagation(),
                                      sx: { p: 1, minWidth: '260px' }
                                    }
                                  }}
                                >
                                  <Typography variant="caption" sx={{ display: 'block', px: 1, py: 0.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    {t('Module Access')}
                                  </Typography>
                                  {accessOptions.map(option => {
                                    const isBlocked = (courseAccess === 'locked' && option.value !== 'locked') || 
                                                      (courseAccess === 'enrolled' && option.value === 'public');
                                    const tooltipText = courseAccess === 'locked' 
                                      ? 'Course is locked — modules must also be locked'
                                      : 'Course is not public — modules cannot be public';
                                    return (
                                      <Tooltip
                                        key={option.value}
                                        title={isBlocked ? tooltipText : ''}
                                        arrow
                                        placement="right"
                                      >
                                        <span>
                                          <ListItemButton
                                            selected={module.access === option.value}
                                            disabled={isBlocked}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              updateModuleAccess(module.id, option.value);
                                            }}
                                            sx={{
                                              mt: 0.5
                                            }}
                                          >
                                            <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit', color: 'inherit' }}>
                                              {option.label}
                                            </Typography>
                                            {isBlocked && (
                                              <LockOutlinedIcon sx={{ fontSize: '13px', ml: 'auto', color: '#94a3b8' }} />
                                            )}
                                          </ListItemButton>
                                        </span>
                                      </Tooltip>
                                    );
                                  })}
                                </Popover>
                              </Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  flexWrap: 'nowrap',
                                  justifyContent: { xs: 'flex-start', lg: 'flex-end' }
                                }}
                              >
                                <Box
                                  component="span"
                                  onClick={(e) => openModuleCalendar(
                                    e,
                                    module.id,
                                    module.startDate && !module.endDate ? 'endDate' : 'startDate'
                                  )}
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.75,
                                    maxWidth: { xs: '100%', sm: '220px' },
                                    minHeight: '40px',
                                    justifyContent: 'center',
                                    px: 1.35,
                                    py: 0.55,
                                    borderRadius: '999px',
                                    border: '1px solid rgba(203, 213, 225, 0.75)',
                                    color: module.startDate || module.endDate ? '#0056b3' : '#64748b',
                                    backgroundColor: 'rgba(255, 255, 255, 0.72)',
                                    backdropFilter: 'blur(8px)',
                                    fontWeight: 750,
                                    fontSize: '0.78rem',
                                    lineHeight: 1.3,
                                    whiteSpace: 'nowrap',
                                    fontVariantNumeric: 'tabular-nums',
                                    cursor: 'pointer',
                                    boxShadow: module.startDate || module.endDate ? '0 8px 22px -18px rgba(0, 86, 179, 0.35)' : 'none',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0, 86, 179, 0.08)',
                                      borderColor: 'rgba(0, 86, 179, 0.22)',
                                      color: '#0056b3'
                                    }
                                  }}
                                >
                                  <CalendarMonthOutlinedIcon sx={{ fontSize: '16px', color: module.startDate || module.endDate ? '#0056b3' : 'inherit' }} />
                                  {getModuleDateTriggerLabel(module)}
                                </Box>
                                <Popover
                                  open={activeCalendarModuleId === module.id}
                                  anchorEl={moduleCalendarAnchorEl}
                                  onClose={closeModuleCalendar}
                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                  slotProps={{
                                    paper: {
                                      onClick: (e) => e.stopPropagation(),
                                      sx: timelineCalendarPaperSx
                                    }
                                  }}
                                >
                                  <Box sx={{ p: 0.5 }}>
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 1,
                                        px: 0.75,
                                        pt: 0.35,
                                        pb: 0.8
                                      }}
                                    >

                                      {activeCalendarModule && activeCalendarField && Reflect.get(activeCalendarModule, activeCalendarField) ? (
                                        <Button
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            clearModuleDate(activeCalendarModule.id, activeCalendarField);
                                          }}
                                          sx={{
                                            minWidth: 'auto',
                                            px: 0.75,
                                            py: 0.3,
                                            borderRadius: '999px',
                                            textTransform: 'none',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            color: '#ef4444'
                                          }}
                                        >
                                          {t('Clear')}
                                        </Button>
                                      ) : null}
                                    </Box>
                                    <Box
                                      sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 1,
                                        px: 0.75,
                                        pb: 0.9
                                      }}
                                    >
                                      <Box
                                        component="button"
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveCalendarField('startDate');
                                        }}
                                        sx={{
                                          appearance: 'none',
                                          border: activeCalendarField === 'startDate'
                                            ? '1px solid rgba(31, 143, 82, 0.3)'
                                            : '1px solid rgba(203, 213, 225, 0.75)',
                                          background: activeCalendarField === 'startDate'
                                            ? 'rgba(31, 143, 82, 0.08)'
                                            : 'rgba(255, 255, 255, 0.76)',
                                          color: activeCalendarField === 'startDate' ? '#1f8f52' : '#64748b',
                                          borderRadius: "12px",
                                          minHeight: '58px',
                                          px: 1,
                                          py: 0.85,
                                          cursor: 'pointer',
                                          textAlign: 'left'
                                        }}
                                      >
                                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4, opacity: 0.75 }}>
                                          {t('Start Date')}
                                        </Typography>
                                        <Typography sx={{ mt: 0.35, fontSize: '0.82rem', fontWeight: 800, color: 'inherit' }}>
                                          {activeCalendarModule?.startDate ? formatModuleDate(activeCalendarModule.startDate) : 'Not set'}
                                        </Typography>
                                      </Box>
                                      <Box
                                        component="button"
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveCalendarField('endDate');
                                        }}
                                        sx={{
                                          appearance: 'none',
                                          border: activeCalendarField === 'endDate'
                                            ? '1px solid rgba(0, 86, 179, 0.3)'
                                            : '1px solid rgba(203, 213, 225, 0.75)',
                                          background: activeCalendarField === 'endDate'
                                            ? 'rgba(0, 86, 179, 0.08)'
                                            : 'rgba(255, 255, 255, 0.76)',
                                          color: activeCalendarField === 'endDate' ? '#0056b3' : '#64748b',
                                          borderRadius: "12px",
                                          minHeight: '58px',
                                          px: 1,
                                          py: 0.85,
                                          cursor: 'pointer',
                                          textAlign: 'left'
                                        }}
                                      >
                                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4, opacity: 0.75 }}>
                                          {t('End Date')}
                                        </Typography>
                                        <Typography sx={{ mt: 0.35, fontSize: '0.82rem', fontWeight: 800, color: 'inherit' }}>
                                          {activeCalendarModule?.endDate ? formatModuleDate(activeCalendarModule.endDate) : 'Not set'}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                      <DateCalendar
                                        value={getModuleDateValue(
                                          activeCalendarField && activeCalendarModule
                                            ? Reflect.get(activeCalendarModule, activeCalendarField)
                                            : ''
                                        )}
                                        shouldDisableDate={(date) =>
                                          activeCalendarField === 'endDate' &&
                                          Boolean(activeCalendarModule?.startDate) &&
                                          date.isBefore(dayjs(activeCalendarModule.startDate), 'day')
                                        }
                                        onChange={(newValue) => {
                                          if (!newValue || !activeCalendarField || !activeCalendarModuleId) return;
                                          updateModuleDate(
                                            activeCalendarModuleId,
                                            activeCalendarField,
                                            newValue.format('YYYY-MM-DD')
                                          );
                                          if (activeCalendarField === 'startDate') {
                                            setActiveCalendarField('endDate');
                                            return;
                                          }
                                          closeModuleCalendar();
                                        }}
                                        sx={timelineCalendarSx}
                                      />
                                    </LocalizationProvider>
                                  </Box>
                                </Popover>
                                <IconButton
                                  component="span"
                                  size="small"
                                  onClick={(e) => { e.stopPropagation(); deleteModule(module.id); }}
                                  sx={{ color: '#ef4444', ml: { xs: 0, sm: 0.25 } }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails
                            sx={{
                              pt: 0,
                              pb: 0.5,
                              pl: { xs: 2, sm: '46px' },
                              pr: 2,
                              background: "rgba(255, 255, 255, 0.65)",
                              borderBottomLeftRadius: '12px',
                              borderBottomRightRadius: '12px'
                            }}
                          >
                            {module.lessons.map((lesson) => (
                              <Box
                                key={lesson.id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  p: 1.25,
                                  mb: 1,
                                  bgcolor: '#ffffff',
                                  border: '1px solid rgba(30, 79, 163, 0.1)',
                                  borderRadius: '8px',
                                  transition: 'all 0.2s',
                                  '&:hover': { borderColor: '#0056b3' }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
                                  {lesson.type === 'video' ? <OndemandVideoIcon sx={{ color: '#0056b3', fontSize: '18px' }} /> : <PictureAsPdfIcon sx={{ color: '#28a745', fontSize: '18px' }} />}
                                  <TextField
                                    value={lesson.title}
                                    onChange={(e) => updateLessonTitle(module.id, lesson.id, e.target.value)}
                                    placeholder="Lesson Title"
                                    variant="standard"
                                    InputProps={{ disableUnderline: true }}
                                    sx={{
                                      width: '80%',
                                      input: {
                                        fontWeight: 600,
                                        color: '#1e293b',
                                        fontSize: '0.88rem',
                                        py: 0.1
                                      }
                                    }}
                                  />
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={() => deleteLesson(module.id, lesson.id)}
                                  sx={{ color: '#ef4444' }}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}

                            <Box sx={{ mt: 0 }}>
                              {editingDescId === module.id || !module.description ? (
                                <TextField
                                  fullWidth
                                  multiline
                                  minRows={2}
                                  maxRows={3}
                                  autoFocus={editingDescId === module.id}
                                  onBlur={() => setEditingDescId(null)}
                                  variant="standard"
                                  InputProps={{ disableUnderline: true }}
                                  placeholder={t('courseDashboard.modal.moduleDescPlaceholder')}
                                  value={module.description || ''}
                                  onChange={(e) => updateModuleDescription(module.id, e.target.value)}
                                  sx={{
                                    p: 1,
                                    ml: -1,
                                    "& .MuiInputBase-root": {
                                      fontSize: "13.5px",
                                      lineHeight: 1.5,
                                      fontWeight: 500,
                                      color: "#475569",
                                      padding: "0",
                                      backgroundColor: "transparent"
                                    },
                                    "& textarea": {
                                      overflowY: "auto !important",
                                      padding: "0 !important"
                                    }
                                  }}
                                />
                              ) : (
                                <Box
                                  onClick={(e) => {
                                    if (e.target.closest('.view-more-action')) return;
                                    setEditingDescId(module.id);
                                  }}
                                  sx={{
                                    cursor: 'pointer',
                                    p: 1,
                                    ml: -1,
                                    borderRadius: "8px",
                                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' }
                                  }}
                                >
                                  <Typography
                                    component="div"
                                    sx={{
                                      fontSize: "13.5px",
                                      lineHeight: 1.5,
                                      fontWeight: 500,
                                      color: "#475569",
                                      whiteSpace: 'pre-wrap',
                                      maxHeight: Reflect.get(expandedDescModules, module.id) ? '60.75px' : 'none',
                                      overflowY: Reflect.get(expandedDescModules, module.id) ? 'auto' : 'visible',
                                      '&::-webkit-scrollbar': {
                                        width: '4px'
                                      },
                                      '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                        borderRadius: "8px"
                                      },
                                      '& .view-more-action': {
                                        color: '#0056b3',
                                        fontWeight: 800,
                                        fontSize: '12px',
                                        ml: 1,
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        display: 'inline-block',
                                        '&:hover': {
                                          textDecoration: 'underline'
                                        }
                                      }
                                    }}
                                  >
                                    <ShowMore
                                      lines={3}
                                      more="View More..."
                                      less="View Less..."
                                      anchorClass="view-more-action"
                                      expanded={Reflect.get(expandedDescModules, module.id) || false}
                                      onToggle={(isExpanded) => {
                                        setExpandedDescModules(prev => ({ ...prev, [module.id]: isExpanded }));
                                      }}
                                    >
                                      {module.description?.trimEnd()}
                                    </ShowMore>
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>

                    {/* Step 2 Actions */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 2, pt: 3, borderTop: '1px solid #F3F4F6' }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => setActiveStep(0)}
                        disableElevation
                        sx={{
                          py: 1.5,
                          borderRadius: '12px',
                          textTransform: "none",
                          fontSize: "15px",
                          fontWeight: 600,
                          borderColor: "#D1D5DB",
                          color: "#374151",
                          "&:hover": {
                            borderColor: "#9CA3AF",
                            backgroundColor: "#F9FAFB"
                          }
                        }}
                      >
                        {t('courseDashboard.modal.back')}
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        disableElevation
                        type="submit"
                        disabled={modules.length === 0 || modules.some(m => !m.title.trim() || !m.description || !m.description.trim())}
                        sx={{
                          py: 1.5,
                          borderRadius: '12px',
                          textTransform: "none",
                          fontSize: "16px",
                          fontWeight: 700,
                          background: (modules.length > 0 && modules.every(m => m.title.trim() && m.description?.trim())) ? 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)' : '#e2e8f0',
                          color: '#ffffff',
                          transition: 'all 0.2s',
                          '&.Mui-disabled': {
                            color: '#94a3b8',
                            background: '#e2e8f0',
                            WebkitTextFillColor: '#94a3b8'
                          },
                          '&:hover': {
                            background: 'linear-gradient(135deg, #004494 0%, #218838 100%)',
                          }
                        }}
                      >
                        {t('courseDashboard.modal.publishCourse')}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>
      )}    </>
  );
}
