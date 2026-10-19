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

        const toolbarViewer = iframeDoc.getElementById('toolbarViewer');
        if (!toolbarViewer) return false;

        if (iframeDoc.getElementById('custom-injected-flag')) return true;

        const flag = iframeDoc.createElement('div');
        flag.id = 'custom-injected-flag';
        flag.style.display = 'none';
        iframeDoc.body.appendChild(flag);

        // Setup Download Original Button
        if (originalDownloadUrl && !iframeDoc.getElementById('custom-download-original')) {
          const btnContainer = iframeDoc.createElement('div');
          btnContainer.innerHTML = `
            <button id="custom-download-original" class="toolbarButton hiddenMediumView" title="Download Original File" tabindex="0" style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; margin: 0 2px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path><path d="M12 10v6"></path><path d="M9 13l3 3 3-3"></path></svg>
            </button>
          `;
          const btn = btnContainer.firstElementChild;
          const nativeDownload = iframeDoc.getElementById('download');
          if (nativeDownload) {
            nativeDownload.insertAdjacentElement('afterend', btn);
          } else {
            iframeDoc.getElementById('toolbarViewerRight').prepend(btn);
          }
          btn.addEventListener('click', () => {
            window.open(originalDownloadUrl, '_blank');
          });
        }

        // Inject Title
        if (filename) {
          if (!iframeDoc.getElementById('custom-pdf-title')) {
            const titleDiv = iframeDoc.createElement('div');
            titleDiv.id = 'custom-pdf-title';
            titleDiv.style.cssText = 'font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #111827; margin-left: 10px; margin-right: 4px; height: 28px; display: inline-flex; align-items: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px; float: right; padding-top: 2px;';
            titleDiv.innerHTML = `<span></span>`;
            iframeDoc.getElementById('toolbarViewerRight').appendChild(titleDiv);
          }
          iframeDoc.querySelector('#custom-pdf-title span').textContent = filename;
        }

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

        return true;
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
