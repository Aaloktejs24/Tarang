import { Box, Typography } from "@mui/material";
import OtpInput from "./OtpInput";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { validateOtp } from "../../../utils/validationUtils";
import TarangButton from "../../../components/common/TarangButton";
import { getMaskedEmail } from "../../../utils/maskUtils";
import { FormLoadingProvider } from '../../../contexts/FormLoadingContext';

export default function RegisterOtpStep({ setStep, formData, updateFormData, error, setError, isLoading, onResendOtp, onVerifyOtp, resendTimer, success, setSuccess, maskedEmail }) {
  const totpData = formData?.totpData;
  const [totpError, setTotpError] = useState("");
  const [copied, setCopied] = useState(false);

  const errorLower = (error || "").toLowerCase();
  const isTotpError = !!error && (errorLower.includes("वेरिफिकेशन") || errorLower.includes("प्रमाणक") || errorLower.includes("कूट") || errorLower.includes("2fa") || errorLower.includes("totp"));
  const isOtpError = !!error && !isTotpError && (errorLower.includes("otp") || errorLower.includes("ईमेल") || errorLower.includes("फ़ोन") || errorLower.includes("ओटीपी"));

  useEffect(() => {
    if (!formData?.email) setStep(1);
  }, [formData, setStep]);


  const handleResend = async () => {
    if (onResendOtp) {
      onResendOtp();
    }
  };

  return (
    <FormLoadingProvider isLoading={isLoading}>
    <Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", gap: 1.5 }}>

      <Box>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 'var(--font-extrabold)', color: "var(--color-slate-900)", letterSpacing: "-0.5px", fontSize: 'var(--font-2xl)' }}>
          ईमेल वेरीफाई करें
        </Typography>

        <Typography variant="body2" sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
          हमने <span style={{ color: "var(--color-primary)", fontWeight: 'var(--font-bold)' }}>{getMaskedEmail(maskedEmail || formData?.email)}</span> पर एक वेरिफिकेशन कोड भेजा है
        </Typography>
      </Box>

            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-900)", fontSize: 'var(--font-sm)' }}>
            ईमेल वेरिफिकेशन कोड
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <OtpInput
              value={formData.otp}
              onChange={(val) => {
                updateFormData({ otp: val });
                if (error) setError("");
              }}
              isLoading={isLoading}
              error={isOtpError}
            />
            <TarangButton
              variant="text"
              size="sm"
              disabled={isLoading || resendTimer > 0}
              onClick={handleResend}
              sx={{ color: 'var(--color-primary)', p: 0, minWidth: 'auto', minHeight: 'auto', '&.Mui-disabled': { color: 'var(--color-primary)', opacity: 0.8 }, '&:hover': { background: 'transparent', textDecoration: 'underline' }, whiteSpace: 'nowrap' }}
            >
              {resendTimer > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 'var(--font-sm)' }} />
                  <Box component="div" sx={{ fontSize: '13px', fontWeight: 'var(--font-semibold)' }}>
                    {resendTimer.toString().padStart(2, '0')}s फिर से भेजें
                  </Box>
                </Box>
              ) : "फिर से भेजें"}
            </TarangButton>
          </Box>
        </Box>

        {formData.verifyPhone && formData.phone && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-900)", fontSize: 'var(--font-sm)' }}>
              फ़ोन वेरिफिकेशन कोड
            </Typography>
            <OtpInput
              value={formData.phoneOtp || ""}
              onChange={(val) => {
                updateFormData({ phoneOtp: val });
                if (error) setError("");
              }}
              isLoading={isLoading}
              error={isOtpError}
            />
          </Box>
        )}
      </Box>

      {formData.twoFactorEnabled && (
        <Box>
          <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-900)", fontSize: 'var(--font-sm)' }}>
            ऑथेंटिकेटर ऐप सेटअप करें
          </Typography>

          {totpError ? (
            <Typography variant="body2" color="error">{totpError}</Typography>
          ) : totpData?.url ? (
            <Box sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: 1.5,
              width: "var(--size-full)",
              bgcolor: "var(--glass-bg)",
              p: 2,
              borderRadius: 'var(--radius-md)',
              border: "1px solid rgba(30, 79, 163, 0.2)",
              }}>
              <Box sx={{
                p: 1.5,
                bgcolor: "var(--card-bg)", backdropFilter: "var(--card-blur)",
                borderRadius: 'var(--radius-md)',
                border: "var(--border-thin) solid rgba(30, 79, 163, 0.2)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <QRCodeSVG value={totpData.url} size={130} />
              </Box>
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0, gap: 1.5 }}>
                <Box>
                  <div style={{ color: "var(--color-slate-500)", marginBottom: "6px", fontWeight: "var(--font-medium)", fontSize: "var(--font-xs)" }}>
                    कुंजी
                  </div>
                  <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "var(--glass-bg)",
                    pl: 2,
                    pr: 1,
                    py: 0.75,
                    borderRadius: 'var(--radius-md)',
                    border: "1px solid rgba(30, 79, 163, 0.2)",
                    }}>
                    <div style={{
                      fontWeight: 'var(--font-semibold)',
                      color: "var(--color-slate-900)",
                      fontSize: 'var(--font-xs)',
                      wordBreak: "break-all",
                      marginRight: "8px"
                    }}>
                      {totpData.secret}
                    </div>
                    <IconButton
                      onClick={() => {
                        navigator.clipboard.writeText(totpData.secret);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      size="small"
                      title="सीक्रेट की कॉपी करें"
                      sx={{
                        color: copied ? "var(--color-success)" : "var(--color-slate-500)",
                        bgcolor: "transparent",
                        '&:hover': { bgcolor: "rgba(0,0,0,0.04)" }
                      }}
                    >
                      {copied ? <CheckIcon sx={{ fontSize: 'var(--font-base)' }} /> : <ContentCopyIcon sx={{ fontSize: 'var(--font-base)' }} />}
                    </IconButton>
                  </Box>
                </Box>

                <Box>
                  <div style={{ color: "var(--color-slate-500)", marginBottom: "6px", fontWeight: "var(--font-medium)", fontSize: "var(--font-xs)" }}>
                    प्रमाणक कूट
                  </div>
                  <OtpInput
                    value={formData.totpCode || ""}
                    onChange={(val) => {
                      updateFormData({ totpCode: val });
                      if (error) setError("");
                    }}
                    isLoading={isLoading}
                    error={isTotpError}
                  />
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "var(--color-slate-500)" }}>Loading 2FA QR code...</Typography>
          )}
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1.5 }}>
        <TarangButton
          variant="outlined"
          disabled={isLoading}
          onClick={() => { updateFormData({ otp: "", password: "", confirmPassword: "", phoneOtp: "" }); setError(""); setSuccess(""); setStep(1); }}
          sx={{ flex: 1, height: 'var(--box-height)' }}
        >
          वापस जाएं
        </TarangButton>

        <TarangButton
          loading={isLoading}
          disabled={isLoading || formData.otp.length < 6 || (formData.verifyPhone && (formData.phoneOtp || "").length < 6) || (formData.twoFactorEnabled && (formData.totpCode || "").length < 6)}
          onClick={async () => { if (onVerifyOtp) { await onVerifyOtp(); } else { setError(""); setSuccess(""); setStep(3); } }}
          sx={{ flex: 1, height: 'var(--box-height)' }}
        >
          कोड वेरीफाई करें
        </TarangButton>
      </Box>



    </Box>
    </FormLoadingProvider>
  );
}