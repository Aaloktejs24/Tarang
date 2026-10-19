import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

export const globalTimePickerViewRenderers = {
  hours: renderTimeViewClock,
  minutes: renderTimeViewClock,
  seconds: renderTimeViewClock,
};

const commonTimeSx = {
  "& .MuiClockNumber-root.Mui-selected, & .MuiTypography-root.MuiClockNumber-root.Mui-selected": {
    color: "var(--color-white)",
    zIndex: "var(--z-sticky)",
  },
  "& .MuiClock-pin": {
    backgroundColor: "var(--theme-blue)",
  },
  "& .MuiClockPointer-root": {
    backgroundColor: "var(--theme-blue)",
  },
  "& .MuiClockPointer-thumb": {
    backgroundColor: "var(--theme-blue)",
    borderColor: "var(--theme-blue)",
    boxSizing: "content-box",
  },
  "& .MuiClock-clock": {
    backgroundColor: "rgba(0, 86, 179, 0.06)",
  },
  "& .MuiTimePickerToolbar-ampmSelection .MuiTimePickerToolbar-ampmLabel.Mui-selected": {
    color: "var(--color-white)",
    fontWeight: "var(--font-bold)",
    opacity: 1,
  },
  "& .MuiTimePickerToolbar-ampmSelection .MuiTimePickerToolbar-ampmLabel": {
    color: "rgba(255, 255, 255, 0.4)",
    fontWeight: "var(--font-regular)",
  },
  "& .MuiTimePickerToolbar-root": {
    backgroundColor: "var(--theme-blue)",
    color: "var(--color-white)",
  },
  "& .MuiTimePickerToolbar-root .MuiTypography-root": {
    color: "var(--color-white)",
  },
  "& .MuiTimePickerToolbar-separator": {
    color: "rgba(255, 255, 255, 0.5)",
  },
  "& .MuiTimeClock-arrowSwitcher": {
    display: "none",
  },
  "& .MuiClock-amButton, & .MuiClock-pmButton": {
    opacity: 0,
    width: 0,
    height: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },
  "& .MuiPickersToolbar-root .MuiTypography-overline, & .MuiTimePickerToolbar-root .MuiTypography-overline": {
    display: "none",
  },
  "& .MuiDialogActions-root .MuiButton-root": {
    color: "var(--theme-blue)",
    fontWeight: "var(--font-bold)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
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
      borderRadius: 'var(--radius-md)',
      backgroundColor: "var(--color-white)",
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
