"use client";

import React, { useEffect, useState } from "react";
import CodeViewerComponent from "./CodeViewerComponent";
import PdfViewerComponent from "./PdfViewerComponent";
import ShakaPlayerComponent from "./ShakaPlayerComponent";
import MarkdownViewerComponent from "./MarkdownViewerComponent";
import LatexViewerComponent from "./LatexViewerComponent";
import NotebookViewerComponent from "./NotebookViewerComponent";
import ImageViewerComponent from "./ImageViewerComponent";
import ArchiveViewerComponent from "./ArchiveViewerComponent";
import { DownloadIcon, FileWarningIcon, Loader2 } from "lucide-react"; // Assuming lucide-react is installed

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
        
        // In a real app, this would go through KrakenD on port 8080.
        // For local dev, we hit the microservices directly or through an API route.
        // We'll assume the API route maps correctly.
        const res = await fetch(`http://localhost:${port}/api/v1/${service}/${jobId}${isVideo ? '' : '/metadata'}`);
        
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
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-gray-900 rounded-lg text-gray-300">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
        <p className="text-lg font-medium">Processing your file...</p>
        <p className="text-sm text-gray-500 mt-2">This might take a few seconds.</p>
      </div>
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
      <div className="flex flex-col space-y-4 w-full">
        {/* Viewer Header */}
        <div className="flex justify-between items-center bg-gray-800 p-4 rounded-t-lg">
          <div>
            <h3 className="text-white font-medium">{filename}</h3>
            <p className="text-xs text-gray-400 mt-1">Rendered via {renderer}</p>
          </div>
          <div className="flex space-x-3">
            <a 
              href={getOriginalUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition"
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download Original
            </a>
            {pdf_download_url && (
              <a 
                href={getPdfUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download PDF
              </a>
            )}
          </div>
        </div>

        {/* The Actual Viewer */}
        <div className="w-full bg-gray-900 rounded-b-lg shadow-inner">
          {renderer === "PDF.js" && (
            <PdfViewerComponent downloadUrl={getPdfUrl()} />
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
            <div className="p-12 text-center">
              <FileWarningIcon className="mx-auto h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl text-white font-medium mb-2">Preview Not Available</h3>
              <p className="text-gray-400 mb-6">We don't support previewing this file type yet.</p>
              <a 
                href={getOriginalUrl()}
                className="inline-flex items-center bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                <DownloadIcon className="h-5 w-5 mr-2" />
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
