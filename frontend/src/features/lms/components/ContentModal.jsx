"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography, Box, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { apiClient } from '../../../lib/apiClient';
import TarangVideoPlayer from '../../../components/viewer/TarangVideoPlayer';

export default function ContentModal({ open, onClose, item, language }) {
  const [signedUrl, setSignedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchSignedUrl = async () => {
      if (!item || !item.url) return;
      
      // If it's an external link, already signed, or in a public processed bucket, just use it directly
      const isPublicStream = item.url?.includes('tarang-media-processed') ||
                             item.url?.includes('tarang-docs-processed') ||
                             item.url?.includes('.mpd') ||
                             item.url?.includes('.m3u8');

      if (['link', 'article'].includes(item.type) || !item.url?.includes('tarang-') || isPublicStream) {
        setSignedUrl(item.url);
        return;
      }

      setLoading(true);
      setError('');
      try {
        // Strip any existing query parameters from the URL
        const baseUrl = item.url.split('?')[0];
        const response = await apiClient.get('/s3/get', { params: { url: baseUrl } });

        if (isMounted && response.data?.signed_url) {
          setSignedUrl(response.data.signed_url);
        }
      } catch (err) {
        console.error("Error signing URL for content:", err);
        if (isMounted) {
          setError(language === 'en' ? 'Failed to load content' : 'सामग्री लोड करने में विफल');
          setSignedUrl(item.url); // fallback
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (open && item) {
      fetchSignedUrl();
    }

    return () => {
      isMounted = false;
      setSignedUrl('');
      setError('');
    };
  }, [open, item, language]);

  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>{item.title}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', minHeight: 400, bgcolor: 'var(--color-slate-50)' }}>
        {loading ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'error.main' }}>
            {error}
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            {item.type === 'video' && (
              <Box sx={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', position: 'relative' }}>
                <TarangVideoPlayer 
                  url={signedUrl} 
                  poster={item.thumbnail}
                />
              </Box>
            )}
            {item.type === 'audio' && (
              <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <audio controls src={signedUrl} style={{ width: '100%' }} />
              </Box>
            )}
            {item.type === 'document' && (
              <iframe 
                src={signedUrl} 
                style={{ width: '100%', height: '600px', border: 'none' }}
                title={item.title}
              />
            )}
            {['link', 'article', 'lab', 'quiz', 'assignment'].includes(item.type) && (
              <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 2 }}>
                <Typography>{language === 'en' ? 'Click below to open in a new tab' : 'नए टैब में खोलने के लिए नीचे क्लिक करें'}</Typography>
                <Button variant="contained" href={signedUrl} target="_blank" rel="noopener noreferrer">
                  {language === 'en' ? 'Open Content' : 'सामग्री खोलें'}
                </Button>
              </Box>
            )}
            {item.description && (
              <Box sx={{ p: 3, bgcolor: '#fff', borderTop: '1px solid var(--card-border)' }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'var(--color-slate-700)' }}>
                  {item.description}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
