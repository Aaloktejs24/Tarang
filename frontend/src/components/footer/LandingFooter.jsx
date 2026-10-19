"use client";

import React from "react";
import { Box, Container, Typography, Button, Grid, Paper } from "@mui/material";
import { useTranslation } from "../../hooks/useTranslation";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import logo from "../../assets/logo.svg";

export default function LandingFooter() {
  const { t } = useTranslation();
  return (
    <Box sx={{ position: "relative", mt: { xs: 12, md: 16 } }}>
        {/* Overlapping Subscribe Box */}
        <Container maxWidth="lg" sx={{ position: "absolute", top: 0, left: "50%", transform: "translate(-50%, -50%)", zIndex: 10 }}>
          <Paper
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
              borderRadius: "12px",
              p: { xs: 4, md: 5 },
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 4,
            }}
          >
            <Box>
              <Typography variant="h3" sx={{ color: "#fff", fontWeight: 800, mb: 1, fontFamily: "'Inter', sans-serif" }}>
                {t("landing.footer.subscribeTitle")}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem" }}>
                {t("landing.footer.subscribeDesc")}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", width: { xs: "100%", md: "450px" }, gap: 2, alignItems: "stretch" }}>
              <Box
                component="input"
                placeholder={t("landing.footer.enterEmail")}
                sx={{
                  flex: 1,
                  bgcolor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  px: 3,
                  py: 1.5,
                  height: "48px",
                  boxSizing: "border-box",
                  fontSize: "1rem",
                  color: "#fff",
                  outline: "none",
                  "&::placeholder": { color: "rgba(255,255,255,0.8)" },
                  backdropFilter: "blur(4px)",
                  transition: "all 0.3s ease",
                  fontFamily: "'Inter', sans-serif",
                  "&:focus": {
                    borderColor: "#fff",
                    bgcolor: "rgba(255,255,255,0.25)"
                  }
                }}
              />
              <Button
                variant="contained" 
                disableElevation
                sx={{ 
                  bgcolor: "#0056b3", 
                  color: "#fff", 
                  borderRadius: "8px", 
                  px: 5, 
                  "&:hover": { bgcolor: "#004494" }, 
                  textTransform: "none", 
                  fontWeight: 800, 
                  whiteSpace: "nowrap", 
                  fontSize: "1.05rem",
                  transition: "all 0.3s ease",
                  height: "48px",
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {t("landing.footer.subscribeTitle")}
              </Button>
            </Box>
          </Paper>
        </Container>

        {/* Main Footer Background */}
        <Box sx={{ 
          background: `linear-gradient(rgba(0, 86, 179, 0.85), rgba(0, 86, 179, 0.95)), url('https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2000')`,
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          color: "white", 
          pt: { xs: 12, md: 14 }, 
          pb: 6 
        }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} sx={{ mb: 8 }}>
              {/* Column 1: Logo & Socials */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <img src={logo.src} alt="Tarang" style={{ height: "45px" }} />
                  <Typography variant="h4" sx={{ fontFamily: "'Rozha One', serif", color: "#4ade80" }}>
                    Tarang
                  </Typography>
                </Box>
                <Typography sx={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8, fontSize: "0.95rem", mb: 4 }}>
                  {t("landing.footer.aboutDesc")}
                </Typography>
                <Typography fontWeight={800} color="#fff" mb={2} fontSize="1.25rem">
                  {t("landing.footer.followUs")}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {[<FacebookIcon key="fb"/>, <TwitterIcon key="tw"/>, <LinkedInIcon key="li"/>, <InstagramIcon key="ig"/>].map((icon, i) => (
                    <Box key={i} sx={{ width: 32, height: 32, bgcolor: "#fff", color: "#0056b3", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#28a745", color: "#fff" }, transition: "all 0.2s" }}>
                      {React.cloneElement(icon, { sx: { fontSize: 18 } })}
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* Column 2: Category */}
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography fontWeight={800} color="#fff" mb={3} fontSize="1.25rem">
                  {t("landing.footer.category")}
                </Typography>
                {[
                  t("landing.footer.categories.economics"),
                  t("landing.footer.categories.natural"),
                  t("landing.footer.categories.architecture"),
                  t("landing.footer.categories.electrical"),
                  t("landing.footer.categories.biological"),
                  t("landing.footer.categories.psychology")
                ].map((l) => (
                  <Typography key={l} sx={{ color: "rgba(255,255,255,0.8)", mb: 2, fontSize: "1rem", cursor: "pointer", "&:hover": { color: "#4ade80" }, transition: "color 0.2s" }}>
                    {l}
                  </Typography>
                ))}
              </Grid>

              {/* Column 3: Useful Link */}
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography fontWeight={800} color="#fff" mb={3} fontSize="1.25rem">
                  {t("landing.footer.usefulLink")}
                </Typography>
                {[
                  t("landing.footer.links.home"),
                  t("landing.footer.links.about"),
                  t("landing.footer.links.course"),
                  t("landing.footer.links.privacy"),
                  t("landing.footer.links.pricing"),
                  t("landing.footer.links.faq")
                ].map((l) => (
                  <Typography key={l} sx={{ color: "rgba(255,255,255,0.8)", mb: 2, fontSize: "1rem", cursor: "pointer", "&:hover": { color: "#4ade80" }, transition: "color 0.2s" }}>
                    {l}
                  </Typography>
                ))}
              </Grid>

              {/* Column 4: Contact Us */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography fontWeight={800} color="#fff" mb={3} fontSize="1.25rem">
                  {t("landing.footer.contactUs")}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.8)", mb: 4, fontSize: "0.95rem", lineHeight: 1.6 }}>
                  {t("landing.footer.contactDesc")}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                    <LocationOnIcon sx={{ color: "#28a745", fontSize: 20 }} />
                    <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                      6580 Allison Turnpike Creminfort, AL 32808-4509
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <PhoneIcon sx={{ color: "#28a745", fontSize: 20 }} />
                    <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>
                      +(123) 456-7890
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <EmailIcon sx={{ color: "#28a745", fontSize: 20 }} />
                    <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem" }}>
                      letstalk@tarang.com
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
        
        {/* Copyright Bar */}
        <Box sx={{ bgcolor: "#001b3a", py: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem" }}>
            {t("landing.footer.copyright")} <Box component="span" sx={{ color: "#28a745" }}>tarang</Box> {t("landing.footer.allRights")}
          </Typography>
        </Box>
      </Box>
  );
}
