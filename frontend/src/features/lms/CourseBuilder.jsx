"use client";
import React, { useState } from 'react';
import { Box, Typography, Button, Container, TextField, IconButton, Paper, Accordion, AccordionSummary, AccordionDetails, Breadcrumbs, Link } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useBreadcrumbs } from '../../contexts/BreadcrumbContext';
import { useProfile } from '../../hooks/useProfile';
import { formatBreadcrumbName } from '../../utils/stringUtils';

export default function CourseBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const titleParam = searchParams.get('title') || "New Course";
  const descParam = searchParams.get('desc') || "";

  const [courseTitle, setCourseTitle] = useState(titleParam);
  const [courseDesc, setCourseDesc] = useState(descParam);

  const [modules, setModules] = useState([
    { id: 1, title: 'Module 1: Introduction', lessons: [{ id: 101, title: 'Welcome to the Course', type: 'video' }] }
  ]);

  const { profile } = useProfile();
  const rawInstituteName = profile ? (profile.full_name || profile.institution_name || profile.username) : 'Institute';
  const breadcrumbInstituteName = formatBreadcrumbName(rawInstituteName);

  useBreadcrumbs([
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home') },
    { label: breadcrumbInstituteName, onClick: () => router.push('/dashboard/home/institute') },
    { labelEn: 'Courses', labelHi: 'पाठ्यक्रम', onClick: () => router.push('/dashboard/home/institute/courses') },
    { labelEn: 'Course Builder', labelHi: 'कोर्स बिल्डर' }
  ]);

  const addModule = () => {
    setModules([...modules, { id: Date.now(), title: `Module ${modules.length + 1}: New Module`, lessons: [] }]);
  };

  const addLesson = (moduleId, type) => {
    setModules(modules.map(mod => {
      if (mod.id === moduleId) {
        return {
          ...mod,
          lessons: [...mod.lessons, { id: Date.now(), title: 'New Lesson', type }]
        };
      }
      return mod;
    }));
  };

  return (
    <>


      <Box sx={{ minHeight: 'calc(100vh - 64px)', pb: 10, pt: { xs: 8, md: 10 }, position: 'relative' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 4, md: 6, lg: 8 }, zIndex: 1, position: "relative" }}>

        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between', 
          mb: 6,
          px: { xs: 2, md: 3 },
          pt: { xs: 1, md: 2 }
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: "'Rozha One', serif", mt: 1 }}>
                Course Builder
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#475569', mt: 0.5, fontWeight: 500 }}>
                Structure your course and upload content
              </Typography>
            </Box>
          </Box>
          <Button 
            variant="contained" disableElevation 
            sx={{ 
              bgcolor: '#28a745', 
              color: 'white', 
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: '8px',
              px: 4,
              py: 1.5,
              fontSize: '0.95rem',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#218838', boxShadow: 'none' }
            }}
          >
            Publish Course
          </Button>
        </Box>

        <Container maxWidth="lg" disableGutters>
          {/* Course Meta */}
          <Paper elevation={0} sx={{ 
            p: 5, 
            borderRadius: '16px', 
            mb: 5,
            background: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(30, 79, 163, 0.2)"
          }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 4 }}>Course Details</Typography>
            <TextField fullWidth label="Course Title" variant="outlined" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} sx={{ mb: 4, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.6)' } }} />
            <TextField fullWidth label="Course Description" variant="outlined" multiline rows={4} value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} sx={{ mb: 4, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.6)' } }} />
            <Button variant="outlined" sx={{ textTransform: 'none', borderRadius: '8px', borderColor: '#0056b3', color: '#0056b3', fontWeight: 700, px: 3, py: 1, '&:hover': { borderWidth: 2 } }}>Upload Thumbnail</Button>
          </Paper>

          {/* Curriculum Builder */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: "'Rozha One', serif" }}>
              Curriculum
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
              Add Module
            </Button>
          </Box>

          {modules.map((module, index) => (
            <Accordion key={module.id} sx={{ 
              margin: '0 0 16px 0 !important',
              borderRadius: '12px !important', 
              border: '1.5px solid rgba(30, 79, 163, 0.15)', 
              boxShadow: 'none', 
              background: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(20px)",
              '&:before': { display: 'none' }
            }}>
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
                  '&.Mui-expanded': { minHeight: '64px', maxHeight: '64px', m: 0 },
                  '&:hover': { backgroundColor: 'transparent' },
                  '&.Mui-focusVisible': { backgroundColor: 'transparent' },
                  '& .MuiAccordionSummary-content': { my: 0, minWidth: 0, '&.Mui-expanded': { m: 0 } }
                }}
              >
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' }, alignItems: 'center', gap: { xs: 1.5, lg: 2 }, width: '100%', minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    <DragIndicatorIcon sx={{ color: '#94a3b8', fontSize: '18px', flexShrink: 0 }} />
                    <TextField
                      value={module.title}
                      onChange={(e) => {
                        setModules(modules.map(mod => mod.id === module.id ? { ...mod, title: e.target.value } : mod));
                      }}
                      placeholder="Module Title"
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                      onClick={(e) => e.stopPropagation()}
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
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
                    <IconButton component="span" size="small" onClick={(e) => { e.stopPropagation(); setModules(modules.filter(m => m.id !== module.id)); }} sx={{ color: '#ef4444', ml: { xs: 0, sm: 0.25 } }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ 
                pt: 0,
                pb: 0.5,
                pl: { xs: 2, sm: '46px' },
                pr: 2,
                background: "rgba(255, 255, 255, 0.65)", 
                borderBottomLeftRadius: '12px', 
                borderBottomRightRadius: '12px' 
              }}>
                {module.lessons.map((lesson) => (
                  <Box key={lesson.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, mb: 1, bgcolor: '#ffffff', border: '1px solid rgba(30, 79, 163, 0.1)', borderRadius: '8px', transition: 'all 0.2s', '&:hover': { borderColor: '#0056b3' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
                      {lesson.type === 'video' ? <OndemandVideoIcon sx={{ color: '#0056b3', fontSize: '18px' }} /> : <PictureAsPdfIcon sx={{ color: '#28a745', fontSize: '18px' }} />}
                      <TextField
                        value={lesson.title}
                        onChange={(e) => {
                          setModules(modules.map(mod => mod.id === module.id ? { ...mod, lessons: mod.lessons.map(les => les.id === lesson.id ? { ...les, title: e.target.value } : les) } : mod));
                        }}
                        placeholder="Lesson Title"
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          width: '80%',
                          input: { fontWeight: 600, color: '#1e293b', fontSize: '0.88rem', py: 0.1 }
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="text" sx={{ textTransform: 'none', color: '#0056b3', fontWeight: 700 }}>Edit Content</Button>
                      <IconButton size="small" onClick={() => setModules(modules.map(mod => mod.id === module.id ? { ...mod, lessons: mod.lessons.filter(l => l.id !== lesson.id) } : mod))} sx={{ color: '#ef4444' }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                ))}
                
                <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 1 }}>
                  <Button size="small" startIcon={<OndemandVideoIcon />} onClick={() => addLesson(module.id, 'video')} sx={{ textTransform: 'none', bgcolor: '#ffffff', color: '#0056b3', fontWeight: 700, border: '1px solid rgba(30, 79, 163, 0.2)', px: 2, py: 0.5, borderRadius: '8px', '&:hover': { bgcolor: '#f8fafc', borderColor: '#0056b3' } }}>
                    Add Video
                  </Button>
                  <Button size="small" startIcon={<PictureAsPdfIcon />} onClick={() => addLesson(module.id, 'pdf')} sx={{ textTransform: 'none', bgcolor: '#ffffff', color: '#28a745', fontWeight: 700, border: '1px solid rgba(30, 79, 163, 0.2)', px: 2, py: 0.5, borderRadius: '8px', '&:hover': { bgcolor: '#f8fafc', borderColor: '#28a745' } }}>
                    Add PDF
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}

        </Container>
      </Container>
    </Box>
    </>
  );
}
