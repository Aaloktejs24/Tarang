"use client";

import mockData from '../../data/dashboardMockData.json';
const { dashboardMockData: dashboardMockData } = mockData;

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  InputBase,
  IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LandingNavbar from "../../components/navbar/LandingNavbar";
import LandingFooter from "../../components/footer/LandingFooter";



import { useTranslation } from "../../hooks/useTranslation";

export default function EventsGridPage() {
  const { t } = useTranslation();
const { mockEvents } = dashboardMockData;

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f8faff" }}>
      <LandingNavbar />

      {/* ─── HERO SECTION ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          height: { xs: "300px", md: "400px" },
          position: "relative",
          backgroundImage: `url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 86, 179, 0.6)",
          }
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", mt: 6 }}>
          <Typography
            variant="h1"
            sx={{
              color: "#ffffff",
              fontSize: { xs: "2.5rem", md: "4rem" },
              fontWeight: 800,
              
              letterSpacing: "-1px",
              mb: 2
            }}
          >
            {t("landing.eventsPage.title")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Typography sx={{ color: "#ffffff", fontWeight: 600 }}>{t("landing.eventsPage.home")}</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>/</Typography>
            <Typography sx={{ color: "#28a745", fontWeight: 600 }}>{t("landing.eventsPage.title")}</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          
          {/* ─── TOOLBAR SECTION ──────────────────────────────────────────────── */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: "#0056b3",
              borderRadius: "8px",
              p: 2,
              mb: 6,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton size="small" sx={{ color: "#fff" }}>
                  <ViewModuleIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: "rgba(255,255,255,0.4)" }}>
                  <ViewListIcon />
                </IconButton>
              </Box>
              <Typography sx={{ color: "#fff", fontSize: "0.95rem", fontWeight: 500 }}>
                {t("landing.eventsPage.showingResults").replace("{{count}}", mockEvents.length)}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(8px)",
                borderRadius: "24px", // Pill shape like dashboard navbar
                px: 2,
                width: { xs: "100%", sm: "320px" },
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                height: "44px", // Match navbar search height
                boxSizing: "border-box",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                transition: "all 0.3s ease",
                "&:focus-within": {
                  bgcolor: "rgba(255, 255, 255, 0.25)",
                  border: "1px solid rgba(255, 255, 255, 0.5)"
                }
              }}
            >
              <SearchIcon sx={{ color: '#ffffff', fontSize: 22, opacity: 0.8, mr: 1 }} />
              <InputBase
                placeholder={t("landing.eventsPage.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ 
                  flex: 1, 
                  fontSize: "15px", 
                  color: "#ffffff", 
                  height: "100%",
                  "& input::placeholder": {
                    color: "rgba(255, 255, 255, 0.7)",
                    opacity: 1,
                    fontWeight: 500
                  }
                }}
              />
            </Box>
          </Paper>

          {/* ─── EVENTS GRID ──────────────────────────────────────────────────── */}
          <Grid container spacing={4}>
            {mockEvents.map((event) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                       
                    },
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    bgcolor: "#ffffff"
                  }}
                >
                  <Box sx={{ position: "relative", height: 220 }}>
                    <Box component="img" src={event.image} alt={event.title} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </Box>
                  <Box sx={{ p: 4, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Chip
                      label={t(event.tag)}
                      sx={{ 
                        alignSelf: "flex-start", 
                        bgcolor: "rgba(40,167,69,0.1)", 
                        color: "#28a745", 
                        fontWeight: 700, 
                        borderRadius: "8px", 
                        height: 28, 
                        fontSize: "0.8rem", 
                        mb: 2 
                      }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.25rem", lineHeight: 1.3, mb: 2, flexGrow: 1 }}>
                      {t(event.title)}
                    </Typography>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, color: "#64748b", fontSize: "0.9rem", fontWeight: 600, mb: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CalendarTodayIcon sx={{ fontSize: 18, color: "#0056b3" }} /> {t(event.date)}
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 18, color: "#0056b3" }} /> {t(event.time)}
                      </Box>
                    </Box>
                    
                    <Typography sx={{ color: "#64748b", lineHeight: 1.6, mb: 4, fontSize: "0.95rem" }}>
                      {t(event.desc)}
                    </Typography>
                    
                    <Button
                      variant="contained" 
                      disableElevation
                      sx={{ 
                        bgcolor: "#0056b3", 
                        color: "#fff", 
                        fontWeight: 700, 
                        borderRadius: "8px", 
                        py: 1.2, 
                        "&:hover": { bgcolor: "#004494" }, 
                        textTransform: "none",
                        alignSelf: "flex-start"
                      }}
                    >
                      {t("landing.sections.joinEvent")}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <Button
              variant="contained"
              disableElevation
              sx={{
                background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
                color: "#fff",
                fontWeight: 700,
                borderRadius: "8px",
                px: 5,
                py: 1.5,
                "&:hover": { background: "linear-gradient(135deg, #004494 0%, #218838 100%)" },
                textTransform: "none",
                fontSize: "1rem"
              }}
            >
              {t("landing.eventsPage.viewMore")}
            </Button>
          </Box>
          
        </Container>
      </Box>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <LandingFooter />

    </Box>
  );
}
