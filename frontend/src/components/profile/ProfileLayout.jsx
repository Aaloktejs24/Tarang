import React, { useEffect, useRef } from "react";
import {
  Box, Typography, Avatar, Button, Chip,
  Tabs, Tab, Skeleton, Tooltip
} from "@mui/material";
import { motion } from "framer-motion";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import ShareIcon from "@mui/icons-material/Share";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import Loader from "../common/Loader";
import PremiumCard from "../ui/PremiumCard";
import { capitalizeFirstLetter, getNoNamePlaceholder } from '../../utils/stringUtils';
import { useTranslation } from "../../hooks/useTranslation";
import { CustomTooltip } from '../common/CustomTooltip';


export default function ProfileLayout({
  profile,
  config, // { sidebarPrimary: "Skills", sidebarSecondary: "Recognitions" }
  editable = false,
  uploading = { banner: false, profile: false },
  onUpload = (file, type) => { },
  onVerifyClick = () => { },
  stats = [], // Array of { label, value }
  actionButtons = null, // React node
  tabs = [], // Array of { label, icon, value }
  currentTab = 0,
  onTabChange = () => { },
  tabPanels = [], // Array of React nodes
  sidebarBottom = null, // Extra cards for left sidebar
  profileType = "user" // "user" or "institute"
}) {
  const sidebarRef = useRef(null);
  const [bannerLoading, setBannerLoading] = React.useState(true);
  const [profileLoading, setProfileLoading] = React.useState(true);
  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);
  
  const { language } = useTranslation();

  useEffect(() => {
    let frameId;
    const updateParallax = () => {
      if (sidebarRef.current) {
        const rect = sidebarRef.current.parentElement.getBoundingClientRect();
        if (window.innerWidth >= 600) {
          const rawScrollAmount = 72 - rect.top;
          const isDesktop = window.innerWidth >= 900;
          const mtOffset = isDesktop ? 96 : 64;
          const rightPadding = isDesktop ? 32 : 24;
          const cap = mtOffset + rightPadding;
          const sidebarOffset = Math.max(0, Math.min(rawScrollAmount, cap));
          sidebarRef.current.style.transform = `translate3d(0, ${sidebarOffset}px, 0)`;
        } else {
          sidebarRef.current.style.transform = `translate3d(0, 0, 0)`;
        }
      }
      frameId = requestAnimationFrame(updateParallax);
    };
    frameId = requestAnimationFrame(updateParallax);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const getProfileImage = () => {
    if (profileType === 'institute') return profile?.institute_profile?.logo_url;
    return profile?.profile_pic_url;
  };

  const getBannerImage = () => {
    if (profileType === 'institute') return profile?.institute_profile?.banner_url;
    return profile?.banner_url;
  };

  const renderProfileCard = (isMobile = false) => (
    <PremiumCard variant="profile" sx={{ pt: 0, pb: 4, px: 4, textAlign: "left", overflow: "hidden", mb: isMobile ? 3 : 0 }}>
      {/* Banner Area */}
      <Box sx={{
        height: 120,
        mx: -4,
        mb: 0,
        backgroundImage: getBannerImage()
          ? `url(${getBannerImage()}), linear-gradient(135deg, var(--color-primary) 0%, #1e3a8a 100%)`
          : "linear-gradient(135deg, var(--color-primary) 0%, #1e3a8a 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative"
      }}>
        {editable && (
          <>
            <Box onClick={() => bannerInputRef.current?.click()} sx={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-white)", color: "var(--color-primary)", border: "1px solid var(--color-slate-200)", borderRadius: 'var(--radius-full)', cursor: "pointer", zIndex: 3, "&:hover": { background: "var(--color-slate-50)", transform: "scale(1.05)" }, transition: "all var(--transition-base)" }}>
              {uploading.banner ? <Loader mini /> : <EditOutlinedIcon sx={{ fontSize: 16, color: "var(--color-primary)" }} />}
            </Box>
            <input type="file" ref={bannerInputRef} style={{ display: "none" }} accept="image/*" onChange={(e) => onUpload(e.target.files[0], "banner")} />
          </>
        )}
      </Box>

      {/* Avatar and Action Button Row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: -5, mb: 3 }}>
        <Box sx={{ position: "relative", display: "inline-block", p: "2px", border: "2px solid var(--color-primary)", borderRadius: 'var(--radius-full)', zIndex: 2 }}>
          <Avatar
            sx={{
              width: 100, height: 100, position: "relative", zIndex: 2,
              background: "var(--theme-green)", color: "var(--color-white)",
              fontSize: 36, fontWeight: 900, border: "none", "& img": { objectFit: "cover" }
            }}
            src={getProfileImage()}
          >
            {!getProfileImage() && (
              profileType === 'institute'
                ? <AccountBalanceIcon sx={{ fontSize: 48 }} />
                : (profile?.full_name?.charAt(0).toUpperCase() || profile?.username?.charAt(0).toUpperCase() || "U")
            )}
          </Avatar>
          {editable && (
            <>
              <Box onClick={() => profileInputRef.current?.click()} sx={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-white)", color: "var(--color-primary)", border: "1px solid var(--color-slate-200)", borderRadius: 'var(--radius-full)', cursor: "pointer", zIndex: 3, "&:hover": { background: "var(--color-slate-50)", transform: "scale(1.05)" }, transition: "all var(--transition-base)" }}>
                {uploading.profile ? <Loader mini /> : <EditOutlinedIcon sx={{ fontSize: 14, color: "var(--color-primary)" }} />}
              </Box>
              <input type="file" ref={profileInputRef} style={{ display: "none" }} accept="image/*" onChange={(e) => onUpload(e.target.files[0], "profile")} />
            </>
          )}
        </Box>

        <Box sx={{ pb: 1, zIndex: 2, display: 'flex', gap: 1 }}>
          {editable && (
            profile?.kyc_status === "verified" ? (
              <Button variant="contained" size="small" disabled sx={{ borderRadius: 'var(--radius-md)', px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 'var(--font-medium)', fontSize: 'var(--font-sm)', background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%)", color: "var(--color-white)", whiteSpace: 'nowrap', minWidth: 0 }}>
                Verified
              </Button>
            ) : (
              <Button variant="contained" size="small" startIcon={<VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} />} onClick={onVerifyClick} sx={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%)', color: 'var(--color-white)', borderRadius: 'var(--radius-md)', px: 1.5, py: 0.5, textTransform: 'none', fontWeight: 'var(--font-semibold)', fontSize: 'var(--font-sm)', whiteSpace: 'nowrap', minWidth: 0 }}>
                Verify Now
              </Button>
            )
          )}
          {!editable && profile?.kyc_status === "verified" && (
            <VerifiedUserOutlinedIcon sx={{ color: "var(--color-primary)", fontSize: 24 }} />
          )}
        </Box>
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', mb: 0.5, fontSize: '1.4rem', textTransform: 'capitalize' }}>
        {(() => {
          if (profileType === 'institute') {
            const primaryName = profile?.primary_name || '';
            const secondaryName = profile?.secondary_name || '';
            return primaryName || secondaryName || profile?.full_name || profile?.username;
          }
          return profile?.full_name || profile?.username;
        })()}
      </Typography>
      <Typography variant="body1" sx={{ color: 'var(--color-slate-900)', fontWeight: 'var(--font-medium)', mb: 0.5, fontSize: 'var(--font-base)', textTransform: 'capitalize' }}>
        {profileType === 'institute' ? 'Institute' : (profile?.role === 'admin' ? 'Admin' : (profile?.role || "Member"))}
      </Typography>
      <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', mb: 2, fontSize: 'var(--font-sm)', textTransform: 'capitalize' }}>
        {profile?.location || "No location provided"}
      </Typography>

      {stats.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 1, mt: 3, pt: 3, borderTop: 'var(--border-thin) dashed rgba(30, 79, 163, 0.2)' }}>
          {stats.map((stat, i) => (
            <Box key={i} sx={{ px: 0.5, py: 2.5, height: "var(--size-full)", bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)", borderRadius: { xs: "12px", sm: "16px", md: "20px" }, border: "var(--border-thin) solid rgba(30, 79, 163, 0.15)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Typography fontSize={{ xs: 13, xl: 14 }} fontWeight={700} color="var(--color-slate-500)" sx={{ mb: 0.5, textAlign: "center", lineHeight: 1.3 }}>{stat.label}</Typography>
              <Typography fontSize={{ xs: 16, xl: 18 }} fontWeight={900} color="var(--color-primary)" sx={{ textAlign: "center", mt: 0.5 }}>{stat.value}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </PremiumCard>
  );

  const renderSkillsCard = (isMobile = false) => {
    const hasSkills = profile?.skills?.length > 0;
    const hasRecs = profile?.recognitions?.length > 0;

    // Default skills for display if none
    const defaultSkills = profileType === 'institute'
      ? ["Administration", "Leadership", "Management", "Operations", "Strategy"]
      : ["Capital Raising", "Marketing & Sales", "Consulting", "Asset Management", "Business Development"];

    if (!hasSkills && !hasRecs && !editable) return null;

    return (
      <PremiumCard variant="profile" sx={{ p: { xs: 2.5, sm: 4 }, mt: isMobile ? 0 : 3, mb: isMobile ? 3 : 0 }}>
        <Box sx={{ mb: hasRecs ? 4 : 0 }}>
          <Typography variant="subtitle1" fontWeight={500} color="var(--color-slate-900)" sx={{ mb: 1.5 }}>
            {config?.sidebarPrimary || "Skills"}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {(hasSkills ? profile.skills : defaultSkills).map((skill, i) => (
              <Chip key={i} label={skill} sx={{ borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-regular)', bgcolor: "transparent", color: "var(--color-slate-900)", border: "var(--border-thin) solid var(--card-border)", px: 1, fontSize: 'var(--font-sm)', backdropFilter: "var(--card-blur)", transition: "var(--transition-slow)", '&:hover': { transform: 'translateY(-2px)' } }} />
            ))}
          </Box>
        </Box>
        {hasRecs && (
          <Box>
            <Typography variant="subtitle1" fontWeight={500} color="var(--color-slate-900)" sx={{ mb: 1.5 }}>
              {config?.sidebarSecondary || "Recognitions"}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {profile.recognitions.map((rec, i) => (
                <Chip key={i} label={rec} icon={<EmojiEventsOutlinedIcon sx={{ color: 'var(--color-slate-500)' }} />} sx={{ borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-regular)', bgcolor: "transparent", color: "var(--color-slate-500)", border: "var(--border-thin) solid var(--card-border)", px: 1, py: 2.5, fontSize: 'var(--font-sm)', backdropFilter: "var(--card-blur)", transition: "var(--transition-slow)", '&:hover': { transform: 'translateY(-2px)' } }} />
              ))}
            </Box>
          </Box>
        )}
      </PremiumCard>
    );
  };

  const renderSocialLinks = () => {
    if (!profile?.social_links || Object.keys(profile.social_links).length === 0) return null;
    return (
      <PremiumCard variant="profile" sx={{ p: { xs: 2.5, sm: 4 }, mt: 3 }}>
        <Typography variant="subtitle1" fontWeight={500} color="var(--color-slate-900)" sx={{ mb: 1.5 }}>
          Connect
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {Object.entries(profile.social_links).map(([platform, url]) => {
            const getBrandColor = (p) => {
              const lower = p.toLowerCase();
              if (lower === 'linkedin') return '#0077b5';
              if (lower === 'github') return '#333333';
              if (lower === 'twitter') return '#1DA1F2';
              if (lower === 'instagram') return '#E1306C';
              return 'var(--color-primary)';
            };
            return (
              <CustomTooltip key={platform} title={platform} placement="top" arrow>
                <Box
                  component="a" href={url} target="_blank" rel="noopener noreferrer"
                  sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: getBrandColor(platform), transition: 'opacity 0.2s', '&:hover': { opacity: 0.8 } }}
                >
                  {platform.toLowerCase() === 'linkedin' ? <LinkedInIcon sx={{ fontSize: 28 }} /> :
                    platform.toLowerCase() === 'github' ? <GitHubIcon sx={{ fontSize: 28 }} /> :
                      platform.toLowerCase() === 'twitter' ? <TwitterIcon sx={{ fontSize: 28 }} /> :
                        platform.toLowerCase() === 'instagram' ? <InstagramIcon sx={{ fontSize: 28 }} /> :
                          <ShareIcon sx={{ fontSize: 28 }} />}
                </Box>
              </CustomTooltip>
            );
          })}
        </Box>
      </PremiumCard>
    );
  };

  return (
    <Box sx={{ height: "calc(100vh - 72px)", overflow: "hidden", display: "flex" }}>

      {/* LEFT SIDEBAR — independently scrollable */}
      <Box sx={{
        width: { xs: '100%', sm: 420, md: 480 }, flexShrink: 0, overflowY: "auto", height: "100%",
        display: { xs: 'none', sm: 'block' }, "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none",
        pl: { sm: 2, md: 4, lg: 6 }, pr: { sm: 1, md: 1.5, lg: 1.5 }, pt: { sm: 3, md: 4 }, pb: { sm: 6, md: 8 },
      }}>
        <Box ref={sidebarRef} sx={{ width: "var(--size-full)" }}>
          {renderProfileCard(false)}
          {renderSkillsCard(false)}
          {renderSocialLinks()}
          {sidebarBottom}
        </Box>
      </Box>

      {/* RIGHT MAIN CONTENT — independently scrollable */}
      <Box sx={{
        flexGrow: 1, display: { xs: 'block', sm: 'flex' }, flexDirection: 'column', height: "100%",
        overflowY: { xs: 'auto', sm: 'hidden' }, "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none",
        pl: { xs: 2, sm: 1, md: 1.5, lg: 1.5 }, pr: { xs: 2, sm: 2, md: 4, lg: 6 }, pt: { xs: 3, md: 4 }, pb: { xs: 4, sm: 0 },
      }}>

        {/* Mobile Sidebar Cards Inline */}
        <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 3 }}>
          {renderProfileCard(true)}
          {renderSkillsCard(true)}
          {renderSocialLinks()}
          {sidebarBottom}
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 0, pb: 0, mb: 0 }}>
          <Box sx={{
            display: "flex", gap: 0.5, overflowX: "auto", overflowY: "hidden", '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none', bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)",
            border: "var(--border-thin) solid var(--card-border)", p: 0.5, borderRadius: 'var(--radius-md)',
            mr: { xs: 0, sm: 2 }, flex: { xs: 1, xl: 'none' }, maxWidth: '100%', height: '44px', alignItems: 'center',
          }}>
            {tabs.map((tab, i) => (
              <Box
                key={i}
                onClick={() => onTabChange(null, tab.value)}
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  px: { xs: 1.5, sm: 2 },
                  py: 0,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 'var(--radius-md)',
                  color: "var(--color-slate-500)",
                  fontWeight: 'var(--font-semibold)',
                  fontSize: 'var(--font-sm)',
                  transition: "color var(--transition-base)",
                  '&:hover': {
                    // No text color change on hover
                  },
                  zIndex: 1,
                  flex: 1,
                }}
              >
                {tab.icon && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, '& .MuiSvgIcon-root': { fontSize: { xs: 16, sm: 18 } } }}>
                    {tab.icon}
                  </Box>
                )}
                {tab.label}
                {currentTab === tab.value && (
                  <motion.div
                    layoutId="activeProfileTab"
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "transparent",
                      backdropFilter: "var(--card-blur)",
                      border: "var(--border-thin) solid var(--card-border)",
                      borderRadius: "var(--radius-md)",
                      zIndex: -1,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </Box>
            ))}
          </Box>
          {actionButtons && (
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexShrink: 0 }}>
              {actionButtons}
            </Box>
          )}
        </Box>

        {/* Tab Content Area */}
        <Box sx={{
          flexGrow: 1, mt: 3, pt: { sm: 1 }, overflowY: "auto",
          "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none"
        }}>
          {tabPanels[currentTab]}
        </Box>

      </Box>
    </Box>
  );
}
