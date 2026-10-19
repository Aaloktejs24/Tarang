"use client";

import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeViewer({ downloadUrl, filename }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCode() {
      try {
        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch code file");
        }
        const text = await response.text();
        setCode(text);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (downloadUrl) {
      fetchCode();
    }
  }, [downloadUrl]);

  // Determine language based on file extension
  const getLanguage = (fname) => {
    if (!fname) return "javascript";
    const ext = fname.split('.').pop().toLowerCase();
    const map = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      go: "go",
      java: "java",
      cpp: "cpp",
      hpp: "cpp",
      c: "c",
      h: "c",
      cs: "csharp",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      sh: "shell",
      sql: "sql",
      yaml: "yaml",
      yml: "yaml",
    };
    return map[ext] || "plaintext";
  };

  if (loading) return <div className="p-4 flex justify-center items-center h-full min-h-[400px]">Loading code...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full h-full min-h-[600px] border border-gray-700 rounded-lg overflow-hidden">
      <Editor
        height="100%"
        width="100%"
        theme="vs-dark"
        language={getLanguage(filename)}
        value={code}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
        }}
      />
    </div>
  );
}
