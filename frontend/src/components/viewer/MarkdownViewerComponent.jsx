"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownViewerComponent({ downloadUrl }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMarkdown() {
      try {
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error("Failed to fetch markdown file");
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (downloadUrl) fetchMarkdown();
  }, [downloadUrl]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading Markdown...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-b-lg p-8 overflow-auto min-h-[500px] text-gray-800 dark:text-gray-200">
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
