import React, { useRef, useEffect } from "react";
import { Box, TextField } from "@mui/material";

export default function OtpInput({ value = "", onChange, numInputs = 6, isLoading = false, error = false }) {
  const inputRefs = useRef([]);
  const otpArray = value.split("").concat(Array(numInputs).fill("")).slice(0, numInputs);

  useEffect(() => {
    const currentOtpArray = value.split("").concat(Array(numInputs).fill("")).slice(0, numInputs);

    // Fill refs array
    inputRefs.current = inputRefs.current.slice(0, numInputs);

    // Auto focus first empty input on mount OR when value is cleared (e.g. after resend)
    // Only try to focus if not loading (inputs are enabled)
    if (!isLoading) {
      if (!value || value.length === 0) {
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 150);
      } else {
        const firstEmptyIndex = currentOtpArray.findIndex(d => !d);
        if (firstEmptyIndex !== -1) {
          setTimeout(() => {
            inputRefs.current[firstEmptyIndex]?.focus();
          }, 150);
        } else {
          // If full, focus the last box so backspace works immediately
          setTimeout(() => {
            inputRefs.current[numInputs - 1]?.focus();
          }, 150);
        }
      }
    }
  }, [numInputs, value, isLoading]);

  const handleChange = (index, val) => {
    if (!/^[0-9]?$/.test(val)) return;

    const newOtpArray = [...otpArray];
    newOtpArray[index] = val;
    const newOtpValue = newOtpArray.join("");
    onChange(newOtpValue);

    if (val && index < numInputs - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpArray[index] && index > 0) {
        const newOtpArray = [...otpArray];
        newOtpArray[index - 1] = "";
        onChange(newOtpArray.join(""));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtpArray = [...otpArray];
        newOtpArray[index] = "";
        onChange(newOtpArray.join(""));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, numInputs);
    if (!/^\d+$/.test(pastedData)) return;

    onChange(pastedData);
    // Focus last filled or next empty
    const nextIndex = Math.min(pastedData.length, numInputs - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, my: 1 }}>
      {otpArray.map((digit, i) => (
        <TextField
          key={i}
          inputRef={(el) => (inputRefs.current[i] = el)}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          autoComplete="one-time-code"
          disabled={isLoading}
          inputProps={{
            maxLength: 1,
            style: {
              textAlign: "center",
              padding: "10px 0",
              fontSize: "18px",
              fontWeight: 600,
              color: "#0f172a",
              caretColor: (value.length === numInputs && !error) ? "transparent" : "inherit",
            },
          }}
          sx={{
            width: "52px",
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              transition: "all 0.2s ease-in-out",
              "& fieldset": {
                borderColor: error ? "#ef4444" : "#e2e8f0",
                borderWidth: "1.5px",
              },
              "&:hover fieldset": {
                borderColor: error ? "#ef4444" : "#cbd5e1",
              },
              "&.Mui-focused fieldset": {
                borderColor: error ? "#ef4444" : "#0056b3",
                borderWidth: "2px",
              },
              "&.Mui-focused": {
              },
            },
          }}
        />
      ))}
    </Box>
  );
}
