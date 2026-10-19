"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Switch, Divider, Chip, useTheme, useMediaQuery, Button } from "@mui/material";
import { motion } from "framer-motion";
import ResponsiveSection from "../../components/ui/ResponsiveSection";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import MonitorOutlinedIcon from "@mui/icons-material/MonitorOutlined";
import { apiClient } from "../../lib/apiClient";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ProfileUpdateModal from "../profile/components/ProfileUpdateModal";
import KycVerificationModal from "../profile/components/KycVerificationModal";

const SettingRow = ({ label, desc, value, onChange }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
    <Box>
      <Typography fontSize={14} fontWeight={600} color="var(--color-slate-900)">{label}</Typography>
      <Typography fontSize={12} color="var(--color-slate-500)" sx={{ mt: 0.5 }}>{desc}</Typography>
    </Box>
    <Switch
      checked={value}
      onChange={onChange}
      sx={{
        "& .MuiSwitch-track": { bgcolor: "var(--color-slate-200)" },
        "& .Mui-checked + .MuiSwitch-track": { bgcolor: "var(--color-primary)", opacity: 1 }
      }}
    />
  </Box>
);

const InfoRow = ({ icon, label, value }) => {
  const IconComponent = icon;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4, "&:last-child": { mb: 0 } }}>
      <Box sx={{
        p: 1.5,
        borderRadius: 'var(--radius-lg)',
        bgcolor: "rgba(30, 79, 163, 0.05)",
        color: "var(--color-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 42,
        height: 42,
        border: "var(--border-thin) solid rgba(30, 79, 163, 0.1)"
      }}>
        <IconComponent sx={{ fontSize: 20 }} />
      </Box>
      <Box>
        <Typography fontSize={14} fontWeight={700} color="var(--color-slate-900)" sx={{ mb: 0.2 }}>{label}</Typography>
        <Typography fontSize={13} fontWeight={500} color="var(--color-slate-500)">
          {value || <span style={{ color: "var(--color-slate-200)", fontStyle: "italic" }}>निर्दिष्ट नहीं</span>}
        </Typography>
      </Box>
    </Box>
  );
};

