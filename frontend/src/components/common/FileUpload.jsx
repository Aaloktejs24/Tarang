import React, { useState, useRef } from 'react';
import { Box, Typography, Button, LinearProgress, IconButton } from '@mui/material';
import { Close as CloseIcon, CloudUpload as CloudUploadIcon, Description as FileIcon } from '@mui/icons-material';
import { apiClient } from '@/lib/apiClient';
import axios from 'axios';

export default function FileUpload({ 
  onUploadComplete, 
  accept = "image/*,application/pdf", 
  multiple = false, 
  title = "Upload Document",
  subtitle = "Drag and drop or click to browse"
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      if (!multiple && selectedFiles.length > 1) {
        setFiles([selectedFiles[0]]);
      } else {
        setFiles(selectedFiles);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (!multiple && droppedFiles.length > 1) {
        setFiles([droppedFiles[0]]);
      } else {
        setFiles(droppedFiles);
      }
    }
  };

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const pollMetadata = async (jobId) => {
    setStatusText("Processing document...");
    let attempts = 0;
    const maxAttempts = 60; // 60 * 2s = 120s max

    while (attempts < maxAttempts) {
      try {
        const res = await apiClient.get(`/viewer/${jobId}/metadata`);
        const { status } = res.data;
        if (status === "COMPLETED") {
          return res.data;
        } else if (status === "FAILED") {
          throw new Error("Document processing failed on the server.");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
    throw new Error("Processing timed out.");
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);
    setStatusText("Initiating upload...");

    const uploadedJobs = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 1. Get Intent
        setStatusText(`Preparing ${file.name}...`);
        const intentRes = await apiClient.post('/viewer/upload-intent', { filename: file.name });
        const { job_id, presigned_url } = intentRes.data;

        // 2. Upload to MinIO directly
        setStatusText(`Uploading ${file.name}...`);
        await axios.put(presigned_url, file, {
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        });

        // 3. Trigger Process
        setStatusText(`Processing ${file.name}...`);
        await apiClient.post(`/viewer/process/${job_id}`);

        // 4. Poll for completion
        const metadata = await pollMetadata(job_id);
        uploadedJobs.push(metadata);
      }

      setStatusText("Upload complete!");
      setFiles([]);
      if (onUploadComplete) {
        if (multiple) {
          onUploadComplete(uploadedJobs);
        } else {
          onUploadComplete(uploadedJobs[0]);
        }
      }

    } catch (err) {
      console.error("Upload error:", err);
      setStatusText("Error during upload.");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        setStatusText("");
      }, 2000);
    }
  };

  return (
    <Box>
      <Box 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        sx={{
          border: '2px dashed rgba(30, 79, 163, 0.3)',
          borderRadius: 'var(--radius-lg)',
          p: 4,
          textAlign: 'center',
          bgcolor: 'var(--glass-bg)',
          backdropFilter: 'blur(30px)',
          cursor: 'pointer',
          transition: 'var(--transition-base)',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          hidden 
          accept={accept} 
          multiple={multiple} 
          onChange={handleFileSelect} 
        />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'var(--color-slate-500)', mb: 1 }} />
        <Typography variant="h6" sx={{ color: 'var(--color-slate-700)', fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-slate-500)' }}>
          {subtitle}
        </Typography>
      </Box>

      {files.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {files.map((file, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', p: 1.5, bgcolor: 'var(--card-bg)', border: 'var(--border-thin) solid var(--card-border)', borderRadius: 'var(--radius-md)' }}>
              <FileIcon sx={{ color: 'var(--color-primary)', mr: 2 }} />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: 'var(--font-sm)', fontWeight: 500, color: 'var(--color-slate-900)' }}>
                  {file.name}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: 'var(--color-slate-500)' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
              {!uploading && (
                <IconButton size="small" onClick={() => removeFile(idx)} sx={{ color: 'var(--color-slate-500)', '&:hover': { color: 'var(--color-red-500)' } }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}

          {uploading && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'var(--color-slate-600)' }}>{statusText}</Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-slate-600)' }}>{progress}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
            </Box>
          )}

          {!uploading && (
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleUpload}
              sx={{ mt: 1, bgcolor: 'var(--color-primary)', color: 'white', '&:hover': { bgcolor: 'var(--color-primary-dark)' } }}
            >
              Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
