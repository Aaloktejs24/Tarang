"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, TextField, Button, Paper, Alert, InputAdornment, IconButton, Stepper, Step, StepLabel, CircularProgress } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { QRCodeSVG } from 'qrcode.react';
import BiometricStep from '../../../features/auth/components/BiometricStep';
import OtpInput from '../../../features/auth/components/OtpInput';
import { useParams } from 'next/navigation';

import { useAppRouter as useRouter } from '../../../hooks/useAppRouter';

const theme = createTheme({
  typography: {
    } });

import AdminLoading from './loading';

export default function AdminLanding() {
  const params = useParams();
  const router = useRouter();
  const token = params.adminToken;
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  


  // States: 'login' | 'setup_totp' | 'setup_bio' | 'verify_otp' | 'verify_bio'
  const [flowState, setFlowState] = useState('login'); 
  const [tempToken, setTempToken] = useState(null); 
  
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
        router.push(`/${token}/admin/dashboard`);
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
      
      setTempToken(data.access_token);
      setFlowState('verify_bio');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricFinish = async (finalToken) => {
    if (flowState === 'setup_bio') {
      handleLogin({ preventDefault: () => {} });
    } else {
      router.push(`/${token}/admin/dashboard`);
    }
  };



  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: 'var(--size-screen-h)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.45) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.3) 0, transparent 50%), 
            radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.2) 0, transparent 50%),
            radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.15) 0, transparent 50%),
            #eef2f6
          ` }}
      >
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            width: { xs: 'var(--size-screen-w)', sm: '500px' },
            minHeight: { xs: 'var(--size-screen-h)', sm: 'auto' },
            px: { xs: 3, sm: 6 },
            py: { xs: 6, sm: 6 },
            border: 'none' }}
        >
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box component="img" src="/logo.svg" alt="Tarang Logo" sx={{ width: 48, height: 48, objectFit: 'contain' }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', letterSpacing: '-1px', fontSize: '26px' }}>
                Tarang
              </Typography>
            </Box>
          </Box>


          
          
          {flowState === 'login' && (
            <form onSubmit={handleLogin}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-700)", fontSize: 'var(--font-sm)' }}>
                  Email or Username
                </Typography>
                <TextField
                  fullWidth
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter email or username"
                  size="medium"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ mr: 1, color: "var(--color-slate-500)", display: "flex", alignItems: "center" }}>
                          <EmailIcon sx={{ fontSize: 20 }} />
                        </Box>
                      </InputAdornment>
                    ) }}
                  sx={{
                    "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: 'var(--font-base)' } }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-700)", fontSize: 'var(--font-sm)' }}>
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
                        <Box sx={{ mr: 1, color: "var(--color-slate-500)", display: "flex", alignItems: "center" }}>
                          <LockIcon sx={{ fontSize: 20 }} />
                        </Box>
                      </InputAdornment>
                    ) }}
                  sx={{
                    "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: 'var(--font-base)' } }}
                />
              </Box>

              <Box sx={{ mt: 0 }}>
                {/* Message Area with Fixed Height */}
                {error && (
                    <Box sx={{ height: "24px", display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
                        <Typography variant="body2" sx={{ color: "#ef4444 !important", fontSize: 'var(--font-sm)', fontWeight: 'var(--font-semibold)' }}>
                            {error}
                        </Typography>
                    </Box>
                )}
                {!error && <Box sx={{ height: "24px", mb: 1 }} />}

                <Button 
                fullWidth
                type="submit"
                variant="contained" 
                disableElevation
                disabled={loading}
                sx={{ 
                  height: 'var(--box-height)',
                  borderRadius: 'var(--radius-md)',
                  textTransform: "none",
                  fontSize: 'var(--font-base)',
                  fontWeight: 'var(--font-bold)',
                  background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    background: "linear-gradient(135deg, #004494 0%, #218838 100%)" },
                  "&.Mui-disabled": { background: "var(--color-slate-200)", color: "var(--color-slate-500)" }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
              </Button>
              </Box>
            </form>
          )}

          {flowState === 'setup_totp' && (
            <form onSubmit={handleVerifyOtpSetup}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', letterSpacing: '-0.5px', fontSize: 'var(--font-2xl)', mb: 2 }}>
                Step 1: Setup Authenticator
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', mb: 3, fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
                Please scan the QR code using an Authenticator app (like Microsoft Authenticator), or enter the key manually.
              </Typography>
              
              <Box sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "center", sm: "stretch" },
                  gap: 2,
                  width: "var(--size-full)",
                  mb: 4
              }}>
                  {totpUrl ? (
                      <Box sx={{
                          p: 1.5,
                          bgcolor: "white",
                          borderRadius: 'var(--radius-md)',
                          border: "var(--border-thin) solid #e2e8f0",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                      }}>
                          <QRCodeSVG value={totpUrl} size={130} />
                      </Box>
                  ) : <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', width: "var(--size-full)" }}></Box>}

                  {totpSecret && (
                      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0, width: "var(--size-full)", py: 0.5 }}>
                          <Typography variant="caption" sx={{
                              color: "var(--color-slate-500)",
                              fontWeight: 'var(--font-bold)',
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              fontSize: "10px",
                              display: "block"
                          }}>
                              Manual Entry Key
                          </Typography>
                          <Box sx={{
                              bgcolor: "var(--color-slate-50)",
                              px: 1.5,
                              py: 1.5,
                              borderRadius: 'var(--radius-md)',
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
                                  color: "var(--color-success)",
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: 'var(--font-sm)',
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
                                      color: copied ? "var(--color-success)" : "var(--color-slate-500)",
                                      transition: "color 0.2s"
                                  }}
                              >
                                  {copied ? <CheckIcon sx={{ fontSize: 20 }} /> : <ContentCopyIcon sx={{ fontSize: 20 }} />}
                              </IconButton>
                          </Box>
                          <Typography variant="caption" sx={{ color: "var(--color-slate-500)", mt: 0.75, fontSize: 'var(--font-xs)', lineHeight: 1.4 }}>
                              Use this if you cannot scan the QR code.
                          </Typography>
                      </Box>
                  )}
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-700)", fontSize: 'var(--font-sm)' }}>
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
                  height: 'var(--box-height)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 'var(--font-bold)',
                  background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
                  color: "var(--color-white)",
                  textTransform: "none",
                  fontSize: 'var(--font-base)',
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    background: "linear-gradient(135deg, #004494 0%, #218838 100%)" },
                  "&.Mui-disabled": { background: "var(--color-slate-200)", color: "var(--color-slate-500)", WebkitTextFillColor: "var(--color-slate-500)" }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Continue'}
              </Button>
            </form>
          )}

          {flowState === 'setup_bio' && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', letterSpacing: '-0.5px', fontSize: 'var(--font-2xl)', mb: 2, textAlign: 'center' }}>
                Step 2: Setup Biometric
              </Typography>
              <BiometricStep 
                role="admin" 
                identifier={identifier} 
                onFinish={handleBiometricFinish} 
                isRegistering={true}
                API_URL={API_URL}
              />
            </Box>
          )}

          {flowState === 'verify_otp' && (
            <form onSubmit={handleVerifyOtpLogin}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', letterSpacing: '-0.5px', fontSize: 'var(--font-2xl)', mb: 2 }}>
                2-Step Verification
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', mb: 4, fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
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
                  height: 'var(--box-height)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 'var(--font-bold)',
                  background: "linear-gradient(135deg, #0056b3 0%, #28a745 100%)",
                  color: "var(--color-white)",
                  textTransform: "none",
                  fontSize: 'var(--font-base)',
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    background: "linear-gradient(135deg, #004494 0%, #218838 100%)" },
                  "&.Mui-disabled": { background: "var(--color-slate-200)", color: "var(--color-slate-500)", WebkitTextFillColor: "var(--color-slate-500)" }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
              </Button>
            </form>
          )}

          {flowState === 'verify_bio' && (
            <Box>
              <BiometricStep 
                role="admin" 
                identifier={identifier} 
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
