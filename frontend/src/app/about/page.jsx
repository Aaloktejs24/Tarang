"use client";

import React, { useState } from "react";
import { Box, Container, Typography, Paper, Grid } from "@mui/material";
import { useTranslation } from "../../hooks/useTranslation";
import Navbar from "../../components/navbar/Navbar";
import LandingFooter from "../../components/footer/LandingFooter";
import AuthModal from "../../features/auth/AuthModal";
import { AnimatePresence } from "framer-motion";
import { useBgPreloader } from "../../hooks/useBgPreloader";

export default function AboutPage() {
  const { t } = useTranslation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  useBgPreloader('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000');

  return (
    <Box sx={{ bgcolor: "transparent", minHeight: "var(--size-screen-h)", display: "flex", flexDirection: "column" }}>
      <Navbar variant="landing" onLoginClick={() => setIsLoginOpen(true)} />

      {/* ─── HEADER BANNER ────────────────────────────────────────────────── */}
      <Box
        sx={{
          width: "var(--size-full)",
          height: { xs: "300px", md: "400px" },
          position: "relative",
          bgcolor: "var(--color-primary)",
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
              color: "var(--color-white)",
              fontSize: { xs: "2.5rem", md: "4rem" },
              fontWeight: 800,
              letterSpacing: "-1px",
              mb: 2,
            }}
          >
            {t("aboutPage.heroTitle")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Typography sx={{ color: "var(--color-white)", fontWeight: 'var(--font-semibold)' }}>{t("aboutPage.breadcrumbHome")}</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>/</Typography>
            <Typography sx={{ color: "var(--color-success)", fontWeight: 'var(--font-semibold)' }}>{t("aboutPage.breadcrumbTitle")}</Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <Box sx={{ flexGrow: 1, py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Left Content */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 'var(--radius-lg)', border: "var(--border-thin) solid rgba(0,0,0,0.05)", height: "var(--size-full)" }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "var(--color-slate-900)", mb: 3 }}>
                  {t("aboutPage.missionTitle")}
                </Typography>
                <Typography sx={{ color: "var(--color-slate-900)", fontSize: 'var(--font-base)', lineHeight: 1.7, fontWeight: 'var(--font-medium)', letterSpacing: "0.3px", mb: 6 }}>
                  {t("aboutPage.missionText")}
                </Typography>

                <Box sx={{ height: "1px", bgcolor: "rgba(0,0,0,0.1)", my: 5 }} />

                <Typography variant="h4" sx={{ fontWeight: 800, color: "var(--color-slate-900)", mb: 3 }}>
                  {t("aboutPage.whatWeDoTitle")}
                </Typography>
                <Typography sx={{ color: "var(--color-slate-900)", fontSize: 'var(--font-base)', lineHeight: 1.7, fontWeight: 'var(--font-medium)', letterSpacing: "0.3px", mb: 6 }}>
                  {t("aboutPage.whatWeDoText")}
                </Typography>
                
                <Box sx={{ height: "1px", bgcolor: "rgba(0,0,0,0.1)", my: 5 }} />

                <Typography variant="h4" sx={{ fontWeight: 800, color: "var(--color-slate-900)", mb: 3 }}>
                  {t("aboutPage.visionTitle")}
                </Typography>
                <Typography sx={{ color: "var(--color-slate-900)", fontSize: 'var(--font-base)', lineHeight: 1.7, fontWeight: 'var(--font-medium)', letterSpacing: "0.3px" }}>
                  {t("aboutPage.visionText")}
                </Typography>
              </Paper>
            </Grid>

            {/* Right Images */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ height: "var(--size-full)", display: "flex", flexDirection: "column", gap: 3 }}>
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800"
                  alt="Students studying"
                  sx={{ width: "var(--size-full)", height: "50%", minHeight: "300px", objectFit: "cover", borderRadius: 'var(--radius-lg)', }}
                />
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800"
                  alt="Team collaboration"
                  sx={{ width: "var(--size-full)", height: "50%", minHeight: "300px", objectFit: "cover", borderRadius: 'var(--radius-lg)', }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <LandingFooter />

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginOpen && <AuthModal onClose={() => setIsLoginOpen(false)} />}
      </AnimatePresence>
    </Box>
  );
}
