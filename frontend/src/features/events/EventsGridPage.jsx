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
import Navbar from "../../components/navbar/Navbar";
import LandingFooter from "../../components/footer/LandingFooter";



import { useTranslation } from "../../hooks/useTranslation";
import { useBgPreloader } from "../../hooks/useBgPreloader";

export default function EventsGridPage() {
  const { t } = useTranslation();
  const { mockEvents } = dashboardMockData;
  useBgPreloader('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000');

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Box sx={{ minHeight: "var(--size-screen-h)", display: "flex", flexDirection: "column", bgcolor: "var(--color-slate-50)" }}>
      <Navbar variant="landing" />

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
              color: "var(--color-white)",
              fontSize: { xs: "2.5rem", md: "4rem" },
              fontWeight: 800,
              
              letterSpacing: "-1px",
              mb: 2
            }}
          >
            {t("landing.eventsPage.title")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Typography sx={{ color: "var(--color-white)", fontWeight: 'var(--font-semibold)' }}>{t("landing.eventsPage.home")}</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>/</Typography>
            <Typography sx={{ color: "var(--color-success)", fontWeight: 'var(--font-semibold)' }}>{t("landing.eventsPage.title")}</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          
          {/* ─── TOOLBAR SECTION ──────────────────────────────────────────────── */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: "var(--color-primary)",
              borderRadius: 'var(--radius-md)',
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
                <IconButton size="small" sx={{ color: "var(--color-white)" }}>
                  <ViewModuleIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: "rgba(255,255,255,0.4)" }}>
                  <ViewListIcon />
                </IconButton>
              </Box>
              <Typography sx={{ color: "var(--color-white)", fontSize: 'var(--font-base)', fontWeight: 'var(--font-medium)' }}>
                {t("landing.eventsPage.showingResults").replace("{{count}}", mockEvents.length)}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(8px)",
                borderRadius: 'var(--radius-lg)', // Pill shape like dashboard navbar
                px: 2,
                width: { xs: "var(--size-full)", sm: "320px" },
                height: "44px", // Match navbar search height
                boxSizing: "border-box",
                border: "var(--border-thin) solid rgba(255, 255, 255, 0.3)",
                transition: "var(--transition-slow)",
                "&:focus-within": {
                  bgcolor: "rgba(255, 255, 255, 0.25)",
                  border: "var(--border-thin) solid rgba(255, 255, 255, 0.5)"
                }
              }}
            >
              <SearchIcon sx={{ color: 'var(--color-white)', fontSize: 22, opacity: 0.8, mr: 1 }} />
              <InputBase
                placeholder={t("landing.eventsPage.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ 
                  flex: 1, 
                  fontSize: 'var(--font-base)', 
                  color: "var(--color-white)", 
                  height: "var(--size-full)",
                  "& input::placeholder": {
                    color: "rgba(255, 255, 255, 0.7)",
                    opacity: 1,
                    fontWeight: 'var(--font-medium)'
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
                    overflow: "hidden",
                    transition: "transform var(--transition-slow), box-shadow var(--transition-slow)",
                    "&:hover": {
                       
                    },
                    display: "flex",
                    flexDirection: "column",
                    height: "var(--size-full)"
                  }}
                >
                  <Box sx={{ position: "relative", height: 220 }}>
                    <Box component="img" src={event.image} alt={event.title} sx={{ width: "var(--size-full)", height: "var(--size-full)", objectFit: "cover" }} />
                  </Box>
                  <Box sx={{ p: 4, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Chip
                      label={t(event.tag)}
                      sx={{ 
                        alignSelf: "flex-start", 
                        bgcolor: "rgba(40,167,69,0.1)", 
                        color: "var(--color-success)", 
                        fontWeight: 'var(--font-bold)', 
                        borderRadius: 'var(--radius-md)', 
                        height: 28, 
                        fontSize: 'var(--font-xs)', 
                        mb: 2 
                      }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-slate-900)", fontSize: "1.25rem", lineHeight: 1.3, mb: 2, flexGrow: 1 }}>
                      {t(event.title)}
                    </Typography>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, color: "var(--color-slate-500)", fontSize: 'var(--font-sm)', fontWeight: 'var(--font-semibold)', mb: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CalendarTodayIcon sx={{ fontSize: 18, color: "var(--color-primary)" }} /> {t(event.date)}
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 18, color: "var(--color-primary)" }} /> {t(event.time)}
                      </Box>
                    </Box>
                    
                    <Typography sx={{ color: "var(--color-slate-500)", lineHeight: 1.6, mb: 4, fontSize: 'var(--font-base)' }}>
                      {t(event.desc)}
                    </Typography>
                    
                    <Button
                      variant="contained" 
                      disableElevation
                      sx={{ 
                        bgcolor: "var(--color-primary)", 
                        color: "var(--color-white)", 
                        fontWeight: 'var(--font-bold)', 
                        borderRadius: 'var(--radius-md)', 
                        py: 1.2, 
                        "&:hover": { bgcolor: "var(--color-primary-hover)" }, 
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
                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%)",
                color: "var(--color-white)",
                fontWeight: 'var(--font-bold)',
                borderRadius: 'var(--radius-md)',
                px: 5,
                py: 1.5,
                "&:hover": { background: "linear-gradient(135deg, #004494 0%, var(--color-success) 100%)" },
                textTransform: "none",
                fontSize: 'var(--font-base)'
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
