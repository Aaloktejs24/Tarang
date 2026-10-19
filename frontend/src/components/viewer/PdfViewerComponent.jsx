"use client";

import React, { useRef, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Loader from "../common/Loader";

export default function PdfViewerComponent({ downloadUrl, filename, originalDownloadUrl }) {
  const iframeRef = useRef(null);
  const [isUiInjected, setIsUiInjected] = useState(false);
  const [isUiReady, setIsUiReady] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Pre-check: verify the proxy can actually serve the file before loading the iframe.
  // This catches stale/deleted MinIO URLs and shows a clean error instead of an infinite loader.
  useEffect(() => {
    if (!downloadUrl) return;
    setLoadError(null);
    setIsUiInjected(false);
    setIsUiReady(false);

    const proxyCheckUrl = `/api/proxy/file.pdf?url=${encodeURIComponent(downloadUrl)}`;
    const controller = new AbortController();

    fetch(proxyCheckUrl, { method: 'HEAD', signal: controller.signal, cache: 'no-store' })
      .then(res => {
        if (!res.ok) {
          setLoadError(
            res.status === 404
              ? 'Document not found. The file may have been deleted or re-uploaded.'
              : `Failed to load document (${res.status} ${res.statusText}).`
          );
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setLoadError('Could not reach the document server. Please try again.');
        }
      });

    return () => controller.abort();
  }, [downloadUrl]);

  useEffect(() => {
    if (isUiInjected) {
      const timer = setTimeout(() => {
        setIsUiReady(true);
      }, 2000); // Give PDF.js extra time to render the pages
      return () => clearTimeout(timer);
    } else {
      setIsUiReady(false);
    }
  }, [isUiInjected]);

  // Use proxy to avoid CORS issues with MinIO / external URLs. 
  // We use /file.pdf so that PDF.js viewer.html doesn't reject the URL for not ending in .pdf
  const proxyUrl = `/api/proxy/file.pdf?url=${encodeURIComponent(downloadUrl)}`;
  const viewerUrl = `/pdfjs/web/viewer.html?file=${encodeURIComponent(proxyUrl)}#page=1&zoom=page-width`;

  // Clear PDF.js history synchronously so the iframe doesn't read it before useEffect runs
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem('pdfjs.history');
    } catch (e) { }
  }

  const focusIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.focus();
      if (iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.focus();
      }
    }
  };

  useEffect(() => {
    let intervalId;

    // Reset UI injected state when iframe reloads due to URL change
    setIsUiInjected(false);

    const injectCustomUI = () => {
      try {
        const iframeDoc = iframeRef.current?.contentWindow?.document;
        if (!iframeDoc) return false;

        const toolbarRight = iframeDoc.getElementById('toolbarViewerRight');
        const toolbarContainer = iframeDoc.getElementById('toolbarViewer');

        // Wait until PDF.js has actually rendered its toolbar
        if (!toolbarRight || !toolbarContainer) return false;

        // Ensure we don't inject multiple times
        if (iframeDoc.getElementById('custom-injected-flag')) return true;

        // Set a flag so we know it's injected
        const flag = iframeDoc.createElement('div');
        flag.id = 'custom-injected-flag';
        flag.style.display = 'none';
        iframeDoc.body.appendChild(flag);

        // 1. Move "Find" button to Top Right Toolbar
        const viewFindBtn = iframeDoc.getElementById('viewFind');
        const printBtn = iframeDoc.getElementById('print');
        if (viewFindBtn && printBtn) {
          printBtn.parentNode.insertBefore(viewFindBtn, printBtn);
        } else if (viewFindBtn) {
          toolbarRight.prepend(viewFindBtn);
        }

        // 1.5 Inject "Download Original" Button (Icon Only)
        if (originalDownloadUrl && !iframeDoc.getElementById('custom-download-original')) {
          const btnContainer = iframeDoc.createElement('div');
          btnContainer.innerHTML = `
            <button id="custom-download-original" class="toolbarButton" title="Download Original File" tabindex="0">
              <span data-l10n-id="download_original_label">Original File</span>
            </button>
          `;

          const btn = btnContainer.firstElementChild;
          // Place it right before the native download button
          const nativeDownload = iframeDoc.getElementById('download');
          if (nativeDownload) {
            nativeDownload.parentNode.insertBefore(btn, nativeDownload);
          } else {
            toolbarRight.prepend(btn);
          }

          btn.addEventListener('click', async () => {
            try {
              // Show loading state on button
              const originalHtml = btn.innerHTML;
              btn.innerHTML = '<span style="font-size: 12px; padding: 0 4px;">Downloading...</span>';
              btn.style.opacity = '0.5';
              btn.style.pointerEvents = 'none';

              // Fetch the file as a blob to force a download instead of opening a new tab
              const response = await fetch(originalDownloadUrl);
              if (!response.ok) throw new Error('Network response was not ok');
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);

              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = url;
              a.download = filename || 'downloaded_file.pdf';
              document.body.appendChild(a);
              a.click();

              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);

              // Restore button state
              btn.innerHTML = originalHtml;
              btn.style.opacity = '1';
              btn.style.pointerEvents = 'auto';
            } catch (error) {
              console.error('Download failed, falling back to new tab:', error);
              // Fallback if fetch fails (e.g., CORS)
              window.open(originalDownloadUrl, '_blank');
              btn.innerHTML = '<span data-l10n-id="download_original_label">Original File</span>';
              btn.style.opacity = '1';
              btn.style.pointerEvents = 'auto';
            }
          });
        }

        // 2. Swap Zoom Controls and Title & Create Custom Zoom
        const toolbarLeft = iframeDoc.getElementById('toolbarViewerLeft');
        const toolbarMiddle = iframeDoc.getElementById('toolbarViewerMiddle');

        if (toolbarLeft && toolbarMiddle) {
          // Custom Zoom Controls to the left side
          if (!iframeDoc.getElementById('custom-zoom-controls')) {
            const separator = iframeDoc.createElement('div');
            separator.className = 'verticalToolbarSeparator hiddenSmallView';
            separator.style.margin = '0 8px';
            // Move all zoom controls from middle to left only once
            if (!iframeDoc.getElementById('custom-controls-moved')) {
              const marker = iframeDoc.createElement('div');
              marker.id = 'custom-controls-moved';
              marker.style.display = 'none';
              toolbarLeft.appendChild(marker);

              // Prepend Tarang Logo
              const logo = iframeDoc.createElement('img');
              logo.src = '/logo.svg';
              logo.alt = 'Tarang Logo';
              logo.style.height = '24px';
              logo.style.marginLeft = '0px';
              logo.style.marginRight = '8px';
              logo.style.cursor = 'pointer';
              logo.style.verticalAlign = 'middle';
              toolbarLeft.insertBefore(logo, toolbarLeft.firstChild);

              while (toolbarMiddle.firstChild) {
                toolbarLeft.appendChild(toolbarMiddle.firstChild);
              }
            }

            // Inject Custom Dropdown into native scaleSelectContainer
            const scaleContainer = iframeDoc.getElementById('scaleSelectContainer');
            if (scaleContainer && !iframeDoc.getElementById('customZoomTrigger')) {
              // Custom trigger that perfectly mimics the native select's sizing and text position
              const trigger = iframeDoc.createElement('div');
              trigger.id = 'customZoomTrigger';
              trigger.style.cssText = 'width: 100%; height: 100%; cursor: pointer; display: block; padding: 4px 6px 0; line-height: var(--line-height-base); font-family: Inter, sans-serif; font-size: 12px; color: #4B5563; user-select: none; box-sizing: border-box;';
              trigger.innerHTML = '<span id="customZoomText">100%</span>';

              // Custom Dropdown Menu (Appended to body to avoid overflow clipping)
              const menu = iframeDoc.createElement('div');
              menu.id = 'customZoomMenu';
              menu.style.cssText = 'display: none; position: fixed; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 4px; flex-direction: column; min-width: 120px; z-index: 99999; overflow: hidden; padding: 4px 0; font-family: Inter, sans-serif; font-size: 13px; color: #4B5563; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);';
              menu.innerHTML = `
                <div class="zoom-option" data-value="page-actual" style="padding: 6px 12px; cursor: pointer;">Actual Size</div>
                <div class="zoom-option" data-value="page-fit" style="padding: 6px 12px; cursor: pointer;">Page Fit</div>
                <div class="zoom-option" data-value="page-width" style="padding: 6px 12px; cursor: pointer;">Page Width</div>
                <div style="height: 1px; background: #E5E7EB; margin: 4px 0;"></div>
                <div class="zoom-option" data-value="0.5" style="padding: 6px 12px; cursor: pointer;">50%</div>
                <div class="zoom-option" data-value="0.75" style="padding: 6px 12px; cursor: pointer;">75%</div>
                <div class="zoom-option" data-value="1" style="padding: 6px 12px; cursor: pointer;">100%</div>
                <div class="zoom-option" data-value="1.25" style="padding: 6px 12px; cursor: pointer;">125%</div>
                <div class="zoom-option" data-value="1.5" style="padding: 6px 12px; cursor: pointer;">150%</div>
                <div class="zoom-option" data-value="2" style="padding: 6px 12px; cursor: pointer;">200%</div>
              `;

              const style = iframeDoc.createElement('style');
              style.innerHTML = `
                #scaleSelect { display: none !important; }
                #scaleSelectContainer { 
                  background-color: #F3F4F6 !important; 
                  border: 1px solid #E5E7EB !important; 
                  border-radius: 2px !important;
                  height: 26px !important;
                  width: 75px !important;
                  padding: 0 !important;
                  position: relative !important;
                  cursor: pointer !important;
                }
                #scaleSelectContainer::after {
                  content: '';
                  position: absolute;
                  right: 8px;
                  top: 50%;
                  transform: translateY(-50%);
                  width: 10px;
                  height: 10px;
                  background-color: #4B5563;
                  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
                  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
                  -webkit-mask-size: contain;
                  mask-size: contain;
                  -webkit-mask-repeat: no-repeat;
                  mask-repeat: no-repeat;
                  pointer-events: none;
                }
                #scaleSelectContainer:hover { background-color: #E5E7EB !important; }
                .zoom-option:hover { background-color: #F3F4F6 !important; }
              `;
              scaleContainer.appendChild(style);
              scaleContainer.appendChild(trigger);
              iframeDoc.body.appendChild(menu);

              // Toggle logic
              trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                if (menu.style.display === 'none') {
                  const rect = trigger.getBoundingClientRect();
                  menu.style.left = rect.left + 'px';
                  // Position above the trigger since it's in the bottom toolbar
                  menu.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
                  menu.style.display = 'flex';
                } else {
                  menu.style.display = 'none';
                }
              });
              // Close when clicking outside
              iframeDoc.addEventListener('click', () => {
                menu.style.display = 'none';
              });

              // Select option logic
              const options = menu.querySelectorAll('.zoom-option');
              options.forEach(opt => {
                opt.addEventListener('click', (e) => {
                  e.stopPropagation();
                  const value = e.target.getAttribute('data-value');
                  const nativeSelect = iframeDoc.getElementById('scaleSelect');
                  if (nativeSelect) {
                    nativeSelect.value = value;
                    nativeSelect.dispatchEvent(new Event('change'));
                  }
                  menu.style.display = 'none';
                });
              });
            }

            // Sync zoom percentage live and force scroll to top on first load
            setInterval(() => {
              try {
                const app = iframeRef.current?.contentWindow?.PDFViewerApplication;
                if (app && app.pdfViewer) {
                  const scale = Math.round(app.pdfViewer.currentScale * 100);
                  const textSpan = iframeDoc.getElementById('customZoomText');
                  if (textSpan) textSpan.innerText = `${scale}%`;

                  // Force sidebar closed cleanly so PDF.js centers the page
                  if (app.pdfSidebar && app.pdfSidebar.isOpen) {
                    app.pdfSidebar.close();
                  }

                  // Ensure it starts at the top
                  if (!iframeDoc.getElementById('scroll-fixed')) {
                    const marker = iframeDoc.createElement('div');
                    marker.id = 'scroll-fixed';
                    marker.style.display = 'none';
                    iframeDoc.body.appendChild(marker);

                    const forceScroll = () => {
                      const viewerContainer = iframeDoc.getElementById('viewerContainer');
                      if (viewerContainer) viewerContainer.scrollTop = 0;
                    };

                    // Run immediately, and also after PDF.js has finished resizing from sidebar close
                    forceScroll();
                    setTimeout(forceScroll, 100);
                    setTimeout(forceScroll, 300);
                    setTimeout(forceScroll, 800);
                  }
                }
              } catch (err) { }
            }, 100);
          }

          // Inject Title into the perfectly centered middle container
          let titleDiv = iframeDoc.getElementById('custom-pdf-title');
          if (!titleDiv) {
            titleDiv = iframeDoc.createElement('div');
            titleDiv.id = 'custom-pdf-title';
            titleDiv.style.minWidth = '0';
            // Append title to the left toolbar
            const toolbarLeft = iframeDoc.getElementById('toolbarViewerLeft');
            if (toolbarLeft) toolbarLeft.appendChild(titleDiv);
          }
          titleDiv.innerHTML = `
            <div style="display: flex; align-items: center; height: 32px; padding: 0 4px; min-width: 0;">
              <span style="font-family: Inter, sans-serif; font-size: 14px; font-weight: 500; color: #4B5563; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">
                ${filename || 'Document'}
              </span>
            </div>
          `;
        }

        // 2.2 Immersive mode (Google Drive style) on mobile
        const viewerContainer = iframeDoc.getElementById('viewerContainer');
        if (viewerContainer && !iframeDoc.getElementById('immersive-mode-listener')) {
          const listenerMarker = iframeDoc.createElement('div');
          listenerMarker.id = 'immersive-mode-listener';
          listenerMarker.style.display = 'none';
          iframeDoc.body.appendChild(listenerMarker);

          let pointerStartX = 0;
          let pointerStartY = 0;
          let isPointerDown = false;

          viewerContainer.addEventListener('pointerdown', (e) => {
            // Only care about primary pointer (left click or single touch)
            if (e.isPrimary) {
              isPointerDown = true;
              pointerStartX = e.clientX;
              pointerStartY = e.clientY;
            }
          });

          let lastToggleTime = 0;

          viewerContainer.addEventListener('pointerup', (e) => {
            if (isPointerDown && e.isPrimary) {
              isPointerDown = false;
              const deltaX = Math.abs(e.clientX - pointerStartX);
              const deltaY = Math.abs(e.clientY - pointerStartY);

              // If movement is less than 10 pixels, consider it a tap/click
              if (deltaX < 10 && deltaY < 10) {
                // Ignore clicks on links or interactive elements
                const tag = e.target.tagName.toLowerCase();
                if (tag === 'a' || tag === 'input' || tag === 'button' || tag === 'select' || e.target.closest('button')) return;

                const now = Date.now();
                if (now - lastToggleTime > 300) {
                  iframeDoc.body.classList.toggle('immersive-mode');
                  lastToggleTime = now;
                }
              }
            }
          });

          // Also keep the click listener as a fallback for some environments, but prevent double-toggling
          viewerContainer.addEventListener('click', (e) => {
            const now = Date.now();
            if (now - lastToggleTime < 300) return; // Prevent double trigger with pointerup

            const tag = e.target.tagName.toLowerCase();
            if (tag === 'a' || tag === 'input' || tag === 'button' || tag === 'select' || e.target.closest('button')) return;

            iframeDoc.body.classList.toggle('immersive-mode');
            lastToggleTime = now;
          });

          // Close Findbar on outside click
          viewerContainer.addEventListener('click', (e) => {
            const findbar = iframeDoc.getElementById('findbar');
            const viewFindBtn = iframeDoc.getElementById('viewFind');
            if (findbar && !findbar.classList.contains('hidden')) {
              if (!findbar.contains(e.target) && (!viewFindBtn || !viewFindBtn.contains(e.target))) {
                // Simulate click on the search button so PDF.js natively handles removing the active state
                if (viewFindBtn) {
                  viewFindBtn.click();
                } else {
                  findbar.classList.add('hidden');
                }
              }
            }
          });

          // Make sure Findbar and Secondary Toolbar don't open together
          const secondaryToggle = iframeDoc.getElementById('secondaryToolbarToggle');
          if (viewFindBtn && secondaryToggle) {
            viewFindBtn.addEventListener('click', () => {
              const secondaryToolbar = iframeDoc.getElementById('secondaryToolbar');
              if (secondaryToolbar && !secondaryToolbar.classList.contains('hidden')) {
                secondaryToggle.click();
              }
            });

            secondaryToggle.addEventListener('click', () => {
              const findbar = iframeDoc.getElementById('findbar');
              if (findbar && !findbar.classList.contains('hidden')) {
                viewFindBtn.click();
              }
            });
          }
        }

        // 2.5 Move specific tools based on screen size (Responsive)
        if (!iframeDoc.getElementById('custom-tools-moved')) {
          const marker = iframeDoc.createElement('div');
          marker.id = 'custom-tools-moved';
          marker.style.display = 'none';
          iframeDoc.body.appendChild(marker);

          // Create a container for tools that move to the bottom on mobile
          // On desktop, this container will sit inside the top right toolbar!
          const responsiveToolbar = iframeDoc.createElement('div');
          responsiveToolbar.id = 'custom-bottom-toolbar';

          // Always append directly to body so it doesn't get trapped by #toolbarContainer's CSS transform
          iframeDoc.body.appendChild(responsiveToolbar);

          const toolsToMove = [
            'previous', 'pageNumber', 'numPages', 'zoomOut', 'scaleSelectContainer'
          ];

          toolsToMove.forEach(id => {
            let el = iframeDoc.getElementById(id);
            if (el) {
              if (id === 'previous' || id === 'zoomOut') {
                if (el.parentElement && el.parentElement.classList.contains('splitToolbarButton')) {
                  el = el.parentElement;
                }
              }
              if (el.classList.contains('secondaryToolbarButton')) {
                el.className = el.className.replace('secondaryToolbarButton', 'toolbarButton');
              }
              responsiveToolbar.appendChild(el);
            }
          });

          // Always clone presentationMode and other useful tools to top right toolbar (so they remain in secondary menu on mobile)
          const insertBeforeTarget = iframeDoc.getElementById('secondaryToolbarToggle');
          if (toolbarRight && insertBeforeTarget) {
            const toolsToMoveToTopRight = [
              'presentationMode', 'firstPage', 'lastPage', 'pageRotateCw', 'pageRotateCcw'
            ];
            toolsToMoveToTopRight.forEach(id => {
              const originalBtn = iframeDoc.getElementById(id);
              if (originalBtn && originalBtn.parentElement && originalBtn.parentElement.id === 'secondaryToolbarButtonContainer') {
                // Clone the button for the main toolbar
                const clone = originalBtn.cloneNode(true);
                clone.id = id + 'Clone';
                clone.className = clone.className.replace('secondaryToolbarButton', 'toolbarButton');
                clone.classList.add('hide-on-mobile');

                // Route clicks to original
                clone.addEventListener('click', (e) => {
                  e.preventDefault();
                  originalBtn.click();
                });

                // Sync state (like 'disabled') from original to clone
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes') {
                      const attrName = mutation.attributeName;
                      if (originalBtn.hasAttribute(attrName)) {
                        clone.setAttribute(attrName, originalBtn.getAttribute(attrName));
                      } else {
                        clone.removeAttribute(attrName);
                      }
                      // Re-apply our custom classes if class changes
                      if (attrName === 'class') {
                        clone.className = originalBtn.className.replace('secondaryToolbarButton', 'toolbarButton');
                        clone.classList.add('hide-on-mobile');
                      }
                    }
                  });
                });
                observer.observe(originalBtn, { attributes: true });

                toolbarRight.insertBefore(clone, insertBeforeTarget);
              }
            });
          }

          // Ensure native print, download, zoom dropdown, and pagination are never hidden by PDF.js responsive CSS
          ['print', 'download', 'scaleSelectContainer'].forEach(id => {
            const btn = iframeDoc.getElementById(id);
            if (btn) {
              btn.classList.remove('hiddenMediumView', 'hiddenSmallView');
            }
          });
          const prevBtn = iframeDoc.getElementById('previous');
          if (prevBtn && prevBtn.parentElement) {
            prevBtn.parentElement.classList.remove('hiddenSmallView', 'hiddenMediumView');
          }

          // Enable 'Highlight All' by default in the search findbar
          const highlightAllCb = iframeDoc.getElementById('findHighlightAll');
          if (highlightAllCb && !highlightAllCb.checked) {
            highlightAllCb.checked = true;
            highlightAllCb.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }

        // 3. Customize PDF.js toolbar background
        let style = iframeDoc.getElementById('custom-pdf-style');
        if (!style) {
          style = iframeDoc.createElement('style');
          style.id = 'custom-pdf-style';
          iframeDoc.head.appendChild(style);
        }
        style.innerHTML = `
            :root {
              --main-color: #4B5563 !important;
              --body-bg-color: #F3F4F6 !important;
              --sidebar-narrow-bg-color: #F3F4F6 !important;
              --sidebar-toolbar-bg-color: #FFFFFF !important;
              --toggled-btn-bg-color: #E5E7EB !important;
              --separator-color: #D1D5DB !important;
              --toolbar-border-color: #D1D5DB !important;
              --page-margin: 0px !important;
              --pdfViewer-padding-bottom: 0px !important;
            }
            
            /* Remove shadows from dropdown and options */
            .dropdownToolbarButton,
            .dropdownToolbarButton > select,
            .dropdownToolbarButton > select > option,
            #scaleSelect,
            #scaleSelect option {
              box-shadow: none !important;
              filter: none !important;
            }
            
            /* Hide sidebar toggles for a clean UI */
            #sidebarToggle,
            #sidebarResizer {
              display: none !important;
            }
            
            @keyframes pillFadeIn {
              from { opacity: 0; transform: translateX(-50%) translateY(20px); }
              to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }

            /* Bottom Toolbar Universal Base Styles (Floating Pill for all screens) */
            #custom-bottom-toolbar {
              position: fixed;
              z-index: 10000;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              transition: transform 0.3s ease, opacity 0.3s ease !important;
              bottom: 24px;
              left: 50%;
              transform: translateX(-50%);
              padding: 4px 16px;
              height: 40px;
              border-radius: 24px;
              
              /* Tarang Theme Glassy Card */
              background: var(--glass-bg) !important;
              background-color: var(--glass-bg) !important;
              backdrop-filter: blur(30px) !important;
              -webkit-backdrop-filter: blur(30px) !important;
              border: 1px solid rgba(30, 79, 163, 0.2) !important;
              
              box-shadow: none !important;
              
              opacity: 0;
              animation: pillFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 2s forwards !important;
              
              overflow-x: auto;
              white-space: nowrap;
              -ms-overflow-style: none; 
              scrollbar-width: none;
            }
            #custom-bottom-toolbar::-webkit-scrollbar {
              display: none;
            }
            #custom-bottom-toolbar .toolbarButton {
              position: relative !important;
            }
            #custom-bottom-toolbar > * {
              margin: 0 !important;
              align-self: center !important;
            }

            /* Adjust viewerContainer to take full height since toolbar floats over it */
            #viewerContainer {
              bottom: 0 !important;
            }

            /* Mobile styling overrides */
            @media (max-width: 768px) {
              #sidebarToggle {
                display: none !important;
              }
            }

            /* Immersive Mode (Fade in/out) — works on ALL screen sizes */
            #toolbarContainer, #viewerContainer {
              transition: inset-block-start 0.3s ease, top 0.3s ease, bottom 0.3s ease, opacity 0.3s ease !important;
            }
            body.immersive-mode #toolbarContainer,
            body.immersive-mode .toolbar {
              opacity: 0 !important;
              pointer-events: none !important;
            }
            body.immersive-mode #custom-bottom-toolbar {
              opacity: 0 !important;
              pointer-events: none !important;
            }
            body.immersive-mode #viewerContainer {
              inset-block-start: 0 !important;
              top: 0 !important;
              bottom: 0 !important;
            }
            
            #custom-download-original {
              margin: 0 4px !important;
            }
            
            /* Adjust Top Toolbar Height universally and remove native bottom border/shadow */
            #toolbarContainer, .toolbar {
              height: 48px !important; 
              box-shadow: none !important;
              background: linear-gradient(135deg, rgba(0, 86, 179, 0.15) 0%, rgba(40, 167, 69, 0.15) 100%) !important;
              background-color: var(--glass-bg) !important;
              backdrop-filter: blur(16px) !important;
              -webkit-backdrop-filter: blur(16px) !important;
              border-bottom: 2px solid transparent !important;
              border-image: linear-gradient(90deg, #0056b3 0%, #28a745 50%, #ffc107 100%) 1 !important;
            }
            #toolbarViewer {
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              height: 48px !important;
              width: 100% !important;
              padding: 0 8px !important;
              box-sizing: border-box !important;
            }
            
            /* Make room for taller top toolbar universally */
            #viewerContainer,
            #sidebarContainer,
            #sidebarContent {
              top: 48px !important; 
              inset-block-start: 48px !important;
            }
            
            /* Apply Transparent Background so Tarang GlobalBackground shows through */
            body, #viewerContainer, #outerContainer {
              background: transparent !important;
              background-color: transparent !important;
            }
            
            /* Force sidebar background to white and prevent UI text highlighting */
            #sidebarContainer,
            #sidebarContent {
              background-color: #FFFFFF !important;
            }
            #sidebarContainer,
            #toolbarContainer {
              -webkit-user-select: none !important;
              user-select: none !important;
            }
            
            /* Prevent any text selection in the entire PDF viewer while actively resizing the sidebar */
            #outerContainer.sidebarResizing * {
              -webkit-user-select: none !important;
              user-select: none !important;
            }
            
            /* Let PDF.js handle left/right centering to prevent right-side overflow */
            .pdfViewer {
              padding: 0 !important;
            }
            .pdfViewer .page {
              border: 1px solid rgba(0, 0, 0, 0.15) !important;
              border-image: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              margin: 12px auto !important;
              overflow: hidden !important;
            }
            
            /* Make thumbnails fully responsive to sidebar width */
            #thumbnailView {
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              width: 100% !important;
              padding: 16px 0 !important;
              box-sizing: border-box !important;
            }
            #thumbnailView > a {
              display: flex !important;
              justify-content: center !important;
              width: 100% !important;
              -webkit-user-drag: none !important;
              user-drag: none !important;
            }
            .thumbnail {
              width: calc(100% - 32px) !important;
              height: auto !important;
              float: none !important;
              margin: 0 0 16px 0 !important;
              box-sizing: border-box !important;
            }
            .thumbnailImage {
              width: 100% !important;
              height: auto !important;
              border: 1px solid rgba(0, 0, 0, 0.25) !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              display: block !important;
              -webkit-user-drag: none !important;
              user-drag: none !important;
            }
            
            /* Make sidebar toolbar match main toolbar height and padding */
            #toolbarSidebar {
              height: 48px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              padding: 0 8px !important;
              box-sizing: border-box !important;
            }
            #toolbarSidebarLeft,
            #toolbarSidebarRight {
              display: flex !important;
              align-items: center !important;
              height: 100% !important;
            }
            
            /* Restore flexbox layout for top toolbar and hide Middle since title is on Left */
            #toolbarViewer {
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              height: 100% !important;
              width: 100% !important;
            }
            
            /* Force native PDF.js responsive hidden tools to display on mobile */
            #scaleSelectContainer,
            .hiddenLargeView,
            .hiddenMediumView,
            .hiddenSmallView {
              display: flex !important;
            }

            /* Hide inconsistent native spacers/separators (must be after to override) */
            .toolbarButtonSpacer,
            .verticalToolbarSeparator {
              display: none !important;
            }

            /* Remove background colors on hover and when toggled (active) for all tools */
            .toolbarButton:hover, .toolbarButton:focus, .toolbarButton.toggled,
            .secondaryToolbarButton:hover, .secondaryToolbarButton:focus, .secondaryToolbarButton.toggled,
            .dropdownToolbarButton:hover, .dropdownToolbarButton:focus, .dropdownToolbarButton.toggled {
              background-color: transparent !important;
              box-shadow: none !important;
            }

            #toolbarViewerLeft, #toolbarViewerRight {
              display: flex !important;
              align-items: center !important;
              height: 100% !important;
              position: static !important;
              transform: none !important;
              float: none !important;
              gap: 8px !important;
            }
            
            /* Reset native margins for consistent gap spacing */
            #toolbarViewerLeft > *, 
            #toolbarViewerRight > *,
            #custom-bottom-toolbar > * {
              margin: 0 !important;
            }
            
            #toolbarViewerMiddle {
              display: none !important;
            }
            
            #toolbarViewerLeft {
              flex: 1 !important;
              justify-content: flex-start !important;
              padding-left: 12px !important;
              min-width: 0 !important;
            }
            
            #toolbarViewerRight {
              display: flex !important;
              align-items: center !important;
              justify-content: flex-end !important;
              padding-right: 4px !important;
              flex: 0 0 auto !important;
            }
            
            /* Fix split buttons stacking vertically in flex container */
            .splitToolbarButton {
              display: flex !important;
              align-items: center !important;
              margin: 0 !important;
            }
            .splitToolbarButton > .toolbarButton {
              float: none !important;
              position: relative !important;
            }
            
            /* Prevent 'of 2' from wrapping vertically */
            #numPages {
              white-space: nowrap !important;
              margin: 0 4px !important;
            }
            
            /* Hide scrollbars universally (scroll pipe) */
            #viewerContainer::-webkit-scrollbar,
            #sidebarContent::-webkit-scrollbar,
            #thumbnailView::-webkit-scrollbar,
            #custom-bottom-toolbar::-webkit-scrollbar {
              display: none !important;
            }
            #viewerContainer,
            #sidebarContent,
            #thumbnailView,
            #custom-bottom-toolbar {
              -ms-overflow-style: none !important;
              scrollbar-width: none !important;
            }
            
            /* Fix dropdown chevron flying out because it lost position: relative when moved */
            .dropdownToolbarButton {
              position: relative !important;
            }
            
            #toolbarContainer, .secondaryToolbar, .editorParamsToolbar {
              background-color: #FFFFFF !important;
              border-bottom: 1px solid #D1D5DB !important;
              box-shadow: none !important;
            }

            /* Main Findbar (Search card) Customization */
            .findbar {
              /* Tarang Theme Glassy Card */
              background: var(--glass-bg) !important;
              background-color: var(--glass-bg) !important;
              backdrop-filter: blur(30px) !important;
              -webkit-backdrop-filter: blur(30px) !important;
              border: 1px solid rgba(30, 79, 163, 0.2) !important;
              border-radius: 8px !important;
              padding: 12px 16px !important;
              box-shadow: none !important;
              display: flex !important;
              flex-wrap: wrap !important;
              gap: 12px !important;
              align-items: center !important;
              min-width: 320px !important;
              width: max-content !important;
              max-width: 450px !important;
              position: absolute !important;
              top: 52px !important;
              right: 16px !important;
              left: auto !important;
              z-index: 99999 !important;
            }
            .findbar.hidden {
              display: none !important;
            }

            #findbarInputContainer {
              display: flex !important;
              align-items: center !important;
              gap: 8px !important;
              width: 100% !important;
            }
            #findInput {
              flex: 1 !important;
              background-color: #F3F4F6 !important;
              border: 1px solid #E5E7EB !important;
              border-radius: 6px !important;
              padding: 6px 12px !important;
              font-size: 14px !important;
              color: #111827 !important;
              outline: none !important;
              min-width: 200px !important;
            }
            #findInput:focus {
              border-color: #3B82F6 !important;
              box-shadow: none !important;
            }
            #findbarOptionsOneContainer, #findbarOptionsTwoContainer {
              display: flex !important;
              align-items: center !important;
              gap: 12px !important;
            }
            .findbar label {
              font-size: 12px !important;
              color: #4B5563 !important;
              cursor: pointer !important;
              display: flex !important;
              align-items: center !important;
              gap: 4px !important;
              padding: 4px 8px !important;
              border-radius: 6px !important;
              margin: 0 !important;
            }
            .findbar input[type="checkbox"] {
              margin: 0 !important;
              cursor: pointer !important;
              accent-color: #3B82F6 !important;
            }
            
            /* Remove grey background from findbar checkbox labels when hovered or checked */
            .findbar label:hover,
            .findbar input:focus-visible + label {
              background-color: transparent !important;
            }
            .findbar .toolbarField[type="checkbox"]:checked + .toolbarLabel {
              background-color: #EFF6FF !important;
              color: #2563EB !important;
            }
            

            #findbarMessageContainer {
              font-size: 12px !important;
              color: #6B7280 !important;
              width: 100% !important;
            }
            #toolbarSidebar {
              background-color: #FFFFFF !important;
              border-bottom: none !important;
              box-shadow: none !important;
            }
            #sidebarContainer {
              border-top: none !important;
              border-right: 1px solid #D1D5DB !important;
            }
            #sidebarContent {
              box-shadow: none !important;
              border-top: 1px solid #D1D5DB !important;
            }
            /* Hide PDF loading progress bar completely as per user request */
            #loadingBar {
              display: none !important;
            }
            
            .toolbarField {
              background-color: #F3F4F6 !important;
              border-color: #D1D5DB !important;
              color: #4B5563 !important;
            }
            
            /* Style the Secondary Toolbar (Three Dots Menu) like Tarang Dropdowns */
            #secondaryToolbar {
              background: var(--glass-bg) !important;
              background-color: var(--glass-bg) !important;
              backdrop-filter: blur(24px) !important;
              -webkit-backdrop-filter: blur(24px) !important;
              border: 1px solid rgba(0, 86, 179, 0.15) !important;
              border-radius: 12px !important;
              box-shadow: none !important;
              padding: 8px 0 !important;
              top: 52px !important;
              margin-top: 0 !important;
            }
            
            /* Remove the native PDF.js little triangle arrow at the top of the dropdown */
            #secondaryToolbar::before, 
            #secondaryToolbar::after {
              display: none !important;
            }
            
            /* Make secondary toolbar buttons look better */
            .secondaryToolbarButton {
              border-radius: 8px !important;
              margin: 2px 8px !important;
              width: calc(100% - 16px) !important;
              padding: 8px 12px 8px 40px !important;
              transition: background-color 0.2s ease !important;
              text-align: left !important;
            }
            
            .toolbarButton:hover {
              background-color: rgba(0, 0, 0, 0.05) !important;
            }
            
            .secondaryToolbarButton:hover {
              background-color: rgba(0, 86, 179, 0.08) !important;
            }

            /* FORCE ICONS TO BE DARK GREY AND OPAQUE */
            .toolbarButton::before, .secondaryToolbarButton::before, .dropdownToolbarButton::after, .treeItemToggler::before {
              background-color: #4B5563 !important;
              opacity: 1 !important;
            }
            /* FORCE LABELS TO MATCH ICON COLOR */
            #numPages, .toolbarLabel, .secondaryToolbarButton {
              color: #4B5563 !important;
            }
            
            /* Custom Icon for Download Original */
            #custom-download-original::before {
              background-color: #4B5563 !important;
              -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z'/%3E%3Cpath d='M12 10v6'/%3E%3Cpath d='M9 13l3 3 3-3'/%3E%3C/svg%3E") !important;
              mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z'/%3E%3Cpath d='M12 10v6'/%3E%3Cpath d='M9 13l3 3 3-3'/%3E%3C/svg%3E") !important;
              display: inline-block !important;
            }

            /* OVERRIDE NATIVE ICONS WITH MODERN ONES */
            #firstPage::before, #firstPageClone::before, #lastPage::before, #lastPageClone::before, #pageRotateCw::before, #pageRotateCwClone::before, #pageRotateCcw::before, #pageRotateCcwClone::before, #presentationMode::before, #presentationModeClone::before, #secondaryToolbarToggle::before, #custom-download-original::before, #findPrevious::before, #findNext::before {
              -webkit-mask-size: 16px !important;
              mask-size: 16px !important;
              -webkit-mask-position: center !important;
              mask-position: center !important;
              -webkit-mask-repeat: no-repeat !important;
              mask-repeat: no-repeat !important;
            }
            #findPrevious::before {
              -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z'/%3E%3C/svg%3E") !important;
              mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z'/%3E%3C/svg%3E") !important;
            }
            #findNext::before {
              -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z'/%3E%3C/svg%3E") !important;
              mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z'/%3E%3C/svg%3E") !important;
            }
            #firstPage::before, #firstPageClone::before {
              -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 3h14'/%3E%3Cpath d='m18 13-6-6-6 6'/%3E%3Cpath d='M12 7v14'/%3E%3C/svg%3E") !important;
              mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 3h14'/%3E%3Cpath d='m18 13-6-6-6 6'/%3E%3Cpath d='M12 7v14'/%3E%3C/svg%3E") !important;
            }
            #lastPage::before, #lastPageClone::before {
              -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 3v14'/%3E%3Cpath d='m18 11-6 6-6-6'/%3E%3Cpath d='M5 21h14'/%3E%3C/svg%3E") !important;
              mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 3v14'/%3E%3Cpath d='m18 11-6 6-6-6'/%3E%3Cpath d='M5 21h14'/%3E%3C/svg%3E") !important;
            }
            #pageRotateCw::before, #pageRotateCwClone::before {
              -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8'/%3E%3Cpath d='M21 3v5h-5'/%3E%3C/svg%3E") !important;
              mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8'/%3E%3Cpath d='M21 3v5h-5'/%3E%3C/svg%3E") !important;
            }
            #pageRotateCcw::before, #pageRotateCcwClone::before {
              -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'/%3E%3Cpath d='M3 3v5h5'/%3E%3C/svg%3E") !important;
              mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'/%3E%3Cpath d='M3 3v5h5'/%3E%3C/svg%3E") !important;
            }
            #presentationMode::before, #presentationModeClone::before {
              -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 3H5a2 2 0 0 0-2 2v3'/%3E%3Cpath d='M21 8V5a2 2 0 0 0-2-2h-3'/%3E%3Cpath d='M3 16v3a2 2 0 0 0 2 2h3'/%3E%3Cpath d='M16 21h3a2 2 0 0 0 2-2v-3'/%3E%3C/svg%3E") !important;
              mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 3H5a2 2 0 0 0-2 2v3'/%3E%3Cpath d='M21 8V5a2 2 0 0 0-2-2h-3'/%3E%3Cpath d='M3 16v3a2 2 0 0 0 2 2h3'/%3E%3Cpath d='M16 21h3a2 2 0 0 0 2-2v-3'/%3E%3C/svg%3E") !important;
            }
            #secondaryToolbarToggle::before {
              -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='1'/%3E%3Ccircle cx='12' cy='5' r='1'/%3E%3Ccircle cx='12' cy='19' r='1'/%3E%3C/svg%3E") !important;
              mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='1'/%3E%3Ccircle cx='12' cy='5' r='1'/%3E%3Ccircle cx='12' cy='19' r='1'/%3E%3C/svg%3E") !important;
            }
            
            /* Mobile: Hide cloned tools and show Three Dots */
            @media (max-width: 767px) {
              .hide-on-mobile {
                display: none !important;
              }
            }
            
            /* Fix Findbar positioning since Search icon moved to right */
            #findbar {
              position: absolute !important;
              top: 52px !important;
              margin-top: 0 !important;
              right: 16px !important;
              left: auto !important;
              border-radius: 8px !important;
              box-shadow: none !important;
              border: 1px solid #E5E7EB !important;
              background-color: #FFFFFF !important;
            }
            
            /* Remove the native tip from findbar */
            #findbar::before, #findbar::after {
              display: none !important;
            }
            
            /* Make Findbar full width on mobile */
            @media (max-width: 767px) {
              #findbar {
                right: 8px !important;
                left: 8px !important;
                width: auto !important;
                min-width: 0 !important;
              }
            }
            
            /* Desktop/Landscape: Hide Three Dots and show cloned tools */
            @media (min-width: 768px) {
              #secondaryToolbarToggle {
                display: none !important;
              }
            }
            
            /* Hide all unnecessary PDF.js tools from the secondary menu */
            #secondaryOpenFile, #secondaryPrint, #secondaryDownload,
            #openFile, #viewBookmark, #editorModeButtons, #editorModeSeparator,
            #cursorSelectTool, #cursorHandTool,
            #scrollPage, #scrollVertical, #scrollHorizontal, #scrollWrapped,
            #spreadNone, #spreadOdd, #spreadEven,
            #documentProperties {
              display: none !important;
            }
            
            /* Hide all separators in the secondary toolbar to prevent stacked lines */
            #secondaryToolbar .horizontalToolbarSeparator {
              display: none !important;
            }
          `;

        // 4. Reveal the UI immediately after DOM manipulation is done
        const revealUI = () => {
          if (!iframeDoc.body.classList.contains('custom-ui-ready')) {
            iframeDoc.body.classList.add('custom-ui-ready');
            setIsUiInjected(true);
            // Focus the iframe so keyboard shortcuts work immediately after load
            focusIframe();
          }
        };

        // Call immediately since UI layout is ready
        revealUI();

        return true; // Success
      } catch (err) {
        console.warn("Injection error:", err);
        // Remove the flag so it can retry on the next interval tick
        try {
          const iframeDoc = iframeRef.current?.contentWindow?.document;
          const flag = iframeDoc?.getElementById('custom-injected-flag');
          if (flag) flag.remove();
        } catch (e) { }
        return false;
      }
    };

    // Poll every 100ms until successful or 30 seconds pass
    let attempts = 0;
    intervalId = setInterval(() => {
      attempts++;
      if (injectCustomUI()) {
        clearInterval(intervalId);
      } else if (attempts > 300) {
        // Fallback: show it anyway if it takes too long
        setIsUiInjected(true);
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [filename, originalDownloadUrl, downloadUrl]);

  return (
    <Box
      sx={{
        display: 'flex', flexDirection: 'column', width: '100%', height: '100%', position: 'relative', bgcolor: 'transparent',
        background: 'radial-gradient(ellipse at 0% 0%, rgba(0, 86, 179, 0.35) 0%, rgba(0, 86, 179, 0) 80%), radial-gradient(ellipse at 100% 0%, rgba(40, 167, 69, 0.25) 0%, rgba(40, 167, 69, 0) 80%), radial-gradient(ellipse at 100% 100%, rgba(40, 167, 69, 0.2) 0%, rgba(40, 167, 69, 0) 80%), radial-gradient(ellipse at 0% 100%, rgba(0, 86, 179, 0.2) 0%, rgba(0, 86, 179, 0) 80%), #f1f5f9',
      }}
      onMouseEnter={focusIframe}
      onClick={focusIframe}
    >
      {/* Custom Loader Overlay: Hides native PDF.js loading entirely until the viewer is fully ready */}
      <Box
        sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(ellipse at 0% 0%, rgba(0, 86, 179, 0.35) 0%, rgba(0, 86, 179, 0) 80%), radial-gradient(ellipse at 100% 0%, rgba(40, 167, 69, 0.25) 0%, rgba(40, 167, 69, 0) 80%), radial-gradient(ellipse at 100% 100%, rgba(40, 167, 69, 0.2) 0%, rgba(40, 167, 69, 0) 80%), radial-gradient(ellipse at 0% 100%, rgba(0, 86, 179, 0.2) 0%, rgba(0, 86, 179, 0) 80%), #f1f5f9',
          zIndex: 50, gap: 0,
          opacity: (isUiReady && !loadError) ? 0 : 1,
          pointerEvents: (isUiReady && !loadError) ? 'none' : 'auto',
          transition: 'opacity 0.3s ease-out',
        }}
      >
        {loadError ? (
          <>
            <Typography sx={{ fontSize: '2rem', mb: 1 }}>📄</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-slate-800)', mb: 1 }}>
              Document Unavailable
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', lineHeight: 1.6, px: 3, textAlign: 'center' }}>
              {loadError}
            </Typography>
          </>
        ) : (
          <>
            <Loader inline />
            <Typography sx={{ color: 'var(--color-primary)', fontWeight: 600, mt: -1 }}>Loading Document...</Typography>
          </>
        )}
      </Box>

      {/* Only render iframe if there is no error to prevent PDF.js from attempting to load a 404/403 URL and showing its native error UI */}
      {!loadError && (
        <iframe
          ref={iframeRef}
          src={viewerUrl}
          width="100%"
          height="100%"
          style={{
            border: 'none',
            flexGrow: 1,
            backgroundColor: 'transparent'
          }}
        />
      )}
    </Box>
  );
}

