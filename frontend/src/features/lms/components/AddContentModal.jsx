"use client";
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  MenuItem,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CustomFloatingInput, CustomFloatingSelect, CustomFloatingMinIOUpload } from '../../../components/common/FloatingFields';
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

const contentTypes = [
  { value: 'video', labelEn: 'Video Lecture', labelHi: 'वीडियो व्याख्यान', icon: <OndemandVideoIcon fontSize="small" /> },
  { value: 'audio', labelEn: 'Audio / Podcast', labelHi: 'ऑडियो / पॉडकास्ट', icon: <AudioFileOutlinedIcon fontSize="small" /> },
  { value: 'document', labelEn: 'Document / PDF', labelHi: 'दस्तावेज़ / पीडीएफ', icon: <DescriptionOutlinedIcon fontSize="small" /> },
  { value: 'article', labelEn: 'Reading Article', labelHi: 'लेख', icon: <ArticleOutlinedIcon fontSize="small" /> },
  { value: 'quiz', labelEn: 'Quiz / Test', labelHi: 'प्रश्नोत्तरी / टेस्ट', icon: <QuizOutlinedIcon fontSize="small" /> },
  { value: 'lab', labelEn: 'Interactive Lab', labelHi: 'इंटरएक्टिव लैब', icon: <ScienceOutlinedIcon fontSize="small" /> },
  { value: 'assignment', labelEn: 'Assignment', labelHi: 'कार्य', icon: <AssignmentOutlinedIcon fontSize="small" /> },
  { value: 'link', labelEn: 'External Link', labelHi: 'बाहरी लिंक', icon: <LinkIcon fontSize="small" /> },
];

export default function AddContentModal({ open, onClose, onSave, targetNodeTitle }) {
  const { profile } = useProfile();
  const { language } = useAccessibility();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('video');
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setType('video');
    setUrl('');
    setDuration('');
    setIsUploading(false);
    onClose();
  };

  const handleSave = () => {
    if (!title) return;

    const newItem = {
      id: `item-${Date.now()}`,
      title,
      description,
      type,
      url,
      duration: duration || null,
      createdAt: new Date().toISOString()
    };

    onSave(newItem);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={isUploading ? undefined : handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 'var(--radius-xl)' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {language === 'en' ? 'Add Content to ' : 'सामग्री जोड़ें '}: {targetNodeTitle}
        </Typography>
        <IconButton onClick={handleClose} disabled={isUploading} size="small" sx={{ bgcolor: 'var(--color-slate-100)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-slate-700)', mb: -1 }}>
            {language === 'en' ? 'Select Content Type' : 'सामग्री प्रकार चुनें'}
          </Typography>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 1.5
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    p: 1.5,
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-slate-200)'}`,
                    borderRadius: 'var(--radius-md)',
                    bgcolor: isSelected ? 'rgba(30, 79, 163, 0.05)' : 'transparent',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    transition: 'var(--transition-fast)',
                    opacity: isUploading && !isSelected ? 0.5 : 1,
                    '&:hover': {
                      borderColor: !isUploading && !isSelected ? 'var(--color-slate-400)' : undefined,
                      bgcolor: !isUploading && !isSelected ? 'var(--color-slate-50)' : undefined
                    }
                  }}
                >
                  <Box sx={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-slate-600)' }}>
                    {c.icon}
                  </Box>
                  <Typography sx={{
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 600,
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-slate-700)',
                    textAlign: 'center',
                    lineHeight: 1.2
                  }}>
                    {language === 'en' ? c.labelEn : c.labelHi}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <CustomFloatingInput
            label={language === 'en' ? 'Title' : 'शीर्षक'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
            required
          />

          <CustomFloatingInput
            label={language === 'en' ? 'Description (Optional)' : 'विवरण (वैकल्पिक)'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
            multiline
            rows={2}
          />

          {type === 'video' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <CustomFloatingMinIOUpload
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
              <Typography variant="caption" sx={{ color: 'var(--color-slate-500)', textAlign: 'center' }}>
                {language === 'en' ? 'OR' : 'या'}
              </Typography>
              <CustomFloatingInput
                label={language === 'en' ? 'Video URL (YouTube, Vimeo, etc.)' : 'वीडियो यूआरएल'}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isUploading}
              />
              <CustomFloatingInput
                label={language === 'en' ? 'Duration (e.g., 10:30)' : 'अवधि'}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={isUploading}
              />
            </Box>
          )}

          {type === 'document' && (
            <CustomFloatingMinIOUpload
              label={language === 'en' ? 'Upload Document (PDF, Word, etc.)' : 'दस्तावेज़ अपलोड करें'}
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

          {type === 'audio' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <CustomFloatingMinIOUpload
                label={language === 'en' ? 'Upload Audio File' : 'ऑडियो फ़ाइल अपलोड करें'}
                accept="audio/*"
                savedValue={url}
                profile={profile}
                type="document" // Using document bucket for audio
                fieldName={`content-audio-${Date.now()}`}
                onUploadStart={() => setIsUploading(true)}
                onUploadComplete={(uploadedUrl) => {
                  setUrl(uploadedUrl);
                  setIsUploading(false);
                }}
                onUploadError={() => setIsUploading(false)}
              />
              <Typography variant="caption" sx={{ color: 'var(--color-slate-500)', textAlign: 'center' }}>
                {language === 'en' ? 'OR' : 'या'}
              </Typography>
              <CustomFloatingInput
                label={language === 'en' ? 'Audio URL (SoundCloud, Spotify, etc.)' : 'ऑडियो यूआरएल'}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isUploading}
              />
            </Box>
          )}

          {['link', 'assignment', 'lab', 'quiz', 'article'].includes(type) && (
            <CustomFloatingInput
              label={
                type === 'lab' ? (language === 'en' ? 'Lab URL / Environment Link' : 'लैब लिंक') :
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

        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <TarangButton variant="secondary" onClick={handleClose} disabled={isUploading}>
          {language === 'en' ? 'Cancel' : 'रद्द करें'}
        </TarangButton>
        <TarangButton
          variant="primary"
          onClick={handleSave}
          disabled={!title || (!url && type !== 'assignment') || isUploading}
        >
          {isUploading ? <CircularProgress size={24} color="inherit" /> : (language === 'en' ? 'Save Content' : 'सामग्री सहेजें')}
        </TarangButton>
      </DialogActions>
    </Dialog>
  );
}
