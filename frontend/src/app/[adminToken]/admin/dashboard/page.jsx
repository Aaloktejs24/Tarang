"use client";
import React from 'react';
import Navbar from '../../../../components/navbar/Navbar';
import { Box, Typography, Card, CardContent, Grid, Container, Button, ThemeProvider, createTheme } from '@mui/material';
import { useParams } from 'next/navigation';

import { useAppRouter as useRouter } from '../../../../hooks/useAppRouter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StatCard from '../../../../components/admin/StatCard';

const theme = createTheme({
  typography: {
    } });

export default function AdminDashboard() {
  const params = useParams();
  const router = useRouter();
  const token = params.adminToken;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: 'var(--size-screen-h)', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        {/* Navbar */}
        <Navbar variant="admin" title="Tarang Admin" onLogout={() => router.push(`/${token}/admin`)} />

        <Container maxWidth="xl" sx={{ mt: 8, mb: 8, flexGrow: 1 }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: 'var(--color-slate-900)' }}>
            Admin Dashboard
          </Typography>

          {/* Key Statistics Section */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard 
                title="Total Users" 
                value="24,592" 
                icon={<PeopleIcon />} 
                iconBgColor="rgba(0, 86, 179, 0.1)" 
                iconColor="var(--color-primary)" 
                trendValue="+12.5%" 
                trendText="this month" 
                trendPositive={true} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard 
                title="Active Institutes" 
                value="1,248" 
                icon={<SchoolIcon />} 
                iconBgColor="rgba(40, 167, 69, 0.1)" 
                iconColor="var(--color-success)" 
                trendValue="+3.2%" 
                trendText="this month" 
                trendPositive={true} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard 
                title="Platform Revenue" 
                value="$84.5k" 
                icon={<MonetizationOnIcon />} 
                iconBgColor="rgba(255, 193, 7, 0.1)" 
                iconColor="var(--color-warning)" 
                trendValue="+18.4%" 
                trendText="this month" 
                trendPositive={true} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard 
                title="KYC Validations" 
                value="18,204" 
                icon={<VerifiedUserIcon />} 
                iconBgColor="rgba(102, 16, 242, 0.1)" 
                iconColor="#6610f2" 
                trendValue="-1.2%" 
                trendText="from last week" 
                trendPositive={false} 
              />
            </Grid>

            {/* Stat Card 2 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ 
                borderRadius: 'var(--radius-lg)', 
                border: 'var(--border-thin) solid rgba(255, 255, 255, 0.6)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                backdropFilter: 'blur(10px)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', fontWeight: 'var(--font-semibold)', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Active Institutes
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'var(--color-slate-900)', fontWeight: 800 }}>
                        1,248
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, borderRadius: 'var(--radius-lg)', bgcolor: 'rgba(40, 167, 69, 0.1)', color: 'var(--color-success)' }}>
                      <SchoolIcon />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'var(--color-success)', fontWeight: 'var(--font-semibold)', display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} /> +3.2% this month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Stat Card 3 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ 
                borderRadius: 'var(--radius-lg)', 
                border: 'var(--border-thin) solid rgba(255, 255, 255, 0.6)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                backdropFilter: 'blur(10px)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', fontWeight: 'var(--font-semibold)', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Platform Revenue
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'var(--color-slate-900)', fontWeight: 800 }}>
                        $84.5k
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, borderRadius: 'var(--radius-lg)', bgcolor: 'rgba(255, 193, 7, 0.1)', color: 'var(--color-warning)' }}>
                      <MonetizationOnIcon />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'var(--color-success)', fontWeight: 'var(--font-semibold)', display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} /> +18.4% this month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Stat Card 4 */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ 
                borderRadius: 'var(--radius-lg)', 
                border: 'var(--border-thin) solid rgba(255, 255, 255, 0.6)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                backdropFilter: 'blur(10px)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', fontWeight: 'var(--font-semibold)', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        KYC Validations
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'var(--color-slate-900)', fontWeight: 800 }}>
                        18,204
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1, borderRadius: 'var(--radius-lg)', bgcolor: 'rgba(102, 16, 242, 0.1)', color: '#6610f2' }}>
                      <VerifiedUserIcon />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'var(--color-error-hover)', fontWeight: 'var(--font-semibold)', display: 'flex', alignItems: 'center' }}>
                    -1.2% from last week
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)' }}>
            Quick Actions
          </Typography>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                height: 'var(--size-full)', 
                transition: 'transform 0.2s ease-in-out',
                "&:hover": {
                  transform: 'translateY(-4px)',
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 'var(--radius-lg)', 
                      bgcolor: 'rgba(0, 86, 179, 0.1)', 
                      mr: 2,
                      display: 'flex'
                    }}>
                      <DashboardIcon sx={{ color: 'var(--color-primary)', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)' }}>Overview</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: 'var(--color-slate-500)', lineHeight: 1.6 }}>
                    View platform statistics, recent activities, and system alerts. All accessed securely through the daily rotated token system.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                height: 'var(--size-full)', 
                transition: 'transform 0.2s ease-in-out',
                "&:hover": {
                  transform: 'translateY(-4px)',
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 'var(--radius-lg)', 
                      bgcolor: 'rgba(40, 167, 69, 0.1)', 
                      mr: 2,
                      display: 'flex'
                    }}>
                      <PeopleIcon sx={{ color: 'var(--color-success)', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)' }}>User Management</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: 'var(--color-slate-500)', lineHeight: 1.6 }}>
                    Manage institutes, students, and their permissions. Monitor registrations and resolve account issues.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ 
                height: 'var(--size-full)', 
                transition: 'transform 0.2s ease-in-out',
                "&:hover": {
                  transform: 'translateY(-4px)',
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 'var(--radius-lg)', 
                      bgcolor: 'rgba(255, 193, 7, 0.1)', 
                      mr: 2,
                      display: 'flex'
                    }}>
                      <SettingsIcon sx={{ color: 'var(--color-warning)', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)' }}>System Settings</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: 'var(--color-slate-500)', lineHeight: 1.6 }}>
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
