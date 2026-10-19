"use client";

import React, { useEffect, useState } from "react";
import { IpynbRenderer } from "react-ipynb-renderer";
import "react-ipynb-renderer/dist/styles/monokai.css"; // Dark theme for notebooks

export default function NotebookViewer({ downloadUrl }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNotebook() {
      try {
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error("Failed to fetch Jupyter Notebook file");
        const json = await response.json();
        setContent(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (downloadUrl) fetchNotebook();
  }, [downloadUrl]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading Notebook...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-b-lg p-8 overflow-auto min-h-[500px]">
      <div className="max-w-5xl mx-auto">
        <IpynbRenderer ipynb={content} syntaxTheme="monokai" />
      </div>
    </div>
  );
}
