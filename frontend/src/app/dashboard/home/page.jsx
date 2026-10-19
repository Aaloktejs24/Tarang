"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "../../../hooks/useProfile";
import { Box, CircularProgress } from "@mui/material";

export default function HomePage() {
  const router = useRouter();
  const { profile, loading } = useProfile();

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === "institute" || profile.role === "organisation") {
        router.replace("/dashboard/home/institute");
      } else {
        router.replace("/dashboard/home/feed");
      }
    }
  }, [profile, loading, router]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  );
}
