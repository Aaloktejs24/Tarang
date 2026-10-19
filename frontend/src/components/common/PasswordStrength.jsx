import { Box, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import { RULES, getPasswordStrength } from "../../utils/validationUtils";

export const RuleRow = ({ passed, label, color, isIncorrect }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Box sx={{
            width: 14, height: 14, borderRadius: 'var(--radius-full)',
            bgcolor: passed ? (color || "var(--color-success)") : (isIncorrect ? "var(--color-error)" : "var(--color-slate-200)"),
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "background-color var(--transition-base)"
        }}>
            {passed && <CheckIcon sx={{ color: "var(--color-white)", fontSize: 10, strokeWidth: 4 }} />}
            {isIncorrect && <ErrorIcon sx={{ color: "var(--color-white)", fontSize: 10, strokeWidth: 4 }} />}
        </Box>
        <Typography sx={{
            fontSize: 'var(--font-xs)',
            color: passed ? (color || "var(--color-success)") : (isIncorrect ? "var(--color-error)" : "var(--color-slate-500)"),
            fontWeight: passed ? 600 : 500,
            transition: "color var(--transition-base)"
        }}>
            {label}
        </Typography>
    </Box>
);

export const PasswordStrengthBars = ({ password }) => {
    const strength = getPasswordStrength(password);
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
            <Box sx={{ display: "flex", gap: 0.5, flex: 1 }}>
                {RULES.map((_, i) => (
                    <Box key={i} sx={{ flex: 1, height: 3, borderRadius: "var(--radius-full)", bgcolor: i < strength.score ? strength.color : "var(--color-slate-200)", transition: "background-color var(--transition-slow)" }} />
                ))}
            </Box>
            {strength.label && (
                <Typography sx={{ fontSize: 'var(--font-xs)', fontWeight: 'var(--font-bold)', color: strength.color, whiteSpace: "nowrap" }}>
                    {strength.label}
                </Typography>
            )}
        </Box>
    );
};
