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
        <Box sx={{ mb: 2, mt: 1, display: 'flex', alignItems: 'center', gap: 1, px: { xs: 2, md: 3 } }}>
          <Typography 
            onClick={() => router.push('/dashboard/home')}
            sx={{ color: '#64748b', fontWeight: 700, fontSize: "1.2rem", cursor: 'pointer', '&:hover': { color: '#0056b3' } }}
          >
            Dashboard
          </Typography>
          <Typography sx={{ color: '#334155', fontWeight: 900, fontSize: "1.2rem" }}>/</Typography>
          <Typography 
            onClick={() => router.push('/dashboard/home/institute')}
            sx={{ color: '#64748b', fontWeight: 700, fontSize: "1.2rem", cursor: 'pointer', '&:hover': { color: '#0056b3' } }}
          >
            Institute
          </Typography>
          <Typography sx={{ color: '#334155', fontWeight: 900, fontSize: "1.2rem" }}>/</Typography>
          <Typography 
            onClick={() => router.push('/dashboard/home/institute/courses')}
            sx={{ color: '#64748b', fontWeight: 700, fontSize: "1.2rem", cursor: 'pointer', '&:hover': { color: '#0056b3' } }}
          >
            Courses
          </Typography>
          <Typography sx={{ color: '#334155', fontWeight: 900, fontSize: "1.2rem" }}>/</Typography>
          <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: "1.2rem" }}>
            Course Builder
          </Typography>
        </Box>

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
              borderRadius: '12px',
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
            <Button variant="outlined" sx={{ textTransform: 'none', borderRadius: '12px', borderColor: '#0056b3', color: '#0056b3', fontWeight: 700, px: 3, py: 1, '&:hover': { borderWidth: 2 } }}>Upload Thumbnail</Button>
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
