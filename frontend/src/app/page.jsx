"use client";

import React from "react";
import LandingPage from "../features/landing/LandingPage";
import { useAuth } from "../hooks/useAuth";
import { Box } from "@mui/material";

export default function RootPage() {
  const [mounted, setMounted] = React.useState(false);
  const { isAuthenticated, isLoading } = useAuth(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}></Box>;
  if (isAuthenticated) return null; // Let the router redirect

  return <LandingPage />;
}
