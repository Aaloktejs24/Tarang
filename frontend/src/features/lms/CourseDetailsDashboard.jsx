"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Chip, Box, Container, Typography, Grid, CircularProgress, Tabs, Tab, Card, CardContent, Divider, Avatar, AvatarGroup, Skeleton, IconButton, Fab, Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useAppRouter as useRouter } from '../../hooks/useAppRouter';
import { useTranslation } from '../../hooks/useTranslation';
import { useProfile } from '../../hooks/useProfile';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useBreadcrumbs } from '../../contexts/BreadcrumbContext';
import { useToast } from '../../contexts/ToastContext';
import { lmsService } from './lmsService';
import EmptyState from '../../components/ui/EmptyState';
import PremiumCard from '../../components/ui/PremiumCard';
import TarangButton from '../../components/common/TarangButton';
import { formatBreadcrumbName } from '../../utils/stringUtils';

import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import SignalCellularAltOutlinedIcon from '@mui/icons-material/SignalCellularAltOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import CurriculumViewer from './components/CurriculumViewer';

import { DASHBOARD_PAGE_WRAPPER_NO_HERO_SX, DASHBOARD_CONTAINER_SX } from '../../constants/layout';

import CourseModal from './components/CourseModal';

export default function CourseDetailsDashboard({ courseId }) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { profile } = useProfile();
  const { showToast } = useToast();
  const { fontSizeClass } = useAccessibility();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actualStudents, setActualStudents] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);

  const isManagement = profile?.role === 'institute' || profile?.role === 'admin' || profile?.user_type === 'institute' || profile?.is_institute;

  const cardsRef = useRef(null);

  const rawInstituteName = profile ? (profile.primary_name || profile.full_name || profile.username) : 'Institute';
  const breadcrumbInstituteName = formatBreadcrumbName(rawInstituteName);

  useBreadcrumbs([
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home/institute') },
    { labelEn: 'Courses', labelHi: 'कोर्स', onClick: () => router.push('/dashboard/home/institute/courses') },
    { labelEn: course?.title || 'Loading...', labelHi: course?.title || 'लोड हो रहा है...' }
  ]);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const data = await lmsService.getCourse(courseId);
        setCourse(data.course || data);

        if (isManagement) {
          try {
            const studentsRes = await lmsService.getCourseStudents(courseId);
            if (studentsRes) setActualStudents(studentsRes);
          } catch (e) {
            console.error("Failed to fetch students:", e);
          }
        }

        if (profile?.id && !isManagement) {
           const enrolledData = await lmsService.getEnrolledCourses(profile.id);
           if (enrolledData && enrolledData.some(c => c.id === courseId)) {
               setIsEnrolled(true);
           }
        }
      } catch (error) {
        console.error('Failed to fetch course details:', error);
        showToast('Failed to load course details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, profile?.id, isManagement]);

  const handleEnroll = async () => {
      if (!profile?.id) return;
      try {
          setEnrollLoading(true);
          await lmsService.enrollCourse(courseId, profile.id, profile?.full_name || profile?.username, profile?.email);
          setIsEnrolled(true);
          showToast(language === 'en' ? 'Successfully enrolled!' : 'सफलतापूर्वक नामांकित!', 'success');
      } catch (error) {
          console.error('Failed to enroll:', error);
          showToast(language === 'en' ? 'Failed to enroll' : 'नामांकन में विफल', 'error');
      } finally {
          setEnrollLoading(false);
      }
  };


  const handleAddContent = async (nodeId, newItem) => {
    if (!course) return;

    const updateTree = (nodes) => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          // Since it's one content per topic, replace the existing item
          return { ...node, items: [newItem] };
        }
        if (node.children && node.children.length > 0) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };

    const newModules = updateTree(course.modules || []);
    const updatedCourse = { ...course, modules: newModules };

    setCourse(updatedCourse);

    try {
      await lmsService.updateCourse(courseId, updatedCourse);
      showToast(language === 'en' ? 'Content added successfully' : 'सामग्री सफलतापूर्वक जोड़ी गई', 'success');
    } catch (error) {
      console.error('Failed to update course curriculum:', error);
      showToast(language === 'en' ? 'Failed to add content' : 'सामग्री जोड़ने में विफल', 'error');
    }
  };

  const handleEditSuccess = (updatedCourse) => {
    setCourse(updatedCourse);
    setIsEditModalOpen(false);
    showToast(language === 'en' ? 'Course updated successfully' : 'कोर्स सफलतापूर्वक अपडेट किया गया', 'success');
  };

  return (
    <Box sx={DASHBOARD_PAGE_WRAPPER_NO_HERO_SX}>
      <Container maxWidth={false} sx={{ ...DASHBOARD_CONTAINER_SX, pb: { xs: 10, md: 4 }, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
        {loading ? (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, md: 5, lg: 4 }}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 'var(--radius-lg)' }} />
            </Grid>
            <Grid size={{ xs: 12, md: 7, lg: 8 }}>
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 'var(--radius-lg)', mb: 4 }} />
              <Grid container spacing={3}>
                {[1, 2, 3].map(i => (
                  <Grid size={{ xs: 12, md: 6 }} key={i}>
                    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 'var(--radius-lg)' }} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3} sx={{ flexGrow: 1, mt: 2 }}>
            {/* Sidebar Content */}
            <Grid size={{ xs: 12, md: 5, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <PremiumCard sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', lineHeight: 1.2 }}>
                      {course?.title || (language === 'en' ? "Course Details" : "कोर्स विवरण")}
                    </Typography>
                    {isManagement && (
                      <IconButton
                        size="small"
                        onClick={() => setIsEditModalOpen(true)}
                        sx={{
                          bgcolor: 'rgba(30, 79, 163, 0.05)',
                          color: 'var(--color-primary)',
                          '&:hover': { bgcolor: 'rgba(30, 79, 163, 0.1)' }
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Typography sx={{ color: 'var(--color-slate-600)', fontSize: 'var(--font-sm)' }}>
                    {course?.desc || course?.description || (language === 'en' ? "Manage modules and students for this course." : "इस कोर्स के लिए मॉड्यूल और छात्रों का प्रबंधन करें।")}
                  </Typography>
                </Box>
              </PremiumCard>

              <PremiumCard sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 0 }}>
                  {/* Category & Tags Row */}
                  {(course?.category || (course?.tags && course.tags.length > 0)) && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                      <Box sx={{ width: 24, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                        <AttachFileIcon sx={{ fontSize: 18, color: 'var(--theme-blue)' }} />
                      </Box>
                      {course?.category && (
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
                          }}
                        />
                      )}
                      {course?.tags && course.tags.map((tag, idx) => (
                        <Chip
                          key={idx}
                          label={tag}
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
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Audience / Level Row */}
                  {(course?.audience || course?.level) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'var(--theme-blue)', fontSize: '0.85rem', fontWeight: 600, minWidth: 0, overflow: 'hidden' }}>
                      <Box sx={{ width: 24, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                        <GroupIcon sx={{ fontSize: 20, color: 'var(--theme-green)' }} />
                      </Box>
                      {(() => {
                        const levelSource = course?.audience || course?.level;
                        const audList = Array.isArray(levelSource)
                          ? levelSource
                          : (typeof levelSource === 'string' ? levelSource.split(',').map(a => a.trim()) : [levelSource]);
                        if (!audList || audList.length === 0) return null;
                        return <span style={{ marginLeft: '6px', lineHeight: 1.4 }}>{audList.join(', ')}</span>;
                      })()}
                    </Box>
                  )}

                  {/* Other info */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                    {course?.language && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'var(--color-slate-600)', fontSize: '12px', fontWeight: 500 }}>
                        <LanguageOutlinedIcon sx={{ fontSize: 16 }} /> {course.language}
                      </Box>
                    )}
                    {course?.duration && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'var(--color-slate-600)', fontSize: '12px', fontWeight: 500 }}>
                        <AccessTimeOutlinedIcon sx={{ fontSize: 16 }} /> {course.duration}
                      </Box>
                    )}
                    {course?.price && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'var(--color-slate-600)', fontSize: '12px', fontWeight: 500 }}>
                        <AttachMoneyOutlinedIcon sx={{ fontSize: 16, color: course.price.toString().toLowerCase() === 'free' ? 'var(--theme-green)' : 'inherit' }} />
                        <Box component="span" sx={{ color: course.price.toString().toLowerCase() === 'free' ? 'var(--theme-green)' : 'inherit', fontWeight: 'var(--font-bold)' }}>
                          {course.price}
                        </Box>
                      </Box>
                    )}
                  </Box>
                  
                  {!isManagement && (
                    <Box sx={{ mt: 3, pt: 2, borderTop: 'var(--border-thin) solid rgba(30, 79, 163, 0.1)' }}>
                      {isEnrolled ? (
                        <TarangButton
                          variant="primary"
                          fullWidth
                          onClick={() => router.push(`/dashboard/lms/course/${courseId}/access`)}
                        >
                          {language === 'en' ? 'Access Course' : 'पाठ्यक्रम देखें'}
                        </TarangButton>
                      ) : (
                        <TarangButton
                          variant="primary"
                          fullWidth
                          onClick={handleEnroll}
                          loading={enrollLoading}
                        >
                          {language === 'en' ? 'Enroll Now' : 'अभी नामांकन करें'}
                        </TarangButton>
                      )}
                    </Box>
                  )}
                </Box>
              </PremiumCard>


              {/* Students Enrolled Sidebar */}
              {isManagement && (
                <PremiumCard sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ p: 2, borderBottom: 'var(--border-thin) solid rgba(30, 79, 163, 0.1)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleOutlinedIcon sx={{ color: 'var(--color-primary)' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--color-slate-900)' }}>
                      {language === 'en' ? 'Students Enrolled' : 'नामांकित छात्र'}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                    {typeof course?.students === 'number' && course.students > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2.5 }}>
                        {actualStudents.length > 0 
                          ? actualStudents.slice(0, 5).map((s, i) => (
                              <Tooltip title={s.name || s.email || 'Student'} key={s.id || i}>
                                <Avatar src={s.profile_pic || undefined} sx={{ width: 48, height: 48, fontSize: '1.1rem', border: '2px solid var(--color-white)', boxShadow: '0 0 0 2px var(--color-primary), 0 4px 12px rgba(0,0,0,0.1)', bgcolor: `hsl(${(i * 70 + 200) % 360}, 70%, 55%)` }}>
                                  {!s.profile_pic && (s.name ? s.name.substring(0, 1).toUpperCase() : <PersonIcon sx={{ fontSize: 32 }} />)}
                                </Avatar>
                              </Tooltip>
                            )) 
                          : Array.from({ length: Math.min(course.students, 5) }).map((_, i) => (
                              <Avatar key={i} sx={{ width: 48, height: 48, fontSize: '1.1rem', border: '2px solid var(--color-white)', boxShadow: '0 0 0 2px var(--color-primary), 0 4px 12px rgba(0,0,0,0.1)', bgcolor: `hsl(${(i * 70 + 200) % 360}, 70%, 55%)` }}>
                                <PersonIcon sx={{ fontSize: 32 }} />
                              </Avatar>
                            ))}
                        {course.students > 5 && (
                          <Avatar sx={{ width: 48, height: 48, fontSize: '1.1rem', border: '2px solid var(--color-white)', boxShadow: '0 0 0 2px var(--color-primary), 0 4px 12px rgba(0,0,0,0.1)', bgcolor: 'var(--color-slate-100)', color: 'var(--color-slate-700)', fontWeight: 'bold' }}>
                            +{course.students - 5}
                          </Avatar>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', textAlign: 'left', py: 4 }}>
                        {language === 'en' ? "No Students Enrolled" : "कोई छात्र नामांकित नहीं"}
                      </Typography>
                    )}
                  </Box>
                </PremiumCard>
              )}
            </Grid>

            {/* Main Content Area */}
            <Grid size={{ xs: 12, md: 7, lg: 8 }} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mt: 0 }}>
                <CurriculumViewer
                  modules={course?.modules || []}
                  isManagement={isManagement}
                  onAddContent={handleAddContent}
                />
              </Box>
            </Grid>
          </Grid>
        )}
      </Container>
      {course && isManagement && (
        <Fab
          color="primary"
          aria-label="Edit Course"
          onClick={() => setIsEditModalOpen(true)}
          sx={{
            position: 'fixed',
            bottom: { xs: 24, md: 40 },
            right: { xs: 24, md: 40 },
            zIndex: 1000,
            width: { xs: 56, md: 64 },
            height: { xs: 56, md: 64 },
            bgcolor: 'var(--color-primary)',
            border: '1.5px solid var(--color-warning)',
            '&:hover, &:focus, &:active': {
              bgcolor: 'var(--color-primary)'
            }
          }}
        >
          <EditOutlinedIcon />
        </Fab>
      )}

      {isEditModalOpen && course && (
        <CourseModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          initialData={course}
        />
      )}
    </Box>
  );
}
