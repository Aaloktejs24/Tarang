"use client";
import React, { useState } from 'react';
import { Box, Typography, Button, Container, TextField, IconButton, Paper, Accordion, AccordionSummary, AccordionDetails, Menu, MenuItem, InputBase } from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import SearchIcon from '@mui/icons-material/Search';
import RichQuestionEditor from '../../../components/RichQuestionEditor';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import dayjs from 'dayjs';
import { useTranslation } from '../../../hooks/useTranslation';
import useScrollLock from "../../../hooks/useScrollLock";

const MOCK_QUIZZES = [
  { id: 'q1', name: 'General Knowledge 2026', size: '1.2 MB' },
  { id: 'q2', name: 'Mathematics Entrance Test', size: '2.5 MB' },
  { id: 'q3', name: 'Logical Reasoning Quiz', size: '800 KB' },
  { id: 'q4', name: 'English Proficiency Exam', size: '1.5 MB' }
];

export default function AdmissionBuilder({ open, onClose }) {
  const { t } = useTranslation();

  const [activeStep, setActiveStep] = useState(0);
  const [workflowTitle, setWorkflowTitle] = useState("");
  const [workflowDesc, setWorkflowDesc] = useState("");

  useScrollLock(open);

  const [stages, setStages] = useState([
    { id: 1, title: 'Stage 1: Documents', type: 'document', requirements: ['Marksheet', 'Aadhar Card'] }
  ]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [quizMenuAnchorEl, setQuizMenuAnchorEl] = useState(null);
  const [activeQuizStageId, setActiveQuizStageId] = useState(null);
  const [quizSearchQuery, setQuizSearchQuery] = useState('');
  const openMenu = Boolean(anchorEl);

  const themeInputSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(4px)",
      borderRadius: "12px",
      transition: "all 0.2s ease",
      "& fieldset": { borderColor: "rgba(203, 213, 225, 0.8)", borderWidth: "1.5px" },
      "&:hover fieldset": { borderColor: "#94a3b8" },
      "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
      "&.Mui-focused": { backgroundColor: "#ffffff", boxShadow: "none" },
      "& input, & textarea": { color: "#111827", fontSize: "15px", fontWeight: 800, fontFamily: "'Rozha One', serif" }
    }
  };

  const handleAddClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const addStage = (type) => {
    handleMenuClose();
    const newStage = {
      id: Date.now(),
      title: `Stage ${stages.length + 1}: ${type === 'document' ? 'Document Request' : type === 'quiz' ? 'Quiz' : 'Interview'}`,
      type: type,
      requirements: type === 'document' ? [] : undefined,
      quizAttachment: type === 'quiz' ? null : undefined
    };
    setStages([...stages, newStage]);
  };

  const deleteStage = (id) => {
    setStages(stages.filter(s => s.id !== id));
  };

  const handleAttachQuiz = (stageId, quiz) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        return { ...s, quizAttachment: quiz };
      }
      return s;
    }));
  };

  const handleRemoveQuiz = (stageId) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        return { ...s, quizAttachment: null };
      }
      return s;
    }));
  };

