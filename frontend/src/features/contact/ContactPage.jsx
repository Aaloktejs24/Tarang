"use client";

import React from "react";
import { Box, Container, Typography, TextField, Button, Paper, Grid } from "@mui/material";
import DirectionsIcon from "@mui/icons-material/Directions";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import LandingNavbar from "../../components/navbar/LandingNavbar";
import LandingFooter from "../../components/footer/LandingFooter";
import { useTranslation } from "../../hooks/useTranslation";

export default function ContactPage() {
  const { t } = useTranslation();
  return (
    <Box sx={{ bgcolor: "#ffffff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <LandingNavbar />

      {/* ─── HEADER BANNER ────────────────────────────────────────────────── */}
      <Box
        sx={{
          width: "100%",
          height: { xs: "300px", md: "400px" },
          position: "relative",
          bgcolor: "#0056b3",
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
              color: "#ffffff",
              fontSize: { xs: "2.5rem", md: "4rem" },
              fontWeight: 800,
              fontFamily: "'Rozha One', serif",
              letterSpacing: "-1px",
              mb: 2,
            }}
          >{t("landing.contactPage.title")}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Typography sx={{ color: "#ffffff", fontWeight: 600 }}>{t("landing.contactPage.breadcrumbHome")}</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>/</Typography>
            <Typography sx={{ color: "#28a745", fontWeight: 600 }}>{t("landing.contactPage.title")}</Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <Box sx={{ flexGrow: 1, py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            
            {/* Left Column: Contact Form */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", mb: 4, fontFamily: "'Rozha One', serif", fontSize: { xs: "2rem", md: "2.5rem" } }}>{t("landing.contactPage.formTitle")}</Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    placeholder={t("landing.contactPage.form.website")} 
                    variant="outlined" 
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        bgcolor: "#ffffff",
                        "& fieldset": { borderColor: "#e2e8f0" },
                        "&:hover fieldset": { borderColor: "#cbd5e1" },
                        "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "2px" }
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    placeholder={t("landing.contactPage.form.name")} 
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        bgcolor: "#ffffff",
                        "& fieldset": { borderColor: "#e2e8f0" },
                        "&:hover fieldset": { borderColor: "#cbd5e1" },
                        "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "2px" }
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    placeholder={t("landing.contactPage.form.email")} 
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        bgcolor: "#ffffff",
                        "& fieldset": { borderColor: "#e2e8f0" },
                        "&:hover fieldset": { borderColor: "#cbd5e1" },
                        "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "2px" }
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    placeholder={t("landing.contactPage.form.phone")} 
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        bgcolor: "#ffffff",
                        "& fieldset": { borderColor: "#e2e8f0" },
                        "&:hover fieldset": { borderColor: "#cbd5e1" },
                        "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "2px" }
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField 
                    fullWidth 
                    placeholder={t("landing.contactPage.form.message")} 
                    variant="outlined" 
                    multiline 
                    rows={6}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        bgcolor: "#ffffff",
                        "& fieldset": { borderColor: "#e2e8f0" },
                        "&:hover fieldset": { borderColor: "#cbd5e1" },
                        "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "2px" }
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button 
                    variant="contained" 
                    disableElevation
                    sx={{ 
                      bgcolor: "#0056b3", 
                      color: "#fff", 
                      fontWeight: 800, 
                      
                      px: 5, 
                      py: 1.8, 
                      borderRadius: "8px",
                      textTransform: "none",
                      fontSize: "1rem",
                      transition: "all 0.3s ease",
                      "&:hover": { 
                        bgcolor: "#004494"
                      } 
                    }}
                  >{t("landing.contactPage.form.submit")}</Button>
                </Grid>
              </Grid>
            </Grid>

            {/* Right Column: Contact Cards */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: { xs: 0, md: 8 } }}>
                
                <Paper elevation={0} sx={{ p: 4, borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", gap: 3, transition: "all 0.3s ease", "&:hover": { borderColor: "#0056b3" } }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "rgba(0, 86, 179, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <DirectionsIcon sx={{ color: "#0056b3", fontSize: "1.8rem" }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1, fontSize: "1.1rem" }}>{t("landing.contactPage.info.office")}</Typography>
                    <Typography sx={{ color: "#475569", fontSize: "0.95rem", lineHeight: 1.6 }}>
                      {t("landing.contactPage.info.officeDesc1")}<br />{t("landing.contactPage.info.officeDesc2")}</Typography>
                  </Box>
                </Paper>

                <Paper elevation={0} sx={{ p: 4, borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", gap: 3, transition: "all 0.3s ease", "&:hover": { borderColor: "#28a745" } }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "rgba(40, 167, 69, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MailOutlineIcon sx={{ color: "#28a745", fontSize: "1.8rem" }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1, fontSize: "1.1rem" }}>{t("landing.contactPage.info.email")}</Typography>
                    <Typography sx={{ color: "#475569", fontSize: "0.95rem", lineHeight: 1.6 }}>
                      {t("landing.contactPage.info.emailDesc1")}<br />{t("landing.contactPage.info.emailDesc2")}</Typography>
                  </Box>
                </Paper>

                <Paper elevation={0} sx={{ p: 4, borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", gap: 3, transition: "all 0.3s ease", "&:hover": { borderColor: "#0056b3" } }}>
                  <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "rgba(0, 86, 179, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <HeadsetMicIcon sx={{ color: "#0056b3", fontSize: "1.8rem" }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1, fontSize: "1.1rem" }}>{t("landing.contactPage.info.support")}</Typography>
                    <Typography sx={{ color: "#475569", fontSize: "0.95rem", lineHeight: 1.6 }}>
                      {t("landing.contactPage.info.supportDesc1")}<br />{t("landing.contactPage.info.supportDesc2")}</Typography>
                  </Box>
                </Paper>

              </Box>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* ─── GOOGLE MAP SECTION ───────────────────────────────────────────── */}
      <Box sx={{ width: "100%", height: "500px", bgcolor: "#f1f5f9", mb: { xs: -12, md: -16 } }}>
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
