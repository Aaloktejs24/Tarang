import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function AutoSaveIndicator({ status, appId }) {
  if (!status || status === 'error') {
    return <Box sx={{ px: 2, color: 'red' }}>Status: {status || 'none'}, AppId: {appId || 'null'}</Box>;
  }

  return (
    <>
      <Box sx={{ display: 'none' }}>Debug: Status={status}, AppId={appId || 'null'}</Box>
      {status === 'saving' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.75 }}>
          <CircularProgress size={14} sx={{ color: 'var(--color-slate-500)' }} />
          <Typography variant="caption" sx={{ color: 'var(--color-slate-500)', fontWeight: 'var(--font-semibold)' }}>Saving...</Typography>
        </Box>
      )}
      {(status === 'saved' || status === 'idle') && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.75 }}>
          <CloudUploadIcon sx={{ fontSize: 16, color: 'var(--color-success)' }} />
          <Typography variant="caption" sx={{ color: 'var(--color-success)', fontWeight: 'var(--font-semibold)' }}>Saved to Drafts</Typography>
        </Box>
      )}
    </>
  );
}
