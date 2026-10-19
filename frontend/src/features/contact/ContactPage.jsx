"use client";

import React from "react";
import { Box, Container, Typography, TextField, Button, Paper, Grid } from "@mui/material";
import DirectionsIcon from "@mui/icons-material/Directions";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import Navbar from "../../components/navbar/Navbar";
import LandingFooter from "../../components/footer/LandingFooter";
import { useTranslation } from "../../hooks/useTranslation";
import { useBgPreloader } from "../../hooks/useBgPreloader";

export default function ContactPage() {
  const { t } = useTranslation();
  useBgPreloader('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000');
  return (
    <Box sx={{ bgcolor: "transparent", minHeight: "var(--size-screen-h)", display: "flex", flexDirection: "column" }}>
      <Navbar variant="landing" />

      {/* ─── HEADER BANNER ────────────────────────────────────────────────── */}
      <Box
        sx={{
          width: "var(--size-full)",
          height: { xs: "300px", md: "400px" },
          position: "relative",
          bgcolor: "var(--color-primary)",
          backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000')`,
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
          >{t("landing.contactPage.title")}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Typography sx={{ color: "var(--color-white)", fontWeight: 'var(--font-semibold)' }}>{t("landing.contactPage.breadcrumbHome")}</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>/</Typography>
            <Typography sx={{ color: "var(--color-success)", fontWeight: 'var(--font-semibold)' }}>{t("landing.contactPage.title")}</Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <Box sx={{ flexGrow: 1, py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            
            {/* Left Column: Contact Form */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, color: "var(--color-slate-900)", mb: 4, fontSize: { xs: "2rem", md: "2.5rem" } }}>{t("landing.contactPage.formTitle")}</Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    placeholder={t("landing.blogDetailsPage.replyForm.website")} 
                    variant="outlined" 
                    sx={{}}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    placeholder={t("landing.blogDetailsPage.replyForm.name")} 
                    variant="outlined"
                    sx={{}}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    placeholder={t("landing.blogDetailsPage.replyForm.email")} 
                    variant="outlined"
                    sx={{}}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    placeholder={t("landing.blogDetailsPage.replyForm.phone")} 
                    variant="outlined"
                    sx={{}}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField 
                    fullWidth 
                    placeholder={t("landing.blogDetailsPage.replyForm.message")} 
                    variant="outlined" 
                    multiline 
                    rows={6}
                    sx={{}}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button 
                    variant="contained" 
                    disableElevation
                    sx={{ 
                      bgcolor: "var(--color-primary)", 
                      color: "var(--color-white)", 
                      fontWeight: 800, 
                      
                      px: 5, 
                      py: 1.8, 
                      borderRadius: 'var(--radius-md)',
                      textTransform: "none",
                      fontSize: 'var(--font-base)',
                      transition: "var(--transition-slow)",
                      "&:hover": { 
                        bgcolor: "var(--color-primary-hover)"
                      } 
                    }}
                  >{t("landing.blogDetailsPage.replyForm.submit")}</Button>
                </Grid>
              </Grid>
            </Grid>

            {/* Right Column: Contact Cards */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: { xs: 0, md: 8 } }}>
                
                <Paper elevation={0} sx={{ p: 4, borderRadius: 'var(--radius-lg)', border: "var(--border-thin) solid var(--color-slate-200)", display: "flex", alignItems: "flex-start", gap: 3, transition: "var(--transition-slow)", "&:hover": { borderColor: "var(--color-primary)" } }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 'var(--radius-full)', bgcolor: "rgba(0, 86, 179, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <DirectionsIcon sx={{ color: "var(--color-primary)", fontSize: "1.8rem" }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "var(--color-slate-900)", mb: 1, fontSize: 'var(--font-lg)' }}>{t("landing.contactPage.info.office")}</Typography>
                    <Typography sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.6 }}>
                      {t("landing.contactPage.info.officeDesc1")}<br />{t("landing.contactPage.info.officeDesc2")}</Typography>
                  </Box>
                </Paper>

                <Paper elevation={0} sx={{ p: 4, borderRadius: 'var(--radius-lg)', border: "var(--border-thin) solid var(--color-slate-200)", display: "flex", alignItems: "flex-start", gap: 3, transition: "var(--transition-slow)", "&:hover": { borderColor: "var(--color-success)" } }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 'var(--radius-full)', bgcolor: "rgba(40, 167, 69, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MailOutlineIcon sx={{ color: "var(--color-success)", fontSize: "1.8rem" }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "var(--color-slate-900)", mb: 1, fontSize: 'var(--font-lg)' }}>{t("landing.contactPage.info.email")}</Typography>
                    <Typography sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.6 }}>
                      {t("landing.contactPage.info.emailDesc1")}<br />{t("landing.contactPage.info.emailDesc2")}</Typography>
                  </Box>
                </Paper>

                <Paper elevation={0} sx={{ p: 4, borderRadius: 'var(--radius-lg)', border: "var(--border-thin) solid var(--color-slate-200)", display: "flex", alignItems: "flex-start", gap: 3, transition: "var(--transition-slow)", "&:hover": { borderColor: "var(--color-primary)" } }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 'var(--radius-full)', bgcolor: "rgba(0, 86, 179, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <HeadsetMicIcon sx={{ color: "var(--color-primary)", fontSize: "1.8rem" }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "var(--color-slate-900)", mb: 1, fontSize: 'var(--font-lg)' }}>{t("landing.contactPage.info.support")}</Typography>
                    <Typography sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.6 }}>
                      {t("landing.contactPage.info.supportDesc1")}<br />{t("landing.contactPage.info.supportDesc2")}</Typography>
                  </Box>
                </Paper>

              </Box>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* ─── GOOGLE MAP SECTION ───────────────────────────────────────────── */}
      <Box sx={{ width: "var(--size-full)", height: "500px", bgcolor: "var(--color-slate-50)", mb: { xs: -12, md: -16 } }}>
        <iframe
          src="https://maps.google.com/maps?q=Sonbhadra,%20Uttar%20Pradesh,%20India&t=&z=10&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0, display: "block" }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Map Location"
        />
      </Box>

      <LandingFooter />
    </Box>
  );
}
