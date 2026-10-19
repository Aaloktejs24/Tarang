"use client";

import mockData from '../../data/dashboardMockData.json';
import courseConfig from '../../data/courseConfig.json';
const { dashboardMockData: dashboardMockData } = mockData;
const { contentFormats } = courseConfig;
import React from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Box, Typography, Container, Grid, Card, CardContent, Avatar, IconButton, Button } from "@mui/material";
import { motion } from "framer-motion";
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ArticleIcon from '@mui/icons-material/Article';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import StarIcon from '@mui/icons-material/Star';
import PollIcon from '@mui/icons-material/Poll';
import QuizIcon from '@mui/icons-material/Quiz';
import TerminalIcon from '@mui/icons-material/Terminal';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import CodeIcon from '@mui/icons-material/Code';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { Checkbox, FormControlLabel, Divider } from "@mui/material";
import { useRouter } from "next/navigation";
import FeedMobileFilter from "./FeedMobileFilter";

const checkboxStyles = {
  color: "#64748b",
  padding: "4px",
  "&.Mui-checked": {
    color: "#0056b3",
  },
  "& + .MuiFormControlLabel-label": {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#334155",
    letterSpacing: "0.2px",
  },
};

const FilterRow = ({ icon, label, checked, onChange }) => (
  <Box sx={{
    display: "flex",
    alignItems: "center",
    px: 1,
    py: 0.2,
    borderRadius: "8px",
    transition: "all 0.2s ease",
    cursor: "pointer",
    mb: 0.5,
    border: checked ? "1px solid rgba(0, 86, 179, 0.15)" : "1px solid transparent",
    background: checked ? "rgba(0, 86, 179, 0.04)" : "transparent",
    '&:hover': {
      backgroundColor: "rgba(0, 86, 179, 0.08)",
      transform: "translateX(4px)",
    }
  }} onClick={onChange}>
    <FormControlLabel
      sx={{ m: 0, width: "100%" }}
      control={
        <Checkbox
          size="small"
          sx={checkboxStyles}
          checked={checked}
          onChange={(e) => {
            e.stopPropagation();
            onChange();
          }}
        />
      }
      label={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {React.cloneElement(icon, { sx: { fontSize: 18, color: checked ? "#0056b3" : "#64748b", opacity: checked ? 1 : 0.7 } })}
          <Typography sx={{ fontWeight: 600, fontSize: "0.92rem", color: checked ? "#0056b3" : "#475569" }}>
            {label}
          </Typography>
        </Box>
      }
    />
  </Box>
);

const { feedItems } = dashboardMockData;

const getIcon = (type, color, size = 20) => {
  switch (type) {
    case 'video': return <PlayCircleFilledIcon sx={{ color, fontSize: size }} />;
    case 'pdf': return <PictureAsPdfIcon sx={{ color, fontSize: size }} />;
    case 'ppt': return <SlideshowIcon sx={{ color, fontSize: size }} />;
    case 'audio': return <GraphicEqIcon sx={{ color, fontSize: size }} />;
    case 'article': return <ArticleIcon sx={{ color, fontSize: size }} />;
    case 'quiz': return <QuizIcon sx={{ color, fontSize: size }} />;
    case 'poll': return <PollIcon sx={{ color, fontSize: size }} />;
    case 'hackathon': return <TerminalIcon sx={{ color, fontSize: size }} />;
    case 'news': return <NewspaperIcon sx={{ color, fontSize: size }} />;
    case 'journal': return <MenuBookIcon sx={{ color, fontSize: size }} />;
    case 'webinar': return <OndemandVideoIcon sx={{ color, fontSize: size }} />;
    case 'case_study': return <AssignmentIcon sx={{ color, fontSize: size }} />;
    case 'interview': return <RecordVoiceOverIcon sx={{ color, fontSize: size }} />;
    case 'code': return <CodeIcon sx={{ color, fontSize: size }} />;
    case 'ebook': return <AutoStoriesIcon sx={{ color, fontSize: size }} />;
    default: return <ArticleIcon sx={{ color, fontSize: size }} />;
  }
};

