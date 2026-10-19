import React, { useRef, useEffect } from "react";
import { Box, TextField } from "@mui/material";
import { useFormLoading } from "../../../contexts/FormLoadingContext";

export default function OtpInput({ value = "", onChange, numInputs = 6, isLoading = false, error = false }) {
  const isFormLoading = useFormLoading();
  const finalDisabled = isLoading || isFormLoading;
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
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, my: 1, flex: 1 }}>
      {otpArray.map((digit, i) => (
        <TextField
          key={i}
          inputRef={(el) => (inputRefs.current[i] = el)}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          onPaste={handlePaste}
          autoComplete="one-time-code"
          disabled={finalDisabled}
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
            opacity: finalDisabled ? 0.6 : 1,
            pointerEvents: finalDisabled ? "none" : "auto",
            "& .MuiInputBase-root": {
              height: "100%",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: error ? "var(--color-error)" : "rgba(30, 79, 163, 0.2)",
                borderWidth: error ? "1.5px" : "1px",
              },
              "&:hover fieldset": {
                borderColor: error ? "var(--color-error)" : "rgba(30, 79, 163, 0.4)",
              },
              "&.Mui-focused fieldset": {
                borderColor: error ? "var(--color-error)" : "var(--color-primary)",
                borderWidth: error ? "1.5px" : "1px",
              },
            },
          }}
        />
      ))}
    </Box>
  );
}
