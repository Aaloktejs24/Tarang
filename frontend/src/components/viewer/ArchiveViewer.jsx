"use client";

import React, { useEffect, useState } from "react";
import JSZip from "jszip";
import { FolderIcon, FileIcon, FileTextIcon, ImageIcon, ArchiveIcon } from "lucide-react";

export default function ArchiveViewer({ downloadUrl }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArchive() {
      try {
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error("Failed to fetch archive file");
        
        const blob = await response.blob();
        const zip = new JSZip();
        const contents = await zip.loadAsync(blob);
        
        const fileList = [];
        contents.forEach((relativePath, zipEntry) => {
          fileList.push({
            name: zipEntry.name,
            dir: zipEntry.dir,
            size: zipEntry._data.uncompressedSize || 0
          });
        });
        
        // Sort: directories first, then alphabetically
        fileList.sort((a, b) => {
          if (a.dir && !b.dir) return -1;
          if (!a.dir && b.dir) return 1;
          return a.name.localeCompare(b.name);
        });

        setFiles(fileList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (downloadUrl) fetchArchive();
  }, [downloadUrl]);

  const getIcon = (file) => {
    if (file.dir) return <FolderIcon className="h-5 w-5 text-blue-400 mr-3" />;
    const ext = file.name.split('.').pop().toLowerCase();
    if (["png", "jpg", "jpeg", "gif"].includes(ext)) return <ImageIcon className="h-5 w-5 text-green-400 mr-3" />;
    if (["txt", "md", "csv"].includes(ext)) return <FileTextIcon className="h-5 w-5 text-gray-400 mr-3" />;
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return <ArchiveIcon className="h-5 w-5 text-red-400 mr-3" />;
    return <FileIcon className="h-5 w-5 text-gray-400 mr-3" />;
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Extracting Archive...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="w-full bg-gray-900 rounded-b-lg p-6 overflow-auto max-h-[600px] text-gray-300">
      <h4 className="text-white font-medium mb-4 flex items-center border-b border-gray-700 pb-2">
        <ArchiveIcon className="mr-2 h-5 w-5" /> Archive Contents ({files.length} items)
      </h4>
      <ul className="space-y-1">
        {files.map((file, idx) => (
          <li key={idx} className="flex items-center justify-between hover:bg-gray-800 p-2 rounded transition">
            <div className="flex items-center">
              {getIcon(file)}
              <span className={file.dir ? "font-medium text-blue-300" : "text-gray-300"}>
                {file.name}
              </span>
            </div>
            {!file.dir && <span className="text-xs text-gray-500">{formatSize(file.size)}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
