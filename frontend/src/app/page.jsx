"use client";

import React from "react";
import LandingPage from "../features/landing/LandingPage";
import { useAuth } from "../hooks/useAuth";
import { Box } from "@mui/material";
import Navbar from "../components/navbar/Navbar";
import Loader from "../components/common/Loader";

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth(false);

  if (isLoading) {
    return (
      <>
        <Navbar variant="landing" />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 72px)", mt: "72px" }}>
          <Loader />
        </Box>
      </>
    );
  }

  if (isAuthenticated) {
    // Show full window loader immediately while Next.js router fetches the dashboard
    return (
      <>
        <Navbar variant="landing" />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 72px)", mt: "72px" }}>
          <Loader />
        </Box>
      </>
    );
  }

  return <LandingPage />;
}
