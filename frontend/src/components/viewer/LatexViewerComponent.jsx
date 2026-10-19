"use client";

import React, { useEffect, useState } from "react";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css"; // Required for LaTeX math rendering

export default function LatexViewerComponent({ downloadUrl }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLatex() {
      try {
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error("Failed to fetch LaTeX file");
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (downloadUrl) fetchLatex();
  }, [downloadUrl]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading LaTeX...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-b-lg p-8 overflow-auto min-h-[500px] text-gray-800 dark:text-gray-200">
      <div className="prose dark:prose-invert max-w-none">
        <Latex>{content}</Latex>
      </div>
    </div>
  );
}
