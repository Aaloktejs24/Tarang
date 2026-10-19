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
import CentralDropdown from '../../../components/common/CentralDropdown';
import { tooltipClasses } from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../../contexts/AuthContext';
import EmptyState from '../../../components/ui/EmptyState';
import { useAppRouter as useRouter } from '../../../hooks/useAppRouter';
import { Skeleton } from '@mui/material';
import { useBreadcrumbs } from '../../../contexts/BreadcrumbContext';

import { CustomTooltip } from '../../../components/common/CustomTooltip';
import ExploreListSkeleton from '../../../features/institute/ExploreListSkeleton';

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
        if (err?.response?.status === 404) {
          setInstitutes([]);
          setError(null);
        } else {
          setError(language === 'en' ? "Failed to load institutes." : "संस्थानों को लोड करने में विफल।");
        }
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
        borderRadius: 'var(--radius-lg)',
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        border: "var(--border-thin) solid rgba(255, 255, 255, 0.6)",
        '& .MuiMenuItem-root': {
          borderRadius: 'var(--radius-md)',
          mx: 1,
          mb: 0.5,
          fontWeight: 'var(--font-medium)',
          color: 'var(--color-slate-900)',
          '&:hover': {
            background: "rgba(255, 255, 255, 0.6)",
          },
          '&.Mui-selected': {
            background: "rgba(30, 79, 163, 0.1)",
            color: 'var(--color-primary)',
            fontWeight: 'var(--font-bold)',
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
                  <SearchIcon sx={{ color: 'var(--color-slate-500)' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                height: 'var(--box-height, 48px)',
                fontSize: 'var(--font-base)',
                color: 'var(--color-slate-900)',
                fontFamily: 'inherit',
                '& fieldset': {
                  borderColor: 'rgba(30, 79, 163, 0.2)',
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(30, 79, 163, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--color-primary)',
                  borderWidth: '1.5px',
                },
              },
              '& .MuiOutlinedInput-input': {
                padding: '0 14px',
                height: '100%',
                boxSizing: 'border-box',
              }
            }}
          />
          <Box sx={{ display: 'flex', gap: 2, width: { xs: 'var(--size-full)', md: 'auto' } }}>
            <Box sx={{ minWidth: 160, flex: 1 }}>
              <CentralDropdown
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={[
                  { value: "all", label: language === 'en' ? "All Types" : "सभी प्रकार" },
                  { value: "iit", label: language === 'en' ? "IITs" : "आईआईटी (IITs)" },
                  { value: "nit", label: language === 'en' ? "NITs" : "एनआईटी (NITs)" },
                  { value: "others", label: language === 'en' ? "Others" : "अन्य" }
                ]}
                searchable={false}
              />
            </Box>

            <Box sx={{ minWidth: 160, flex: 1 }}>
              <CentralDropdown
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: "newest", label: language === 'en' ? "Newest First" : "सबसे नया" },
                  { value: "oldest", label: language === 'en' ? "Oldest First" : "सबसे पुराना" },
                  { value: "alphabetical", label: language === 'en' ? "A-Z" : "अ-ज्ञ" }
                ]}
                searchable={false}
              />
            </Box>
          </Box>
        </Box>

        {loading ? (
          <ExploreListSkeleton />
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
                    sx={{ width: 'var(--size-full)', display: "flex", height: "var(--size-full)" }}
                  >
                    <Card elevation={0} sx={{
                      width: 'var(--size-full)',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 'var(--radius-lg)',
                      background: "rgba(255, 255, 255, 0.3)",
                      backdropFilter: "blur(30px)",
                      WebkitBackdropFilter: "blur(30px)",
                      border: "var(--border-thin) solid rgba(30, 79, 163, 0.2)",
                      transition: "all var(--transition-slow)",
                      overflow: "visible",
                      '&:hover': {
                        transform: 'translateY(-4px)'
                      }
                    }}>
                      {/* Header Banner */}
                      <Box sx={{
                        height: "140px",
                        width: "var(--size-full)",
                        backgroundImage: (inst.banner_url || inst.institute_profile?.banner_url)
                          ? `url(${inst.banner_url || inst.institute_profile?.banner_url})`
                          : "linear-gradient(135deg, rgba(0, 86, 179, 0.85) 0%, rgba(40, 167, 69, 0.75) 100%)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderTopLeftRadius: "var(--radius-lg)",
                        borderTopRightRadius: "var(--radius-lg)",
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
                                width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
                                bgcolor: "transparent", color: "var(--color-primary)",
                                border: 'none', outline: 'none',
                                cursor: 'pointer', transition: 'all var(--transition-base)',
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
                                width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
                                bgcolor: "transparent", color: "var(--color-primary)",
                                border: 'none', outline: 'none',
                                cursor: 'pointer', transition: 'all var(--transition-base)',
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
                                width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
                                bgcolor: "transparent", color: "var(--color-primary)",
                                border: 'none', outline: 'none',
                                cursor: 'pointer', transition: 'all var(--transition-base)',
                                '&:hover': { bgcolor: "rgba(30, 79, 163, 0.1)" }
                              }}>
                                <LocationOnIcon sx={{ fontSize: 18 }} />
                              </Box>
                            </CustomTooltip>
                          )}
                          <CustomTooltip title="Brochure / Document" placement="top-start" arrow>
                            <Box sx={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
                              bgcolor: "transparent", color: "var(--color-primary)",
                              border: 'none', outline: 'none',
                              cursor: 'pointer', transition: 'all var(--transition-base)',
                              '&:hover': { bgcolor: "rgba(30, 79, 163, 0.1)" }
                            }}>
                              <AttachFileIcon sx={{ fontSize: 18 }} />
                            </Box>
                          </CustomTooltip>
                        </Box>

                        {/* Avatar Overlapping the Banner Half-and-Half */}
                        <Box sx={{ position: "relative", display: "inline-flex", p: "2px", border: "2px solid var(--color-primary)", borderRadius: 'var(--radius-full)', zIndex: 2, bgcolor: "var(--card-bg)", mt: "-42px", mb: 2 }}>
                          <Avatar
                            src={inst.profile_pic_url}
                            alt={inst.institution_name || inst.full_name}
                            sx={{
                              width: 84, height: 84,
                              border: 'none',
                              fontSize: 32,
                              bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)", color: "var(--color-primary)", fontWeight: 800,
                              position: "relative", zIndex: 1
                            }}
                          >
                            {(inst.institution_name || inst.full_name || "?").charAt(0).toUpperCase()}
                          </Avatar>
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, color: 'var(--color-slate-900)', lineHeight: 1.3, textTransform: 'capitalize' }}>
                          {(() => {
                            const rawName = inst.institution_name || inst.institute_profile?.full_name || inst.full_name || inst.name || inst.username || "Unnamed Institute";
                            const nameParts = rawName ? rawName.split(' / ') : [];
                            return nameParts.length >= 1 ? nameParts[0].trim() : rawName;
                          })()}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          {inst.institute_profile?.institute_type && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "var(--color-primary)",
                                fontWeight: 'var(--font-bold)',
                                fontSize: 'var(--font-xs)',
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
                            color: 'var(--color-slate-500)',
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

                        <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5, width: 'var(--size-full)' }}>
                          <Button
                            variant="outlined"
                            sx={{
                              flex: 1,
                              borderRadius: 'var(--radius-md)',
                              borderColor: "rgba(30, 79, 163, 0.3)",
                              color: "var(--color-primary)",
                              fontWeight: 'var(--font-semibold)',
                              py: 1,
                              textTransform: "none",
                              fontSize: 'var(--font-base)',
                              transition: "var(--transition-base)",
                              '&:hover': {
                                bgcolor: "rgba(30, 79, 163, 0.08)",
                                borderColor: "var(--color-primary)"
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
                              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%)",
                              color: "var(--color-white)",
                              fontWeight: 'var(--font-semibold)',
                              py: 1,
                              borderRadius: 'var(--radius-md)',
                              textTransform: "none",
                              fontSize: 'var(--font-base)',
                              transition: "var(--transition-slow)",
                              '&:hover': {
                                bgcolor: "var(--color-success)",
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
