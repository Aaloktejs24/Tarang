import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import suggestion from "./SearchBoxData";

export default function SearchBox() {
  return (
    <Autocomplete
      disablePortal
      options={suggestion}
      slotProps={{
        paper: {
          sx: {
            minWidth: "var(--size-full)",
            transform: "translateX(-12px)", 
            width: "calc(100% + 24px)",
            borderRadius: 'var(--radius-lg)',
            overflow: "hidden", // Fix any corner bleed
            "& .MuiAutocomplete-listbox": {
              maxHeight: "35vh",
              overflowY: "auto",
              padding: "8px", // Added padding all around so options have margin from edges
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": { display: "none" },
              "& .MuiAutocomplete-option": {
                minHeight: "44px",
                borderRadius: 'var(--radius-md)',
                marginBottom: "2px",
                transition: "background-color var(--transition-base)",
                "&:hover": {
                  backgroundColor: "rgba(0, 86, 179, 0.08)",
                },
                "&.Mui-focused": {
                  backgroundColor: "transparent",
                },
                "&[aria-selected='true']": {
                  backgroundColor: "rgba(0, 86, 179, 0.15)",
                },
                "&[aria-selected='true'].Mui-focused": {
                  backgroundColor: "rgba(0, 86, 179, 0.15)",
                }
              }
            }
          },
        },
      }}
      sx={{
        flex: 1, 
      }}
      renderInput={(params) => (
        <TextField
          id={params.id}
          disabled={params.disabled}
          fullWidth={params.fullWidth}
          size={params.size}
          InputLabelProps={params.InputLabelProps}
          inputProps={params.inputProps}
          placeholder="खोजें..."
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start" sx={{ pl: 1, pr: 0.5, mt: 0 }}>
                <SearchIcon sx={{ color: 'var(--color-primary)', fontSize: 22, opacity: 0.6 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none", // Removes the double border artifact
            },
            "& .MuiInputBase-root": {
              height: "38px",
              fontStyle: "normal",
              color: "var(--color-primary)",
              fontWeight: 'var(--font-medium)',
              backgroundColor: "transparent",
              borderRadius: "0px",
              paddingRight: "0px",
              paddingLeft: "0px",
              border: "none",
            },
            "& .MuiOutlinedInput-root": {
              backgroundColor: "transparent",
            },
            "& .MuiInputBase-input": {
              height: "38px",
              padding: "0",
              boxSizing: "border-box",
              "&::placeholder": {
                color: "var(--color-slate-500)", // Standard subtle grey placeholder
                opacity: 1,
                fontWeight: 'var(--font-regular)',
              }
            },
            "& .MuiAutocomplete-popupIndicator": {
              display: "none",
            },
          }}
        />
      )}
    />
  );
}
