"use client";
import React from 'react';
import { Box, Typography, Container, Grid, CardContent, Chip, CircularProgress, Button, TextField, InputAdornment, Avatar, Card } from '@mui/material';
import { useAppRouter as useRouter } from '../../hooks/useAppRouter';
import { useTranslation } from '../../hooks/useTranslation';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useProfile } from '../../hooks/useProfile';
import { getHeroPropsFromProfile } from '../../utils/heroUtils';
import { formatBreadcrumbName } from '../../utils/stringUtils';
import { useBreadcrumbs } from '../../contexts/BreadcrumbContext';
import { useToast } from '../../contexts/ToastContext';
import EmptyState from '../../components/ui/EmptyState';
import { lmsService } from './lmsService';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { motion, AnimatePresence } from 'framer-motion';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import { CustomTooltip } from '../../components/common/CustomTooltip';
import CentralDropdown from '../../components/common/CentralDropdown';
import PremiumCard from '../../components/ui/PremiumCard';
import TarangButton from '../../components/common/TarangButton';

export default function StudentCourseDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useAccessibility();
  const { profile, loading: isProfileLoading } = useProfile();
  
  const [allCourses, setAllCourses] = React.useState([]);
  const [enrolledCourses, setEnrolledCourses] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [enrollLoading, setEnrollLoading] = React.useState({});

  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("newest");

  // Set up breadcrumbs
  const heroProps = getHeroPropsFromProfile(profile);
  const breadcrumbInstituteName = formatBreadcrumbName(heroProps.title);
  const breadcrumbs = [
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home') },
    { labelEn: breadcrumbInstituteName, labelHi: breadcrumbInstituteName, onClick: () => router.push('/dashboard/home/institute') },
    { labelEn: 'Courses', labelHi: 'पाठ्यक्रम' }
  ];
  useBreadcrumbs(breadcrumbs);

  const { showToast } = useToast();

  React.useEffect(() => {
    const fetchCourses = async () => {
      if (!profile?.id) return;
      try {
        setIsLoading(true);
        const [allData, enrolledData] = await Promise.all([
          lmsService.listCourses(),
          lmsService.getEnrolledCourses(profile.id)
        ]);
        if (allData) setAllCourses(allData);
        if (enrolledData) setEnrolledCourses(enrolledData);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [profile?.id]);

  const handleEnroll = async (e, courseId) => {
    e.stopPropagation();
    try {
      setEnrollLoading(prev => ({ ...prev, [courseId]: true }));
      await lmsService.enrollCourse(courseId, profile?.id, profile?.full_name || profile?.username, profile?.email);
      
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

  const filteredAndSortedCourses = allCourses
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
      // Mock dates for sorting if unavailable
      if (sortBy === 'newest') return (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0));
      if (sortBy === 'oldest') return (new Date(a.createdAt || 0)) - (new Date(b.createdAt || 0));
      return 0;
    });

  const renderCourseGrid = (courses) => {
    return (
      <Grid container spacing={3}>
        {courses.map((course, index) => {
          const isEnrolled = enrolledCourses.some(c => c.id === course.id);
          return (
            <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={course.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
                style={{ height: '100%', width: '100%', display: 'flex' }}
              >
                <PremiumCard
                  onClick={() => router.push(`/dashboard/home/institute/courses/${course.id}`)}
                  sx={{
                    height: 'var(--size-full)',
                    display: "flex",
                    flexDirection: "column",
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                >
                  <Box
                    sx={{
                      aspectRatio: "16/9",
                      width: 'var(--size-full)',
                      borderTopLeftRadius: "calc(var(--radius-lg) - 1px)",
                      borderTopRightRadius: "calc(var(--radius-lg) - 1px)",
                      backgroundImage: `url(${course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"})`,
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
                        <TarangButton
                          variant="outlined"
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/home/institute/courses/${course.id}`);
                          }}
                        >
                          {language === 'en' ? 'View Course' : 'कोर्स देखें'}
                        </TarangButton>
                        {isEnrolled ? (
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
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </PremiumCard>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", pt: { xs: 4, md: 4 }, pb: 10, position: "relative", zIndex: 1 }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 8, lg: 12, xl: 16 } }}>
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
                  { value: "newest", label: language === 'en' ? "Newest First" : "सबसे नया" },
                  { value: "oldest", label: language === 'en' ? "Oldest First" : "सबसे पुराना" },
                  { value: "alphabetical", label: language === 'en' ? "A-Z" : "अ-ज्ञ" }
                ]}
                searchable={false}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ minHeight: '400px' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 300 }}>
              <CircularProgress sx={{ color: 'var(--color-primary)' }} />
            </Box>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="courses-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {filteredAndSortedCourses.length === 0 ? (
                  <EmptyState
                    title={language === 'en' ? "No Courses Found" : "कोई पाठ्यक्रम नहीं मिला"}
                    description={language === 'en' ? "Try adjusting your search or filters." : "अपनी खोज या फ़िल्टर समायोजित करने का प्रयास करें।"}
                    icon={<SchoolOutlinedIcon sx={{ fontSize: 64, color: 'var(--color-slate-300)' }} />}
                  />
                ) : (
                  renderCourseGrid(filteredAndSortedCourses)
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </Box>
      </Container>
    </Box>
  );
}
