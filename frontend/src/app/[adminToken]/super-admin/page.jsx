"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, TextField, Button, Paper, Alert, InputAdornment, IconButton, Stepper, Step, StepLabel } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import QrCodeIcon from '@mui/icons-material/QrCode';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { QRCodeSVG } from 'qrcode.react';
import BiometricStep from '../../../features/auth/components/BiometricStep';
import OtpInput from '../../../features/auth/components/OtpInput';
import { useLoading } from '../../../contexts/LoadingContext';

const theme = createTheme({
  typography: {
    fontFamily: "'Rozha One', serif",
  },
});

export default function SuperAdminPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [token, setToken] = useState(null); // Final Access JWT
  const [tempToken, setTempToken] = useState(null); // Temp JWT for MFA/Setup
  
  const [adminUrlToken, setAdminUrlToken] = useState(''); 
  const [emailTarget, setEmailTarget] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // States: 'login' | 'setup_totp' | 'setup_bio' | 'verify_otp' | 'verify_bio'
  const [flowState, setFlowState] = useState('login'); 
  
  // Setup data
  const [totpSecret, setTotpSecret] = useState('');
  const [totpUrl, setTotpUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }
      
      if (data.requires_setup) {
        setTempToken(data.temp_token);
        await startTotpSetup(data.temp_token);
        setFlowState('setup_totp');
      } else if (data.requires_totp || data.requires_otp) {
        setTempToken(data.temp_token);
        setFlowState('verify_otp');
      } else {
        setToken(data.access_token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startTotpSetup = async (tToken) => {
    try {
      const res = await fetch(`${API_URL}/auth/totp/setup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tToken}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTotpSecret(data.secret);
        setTotpUrl(data.url);
      } else {
        setError("Failed to initialize TOTP setup");
      }
    } catch (e) {
      setError("Failed to initialize TOTP setup");
    }
  };

  const handleVerifyOtpSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/totp/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ code: otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP code');
      
      // Setup successful, move to Biometric setup
      setFlowState('setup_bio');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/login/totp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ code: otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP code');
      
      setTempToken(data.access_token); // Now we have an access token, but still need bio
      setFlowState('verify_bio');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricFinish = async (finalToken) => {
    // If they were setting up, we need to login again to get the final access token
    if (flowState === 'setup_bio') {
      // Setup is complete. Log them in fully.
      handleLogin({ preventDefault: () => {} });
    } else {
      // Standard verification successful
      setToken(tempToken);
    }
  };

  useEffect(() => {
    if (token) {
      // Fetch the current 7-digit admin token
      fetch(`${API_URL}/auth/super-admin/token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          setAdminUrlToken(data.token);
        }
      });
    }
  }, [token]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_URL}/auth/super-admin/invite`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: emailTarget, role: 'admin' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to send invite');
      setSuccessMsg(`Invite sent successfully!`);
      setEmailTarget('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
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
                  Tarang
                </Typography>
              </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            
            {flowState === 'login' && (
              <form onSubmit={handleLogin}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                    User ID
                  </Typography>
                  <TextField
                    fullWidth
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter User ID"
                    size="medium"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box sx={{ mr: 1, color: "#94a3b8", display: "flex", alignItems: "center" }}>
                            <EmailIcon sx={{ fontSize: 20 }} />
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#f8fafc",
                        borderRadius: "8px",
                        transition: "all 0.2s ease-in-out",
                        "& fieldset": { borderColor: "#e2e8f0" },
                        "&:hover fieldset": { borderColor: "#cbd5e1" },
                        "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
                      },
                      "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "15px" },
                    }}
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
                    placeholder="Enter password"
                    size="medium"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box sx={{ mr: 1, color: "#94a3b8", display: "flex", alignItems: "center" }}>
                            <LockIcon sx={{ fontSize: 20 }} />
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#f8fafc",
                        borderRadius: "8px",
                        transition: "all 0.2s ease-in-out",
                        "& fieldset": { borderColor: "#e2e8f0" },
                        "&:hover fieldset": { borderColor: "#cbd5e1" },
                        "&.Mui-focused fieldset": { borderColor: "#0056b3", borderWidth: "1.5px" },
                      },
                      "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "15px" },
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
                    textTransform: "none",
                    fontSize: "16px",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      background: "linear-gradient(135deg, #004494 0%, #218838 100%)",
                    },
                    "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8" }
                  }}
                >
                  {loading ? "Loading..." : 'Log In'}
                </Button>
              </form>
            )}

            {flowState === 'setup_totp' && (
            <form onSubmit={handleVerifyOtpSetup}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 2 }}>
                Step 1: Setup Authenticator
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                Please scan the QR code using an Authenticator app (like Microsoft Authenticator), or enter the key manually.
              </Typography>
              
              <Box sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "center", sm: "stretch" },
                  gap: 2,
                  width: "100%",
                  mb: 4
              }}>
                  {totpUrl ? (
                      <Box sx={{
                          p: 1.5,
                          bgcolor: "white",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                      }}>
                          <QRCodeSVG value={totpUrl} size={130} />
                      </Box>
                  ) : <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', width: "100%" }}></Box>}

                  {totpSecret && (
                      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0, width: "100%", py: 0.5 }}>
                          <Typography variant="caption" sx={{
                              color: "#94a3b8",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              fontSize: "10px",
                              display: "block"
                          }}>
                              Manual Entry Key
                          </Typography>
                          <Box sx={{
                              bgcolor: "#f8fafc",
                              px: 1.5,
                              py: 1.5,
                              borderRadius: "8px",
                              border: "1px dashed #cbd5e1",
                              position: "relative",
                              pr: 5,
                              my: 0.5,
                              display: "flex",
                              alignItems: "center",
                              flexGrow: 1
                          }}>
                              <Typography sx={{
                                  fontWeight: 800,
                                  letterSpacing: "1px",
                                  color: "#28a745",
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: "14px",
                                  wordBreak: "break-all",
                                  lineHeight: 1.5
                              }}>
                                  {totpSecret.match(/.{1,4}/g)?.join(' ') || totpSecret}
                              </Typography>
                              <IconButton
                                  onClick={() => {
                                      navigator.clipboard.writeText(totpSecret);
                                      setCopied(true);
                                      setTimeout(() => setCopied(false), 2000);
                                  }}
                                  size="small"
                                  title="Copy Secret Key"
                                  sx={{
                                      position: "absolute",
                                      right: 4,
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      color: copied ? "#28a745" : "#94a3b8",
                                      transition: "color 0.2s"
                                  }}
                              >
                                  {copied ? <CheckIcon sx={{ fontSize: 20 }} /> : <ContentCopyIcon sx={{ fontSize: 20 }} />}
                              </IconButton>
                          </Box>
                          <Typography variant="caption" sx={{ color: "#94a3b8", mt: 0.75, fontSize: "11px", lineHeight: 1.4 }}>
                              Use this if you cannot scan the QR code.
                          </Typography>
                      </Box>
                  )}
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
                  Enter the 6-digit code to confirm
                </Typography>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={6}
                  isLoading={loading}
                />
              </Box>
              <Button 
                fullWidth
                type="submit"
                variant="contained" 
                disableElevation
                disabled={loading || otp.length !== 6}
                sx={{ 
                  height: "48px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
                  color: "#ffffff",
                  textTransform: "none",
                  fontSize: "16px",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    background: "linear-gradient(135deg, #004494 0%, #218838 100%)",
                  },
                  "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8", WebkitTextFillColor: "#94a3b8" }
                }}
              >
                {loading ? "Loading..." : 'Verify & Continue'}
              </Button>
            </form>
            )}

            {flowState === 'setup_bio' && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 2, textAlign: 'center' }}>
                  Step 2: Setup Biometric
                </Typography>
                <BiometricStep 
                  role="super_admin" 
                  identifier={identifier || 'super_admin'} 
                  onFinish={handleBiometricFinish} 
                  isRegistering={true}
                  API_URL={API_URL}
                />
              </Box>
            )}

            {flowState === 'verify_otp' && (
              <form onSubmit={handleVerifyOtpLogin}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 2 }}>
                  2-Step Verification
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 4 }}>
                  Please enter the 6-digit verification code from your authenticator app.
                </Typography>
                <Box sx={{ mb: 4 }}>
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    isLoading={loading}
                  />
                </Box>
                <Button 
                  fullWidth
                  type="submit"
                  variant="contained" 
                  disableElevation
                  disabled={loading || otp.length !== 6}
                  sx={{ 
                    height: "48px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
                    color: "#ffffff",
                    textTransform: "none",
                    fontSize: "16px",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      background: "linear-gradient(135deg, #004494 0%, #218838 100%)",
                    },
                    "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8", WebkitTextFillColor: "#94a3b8" }
                  }}
                >
                  {loading ? "Loading..." : 'Verify Code'}
                </Button>
              </form>
            )}

            {flowState === 'verify_bio' && (
              <Box>
                <BiometricStep 
                  role="super_admin" 
                  identifier={identifier || 'super_admin'} 
                  onFinish={handleBiometricFinish} 
                  isRegistering={false}
                  API_URL={API_URL}
                />
              </Box>
            )}

          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

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
              Tarang Super Admin
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            disableElevation
            onClick={() => {
              setToken(null);
              setFlowState('login');
            }}
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

        <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: '#0f172a', fontFamily: "'Rozha One', serif" }}>
            Dashboard
          </Typography>
          
          <Paper elevation={0} sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: '20px', 
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)'
          }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#0056b3' }}>Active Admin URL</Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
              This is the unique URL for admins to access their portal today. It changes daily.
            </Typography>
            
            {adminUrlToken ? (
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f1f5f9', 
                borderRadius: '12px', 
                border: '1px solid #cbd5e1', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: 2 
              }}>
                <Typography variant="body1" sx={{ color: '#0f172a', fontFamily: 'monospace', fontWeight: 600, overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                  http://localhost:3000/{adminUrlToken}/admin
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    navigator.clipboard.writeText(`http://localhost:3000/${adminUrlToken}/admin`);
                  }}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: '110px',
                    background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)',
                    "&:hover": {
                      background: 'linear-gradient(135deg, #004494 0%, #218838 100%)',
                    }
                  }}
                >
                  Copy URL
                </Button>
              </Box>
            ) : ( null )}
          </Paper>

          <Paper elevation={0} sx={{ 
            p: 4, 
            borderRadius: '20px', 
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)'
          }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#28a745' }}>Invite Admin</Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
              Send an email to an admin with the secure link.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField 
                fullWidth 
                placeholder="admin@example.com" 
                value={emailTarget}
                onChange={(e) => setEmailTarget(e.target.value)}
                size="medium"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    bgcolor: "#ffffff"
                  }
                }}
              />
              <Button 
                variant="contained" 
                onClick={handleSendEmail}
                disabled={loading || !emailTarget}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: '120px',
                  background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)',
                  "&:hover": {
                    background: 'linear-gradient(135deg, #004494 0%, #218838 100%)',
                  },
                  "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8" }
                }}
              >
                {loading ? "Loading..." : 'Send Invite'}
              </Button>
            </Box>
            
            {successMsg && <Alert severity="success" sx={{ mt: 3, borderRadius: '8px' }}>{successMsg}</Alert>}
            {error && <Alert severity="error" sx={{ mt: 3, borderRadius: '8px' }}>{error}</Alert>}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
