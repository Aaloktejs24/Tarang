"use client";
import { useAppRouter as useRouter } from '../../../hooks/useAppRouter';
import mockData from '../../../data/lmsData.json';
import courseConfig from '../../../data/courseConfig.json';
const { lmsData: lmsData } = mockData;
const { courseAccessOptions: accessOptions } = courseConfig;
import React from 'react';
import AutoSaveIndicator from '../../../components/common/AutoSaveIndicator';
import { apiClient } from '../../../lib/apiClient';
import dayjs from 'dayjs';
import { useBreadcrumbs } from '../../../contexts/BreadcrumbContext';
import { formatBreadcrumbName } from '../../../utils/stringUtils';
import { useTheme } from '@mui/material';
import { Box, Typography, Button, Container, Grid, CardMedia, CardContent, IconButton, Chip, Fab, SpeedDialIcon, Breadcrumbs, Link, TextField, Paper, Autocomplete, Dialog, Popover, Tooltip, InputAdornment, ListItemButton, Avatar, Skeleton } from '@mui/material';
import { CustomAccordion, CustomAccordionSummary, CustomAccordionDetails } from '../../../components/common/CustomAccordion';
import PremiumCard from '../../../components/ui/PremiumCard';
import { CustomFloatingInput, CustomFloatingSelect, CustomFloatingSearchableSelect, CustomFloatingDatePicker, CustomFloatingMinIOUpload } from '../../../components/common/CustomFloatingFields';
import { ShowMore } from '@re-dev/react-truncate';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import { uploadToMinIO } from '../../../utils/uploadUtil';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import EmptyState from '../../../components/ui/EmptyState';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { BroomIcon } from '../../institute/admissions/BroomIcon';
import GroupIcon from '@mui/icons-material/Group';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import useScrollLock from "../../../hooks/useScrollLock";
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../hooks/useTranslation';
import { useProfile } from '../../../hooks/useProfile';
import { useConfirm } from '../../../contexts/ConfirmContext';
import UniversalHero from '../../../components/hero/UniversalHero';
import { getHeroPropsFromProfile } from '../../../utils/heroUtils';
import { CentralDropdown } from '../../../components/common/CentralDropdown';
import { DropdownListPopup } from '../../../components/common/DropdownListPopup';
import TarangButton from '../../../components/common/TarangButton';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { lmsService } from '../lmsService';
import { CustomTooltip } from '../../../components/common/CustomTooltip';



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
  if (module.start_date && module.end_date) {
    return `${formatModuleDateShort(module.start_date)} - ${formatModuleDateShort(module.end_date)}`;
  }

  if (module.start_date) {
    return `Starts ${formatModuleDateShort(module.start_date)}`;
  }

  if (module.end_date) {
    return `Ends ${formatModuleDateShort(module.end_date)}`;
  }

  return null;
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





