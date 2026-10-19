import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { useLoading } from '../../../contexts/LoadingContext';

export default function BiometricStep({ role, identifier, onFinish, isRegistering, API_URL }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!hasTriggered.current) {
      hasTriggered.current = true;
      handleBiometric();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBiometric = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (isRegistering) {
        // Registration Flow
        const beginRes = await fetch(`${API_URL}/auth/admin-webauthn/register/begin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, identifier })
        });
        const beginData = await beginRes.json();
        if (!beginRes.ok) throw new Error(beginData.error || 'Failed to begin registration');

        // Extract publicKey options. simplewebauthn expects the object inside 'publicKey'
        const optionsJSON = beginData.options.publicKey ? beginData.options.publicKey : beginData.options;
        const attResp = await startRegistration(optionsJSON);

        const finishRes = await fetch(`${API_URL}/auth/admin-webauthn/register/finish?session_id=${beginData.session_id}&role=${role}&identifier=${identifier}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attResp)
        });
        const finishData = await finishRes.json();
        if (!finishRes.ok) throw new Error(finishData.error || 'Failed to finish registration');

        onFinish(null); // No token returned on registration finish, we just continue
      } else {
        // Login Flow
        const beginRes = await fetch(`${API_URL}/auth/admin-webauthn/login/begin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, identifier })
        });
        const beginData = await beginRes.json();
        if (!beginRes.ok) throw new Error(beginData.error || 'Biometric not set up or failed');

        const optionsJSON = beginData.options.publicKey ? beginData.options.publicKey : beginData.options;
        const asseResp = await startAuthentication(optionsJSON);

        const finishRes = await fetch(`${API_URL}/auth/admin-webauthn/login/finish?session_id=${beginData.session_id}&role=${role}&identifier=${identifier}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(asseResp)
        });
        const finishData = await finishRes.json();
        if (!finishRes.ok) throw new Error(finishData.error || 'Failed to verify biometric');

        onFinish(finishData.access_token);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during biometric verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
      <FingerprintIcon sx={{ fontSize: 80, color: '#0056b3', mb: 3 }} />
      <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: "-0.5px", fontSize: "28px", mb: 1 }}>
        {isRegistering ? 'Setup Biometric Access' : 'Biometric Verification'}
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', mb: 4, fontSize: "15px", lineHeight: 1.5 }}>
        {isRegistering 
          ? 'Add an extra layer of security by enabling Touch ID, Face ID, or Windows Hello.' 
          : 'Please verify your identity using your device biometrics.'}
      </Typography>

      {error && <Alert severity="error" sx={{ width: '100%', mb: 3 }}>{error}</Alert>}

      <Button
        fullWidth
        variant="contained"
        onClick={handleBiometric}
        disabled={loading}
        sx={{
          height: '48px',
          borderRadius: '8px',
          textTransform: 'none',
          fontSize: '16px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            background: 'linear-gradient(135deg, #004494 0%, #218838 100%)',
          },
          '&.Mui-disabled': { background: '#e2e8f0', color: '#94a3b8' },
          mb: 2
        }}
      >
        {loading ? (isRegistering ? 'Register Device' : 'Verify Identity') : (isRegistering ? 'Register Device' : 'Verify Identity')}
      </Button>

      {isRegistering && (
        <Button
          fullWidth
          variant="text"
          onClick={() => onFinish(null)}
          sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600, fontSize: "14.5px", height: "44px" }}
        >
          Skip for now
        </Button>
      )}
    </Box>
  );
}
