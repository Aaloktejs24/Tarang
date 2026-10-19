"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Paper, Alert, InputAdornment, Container } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useParams, useRouter } from 'next/navigation';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLoading } from '../../../../contexts/LoadingContext';

const theme = createTheme({
  typography: {
    fontFamily: "'Rozha One', serif",
  },
});

export default function AdminRegister() {
  const params = useParams();
  const router = useRouter();
  const adminToken = params.adminToken;
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [sessionId, setSessionId] = useState('');
  const [flowState, setFlowState] = useState('email'); // email -> otp -> details
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  // 1. Verify Admin Token on load
  useEffect(() => {
    if (adminToken) {
      fetch(`${API_URL}/auth/admin-token/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: adminToken, role: 'admin' })
      })
      .then(res => res.json())
      .then(data => {
        if (!data.valid) {
          setError("Invalid or expired invite link.");
        }
      })
      .catch(() => setError("Failed to validate invite link."));
    }
  }, [adminToken, API_URL]);

  const handleStartRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/auth/registration-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to start registration');
      
      const sId = data.session_id;
      setSessionId(sId);
      
      // Send OTP
      const resOtp = await fetch(`${API_URL}/auth/registration-sessions/${sId}/send-email-otp`, { method: 'POST' });
      if (!resOtp.ok) throw new Error('Failed to send OTP');
      
      setFlowState('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/auth/registration-sessions/${sessionId}/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      setFlowState('details');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/auth/registration-sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          full_name: fullName,
          role: 'admin',
          admin_token: adminToken // Though backend might ignore it, we pass it just in case
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to complete registration');
      
      setSuccess(true);
      setTimeout(() => {
        router.push(`/${adminToken}/admin`);
      }, 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.45) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.3) 0, transparent 50%), 
            radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.2) 0, transparent 50%),
            radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.15) 0, transparent 50%),
            #eef2f6
          `,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            width: { xs: '100vw', sm: '500px' },
            minHeight: { xs: '100vh', sm: 'auto' },
            borderRadius: { xs: 0, sm: '28px' },
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(28px) saturate(200%)',
            boxShadow: { sm: '0 24px 64px rgba(0,0,0,0.12)' },
            px: { xs: 3, sm: 6 },
            py: { xs: 6, sm: 6 },
            border: 'none',
          }}
        >
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box component="img" src="/logo.svg" alt="Tarang Logo" sx={{ width: 48, height: 48, objectFit: 'contain' }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', fontSize: '26px' }}>
                Admin Setup
              </Typography>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Registration successful! Redirecting to login...
            </Alert>
          )}
          
          {error === "Invalid or expired invite link." ? null : (
            <>
              {flowState === 'email' && (
                <form onSubmit={handleStartRegistration}>
                  <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
                    Welcome! Enter your email to begin setting up your Admin account.
                  </Typography>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                      Email Address
                    </Typography>
                    <TextField
                      fullWidth
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      size="medium"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ fontSize: 20, color: '#94a3b8' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#f8fafc",
                          borderRadius: "8px",
                        }
                      }}
                    />
                  </Box>
                  <Button 
                    fullWidth
                    type="submit"
                    variant="contained" 
                    disableElevation
                    disabled={loading}
                    sx={{ 
                      height: "48px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
                    }}
                  >
                    {loading ? "Loading..." : 'Continue'}
                  </Button>
                </form>
              )}

              {flowState === 'otp' && (
                <form onSubmit={handleVerifyOtp}>
                  <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
                    We've sent a 6-digit OTP to {email}. Enter it below to verify your email.
                  </Typography>
                  <Box sx={{ mb: 4 }}>
                    <TextField
                      fullWidth
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="000000"
                      size="medium"
                      required
                      sx={{
                        "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "18px", letterSpacing: 8, textAlign: 'center' },
                      }}
                    />
                  </Box>
                  <Button 
                    fullWidth
                    type="submit"
                    variant="contained" 
                    disableElevation
                    disabled={loading}
                    sx={{ 
                      height: "48px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
                    }}
                  >
                    {loading ? "Loading..." : 'Verify Email'}
                  </Button>
                </form>
              )}

              {flowState === 'details' && !success && (
                <form onSubmit={handleCompleteRegistration}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                      Full Name
                    </Typography>
                    <TextField
                      fullWidth
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      size="medium"
                      required
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "#f8fafc", borderRadius: "8px" } }}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                      Username
                    </Typography>
                    <TextField
                      fullWidth
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="johndoe"
                      size="medium"
                      required
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><AccountCircleIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "#f8fafc", borderRadius: "8px" } }}
                    />
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                      Password
                    </Typography>
                    <TextField
                      fullWidth
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      size="medium"
                      required
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "#f8fafc", borderRadius: "8px" } }}
                    />
                  </Box>
                  
                  <Button 
                    fullWidth
                    type="submit"
                    variant="contained" 
                    disableElevation
                    disabled={loading}
                    sx={{ 
                      height: "48px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
                    }}
                  >
                    {loading ? "Loading..." : 'Complete Registration'}
                  </Button>
                </form>
              )}
            </>
          )}

        </Paper>
      </Box>
    </ThemeProvider>
  );
}
