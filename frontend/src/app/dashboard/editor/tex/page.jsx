"use client";

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { PlayIcon, Loader2Icon, Settings2Icon, FileWarningIcon } from "lucide-react";
import LatexViewer from "../../../../components/viewer/LatexViewer";

// Simple PDF Viewer for the live editor (loads blob URL)
function LocalPdfViewer({ blobUrl }) {
  if (!blobUrl) return null;
  return (
    <iframe src={blobUrl} className="w-full h-full border-0" title="PDF Preview" />
  );
}

export default function TexEditorPage() {
  const [code, setCode] = useState("\\documentclass{article}\n\\begin{document}\nHello World!\n\\end{document}");
  const [framework, setFramework] = useState("latex");
  const [engine, setEngine] = useState("pdflatex");
  const [isCompiling, setIsCompiling] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [errorLog, setErrorLog] = useState(null);

  // If browser engine is selected, we create a fake downloadUrl with data blob
  const [katexUrl, setKatexUrl] = useState(null);

  const handleCompile = async () => {
    if (engine === "browser") {
      const blob = new Blob([code], { type: "text/plain" });
      setKatexUrl(URL.createObjectURL(blob));
      setPdfUrl(null);
      setErrorLog(null);
      return;
    }

    setIsCompiling(true);
    setErrorLog(null);
    setPdfUrl(null);
    setKatexUrl(null);

    try {
      const res = await fetch("http://localhost:8081/api/v1/viewer/tex/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceCode: code, framework, engine }),
      });

      if (res.ok) {
        const blob = await res.blob();
        setPdfUrl(URL.createObjectURL(blob));
      } else {
        const data = await res.json();
        setErrorLog(data.log || data.error);
      }
    } catch (err) {
      setErrorLog(err.message);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleFrameworkChange = (e) => {
    const f = e.target.value;
    setFramework(f);
    // Reset engine based on framework
    if (f === "latex" || f === "plain") setEngine("pdftex");
    if (f === "context") setEngine("luatex");
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-950 text-gray-200">
      {/* Top Bar */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
        <h2 className="font-semibold text-lg flex items-center">
          <Settings2Icon className="w-5 h-5 mr-2 text-indigo-400" /> Live TeX Editor
        </h2>
        <div className="flex items-center space-x-4">
          <select 
            value={framework} 
            onChange={handleFrameworkChange}
            className="bg-gray-800 border border-gray-700 text-sm rounded-md px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="latex">LaTeX</option>
            <option value="plain">Plain TeX</option>
            <option value="context">ConTeXt</option>
          </select>

          <select 
            value={engine} 
            onChange={(e) => setEngine(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-sm rounded-md px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
          >
            {(framework === "latex" || framework === "plain") && (
              <>
                <option value="pdftex">pdfTeX</option>
                <option value="xetex">XeTeX</option>
                <option value="luatex">LuaTeX</option>
                {framework === "latex" && <option value="browser">Browser (KaTeX)</option>}
              </>
            )}
            {framework === "context" && (
              <>
                <option value="luatex">LuaTeX</option>
                <option value="xetex">XeTeX</option>
              </>
            )}
          </select>

          <button
            onClick={handleCompile}
            disabled={isCompiling}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center disabled:opacity-50"
          >
            {isCompiling ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <PlayIcon className="w-4 h-4 mr-2" />}
            Compile
          </button>
        </div>
      </div>

      {/* Editor & Preview Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Monaco Editor */}
        <div className="w-1/2 border-r border-gray-800 relative">
          <Editor
            height="100%"
            defaultLanguage="latex"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val)}
            options={{ minimap: { enabled: false }, wordWrap: "on" }}
          />
        </div>

        {/* Right: Preview */}
        <div className="w-1/2 bg-gray-900 relative">
          {pdfUrl && <LocalPdfViewer blobUrl={pdfUrl} />}
          {katexUrl && <LatexViewer downloadUrl={katexUrl} />}
          
          {errorLog && (
            <div className="absolute inset-0 bg-red-950/90 text-red-200 p-6 overflow-auto font-mono text-sm">
              <h3 className="text-red-400 text-lg font-bold mb-4 flex items-center">
                <FileWarningIcon className="w-5 h-5 mr-2" /> Compilation Error
              </h3>
              <pre className="whitespace-pre-wrap">{errorLog}</pre>
            </div>
          )}

          {!pdfUrl && !katexUrl && !errorLog && !isCompiling && (
            <div className="flex h-full items-center justify-center text-gray-500">
              Click Compile to generate preview.
            </div>
          )}

          {isCompiling && (
            <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center backdrop-blur-sm z-10">
              <Loader2Icon className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
              <p className="text-gray-300">Compiling with {engine}...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
