import React, { useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, LinearProgress, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useMediaUploader } from '../hooks/useMediaUploader';

export default function MediaUploadModal({ open, onClose, lesson, onUploadComplete }) {
  const { uploadFile, status, progress, error, resultData, reset } = useMediaUploader();
  const fileInputRef = useRef(null);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && lesson) {
      // type can be 'video' or 'pdf'
      const uploadType = lesson.type === 'video' ? 'video' : 'document';
      uploadFile(file, uploadType);
    }
  };

  // If completed, trigger callback and close
  React.useEffect(() => {
    if (status === 'COMPLETED' && resultData) {
      onUploadComplete(lesson.id, resultData);
      // Wait a moment so user sees it completed before closing
      const timer = setTimeout(() => {
        handleClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, resultData]);

  return (
    <Dialog open={open} onClose={status === 'UPLOADING' || status === 'PROCESSING' ? null : handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Upload Content for "{lesson?.title || 'Lesson'}"
        </Typography>
        {status !== 'UPLOADING' && status !== 'PROCESSING' && (
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent dividers sx={{ minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {status === 'IDLE' && (
          <>
            <CloudUploadIcon sx={{ fontSize: 64, color: 'var(--color-slate-300)', mb: 2 }} />
            <Typography variant="body1" sx={{ color: 'var(--color-slate-600)', mb: 3 }}>
              Select a {lesson?.type === 'video' ? 'Video (MP4)' : 'Document (PDF)'} file to upload.
            </Typography>
            <input
              type="file"
              accept={lesson?.type === 'video' ? 'video/mp4,video/x-m4v,video/*' : 'application/pdf'}
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            <Button
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
              sx={{ bgcolor: 'var(--color-primary)', textTransform: 'none', fontWeight: 'bold' }}
            >
              Browse Files
            </Button>
          </>
        )}

        {status === 'REQUESTING_INTENT' && (
          <Typography variant="body1" sx={{ color: 'var(--color-slate-600)' }}>
            Initializing upload...
          </Typography>
        )}

        {status === 'UPLOADING' && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Uploading... {progress}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        )}

        {status === 'PROCESSING' && (
          <Box sx={{ width: '100%', mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', color: 'var(--color-primary)' }}>
              Processing file in background... (This may take a few minutes)
            </Typography>
            <LinearProgress variant="indeterminate" sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        )}

        {status === 'COMPLETED' && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: 'var(--color-success)', fontWeight: 'bold', mb: 1 }}>
              Upload Completed!
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-slate-600)' }}>
              Your file is ready. Closing...
            </Typography>
          </Box>
        )}

        {status === 'ERROR' && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: 'var(--color-error)', fontWeight: 'bold', mb: 1 }}>
              Upload Failed
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-slate-600)', mb: 2 }}>
              {error}
            </Typography>
            <Button variant="outlined" color="error" onClick={reset}>
              Try Again
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
