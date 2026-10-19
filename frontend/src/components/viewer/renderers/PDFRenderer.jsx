import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import { 
  Download as DownloadIcon, 
  ZoomIn as ZoomInIcon, 
  ZoomOut as ZoomOutIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon
} from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set worker path to load pdf.js worker from CDN (important for next.js)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFRenderer({ url, filename }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return Math.min(Math.max(1, newPage), numPages || 1);
    });
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* PDF Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: 'var(--color-white)', borderBottom: 'var(--border-thin) solid var(--color-slate-200)' }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--color-slate-700)', ml: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '30%' }}>
          {filename || "PDF Viewer"}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={() => changePage(-1)} disabled={pageNumber <= 1}>
            <PrevIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" sx={{ color: 'var(--color-slate-600)' }}>
            {pageNumber} / {numPages || "-"}
          </Typography>
          <IconButton size="small" onClick={() => changePage(1)} disabled={pageNumber >= (numPages || 1)}>
            <NextIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" onClick={handleZoomOut} disabled={scale <= 0.5}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" sx={{ color: 'var(--color-slate-600)', minWidth: '40px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </Typography>
          <IconButton size="small" onClick={handleZoomIn} disabled={scale >= 3.0}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
          
          <Box sx={{ width: '1px', height: '20px', bgcolor: 'var(--color-slate-300)', mx: 1 }} />
          
          <IconButton size="small" component="a" href={url} download sx={{ color: 'var(--color-slate-500)' }}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* PDF Document Container */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'var(--color-slate-200)', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 4 }}>
              <CircularProgress size={24} />
              <Typography sx={{ color: 'var(--color-slate-600)' }}>Loading PDF...</Typography>
            </Box>
          }
          error={
            <Typography color="error" sx={{ p: 4, bgcolor: 'white', borderRadius: 1 }}>
              Failed to load PDF. The file might be corrupted or inaccessible.
            </Typography>
          }
        >
          <Box sx={{ boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', mb: 2 }}>
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={<CircularProgress size={24} sx={{ m: 10 }} />}
            />
          </Box>
        </Document>
      </Box>
    </Box>
  );
}
