import { Box, Typography } from "@mui/material";
import { useFormLoading } from "../../contexts/FormLoadingContext";

/**
 * CustomCheckbox - A fully custom checkbox component that replaces MUI Checkbox.
 * MUI Checkbox's unchecked color cannot be reliably overridden via sx prop in Next.js App Router
 * without Emotion cache setup. This custom component uses direct inline styles/sx, so it's
 * completely immune to MUI's internal style injection order issues.
 *
 * Props:
 *   indeterminate{boolean}  - whether checkbox is indeterminate (overrides checked)
 *   onChange     {function} - onChange handler, receives (event) same as native input
 *   label        {string|ReactNode} - label text or JSX
 *   error        {boolean}  - if true, shows red border on checkbox
 *   disabled     {boolean}  - disables the checkbox
 *   size         {number}   - size in px of the checkbox square (default: 16)
 *   sx           {object}   - additional sx props for the wrapper label Box
 */
export default function CustomCheckbox({
  checked = false,
  indeterminate = false,
  onChange,
  label,
  error = false,
  disabled = false,
  size = 18,
  sx = {},
}) {
  const isFormLoading = useFormLoading();
  const finalDisabled = disabled || isFormLoading;

  const isFilled = checked || indeterminate;
  const borderColor = error
    ? "#ef4444"
    : isFilled
      ? "var(--color-primary)"
      : "rgba(30, 79, 163, 0.3)";

  const bgColor = isFilled ? "var(--color-primary)" : "transparent";

  return (
    <Box
      component="label"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        cursor: finalDisabled ? "not-allowed" : "pointer",
        userSelect: "none",
        opacity: finalDisabled ? 0.5 : 1,
        ...sx,
      }}
    >
      {/* Visual checkbox box */}
      <Box
        component="span"
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
          border: `1.5px solid ${borderColor}`,
          borderRadius: "var(--radius-sm)",
          backgroundColor: bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all var(--transition-fast)",
        }}
      >
        {indeterminate ? (
          <svg
            width={size * 0.625}
            height={size * 0.125}
            viewBox="0 0 10 2"
            fill="none"
          >
            <rect width="10" height="2" rx="1" fill="white" />
          </svg>
        ) : checked ? (
          <svg
            width={size * 0.625}
            height={size * 0.5}
            viewBox="0 0 10 8"
            fill="none"
          >
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </Box>

      {/* Hidden native input for accessibility */}
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = indeterminate;
        }}
        onChange={finalDisabled ? undefined : onChange}
        disabled={finalDisabled}
        readOnly={!onChange}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0, margin: 0 }}
      />

      {/* Label */}
      {label && (
        typeof label === "string" ? (
          <Typography
            variant="body2"
            sx={{
              color: "var(--color-slate-500)",
              fontSize: 13.5,
              lineHeight: 1.4,
              fontWeight: "var(--font-medium)",
            }}
          >
            {label}
          </Typography>
        ) : (
          label
        )
      )}
    </Box>
  );
}
