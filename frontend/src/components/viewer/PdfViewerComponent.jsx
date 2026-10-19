"use client";

import React, { useRef, useEffect } from "react";
import { Box } from "@mui/material";

export default function PdfViewerComponent({ downloadUrl, filename, originalDownloadUrl }) {
  const iframeRef = useRef(null);

  // Use the official PDF.js viewer we downloaded into the public folder
  const viewerUrl = `/pdfjs/web/viewer.html?v=${Date.now()}&file=${encodeURIComponent(downloadUrl)}#page=1&zoom=page-width`;

  // Clear PDF.js history synchronously so the iframe doesn't read it before useEffect runs
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem('pdfjs.history');
    } catch (e) { }
  }

  useEffect(() => {
    let intervalId;

    const syncCustomUI = () => {
      try {
        const iframeDoc = iframeRef.current?.contentWindow?.document;
        if (!iframeDoc) return false;

        const titleEl = iframeDoc.querySelector('#custom-pdf-title span');
        const downloadBtn = iframeDoc.getElementById('custom-download-original');
        
        // Wait until PDF.js has actually rendered its toolbar
        if (!titleEl || !downloadBtn) return false;

        // Ensure we don't inject multiple times
        if (iframeDoc.getElementById('custom-injected-flag')) return true;

        // Set a flag so we know it's injected
        const flag = iframeDoc.createElement('div');
        flag.id = 'custom-injected-flag';
        flag.style.display = 'none';
        iframeDoc.body.appendChild(flag);

        // Inject Title
        if (filename) {
          titleEl.textContent = filename;
        }

        // Setup Download Original Button
        if (originalDownloadUrl) {
          downloadBtn.style.display = 'inline-block';
          downloadBtn.addEventListener('click', () => {
            window.open(originalDownloadUrl, '_blank');
          });
        }

        // Force scroll to top on first load, wait for pages to load
        const forceScrollTop = setInterval(() => {
          try {
            const app = iframeRef.current?.contentWindow?.PDFViewerApplication;
            if (app && app.pdfViewer && app.pdfViewer.pagesCount > 0) {
              if (!iframeDoc.getElementById('custom-forced-top')) {
                const marker = iframeDoc.createElement('div');
                marker.id = 'custom-forced-top';
                marker.style.display = 'none';
                iframeDoc.body.appendChild(marker);

                app.pdfViewer.currentPageNumber = 1;
                setTimeout(() => {
                  if (app.pdfViewer.container) {
                    app.pdfViewer.container.scrollTop = 0;
                  }
                }, 50);
              }
              clearInterval(forceScrollTop);
            }
          } catch (e) { }
        }, 100);

        return true; // Success
      } catch (err) {
        console.warn("Injection error:", err);
        return false;
      }
    };

    // Poll every 100ms until successful or 5 seconds pass
    let attempts = 0;
    intervalId = setInterval(() => {
      attempts++;
      if (syncCustomUI() || attempts > 50) {
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [filename, originalDownloadUrl]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', position: 'relative' }}>
      <iframe
        ref={iframeRef}
        src={viewerUrl}
        width="100%"
        height="100%"
        style={{
          border: 'none',
          flexGrow: 1
        }}
        title="PDF Viewer"
      />
    </Box>
  );
}
