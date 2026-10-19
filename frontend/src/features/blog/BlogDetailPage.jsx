"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckIcon from "@mui/icons-material/Check";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ReplyIcon from "@mui/icons-material/Reply";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Navbar from "../../components/navbar/Navbar";
import LandingFooter from "../../components/footer/LandingFooter";
import { useTranslation } from "../../hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { useBgPreloader } from "../../hooks/useBgPreloader";

export default function BlogDetailPage() {
  const { t } = useTranslation();
  useBgPreloader('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Implement scroll listener for scroll-to-top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ minHeight: "var(--size-screen-h)", display: "flex", flexDirection: "column", bgcolor: "transparent" }}>
      <Navbar variant="landing" />

      {/* ─── HERO SECTION ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          height: { xs: "300px", md: "400px" },
          position: "relative",
          bgcolor: "var(--color-primary)",
          backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000')`, // Students working
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
              mb: 2
            }}
          >{t("landing.blogPage.title")}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Typography sx={{ color: "var(--color-white)", fontWeight: 'var(--font-semibold)' }}>{t("landing.blogPage.breadcrumbHome")}</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>/</Typography>
            <Typography sx={{ color: "var(--color-success)", fontWeight: 'var(--font-semibold)' }}>{t("landing.blogPage.title")}</Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <Box sx={{ flexGrow: 1, py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            
            {/* ─── LEFT SIDEBAR ─────────────────────────────────────────────── */}
            <Grid size={{ xs: 12, md: 4 }}>
              
              {/* Categories Widget */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 'var(--radius-lg)', border: "var(--border-thin) solid rgba(0,0,0,0.05)", mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-slate-900)", mb: 3 }}>{t("landing.blogPage.categories.title")}</Typography>
                <List disablePadding>
                  {[
                    t("landing.blogPage.categories.cat1"),
                    t("landing.blogPage.categories.cat2"),
                    t("landing.blogPage.categories.cat3"),
                    t("landing.blogPage.categories.cat4"),
                    t("landing.blogPage.categories.cat5")
                  ].map((cat, i) => (
                    <ListItem key={i} disablePadding sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "var(--size-full)", cursor: "pointer", "&:hover": { color: "var(--color-success)" } }}>
                        <Typography sx={{ color: "var(--color-slate-500)", fontWeight: 'var(--font-medium)', fontSize: 'var(--font-base)', transition: "color var(--transition-base)" }}>
                          {cat}
                        </Typography>
                        <ChevronRightIcon sx={{ color: "var(--color-slate-900)", fontSize: 20 }} />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>

              {/* Recent Post Widget */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 'var(--radius-lg)', border: "var(--border-thin) solid rgba(0,0,0,0.05)" }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-slate-900)", mb: 3 }}>{t("landing.blogPage.recentPost.title")}</Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3, cursor: "pointer", "&:hover .post-title": { color: "var(--color-primary)" } }}>
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=200"
                    sx={{ width: 70, height: 70, borderRadius: 'var(--radius-md)', objectFit: "cover" }}
                  />
                  <Box>
                    <Typography sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-xs)', fontWeight: 'var(--font-semibold)', mb: 0.5 }}>{t("landing.blogPage.recentPost.date")}</Typography>
                    <Typography className="post-title" sx={{ color: "var(--color-slate-900)", fontWeight: 'var(--font-bold)', fontSize: 'var(--font-base)', lineHeight: 1.4, transition: "color var(--transition-base)" }}>{t("landing.blogPage.recentPost.postTitle")}</Typography>
                  </Box>
                </Box>
              </Paper>

            </Grid>

            {/* ─── RIGHT MAIN CONTENT ───────────────────────────────────────── */}
            <Grid size={{ xs: 12, md: 8 }}>
              
              {/* Featured Image */}
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200" // Students image
                sx={{ width: "var(--size-full)", height: { xs: "300px", md: "500px" }, borderRadius: 'var(--radius-lg)', objectFit: "cover", mb: 5 }}
              />

              {/* Title and Meta */}
              <Typography variant="h2" sx={{ fontWeight: 800, color: "var(--color-slate-900)", fontSize: { xs: "1.8rem", md: "2.2rem" }, mb: 2, }}>{t("landing.blogPage.mainPost.title")}</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "var(--color-primary)" }}>
                  <CalendarTodayIcon sx={{ fontSize: 20 }} />
                  <Typography sx={{ color: "var(--color-slate-500)", fontWeight: 'var(--font-medium)', fontSize: 'var(--font-base)' }}>{t("landing.blogPage.mainPost.date")}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "var(--color-primary)" }}>
                  <AccessTimeIcon sx={{ fontSize: 20 }} />
                  <Typography sx={{ color: "var(--color-slate-500)", fontWeight: 'var(--font-medium)', fontSize: 'var(--font-base)' }}>{t("landing.blogPage.mainPost.time")}</Typography>
                </Box>
              </Box>

              {/* Paragraphs */}
              <Typography sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.8, mb: 3 }}>{t("landing.blogPage.mainPost.p1")}</Typography>
              <Typography sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.8, mb: 5 }}>{t("landing.blogPage.mainPost.p1")}</Typography>

              {/* Blockquote */}
              <Box sx={{ bgcolor: "var(--color-slate-50)", borderRadius: 'var(--radius-lg)', p: { xs: 4, md: 6 }, mb: 6, display: "flex", gap: 3, alignItems: "flex-start" }}>
                <Typography sx={{ color: "var(--color-primary)", fontSize: "6rem", lineHeight: 0.8, fontWeight: 900, mt: -2 }}>
                  “
                </Typography>
                <Typography sx={{ color: "var(--color-slate-900)", fontSize: 'var(--font-lg)', lineHeight: 1.8, fontWeight: 'var(--font-medium)' }}>{t("landing.blogPage.mainPost.quote")}</Typography>
              </Box>

              {/* Blog Text Content */}
              <Box sx={{ mb: 6 }}>
                {[
                  t("landing.blogPage.mainPost.list1"),
                  t("landing.blogPage.mainPost.list2"),
                  t("landing.blogPage.mainPost.list3"),
                  t("landing.blogPage.mainPost.list2"),
                  t("landing.blogPage.mainPost.list4")
                ].map((text, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2.5 }}>
                    <CheckIcon sx={{ color: "var(--color-success)", fontSize: 22, mt: 0.2 }} />
                    <Typography sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.6 }}>
                      {text}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Share / Metrics Bar */}
              <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 3, mb: 5 }}>
                <Box sx={{ display: "flex", gap: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "var(--color-primary)", cursor: "pointer", "&:hover": { color: "var(--color-success)" } }}>
                    <FavoriteBorderIcon fontSize="small" />
                    <Typography sx={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-base)' }}>14</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "var(--color-primary)", cursor: "pointer", "&:hover": { color: "var(--color-success)" } }}>
                    <VisibilityOutlinedIcon fontSize="small" />
                    <Typography sx={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-base)' }}>21</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "var(--color-primary)", cursor: "pointer", "&:hover": { color: "var(--color-success)" } }}>
                    <ChatBubbleOutlineIcon fontSize="small" />
                    <Typography sx={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-base)' }}>03</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ color: "var(--color-slate-900)", fontWeight: 'var(--font-bold)', fontSize: 'var(--font-base)', mr: 1 }}>{t("landing.blogPage.share.title")}</Typography>
                  {[<FacebookIcon key="fb"/>, <TwitterIcon key="tw"/>, <InstagramIcon key="ig"/>, <LinkedInIcon key="li"/>].map((icon, i) => (
                    <Box key={i} sx={{ color: "var(--color-primary)", cursor: "pointer", "&:hover": { color: "var(--color-success)" }, transition: "color var(--transition-base)" }}>
                      {React.cloneElement(icon, { sx: { fontSize: 20 } })}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Pagination Block */}
              <Box sx={{ display: "flex", border: "var(--border-thin) solid rgba(0,0,0,0.06)", borderRadius: 'var(--radius-md)', overflow: "hidden", mb: 8 }}>
                <Box sx={{ flex: 1, display: "flex", p: 3, cursor: "pointer", "&:hover": { bgcolor: "var(--color-slate-50)" }, borderRight: "var(--border-thin) solid rgba(0,0,0,0.06)", transition: "background var(--transition-base)" }}>
                  <Typography sx={{ fontWeight: 'var(--font-bold)', color: "var(--color-slate-500)", fontSize: 'var(--font-sm)', mr: 2, minWidth: "40px" }}>{t("landing.blogPage.pagination.prev")}</Typography>
                  <Typography sx={{ fontWeight: 'var(--font-semibold)', color: "var(--color-slate-900)", fontSize: 'var(--font-base)' }}>{t("landing.blogPage.pagination.titleStr")}</Typography>
                </Box>
                <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", p: 3, cursor: "pointer", "&:hover": { bgcolor: "var(--color-slate-50)" }, transition: "background var(--transition-base)" }}>
                  <Typography sx={{ fontWeight: 'var(--font-semibold)', color: "var(--color-slate-900)", fontSize: 'var(--font-base)', mr: 2 }}>{t("landing.blogPage.pagination.titleStr")}</Typography>
                  <Typography sx={{ fontWeight: 'var(--font-bold)', color: "var(--color-slate-500)", fontSize: 'var(--font-sm)', minWidth: "40px", textAlign: "right" }}>{t("landing.blogPage.pagination.next")}</Typography>
                </Box>
              </Box>

              {/* Comments Section */}
              <Typography variant="h3" sx={{ fontWeight: 900, color: "var(--color-slate-900)", mb: 4, }}>{t("landing.blogPage.comments.title")}</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 8 }}>
                
                {/* Comment 1 */}
                <Box sx={{ display: "flex", gap: 3, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
                  <Avatar src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150" sx={{ width: 70, height: 70 }} />
                  <Paper elevation={0} sx={{ flex: 1, p: 4, borderRadius: 'var(--radius-lg)', border: "var(--border-thin) solid rgba(0,0,0,0.04)" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Typography sx={{ fontWeight: 800, color: "var(--color-slate-900)", fontSize: 'var(--font-lg)' }}>
                        Alice Williams
                      </Typography>
                      <Button startIcon={<ReplyIcon />} sx={{ color: "var(--color-primary)", fontWeight: 'var(--font-bold)', textTransform: "none", "&:hover": { color: "var(--color-success)", bgcolor: "transparent" } }}>{t("landing.blogPage.comments.replyBtn")}</Button>
                    </Box>
                    <Typography sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.6 }}>{t("landing.blogPage.comments.c1.text")}</Typography>
                  </Paper>
                </Box>

                {/* Comment 2 */}
                <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", sm: "row-reverse" } }}>
                  <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" sx={{ width: 70, height: 70 }} />
                  <Paper elevation={0} sx={{ flex: 1, p: 4, borderRadius: 'var(--radius-lg)', border: "var(--border-thin) solid rgba(0,0,0,0.04)" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Typography sx={{ fontWeight: 800, color: "var(--color-slate-900)", fontSize: 'var(--font-lg)' }}>
                        Mellissa Doe
                      </Typography>
                      <Button startIcon={<ReplyIcon />} sx={{ color: "var(--color-primary)", fontWeight: 'var(--font-bold)', textTransform: "none", "&:hover": { color: "var(--color-success)", bgcolor: "transparent" } }}>{t("landing.blogPage.comments.replyBtn")}</Button>
                    </Box>
                    <Typography sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.6 }}>{t("landing.blogPage.comments.c2.text")}</Typography>
                  </Paper>
                </Box>

                {/* Comment 3 */}
                <Box sx={{ display: "flex", gap: 3, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
                  <Avatar src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150" sx={{ width: 70, height: 70 }} />
                  <Paper elevation={0} sx={{ flex: 1, p: 4, borderRadius: 'var(--radius-lg)', border: "var(--border-thin) solid rgba(0,0,0,0.04)" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Typography sx={{ fontWeight: 800, color: "var(--color-slate-900)", fontSize: 'var(--font-lg)' }}>
                        Felica Queen
                      </Typography>
                      <Button startIcon={<ReplyIcon />} sx={{ color: "var(--color-primary)", fontWeight: 'var(--font-bold)', textTransform: "none", "&:hover": { color: "var(--color-success)", bgcolor: "transparent" } }}>{t("landing.blogPage.comments.replyBtn")}</Button>
                    </Box>
                    <Typography sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.6 }}>{t("landing.blogPage.comments.c3.text")}</Typography>
                  </Paper>
                </Box>

                {/* Comment 4 */}
                <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", sm: "row-reverse" } }}>
                  <Avatar src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150" sx={{ width: 70, height: 70 }} />
                  <Paper elevation={0} sx={{ flex: 1, p: 4, borderRadius: 'var(--radius-lg)', border: "var(--border-thin) solid rgba(0,0,0,0.04)" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Typography sx={{ fontWeight: 800, color: "var(--color-slate-900)", fontSize: 'var(--font-lg)' }}>
                        Paul Flavius
                      </Typography>
                      <Button startIcon={<ReplyIcon />} sx={{ color: "var(--color-primary)", fontWeight: 'var(--font-bold)', textTransform: "none", "&:hover": { color: "var(--color-success)", bgcolor: "transparent" } }}>{t("landing.blogPage.comments.replyBtn")}</Button>
                    </Box>
                    <Typography sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.6 }}>{t("landing.blogPage.comments.c4.text")}</Typography>
                  </Paper>
                </Box>

              </Box>

              {/* Leave a Reply Form */}
              <Typography variant="h3" sx={{ fontWeight: 900, color: "var(--color-slate-900)", mb: 4, }}>{t("landing.blogPage.replyForm.title")}</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth placeholder={t("landing.blogPage.replyForm.website")} variant="outlined" sx={{}} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth placeholder={t("landing.blogPage.replyForm.name")} variant="outlined" sx={{}} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth placeholder={t("landing.blogPage.replyForm.email")} variant="outlined" sx={{}} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth placeholder={t("landing.blogPage.replyForm.phone")} variant="outlined" sx={{}} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth placeholder={t("landing.blogPage.replyForm.message")} variant="outlined" multiline rows={6} sx={{}} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    disableElevation
                    sx={{
                      mt: 2,
                      px: 4,
                      py: 1.5,
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 800,
                      
                      fontSize: 'var(--font-base)',
                      bgcolor: "var(--color-primary)",
                      color: "var(--color-white)",
                      "&:hover": { bgcolor: "var(--color-primary-hover)" },
                      transition: "var(--transition-slow)",
                      textTransform: "none",
                    }}
                  >{t("landing.blogPage.replyForm.submit")}</Button>
                </Grid>
              </Grid>

            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <LandingFooter />

      {/* ─── SCROLL TO TOP BUTTON ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showScrollTop && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            sx={{
              position: "fixed",
              bottom: 40,
              right: 40,
              zIndex: 'var(--z-dropdown)',
              bgcolor: "var(--color-success)",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              borderRadius: 'var(--radius-lg)',
              "&:hover": { bgcolor: "var(--color-success)" },
              transition: "var(--transition-slow)",
            }}
          >
            <ArrowUpwardIcon sx={{ color: "var(--color-white)", fontSize: 24 }} />
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
}
