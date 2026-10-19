"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, Avatar, Chip, Alert, Button, Tooltip, TextField, Select, MenuItem, FormControl, InputLabel, InputAdornment, Breadcrumbs, Link } from '@mui/material';
import { motion } from 'framer-motion';
import { apiClient } from '../../../lib/apiClient';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EmailIcon from '@mui/icons-material/Email';
import TranslateIcon from '@mui/icons-material/Translate';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../../contexts/AuthContext';
import EmptyState from '../../../components/ui/EmptyState';
import { useAppRouter as useRouter } from '../../../hooks/useAppRouter';
import { Skeleton } from '@mui/material';
import { useBreadcrumbs } from '../../../contexts/BreadcrumbContext';

import { CustomTooltip } from '../../../components/common/CustomTooltip';
export default function ExploreInstitutes() {
  const { language } = useAccessibility();
  const router = useRouter();
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useBreadcrumbs([
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home') },
    { labelEn: 'Explore', labelHi: 'खोजें' }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/public/institutes');
        const fetchedData = res.data || [];

        setInstitutes(fetchedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch institutes", err);
        setError(language === 'en' ? "Failed to load institutes." : "संस्थानों को लोड करने में विफल।");
      } finally {
        setLoading(false);
      }
    };
    fetchInstitutes();
  }, [language]);

  const filteredAndSortedInstitutes = institutes
    .filter(inst => {
      if (!inst) return false;
      const nameMatch = (inst.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const locationMatch = (inst.location || '').toLowerCase().includes(searchTerm.toLowerCase());

      let typeMatch = true;
      if (filterType === 'iit') {
        typeMatch = (inst.name || '').toLowerCase().includes('iit') || (inst.name || '').toLowerCase().includes('indian institute of technology');
      } else if (filterType === 'nit') {
        typeMatch = (inst.name || '').toLowerCase().includes('nit') || (inst.name || '').toLowerCase().includes('national institute of technology');
      } else if (filterType === 'others') {
        const isIIT = (inst.name || '').toLowerCase().includes('iit') || (inst.name || '').toLowerCase().includes('indian institute of technology');
        const isNIT = (inst.name || '').toLowerCase().includes('nit') || (inst.name || '').toLowerCase().includes('national institute of technology');
        typeMatch = !isIIT && !isNIT;
      }

      return (nameMatch || locationMatch) && typeMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'alphabetical') return (a?.name || '').localeCompare(b?.name || '');
      if (sortBy === 'oldest') return (parseInt(a.institute_profile?.established_year) || 9999) - (parseInt(b.institute_profile?.established_year) || 9999);
      if (sortBy === 'newest') return (parseInt(b.institute_profile?.established_year) || 0) - (parseInt(a.institute_profile?.established_year) || 0);
      return 0;
    });

  const menuProps = {
    PaperProps: {
      sx: {
        mt: 1,
        borderRadius: "16px",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        '& .MuiMenuItem-root': {
          borderRadius: "8px",
          mx: 1,
          mb: 0.5,
          fontWeight: 500,
          color: '#1e293b',
          '&:hover': {
            background: "rgba(255, 255, 255, 0.6)",
          },
          '&.Mui-selected': {
            background: "rgba(30, 79, 163, 0.1)",
            color: '#1e4fa3',
            fontWeight: 700,
            '&:hover': {
              background: "rgba(30, 79, 163, 0.15)",
            }
          }
        }
      }
    }
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", pt: { xs: 8, md: 10 }, pb: 10, position: "relative", zIndex: 1 }}>
      <Container maxWidth="xl" sx={{ mt: 4, px: { xs: 2, sm: 4, md: 8, lg: 12, xl: 16 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 6, alignItems: 'center', justifyContent: 'space-between' }}>
          <TextField
            fullWidth
            placeholder={language === 'en' ? "Search institutes by name or location..." : "नाम या स्थान से संस्थान खोजें..."}
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.8)' }
            }}
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
            <FormControl sx={{ minWidth: 160, flex: 1 }}>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                displayEmpty
                variant="outlined"
                startAdornment={<InputAdornment position="start"><FilterListIcon color="action" /></InputAdornment>}
                sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.8)' }}
                MenuProps={menuProps}
              >
                <MenuItem value="all">{language === 'en' ? "All Types" : "सभी प्रकार"}</MenuItem>
                <MenuItem value="iit">{language === 'en' ? "IITs" : "आईआईटी (IITs)"}</MenuItem>
                <MenuItem value="nit">{language === 'en' ? "NITs" : "एनआईटी (NITs)"}</MenuItem>
                <MenuItem value="others">{language === 'en' ? "Others" : "अन्य"}</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160, flex: 1 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                displayEmpty
                variant="outlined"
                startAdornment={<InputAdornment position="start"><SortIcon color="action" /></InputAdornment>}
                sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.8)' }}
                MenuProps={menuProps}
              >
                <MenuItem value="newest">{language === 'en' ? "Newest First" : "सबसे नया"}</MenuItem>
                <MenuItem value="oldest">{language === 'en' ? "Oldest First" : "सबसे पुराना"}</MenuItem>
                <MenuItem value="alphabetical">{language === 'en' ? "A-Z" : "अ-ज्ञ"}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              {Array.from(new Array(6)).map((_, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }} key={idx}>
                  <Card elevation={0} sx={{
                    width: '100%', display: 'flex', flexDirection: 'column', borderRadius: "16px",
                    background: "rgba(255, 255, 255, 0.3)", backdropFilter: "blur(30px)",
                    border: "1px solid rgba(30, 79, 163, 0.2)", boxShadow: "none", overflow: "visible"
                  }}>
                    <Skeleton variant="rectangular" width="100%" height={140} sx={{ borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }} />
                    <CardContent sx={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', pt: 0, px: 3, pb: 3 }}>
                      <Skeleton variant="circular" width={84} height={84} sx={{ mt: "-42px", mb: 2, border: '4px solid rgba(255, 255, 255, 0.8)' }} />
                      <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
                      <Skeleton variant="text" width="100%" height={80} sx={{ mb: 3 }} />
                      <Box sx={{ display: 'flex', gap: 1.5, width: '100%', mt: 'auto' }}>
                        <Skeleton variant="rectangular" sx={{ flex: 1, height: 42, borderRadius: '8px' }} />
                        <Skeleton variant="rectangular" sx={{ flex: 1, height: 42, borderRadius: '8px' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mx: 'auto', maxWidth: 600 }}>{error}</Alert>
        ) : filteredAndSortedInstitutes.length === 0 ? (
          <EmptyState
            title={language === 'en' ? "No Institutes Found" : "कोई संस्थान नहीं मिला"}
            subtitle={language === 'en' ? "We couldn't find any institutes matching your search criteria. Please try adjusting your filters or search terms." : "आपकी खोज से मेल खाने वाला कोई संस्थान नहीं मिला। कृपया अपने फ़िल्टर या खोज शब्द बदलकर पुनः प्रयास करें।"}
          />
        ) : (
          <Grid container spacing={3}>
            {filteredAndSortedInstitutes.map((inst, index) => {
              const mockRecognitions = inst.recognitions?.length > 0 ? inst.recognitions : [];
              const mockBio = inst.institute_profile?.bio || '';

              return (
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }} key={inst.id}>
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                    sx={{ width: '100%', display: "flex", height: "100%" }}
                  >
                    <Card elevation={0} sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: "16px",
                      background: "rgba(255, 255, 255, 0.3)",
                      backdropFilter: "blur(30px)",
                      WebkitBackdropFilter: "blur(30px)",
                      border: "1px solid rgba(30, 79, 163, 0.2)",
                      boxShadow: "none",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      overflow: "visible",
                      '&:hover': {
                        transform: 'translateY(-4px)'
                      }
                    }}>
                      {/* Header Banner */}
                      <Box sx={{
                        height: "140px",
                        width: "100%",
                        backgroundImage: (inst.banner_url || inst.institute_profile?.banner_url)
                          ? `url(${inst.banner_url || inst.institute_profile?.banner_url})`
                          : "linear-gradient(135deg, rgba(0, 86, 179, 0.85) 0%, rgba(40, 167, 69, 0.75) 100%)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderTopLeftRadius: "16px",
                        borderTopRightRadius: "16px",
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {/* Subtle overlay pattern */}
                        <Box sx={{
                          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)",
                          backgroundSize: "16px 16px"
                        }} />
                      </Box>

                      <CardContent sx={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', pt: 0, px: 3, pb: 3 }}>

                        {/* Right-aligned quick actions (Year, Ranking, Location, Brochure) */}
                        <Box sx={{ position: 'absolute', top: 16, right: 24, display: 'flex', gap: 1 }}>
                          {inst.institute_profile?.established_year && (
                            <CustomTooltip title={language === 'en' ? `Est. ${inst.institute_profile.established_year}` : `स्थापना: ${inst.institute_profile.established_year}`} placement="top-start" arrow>
                              <Box sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '32px', height: '32px', borderRadius: '50%',
                                bgcolor: "transparent", color: "#1e4fa3",
                                border: 'none', outline: 'none',
                                cursor: 'pointer', transition: 'all 0.2s',
                                '&:hover': { bgcolor: "rgba(30, 79, 163, 0.1)" }
                              }}>
                                <EventAvailableIcon sx={{ fontSize: 18 }} />
                              </Box>
                            </CustomTooltip>
                          )}
                          {mockRecognitions && mockRecognitions.length > 0 && (
                            <CustomTooltip title={mockRecognitions.join(", ")} placement="top-start" arrow>
                              <Box sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '32px', height: '32px', borderRadius: '50%',
                                bgcolor: "transparent", color: "#1e4fa3",
                                border: 'none', outline: 'none',
                                cursor: 'pointer', transition: 'all 0.2s',
                                '&:hover': { bgcolor: "rgba(30, 79, 163, 0.1)" }
                              }}>
                                <EmojiEventsIcon sx={{ fontSize: 18 }} />
                              </Box>
                            </CustomTooltip>
                          )}
                          {inst.location && (
                            <CustomTooltip title={inst.location} placement="top-start" arrow>
                              <Box sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '32px', height: '32px', borderRadius: '50%',
                                bgcolor: "transparent", color: "#1e4fa3",
                                border: 'none', outline: 'none',
                                cursor: 'pointer', transition: 'all 0.2s',
                                '&:hover': { bgcolor: "rgba(30, 79, 163, 0.1)" }
                              }}>
                                <LocationOnIcon sx={{ fontSize: 18 }} />
                              </Box>
                            </CustomTooltip>
                          )}
                          <CustomTooltip title="Brochure / Document" placement="top-start" arrow>
                            <Box sx={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: '32px', height: '32px', borderRadius: '50%',
                              bgcolor: "transparent", color: "#1e4fa3",
                              border: 'none', outline: 'none',
                              cursor: 'pointer', transition: 'all 0.2s',
                              '&:hover': { bgcolor: "rgba(30, 79, 163, 0.1)" }
                            }}>
                              <AttachFileIcon sx={{ fontSize: 18 }} />
                            </Box>
                          </CustomTooltip>
                        </Box>

                        {/* Avatar Overlapping the Banner Half-and-Half */}
                        <Avatar
                          src={inst.profile_pic_url}
                          alt={inst.institution_name || inst.full_name}
                          sx={{
                            width: 84, height: 84,
                            mt: "-42px", mb: 2,
                            border: '4px solid rgba(255, 255, 255, 0.8)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            fontSize: 32,
                            bgcolor: "#fff", color: "#0056b3", fontWeight: 800,
                            position: "relative", zIndex: 1
                          }}
                        >
                          {(inst.institution_name || inst.full_name || "?").charAt(0).toUpperCase()}
                        </Avatar>

                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, color: '#0f172a', lineHeight: 1.3, textTransform: 'capitalize' }}>
                          {inst.institute_profile?.full_name || inst.full_name || inst.name || inst.username || "Unnamed Institute"}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          {inst.institute_profile?.institute_type && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#0056b3",
                                fontWeight: 700,
                                fontSize: "0.8rem",
                                textTransform: 'capitalize'
                              }}
                            >
                              {inst.institute_profile.institute_type}
                            </Typography>
                          )}
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            color: '#475569',
                            mb: 3,
                            display: '-webkit-box',
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.5,
                            minHeight: '7.5em'
                          }}
                        >
                          {inst.bio || inst.institute_profile?.about_institute || inst.institute_profile?.bio || mockBio}
                        </Typography>

                        <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5, width: '100%' }}>
                          <Button
                            variant="outlined"
                            sx={{
                              flex: 1,
                              borderRadius: "8px",
                              borderColor: "rgba(30, 79, 163, 0.3)",
                              color: "#1e4fa3",
                              fontWeight: 600,
                              py: 1,
                              textTransform: "none",
                              fontSize: "0.95rem",
                              transition: "all 0.2s ease",
                              '&:hover': {
                                bgcolor: "rgba(30, 79, 163, 0.08)",
                                borderColor: "#1e4fa3"
                              }
                            }}
                            startIcon={<EmailIcon />}
                          >
                            {language === 'en' ? 'Contact' : 'संपर्क'}
                          </Button>

                          <Button
                            variant="contained"
                            disableElevation
                            onClick={() => router.push(`/dashboard/explore/${inst.username}`)}
                            sx={{
                              flex: 1,
                              background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
                              color: "#ffffff !important",
                              fontWeight: 600,
                              py: 1,
                              borderRadius: "8px",
                              textTransform: "none",
                              fontSize: "0.95rem",
                              transition: "all 0.3s ease",
                              '&:hover': {
                                bgcolor: "#218838",
                                boxShadow: "none"
                              }
                            }}
                          >
                            {language === 'en' ? 'Details' : 'विस्तार'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
