"use client";
import React, { useState } from 'react';
import { Box, Typography, Button, Container, TextField, IconButton, Paper, Breadcrumbs, Link } from '@mui/material';
import { CustomAccordion, CustomAccordionSummary, CustomAccordionDetails } from '../../components/common/Accordion';
import {  useSearchParams } from 'next/navigation';

import { useAppRouter as useRouter } from '../../hooks/useAppRouter';
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
import MediaUploadModal from './components/MediaUploadModal';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function CourseEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const titleParam = searchParams.get('title') || "New Course";
  const descParam = searchParams.get('desc') || "";

  const [courseTitle, setCourseTitle] = useState(titleParam);
  const [courseDesc, setCourseDesc] = useState(descParam);

  const [modules, setModules] = useState([
    { id: crypto.randomUUID(), title: 'Module 1: Introduction', children: [{ id: crypto.randomUUID(), title: 'Welcome to the Course', type: 'video' }] }
  ]);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeUploadLesson, setActiveUploadLesson] = useState(null);

  const handleUploadComplete = (lessonId, resultData) => {
    setModules(modules.map(mod => ({
      ...mod,
      children: (mod.children || []).map(les => {
        if (les.id === lessonId) {
          if (les.type === 'video') {
            return { ...les, video_url: resultData.manifestUrl, video_job_id: resultData.jobId };
          } else {
            return { ...les, document_url: resultData.viewerUrl, document_job_id: resultData.jobId };
          }
        }
        return les;
      })
    })));
  };

  useBreadcrumbs([
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home/institute') },
    { labelEn: 'Academic Affairs', labelHi: 'शैक्षणिक मामले', onClick: () => router.push('/dashboard/home/institute?category=academic_affairs') },
    { labelEn: 'Courses', labelHi: 'पाठ्यक्रम', onClick: () => router.push('/dashboard/home/institute/courses') },
    { labelEn: 'Course Builder', labelHi: 'कोर्स बिल्डर' }
  ]);

  const addModule = () => {
    setModules([...modules, { id: crypto.randomUUID(), title: `Module ${modules.length + 1}: New Module`, children: [] }]);
  };

  const addLesson = (moduleId, type) => {
    setModules(modules.map(mod => {
      if (mod.id === moduleId) {
        return {
          ...mod,
          children: [...(mod.children || []), { id: crypto.randomUUID(), title: 'New Lesson', type }]
        };
      }
      return mod;
    }));
  };

  return (
    <>


      <Box sx={{ minHeight: 'calc(100vh - 64px)', pt: { xs: 8, md: 10 }, position: 'relative' }}>
        <Container maxWidth={false} sx={{ px: { xs: 4, md: 6, lg: 8 }, zIndex: 1, position: "relative" }}>

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
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mt: 1 }}>
                Course Builder
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'var(--color-slate-500)', mt: 0.5, fontWeight: 'var(--font-medium)' }}>
                Structure your course and upload content
              </Typography>
            </Box>
          </Box>
          <Button 
            variant="contained" disableElevation 
            sx={{ 
              bgcolor: 'var(--color-success)', 
              color: 'var(--color-white)', 
              textTransform: 'none',
              fontWeight: 800,
              px: 4,
              py: 1.5,
              fontSize: 'var(--font-base)',
              '&:hover': { bgcolor: 'var(--color-success)', }
            }}
          >
            Publish Course
          </Button>
        </Box>

        <Container maxWidth="lg" disableGutters>
          {/* Course Meta */}
          <Paper elevation={0} sx={{ p: 4, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 4 }}>Course Details</Typography>
            <TextField fullWidth label="Course Title" variant="outlined" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} sx={{ mb: 4 }} />
            <TextField fullWidth label="Course Description" variant="outlined" multiline rows={4} value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} sx={{ mb: 4 }} />
            <Button variant="outlined" sx={{ textTransform: 'none', borderColor: 'var(--color-primary)', color: 'var(--color-primary)', fontWeight: 'var(--font-bold)', px: 3, py: 1, '&:hover': { borderWidth: 2 } }}>Upload Thumbnail</Button>
          </Paper>

          {/* Curriculum Builder */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)' }}>
              Curriculum
            </Typography>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={addModule}
              size="small"
              sx={{
                textTransform: 'none',
                fontWeight: 'var(--font-bold)',
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary)',
                fontSize: 'var(--font-xs)',
                py: 0.5,
                '&:hover': { borderWidth: 1.5 }
              }}
            >
              Add Module
            </Button>
          </Box>

          {modules.map((module, index) => (
            <CustomAccordion key={module.id}>
              <CustomAccordionSummary 
                expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-primary)' }} />} 
                disableRipple
                sx={{ 
                  px: { xs: 1.5, sm: 2.25 },
                  height: '64px',
                  minHeight: '64px',
                  '& .MuiAccordionSummary-content': { my: 0, minWidth: 0 }
                }}
              >
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' }, alignItems: 'center', gap: { xs: 1.5, lg: 2 }, width: 'var(--size-full)', minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    <DragIndicatorIcon sx={{ color: 'var(--color-slate-500)', fontSize: 'var(--font-lg)', flexShrink: 0 }} />
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
                          color: 'var(--color-slate-900)',
                          fontSize: 'var(--font-base)',
                          py: 0.2,
                          textOverflow: 'ellipsis'
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
                    <IconButton component="span" size="small" onClick={(e) => { e.stopPropagation(); setModules(modules.filter(m => m.id !== module.id)); }} sx={{ color: 'var(--color-error)', ml: { xs: 0, sm: 0.25 } }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CustomAccordionSummary>

              <CustomAccordionDetails sx={{
                p: { xs: 1.5, sm: 2.25 },
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                backgroundColor: 'var(--glass-bg)',
              }}>
                {(module.children || []).map((lesson) => (
                  <Box key={lesson.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: { xs: 1.5, sm: 2.25 }, height: '64px', mb: 1, borderRadius: 'var(--radius-lg)', border: 'var(--border-thin) solid var(--card-border)', bgcolor: 'var(--card-bg)', backdropFilter: 'var(--card-blur)', transition: 'transform 0.2s ease-in-out', cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
                      {lesson.type === 'video' ? <OndemandVideoIcon sx={{ color: 'var(--color-primary)', fontSize: 'var(--font-lg)' }} /> : <PictureAsPdfIcon sx={{ color: 'var(--color-success)', fontSize: 'var(--font-lg)' }} />}
                      <TextField
                        value={lesson.title}
                        onChange={(e) => {
                          setModules(modules.map(mod => mod.id === module.id ? { ...mod, children: (mod.children || []).map(les => les.id === lesson.id ? { ...les, title: e.target.value } : les) } : mod));
                        }}
                        placeholder="Lesson Title"
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          width: '80%',
                          input: { fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-900)', fontSize: '0.88rem', py: 0.1 }
                        }}
                      />
                      {(lesson.video_job_id || lesson.document_job_id) && (
                        <CheckCircleIcon sx={{ color: 'var(--color-success)', fontSize: 'var(--font-sm)', ml: 1 }} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="text" onClick={() => { setActiveUploadLesson(lesson); setUploadModalOpen(true); }} sx={{ textTransform: 'none', color: 'var(--color-primary)', fontWeight: 'var(--font-bold)' }}>{lesson.video_job_id || lesson.document_job_id ? 'Re-Upload' : 'Upload Content'}</Button>
                      <IconButton size="small" onClick={() => setModules(modules.map(mod => mod.id === module.id ? { ...mod, children: (mod.children || []).filter(l => l.id !== lesson.id) } : mod))} sx={{ color: 'var(--color-error)' }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                ))}
                
                <Box sx={{ display: 'flex', gap: 1.5, mt: 2, mb: 1 }}>
                  <Button size="small" startIcon={<OndemandVideoIcon />} onClick={() => addLesson(module.id, 'video')} sx={{ textTransform: 'none', bgcolor: 'var(--color-white)', color: 'var(--color-primary)', fontWeight: 'var(--font-bold)', border: 'var(--border-thin) solid rgba(30, 79, 163, 0.2)', px: 2, py: 0.5, '&:hover': { bgcolor: 'var(--color-slate-50)', borderColor: 'var(--color-primary)' } }}>
                    Add Video
                  </Button>
                  <Button size="small" startIcon={<PictureAsPdfIcon />} onClick={() => addLesson(module.id, 'pdf')} sx={{ textTransform: 'none', bgcolor: 'var(--color-white)', color: 'var(--color-success)', fontWeight: 'var(--font-bold)', border: 'var(--border-thin) solid rgba(30, 79, 163, 0.2)', px: 2, py: 0.5, '&:hover': { bgcolor: 'var(--color-slate-50)', borderColor: 'var(--color-success)' } }}>
                    Add PDF
                  </Button>
                </Box>
              </CustomAccordionDetails>
            </CustomAccordion>
          ))}

        </Container>
      </Container>
    </Box>

    <MediaUploadModal 
      open={uploadModalOpen} 
      onClose={() => setUploadModalOpen(false)} 
      lesson={activeUploadLesson} 
      onUploadComplete={handleUploadComplete} 
    />
    </>
  );
}