if (!open) return null;

  return (
    <Box
      onClick={onClose}
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
        <IconButton
          onClick={onClose}
          sx={{
            display: { xs: "inline-flex", md: "none" },
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
          <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", letterSpacing: "-0.5px", fontSize: "24px" }}>
                {t('admissionBuilder.title')}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5, fontSize: "14px" }}>
                {t('admissionBuilder.subtitle')}
              </Typography>
            </Box>
          </Box>

          {/* Step Indicator Progress Bar */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, mt: 1 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75, cursor: 'pointer' }} onClick={() => setActiveStep(0)}>
              <Box sx={{ height: 4, borderRadius: "8px", bgcolor: activeStep >= 0 ? '#0056b3' : '#cbd5e1', transition: 'all 0.3s' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: activeStep === 0 ? '#0056b3' : '#64748b', fontSize: '11.5px' }}>
                {t('admissionBuilder.step1Label')}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75, cursor: 'pointer' }} onClick={() => { if (workflowTitle) setActiveStep(1); }}>
              <Box sx={{ height: 4, borderRadius: "8px", bgcolor: activeStep >= 1 ? '#0056b3' : '#cbd5e1', transition: 'all 0.3s' }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: activeStep === 1 ? '#0056b3' : '#64748b', fontSize: '11.5px' }}>
                {t('admissionBuilder.step2Label')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>

            {/* STEP 1: WORKFLOW DETAILS */}
            {activeStep === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#374151", fontSize: "13px" }}>
                    {t('admissionBuilder.titleField')}
                  </Typography>
                  <TextField
                    fullWidth
                    value={workflowTitle}
                    onChange={(e) => setWorkflowTitle(e.target.value)}
                    required
                    placeholder={t('admissionBuilder.titlePlaceholder')}
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
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#374151", fontSize: "13px" }}>
                    {t('admissionBuilder.descField')}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={workflowDesc}
                    onChange={(e) => setWorkflowDesc(e.target.value)}
                    placeholder={t('admissionBuilder.descPlaceholder')}
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
              </Box>
            )}

            {/* STEP 2: STAGES BUILDER */}
            {activeStep === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                {/* Stages Builder */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {t('admissionBuilder.stagesHeading')}
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      onClick={handleAddClick}
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
                      {t('admissionBuilder.addStage')}
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={openMenu}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={() => addStage('document')}>
                        <FileUploadOutlinedIcon sx={{ color: '#0056b3' }} /> {t('admissionBuilder.menuRequestDocs')}
                      </MenuItem>
                      <MenuItem onClick={() => addStage('quiz')}>
                        <QuizOutlinedIcon sx={{ color: '#0056b3' }} /> {t('admissionBuilder.menuCreateQuiz')}
                      </MenuItem>
                      <MenuItem onClick={() => addStage('interview')}>
                        <VideoCameraFrontOutlinedIcon sx={{ color: '#0056b3' }} /> {t('admissionBuilder.menuScheduleInterview')}
                      </MenuItem>
                    </Menu>
                  </Box>

                  {stages.map((stage) => (
                    <Accordion key={stage.id} sx={{
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
                            {stage.type === 'document' ? <FileUploadOutlinedIcon sx={{ color: '#0056b3', fontSize: '18px' }} /> :
                              stage.type === 'quiz' ? <QuizOutlinedIcon sx={{ color: '#0056b3', fontSize: '18px' }} /> :
                                <VideoCameraFrontOutlinedIcon sx={{ color: '#0056b3', fontSize: '18px' }} />}
                            <TextField
                              value={stage.title}
                              onChange={(e) => {
                                setStages(stages.map(s => s.id === stage.id ? { ...s, title: e.target.value } : s));
                              }}
                              placeholder={t('admissionBuilder.stageTitlePlaceholder')}
                              variant="standard"
                              InputProps={{ disableUnderline: true }}
                              sx={{
                                width: '100%',
                                input: { fontWeight: 700, color: '#1e293b', fontSize: '15px', py: 0.5 },
                                '& .MuiInputBase-input': { p: 0 }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
                            <IconButton component="span" size="small" onClick={(e) => { e.stopPropagation(); setStages(stages.filter(s => s.id !== stage.id)); }} sx={{ color: '#ef4444', ml: { xs: 0, sm: 0.25 } }}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{
                        pt: 2,
                        pb: 0.5,
                        pl: { xs: 2, sm: '46px' },
                        pr: 2,
                        background: "rgba(255, 255, 255, 0.65)",
                        borderBottomLeftRadius: '12px',
                        borderBottomRightRadius: '12px'
                      }}>
                        {stage.type === 'document' && (
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: '#475569', mb: 2 }}>{t('admissionBuilder.documentInstructions')}</Typography>
                            {stage.requirements.map((req, i) => (
                              <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, mb: 1, bgcolor: '#ffffff', border: '1px solid rgba(30, 79, 163, 0.1)', borderRadius: '8px', transition: 'all 0.2s', '&:hover': { borderColor: '#0056b3' } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
                                  <TextField
                                    defaultValue={req}
                                    variant="standard"
                                    InputProps={{ disableUnderline: true }}
                                    sx={{
                                      width: '100%',
                                      input: { fontWeight: 600, color: '#1e293b', fontSize: '0.88rem', py: 0.1 }
                                    }}
                                  />
                                </Box>
                                <IconButton size="small" sx={{ color: '#ef4444' }}>
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                            <Box sx={{ mt: 2, mb: 1 }}>
                              <Button size="small" startIcon={<AddIcon />} variant="text" sx={{ textTransform: 'none', color: '#0056b3', fontWeight: 700 }}>
                                {t('admissionBuilder.addAnotherDocument')}
                              </Button>
                            </Box>
                          </Box>
                        )}
                        {stage.type === 'quiz' && (
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: '#475569', mb: 3 }}>{t('admissionBuilder.attachQuiz')}</Typography>
                            
                            {!stage.quizAttachment ? (
                              <Paper elevation={0} sx={{ mb: 4, p: 2.5, borderRadius: '12px', bgcolor: '#f8fafc', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', '&:hover': { borderColor: '#0056b3', bgcolor: '#f1f5f9' } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Box sx={{ width: 44, height: 44, borderRadius: '8px', bgcolor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0056b3' }}>
                                    <QuizOutlinedIcon />
                                  </Box>
                                  <Box>
                                    <Typography sx={{ fontWeight: 700, color: '#1e293b' }}>{t('admissionBuilder.noQuizAttached')}</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>{t('admissionBuilder.selectFromLibrary')}</Typography>
                                  </Box>
                                </Box>
                                <Button 
                                  variant="contained" 
                                  startIcon={<AddIcon />} 
                                  disableElevation
                                  onClick={(e) => {
                                    setQuizMenuAnchorEl(e.currentTarget);
                                    setActiveQuizStageId(stage.id);
                                  }}
                                  sx={{ px: 3, py: 1, textTransform: 'none', fontWeight: 700, bgcolor: '#0056b3 !important', color: '#fff !important', borderRadius: '8px', '&:hover': { bgcolor: '#004494 !important' } }}
                                >
                                  {t('admissionBuilder.selectQuizBtn')}
                                </Button>
                              </Paper>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, mb: 4, bgcolor: '#ffffff', border: '1px solid rgba(30, 79, 163, 0.1)', borderRadius: '8px', transition: 'all 0.2s', '&:hover': { borderColor: '#0056b3' }, width: 'fit-content', minWidth: '480px' }}>
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                   <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0056b3', flexShrink: 0 }}>
                                     <QuizOutlinedIcon sx={{ fontSize: 22 }} />
                                   </Box>
                                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, pr: 3 }}>
                                     <Typography noWrap sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem', fontFamily: '"Rozha One", serif', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '260px' }}>
                                       {stage.quizAttachment.name}
                                     </Typography>
                                     <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 800, fontSize: '0.9rem', fontFamily: '"Inter", sans-serif' }}>
                                       {stage.quizAttachment.size}
                                     </Typography>
                                   </Box>
                                 </Box>
                                <IconButton 
                                  onClick={() => handleRemoveQuiz(stage.id)}
                                  size="small" 
                                  sx={{ color: '#ef4444' }}
                                  title="Remove Quiz"
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            )}
                          </Box>
                        )}
                        {stage.type === 'interview' && (
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: '#475569', mb: 3 }}>{t('admissionBuilder.interviewInstructions')}</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 800, color: "#374151", fontSize: "13px" }}>{t('admissionBuilder.dateLabel')}</Typography>
                                    <MobileDatePicker defaultValue={dayjs()} sx={{ width: '100%', ...themeInputSx }} />
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 800, color: "#374151", fontSize: "13px" }}>{t('admissionBuilder.timeLabel')}</Typography>
                                    <MobileTimePicker defaultValue={dayjs()} sx={{ width: '100%', ...themeInputSx }} />
                                  </Box>
                                </Box>
                              </LocalizationProvider>
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 800, color: "#374151", fontSize: "13px" }}>{t('admissionBuilder.meetingLink')}</Typography>
                                  <TextField type="url" placeholder={t('admissionBuilder.meetingLinkPlaceholder')} fullWidth sx={themeInputSx} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 800, color: "#374151", fontSize: "13px" }}>{t('admissionBuilder.passcode')}</Typography>
                                  <TextField type="text" placeholder={t('admissionBuilder.passcodePlaceholder')} fullWidth sx={themeInputSx} />
                                </Box>
                              </Box>
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 800, color: "#374151", fontSize: "13px" }}>
                                  {t('admissionBuilder.interviewInstructionsField')}
                                </Typography>
                                <TextField fullWidth multiline rows={3} placeholder={t('admissionBuilder.interviewInstructionsPlaceholder')} sx={themeInputSx} />
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}

                  {stages.length === 0 && (
                    <Box sx={{ p: 6, textAlign: 'center', border: '2px dashed #cbd5e1', borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.4)', mb: 2 }}>
                      <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '1.1rem' }}>{t('admissionBuilder.noStagesTitle')}</Typography>
                      <Typography sx={{ color: '#94a3b8', mt: 1 }}>{t('admissionBuilder.noStagesSubtitle')}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2, pt: 3, borderTop: '1px solid #F3F4F6' }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={activeStep === 1 ? () => setActiveStep(0) : onClose}
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
              {activeStep === 1 ? t('admissionBuilder.backBtn') : t('admissionBuilder.cancelBtn')}
            </Button>
            <Button
              fullWidth
              variant="contained"
              disableElevation
              onClick={activeStep === 0 ? () => setActiveStep(1) : onClose}
              disabled={activeStep === 0 && !workflowTitle.trim()}
              sx={{
                py: 1.5,
                borderRadius: '12px',
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 700,
                background: (activeStep === 0 && workflowTitle.trim()) || activeStep === 1 ? 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)' : '#e2e8f0',
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
              {activeStep === 0 ? t('admissionBuilder.nextBtn') : t('admissionBuilder.publishBtn')}
            </Button>
          </Box>
        </Box>
      </Paper>
    
      <Menu
        anchorEl={quizMenuAnchorEl}
        open={Boolean(quizMenuAnchorEl)}
        onClose={() => setQuizMenuAnchorEl(null)}
        PaperProps={{
          sx: { mt: 1, borderRadius: '8px', minWidth: '320px', maxHeight: '320px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }
        }}
      >
        <Box sx={{ p: 1.5, pb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9', borderRadius: '8px', px: 1.5, py: 0.5 }}>
            <SearchIcon sx={{ color: '#64748b', fontSize: 20, mr: 1 }} />
            <InputBase
              placeholder={t('admissionBuilder.searchQuizzesPlaceholder')}
              value={quizSearchQuery}
              onChange={(e) => setQuizSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              sx={{ flex: 1, fontSize: '0.875rem' }}
            />
          </Box>
        </Box>
        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {t('admissionBuilder.cloudQuizzesLabel')}
        </Typography>
        {MOCK_QUIZZES.filter(q => q.name.toLowerCase().includes(quizSearchQuery.toLowerCase())).map((quiz) => (
          <MenuItem 
            key={quiz.id} 
            onClick={(e) => {
              e.stopPropagation();
              handleAttachQuiz(activeQuizStageId, quiz);
              setQuizMenuAnchorEl(null);
              setQuizSearchQuery(''); // Reset search on select
            }}
            sx={{ py: 1, '&:hover': { bgcolor: '#f1f5f9' } }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2, overflow: 'hidden' }}>
              <Typography noWrap sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem', fontFamily: '"Rozha One", serif', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '260px' }}>{quiz.name}</Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.875rem', fontFamily: '"Inter", sans-serif', flexShrink: 0, ml: 2 }}>{quiz.size}</Typography>
            </Box>
          </MenuItem>
        ))}
        {MOCK_QUIZZES.filter(q => q.name.toLowerCase().includes(quizSearchQuery.toLowerCase())).length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>{t('admissionBuilder.noQuizzesFound')}</Typography>
          </Box>
        )}
      </Menu>
    </Box>
  );
}