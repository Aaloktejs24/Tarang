"use client";
import React from 'react';
import { Box, Typography, Button, Container, Paper, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, IconButton } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../../../../../lib/apiClient';
import { useProfile } from '../../../../../../../hooks/useProfile';
import { useAccessibility } from '../../../../../../../contexts/AccessibilityContext';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import { useBreadcrumbs } from '../../../../../../../contexts/BreadcrumbContext';
import { formatBreadcrumbName } from '../../../../../../../utils/stringUtils';

export default function ApplicationsManagementPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params.programId;
  const { profile } = useProfile();
  const { language } = useAccessibility();

  const [applications, setApplications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const cardsRef = React.useRef(null);

  const rawInstituteName = profile ? (profile.full_name || profile.institution_name || profile.username) : 'Institute';
  const breadcrumbInstituteName = formatBreadcrumbName(rawInstituteName);

  useBreadcrumbs([
    { labelEn: 'Home', labelHi: 'गृह', onClick: () => router.push('/dashboard/home') },
    { label: breadcrumbInstituteName, onClick: () => router.push('/dashboard/home/institute') },
    { labelEn: 'Admissions', labelHi: 'प्रवेश', onClick: () => router.push('/dashboard/home/institute/admissions') },
    { labelEn: 'Applicants', labelHi: 'आवेदक' }
  ]);

  React.useEffect(() => {
    if (!profile?.username || !programId) return;

    const fetchApplications = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/admissions/institutes/${profile.username}/applications`);
        
        let allApps = res.data?.applications || [];
        const programApps = allApps.filter(app => app.program_id === programId);
        
        setApplications(programApps);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError('Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [profile, programId]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "calc(100vh - 72px)", bgcolor: "transparent", mt: "-1px" }}>
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, pt: { xs: 10, md: 12 }, pb: 10, px: { xs: 2, md: 4 } }}>
        <Paper elevation={0} sx={{ 
          borderRadius: "24px", 
          background: 'rgba(255, 255, 255, 0.4)', 
          backdropFilter: 'blur(30px)', 
          border: '1px solid rgba(30, 79, 163, 0.2)', 
          boxShadow: 'none', 
          overflow: 'hidden' 
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 10 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', p: 10, color: 'error.main' }}>{error}</Box>
          ) : applications.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 10 }}>
              <Typography sx={{ color: '#64748b' }}>
                {language === 'en' ? 'No applications found for this program yet.' : 'अभी तक इस कार्यक्रम के लिए कोई आवेदन नहीं मिला है।'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.5)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Applicant ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Current Stage</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Applied On</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#334155' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#0056b3', fontSize: '0.9rem' }}>
                            {app.user_id.substring(0, 2).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                            {app.user_id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#475569' }}>
                          Stage {app.current_stage_index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={app.status} 
                          size="small" 
                          color={getStatusColor(app.status)}
                          sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#475569' }}>
                          {new Date(app.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityOutlinedIcon />}
                          sx={{ borderRadius: '8px', textTransform: 'none' }}
                          onClick={() => {
                            router.push(`/dashboard/home/institute/admissions/${programId}/applications/${app.id}`);
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
