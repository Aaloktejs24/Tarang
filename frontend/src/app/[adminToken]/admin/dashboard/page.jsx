"use client";

import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Container, Button, ThemeProvider, createTheme } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const theme = createTheme({
  typography: {
    fontFamily: "'Rozha One', serif",
  },
});

export default function AdminDashboard() {
  const params = useParams();
  const router = useRouter();
  const token = params.adminToken;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      }}>
        {/* Navbar */}
        <Box sx={{ 
          px: 4, 
          py: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'linear-gradient(135deg, rgba(0, 86, 179, 0.05) 0%, rgba(40, 167, 69, 0.05) 100%)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 20px rgba(0, 86, 179, 0.08)',
          borderBottom: '2px solid transparent',
          borderImage: 'linear-gradient(90deg, #0056b3 0%, #28a745 50%, #ffc107 100%) 1',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box component="img" src="/logo.svg" alt="Tarang Logo" sx={{ width: 45, height: 45, objectFit: 'contain' }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#001b3a', fontFamily: "'Rozha One', serif" }}>
              Tarang Admin
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            disableElevation
            onClick={() => router.push(`/${token}/admin`)}
            sx={{
              bgcolor: "#dc3545",
              "&:hover": { bgcolor: "#c82333" },
              borderRadius: "8px",
              px: 3,
              height: "42px",
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem"
            }}
          >
            Log Out
          </Button>
        </Box>

        <Container maxWidth="xl" sx={{ mt: 8, mb: 8, flexGrow: 1 }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: '#0f172a', fontFamily: "'Rozha One', serif" }}>
            Admin Dashboard
          </Typography>

          {/* Key Statistics Section */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {/* Stat Card 1 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ 
                borderRadius: '16px', 
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                backdropFilter: 'blur(10px)',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Total Users
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#0f172a', fontWeight: 800 }}>
                        24,592
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(0, 86, 179, 0.1)', color: '#0056b3' }}>
                      <PeopleIcon />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#28a745', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} /> +12.5% this month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Stat Card 2 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ 
                borderRadius: '16px', 
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                backdropFilter: 'blur(10px)',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Active Institutes
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#0f172a', fontWeight: 800 }}>
                        1,248
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(40, 167, 69, 0.1)', color: '#28a745' }}>
                      <SchoolIcon />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#28a745', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} /> +3.2% this month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Stat Card 3 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ 
                borderRadius: '16px', 
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                backdropFilter: 'blur(10px)',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Platform Revenue
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#0f172a', fontWeight: 800 }}>
                        $84.5k
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(255, 193, 7, 0.1)', color: '#ffc107' }}>
                      <MonetizationOnIcon />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#28a745', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} /> +18.4% this month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Stat Card 4 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ 
                borderRadius: '16px', 
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                backdropFilter: 'blur(10px)',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        KYC Validations
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#0f172a', fontWeight: 800 }}>
                        18,204
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(102, 16, 242, 0.1)', color: '#6610f2' }}>
                      <VerifiedUserIcon />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#dc3545', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    -1.2% from last week
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#0f172a' }}>
            Quick Actions
          </Typography>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: '20px', 
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s ease-in-out',
                "&:hover": {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)'
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: '12px', 
                      bgcolor: 'rgba(0, 86, 179, 0.1)', 
                      mr: 2,
                      display: 'flex'
                    }}>
                      <DashboardIcon sx={{ color: '#0056b3', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>Overview</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                    View platform statistics, recent activities, and system alerts. All accessed securely through the daily rotated token system.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: '20px', 
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s ease-in-out',
                "&:hover": {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)'
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: '12px', 
                      bgcolor: 'rgba(40, 167, 69, 0.1)', 
                      mr: 2,
                      display: 'flex'
                    }}>
                      <PeopleIcon sx={{ color: '#28a745', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>User Management</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                    Manage institutes, students, and their permissions. Monitor registrations and resolve account issues.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: '20px', 
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s ease-in-out',
                "&:hover": {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)'
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: '12px', 
                      bgcolor: 'rgba(255, 193, 7, 0.1)', 
                      mr: 2,
                      display: 'flex'
                    }}>
                      <SettingsIcon sx={{ color: '#ffc107', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>System Settings</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                    Configure platform features, translations, and global variables securely.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
