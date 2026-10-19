import { Box, Typography, TextField, InputAdornment, Popover, List, ListItemButton, Checkbox, FormControlLabel } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { validateEmail } from "../../../utils/validationUtils";
import AuthMessage from "./AuthMessage";

import gazeteer from '../../../data/formated/gazeteer.json';
const COUNTRY_CODES = gazeteer.Countries.map(c => ({ ...c, code: c.phoneCode, enName: c.name, label: c.phoneCode }));
import TarangButton from "../../../components/common/TarangButton";
export default function RegisterEmailStep({ setStep, setMode, formData, updateFormData, setError, error, isLoading, onRegisterStart, success, setSuccess }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const selectedCountry = COUNTRY_CODES.find(c => c.code === (formData.countryCode || "+91")) || COUNTRY_CODES[1] || COUNTRY_CODES[0];
  const filteredCountries = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.enName && c.enName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.code.includes(searchQuery)
  );

  const handleSendOtp = async () => {
    const emailErr = validateEmail(formData.email);
    if (emailErr) {
      setFieldErrors({ email: emailErr });
      return;
    }
    setFieldErrors({});

    try {
      const fullPhone = formData.phone ? `${formData.countryCode || "+91"}${formData.phone}` : "";
      await onRegisterStart(formData.email, fullPhone, formData.verifyPhone);
    } catch {
      // Error managed in parent
    }
  };

  return (
    <Box sx={{ width: "var(--size-full)", display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: "var(--color-slate-900)", letterSpacing: "-0.5px", fontSize: 'var(--font-2xl)' }}>
          नया अकाउंट बनाएँ
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--color-slate-500)", fontSize: 'var(--font-base)', lineHeight: 1.5 }}>
          हमारी कम्युनिटी से जुड़ें और अपनी यात्रा शुरू करें.
        </Typography>
        <AnimatePresence mode="wait">
            {(error || success) && (
                <motion.div key={error ? "error" : "success"} initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} style={{ overflow: "hidden", textAlign: "center" }}>
                    {error ? (
                        <AuthMessage type="error" message={error} />
                    ) : (
                        <AuthMessage type="success" message={success} />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
      </Box>

      <Box>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'var(--font-semibold)', color: "var(--color-slate-700)", fontSize: 'var(--font-sm)' }}>
          ईमेल पता
        </Typography>
        <TextField
          fullWidth
          value={formData.email}
          onChange={(e) => {
            updateFormData({ email: e.target.value });
            if (error) setError("");
            if (success) setSuccess("");
            if (fieldErrors.email) setFieldErrors({ email: "" });
          }}
          error={!!fieldErrors.email}
          helperText={fieldErrors.email}
          placeholder="name@example.com"
          size="medium"
          disabled={isLoading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Box sx={{ mr: 1, color: "var(--color-slate-500)", display: "flex", alignItems: "center" }}>
                  <EmailIcon sx={{ fontSize: 20 }} />
                </Box>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& input": { color: "var(--color-slate-900)" }
            },
            "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: 'var(--font-base)' },
          }}
        />
      </Box>

      <Box sx={{ mt: 0 }}>


        <TarangButton
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          onClick={handleSendOtp}
          sx={{ height: 'var(--box-height)' }}
        >
          {"एप्रकू भेजें"}
        </TarangButton>

        <Typography variant="body2" sx={{ textAlign: "center", color: "var(--color-slate-500)", mt: 2.5 }}>
          क्या आपका पहले से अकाउंट है?{" "}
          <Box
            component="span"
            sx={{ color: "var(--color-primary)", fontWeight: 'var(--font-semibold)', cursor: "pointer", ml: 0.5, "&:hover": { textDecoration: "none" } }}
            onClick={() => { setMode("login"); setStep(1); }}
          >
            अभी लॉगिन करें
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}