export default function FlowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const filters = searchParams.getAll("filter");

  const handleToggle = (type) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    const values = current.getAll("filter");

    current.delete("filter");
    if (values.includes(type)) {
      values.filter(v => v !== type).forEach(v => current.append("filter", v));
    } else {
      values.push(type);
      values.forEach(v => current.append("filter", v));
    }

    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const isChecked = (type) => filters.includes(type);

  // Format filters (Group 1 in UI)
  const activeFormats = filters.filter(f => contentFormats.includes(f));

  // Topic/Category filters (Group 2 in UI)
  const activeCategories = filters.filter(f => !contentFormats.includes(f));

  // Multi-dimensional filter mapping logic exactly satisfying user requirements:
  // 1. Within a single group: OR behavior (e.g., Selecting Video & Audio returns both)
  // 2. Across different groups: AND behavior (e.g., Selecting Video & Hackathon returns ONLY things that are BOTH)
  const filteredItems = feedItems.filter(item => {
    const itemFormats = item.types.filter(t => contentFormats.includes(t));
    const itemCategories = item.types.filter(t => !contentFormats.includes(t));

    const matchesFormat = activeFormats.length === 0 ||
      activeFormats.some(f => itemFormats.includes(f));

    const matchesCategory = activeCategories.length === 0 ||
      activeCategories.some(c => itemCategories.includes(c));

    return matchesFormat && matchesCategory;
  });

  return (
    <>

      {/* ─── SCROLLABLE CONTENT LAYER ─── */}
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)", // Note: keeping 64px safe-area
          position: "relative",
          pt: 4 // Exactly 32px padding top. Total Y-Origin = 72px(Navbar) + 32px = 104px
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 4, md: 6, lg: 8 }, pb: 10, zIndex: 1, position: "relative" }}>

          <Grid container spacing={4} sx={{ width: "100%", m: 0 }}>

            {/* ─── LEFT FIXED FILTER SIDEBAR (Hidden on mobile) ─── */}
            <Grid size={{ xs: 12, md: 3, lg: 2.5 }} sx={{ display: { xs: 'none', md: 'block' }, pr: { md: 2 } }}>
              <Box sx={{
                position: "sticky",
                top: "104px",
                background: "transparent",
                border: "none",
                boxShadow: "none",
                transition: "all 0.3s ease",
                p: { md: 1, lg: 2 },
                height: "calc(100vh - 160px)",
                overflowY: "auto",
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0, 86, 179, 0.2)', borderRadius: "8px" },
                '&:hover::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0, 86, 179, 0.4)' },
              }}>
                <Box sx={{ mb: 5 }}>
                  <Typography variant="h6" sx={{ 
                    color: "#0f172a", 
                    fontWeight: 800, 
                    mb: 2.5, 
                    fontSize: "1.05rem",
                    display: 'inline-block',
                    position: 'relative',
                    pb: 0.5,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '60px',
                      height: '3px',
                      background: 'linear-gradient(90deg, #ffc107 0%, transparent 100%)',
                      borderRadius: '2px'
                    }
                  }}>
                    फ़ॉर्मेट
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <FilterRow icon={<PlayCircleFilledIcon />} label="वीडियो" checked={isChecked('video')} onChange={() => handleToggle('video')} />
                    <FilterRow icon={<GraphicEqIcon />} label="आडियो" checked={isChecked('audio')} onChange={() => handleToggle('audio')} />
                    <FilterRow icon={<PictureAsPdfIcon />} label="पीडीऍफ़" checked={isChecked('pdf')} onChange={() => handleToggle('pdf')} />
                    <FilterRow icon={<AutoStoriesIcon />} label="ई-बुक" checked={isChecked('ebook')} onChange={() => handleToggle('ebook')} />
                    <FilterRow icon={<ArticleIcon />} label="लेख" checked={isChecked('article')} onChange={() => handleToggle('article')} />
                    <FilterRow icon={<CodeIcon />} label="कोड" checked={isChecked('code')} onChange={() => handleToggle('code')} />
                    <FilterRow icon={<QuizIcon />} label="क्विज़" checked={isChecked('quiz')} onChange={() => handleToggle('quiz')} />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ 
                    color: "#0f172a", 
                    fontWeight: 800, 
                    mb: 2.5, 
                    fontSize: "1.05rem",
                    display: 'inline-block',
                    position: 'relative',
                    pb: 0.5,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '60px',
                      height: '3px',
                      background: 'linear-gradient(90deg, #28a745 0%, transparent 100%)',
                      borderRadius: '2px'
                    }
                  }}>
                    श्रेणी
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <FilterRow icon={<OndemandVideoIcon />} label="लाइव क्लास" checked={isChecked('webinar')} onChange={() => handleToggle('webinar')} />
                    <FilterRow icon={<RecordVoiceOverIcon />} label="इंटरव्यू" checked={isChecked('interview')} onChange={() => handleToggle('interview')} />
                    <FilterRow icon={<AssignmentIcon />} label="केस स्टडी" checked={isChecked('case_study')} onChange={() => handleToggle('case_study')} />
                    <FilterRow icon={<TerminalIcon />} label="हैकथॉन" checked={isChecked('hackathon')} onChange={() => handleToggle('hackathon')} />
                    <FilterRow icon={<NewspaperIcon />} label="न्यूज़" checked={isChecked('news')} onChange={() => handleToggle('news')} />
                    <FilterRow icon={<MenuBookIcon />} label="जर्नल" checked={isChecked('journal')} onChange={() => handleToggle('journal')} />
                    <FilterRow icon={<PollIcon />} label="पोल" checked={isChecked('poll')} onChange={() => handleToggle('poll')} />
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* ─── RIGHT FEED GRID SECTION ─── */}
            <Grid size={{ xs: 12, md: 9, lg: 9.5 }}>
              {filteredItems.length > 0 ? (
                <Grid container spacing={3} alignItems="stretch">
                  {filteredItems.map((item, index) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 4 }} key={item.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                        sx={{ width: '100%', maxWidth: 450, display: "flex" }}
                      >
                        <Card
                          sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: "16px",
                            background: "rgba(255, 255, 255, 0.3)",
                            backdropFilter: "blur(30px)",
                            WebkitBackdropFilter: "blur(30px)",
                            border: "1px solid rgba(30, 79, 163, 0.2)",
                            boxShadow: "none",
                            transition: "all 0.3s ease",
                            '&:hover': {
                              border: "1px solid rgba(30, 79, 163, 0.5)",
                              background: "rgba(255, 255, 255, 0.45)",
                              boxShadow: "none"
                            }
                          }}
                        >

                          {/* Embedded Edge-to-Edge Thumbnail */}
                          <Box
                            sx={{
                              aspectRatio: "16/9",
                              width: '100%',
                              borderTopLeftRadius: "15px",
                              borderTopRightRadius: "15px",
                              backgroundImage: `url(${item.thumbnail})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              position: 'relative',
                              overflow: 'hidden',
                              flexShrink: 0,
                              boxShadow: "none",
                            }}
                          >
                            {/* Top-Left Document Type Icon (No Background) */}
                            <Box sx={{
                              position: 'absolute',
                              top: 12, left: 12,
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {getIcon(item.types[0], "#ffffff", 24)}
                            </Box>
                          </Box>

                          <CardContent sx={{ flexGrow: 1, p: 3, pt: 2.5, display: "flex", flexDirection: "column" }}>

                            {/* Single-line Clamped Title */}
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 800,
                                lineHeight: 1.3,
                                mb: 1,
                                color: "#0f172a",
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {item.title}
                            </Typography>

                            {/* Double-line Clamped Description */}
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#475569",
                                mb: 2,
                                flexGrow: 1,
                                lineHeight: 1.5,
                                fontWeight: 500,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {item.description}
                            </Typography>

                            {/* Unified Metadata Row */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 'auto', pt: 2 }}>
                              {/* Generously sized Uploader Avatar - Flat Design */}
                              <Avatar sx={{ width: 42, height: 42, bgcolor: item.color, fontSize: "1.2rem", fontWeight: 800, boxShadow: "none" }}>
                                {item.uploader.charAt(0)}
                              </Avatar>

                              <Box sx={{ overflow: "hidden", minWidth: 0, flex: 1 }}>
                                {/* High emphasis uploader topic */}
                                <Typography variant="subtitle2" sx={{
                                  fontWeight: 800, color: "#0f172a", fontSize: "0.9rem", lineHeight: 1.5, py: 0.5,
                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>
                                  {item.uploader}
                                </Typography>

                                {/* Crisp inline metadata (Instructor, Date, Rating) */}
                                <Typography variant="caption" component="div" sx={{
                                  color: "#475569", fontWeight: 600, mt: 0.5,
                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>
                                  {item.instructor && (
                                    <>
                                      <Box component="span" sx={{ color: "#0056b3" }}>
                                        <PersonOutlineIcon sx={{ fontSize: 13, verticalAlign: "middle", mr: 0.3 }} />
                                        {item.instructor}
                                      </Box>
                                      <Box component="span" sx={{ mx: 0.8, color: "#cbd5e1" }}>•</Box>
                                    </>
                                  )}
                                  <span>{item.date}</span>
                                  <Box component="span" sx={{ mx: 0.8, color: "#cbd5e1" }}>•</Box>
                                  <Box component="span">
                                    <StarIcon sx={{ fontSize: 12, color: "#ffc107", verticalAlign: "middle", mr: 0.3, mb: "1px" }} />
                                    {item.rating}
                                  </Box>
                                </Typography>
                              </Box>
                            </Box>

                            {/* Compact Action Row */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2.5 }}>

                              {/* Styled Action Icons Flat Design */}
                              <IconButton size="small" sx={{
                                color: "#64748b", bgcolor: "rgba(30,79,163,0.06)", borderRadius: "12px", width: 44, height: 44,
                                transition: "all 0.2s", '&:hover': { color: "#22c55e", bgcolor: "rgba(34,197,94,0.15)" }
                              }}>
                                <ShareIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                              <IconButton size="small" sx={{
                                color: "#64748b", bgcolor: "rgba(30,79,163,0.06)", borderRadius: "12px", width: 44, height: 44,
                                transition: "all 0.2s", '&:hover': { color: "#0056b3", bgcolor: "rgba(59,130,246,0.15)" }
                              }}>
                                <BookmarkBorderIcon sx={{ fontSize: 20 }} />
                              </IconButton>

                              {/* Spacer to push button right */}
                              <Box sx={{ flexGrow: 1 }} />

                              <Button
                                variant="contained" disableElevation
                                sx={{
                                  bgcolor: "#0056b3",
                                  color: "#fff",
                                  fontWeight: 800,
                                  py: 1.2,
                                  minWidth: "155px", // Force uniform size
                                  borderRadius: "12px",
                                  textTransform: "none",
                                  fontSize: "0.95rem",
                                  whiteSpace: "nowrap", // Prevent text wrapping
                                  letterSpacing: "0.2px",
                                  boxShadow: "none",
                                  transition: "all 0.2s ease",
                                  '&:hover': {
                                    bgcolor: "#0f172a",
                                    boxShadow: "none"
                                  }
                                }}
                              >
                                {item.types.some(t => ["video", "webinar"].includes(t)) ? "Watch" : 
                                 item.types.some(t => ["pdf", "article", "journal", "ebook"].includes(t)) ? "Read" : 
                                 "Start Learning"}
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  sx={{ width: "100%", textAlign: "center", py: { xs: 8, md: 15 }, px: 2 }}
                >
                  <Box sx={{
                    width: 80, height: 80, borderRadius: "50%", bgcolor: "rgba(30,79,163,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", mb: 3
                  }}>
                    <ArticleIcon sx={{ fontSize: 40, color: "#0056b3", opacity: 0.7 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>कोई सामग्री नहीं मिली</Typography>
                  <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 400, mx: "auto", lineHeight: 1.6 }}>
                    आपने जो रिसोर्स टाइप चुना है, उससे संबंधित कोई भी कंटेंट अभी उपलब्ध नहीं है। कृपया कोई अन्य टाइप चुनें।
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ─── EXCLUSIVE MOBILE UI COMPONENT ─── */}
      <FeedMobileFilter />
    </>
  );
}
