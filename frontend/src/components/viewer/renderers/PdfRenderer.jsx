import React from 'react';
import { Box } from '@mui/material';
import PdfViewer from '../PdfViewer';

export default function PdfRenderer({ url, filename }) {
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PdfViewer 
        downloadUrl={url} 
        filename={filename || "Document"} 
        originalDownloadUrl={url} 
      />
    </Box>
  );
}

export { PdfRenderer as PDFRenderer };

