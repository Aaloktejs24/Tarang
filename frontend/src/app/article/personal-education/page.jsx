"use client";

import React, { useState } from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { useTranslation } from "../../../hooks/useTranslation";
import LandingNavbar from "../../../components/navbar/LandingNavbar";
import LandingFooter from "../../../components/footer/LandingFooter";
import LoginForm from "../../../features/auth/LoginForm";
import { AnimatePresence } from "framer-motion";

export default function ArticlePage() {
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
              color: "#ffffff",
              fontSize: { xs: "2.5rem", md: "4rem" },
              fontWeight: 800,
              fontFamily: "'Rozha One', serif",
              letterSpacing: "-1px",
              mb: 2,
            }}
          >
            {t("articlePage.heroTitle")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Typography sx={{ color: "#ffffff", fontWeight: 600 }}>{t("articlePage.breadcrumbHome")}</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>/</Typography>
            <Typography sx={{ color: "#28a745", fontWeight: 600 }}>{t("articlePage.breadcrumbTitle")}</Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <Box sx={{ flexGrow: 1, py: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, borderRadius: "24px", border: "1px solid rgba(0,0,0,0.05)" }}>
            
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mb: 3 }}>
              {t("articlePage.section1Title")}
            </Typography>
            <Typography sx={{ color: "#1e293b", fontSize: "1.05rem", lineHeight: 1.7, fontWeight: 500, letterSpacing: "0.3px", mb: 3 }}>
              {t("articlePage.section1Text1")}
            </Typography>
            <Typography sx={{ color: "#1e293b", fontSize: "1.05rem", lineHeight: 1.7, fontWeight: 500, letterSpacing: "0.3px", mb: 6 }}>
              {t("articlePage.section1Text2")}
            </Typography>

            <Box sx={{ height: "1px", bgcolor: "rgba(0,0,0,0.1)", my: 6 }} />

            <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mb: 3 }}>
              {t("articlePage.section2Title")}
            </Typography>
            <Typography sx={{ color: "#1e293b", fontSize: "1.05rem", lineHeight: 1.7, fontWeight: 500, letterSpacing: "0.3px", mb: 6 }}>
              {t("articlePage.section2Text")}
            </Typography>

            <Box sx={{ height: "1px", bgcolor: "rgba(0,0,0,0.1)", my: 6 }} />

            <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mb: 3 }}>
              {t("articlePage.section3Title")}
            </Typography>
            <Typography sx={{ color: "#1e293b", fontSize: "1.05rem", lineHeight: 1.7, fontWeight: 500, letterSpacing: "0.3px", mb: 2 }}>
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
