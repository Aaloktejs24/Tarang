import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

export const globalTimePickerViewRenderers = {
  hours: renderTimeViewClock,
  minutes: renderTimeViewClock,
  seconds: renderTimeViewClock,
};

const commonTimeSx = {
  "& *": {
    fontFamily: "'Inter', sans-serif !important",
  },
  "& .MuiClockNumber-root.Mui-selected, & .MuiTypography-root.MuiClockNumber-root.Mui-selected": {
    color: "#ffffff !important",
    zIndex: "20 !important",
  },
  "& .MuiClock-pin": {
    backgroundColor: "#0056b3 !important",
  },
  "& .MuiClockPointer-root": {
    backgroundColor: "#0056b3 !important",
  },
  "& .MuiClockPointer-thumb": {
    backgroundColor: "#0056b3 !important",
    borderColor: "#0056b3 !important",
    boxSizing: "content-box !important",
  },
  "& .MuiClock-clock": {
    backgroundColor: "rgba(0, 86, 179, 0.06) !important",
  },
  "& .MuiTimePickerToolbar-ampmSelection .MuiTimePickerToolbar-ampmLabel.Mui-selected": {
    color: "#ffffff !important",
    fontWeight: "900 !important",
    opacity: "1 !important",
  },
  "& .MuiTimePickerToolbar-ampmSelection .MuiTimePickerToolbar-ampmLabel": {
    color: "rgba(255,255,255,0.4) !important",
    fontWeight: "400 !important",
  },
  "& .MuiTimePickerToolbar-root": {
    backgroundColor: "#0056b3 !important",
    color: "#ffffff !important",
  },
  "& .MuiTimePickerToolbar-root .MuiTypography-root": {
    color: "#ffffff !important",
  },
  "& .MuiTimePickerToolbar-separator": {
    color: "rgba(255,255,255,0.5) !important",
  },

  "& .MuiTimeClock-arrowSwitcher": {
    display: "none !important",
  },
  "& .MuiClock-amButton, & .MuiClock-pmButton": {
    opacity: "0 !important",
    width: "0px !important",
    height: "0px !important",
    overflow: "hidden !important",
    pointerEvents: "none !important",
  },
  "& .MuiPickersToolbar-root .MuiTypography-overline, & .MuiTimePickerToolbar-root .MuiTypography-overline": {
    display: "none !important",
  },
  "& .MuiDialogActions-root .MuiButton-root": {
    color: "#0056b3 !important",
    fontWeight: "700 !important",
    textTransform: "uppercase !important",
    letterSpacing: "0.05em !important",
  },
};

export const globalTimePickerSlotProps = {
  textField: {
    placeholder: "HH:MM AM/PM",
  },
  toolbar: {
    hidden: false,
  },
  actionBar: {
    actions: ["cancel", "accept"],
  },
  desktopPaper: {
    sx: {
      marginTop: "8px",
      border: "1.5px solid rgba(203, 213, 225, 0.8)",
      boxShadow: "none",
      borderRadius: "8px",
      backgroundColor: "#ffffff",
      overflow: "hidden",
      ...commonTimeSx,
    },
  },
  popper: {
    sx: { ...commonTimeSx },
  },
  dialog: {
    sx: { ...commonTimeSx },
  },
};
