import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

export default function ImageRenderer({ url, filename }) {
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: 'var(--color-white)', borderBottom: 'var(--border-thin) solid var(--color-slate-200)' }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--color-slate-700)', ml: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
          {filename || "Image Viewer"}
        </Typography>
        <IconButton size="small" component="a" href={url} download sx={{ color: 'var(--color-slate-500)' }}>
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Image Container */}
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, overflow: 'auto', bgcolor: 'var(--color-slate-100)' }}>
        <img 
          src={url} 
          alt={filename || "Document image"} 
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '4px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
          }}
        />
      </Box>
    </Box>
  );
}
