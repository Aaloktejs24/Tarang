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
            minWidth: "100%",
            transform: "translateX(-12px)", 
            width: "calc(100% + 24px)",
            borderRadius: "16px",
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
                borderRadius: "8px",
                marginBottom: "2px",
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "rgba(0, 86, 179, 0.08) !important",
                },
                "&.Mui-focused": {
                  backgroundColor: "transparent",
                },
                "&[aria-selected='true']": {
                  backgroundColor: "rgba(0, 86, 179, 0.15) !important",
                },
                "&[aria-selected='true'].Mui-focused": {
                  backgroundColor: "rgba(0, 86, 179, 0.15) !important",
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
                <SearchIcon sx={{ color: '#0056b3', fontSize: 22, opacity: 0.6 }} />
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
              color: "#0056b3",
              fontWeight: 500,
              backgroundColor: "transparent !important",
              borderRadius: "0px",
              paddingRight: "0px !important",
              paddingLeft: "0px !important",
              border: "none",
            },
            "& .MuiOutlinedInput-root": {
              backgroundColor: "transparent !important",
            },
            "& .MuiInputBase-input": {
              height: "38px",
              padding: "0",
              boxSizing: "border-box",
              "&::placeholder": {
                color: "#94a3b8", // Standard subtle grey placeholder
                opacity: 1,
                fontWeight: 400,
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
