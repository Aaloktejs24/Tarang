import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ClearIcon from "@mui/icons-material/Clear";
import dayjs from "dayjs";
import { CustomFloatingInput } from "../../../components/common/CustomFloatingFields";
import { GlassPopover } from "../../../components/common/GlassPopover";

// ── clock geometry ────────────────────────────────────────
const CLOCK_SIZE = 216;
const CENTER = CLOCK_SIZE / 2;   // 108
const HAND_RADIUS = 78;
const NUM_SIZE = 30;

const getPos = (idx) => {
  const angle = (idx * 30 - 90) * (Math.PI / 180);
  return {
    x: CENTER + HAND_RADIUS * Math.cos(angle),
    y: CENTER + HAND_RADIUS * Math.sin(angle),
  };
};

const HOUR_ITEMS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTE_ITEMS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const to24 = (h12, mer) =>
  mer === "AM" ? (h12 === 12 ? 0 : h12) : (h12 === 12 ? 12 : h12 + 12);

// ── component ─────────────────────────────────────────────
const CustomTimePicker = ({
  value,
  onChange,
  disabled = false,
  label = "Time",
  minTime,
  maxTime,
  minuteStep = 5,
  required = false,
  sx = {},
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [view, setView] = useState("hours");
  const [meridiem, setMeridiem] = useState("AM");
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedMinute, setSelectedMinute] = useState(null);

  const open = Boolean(anchorEl);

  const isHourDisabled = useCallback((h12) => {
    const h24 = to24(h12, meridiem);
    if (minTime && h24 < minTime.hour()) return true;
    if (maxTime && h24 > maxTime.hour()) return true;
    return false;
  }, [meridiem, minTime, maxTime]);

  const isMinuteDisabled = useCallback((m) => {
    if (selectedHour === null) return false;
    const h24 = to24(selectedHour, meridiem);
    if (minTime && h24 === minTime.hour() && m < minTime.minute()) return true;
    if (maxTime && h24 === maxTime.hour() && m > maxTime.minute()) return true;
    return false;
  }, [selectedHour, meridiem, minTime, maxTime]);

  const isMeridiemDisabled = (mer) => {
    if (mer === "AM" && minTime && minTime.hour() >= 12) return true;
    if (mer === "PM" && maxTime && maxTime.hour() < 12) return true;
    return false;
  };

  const handleOpen = (e) => {
    if (disabled) return;
    if (value) {
      const h = value.hour();
      const mer = h >= 12 ? "PM" : "AM";
      setMeridiem(mer);
      setSelectedHour(h === 0 ? 12 : h > 12 ? h - 12 : h);
      setSelectedMinute(value.minute());
    } else {
      setMeridiem(minTime && minTime.hour() >= 12 ? "PM" : "AM");
      setSelectedHour(null);
      setSelectedMinute(null);
    }
    setView("hours");
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleMeridiemChange = (mer) => {
    if (isMeridiemDisabled(mer)) return;
    setMeridiem(mer);
    if (selectedHour !== null) {
      const h24 = to24(selectedHour, mer);
      if (
        (minTime && h24 < minTime.hour()) ||
        (maxTime && h24 > maxTime.hour())
      ) {
        setSelectedHour(null);
        setSelectedMinute(null);
      }
    }
  };

  const handleHourClick = (h12) => {
    if (isHourDisabled(h12)) return;
    setSelectedHour(h12);
    setTimeout(() => setView("minutes"), 180);
  };

  const handleMinuteClick = (m) => {
    if (isMinuteDisabled(m)) return;
    setSelectedMinute(m);
  };

  const handleConfirm = () => {
    if (selectedHour === null || selectedMinute === null) return;
    const result = dayjs("2000-01-01")
      .hour(to24(selectedHour, meridiem))
      .minute(selectedMinute)
      .second(0);
    onChange(result);
    handleClose();
  };

  const canConfirm = selectedHour !== null && selectedMinute !== null;

  const getHandPos = () => {
    if (view === "hours" && selectedHour !== null) {
      const idx = HOUR_ITEMS.indexOf(selectedHour);
      if (idx !== -1) return getPos(idx);
    }
    if (view === "minutes" && selectedMinute !== null) {
      const idx = MINUTE_ITEMS.indexOf(selectedMinute);
      if (idx !== -1) return getPos(idx);
    }
    return null;
  };
  const handPos = getHandPos();

  const hourDisplay = selectedHour !== null ? String(selectedHour).padStart(2, "0") : "--";
  const minuteDisplay = selectedMinute !== null ? String(selectedMinute).padStart(2, "0") : "--";
  const displayValue = value ? value.format("hh:mm A") : "";

  const ACCENT = "var(--color-primary)";

  return (
    <Box sx={{ position: "relative", ...sx }}>
      <CustomFloatingInput
        label={label}
        value={displayValue}
        placeholder="HH:MM AM"
        onClick={handleOpen}
        disabled={disabled}
        required={required}
        inputProps={{ readOnly: true, style: { cursor: disabled ? "not-allowed" : "pointer" } }}
        InputProps={{
          endAdornment: (
            <Box sx={{ display: "flex", alignItems: "center", pointerEvents: "none" }}>
              <AccessTimeIcon
                sx={{ fontSize: 20, color: disabled ? "rgba(0,0,0,0.26)" : ACCENT, pointerEvents: "none" }}
              />
            </Box>
          ),
        }}
      />

      <GlassPopover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        sx={{
          overflow: "hidden",
          userSelect: "none",
          width: 300,
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            background: ACCENT,
            px: 3,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Time digits */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
            <Typography
              onClick={() => setView("hours")}
              sx={{
                fontSize: "54px",
                fontWeight: 300,
                lineHeight: 1,
                cursor: "pointer",
                color: view === "hours" ? "var(--color-white)" : "rgba(255,255,255,0.45)",
                transition: "color var(--transition-fast)",
                letterSpacing: 0,
              }}
            >
              {hourDisplay}
            </Typography>
            <Typography sx={{ fontSize: "54px", lineHeight: 1, color: "rgba(255,255,255,0.6)", mx: 0.2 }}>
              :
            </Typography>
            <Typography
              onClick={() => { if (selectedHour !== null) setView("minutes"); }}
              sx={{
                fontSize: "54px",
                fontWeight: 300,
                lineHeight: 1,
                cursor: selectedHour !== null ? "pointer" : "default",
                color: view === "minutes" ? "var(--color-white)" : "rgba(255,255,255,0.45)",
                transition: "color var(--transition-fast)",
                letterSpacing: 0,
              }}
            >
              {minuteDisplay}
            </Typography>
          </Box>

          {/* AM / PM */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {["AM", "PM"].map((mer) => {
              const dis = isMeridiemDisabled(mer);
              const sel = meridiem === mer;
              return (
                <Typography
                  key={mer}
                  onClick={() => !dis && handleMeridiemChange(mer)}
                  sx={{
                    px: 1,
                    py: 0.2,
                    fontSize: 'var(--font-sm)',
                    fontWeight: sel ? 700 : 400,
                    cursor: dis ? "default" : "pointer",
                    color: sel ? "var(--color-white)" : dis ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.5)",
                    borderRadius: 'var(--radius-sm)',
                    background: sel ? "rgba(255,255,255,0.18)" : "transparent",
                    transition: "all var(--transition-fast)",
                    textAlign: "center",
                    "&:hover": !dis ? { background: "rgba(255,255,255,0.25)", color: "var(--color-white)" } : {},
                  }}
                >
                  {mer}
                </Typography>
              );
            })}
          </Box>
        </Box>

        {/* ── Clock Face ── */}
        <Box sx={{ px: 2.5, pt: 2, pb: 1, display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              width: CLOCK_SIZE,
              height: CLOCK_SIZE,
              borderRadius: 'var(--radius-full)',
              background: "var(--glass-bg)",
              border: "var(--border-thin) solid var(--card-border)",
              position: "relative",
            }}
          >
            {/* SVG hand */}
            <svg
              width={CLOCK_SIZE}
              height={CLOCK_SIZE}
              style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
            >
              <circle cx={CENTER} cy={CENTER} r={4} fill={ACCENT} />
              {handPos && (
                <>
                  <line
                    x1={CENTER} y1={CENTER}
                    x2={handPos.x} y2={handPos.y}
                    stroke={ACCENT}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <circle cx={handPos.x} cy={handPos.y} r={NUM_SIZE / 2} fill={ACCENT} />
                </>
              )}
            </svg>

            {/* Numbers */}
            {(view === "hours" ? HOUR_ITEMS : MINUTE_ITEMS).map((num, idx) => {
              const { x, y } = getPos(idx);
              const dis = view === "hours" ? isHourDisabled(num) : isMinuteDisabled(num);
              const sel = view === "hours" ? selectedHour === num : selectedMinute === num;
              return (
                <Box
                  key={num}
                  onClick={() =>
                    view === "hours" ? handleHourClick(num) : handleMinuteClick(num)
                  }
                  sx={{
                    position: "absolute",
                    width: NUM_SIZE,
                    height: NUM_SIZE,
                    top: y - NUM_SIZE / 2,
                    left: x - NUM_SIZE / 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 'var(--radius-full)',
                    zIndex: 2,
                    cursor: dis ? "not-allowed" : "pointer",
                    color: sel ? "var(--color-white)" : dis ? "rgba(0,0,0,0.26)" : "var(--color-slate-900)",
                    fontWeight: sel ? 600 : 400,
                    fontSize: 'var(--font-sm)',
                    transition: "background var(--transition-fast)",
                    "&:hover": !dis && !sel
                      ? { background: "rgba(21,101,192,0.12)" }
                      : {},
                  }}
                >
                  {view === "minutes" ? String(num).padStart(2, "0") : num}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ── View dots ── */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75, pb: 0.5 }}>
          {["hours", "minutes"].map((v) => (
            <Box
              key={v}
              onClick={() => {
                if (v === "minutes" && selectedHour !== null) setView(v);
                else if (v === "hours") setView(v);
              }}
              sx={{
                width: 7,
                height: 7,
                borderRadius: 'var(--radius-full)',
                background: view === v ? ACCENT : "var(--color-slate-200)",
                cursor: "pointer",
                transition: "background var(--transition-base)",
              }}
            />
          ))}
        </Box>

        {/* ── Actions ── */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, px: 2.5, py: 2 }}>
          <Button
            onClick={handleClose}
            size="small"
            sx={{
              color: "var(--color-slate-500)",
              fontWeight: 'var(--font-medium)',
              textTransform: "none",
              fontSize: 'var(--font-sm)',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            size="small"
            disabled={!canConfirm}
            sx={{
              color: canConfirm ? ACCENT : "rgba(0,0,0,0.26)",
              fontWeight: 'var(--font-bold)',
              textTransform: "none",
              fontSize: 'var(--font-sm)',
            }}
          >
            OK
          </Button>
        </Box>
      </GlassPopover>
    </Box>
  );
};

export default CustomTimePicker;
