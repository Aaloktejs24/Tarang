export const globalDatePickerSlotProps = {
  textField: {},
  toolbar: {
    hidden: true,
  },
  desktopPaper: {
    sx: {
      marginTop: "8px",
      border: "1px solid #cbd5e1",
      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
      borderRadius: "16px",
      backgroundColor: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(20px)",
      overflow: "hidden",
      "& *": {
        fontFamily: "'Inter', sans-serif !important",
      },
      "& .MuiDateCalendar-root": {
        height: "auto !important",
        padding: "8px 20px 16px 20px !important",
      },
      "& .MuiPickersCalendarHeader-root": {
        marginTop: "8px !important",
        paddingTop: "0px !important",
      },
      "& .MuiPickersSlideTransition-root": {
        minHeight: "unset !important",
        height: "auto !important",
        overflow: "visible !important",
      },
      "& .MuiDayCalendar-monthContainer": {
        position: "static !important",
      },
      "& .MuiPickersDay-root.Mui-selected": {
        backgroundColor: "#0056b3 !important",
        color: "#ffffff !important",
        fontWeight: "bold",
      },
      "& .MuiPickersDay-today": {
        border: "1px solid #0056b3 !important",
        backgroundColor: "rgba(0, 86, 179, 0.08) !important",
      },
      "& .MuiMenuItem-root.Mui-selected": {
        backgroundColor: "#0056b3 !important",
        color: "#ffffff !important",
      },
      "& .MuiMenuItem-root.Mui-selected:hover": {
        backgroundColor: "#004494 !important",
      },
      "& .MuiPickersCalendarHeader-root .MuiIconButton-root svg": {
        fontSize: "1.1rem !important",
        color: "#0056b3",
      },
      "& .MuiPickersToolbar-root": {
        backgroundColor: "#0056b3 !important",
        color: "#ffffff !important",
        padding: "24px !important",
      },
      "& .MuiPickersToolbarText-root, & .MuiDatePickerToolbar-title": {
        color: "#ffffff !important",
        fontWeight: "900 !important",
        opacity: "1 !important",
        fontSize: "2rem !important",
        lineHeight: "1.2 !important",
      },
      "& .MuiPickersToolbar-root .MuiTypography-overline, & .MuiDatePickerToolbar-root .MuiTypography-overline": {
        display: "none !important",
      },
    },
  },
  popper: {
    sx: {
      "& *": {
        fontFamily: "'Inter', sans-serif !important",
      },
    },
  },
};