export default function CourseModal({ open, onClose, onSuccess, initialData, onDelete }) {
  const confirm = useConfirm();
  const { t, language } = useTranslation();
  const { profile } = useProfile();
  useScrollLock(open);

  React.useEffect(() => {
    if (open && initialData) {
      setCourseTitle(initialData.title || "");
      setCourseDesc(initialData.desc || "");
      setCourseThumbnail(initialData.image || "");
      setCourseDoc(initialData.document || "");
      const parsedAudience = (initialData.audience || "").split(', ').map(l => {
        const found = audienceLevels.find(al => Reflect.get(al, 'label') === l);
        return found ? Reflect.get(found, 'value') : l;
      }).filter(Boolean);
      if (parsedAudience.length) setAudienceLevel(parsedAudience);

      const parsedCategory = (initialData.category || "").split(', ').map(c => {
        const found = courseCategories.find(cc => Reflect.get(cc, 'label') === c);
        return found ? Reflect.get(found, 'value') : c;
      }).filter(Boolean);
      if (parsedCategory.length) setCourseCategory(parsedCategory);

      setCourseTags(initialData.tags || []);
      if (initialData.modules && initialData.modules.length > 0) {
        setModules(initialData.modules);
      }
    }
  }, [open, initialData]);

  const [courseTitle, setCourseTitle] = React.useState("");
  const [courseDesc, setCourseDesc] = React.useState("");
  const [courseThumbnail, setCourseThumbnail] = React.useState("");
  const [courseDoc, setCourseDoc] = React.useState("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = React.useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const thumbnailInputRef = React.useRef(null);

  const tagsContainerRef = React.useRef(null);

  const [activeStep, setActiveStep] = React.useState(0);
  const [audienceLevel, setAudienceLevel] = React.useState([]);
  const [courseCategory, setCourseCategory] = React.useState([]);
  const [courseTags, setCourseTags] = React.useState([]);
  const [courseAccess, setCourseAccess] = React.useState('enrolled');
  const [courseAccessPopoverAnchor, setCourseAccessPopoverAnchor] = React.useState(null);
  const [courseAccessSearch, setCourseAccessSearch] = React.useState('');
  const [moduleAccessSearch, setModuleAccessSearch] = React.useState('');
  const courseAccessAnchorRef = React.useRef(null);
  const [isTagsSectionExpanded, setIsTagsSectionExpanded] = React.useState(false);
  const [tagSearchQuery, setTagSearchQuery] = React.useState("");
  const [moduleCalendarAnchorEl, setModuleCalendarAnchorEl] = React.useState(null);

  const [activeCalendarModuleId, setActiveCalendarModuleId] = React.useState(null);
  const [activeCalendarField, setActiveCalendarField] = React.useState(null);
  const [accessPopoverAnchorEl, setAccessPopoverAnchorEl] = React.useState(null);
  const [activeAccessModuleId, setActiveAccessModuleId] = React.useState(null);
  const [expandedDescModules, setExpandedDescModules] = React.useState({});
  const [editingDescId, setEditingDescId] = React.useState(null);
  const [expandedNodes, setExpandedNodes] = React.useState({});

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: language === 'en' ? 'Delete Course' : 'पाठ्यक्रम हटाएं',
      message: language === 'en' ? 'Are you sure you want to delete this course? This action cannot be undone.' : 'क्या आप वाकई इस पाठ्यक्रम को हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।',
      confirmText: language === 'en' ? 'Delete' : 'हटाएं',
      cancelText: language === 'en' ? 'Cancel' : 'रद्द करें',
      type: 'danger'
    });
    if (isConfirmed && onDelete) {
      await onDelete(initialData.id);
    }
  };

  React.useEffect(() => {
    if (!open) {
      setCourseTitle("");
      setCourseDesc("");
      setCourseThumbnail("");
      setCourseDoc("");
      setIsUploadingThumbnail(false);
      setActiveStep(0);
      setAudienceLevel([]);
      setCourseCategory([]);
      setCourseTags([]);
      setCourseAccess('enrolled');
      setCourseAccessSearch('');
      setModuleAccessSearch('');
      setCourseAccessPopoverAnchor(null);
      setIsTagsSectionExpanded(false);
      setTagSearchQuery("");
      setModuleCalendarAnchorEl(null);
      setActiveCalendarModuleId(null);
      setActiveCalendarField(null);
      setAccessPopoverAnchorEl(null);
      setActiveAccessModuleId(null);
      setExpandedDescModules({});
      setEditingDescId(null);
      setExpandedNodes({});
      setModules([
        {
          id: crypto.randomUUID(),
          title: `${t('courseDashboard.modal.nodeModule')} 1: ${t('courseDashboard.modal.newModule')}`,
          start_date: '',
          end_date: '',
          lessons: []
        }
      ]);
    }
  }, [open]);

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

  // Real-time calculation for perfect Thumbnail height
  const [leftColumnHeight, setLeftColumnHeight] = React.useState(0);
  const leftColumnRef = React.useRef(null);

  React.useEffect(() => {
    if (!leftColumnRef.current) return;

    // Initial exact measurement
    setLeftColumnHeight(leftColumnRef.current.getBoundingClientRect().height);

    const observer = new ResizeObserver(() => {
      if (leftColumnRef.current) {
        setLeftColumnHeight(leftColumnRef.current.getBoundingClientRect().height);
      }
    });

    observer.observe(leftColumnRef.current);

    return () => observer.disconnect();
  }, [open, activeStep]);

  const [modules, setModules] = React.useState([
    {
      id: crypto.randomUUID(),
      title: `${t('courseDashboard.modal.nodeModule')} 1: ${t('courseDashboard.modal.newModule')}`,
      start_date: '',
      end_date: '',
      access: 'enrolled',
      description: '',
      children: []
    }
  ]);

  const [autoSaveStatus, setAutoSaveStatus] = React.useState("idle");
  const isInitialLoad = React.useRef(true);

  React.useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    if (!initialData?.id) return;

    const saveDraftTimeout = setTimeout(async () => {
      setAutoSaveStatus('saving');

      const selectedAudience = Array.isArray(audienceLevel) ? audienceLevel.map(val => {
        const found = audienceLevels.find(al => Reflect.get(al, 'value') === val);
        return found ? Reflect.get(found, 'label') : val;
      }).join(', ') : "";

      const selectedCategory = Array.isArray(courseCategory) ? courseCategory.map(val => {
        const found = courseCategories.find(cc => Reflect.get(cc, 'value') === val);
        return found ? Reflect.get(found, 'label') : val;
      }).join(', ') : "";

      const newCourse = {
        title: courseTitle || t("courseDashboard.modal.untitledCourse"),
        desc: courseDesc,
        audience: selectedAudience,
        category: selectedCategory,
        tags: courseTags,
        modules: modules,
        students: initialData?.students || 0,
        status: initialData?.status || 'Active',
        image: courseThumbnail || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800',
        document: typeof courseDoc === 'object' && courseDoc ? courseDoc.url : courseDoc
      };

      try {
        await lmsService.updateCourse(initialData.id, newCourse);
        setAutoSaveStatus('saved');
        // Do not call onSuccess here
      } catch (err) {
        console.error("Failed to auto-save course:", err);
        setAutoSaveStatus('idle');
      }
    }, 1500);

    return () => clearTimeout(saveDraftTimeout);
  }, [courseTitle, courseDesc, audienceLevel, courseCategory, courseTags, modules, courseThumbnail, courseDoc, initialData?.id]);


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

  // --- Recursive Tree Helpers ---
  const updateTree = (nodes, id, updater) => {
    return nodes.map(node => {
      if (node.id === id) {
        return updater(node);
      }
      if (node.children && node.children.length > 0) {
        return { ...node, children: updateTree(node.children, id, updater) };
      }
      return node;
    });
  };

  const deleteFromTree = (nodes, id) => {
    return nodes.filter(node => node.id !== id).map(node => {
      if (node.children && node.children.length > 0) {
        return { ...node, children: deleteFromTree(node.children, id) };
      }
      return node;
    });
  };

  const findInTree = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children && node.children.length > 0) {
        const found = findInTree(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const isTreeValid = (nodes) => {
    if (nodes.length === 0) return false;
    for (const node of nodes) {
      if (!node.title.trim() || !node.description || !node.description.trim()) return false;
      if (node.children && node.children.length > 0) {
        if (!isTreeValid(node.children)) return false;
      }
    }
    return true;
  };

  const getNewNodeDetails = (nodes, targetParentId, currentPrefix = "") => {
    for (let i = 0; i < nodes.length; i++) {
      const nodePrefix = currentPrefix ? `${currentPrefix}.${i + 1}` : `${i + 1}`;
      if (nodes[i].id === targetParentId) {
        return {
          prefix: `${nodePrefix}.${(nodes[i].children || []).length + 1}`,
          depth: nodePrefix.split('.').length
        };
      }
      if (nodes[i].children && nodes[i].children.length > 0) {
        const found = getNewNodeDetails(nodes[i].children, targetParentId, nodePrefix);
        if (found) return found;
      }
    }
    return null;
  };

  // --- Node Operations ---
  const addNode = (parentId = null) => {
    const newNode = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      access: courseAccess === 'locked' ? 'locked' : 'enrolled',
      children: []
    };

    if (!parentId) {
      newNode.title = `${t('courseDashboard.modal.nodeModule')} ${modules.length + 1}: ${t('courseDashboard.modal.newModule')}`;
      setModules([...modules, newNode]);
      setExpandedNodes(prev => ({ ...prev, [newNode.id]: true }));
    } else {
      const details = getNewNodeDetails(modules, parentId);
      if (details) {
        newNode.title = `${t('courseDashboard.modal.nodeTopic')} ${details.prefix}: ${t('courseDashboard.modal.newTopic')}`;
      } else {
        newNode.title = t('courseDashboard.modal.newTopic');
      }

      setModules(updateTree(modules, parentId, (node) => ({
        ...node,
        children: [...(node.children || []), newNode]
      })));
      setExpandedNodes(prev => ({ ...prev, [parentId]: true, [newNode.id]: true }));
    }
  };

  const deleteNode = (nodeId) => {
    setModules(deleteFromTree(modules, nodeId));
  };

  const updateNodeField = (nodeId, field, value) => {
    setModules(updateTree(modules, nodeId, (node) => ({ ...node, [field]: value })));
  };

  const updateModuleTitle = (moduleId, newTitle) => updateNodeField(moduleId, 'title', newTitle);
  const updateModuleDescription = (moduleId, description) => updateNodeField(moduleId, 'description', description);

  const updateModuleDate = (moduleId, field, value) => {
    setModules(updateTree(modules, moduleId, (node) => {
      const nextNode = { ...node, [field]: value };
      if (field === 'start_date' && node.end_date && dayjs(value).isAfter(dayjs(node.end_date), 'day')) {
        nextNode.end_date = '';
      }
      return nextNode;
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

  const activeCalendarModule = findInTree(modules, activeCalendarModuleId) || null;

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
    updateNodeField(moduleId, 'access', accessType);
    closeAccessPopover();
  };

  // accessOptions are now imported from appConfig
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingThumbnail(true);
    try {
      const localUrl = URL.createObjectURL(file);
      setCourseThumbnail(localUrl);

      // We extract filename for the custom utility, it defaults correctly.
      const fileUrl = await uploadToMinIO(file, profile, 'thumbnail', 'thumbnail', courseThumbnail && courseThumbnail.startsWith('http') ? courseThumbnail : null);

      setCourseThumbnail(fileUrl);
    } catch (err) {
      console.error("Failed to upload thumbnail:", err);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };


  const renderCourseNode = (node, depth) => {
    const nodeName = depth === 0 ? t('courseDashboard.modal.nodeModule') : t('courseDashboard.modal.nodeTopic');

    return (
      <Box key={node.id} sx={{ position: 'relative' }}>
        <CustomAccordion
          key={node.id}
          expanded={!!expandedNodes[node.id]}
          onChange={(e, isExpanded) => {
            setExpandedNodes(prev => ({ ...prev, [node.id]: isExpanded }));
          }}
          sx={{
            margin: '0 !important',
            '&.Mui-expanded': { margin: '0 !important' },
            backgroundColor: depth > 0 ? 'transparent' : 'var(--card-bg)',
          }}
        >
          <CustomAccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-primary)' }} />}
            disableRipple
            sx={{
              px: { xs: 1.5, sm: 2.25 },
              py: 0,
              height: '64px',
              minHeight: '64px',
              borderBottom: 'none',
              '&&, &&:focus, &&:hover, &&:active, &&.Mui-expanded, &&.Mui-focusVisible': {
                background: depth > 0 ? 'transparent' : 'rgba(0, 86, 179, 0.04)',
                backgroundColor: depth > 0 ? 'transparent' : 'rgba(0, 86, 179, 0.04)',
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
                width: 'var(--size-full)',
                minWidth: 0
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <DragIndicatorIcon sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-lg)', flexShrink: 0 }} />
                <CustomFloatingInput
                  value={node.title}
                  onChange={(e) => updateModuleTitle(node.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()} // Prevent accordion expansion
                  placeholder={`${nodeName} Title`}
                  defaultBorderWidth="0px"
                  focusedBorderWidth="0px"
                  transparentBackground={true}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    background: 'transparent',
                    backgroundColor: 'transparent',
                    cursor: 'text',
                    '& input': {
                      paddingLeft: 0,
                      fontWeight: 'var(--font-bold)',
                      fontSize: depth === 0 ? 'var(--font-base)' : 'var(--font-sm)',
                      background: 'transparent',
                      backgroundColor: 'transparent',
                      cursor: 'text !important'
                    },
                    '& fieldset': { border: 'none' }
                  }}
                />
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

                <IconButton
                  component="span"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                  sx={{ color: 'var(--color-error)', ml: { xs: 0, sm: 0.25 } }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </CustomAccordionSummary>

          <CustomAccordionDetails
            sx={{
              pt: 2,
              pb: 3,
              pl: { xs: 2, sm: '60px' },
              pr: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              backgroundColor: 'transparent',
              borderBottomLeftRadius: 'var(--radius-lg)',
              borderBottomRightRadius: 'var(--radius-lg)'
            }}
          >
            <Box>
              <CustomFloatingInput
                fullWidth
                multiline
                rows={2}
                label={t('courseDashboard.modal.description')}
                value={node.description || ''}
                onChange={(e) => updateModuleDescription(node.id, e.target.value)}
                sx={{ mt: 0, mb: 0 }}
                required={depth === 0}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, alignItems: 'flex-start' }}>
              <CustomFloatingDatePicker
                label={t('courseDashboard.modal.startDate')}
                value={node.start_date || null}
                required={depth === 0}
                onChange={(e) => {
                  const val = e?.target?.value;
                  const formattedDate = val ? dayjs(val).format('YYYY-MM-DD') : '';
                  updateModuleDate(node.id, 'start_date', formattedDate);
                }}
              />
              <CustomFloatingDatePicker
                label={t('courseDashboard.modal.endDate')}
                value={node.end_date || null}
                required={depth === 0}
                onChange={(e) => {
                  const val = e?.target?.value;
                  const formattedDate = val ? dayjs(val).format('YYYY-MM-DD') : '';
                  updateModuleDate(node.id, 'end_date', formattedDate);
                }}
              />
            </Box>

            {node.children && node.children.map(child => renderCourseNode(child, depth + 1))}

            {depth < 2 && (
              <Box>
                <Button
                  startIcon={<AddIcon />}
                  variant="outlined"
                  onClick={() => addNode(node.id)}
                  size="small"
                  sx={{
                    textTransform: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 'var(--font-bold)',
                    borderColor: 'var(--color-primary)',
                    color: 'var(--color-primary)',
                    fontSize: 'var(--font-xs)',
                    py: 0.5
                  }}
                >
                  {t('courseDashboard.modal.addTopic')}
                </Button>
              </Box>
            )}
          </CustomAccordionDetails>
        </CustomAccordion>
      </Box>
    );
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-fixed)',
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
          width: { xs: "var(--size-full)", sm: "1000px" },
          minHeight: { xs: "var(--size-full)", sm: "auto" },
          borderRadius: { xs: 0, sm: "28px" },
          background: `
                radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.45) 0, transparent 50%), 
                radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.3) 0, transparent 50%), 
                radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.2) 0, transparent 50%),
                radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.15) 0, transparent 50%),
                #ffffff
              `,
          overflowY: 'hidden',
          maxHeight: '92vh',
          position: 'relative'
        }}
      >
        {/* Top Right Actions */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            gap: 1,
            zIndex: 'var(--z-sticky)'
          }}
        >
          {initialData && (
            <CustomTooltip title={language === 'en' ? 'Delete Course' : 'पाठ्यक्रम हटाएं'}>
              <IconButton
                onClick={handleDelete}
                disableRipple
                sx={{
                  display: 'inline-flex',
                  color: 'var(--color-error)',
                  '&:hover': { bgcolor: 'transparent' }
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </CustomTooltip>
          )}

          <CustomTooltip title={language === 'en' ? 'Clear Form' : 'फ़ॉर्म साफ़ करें'}>
            <IconButton
              onClick={() => {
                setCourseTitle("");
                setCourseDesc("");
                setCourseThumbnail("");
                setAudienceLevel([]);
                setCourseCategory([]);
                setCourseTags([]);
                setIsTagsSectionExpanded(false);
                setModules([
                  {
                    id: crypto.randomUUID(),
                    title: `${t('courseDashboard.modal.nodeModule')} 1: ${t('courseDashboard.modal.newModule')}`,
                    start_date: '',
                    end_date: '',
                    lessons: []
                  }
                ]);
                setActiveStep(0);
              }}
              disableRipple
              sx={{
                display: 'inline-flex',
                color: 'var(--color-slate-500)',
                '&:hover': { bgcolor: 'transparent' }
              }}
            >
              <BroomIcon />
            </IconButton>
          </CustomTooltip>

          <CustomTooltip title={t('courseDashboard.modal.cancel') || 'Close'}>
            <IconButton
              onClick={() => { onClose(); setActiveStep(0); setAudienceLevel([]); setCourseCategory([]); setCourseTags([]); setIsTagsSectionExpanded(false); }}
              disableRipple
              sx={{
                display: 'inline-flex',
                color: 'var(--color-slate-500)',
                '&:hover': { bgcolor: 'transparent' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </CustomTooltip>
        </Box>

        <Box sx={{ px: { xs: 3, sm: 8 }, py: { xs: 6, sm: 8 }, width: 'var(--size-full)', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
          {/* Header */}
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "var(--color-slate-900)", letterSpacing: "-0.5px", fontSize: 'var(--font-xl)' }}>
                {initialData ? (language === 'en' ? 'Edit Course' : 'पाठ्यक्रम संपादित करें') : t('courseDashboard.modal.createCourse')}
              </Typography>
              <Typography variant="body2" sx={{ color: "var(--color-slate-500)", mt: 0.5, fontSize: 'var(--font-sm)' }}>
                {activeStep === 0 ? t("courseDashboard.modal.basicDetails") : t("courseDashboard.modal.curriculumSubtitle")}
              </Typography>
            </Box>

            {initialData?.id && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AutoSaveIndicator status={autoSaveStatus} />
              </Box>
            )}
          </Box>

          {/* Step Indicator Progress Bar */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, mt: 1, flexShrink: 0 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box sx={{ height: 4, borderRadius: 'var(--radius-md)', bgcolor: activeStep >= 0 ? 'var(--color-primary)' : 'var(--color-slate-200)', transition: 'all var(--transition-slow)' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: activeStep === 0 ? 'var(--color-primary)' : 'var(--color-slate-500)', fontSize: '11.5px' }}>
                {t('courseDashboard.modal.stepDetails')}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box sx={{ height: 4, borderRadius: 'var(--radius-md)', bgcolor: activeStep >= 1 ? 'var(--color-primary)' : 'var(--color-slate-200)', transition: 'all var(--transition-slow)' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: activeStep === 1 ? 'var(--color-primary)' : 'var(--color-slate-500)', fontSize: '11.5px' }}>
                {t('courseDashboard.modal.stepCurriculum')}
              </Typography>
            </Box>
          </Box>

          <Box component="form" onSubmit={async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            const selectedAudience = Array.isArray(audienceLevel) ? audienceLevel.map(val => {
              const found = audienceLevels.find(al => Reflect.get(al, 'value') === val);
              return found ? Reflect.get(found, 'label') : val;
            }).join(', ') : "";

            const selectedCategory = Array.isArray(courseCategory) ? courseCategory.map(val => {
              const found = courseCategories.find(cc => Reflect.get(cc, 'value') === val);
              return found ? Reflect.get(found, 'label') : val;
            }).join(', ') : "";

            const newCourse = {
              title: courseTitle || t("courseDashboard.modal.untitledCourse"),
              desc: courseDesc,
              audience: selectedAudience,
              category: selectedCategory,
              tags: courseTags,
              modules: modules,
              students: initialData?.students || 0,
              status: initialData?.status || 'Active',
              image: courseThumbnail || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800',
              document: typeof courseDoc === 'object' && courseDoc ? courseDoc.url : courseDoc
            };

            try {
              let response;
              if (initialData?.id) {
                response = await lmsService.updateCourse(initialData.id, newCourse);
              } else {
                response = await lmsService.createCourse(newCourse);
              }
              if (onSuccess) onSuccess({ ...newCourse, id: response.id || initialData?.id });
            } catch (err) {
              console.error("Failed to save course:", err);
              // Fallback to local success for UI resilience if backend is off
              if (onSuccess) onSuccess({ ...newCourse, id: initialData?.id || Date.now() });
            }
            setIsSubmitting(false);

            onClose();
            setCourseTitle("");
            setCourseDesc("");
            setCourseThumbnail("");
            setAudienceLevel([]);
            setCourseCategory([]);
            setCourseTags([]);
            setIsTagsSectionExpanded(false);
            setModules([
              {
                id: crypto.randomUUID(),
                title: `${t('courseDashboard.modal.nodeModule')} 1: ${t('courseDashboard.modal.newModule')}`,
                start_date: '',
                end_date: '',
                lessons: []
              }
            ]);
            setActiveStep(0);
          }} sx={{ width: 'var(--size-full)', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>

            {/* STEP 1: COURSE DETAILS */}
            {activeStep === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: 'var(--size-full)', flexGrow: 1, minHeight: 0, overflowY: 'auto', pr: { xs: 0, sm: 0.5 }, pt: 1, pb: 1 }}>
                {/* Top Row: Columns */}
                <Box sx={{
                  display: { xs: 'flex', md: 'grid' },
                  flexDirection: 'column',
                  gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
                  gap: 1.5,
                  width: 'var(--size-full)'
                }}>

                  {/* Left Column: Course Details */}
                  <Box ref={leftColumnRef} sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    minWidth: 0,
                    width: { xs: 'var(--size-full)', md: 'auto' },
                    alignSelf: { xs: 'stretch', md: 'flex-start' }
                  }}>
                    {/* Course Title with Attachment and Lock Icons */}
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <CustomFloatingInput
                          fullWidth
                          label={t('courseDashboard.modal.courseTitle')}
                          value={courseTitle}
                          onChange={(e) => setCourseTitle(e.target.value)}
                          required
                        />
                      </Box>

                      {/* Lock icon */}
                      <CustomTooltip title="Course Access" arrow placement="top">
                        <IconButton
                          onClick={(e) => setCourseAccessPopoverAnchor(e.currentTarget)}
                          sx={{
                            height: '48px',
                            width: '48px',
                            backgroundColor: 'var(--glass-bg)',
                            backdropFilter: 'blur(30px)',
                            border: '1px solid rgba(30, 79, 163, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            '&:hover': { backgroundColor: 'var(--glass-bg)' },
                            transition: 'var(--transition-base)'
                          }}
                        >
                          <LockOutlinedIcon sx={{ color: courseAccess === 'public' ? 'var(--color-success)' : courseAccess === 'locked' ? 'var(--color-error)' : 'var(--color-slate-500)', fontSize: 'var(--font-lg)' }} />
                        </IconButton>
                      </CustomTooltip>

                      <DropdownListPopup
                        isOpen={Boolean(courseAccessPopoverAnchor)}
                        setIsOpen={(val) => { if (!val) setCourseAccessPopoverAnchor(null); }}
                        anchorRef={{ current: courseAccessPopoverAnchor }}
                        searchQuery={courseAccessSearch}
                        setSearchQuery={setCourseAccessSearch}
                        minWidth="260px"
                        options={[
                          { label: 'Public', value: 'public' },
                          { label: 'Enrolled', value: 'enrolled' },
                          { label: 'Locked', value: 'locked' }
                        ]}
                        value={courseAccess}
                        onChange={(e) => {
                          handleCourseAccessChange(e.target.value);
                          setCourseAccessPopoverAnchor(null);
                        }}
                      />
                    </Box>

                    {/* Target Audience / Educational Level */}
                    <Box>
                      <CustomFloatingSelect
                        fullWidth
                        label={t('courseDashboard.modal.targetAudience')}
                        multiple
                        options={audienceLevels}
                        value={audienceLevel}
                        onChange={(e) => setAudienceLevel(e.target.value)}
                        required
                      />
                    </Box>

                    {/* Course Category */}
                    <Box>
                      <CustomFloatingSearchableSelect
                        fullWidth
                        label={t('courseDashboard.modal.courseCategory')}
                        multiple
                        options={courseCategories}
                        value={courseCategory}
                        onChange={(e) => setCourseCategory(e.target.value)}
                        required
                      />
                    </Box>

                    {/* Course Tags */}
                    <Box>
                      <CustomFloatingSearchableSelect
                        label={t('courseDashboard.modal.courseTags')}
                        multiple
                        freeSolo
                        options={tagCategories.flatMap(cat => [
                          { label: cat.category, value: `heading-${cat.category}`, isHeading: true },
                          ...cat.tags.map(tag => ({
                            label: tag,
                            value: tag,
                            searchStr: `${cat.category} ${tag}`.toLowerCase()
                          }))
                        ])}
                        value={courseTags}
                        onChange={(e) => setCourseTags(e.target.value)}
                      />
                    </Box>

                    {/* Course Document */}
                    <Box>
                      <CustomFloatingMinIOUpload
                        label={language === 'en' ? 'Course Document (Syllabus)' : 'पाठ्यक्रम दस्तावेज़'}
                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        savedValue={courseDoc?.url || courseDoc}
                        profile={profile}
                        type="document"
                        fieldName="courseDoc"
                        onUploadStart={() => setIsUploadingDoc(true)}
                        onUploadComplete={(url, file) => {
                          setCourseDoc({ name: file?.name || 'document.pdf', url: url || '' });
                          setIsUploadingDoc(false);
                        }}
                        onUploadError={() => setIsUploadingDoc(false)}
                      />
                    </Box>
                  </Box>

                  {/* Right Column: 16:9 Aspect-Ratio Course Thumbnail */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: { xs: 'var(--size-full)', md: leftColumnHeight > 0 ? `${leftColumnHeight * (16 / 9)}px` : '405px' },
                    minWidth: 0
                  }}>
                    <Box>


                      {/* Wrapper with relative position so lock icon can float over thumbnail */}
                      <Box sx={{ position: 'relative', width: 'var(--size-full)' }}>

                        {/* Thumbnail clickable area */}
                        <Box
                          sx={{
                            width: 'var(--size-full)',
                            aspectRatio: '16/9',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: courseThumbnail ? 'transparent' : 'var(--glass-bg)',
                            backdropFilter: courseThumbnail ? 'none' : 'blur(30px)',
                            backgroundImage: courseThumbnail ? `url(${courseThumbnail})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: courseThumbnail ? 'none' : '2px dashed rgba(30, 79, 163, 0.3)',
                            cursor: courseThumbnail ? 'default' : 'pointer',
                            overflow: 'hidden',
                            position: 'relative',
                            transition: 'var(--transition-base)',
                          }}
                          onClick={() => {
                            if (!courseThumbnail) {
                              thumbnailInputRef.current?.click();
                            }
                          }}
                        >
                          {courseThumbnail ? (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                thumbnailInputRef.current?.click();
                              }}
                              sx={{
                                position: "absolute", top: 12, right: 12,
                                bgcolor: "var(--card-bg)", color: "var(--color-primary)",
                                boxShadow: "var(--shadow-sm)",
                                backdropFilter: "var(--card-blur)",
                                zIndex: 3,
                                "&:hover": { bgcolor: "var(--color-slate-50)", transform: "scale(1.05)" }
                              }}>
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          ) : isUploadingThumbnail ? (
                            <>
                              <CloudUploadIcon sx={{ color: 'var(--color-slate-500)', fontSize: 36, mb: 0.5 }} />
                              <Typography sx={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-primary)' }}>
                                {t('courseDashboard.modal.uploading')}
                              </Typography>
                            </>
                          ) : (
                            <>
                              <CloudUploadIcon sx={{ color: 'var(--color-primary)', fontSize: 36, mb: 0.5 }} />
                              <Typography sx={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-500)' }}>
                                {t('courseDashboard.modal.uploadThumbnail')}
                              </Typography>
                            </>
                          )}
                          <input
                            type="file"
                            hidden
                            ref={thumbnailInputRef}
                            accept="image/*"
                            onClick={(e) => (e.target.value = null)}
                            onChange={handleThumbnailUpload}
                          />
                        </Box>



                      </Box>
                    </Box>
                  </Box>
                </Box>
                {/* Full Width Row: Course Description */}
                <Box sx={{ width: 'var(--size-full)' }}>
                  <CustomFloatingInput
                    fullWidth
                    label={t('courseDashboard.modal.courseDescription')}
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    multiline
                    rows={3}
                  />
                </Box>

                {/* Step 1 Actions */}
                <Box sx={{ display: 'flex', gap: 1.5, mt: 4, flexShrink: 0, justifyContent: 'flex-end', width: '100%' }}>

                  <TarangButton
                    type="button"
                    onClick={() => setActiveStep(1)}
                    sx={{ height: '48px', fontSize: 'var(--font-base)', fontWeight: 'var(--font-bold)', width: { xs: '100%', sm: 'auto' }, minWidth: { sm: '140px' } }}
                  >
                    {t('courseDashboard.modal.proceed')}
                  </TarangButton>
                </Box>
              </Box>
            )}

            {/* STEP 2: CURRICULUM BUILDER */}
            {activeStep === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: 'var(--size-full)', flexGrow: 1, minHeight: 0 }}>
                {/* Curriculum Builder */}
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'var(--font-bold)', color: "var(--color-slate-900)", fontSize: 'var(--font-sm)' }}>
                      {t('courseDashboard.modal.curriculumHeading')}
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      onClick={() => addNode()}
                      size="small"
                      sx={{
                        textTransform: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 'var(--font-bold)',
                        borderColor: 'var(--color-primary)',
                        color: 'var(--color-primary)',
                        fontSize: 'var(--font-xs)',
                        py: 0.5
                      }}
                    >
                      {t('courseDashboard.modal.addModule')}
                    </Button>
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    flexGrow: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    pr: { xs: 0, sm: 0.5 },
                    mr: { xs: 0, sm: -0.5 },
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-sm)' }
                  }}>
                    {modules.map((module) => renderCourseNode(module, 0))}
                  </Box>
                </Box>

                {/* Step 2 Actions */}
                <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexShrink: 0, justifyContent: 'flex-end' }}>
                  <TarangButton
                    type="button"
                    variant="outlined"
                    onClick={() => setActiveStep(0)}
                    sx={{ height: '48px', fontSize: 'var(--font-base)', fontWeight: 'var(--font-semibold)', width: { xs: '100%', sm: 'auto' }, minWidth: { sm: '140px' } }}
                  >
                    {t('courseDashboard.modal.back')}
                  </TarangButton>
                  <TarangButton
                    type="submit"
                    loading={isSubmitting}
                    sx={{ height: '48px', fontSize: 'var(--font-base)', fontWeight: 'var(--font-bold)', width: { xs: '100%', sm: 'auto' }, minWidth: { sm: '140px' } }}
                  >
                    {t('courseDashboard.modal.publishCourse')}
                  </TarangButton>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
