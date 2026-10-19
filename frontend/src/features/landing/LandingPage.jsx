"use client";

import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Button, Grid, Paper, Card, CardContent, CardMedia, Avatar, Divider, TextField, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";
import SchoolIcon from "@mui/icons-material/School";
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LoginForm from "../auth/LoginForm";
import LandingNavbar from "../../components/navbar/LandingNavbar";
import { Backdrop } from "@mui/material";

const slides = [
  {
    id: 1,
    bg: "https://themes.potenzaglobalsolutions.com/html/academic/images/bg/01.jpg",
    title: "Exceptional Education.\nExceptional Value.",
    desc: "The first thing to remember about success is that it is a process nothing more, nothing less. There is really no magic to it and it's not reserved only for a select few people.",
    align: "center",
    buttons: [
      { text: "Read More", sx: { bgcolor: "#0056b3", color: "white", "&:hover": { bgcolor: "#004494" } } },
      { text: "Learn More", sx: { bgcolor: "#28a745", color: "white", "&:hover": { bgcolor: "#218838" } } }
    ]
  },
  {
    id: 2,
    bg: "https://themes.potenzaglobalsolutions.com/html/academic/images/bg/03.jpg",
    title: "The Education You Want.\nThe Attention You Deserve",
    desc: "There are basically six key areas to higher achievement. Some people will tell you there are four while others may tell you there are eight.",
    align: "center",
    buttons: [
      { text: "Explore Programs", sx: { bgcolor: "#0056b3", color: "white", "&:hover": { bgcolor: "#004494" } } },
      { text: "Contact Us", sx: { bgcolor: "#28a745", color: "white", "&:hover": { bgcolor: "#218838" } } }
    ]
  }
];

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ bgcolor: "#ffffff", minHeight: "100vh", display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      <LandingNavbar onLoginClick={() => setIsLoginOpen(true)} />

      {/* ─── HERO BANNER SECTION ─── */}
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          mb: { xs: 20, md: 12 }
        }}
      >
        {/* Background Image Wrapper (Clips the Ken Burns scale effect) */}
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", zIndex: 1 }}>
          <AnimatePresence>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1.08 }}
              exit={{ opacity: 0 }}
              transition={{ 
                opacity: { duration: 1.5, ease: "easeInOut" },
                scale: { duration: 10, ease: "linear" }
              }}
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${slides[currentSlide].bg}')`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            />
          </AnimatePresence>
        </Box>

        {/* Slider Pagination Dots */}
        <Box sx={{
          position: "absolute",
          bottom: { xs: "90px", md: "140px" },
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "12px",
          zIndex: 5
        }}>
          {slides.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              sx={{
                width: currentSlide === idx ? "24px" : "8px",
                height: "8px",
                borderRadius: "8px",
                bgcolor: currentSlide === idx ? "#4ade80" : "rgba(255, 255, 255, 0.5)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: currentSlide === idx ? "#4ade80" : "rgba(255, 255, 255, 0.9)"
                }
              }}
            />
          ))}
        </Box>

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, height: "100%" }}>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: slides[currentSlide].align === "center" ? "center" : "flex-start",
            textAlign: slides[currentSlide].align,
            minHeight: "100vh",
            pt: { xs: 10, md: 0 },
            pb: 10
          }}>
            <Box sx={{ width: "100%", maxWidth: "1200px", mx: slides[currentSlide].align === "center" ? "auto" : 0 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${currentSlide}`}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.25, delayChildren: 0.4 } },
                    exit: { opacity: 0, y: -20, transition: { duration: 0.5, ease: "easeInOut" } }
                  }}
                >
                  <motion.div variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }}>
                    <Typography 
                      variant="h1" 
                      sx={{ 
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: { xs: "2.5rem", md: "4rem", lg: "4.5rem" },
                        fontWeight: 800, 
                        mb: 3,
                        lineHeight: 1.2,
                        color: "white",
                        whiteSpace: "pre-line"
                      }}
                    >
                      {slides[currentSlide].title.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {index === 1 ? <span style={{ color: "#4ade80" }}>{line}</span> : line}
                          {index === 0 && <br />}
                        </React.Fragment>
                      ))}
                    </Typography>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }}>
                    <Typography sx={{ fontFamily: "'Poppins', sans-serif", fontSize: { xs: "1.1rem", md: "1.25rem" }, opacity: 0.95, mb: 5, maxWidth: "850px", mx: slides[currentSlide].align === "center" ? "auto" : 0, lineHeight: 1.6, letterSpacing: "0.5px", color: "white" }}>
                      {slides[currentSlide].desc}
                    </Typography>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }}>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: slides[currentSlide].align === "center" ? "center" : "flex-start" }}>
                      {slides[currentSlide].buttons.map((btn, idx) => (
                        <Button 
                          key={idx}
                          variant="contained"
                          disableElevation 
                          onClick={() => setIsLoginOpen(true)}
                          sx={{ px: 4, height: "48px", borderRadius: "8px", fontWeight: 600, fontSize: "1rem", fontFamily: "'Poppins', sans-serif", textTransform: "none", ...btn.sx }}
                        >
                          {btn.text}
                        </Button>
                      ))}
                    </Box>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </Box>
          </Box>
        </Container>

        {/* ─── BOTTOM OVERLAPPING SEARCH FORM ─── */}
        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, transform: "translateY(50%)", px: { xs: 2, md: 0 }, zIndex: 4 }}>
            <Container maxWidth="lg">
                <Paper elevation={0} sx={{ p: { xs: 3, md: "30px 50px" }, borderRadius: "8px", boxShadow: "none", bgcolor: "#ffffff" }}>
                    <Grid container spacing={3} alignItems="flex-end">
                        <Grid item xs={12} md={4}>
                            <Box sx={{ position: "relative" }}>
                                <Typography sx={{ color: "#1a2844", fontWeight: 600, mb: 1, fontFamily: "'Poppins', sans-serif", textAlign: "left" }}>Full Name</Typography>
                                <TextField placeholder="Your Name" variant="outlined" fullWidth size="small"
                                    InputProps={{ 
                                        sx: { fontFamily: "'Poppins', sans-serif", bgcolor: "transparent", "& fieldset": { borderColor: "#eeeeee" } },
                                        endAdornment: <PersonOutlineIcon sx={{ color: "#a61d37" }} />
                                    }} 
                                />
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <Box sx={{ position: "relative", textAlign: "left" }}>
                                <Typography sx={{ color: "#1a2844", fontWeight: 600, mb: 1, fontFamily: "'Poppins', sans-serif" }}>Your Courses</Typography>
                                <TextField select SelectProps={{ native: true }} variant="outlined" fullWidth size="small"
                                    InputProps={{ 
                                        sx: { fontFamily: "'Poppins', sans-serif", bgcolor: "transparent", "& fieldset": { borderColor: "#eeeeee" } }
                                    }} 
                                >
                                    <option value="1">Please Choose</option>
                                    <option value="2">Electrical Engineering</option>
                                    <option value="3">Computer Science</option>
                                </TextField>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <Button variant="contained" disableElevation fullWidth sx={{ bgcolor: "#1a2844", color: "white", height: "42px", borderRadius: "8px", fontWeight: 600, fontFamily: "'Poppins', sans-serif", fontSize: "1rem", textTransform: "none", "&:hover": { bgcolor: "#213356" } }}>
                                Search Course
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </Box>
      </Box>

      {/* ─── ACTION BOXES ─── */}
      <Box sx={{ position: "relative", zIndex: 3, px: { xs: 2, md: 0 }, mt: { xs: 15, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* Box 1 */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 5, borderRadius: "8px", bgcolor: "#1e4fa3", color: "white", height: "100%", transition: "transform 0.3s", "&:hover": { transform: "translateY(-5px)" } }}>
                <SchoolIcon sx={{ fontSize: 50, mb: 3, color: "#28a745" }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Trending Courses</Typography>
                <Typography sx={{ opacity: 0.8, mb: 3 }}>नवीनतम और सबसे लोकप्रिय पाठ्यक्रमों की खोज करें जो आपके करियर को नई ऊंचाइयों पर ले जाएंगे।</Typography>
                <Typography component="span" sx={{ fontWeight: 600, display: "flex", alignItems: "center", cursor: "pointer", "&:hover": { color: "#28a745" } }}>
                  Read More <ArrowForwardIcon sx={{ ml: 1, fontSize: 18 }} />
                </Typography>
              </Paper>
            </Grid>
            {/* Box 2 */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 5, borderRadius: "8px", bgcolor: "#28a745", color: "white", height: "100%", transition: "transform 0.3s", "&:hover": { transform: "translateY(-5px)" } }}>
                <ImportContactsIcon sx={{ fontSize: 50, mb: 3, color: "#1e4fa3" }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Top Institutes</Typography>
                <Typography sx={{ opacity: 0.9, mb: 3 }}>देश भर के सर्वश्रेष्ठ शैक्षणिक संस्थानों से जुड़ें और उनके कार्यक्रमों के बारे में जानें।</Typography>
                <Typography component="span" sx={{ fontWeight: 600, display: "flex", alignItems: "center", cursor: "pointer", "&:hover": { color: "#1e4fa3" } }}>
                  Read More <ArrowForwardIcon sx={{ ml: 1, fontSize: 18 }} />
                </Typography>
              </Paper>
            </Grid>
            {/* Box 3 */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 5, borderRadius: "8px", bgcolor: "#ffffff", color: "#0f172a", height: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", transition: "transform 0.3s", "&:hover": { transform: "translateY(-5px)" } }}>
                <EmojiEventsIcon sx={{ fontSize: 50, mb: 3, color: "#f39c12" }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Competitions</Typography>
                <Typography sx={{ color: "#64748b", mb: 3 }}>राष्ट्रीय स्तर की प्रतियोगिताओं में भाग लें और अपनी प्रतिभा को साबित कर पुरस्कार जीतें।</Typography>
                <Typography component="span" sx={{ fontWeight: 600, color: "#1e4fa3", display: "flex", alignItems: "center", cursor: "pointer", "&:hover": { color: "#28a745" } }}>
                  Read More <ArrowForwardIcon sx={{ ml: 1, fontSize: 18 }} />
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ─── ABOUT / INFO SECTION ─── */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="overline" sx={{ color: "#28a745", fontWeight: 700, letterSpacing: 2 }}>
                ABOUT TARANG
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, mb: 3, fontFamily: "'Rozha One', serif", color: "#0f172a", lineHeight: 1.2 }}>
                Education for Individual and Social Responsibility
              </Typography>
              <Typography sx={{ color: "#64748b", mb: 4, fontSize: "1.1rem", lineHeight: 1.8 }}>
                हमारा उद्देश्य एक ऐसा पारिस्थितिकी तंत्र बनाना है जहां ज्ञान का मुक्त प्रवाह हो। 
                एक ऐसा नेटवर्क जो न केवल व्यक्तिगत विकास को बढ़ावा दे, बल्कि सामाजिक जिम्मेदारी और सामूहिक प्रगति की भावना भी पैदा करे।
              </Typography>
              <Box sx={{ display: "flex", gap: 4, mb: 4 }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: "#1e4fa3", mb: 1 }}>15+</Typography>
                  <Typography sx={{ color: "#64748b", fontWeight: 600 }}>Years of Excellence</Typography>
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: "#28a745", mb: 1 }}>50k</Typography>
                  <Typography sx={{ color: "#64748b", fontWeight: 600 }}>Active Students</Typography>
                </Box>
              </Box>
              <Button variant="outlined" sx={{ color: "#1e4fa3", borderColor: "#1e4fa3", borderRadius: "8px", px: 4, height: "42px", fontWeight: 600, "&:hover": { bgcolor: "#1e4fa3", color: "white" } }}>
                More About Us
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: "relative" }}>
                <Box component="img" src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000" sx={{ width: "100%", borderRadius: "8px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }} />
                <Box sx={{ position: "absolute", bottom: -30, left: -30, bgcolor: "white", p: 2, borderRadius: "8px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", display: { xs: "none", md: "block" } }}>
                  <Box component="img" src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=400" sx={{ width: "200px", borderRadius: "8px" }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ─── POPULAR COURSES ─── */}
      <Box sx={{ py: 10, bgcolor: "#f8fafc" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="overline" sx={{ color: "#28a745", fontWeight: 700, letterSpacing: 2 }}>
              DISCOVER LEARNING
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, fontFamily: "'Rozha One', serif", color: "#0f172a" }}>
              Our Popular Courses
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {[
              { img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600", tag: "Technology", title: "Advanced Data Science & AI", inst: "IIT Bombay", price: "Free" },
              { img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600", tag: "Business", title: "Business Strategy & Management", inst: "IIM Ahmedabad", price: "₹2,500" },
              { img: "https://images.unsplash.com/photo-1546410531-ee4cb12722b4?q=80&w=600", tag: "Science", title: "Modern Physics Fundamentals", inst: "IISc Bangalore", price: "Free" }
            ].map((course, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card sx={{ borderRadius: "8px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", transition: "0.3s", "&:hover": { transform: "translateY(-5px)", boxShadow: "0 15px 40px rgba(0,0,0,0.1)" } }}>
                  <Box sx={{ position: "relative" }}>
                    <CardMedia component="img" height="240" image={course.img} />
                    <Box sx={{ position: "absolute", top: 20, left: 20, bgcolor: "#28a745", color: "white", px: 2, py: 0.5, borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600 }}>
                      {course.tag}
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#0f172a", cursor: "pointer", "&:hover": { color: "#1e4fa3" } }}>
                      {course.title}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: "#1e4fa3", fontSize: "0.9rem" }}>{course.inst[0]}</Avatar>
                        <Typography sx={{ color: "#64748b", fontSize: "0.95rem" }}>{course.inst}</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 800, color: "#28a745" }}>{course.price}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── WHY CHOOSE US (PARALLAX) ─── */}
      <Box
        sx={{
          py: 12,
          position: "relative",
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2000')",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white"
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: "'Rozha One', serif" }}>
              Why Choose Us
            </Typography>
          </Box>
          <Grid container spacing={6}>
            {[
              { icon: <MenuBookIcon sx={{fontSize:60}}/>, title: "Modern Library", desc: "Access thousands of e-books, research papers and study materials." },
              { icon: <GroupsIcon sx={{fontSize:60}}/>, title: "Expert Teachers", desc: "Learn directly from the most experienced educators across India." },
              { icon: <EmojiEventsIcon sx={{fontSize:60}}/>, title: "Global Certification", desc: "Earn certificates recognized by top institutions and companies." }
            ].map((feature, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Box sx={{ color: "#28a745", mb: 3 }}>{feature.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{feature.title}</Typography>
                  <Typography sx={{ opacity: 0.8, lineHeight: 1.7 }}>{feature.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <IconButton sx={{ bgcolor: "white", color: "#1e4fa3", width: 80, height: 80, "&:hover":{bgcolor:"#28a745", color:"white"} }}>
              <PlayCircleOutlineIcon sx={{ fontSize: 40 }} />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* ─── LATEST EVENTS ─── */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="overline" sx={{ color: "#28a745", fontWeight: 700, letterSpacing: 2 }}>
              UPCOMING ACTIVITIES
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, fontFamily: "'Rozha One', serif", color: "#0f172a" }}>
              Latest Events
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {[1, 2, 3].map((_, i) => (
              <Grid item xs={12} lg={4} key={i}>
                <Box sx={{ display: "flex", gap: 3, p: 3, bgcolor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", transition: "0.3s", "&:hover": { bgcolor: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" } }}>
                  <Box sx={{ textAlign: "center", p: 2, bgcolor: "#1e4fa3", color: "white", borderRadius: "8px", minWidth: "80px" }}>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{24 + i}</Typography>
                    <Typography sx={{ textTransform: "uppercase", fontSize: "0.85rem", fontWeight: 600 }}>Nov</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "#0f172a", cursor: "pointer", "&:hover":{color:"#28a745"} }}>
                      National Science Symposium 2026
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, color: "#64748b", fontSize: "0.9rem" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><CalendarMonthIcon fontSize="small"/> 10:00 AM</Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><LocationOnIcon fontSize="small"/> New Delhi</Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── MEET OUR TEAM ─── */}
      <Box sx={{ py: 10, bgcolor: "#f8fafc" }}>
        <Container maxWidth="lg">
           <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="overline" sx={{ color: "#28a745", fontWeight: 700, letterSpacing: 2 }}>
              TOP EDUCATORS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, fontFamily: "'Rozha One', serif", color: "#0f172a" }}>
              Meet Our Team
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {[
              { img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400", name: "Dr. Rajesh Kumar", role: "Professor of Physics" },
              { img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400", name: "Priya Sharma", role: "Computer Science Lead" },
              { img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400", name: "Anil Desai", role: "Mathematics Expert" },
              { img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400", name: "Dr. Sneha Patel", role: "Biology Department" }
            ].map((member, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Paper sx={{ textAlign: "center", overflow: "hidden", borderRadius: "8px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                  <Box component="img" src={member.img} sx={{ width: "100%", height: "280px", objectFit: "cover" }} />
                  <Box sx={{ p: 3, bgcolor: "white" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>{member.name}</Typography>
                    <Typography sx={{ color: "#28a745", fontSize: "0.9rem", fontWeight: 600, mt: 0.5 }}>{member.role}</Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── LATEST ARTICLES ─── */}
      <Box sx={{ py: 10, position: "relative" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: "'Rozha One', serif", color: "#0f172a" }}>
              Latest Articles
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {[
              { img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600", date: "15 Oct 2026", title: "The Future of AI in Indian Education System", author: "Admin" },
              { img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600", date: "10 Oct 2026", title: "How to prepare effectively for competitive exams", author: "Dr. Sharma" },
              { img: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=600", date: "05 Oct 2026", title: "Importance of mental health for students", author: "Admin" }
            ].map((article, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card sx={{ borderRadius: "8px", boxShadow: "none", border: "1px solid #e2e8f0" }}>
                  <CardMedia component="img" height="240" image={article.img} />
                  <CardContent sx={{ p: 4 }}>
                    <Typography sx={{ color: "#28a745", fontWeight: 600, fontSize: "0.85rem", mb: 2 }}>{article.date} / By {article.author}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#0f172a", cursor: "pointer", "&:hover": { color: "#1e4fa3" } }}>
                      {article.title}
                    </Typography>
                    <Typography sx={{ color: "#64748b", mb: 3 }}>
                      Discover the latest trends and essential tips that can help you navigate through your educational journey successfully...
                    </Typography>
                    <Typography component="span" sx={{ fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", cursor: "pointer", "&:hover": { color: "#28a745" } }}>
                      Read More <ArrowForwardIcon sx={{ ml: 1, fontSize: 18 }} />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── SUBSCRIBE NEWSLETTER (OVERLAPPING FOOTER) ─── */}
      <Box sx={{ position: "relative", zIndex: 9, mt: 5, mb: -10, px: { xs: 2, md: 0 } }}>
        <Container maxWidth="lg">
          <Paper sx={{ bgcolor: "#28a745", borderRadius: "8px", p: { xs: 4, md: 6 }, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 4, boxShadow: "0 20px 40px rgba(40,167,69,0.3)" }}>
            <Box sx={{ color: "white", flex: "1 1 300px" }}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontFamily: "'Rozha One', serif" }}>Subscribe</Typography>
              <Typography sx={{ opacity: 0.9 }}>Sign up to our newsletter to get the latest news and offers.</Typography>
            </Box>
            <Box sx={{ flex: "1 1 400px", display: "flex", gap: 1 }}>
              <TextField 
                placeholder="Enter Your Email Address" 
                variant="outlined"
                fullWidth
                sx={{ bgcolor: "white", borderRadius: "8px", "& fieldset": { border: "none" } }}
              />
              <Button variant="contained" sx={{ bgcolor: "#0f172a", color: "white", px: 4, height: "48px", fontWeight: 700, borderRadius: "8px", "&:hover": { bgcolor: "#1e293b" } }}>
                Subscribe
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* ─── FOOTER ─── */}
      <Box sx={{ bgcolor: "#0f172a", color: "white", pt: 18, pb: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ mb: 6 }}>
            <Grid item xs={12} md={3}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: "white" }}>Tarang</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", mb: 3, lineHeight: 1.8 }}>
                Tarang is a premium educational network connecting students, educators, and institutions across India.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Useful Links</Typography>
              {["Home", "About Us", "Courses", "Events", "Contact"].map(l => (
                <Typography key={l} sx={{ color: "rgba(255,255,255,0.6)", mb: 1.5, cursor: "pointer", "&:hover":{color:"#28a745"} }}>{l}</Typography>
              ))}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Categories</Typography>
              {["Engineering", "Medical", "Business", "Arts", "Sciences"].map(l => (
                <Typography key={l} sx={{ color: "rgba(255,255,255,0.6)", mb: 1.5, cursor: "pointer", "&:hover":{color:"#28a745"} }}>{l}</Typography>
              ))}
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Contact Info</Typography>
              <Box sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
                <Typography sx={{ mb: 2 }}><strong>Address:</strong> 123 Education Street, Tech Park, New Delhi, India 110001</Typography>
                <Typography sx={{ mb: 2 }}><strong>Phone:</strong> +91 98765 43210</Typography>
                <Typography><strong>Email:</strong> info@tarang.in</Typography>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 4 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", color: "rgba(255,255,255,0.6)" }}>
            <Typography>© 2026 Tarang Educational Network. All Rights Reserved.</Typography>
            <Box sx={{ display: "flex", gap: 3 }}>
              <Typography sx={{ cursor: "pointer", "&:hover":{color:"white"} }}>Terms & Conditions</Typography>
              <Typography sx={{ cursor: "pointer", "&:hover":{color:"white"} }}>Privacy Policy</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── LOGIN BACKDROP ─── */}
      <Backdrop
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 2000,
          backdropFilter: "blur(15px)",
          backgroundColor: "rgba(15, 23, 42, 0.6)"
        }}
        open={isLoginOpen}
        onClick={() => setIsLoginOpen(false)}
      >
        <Box onClick={(e) => e.stopPropagation()}>
          <LoginForm onClose={() => setIsLoginOpen(false)} />
        </Box>
      </Backdrop>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
      `}</style>
    </Box>
  );
}
