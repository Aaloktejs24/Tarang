"use client";

import React, { useState } from "react";
import UniversalViewer from "../../../../components/viewer/FileViewer";

export default function ViewerTestPage() {
  const [jobId, setJobId] = useState("");
  const [isVideo, setIsVideo] = useState(false);
  const [activeViewerProps, setActiveViewerProps] = useState(null);

  const handleTestViewer = (e) => {
    e.preventDefault();
    if (jobId.trim()) {
      setActiveViewerProps({ jobId: jobId.trim(), isVideo });
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Component Test: Universal Viewer</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Load a File Job</h2>
        <p className="text-gray-400 mb-6 text-sm">
          Enter a valid Job ID from the backend to test the viewer component. 
          Make sure your Docker microservices are running locally on ports 8083 (Streaming) and 8084 (Viewer).
        </p>

        <form onSubmit={handleTestViewer} className="flex flex-col space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Job ID (UUID)</label>
            <input 
              type="text" 
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="isVideo"
              checked={isVideo}
              onChange={(e) => setIsVideo(e.target.checked)}
              className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isVideo" className="text-sm font-medium text-gray-300">
              Is this a Video Streaming Job?
            </label>
          </div>

          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition w-full mt-2"
          >
            Load Viewer
          </button>
        </form>
      </div>

      {activeViewerProps && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Viewer Output</h2>
          {/* Key forces remount when job ID changes */}
          <UniversalViewer 
            key={activeViewerProps.jobId} 
            jobId={activeViewerProps.jobId} 
            isVideo={activeViewerProps.isVideo} 
          />
        </div>
      )}
    </div>
  );
}
