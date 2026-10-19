import React, { useRef, useEffect } from "react";
import { Box, TextField } from "@mui/material";

export default function OtpInput({ value = "", onChange, numInputs = 6, isLoading = false, error = false }) {
  const inputRefs = useRef([]);
  const otpArray = value.split("").concat(Array(numInputs).fill("")).slice(0, numInputs);

  useEffect(() => {
    // Fill refs array
    inputRefs.current = inputRefs.current.slice(0, numInputs);
  }, [numInputs]);

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
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, my: 1 }}>
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
              padding: 0,
              fontSize: 'var(--font-lg)',
              fontWeight: 'var(--font-semibold)',
              fontFamily: 'inherit',
              color: "var(--color-slate-900)",
              caretColor: (value.length === numInputs && !error) ? "transparent" : "inherit",
              height: "100%",
              boxSizing: "border-box"
            },
          }}
          sx={{
            width: "46px",
            height: "46px",
            "& .MuiInputBase-root": {
              height: "100%",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: error ? "var(--color-error)" : undefined,
                borderWidth: error ? "1.5px" : undefined,
              },
              "&:hover fieldset": {
                borderColor: error ? "var(--color-error)" : undefined,
              },
              "&.Mui-focused fieldset": {
                borderColor: error ? "var(--color-error)" : undefined,
                borderWidth: error ? "2px" : undefined,
              },
            },
          }}
        />
      ))}
    </Box>
  );
}
