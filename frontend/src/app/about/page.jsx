"use client";

import React, { useState } from "react";
import { Box, Container, Typography, Paper, Grid } from "@mui/material";
import { useTranslation } from "../../hooks/useTranslation";
import LandingNavbar from "../../components/navbar/LandingNavbar";
import LandingFooter from "../../components/footer/LandingFooter";
import LoginForm from "../../features/auth/LoginForm";
import { AnimatePresence } from "framer-motion";

export default function AboutPage() {
  const { t } = useTranslation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <Box sx={{ bgcolor: "#ffffff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <LandingNavbar onLoginClick={() => setIsLoginOpen(true)} />

      {/* ─── HEADER BANNER ────────────────────────────────────────────────── */}
      <Box
        sx={{
          width: "100%",
          height: { xs: "300px", md: "400px" },
          position: "relative",
          bgcolor: "#0056b3",
          backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000')`, // Collaboration/team theme
          backgroundBlendMode: "multiply",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", mt: 6 }}>
          <Typography
            variant="h1"
            sx={{
              color: "#ffffff",
              fontSize: { xs: "2.5rem", md: "4rem" },
              fontWeight: 800,
              fontFamily: "'Rozha One', serif",
              letterSpacing: "-1px",
              mb: 2,
            }}
          >
            {t("aboutPage.heroTitle")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Typography sx={{ color: "#ffffff", fontWeight: 600 }}>{t("aboutPage.breadcrumbHome")}</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>/</Typography>
            <Typography sx={{ color: "#28a745", fontWeight: 600 }}>{t("aboutPage.breadcrumbTitle")}</Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <Box sx={{ flexGrow: 1, py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Left Content */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: "24px", border: "1px solid rgba(0,0,0,0.05)", height: "100%" }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mb: 3 }}>
                  {t("aboutPage.missionTitle")}
                </Typography>
                <Typography sx={{ color: "#1e293b", fontSize: "1.05rem", lineHeight: 1.7, fontWeight: 500, letterSpacing: "0.3px", mb: 6 }}>
                  {t("aboutPage.missionText")}
                </Typography>

                <Box sx={{ height: "1px", bgcolor: "rgba(0,0,0,0.1)", my: 5 }} />

                <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mb: 3 }}>
                  {t("aboutPage.whatWeDoTitle")}
                </Typography>
                <Typography sx={{ color: "#1e293b", fontSize: "1.05rem", lineHeight: 1.7, fontWeight: 500, letterSpacing: "0.3px", mb: 6 }}>
                  {t("aboutPage.whatWeDoText")}
                </Typography>
                
                <Box sx={{ height: "1px", bgcolor: "rgba(0,0,0,0.1)", my: 5 }} />

                <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mb: 3 }}>
                  {t("aboutPage.visionTitle")}
                </Typography>
                <Typography sx={{ color: "#1e293b", fontSize: "1.05rem", lineHeight: 1.7, fontWeight: 500, letterSpacing: "0.3px" }}>
                  {t("aboutPage.visionText")}
                </Typography>
              </Paper>
            </Grid>

            {/* Right Images */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800"
                  alt="Students studying"
                  sx={{ width: "100%", height: "50%", minHeight: "300px", objectFit: "cover", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}
                />
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800"
                  alt="Team collaboration"
                  sx={{ width: "100%", height: "50%", minHeight: "300px", objectFit: "cover", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <LandingFooter />

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginOpen && <LoginForm onClose={() => setIsLoginOpen(false)} />}
      </AnimatePresence>
    </Box>
  );
}
