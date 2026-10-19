import React, { useState, useEffect } from "react";
import { 
  TextField, Box, Typography, IconButton, 
  Grid, InputAdornment
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import TarangButton from "../../../components/common/TarangButton";
import { apiClient } from "../../../lib/apiClient";
import CustomDialog from "../../../components/common/CustomDialog";

export default function ProfileUpdateModal({ open, onClose, profile, onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: "", bio: "", skills: "", recognitions: "",
    social_links: { linkedin: "", github: "", twitter: "", instagram: "" }
  });
  const [loading, setLoading] = useState(false);

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
        ...prev, social_links: { ...prev.social_links, [platform]: value }
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

  return (
    <CustomDialog open={open} onClose={onClose} innerBoxSx={{ pt: { xs: 4, sm: 6 } }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--color-slate-900)", letterSpacing: "-0.5px" }}>
          प्रोफ़ाइल अपडेट (Update Profile)
        </Typography>
        <IconButton onClick={onClose} sx={{ display: { xs: "none", md: "inline-flex" }, color: "var(--color-slate-500)" }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-700)" }}>पूरा नाम (Full Name)</Typography>
          <TextField fullWidth name="full_name" value={formData.full_name} onChange={handleChange} />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-700)" }}>बायो (Bio)</Typography>
          <TextField fullWidth name="bio" multiline rows={3} value={formData.bio} onChange={handleChange} placeholder="अपने बारे में कुछ बताएं..." />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" fontWeight={700} color="var(--color-slate-500)" sx={{ mb: 1, ml: 0.5, mt: 2 }}>
            सोशल मीडिया (Social Media)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth placeholder="LinkedIn URL" name="social_linkedin" value={formData.social_links.linkedin} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><LinkedInIcon sx={{ color: "#0077b5" }} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth placeholder="GitHub URL" name="social_github" value={formData.social_links.github} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><GitHubIcon sx={{ color: "var(--color-slate-900)" }} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth placeholder="Twitter (X) URL" name="social_twitter" value={formData.social_links.twitter} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><TwitterIcon sx={{ color: "#1DA1F2" }} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth placeholder="Instagram URL" name="social_instagram" value={formData.social_links.instagram} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start"><InstagramIcon sx={{ color: "#E4405F" }} /></InputAdornment> }} />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-700)" }}>कौशल (Skills) - अल्पविराम से अलग करें</Typography>
          <TextField fullWidth name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. React, Go, SQL, UI Design" helperText="जैसे: React, Go, SQL" />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-700)" }}>महत्वपूर्ण पहचान (Recognitions)</Typography>
          <TextField fullWidth name="recognitions" value={formData.recognitions} onChange={handleChange} placeholder="e.g. Best Student 2024" />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 4, pt: 2.5, borderTop: 'var(--border-thin) solid #F1F5F9' }}>
        <TarangButton variant="outlined" onClick={onClose} fullWidth sx={{ py: 1.5 }}>
          रद्द करें (Cancel)
        </TarangButton>
        <TarangButton loading={loading} disabled={loading} onClick={handleSubmit} fullWidth sx={{ py: 1.5 }}>
          अपडेट करें (Update)
        </TarangButton>
      </Box>
    </CustomDialog>
  );
}
