import React from 'react';
import { Box } from '@mui/material';
import PdfViewerComponent from '../PdfViewerComponent';

export default function PDFRenderer({ url, filename }) {
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PdfViewerComponent 
        downloadUrl={url} 
        filename={filename || "Document"} 
        originalDownloadUrl={url} 
      />
    </Box>
  );
}
