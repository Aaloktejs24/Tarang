"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Box } from "@mui/material";
import logo from "../../assets/logo.svg";
import "../../styles/navbar.css";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import navTranslations from "../../data/landing_navbar.json";

export default function LandingNavbar({ onLoginClick }) {
  const [scrolled, setScrolled] = useState(false);
  const { language } = useAccessibility();

  // Helper to get navbar translation with English fallback
  const nt = (key) => {
    const section = navTranslations[key];
    if (!section) return key;
    return section[language] || section["en"] || key;
  };

  useEffect(() => {
    const handleScroll = (e) => {
      const scrollTop = window.scrollY || (e.target && e.target.scrollTop) || 0;
      setScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  return (
    <nav className="nav" style={{
      background: 'linear-gradient(135deg, rgba(0, 86, 179, 0.15) 0%, rgba(40, 167, 69, 0.15) 100%)',
      backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: scrolled ? '1px solid #E2E8F0' : 'none',
      borderBottom: '2px solid transparent',
      borderImage: 'linear-gradient(90deg, #0056b3 0%, #28a745 50%, #ffc107 100%) 1',
      transition: 'all 0.3s ease',
      zIndex: 1000,
      padding: '0 4vw'
    }}>
      <div className="menu_logo_container">
        <div className="logo" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={logo.src} alt="Tarang" style={{ height: "45px" }} />
          <span style={{ fontFamily: "'Rozha One', serif", color: "#001b3a", fontSize: "2rem", fontWeight: "bold" }}>Tarang</span>
        </div>
      </div>

      <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4, alignItems: "center", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
        {[
          { key: "home" },
          { key: "courses" },
          { key: "institutes" },
          { key: "blogs" },
          { key: "events" },
          { key: "contact" }
        ].map((item) => (
          <Box 
            key={item.key} 
            component="span"
            sx={{ 
              fontFamily: "'Poppins', sans-serif", 
              fontWeight: 600,
              fontSize: "1rem", 
              color: "#000000", 
              cursor: "pointer",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -4,
                left: 0,
                width: "0%",
                height: "2px",
                bgcolor: "#28a745",
                transition: "all 0.3s ease"
              },
              "&:hover::after": {
                width: "100%"
              },
              "&:hover": {
                color: "#28a745"
              },
              transition: "color 0.3s ease"
            }}
          >
            {nt(item.key)}
          </Box>
        ))}
      </Box>

      <div className="accessibility_tools" style={{ gap: "2rem", display: "flex", alignItems: "center" }}>
        <Button
          variant="contained"
          disableElevation
          onClick={() => onLoginClick && onLoginClick()}
          sx={{
            bgcolor: "#28a745",
            "&:hover": { bgcolor: "#218838" },
            borderRadius: "8px",
            px: 4,
            height: "42px",
            fontWeight: "bold",
            fontFamily: "'Poppins', sans-serif",
            textTransform: "none",
            fontSize: "1rem"
          }}
        >
          {nt('start')}
        </Button>
      </div>
    </nav>
  );
}
