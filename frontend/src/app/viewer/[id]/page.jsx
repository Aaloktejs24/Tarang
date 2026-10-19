"use client";

import React, { useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import UniversalViewer from "../../../components/viewer/FileViewer";
import { apiClient } from "../../../lib/apiClient";

export default function ViewerPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id;
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) return;
    
    let intervalId;
    const fetchMetadata = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await fetch(`${baseUrl}/viewer/${jobId}/metadata`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch file metadata");
        }
        
        const data = await res.json();
        setMetadata(data);
        
        if (data.status === "COMPLETED" || data.status === "FAILED") {
          setLoading(false);
          if (intervalId) clearInterval(intervalId);
        }
      } catch (err) {
        console.error(err);
        setError("Error loading document.");
        setLoading(false);
        if (intervalId) clearInterval(intervalId);
      }
    };

    fetchMetadata();
    intervalId = setInterval(fetchMetadata, 3000);

    return () => clearInterval(intervalId);
  }, [jobId]);

  const handleDownload = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    window.open(`${baseUrl}/viewer/download/${jobId}?type=raw`, '_blank');
  };

  const getDownloadUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    return `${baseUrl}/viewer/download/${jobId}`;
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Viewer Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <UniversalViewer jobId={jobId} />
      </Box>
    </Box>
  );
}
