import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import TarangButton from '../../../components/common/TarangButton';
import { FormLoadingProvider } from '../../../contexts/FormLoadingContext';

export default function BiometricStep({ role, identifier, isRegistering, onFinish, API_URL }) {
  const isSubmitting = React.useRef(false);
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
    if (isSubmitting.current) return;
    isSubmitting.current = true;
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
      setError(err.message || 'Biometric authentication failed');
    } finally {
      isSubmitting.current = false;
      setLoading(false);
    }
  };

  return (
    <FormLoadingProvider isLoading={loading}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
        <FingerprintIcon sx={{ fontSize: 80, color: 'var(--color-primary)', mb: 3 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', letterSpacing: "-0.5px", fontSize: 'var(--font-2xl)', mb: 1 }}>
          {isRegistering ? 'Setup Biometric Access' : 'Biometric Verification'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-slate-500)', textAlign: 'center', mb: 4, fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
          {isRegistering 
            ? 'Add an extra layer of security by enabling Touch ID, Face ID, or Windows Hello.' 
            : 'Please verify your identity using your device biometrics.'}
        </Typography>

        {error && <Alert severity="error" sx={{ width: 'var(--size-full)', mb: 3 }}>{error}</Alert>}

        <TarangButton
          fullWidth
          loading={loading}
          disabled={loading}
          onClick={handleBiometric}
          sx={{ height: 'var(--box-height)', mb: 2 }}
        >
          {isRegistering ? 'Register Device' : 'Verify Identity'}
        </TarangButton>

        {isRegistering && (
          <TarangButton
            fullWidth
            variant="text"
            onClick={() => onFinish(null)}
            sx={{ color: 'var(--color-slate-500)', height: 'var(--box-height)' }}
          >
            Skip for now
          </TarangButton>
        )}
      </Box>
    </FormLoadingProvider>
  );
}
