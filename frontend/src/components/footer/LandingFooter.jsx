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
        <Container maxWidth="lg" sx={{ position: "absolute", top: 0, left: "50%", transform: "translate(-50%, -50%)", zIndex: 'var(--z-sticky)' }}>
          <Paper
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%)",
              borderRadius: 'var(--radius-lg)',
              p: { xs: 4, md: 5 },
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 4,
            }}
          >
            <Box>
              <Typography variant="h3" sx={{ color: "var(--color-white)", fontWeight: 800, mb: 1 }}>
                {t("landing.footer.subscribeTitle")}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: 'var(--font-base)' }}>
                {t("landing.footer.subscribeDesc")}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", width: { xs: "var(--size-full)", md: "450px" }, gap: 2, alignItems: "stretch" }}>
              <Box
                component="input"
                placeholder={t("landing.footer.enterEmail")}
                sx={{
                  flex: 1,
                  bgcolor: "rgba(255,255,255,0.15)",
                  border: "var(--border-thin) solid rgba(255,255,255,0.2)",
                  borderRadius: 'var(--radius-md)',
                  px: 3,
                  py: 1.5,
                  height: 'var(--box-height)',
                  boxSizing: "border-box",
                  fontSize: 'var(--font-base)',
                  color: "var(--color-white)",
                  outline: "none",
                  "&::placeholder": { color: "rgba(255,255,255,0.8)" },
                  backdropFilter: "blur(4px)",
                  transition: "var(--transition-slow)",
                  "&:focus": {
                    borderColor: "var(--color-var(--color-white))",
                    bgcolor: "rgba(255,255,255,0.25)"
                  }
                }}
              />
              <Button
                variant="contained" 
                disableElevation
                sx={{ 
                  bgcolor: "var(--color-primary)", 
                  color: "var(--color-white)", 
                  borderRadius: 'var(--radius-md)', 
                  px: 5, 
                  "&:hover": { bgcolor: "var(--color-primary-hover)" }, 
                  textTransform: "none", 
                  fontWeight: 800, 
                  whiteSpace: "nowrap", 
                  fontSize: 'var(--font-base)',
                  transition: "var(--transition-slow)",
                  height: 'var(--box-height)'
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
          color: "var(--color-white)", 
          pt: { xs: 12, md: 14 }, 
          pb: 6 
        }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} sx={{ mb: 8 }}>
              {/* Column 1: Logo & Socials */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <img src={logo.src} alt="Tarang" style={{ height: 'var(--box-height)' }} />
                  <Typography variant="h4" sx={{ color: "var(--color-success)" }}>
                    Tarang
                  </Typography>
                </Box>
                <Typography sx={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8, fontSize: 'var(--font-base)', mb: 4 }}>
                  {t("landing.footer.aboutDesc")}
                </Typography>
                <Typography fontWeight={800} color="var(--color-white)" mb={2} fontSize="1.25rem">
                  {t("landing.footer.followUs")}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {[<FacebookIcon key="fb"/>, <TwitterIcon key="tw"/>, <LinkedInIcon key="li"/>, <InstagramIcon key="ig"/>].map((icon, i) => (
                    <Box key={i} sx={{ width: 32, height: 32, bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 'var(--radius-lg)', cursor: "pointer", "&:hover": { bgcolor: "var(--color-success)", color: "var(--color-white)" }, transition: "all var(--transition-base)" }}>
                      {React.cloneElement(icon, { sx: { fontSize: 18 } })}
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* Column 2: Category */}
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography fontWeight={800} color="var(--color-white)" mb={3} fontSize="1.25rem">
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
                  <Typography key={l} sx={{ color: "rgba(255,255,255,0.8)", mb: 2, fontSize: 'var(--font-base)', cursor: "pointer", "&:hover": { color: "var(--color-success)" }, transition: "color var(--transition-base)" }}>
                    {l}
                  </Typography>
                ))}
              </Grid>

              {/* Column 3: Useful Link */}
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography fontWeight={800} color="var(--color-white)" mb={3} fontSize="1.25rem">
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
                  <Typography key={l} sx={{ color: "rgba(255,255,255,0.8)", mb: 2, fontSize: 'var(--font-base)', cursor: "pointer", "&:hover": { color: "var(--color-success)" }, transition: "color var(--transition-base)" }}>
                    {l}
                  </Typography>
                ))}
              </Grid>

              {/* Column 4: Contact Us */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography fontWeight={800} color="var(--color-white)" mb={3} fontSize="1.25rem">
                  {t("landing.footer.contactUs")}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.8)", mb: 4, fontSize: 'var(--font-base)', lineHeight: 1.6 }}>
                  {t("landing.footer.contactDesc")}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                    <LocationOnIcon sx={{ color: "var(--color-success)", fontSize: 20 }} />
                    <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
                      6580 Allison Turnpike Creminfort, AL 32808-4509
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <PhoneIcon sx={{ color: "var(--color-success)", fontSize: 20 }} />
                    <Typography sx={{ color: "var(--color-white)", fontWeight: 'var(--font-bold)', fontSize: 'var(--font-base)' }}>
                      +(123) 456-7890
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <EmailIcon sx={{ color: "var(--color-success)", fontSize: 20 }} />
                    <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: 'var(--font-base)' }}>
                      letstalk@tarang.com
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
        
        {/* Copyright Bar */}
        <Box sx={{ bgcolor: "var(--color-slate-900)", py: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", fontSize: 'var(--font-base)' }}>
            {t("landing.footer.copyright")} <Box component="span" sx={{ color: "var(--color-success)" }}>tarang</Box> {t("landing.footer.allRights")}
          </Typography>
        </Box>
      </Box>
  );
}
