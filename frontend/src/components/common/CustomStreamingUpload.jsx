"use client";

import React, { useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, LinearProgress, IconButton, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useMediaUploader } from '../../features/lms/hooks/useMediaUploader';
import { useToast } from '../../contexts/ToastContext';
import TarangVideoPlayer from '../viewer/TarangVideoPlayer';

export const CustomStreamingUpload = React.forwardRef(({ onUploadStart, onUploadComplete, onUploadError, onThumbnailGenerated, savedValue, type = 'video', fieldName, label, poster, ...props }, ref) => {
  const { showToast } = useToast();
  const { uploadFile, status, progress, error, jobId, resultData, reset } = useMediaUploader();

  const fileInputRef = useRef(null);
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [localPoster, setLocalPoster] = React.useState('');

  useEffect(() => {
    if (status === 'PROCESSING') {
      const start = Date.now();
      const timer = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  const formatElapsed = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    if (status === 'COMPLETED' && resultData) {
      if (onUploadComplete) {
        onUploadComplete(type === 'video' ? resultData.manifestUrl : resultData.viewerUrl);
      }
    } else if (status === 'ERROR') {
      if (onUploadError) onUploadError(error);
      showToast(error || "Upload failed");
    }
  }, [status, resultData, error]);

  const generateLocalThumbnail = (file) => {
    if (type !== 'video' || typeof window === 'undefined') return;
    try {
      const url = URL.createObjectURL(file);
      const v = document.createElement('video');
      v.preload = 'auto';
      v.muted = true;
      v.playsInline = true;
      v.crossOrigin = 'anonymous';
      v.src = url;

      let captured = false;
      const captureFrame = () => {
        if (captured) return;
        try {
          if (v.videoWidth > 0 && v.videoHeight > 0) {
            captured = true;
            const canvas = document.createElement('canvas');
            canvas.width = v.videoWidth || 640;
            canvas.height = v.videoHeight || 360;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setLocalPoster(dataUrl);
            if (onThumbnailGenerated) {
              onThumbnailGenerated(dataUrl);
            }
          }
        } catch (err) {
          console.warn("Local thumbnail capture error:", err);
        } finally {
          if (captured) URL.revokeObjectURL(url);
        }
      };

      v.onloadedmetadata = () => {
        v.currentTime = Math.min(1, (v.duration || 1) / 2);
      };
      v.onseeked = captureFrame;
      v.onloadeddata = captureFrame;
      v.onerror = () => {
        URL.revokeObjectURL(url);
      };
      // 2s safeguard timeout in case seeked is slow
      setTimeout(captureFrame, 2000);
    } catch (e) { }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'video') {
      generateLocalThumbnail(file);
    }

    if (onUploadStart) onUploadStart(file);
    uploadFile(file, type);
    e.target.value = '';
  };

  const isWorking = status === 'REQUESTING_INTENT' || status === 'UPLOADING' || status === 'PROCESSING';

  return (
    <Box sx={{
      position: 'relative',
      width: '100%',
      aspectRatio: '16/9',
      border: props.error ? '2px solid var(--color-error)' : (savedValue ? 'none' : '2px dashed rgba(30, 79, 163, 0.3)'),
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: savedValue ? 'transparent' : 'var(--glass-bg)',
      backdropFilter: savedValue ? 'none' : 'blur(30px)',
      cursor: (props.disabled || isWorking) ? 'default' : 'pointer',
      overflow: 'hidden',
      transition: savedValue ? 'none' : 'border-color 0.2s, background-color 0.2s',
      '&:hover': {
        borderColor: (!props.disabled && !isWorking && !savedValue) ? 'var(--color-primary)' : undefined,
        bgcolor: (!props.disabled && !isWorking && !savedValue) ? 'rgba(30, 79, 163, 0.02)' : undefined,
      }
    }}
      onClick={() => {
        if (!props.disabled && !isWorking && fileInputRef.current) {
          fileInputRef.current.click();
        }
      }}>

      <input
        type="file"
        accept={type === 'video' ? "video/mp4,video/webm,video/ogg" : "application/pdf"}
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {isWorking ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '85%', px: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: 'var(--color-primary)', fontSize: '15px' }}>
            {status === 'REQUESTING_INTENT' && "Preparing..."}
            {status === 'UPLOADING' && `Uploading: ${progress}%`}
            {status === 'PROCESSING' && `Processing... (${formatElapsed(elapsedSeconds)})`}
          </Typography>
          {(status === 'UPLOADING' || status === 'PROCESSING') && (
            <LinearProgress
              variant={status === 'UPLOADING' ? 'determinate' : 'indeterminate'}
              value={progress}
              sx={{
                width: '100%',
                height: 6,
                borderRadius: 3,
                bgcolor: 'rgba(30, 79, 163, 0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'var(--color-primary)',
                  borderRadius: 3
                }
              }}
            />
          )}
          {status === 'PROCESSING' && (
            <Typography variant="caption" sx={{ mt: 1, color: 'var(--color-slate-500)', fontSize: '11px', fontWeight: 500 }}>
              Encoding adaptive qualities up to 4K...
            </Typography>
          )}
        </Box>
      ) : status === 'ERROR' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '85%', px: 2, textAlign: 'center' }}>
          <ErrorOutlineIcon sx={{ fontSize: 36, color: 'var(--color-error)', mb: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--color-error)', mb: 0.5 }}>
            Processing Failed
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--color-slate-500)', mb: 1.5, display: 'block', maxWidth: '240px' }}>
            {error || 'Transcoding failed. Please retry.'}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
            sx={{ borderRadius: 'var(--radius-full)', textTransform: 'none', px: 2, fontWeight: 600 }}
          >
            Try Again
          </Button>
        </Box>
      ) : savedValue ? (
        <>
          {type === 'video' ? (
            <Box onClick={(e) => e.stopPropagation()} sx={{ width: '100%', height: '100%' }}>
              <TarangVideoPlayer
                key={savedValue}
                url={savedValue}
                jobId={jobId || (savedValue.match(/tarang-media-processed\/([^/]+)\//)?.[1])}
                poster={poster || localPoster || (savedValue.includes('tarang-media-processed') ? savedValue.replace(/\/[^\/]+$/, '/poster.jpg') : '')}
                isPreview={true}
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <CloudUploadIcon sx={{ fontSize: 40, color: 'var(--color-success)' }} />
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'var(--color-success)' }}>
                Document Processed
              </Typography>
            </Box>
          )}
          {!props.disabled && (
            <IconButton
              size="small"
              sx={{
                position: 'absolute', top: 8, right: 8, zIndex: 45,
                bgcolor: 'var(--glass-bg)', color: 'var(--color-primary)',
                boxShadow: 'var(--shadow-sm)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                '&:hover': { bgcolor: 'var(--glass-bg)', transform: 'scale(1.05)' }
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                  fileInputRef.current.click();
                }
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          )}
        </>
      ) : (
        <>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'rgba(30, 79, 163, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}>
            <CloudUploadIcon sx={{ color: 'var(--color-primary)', fontSize: 24 }} />
          </Box>
          <Typography variant="body2" sx={{ color: 'var(--color-slate-600)', fontWeight: 600, textAlign: 'center', px: 2 }}>
            {label || 'Upload File'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--color-slate-400)', mt: 0.5, textAlign: 'center' }}>
            {type === 'video' ? 'MP4, WebM up to 2GB' : 'PDF up to 50MB'}
          </Typography>
        </>
      )}
    </Box>
  );
});
CustomStreamingUpload.displayName = "CustomStreamingUpload";
