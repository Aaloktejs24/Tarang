"use client";
import React from 'react';
import { Box, Typography, Button, Container, Card, CardContent, Grid, Chip } from '@mui/material';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../hooks/useTranslation';
import AdmissionBuilder from './AdmissionBuilder';

export default function AdmissionsDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isBuilderOpen, setIsBuilderOpen] = React.useState(false);

  const admissions = [];

  return (
    <>
      <Box sx={{ position: "relative", minHeight: "calc(100vh - 64px)", overflow: "hidden", bgcolor: "transparent" }}>
        {/* Fixed Background */}
        <Box
          sx={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: -1,
            background: `
              radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.55) 0, transparent 50%), 
              radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.4) 0, transparent 50%), 
              radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.3) 0, transparent 50%),
              radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.3) 0, transparent 50%),
              #eef2f6
            `
          }}
        >
          <Box sx={{ position: "absolute", width: "50vw", height: "50vw", top: "-10%", left: "-10%", background: "rgba(16, 185, 129, 0.05)", filter: "blur(120px)", borderRadius: "50%", pointerEvents: "none" }} />
        </Box>

        <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 6 }, pb: 6 }}>
          {/* Breadcrumbs */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography onClick={() => router.push('/dashboard/home')} sx={{ color: '#64748b', fontWeight: 700, fontSize: "1.1rem", cursor: 'pointer', '&:hover': { color: '#0056b3' } }}>
              {t('admissionsDashboard.breadcrumbs.dashboard')}
            </Typography>
            <Typography sx={{ color: '#334155', fontWeight: 900, fontSize: "1.1rem" }}>/</Typography>
            <Typography onClick={() => router.push('/dashboard/home/institute')} sx={{ color: '#64748b', fontWeight: 700, fontSize: "1.1rem", cursor: 'pointer', '&:hover': { color: '#0056b3' } }}>
              {t('admissionsDashboard.breadcrumbs.institute')}
            </Typography>
            <Typography sx={{ color: '#334155', fontWeight: 900, fontSize: "1.1rem" }}>/</Typography>
            <Typography sx={{ color: '#0f172a', fontWeight: 700, fontSize: "1.1rem" }}>
              {t('admissionsDashboard.breadcrumbs.admissions')}
            </Typography>
          </Box>

          {admissions.length > 0 ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6, width: '100%', px: 3 }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {t('admissionsDashboard.title')}
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#475569', mt: 1 }}>
                      {t('admissionsDashboard.subtitle')}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained" disableElevation
                    onClick={() => setIsBuilderOpen(true)}
                    sx={{
                      bgcolor: '#0056b3', color: 'white', borderRadius: '12px', px: 4, py: 1.5,
                      fontWeight: 700, fontSize: '1rem', textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(0,86,179,0.4)',
                      '&:hover': { bgcolor: '#004494' },
                      transition: 'all 0.2s'
                    }}
                  >
                    {t('admissionsDashboard.createWorkflowBtn')}
                  </Button>
                </Box>
                <Grid container spacing={4}>
                  {admissions.map((admission, index) => (
                  <Grid item xs={12} md={6} lg={4} key={admission.id}>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }}>
                    <Card sx={{
                      borderRadius: "24px",
                      background: 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(30px)',
                      border: '1px solid rgba(30, 79, 163, 0.2)',
                      boxShadow: 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.6)',
                        border: '1px solid rgba(30, 79, 163, 0.5)'
                      }
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                          <Chip 
                            label={admission.status} 
                            size="small" 
                            sx={{ 
                              fontWeight: 700,
                              bgcolor: admission.status === 'Active' ? '#e6f4ea' : (admission.status === 'Draft' ? '#fff3cd' : '#f8d7da'),
                              color: admission.status === 'Active' ? '#28a745' : (admission.status === 'Draft' ? '#856404' : '#721c24')
                            }} 
                          />
                          <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                            {admission.date}
                          </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 3, lineHeight: 1.3 }}>
                          {admission.title}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PeopleOutlinedIcon sx={{ color: '#0056b3' }} />
                            <Typography sx={{ fontWeight: 700, color: '#334155' }}>{admission.applicants} {t('admissionsDashboard.applicants')}</Typography>
                          </Box>
                          <Button variant="outlined" size="small" sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
                            {t('admissionsDashboard.manageBtn')}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%' }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                py: { xs: 4, md: 6 },
                px: 3,
                textAlign: 'center',
                width: '100%',
                mt: 2
              }}>
                    <Box sx={{
                      width: '100%',
                      maxWidth: 420,
                      height: 240,
                      mb: 5,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}>
                      <Box sx={{
                        position: 'absolute',
                        top: '-20%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        height: '400px',
                        background: 'radial-gradient(ellipse, rgba(0, 86, 179, 0.06) 0%, rgba(255,255,255,0) 70%)',
                        pointerEvents: 'none'
                      }} />
                      <svg viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', animation: 'float 6s ease-in-out infinite' }}>
                        <style>
                          {`
                          @keyframes float {
                            0%, 100% { transform: translateY(0px); }
                            50% { transform: translateY(-8px); }
                          }
                          @keyframes floatSlow {
                            0%, 100% { transform: translateY(0px) rotate(0deg); }
                            50% { transform: translateY(-4px) rotate(5deg); }
                          }
                          @keyframes pulseGlow {
                            0%, 100% { opacity: 0.5; r: 65px; }
                            50% { opacity: 0.7; r: 68px; }
                          }
                        `}
                        </style>

                        {/* Ground Shadow Blob */}
                        <ellipse cx="130" cy="165" rx="110" ry="12" fill="rgba(0, 0, 0, 0.04)" />

                        {/* Background Ambient Glow */}
                        <circle cx="130" cy="80" r="65" fill="rgba(37, 99, 235, 0.05)" style={{ animation: 'pulseGlow 4s ease-in-out infinite' }} />

                        {/* Floating decorative elements */}
                        <path d="M 40 35 Q 40 45 30 45 Q 40 45 40 55 Q 40 45 50 45 Q 40 45 40 35" fill="#f59e0b" opacity="0.9" style={{ animation: 'floatSlow 4s ease-in-out infinite', transformOrigin: '40px 45px' }} />
                        <rect x="220" y="30" width="12" height="12" rx="3" fill="#10b981" opacity="0.8" style={{ animation: 'float 5s ease-in-out infinite', transformOrigin: '226px 36px' }} transform="rotate(15 226 36)" />
                        <path d="M 210 120 L 222 128 L 210 136 Z" fill="#3b82f6" opacity="0.7" style={{ animation: 'floatSlow 6s ease-in-out infinite' }} />

                        {/* ================= CHARACTER BACKGROUND ================= */}
                        {/* Chair Backrest */}
                        <rect x="105" y="55" width="50" height="70" rx="12" fill="#475569" />

                        {/* Character Torso */}
                        <path d="M 100 85 Q 130 75 160 85 L 150 140 L 110 140 Z" fill="#0056b3" />
                        
                        {/* Shirt Collar / V-neck */}
                        <polygon points="120,83 140,83 130,105" fill="#f1f5f9" />
                        {/* Tie */}
                        <polygon points="128,95 132,95 130,120" fill="#f59e0b" />

                        {/* Neck */}
                        <rect x="126" y="66" width="8" height="18" fill="#fad6ca" />

                        {/* Head */}
                        <circle cx="130" cy="55" r="16" fill="#fad6ca" />
                        
                        {/* Hair */}
                        <path d="M 112 55 Q 112 33 130 33 Q 148 33 148 55 Q 140 40 130 42 Q 120 40 112 55 Z" fill="#0f172a" />
                        
                        {/* Glasses */}
                        <line x1="118" y1="51" x2="142" y2="51" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                        <path d="M 120 51 L 128 51 Q 128 58 124 58 Q 120 58 120 51 Z" fill="#ffffff" opacity="0.8" stroke="#0f172a" strokeWidth="1" />
                        <path d="M 132 51 L 140 51 Q 140 58 136 58 Q 132 58 132 51 Z" fill="#ffffff" opacity="0.8" stroke="#0f172a" strokeWidth="1" />

                        {/* ================= DESK ================= */}
                        {/* Back/Inside of Desk */}
                        <rect x="65" y="130" width="130" height="20" fill="#94a3b8" />
                        
                        {/* Desk Legs */}
                        <line x1="75" y1="130" x2="75" y2="170" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
                        <line x1="185" y1="130" x2="185" y2="170" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
                        
                        {/* Desk Surface */}
                        <path d="M 50 120 L 210 120 L 195 135 L 65 135 Z" fill="#cbd5e1" />
                        {/* Desk Front Edge */}
                        <rect x="65" y="135" width="130" height="6" rx="2" fill="#94a3b8" />

                        {/* ================= CHARACTER ARMS ================= */}
                        {/* Left Arm (Resting near mug) */}
                        <path d="M 105 88 L 85 110 L 93 115 L 112 95 Z" fill="#004b9c" />
                        {/* Left Hand */}
                        <circle cx="87" cy="115" r="5" fill="#fad6ca" />
                        
                        {/* Right Arm (Hidden behind laptop screen) */}
                        <path d="M 155 88 L 140 110 L 148 114 L 162 95 Z" fill="#004b9c" />

                        {/* ================= DESK ITEMS ================= */}
                        {/* Laptop Screen (Back) */}
                        <rect x="110" y="88" width="40" height="28" rx="3" fill="#1e293b" />
                        <circle cx="130" cy="100" r="4" fill="#e2e8f0" opacity="0.6" />
                        
                        {/* Laptop Base */}
                        <path d="M 105 116 L 155 116 L 160 120 L 100 120 Z" fill="#64748b" />
                        
                        {/* Papers / Folders on desk */}
                        <rect x="160" y="115" width="25" height="15" rx="1" fill="#f8fafc" transform="rotate(-15 160 115)" />
                        <rect x="162" y="113" width="22" height="15" rx="1" fill="#f59e0b" opacity="0.8" transform="rotate(-5 162 113)" />
                        <line x1="165" y1="118" x2="178" y2="118" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" transform="rotate(-5 162 113)" />
                        
                        {/* Coffee Mug */}
                        <rect x="75" y="105" width="10" height="14" rx="2" fill="#ef4444" />
                        <path d="M 72 108 Q 68 112 72 116" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none" />
                      </svg>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, zIndex: 1 }}>
                      {t('admissionsDashboard.emptyStateTitle')}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: '#475569', mb: 5, maxWidth: '540px', fontWeight: 500, lineHeight: 1.6, zIndex: 1, fontSize: '1.05rem' }}>
                      {t('admissionsDashboard.emptyStateSubtitle')}
                    </Typography>
                    <Button
                      variant="contained" disableElevation
                      onClick={() => setIsBuilderOpen(true)}
                      sx={{
                        bgcolor: '#0056b3', color: 'white', borderRadius: "8px", px: 4, py: 1.5,
                        fontWeight: 600, fontSize: '1rem', textTransform: 'none',
                        boxShadow: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1.2,
                        zIndex: 1,
                        '&:hover': { bgcolor: '#004494', boxShadow: 'none' },
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" style={{ width: 20, height: 20, transition: 'transform 0.2s' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
                      </svg>
                      {t('admissionsDashboard.startBuildingBtn')}
                    </Button>
                  </Box>
            </motion.div>
          )}
        </Container>
      </Box>

      {/* Admission Builder Layover */}
      <AdmissionBuilder open={isBuilderOpen} onClose={() => setIsBuilderOpen(false)} />
    </>
  );
}
