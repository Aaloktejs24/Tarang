import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { apiClient } from '@/lib/apiClient';
import PDFRenderer from './renderers/PDFRenderer';
import ImageRenderer from './renderers/ImageRenderer';

export default function DocumentViewer({ jobId, width = "100%", height = "500px" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    let isMounted = true;
    
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get(`/viewer/${jobId}/metadata`);
        if (isMounted) {
          if (res.data.status === "COMPLETED") {
            setMetadata(res.data);
          } else if (res.data.status === "FAILED") {
            setError("Document processing failed on the server.");
          } else {
            setError("Document is still processing. Please try again later.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch document metadata:", err);
          setError("Failed to load document.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMetadata();
    
    return () => { isMounted = false; };
  }, [jobId]);

  if (!jobId) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--color-slate-50)', borderRadius: 'var(--radius-lg)', border: 'var(--border-thin) solid var(--color-slate-200)' }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--color-slate-50)', borderRadius: 'var(--radius-lg)', border: 'var(--border-thin) solid var(--color-slate-200)' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!metadata) {
    return null;
  }

  const { renderer, original_download_url, pdf_download_url, filename } = metadata;

  // Render logic based on renderer type
  let content;
  
  if (renderer === "PDF.js" && pdf_download_url) {
    content = <PDFRenderer url={pdf_download_url} filename={filename} />;
  } else if (renderer === "Image" && original_download_url) {
    content = <ImageRenderer url={original_download_url} filename={filename} />;
  } else {
    content = (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Preview not available for {filename}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          This file format is not supported by the viewer.
        </Typography>
        {original_download_url && (
          <a href={original_download_url} download style={{ display: 'inline-block', marginTop: '16px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
            Download File
          </a>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ width, height, overflow: 'hidden', bgcolor: 'var(--color-slate-100)', borderRadius: 'var(--radius-lg)', border: 'var(--border-thin) solid var(--card-border)', display: 'flex', flexDirection: 'column' }}>
      {content}
    </Box>
  );
}
