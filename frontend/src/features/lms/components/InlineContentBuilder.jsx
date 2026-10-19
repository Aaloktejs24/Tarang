"use client";
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CustomFloatingInput, CustomFloatingMinIOUpload } from '../../../components/common/CustomFloatingFields';
import TarangButton from '../../../components/common/TarangButton';
import { useProfile } from '../../../hooks/useProfile';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LinkIcon from '@mui/icons-material/Link';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AudioFileOutlinedIcon from '@mui/icons-material/AudioFileOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CustomAccordion, CustomAccordionSummary, CustomAccordionDetails } from '../../../components/common/CustomAccordion';

const contentTypes = [
  { value: 'video', labelEn: 'Video Lecture', labelHi: 'वीडियो', icon: <OndemandVideoIcon fontSize="small" /> },
  { value: 'audio', labelEn: 'Audio / Podcast', labelHi: 'ऑडियो', icon: <AudioFileOutlinedIcon fontSize="small" /> },
  { value: 'document', labelEn: 'Document', labelHi: 'दस्तावेज़', icon: <DescriptionOutlinedIcon fontSize="small" /> },
  { value: 'article', labelEn: 'Reading Article', labelHi: 'लेख', icon: <ArticleOutlinedIcon fontSize="small" /> },
  { value: 'quiz', labelEn: 'Quiz', labelHi: 'प्रश्नोत्तरी', icon: <QuizOutlinedIcon fontSize="small" /> },
  { value: 'lab', labelEn: 'Lab', labelHi: 'लैब', icon: <ScienceOutlinedIcon fontSize="small" /> },
  { value: 'assignment', labelEn: 'Assignment', labelHi: 'कार्य', icon: <AssignmentOutlinedIcon fontSize="small" /> },
  { value: 'link', labelEn: 'External Link', labelHi: 'लिंक', icon: <LinkIcon fontSize="small" /> },
];

