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
      // Find scroll position whether it's on window, document, or an internal container
      const scrollTop = window.scrollY || (e.target && e.target.scrollTop) || 0;
      setScrolled(scrollTop > 50);
    };
    
    // Add event listener with capture: true to catch all scroll events in the DOM
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  return (
    <Box sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "72px",
      boxSizing: "border-box",
      px: { xs: 2, md: 5 },
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      zIndex: 1000,
      transition: "all 0.3s ease-in-out",
      background: scrolled ? "linear-gradient(135deg, rgba(0, 86, 179, 0.15) 0%, rgba(40, 167, 69, 0.15) 100%)" : "transparent",
      backgroundColor: scrolled ? "rgba(255, 255, 255, 0.75)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
      boxShadow: scrolled ? "0 4px 20px rgba(0, 86, 179, 0.08)" : "none",
      borderBottom: "2px solid transparent",
      borderImage: scrolled ? "linear-gradient(90deg, #0056b3 0%, #28a745 50%, #ffc107 100%) 1" : "none"
    }}>
      <Box sx={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
        <Box sx={{
          border: "2px solid #28a745",
          borderRadius: "50%",
          padding: "1px", // Minimal gap between border and white background
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Box sx={{ 
            bgcolor: "white", 
            borderRadius: "50%", 
            p: "2px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            width: "44px",
            height: "44px"
          }}>
            <img src={logo.src} alt="Tarang" style={{ height: "38px", width: "38px", objectFit: "contain" }} />
          </Box>
        </Box>
        <span style={{ 
          fontFamily: "'Rozha One', serif", 
          color: scrolled ? "#001b3a" : "#ffffff", 
          fontSize: "2rem", 
          fontWeight: "bold",
          transition: "all 0.3s ease"
        }}>
          Tarang
        </span>
      </Box>

      {/* Navigation Links (Centered) */}
      <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4, alignItems: "center" }}>
        {["Home", "Courses", "Institutes", "About Us", "Contact"].map((item) => (
          <Box 
            key={item} 
            component="span"
            sx={{ 
              fontFamily: "'Poppins', sans-serif", 
              fontWeight: 600, 
              fontSize: "1rem", 
              color: scrolled ? "#0f172a" : "#ffffff", 
              cursor: "pointer",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -4,
                left: 0,
                width: "0%",
                height: "2px",
                bgcolor: "#4ade80",
                transition: "all 0.3s ease"
              },
              "&:hover::after": {
                width: "100%"
              },
              "&:hover": {
                color: "#4ade80"
              },
              transition: "color 0.3s ease"
            }}
          >
            {item}
          </Box>
        ))}
      </Box>

      <Box>
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
      </Box>
    </Box>
  );
}
