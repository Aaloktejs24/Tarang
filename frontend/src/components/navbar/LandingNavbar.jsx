"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Box } from "@mui/material";
import logo from "../../assets/logo.svg";
import "../../styles/navbar.css";

export default function LandingNavbar({ onLoginClick }) {
  const [scrolled, setScrolled] = useState(false);

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
      background: scrolled ? "rgba(255, 255, 255, 0.95)" : "#ffffff",
      borderBottom: "1px solid rgba(0, 86, 179, 0.15)",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      transition: "all 0.3s ease",
      zIndex: 1000,
      padding: "0 4vw"
    }}>
      <div className="menu_logo_container">
        <div className="logo" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={logo.src} alt="Tarang" style={{ height: "45px" }} />
          <span style={{ fontFamily: "'Rozha One', serif", color: "#001b3a", fontSize: "2rem", fontWeight: "bold" }}>Tarang</span>
        </div>
      </div>

      <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4, alignItems: "center", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
        {["Home", "Courses", "Institutes", "About Us", "Contact"].map((item) => (
          <Box 
            key={item} 
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
            {item}
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
          आरंभ करें
        </Button>
      </div>
    </nav>
  );
}