export default function InlineContentBuilder({ onSave, onCancel, initialData }) {
  const { profile } = useProfile();
  const { language } = useAccessibility();

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState(initialData?.type || 'video');
  const [url, setUrl] = useState(initialData?.url || '');
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || '');
  const [isUploading, setIsUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const leftColumnRef = useRef(null);
  const [leftColumnHeight, setLeftColumnHeight] = useState(0);
  const [prevType, setPrevType] = useState(type);

  if (type !== prevType) {
    setPrevType(type);
    setLeftColumnHeight(0);
  }

  useEffect(() => {
    // Update state if initialData changes
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setType(initialData.type || 'video');
      setUrl(initialData.url || '');
      setThumbnail(initialData.thumbnail || '');
    }
  }, [initialData]);

  useEffect(() => {
    if (leftColumnRef.current) {
      setLeftColumnHeight(leftColumnRef.current.getBoundingClientRect().height);
    }
    const handleResize = () => {
      if (leftColumnRef.current) {
        setLeftColumnHeight(leftColumnRef.current.getBoundingClientRect().height);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [type, title, description, language]);

  const handleSave = () => {
    if (!title) return;

    const newItem = {
      id: initialData?.id || `item-${Date.now()}`,
      title,
      description,
      type,
      url,
      thumbnail: type === 'video' ? thumbnail : undefined,
      createdAt: initialData?.createdAt || new Date().toISOString()
    };
    onSave(newItem);

    if (!initialData) {
      // Clear the form only if creating a new item
      setTitle('');
      setDescription('');
      setUrl('');
      setThumbnail('');
    }
    setExpanded(false);
  };

  const handleCancelClick = () => {
    if (onCancel) onCancel();
    setTitle('');
    setDescription('');
    setUrl('');
    setThumbnail('');
    setExpanded(false);
  };

  return (
    <CustomAccordion
      expanded={expanded}
      onChange={(e, isExpanded) => setExpanded(isExpanded)}
      sx={{
        backgroundColor: 'transparent',
        marginTop: '8px !important',
        marginBottom: '0 !important',
        '&.Mui-expanded': {
          marginTop: '8px !important',
          marginBottom: '0 !important',
        }
      }}
    >
      <CustomAccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-slate-600)' }} />}
        sx={{
          '&&, &&:focus, &&:hover, &&:active, &&.Mui-expanded, &&.Mui-focusVisible': {
            background: 'transparent',
            backgroundColor: 'transparent',
          }
        }}
      >
        <Typography sx={{ fontWeight: 600, color: 'var(--color-slate-600)', fontSize: '14px' }}>
          {initialData ? (title || (language === 'en' ? 'Edit Content' : 'सामग्री संपादित करें')) : (language === 'en' ? 'Add Content' : 'सामग्री जोड़ें')}
        </Typography>
      </CustomAccordionSummary>
      <CustomAccordionDetails>
        <Box sx={{
          background: 'transparent',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {/* Top Row: Chips + Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, width: '100%' }}>
            {/* Content Type Chips */}
            <Box sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              flexWrap: 'nowrap',
              pb: 1, // padding for the scrollbar
              flex: 1
            }}>
              {contentTypes.map((c) => {
                const isSelected = type === c.value;
                return (
                  <Box
                    key={c.value}
                    onClick={() => {
                      if (!isUploading) {
                        setType(c.value);
                        setUrl('');
                      }
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0,
                      gap: 0.75,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 'var(--radius-full)',
                      border: `var(--border-thin) solid ${isSelected ? 'var(--color-primary)' : 'var(--card-border)'}`,
                      bgcolor: isSelected ? 'rgba(30, 79, 163, 0.1)' : 'transparent',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-slate-600)',
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: !isSelected && !isUploading ? 'rgba(0,0,0,0.02)' : undefined
                      }
                    }}
                  >
                    {React.cloneElement(c.icon, { sx: { fontSize: 16 } })}
                    <Typography sx={{ fontSize: '12px', fontWeight: isSelected ? 700 : 600, whiteSpace: 'nowrap' }}>
                      {language === 'en' ? c.labelEn : c.labelHi}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexShrink: 0 }}>
              <Button
                size="small"
                sx={{ color: 'var(--color-slate-500)', fontWeight: 600 }}
                onClick={handleCancelClick}
              >
                {language === 'en' ? 'Cancel' : 'रद्द करें'}
              </Button>
              <Button
                size="small"
                variant="contained"
                sx={{ borderRadius: 'var(--radius-full)', px: 3, bgcolor: 'var(--color-primary)', boxShadow: 'none', fontWeight: 700 }}
                onClick={handleSave}
                disabled={!title || !description || (!url && type !== 'assignment') || (type === 'video' && !thumbnail) || isUploading}
              >
                {isUploading ? <CircularProgress size={16} color="inherit" /> : (language === 'en' ? 'Save' : 'सहेजें')}
              </Button>
            </Box>
          </Box>

          {/* Inputs Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: ['video', 'audio', 'document'].includes(type) ? '1fr auto' : '1fr' }, gap: 1.5 }}>

            {/* Left: All Text Inputs */}
            <Box ref={leftColumnRef} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <CustomFloatingInput
                label={language === 'en' ? 'Title' : 'शीर्षक'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                required
              />



              {['link', 'assignment', 'lab', 'quiz', 'article'].includes(type) && (
                <CustomFloatingInput
                  label={
                    type === 'lab' ? (language === 'en' ? 'Lab URL / Link' : 'लैब लिंक') :
                      type === 'quiz' ? (language === 'en' ? 'Quiz / Assessment Link' : 'प्रश्नोत्तरी लिंक') :
                        type === 'article' ? (language === 'en' ? 'Article URL' : 'लेख यूआरएल') :
                          (language === 'en' ? 'URL Link' : 'यूआरएल लिंक')
                  }
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isUploading}
                  required
                />
              )}

              <CustomFloatingInput
                label={language === 'en' ? 'Description' : 'विवरण'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                multiline
                required
                rows={2}
              />
            </Box>

            {/* Right: Upload Box (Only if applicable) */}
            {['video', 'audio', 'document'].includes(type) && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                width: {
                  xs: 'var(--size-full)',
                  md: leftColumnHeight > 0
                    ? (type === 'video' ? `${(leftColumnHeight * (16 / 9) * 2) + 12}px` : `${leftColumnHeight * (16 / 9)}px`)
                    : 'auto'
                },
                minWidth: 0
              }}>
                {type === 'document' && (
                  <CustomFloatingMinIOUpload
                    variant="box"
                    label={language === 'en' ? 'Upload Document' : 'दस्तावेज़ अपलोड करें'}
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    savedValue={url}
                    profile={profile}
                    type="document"
                    fieldName={`content-doc-${Date.now()}`}
                    onUploadStart={() => setIsUploading(true)}
                    onUploadComplete={(uploadedUrl) => {
                      setUrl(uploadedUrl);
                      setIsUploading(false);
                    }}
                    onUploadError={() => setIsUploading(false)}
                  />
                )}

                {type === 'video' && (
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5, width: '100%' }}>
                    <Box sx={{ flex: 1 }}>
                      <CustomFloatingMinIOUpload
                        variant="box"
                        label={language === 'en' ? 'Upload Video File' : 'वीडियो फ़ाइल अपलोड करें'}
                        accept="video/mp4,video/webm,video/ogg"
                        savedValue={url}
                        profile={profile}
                        type="video"
                        fieldName={`content-video-${Date.now()}`}
                        onUploadStart={() => setIsUploading(true)}
                        onUploadComplete={(uploadedUrl) => {
                          setUrl(uploadedUrl);
                          setIsUploading(false);
                        }}
                        onUploadError={() => setIsUploading(false)}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <CustomFloatingMinIOUpload
                        variant="box"
                        label={language === 'en' ? 'Upload Thumbnail' : 'थंबनेल अपलोड करें'}
                        accept="image/*"
                        savedValue={thumbnail}
                        profile={profile}
                        type="image"
                        required
                        fieldName={`content-thumbnail-${Date.now()}`}
                        onUploadStart={() => setIsUploading(true)}
                        onUploadComplete={(uploadedUrl) => {
                          setThumbnail(uploadedUrl);
                          setIsUploading(false);
                        }}
                        onUploadError={() => setIsUploading(false)}
                      />
                    </Box>
                  </Box>
                )}

                {type === 'audio' && (
                  <CustomFloatingMinIOUpload
                    variant="box"
                    label={language === 'en' ? 'Upload Audio File' : 'ऑडियो फ़ाइल अपलोड करें'}
                    accept="audio/*"
                    savedValue={url}
                    profile={profile}
                    type="document"
                    fieldName={`content-audio-${Date.now()}`}
                    onUploadStart={() => setIsUploading(true)}
                    onUploadComplete={(uploadedUrl) => {
                      setUrl(uploadedUrl);
                      setIsUploading(false);
                    }}
                    onUploadError={() => setIsUploading(false)}
                  />
                )}
              </Box>
            )}
          </Box>
        </Box>
      </CustomAccordionDetails>
    </CustomAccordion>);
}