export default function Settings() {
  const [notifs, setNotifs] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [sound, setSound] = useState(false);

  // Profile data block
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [isKycModalOpen, setKycModalOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get("/user/profile");
      setProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch profile settings data:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: {
          xs: 2,
          sm: 3,
          md: 4,
          lg: "min(max(32px, calc((100% - 900px) / 2)), 64px)"
        },
        pb: {
          xs: 2,
          sm: 3,
          md: 4,
          lg: "min(max(32px, calc((100% - 900px) / 2)), 64px)"
        },
        px: { xs: 2, sm: 3, md: 4 },
        "& .MuiTypography-root, & .MuiButton-root, & .MuiChip-root": {
          fontFamily: "inherit"
        }
      }}
    >
      {/* Decorative Blur Element for depth */}
      <Box
        sx={{
          position: "absolute",
          width: "40vw",
          height: "40vw",
          top: "-10%",
          left: "-10%",
          background: "rgba(30, 79, 163, 0.1)",
          filter: "blur(100px)",
          borderRadius: 'var(--radius-full)',
          zIndex: 0
        }}
      />

      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          width: "var(--size-full)",
          maxWidth: "900px",
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 3, md: 4 }
        }}
      >
        {/* Page Header */}
        <Box component={motion.div} variants={itemVariants} sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box sx={{ p: 2, borderRadius: 'var(--radius-lg)', bgcolor: "rgba(255, 255, 255, 0.9)", color: "var(--color-primary)" }}>
            <SettingsOutlinedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              fontWeight={900}
              color="var(--color-primary)"
              sx={{
                letterSpacing: "-0.02em",
                mb: 1
              }}
            >
              समायोजन
            </Typography>
            <Box sx={{ height: "4px", width: "60px", bgcolor: "var(--color-success)", mb: 1.5, borderRadius: "2px" }} />
            <Typography fontSize={14} color="var(--color-slate-900)" fontWeight={500}>
              अपनी प्राथमिकताओं और एप्लिकेशन लेआउट को नियंत्रित करें
            </Typography>
          </Box>
        </Box>

        {/* Distributed Personal Details Panel ported from Institute Profile */}
        {!profileLoading && profile && (
          <ResponsiveSection
            isMobile={isMobile}
            title="व्यक्तिगत जानकारी (Personal Details)"
            action={
              <Button
                component="div"
                variant="outlined"
                onClick={() => setUpdateModalOpen(true)}
                sx={{
                  whiteSpace: "nowrap",
                  color: "var(--color-primary)",
                  borderColor: "var(--color-primary)",
                  textTransform: "none",
                  fontWeight: 800,
                  px: { xs: 1.5, sm: 3 },
                  py: { xs: 0.5, sm: 1 },
                  minWidth: { xs: "auto", sm: "130px" },
                  cursor: "pointer",
                  "&:hover": { bgcolor: "rgba(30, 79, 163, 0.05)" }
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
                <Box component="span" sx={{ display: { xs: "none", sm: "block" }, ml: 1 }}>
                  संपादित करें
                </Box>
              </Button>
            }
          >
            <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", px: { xs: 1, md: 2 } }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <InfoRow icon={EmailOutlinedIcon} label="ईमेल पता" value={profile.email} />
                <InfoRow icon={PhoneOutlinedIcon} label="फोन नंबर" value={profile.phone} />
                <InfoRow icon={PersonOutlineIcon} label="यूज़रनेम" value={profile.username} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <InfoRow icon={PersonOutlineIcon} label="पूरा नाम" value={profile.full_name} />
                <InfoRow icon={CakeOutlinedIcon} label="जन्म तिथि" value={profile.dob} />
                <InfoRow icon={WcOutlinedIcon} label="लिंग" value={profile.gender === "M" ? "पुरुष" : profile.gender === "F" ? "महिला" : profile.gender} />
              </Box>
            </Box>
          </ResponsiveSection>
        )}

        {/* Notifications Panel */}
        <ResponsiveSection
          isMobile={isMobile}
          title="सूचनाएँ (Notifications)"
          customTitleNode={
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: "rgba(30, 79, 163, 0.08)", color: "var(--color-primary)" }}>
                <NotificationsNoneOutlinedIcon fontSize="small" />
              </Box>
              <Typography variant="h6" fontWeight={800} color="var(--color-primary)">सूचनाएँ (Notifications)</Typography>
            </Box>
          }
        >

          <Box sx={{ px: { xs: 1, md: 2 } }}>
            <SettingRow label="पुश सूचनाएँ" desc="अपने डिवाइस पर सीधे तत्काल सूचनाएं प्राप्त करें" value={notifs} onChange={e => setNotifs(e.target.checked)} />
            <Divider sx={{ my: 1, borderColor: "rgba(0,0,0,0.05)" }} />
            <SettingRow label="ईमेल अलर्ट" desc="महत्वपूर्ण खाता गतिविधि के लिए दैनिक ईमेल सारांश" value={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} />
            <Divider sx={{ my: 1, borderColor: "rgba(0,0,0,0.05)" }} />
            <SettingRow label="ध्वनि सूचना" desc="नई सूचनाओं के लिए ध्वनि प्रभाव चलाएँ" value={sound} onChange={e => setSound(e.target.checked)} />
          </Box>
        </ResponsiveSection>

        {/* Security & Account Panel */}
        <ResponsiveSection
          isMobile={isMobile}
          title="सुरक्षा (Security)"
          customTitleNode={
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: "rgba(245, 158, 11, 0.1)", color: "var(--color-warning)" }}>
                <SecurityOutlinedIcon fontSize="small" />
              </Box>
              <Typography variant="h6" fontWeight={800} color="var(--color-warning)">सुरक्षा (Security)</Typography>
            </Box>
          }
        >
          <Box sx={{ px: { xs: 1, md: 2 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <VerifiedUserOutlinedIcon sx={{ color: profile?.kyc_status === "verified" ? "var(--color-success)" : "var(--color-slate-500)" }} />
                <Box>
                  <Typography fontSize={14} fontWeight={600} color="var(--color-slate-900)">KYC सत्यापन</Typography>
                  <Typography fontSize={12} color="var(--color-slate-500)" sx={{ mt: 0.5 }}>
                    {profile?.kyc_status === "verified" ? "आपका खाता सत्यापित है" : "खाता सत्यापन लंबित है"}
                  </Typography>
                </Box>
              </Box>
              {profile?.kyc_status !== "verified" && (
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => setKycModalOpen(true)}
                  sx={{ color: "var(--color-primary)", borderColor: "var(--color-primary)", fontWeight: "bold" }}
                >
                  सत्यापित करें
                </Button>
              )}
            </Box>
            
            <Divider sx={{ my: 1, borderColor: "rgba(0,0,0,0.05)" }} />
            
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <LockOutlinedIcon sx={{ color: "var(--color-slate-500)" }} />
                <Box>
                  <Typography fontSize={14} fontWeight={600} color="var(--color-slate-900)">पासवर्ड</Typography>
                  <Typography fontSize={12} color="var(--color-slate-500)" sx={{ mt: 0.5 }}>अपना पासवर्ड बदलें</Typography>
                </Box>
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ color: "var(--color-slate-500)", borderColor: "var(--color-slate-300)" }}
              >
                जल्द आ रहा है
              </Button>
            </Box>
          </Box>
        </ResponsiveSection>

        {/* Display Panel */}
        <ResponsiveSection
          isMobile={isMobile}
          title="प्रदर्शन (Display)"
          customTitleNode={
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: "rgba(40, 167, 69, 0.1)", color: "var(--color-success)" }}>
                <MonitorOutlinedIcon fontSize="small" />
              </Box>
              <Typography variant="h6" fontWeight={800} color="var(--color-success)">प्रदर्शन (Display)</Typography>
            </Box>
          }
        >

          <Box sx={{ px: { xs: 1, md: 2 } }}>
            <SettingRow label="डार्क मोड" desc="गंभीर रोशनी के लिए गहरे रंग की थीम सक्षम करें" value={darkMode} onChange={e => setDarkMode(e.target.checked)} />
            <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.05)" }} />

            <Box sx={{ pt: 1, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography fontSize={14} fontWeight={600} color="var(--color-slate-900)">ऐप की भाषा</Typography>
                <Typography fontSize={12} color="var(--color-slate-500)" sx={{ mt: 0.5 }}>अपनी पसंदीदा आवेदन भाषा चुनें</Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Chip
                  label="हिन्दी"
                  sx={{
                    bgcolor: "var(--color-primary)",
                    color: "var(--color-white)",
                    fontWeight: 'var(--font-semibold)',
                    px: 1,
                    "&:hover": { bgcolor: "var(--color-primary-hover)" }
                  }}
                />
                <Chip
                  label="English"
                  variant="outlined"
                  sx={{
                    fontWeight: 'var(--font-semibold)',
                    color: "var(--color-slate-500)",
                    borderColor: "var(--color-slate-200)",
                    px: 1,
                    cursor: "pointer",
                    bgcolor: "rgba(255, 255, 255, 0.5)",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </ResponsiveSection>
      </Box>

      {/* Global Metadata Update Modal */}
      {profile && (
        <>
          <ProfileUpdateModal
            open={isUpdateModalOpen}
            onClose={() => setUpdateModalOpen(false)}
            profile={profile}
            onSuccess={fetchProfile}
          />
          <KycVerificationModal
            open={isKycModalOpen}
            onClose={() => setKycModalOpen(false)}
            userId={profile.id}
            onSuccess={() => {
              setProfile(prev => ({ ...prev, kyc_status: "verified" }));
              fetchProfile();
            }}
          />
        </>
      )}
    </Box>
  );
}
