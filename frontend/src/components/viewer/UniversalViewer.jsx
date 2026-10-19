"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import CodeViewerComponent from "./CodeViewerComponent";
const PdfViewerComponent = dynamic(() => import("./PdfViewerComponent"), { ssr: false });
import ShakaPlayerComponent from "./ShakaPlayerComponent";
import MarkdownViewerComponent from "./MarkdownViewerComponent";
import LatexViewerComponent from "./LatexViewerComponent";
import NotebookViewerComponent from "./NotebookViewerComponent";
import ImageViewerComponent from "./ImageViewerComponent";
import ArchiveViewerComponent from "./ArchiveViewerComponent";
import { DownloadIcon, FileWarningIcon, Loader2 } from "lucide-react";
import { Box, Typography, Button } from "@mui/material";

export default function UniversalViewer({ jobId, isVideo = false }) {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Poll metadata until COMPLETED
  useEffect(() => {
    let intervalId;

    const fetchMetadata = async () => {
      try {
        const port = isVideo ? "8083" : "8084"; // Stream/Viewer ports
        const service = isVideo ? "streaming" : "viewer";
        
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        
        // Use KrakenD API gateway for all requests
        const res = await fetch(`${baseUrl}/${service}/${jobId}${isVideo ? '' : '/metadata'}`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch file metadata");
        }
        
        const data = await res.json();
        setMetadata(data);

        // If completed or failed, stop polling
        if (data.status === "COMPLETED" || data.status === "FAILED") {
          setLoading(false);
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
        clearInterval(intervalId);
      }
    };

    fetchMetadata(); // initial fetch
    intervalId = setInterval(fetchMetadata, 3000); // poll every 3s

    return () => clearInterval(intervalId);
  }, [jobId, isVideo]);

  if (loading) {
    return (
      <Box sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#F3F4F6', // Standard viewer background
        color: '#374151'
      }}>
        <Loader2 className="h-10 w-10 animate-spin mb-4" style={{ color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
        <Typography variant="h6" sx={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
          Processing your file...
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mt: 1, fontFamily: 'Inter, sans-serif' }}>
          This might take a few seconds.
        </Typography>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Box>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-red-900/20 border border-red-800 rounded-lg text-center">
        <FileWarningIcon className="mx-auto h-12 w-12 text-red-500 mb-2" />
        <h3 className="text-red-400 font-semibold text-lg">Error Loading File</h3>
        <p className="text-red-300 mt-1">{error}</p>
      </div>
    );
  }

  if (metadata?.status === "FAILED") {
    return (
      <div className="w-full p-6 bg-red-900/20 border border-red-800 rounded-lg text-center">
        <FileWarningIcon className="mx-auto h-12 w-12 text-red-500 mb-2" />
        <h3 className="text-red-400 font-semibold text-lg">Processing Failed</h3>
        <p className="text-red-300 mt-1">We couldn't process this file.</p>
      </div>
    );
  }

  // --- Rendering Logic ---

  // Video Streaming
  if (isVideo && (metadata?.dash_manifest_url || metadata?.hls_manifest_url)) {
    return (
      <div className="flex flex-col space-y-4">
        <ShakaPlayerComponent 
          manifestUrl={metadata.dash_manifest_url || metadata.hls_manifest_url} 
          jobId={metadata.job_id} 
        />
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>{metadata.original_filename}</span>
          <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded">DRM Protected (CMAF)</span>
        </div>
      </div>
    );
  }

  // Document Viewer
  if (!isVideo && metadata) {
    const { renderer, pdf_download_url, original_download_url, filename } = metadata;
    
    // Base URL for downloads (assuming microservice port)
    const baseUrl = `http://localhost:8084`;

    const getOriginalUrl = () => `${baseUrl}${original_download_url}`;
    const getPdfUrl = () => pdf_download_url ? `${baseUrl}${pdf_download_url}` : getOriginalUrl();

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        {/* Viewer Header - Hide for PDF.js to use the native injected toolbar */}
        {renderer !== "PDF.js" && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            p: '16px 24px', 
            height: '72px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            zIndex: 10,
            position: 'relative'
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ 
                color: '#111827', 
                fontWeight: 600, 
                fontSize: '1.125rem', 
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.01em'
              }}>
                {filename}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }} />
                <Typography sx={{ 
                  color: '#6B7280', 
                  fontSize: '0.8125rem', 
                  fontFamily: 'Inter, sans-serif', 
                  fontWeight: 500 
                }}>
                  Rendered via {renderer}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                href={getOriginalUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  color: '#374151', 
                  borderColor: '#D1D5DB',
                  textTransform: 'none',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  px: 2,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    backgroundColor: '#F3F4F6', 
                    borderColor: '#9CA3AF' 
                  }
                }}
                startIcon={<DownloadIcon size={16} />}
              >
                Original File
              </Button>
            </Box>
          </Box>
        )}

        {/* The Actual Viewer Container */}
        <Box sx={{ 
          position: 'relative',
          overflow: 'hidden',
          width: '100%', 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F3F4F6'
        }}>
          <Box sx={{ position: 'relative', zIndex: 2, width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {renderer === "PDF.js" && (
              <PdfViewerComponent 
                downloadUrl={getPdfUrl()} 
                filename={filename}
                originalDownloadUrl={getOriginalUrl()}
              />
            )}

            {renderer === "Monaco" && (
              <CodeViewerComponent downloadUrl={getOriginalUrl()} filename={filename} />
            )}
            
            {renderer === "Markdown" && (
              <MarkdownViewerComponent downloadUrl={getOriginalUrl()} />
            )}

            {renderer === "LaTeX" && (
              <LatexViewerComponent downloadUrl={getOriginalUrl()} />
            )}

            {renderer === "Jupyter" && (
              <NotebookViewerComponent downloadUrl={getOriginalUrl()} />
            )}

            {renderer === "Image" && (
              <ImageViewerComponent downloadUrl={getOriginalUrl()} filename={filename} />
            )}

            {renderer === "Archive" && (
              <ArchiveViewerComponent downloadUrl={getOriginalUrl()} />
            )}

            {renderer === "Unknown" && (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <FileWarningIcon className="mx-auto h-16 w-16 text-gray-500 mb-4" />
                <Typography variant="h6" sx={{ color: 'var(--color-slate-900)', fontWeight: 500, mb: 1 }}>Preview Not Available</Typography>
                <Typography sx={{ color: 'var(--color-slate-500)', mb: 3 }}>We don't support previewing this file type yet.</Typography>
                <Button 
                  variant="contained"
                  href={getOriginalUrl()}
                  startIcon={<DownloadIcon size={20} />}
                  sx={{ bgcolor: 'var(--color-primary)', textTransform: 'none', fontWeight: 500 }}
                >
                  Download File
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  return null;
}
