import { Box, Typography, TextField, Button, InputAdornment, Popover, List, ListItemButton, Checkbox, FormControlLabel } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import Loader from "../../../components/common/Loader";

import geoData from '../../../data/geoData.json';
const { countryCodes: COUNTRY_CODES } = geoData;
export default function RegisterEmailStep({ setStep, setMode, formData, updateFormData, setError, error, isLoading, onRegisterStart, success, setSuccess }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCountry = COUNTRY_CODES.find(c => c.code === (formData.countryCode || "+91")) || COUNTRY_CODES[1] || COUNTRY_CODES[0];
  const filteredCountries = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.enName && c.enName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.code.includes(searchQuery)
  );

  const handleSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      setError("ईमेल आवश्यक है");
      return;
    }
    if (!emailRegex.test(formData.email)) {
      setError("कृपया एक मान्य ईमेल पता डालें");
      return;
    }

    try {
      const fullPhone = formData.phone ? `${formData.countryCode || "+91"}${formData.phone}` : "";
      await onRegisterStart(formData.email, fullPhone, formData.verifyPhone);
    } catch {
      // Error managed in parent
    }
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px" }}>
          नया अकाउंट बनाएँ
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", fontSize: "15px" }}>
          हमारी कम्युनिटी से जुड़ें और अपनी यात्रा शुरू करें।
        </Typography>
      </Box>

      {error && (
        <Typography variant="body2" sx={{ color: "#f87171", fontSize: "14px", textAlign: "center", fontWeight: 500 }}>
          {error}
        </Typography>
      )}

      {success && (
        <Typography variant="body2" sx={{ color: "#34d399", fontSize: "14px", textAlign: "center", fontWeight: 500 }}>
          {success}
        </Typography>
      )}

      <Box>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: "#334155", fontSize: "14px" }}>
          ईमेल पता
        </Typography>
        <TextField
          fullWidth
          value={formData.email}
          onChange={(e) => {
            updateFormData({ email: e.target.value });
            if (error) setError("");
            if (success) setSuccess("");
          }}
          placeholder="name@example.com"
          size="medium"
          disabled={isLoading}
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
              "& input": { color: "#0f172a" }
            },
            "& .MuiOutlinedInput-input": { padding: "12px 14px", fontSize: "15px" },
          }}
        />
      </Box>

      <Box sx={{ mt: 1 }}>
        <Button
          fullWidth
          variant="contained" disableElevation
          disabled={isLoading}
          onClick={handleSendOtp}
          sx={{
            py: 1.5,
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
          {isLoading ? <Loader mini /> : "OTP भेजें"}
        </Button>

        <Typography variant="body2" sx={{ textAlign: "center", color: "#64748b", mt: 2.5 }}>
          क्या आपका पहले से अकाउंट है?{" "}
          <Box
            component="span"
            sx={{ color: "#0056b3", fontWeight: 600, cursor: "pointer", ml: 0.5, "&:hover": { textDecoration: "underline" } }}
            onClick={() => { setMode("login"); setStep(1); }}
          >
            अभी लॉगिन करें
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}