"use client";

import React, { useState } from "react";

export default function ImageViewerComponent({ downloadUrl, filename }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="w-full flex items-center justify-center bg-gray-900 rounded-b-lg p-8 min-h-[500px]">
      {loading && !error && <div className="text-gray-400 absolute">Loading Image...</div>}
      {error ? (
        <div className="text-red-500">Failed to load image.</div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={downloadUrl}
          alt={filename || "Image"}
          className={`max-w-full max-h-[800px] object-contain transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}
    </div>
  );
}
