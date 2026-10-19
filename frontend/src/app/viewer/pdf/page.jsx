"use client";

import React, { Suspense } from "react";
import { Box } from "@mui/material";
import { useSearchParams } from "next/navigation";
import PDFRenderer from "../../../components/viewer/renderers/PDFRenderer";
import Loader from "../../../components/common/Loader";

function PDFViewerContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const name = searchParams.get("name") || "Document";

  if (!url) {
    return (
      <Box sx={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        No URL provided
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PDFRenderer url={url} filename={name} />
    </Box>
  );
}

export default function PDFViewerPage() {
  return (
    <Suspense fallback={<Box sx={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader inline /></Box>}>
      <PDFViewerContent />
    </Suspense>
  );
}
