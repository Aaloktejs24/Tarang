"use client";

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewerComponent({ downloadUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const prevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const nextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages || 1));

  return (
    <div className="flex flex-col items-center bg-gray-900 rounded-lg border border-gray-800 overflow-hidden w-full">
      {/* Toolbar */}
      <div className="w-full bg-gray-800 p-3 flex justify-between items-center text-white">
        <div className="flex items-center space-x-2">
          <button onClick={zoomOut} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded">-</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded">+</button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            disabled={pageNumber <= 1} 
            onClick={prevPage}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {pageNumber} of {numPages || "--"}
          </span>
          <button 
            disabled={pageNumber >= (numPages || 1)} 
            onClick={nextPage}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 w-full overflow-auto flex justify-center bg-gray-950 p-4 min-h-[600px] max-h-[800px]">
        <Document
          file={downloadUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="text-white p-4">Loading PDF...</div>}
          error={<div className="text-red-500 p-4">Failed to load PDF. Please try downloading it.</div>}
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            className="shadow-xl"
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
}
