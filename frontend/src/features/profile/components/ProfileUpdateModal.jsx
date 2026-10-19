import React, { useState, useEffect } from "react";
import { 
  Button, TextField, Box, Typography, IconButton, 
  Grid, Chip, InputAdornment, Paper
} from "@mui/material";
import { motion } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkIcon from "@mui/icons-material/Link";
import { apiClient } from "../../../lib/apiClient";
import Loader from "../../../components/common/Loader";
import useScrollLock from "../../../hooks/useScrollLock";
import { useLoading } from '../../../contexts/LoadingContext';

export default function ProfileUpdateModal({ open, onClose, profile, onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    skills: "",
    recognitions: "",
    social_links: {
      linkedin: "",
      github: "",
      twitter: "",
      instagram: ""
    }
  });
  const [loading, setLoading] = useState(false);

  useScrollLock(open);

  const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    transition: "all 0.2s ease-in-out",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0056b3", borderWidth: "1.5px" },
  },
  "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "15px" },
};


  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        skills: (profile.skills || []).join(", "),
        recognitions: (profile.recognitions || []).join(", "),
        social_links: {
          linkedin: profile.social_links?.linkedin || "",
          github: profile.social_links?.github || "",
          twitter: profile.social_links?.twitter || "",
          instagram: profile.social_links?.instagram || ""
        }
      });
    }
  }, [profile, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("social_")) {
      const platform = name.replace("social_", "");
      setFormData(prev => ({
        ...prev,
        social_links: { ...prev.social_links, [platform]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        user_id: profile.id,
        full_name: formData.full_name,
        bio: formData.bio,
        skills: formData.skills.split(",").map(s => s.trim()).filter(s => s !== ""),
        recognitions: formData.recognitions.split(",").map(s => s.trim()).filter(s => s !== ""),
        social_links: formData.social_links
      };
      
      await apiClient.post("/profile/update", payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Box
      onClick={onClose}
      sx={{
        position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0, 86, 179, 0.1)', backdropFilter: 'blur(15px)', p: 2, overflow: 'auto'
      }}
    >
      <Paper
        onClick={(e) => e.stopPropagation()}
        elevation={0}
        component={motion.div}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        sx={{
          display: "flex", flexDirection: "column", width: "100%", maxWidth: "600px",
          borderRadius: { xs: 0, sm: "28px" },
          background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.25) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.2) 0, transparent 50%), 
            radial-gradient(at 80% 100%, rgba(40, 167, 69, 0.15) 0, transparent 50%),
            radial-gradient(at 20% 100%, rgba(0, 86, 179, 0.1) 0, transparent 50%),
            #ffffff
          `,
          boxShadow: "none",
          border: "1px solid #E2E8F0",
          overflowY: 'auto', maxHeight: '92vh'
        }}
      >
        <Box sx={{ px: { xs: 3, sm: 8 }, py: { xs: 6, sm: 8 } }}>
          <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>
                प्रोफ़ाइल अपडेट (Update Profile)
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ display: { xs: "inline-flex", md: "none" }, color: "#64748b", '&:hover': { color: '#0f172a', bgcolor: 'rgba(0,0,0,0.05)' } }}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#374151" }}>पूरा नाम (Full Name)</Typography>
              <TextField
                fullWidth
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                    transition: "all 0.2s ease-in-out",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0056b3", borderWidth: "1.5px" },
                  },
                  "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "15px" },
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#374151" }}>बायो (Bio)</Typography>
              <TextField
                fullWidth
                name="bio"
                multiline
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                variant="outlined"
                placeholder="अपने बारे में कुछ बताएं..."
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" fontWeight={700} color="#64748b" sx={{ mb: 1, ml: 0.5, mt: 2 }}>
                सोशल मीडिया (Social Media)
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    placeholder="LinkedIn URL"
                    name="social_linkedin"
                    value={formData.social_links.linkedin}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkedInIcon sx={{ color: "#0077b5" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    placeholder="GitHub URL"
                    name="social_github"
                    value={formData.social_links.github}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <GitHubIcon sx={{ color: "#333" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    placeholder="Twitter (X) URL"
                    name="social_twitter"
                    value={formData.social_links.twitter}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TwitterIcon sx={{ color: "#1DA1F2" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    placeholder="Instagram URL"
                    name="social_instagram"
                    value={formData.social_links.instagram}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InstagramIcon sx={{ color: "#E4405F" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#374151" }}>कौशल (Skills) - अल्पविराम से अलग करें</Typography>
              <TextField
                fullWidth
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                variant="outlined"
                placeholder="e.g. React, Go, SQL, UI Design"
                helperText="जैसे: React, Go, SQL"
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#374151" }}>महत्वपूर्ण पहचान (Recognitions) - अल्पविराम से अलग करें</Typography>
              <TextField
                fullWidth
                name="recognitions"
                value={formData.recognitions}
                onChange={handleChange}
                variant="outlined"
                placeholder="e.g. Best Student 2024, Hackathon Winner"
                sx={fieldSx}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4, pt: 2.5, borderTop: '1px solid #F3F4F6' }}>
            <Button 
              onClick={onClose} 
              fullWidth
              variant="outlined"
              disableElevation
              sx={{ 
                py: 1.5, borderRadius: "8px", textTransform: "none", fontSize: "15px", fontWeight: 600, 
                borderColor: "#D1D5DB", color: "#374151",
                "&:hover": { borderColor: "#9CA3AF", backgroundColor: "#F9FAFB" }
              }}
            >
              रद्द करें (Cancel)
            </Button>
            <Button 
              onClick={handleSubmit} 
              fullWidth
              variant="contained"
              disableElevation
              disabled={loading}
              sx={{ 
                py: 1.5, borderRadius: "8px", textTransform: "none", fontSize: "15px", fontWeight: 700, 
                background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)', color: '#ffffff',
                "&:hover": { background: 'linear-gradient(135deg, #004494 0%, #218838 100%)' }
              }}
            >
              {loading ? <Loader mini /> : "अपडेट करें (Update)"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
