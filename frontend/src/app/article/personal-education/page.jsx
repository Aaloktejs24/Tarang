"use client";

import React, { useState } from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { useTranslation } from "../../../hooks/useTranslation";
import Navbar from "../../../components/navbar/Navbar";
import LandingFooter from "../../../components/footer/LandingFooter";
import LoginForm from "../../../features/auth/LoginForm";
import { AnimatePresence } from "framer-motion";
import { useBgPreloader } from "../../../hooks/useBgPreloader";

export default function ArticlePage() {
  const { t } = useTranslation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  useBgPreloader('https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=2000');

  return (
    <Box sx={{ bgcolor: "var(--color-white)", minHeight: "var(--size-screen-h)", display: "flex", flexDirection: "column" }}>
      <Navbar variant="landing" onLoginClick={() => setIsLoginOpen(true)} />

      {/* ─── HEADER BANNER ────────────────────────────────────────────────── */}
      <Box
        sx={{
          width: "var(--size-full)",
          height: { xs: "300px", md: "400px" },
          position: "relative",
          bgcolor: "var(--color-primary)",
          backgroundImage: `url('https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=2000')`, // Education/book theme
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
            {t("articlePage.heroTitle")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Typography sx={{ color: "var(--color-white)", fontWeight: 'var(--font-semibold)' }}>{t("articlePage.breadcrumbHome")}</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>/</Typography>
            <Typography sx={{ color: "var(--color-success)", fontWeight: 'var(--font-semibold)' }}>{t("articlePage.breadcrumbTitle")}</Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <Box sx={{ flexGrow: 1, py: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, borderRadius: 'var(--radius-lg)', border: "var(--border-thin) solid rgba(0,0,0,0.05)" }}>
            
            <Typography variant="h4" sx={{ fontWeight: 800, color: "var(--color-slate-900)", mb: 3 }}>
              {t("articlePage.section1Title")}
            </Typography>
            <Typography sx={{ color: "var(--color-slate-900)", fontSize: 'var(--font-base)', lineHeight: 1.7, fontWeight: 'var(--font-medium)', letterSpacing: "0.3px", mb: 3 }}>
              {t("articlePage.section1Text1")}
            </Typography>
            <Typography sx={{ color: "var(--color-slate-900)", fontSize: 'var(--font-base)', lineHeight: 1.7, fontWeight: 'var(--font-medium)', letterSpacing: "0.3px", mb: 6 }}>
              {t("articlePage.section1Text2")}
            </Typography>

            <Box sx={{ height: "1px", bgcolor: "rgba(0,0,0,0.1)", my: 6 }} />

            <Typography variant="h4" sx={{ fontWeight: 800, color: "var(--color-slate-900)", mb: 3 }}>
              {t("articlePage.section2Title")}
            </Typography>
            <Typography sx={{ color: "var(--color-slate-900)", fontSize: 'var(--font-base)', lineHeight: 1.7, fontWeight: 'var(--font-medium)', letterSpacing: "0.3px", mb: 6 }}>
              {t("articlePage.section2Text")}
            </Typography>

            <Box sx={{ height: "1px", bgcolor: "rgba(0,0,0,0.1)", my: 6 }} />

            <Typography variant="h4" sx={{ fontWeight: 800, color: "var(--color-slate-900)", mb: 3 }}>
              {t("articlePage.section3Title")}
            </Typography>
            <Typography sx={{ color: "var(--color-slate-900)", fontSize: 'var(--font-base)', lineHeight: 1.7, fontWeight: 'var(--font-medium)', letterSpacing: "0.3px", mb: 2 }}>
              {t("articlePage.section3Text")}
            </Typography>

          </Paper>
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
