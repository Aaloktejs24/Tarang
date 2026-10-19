import { glassPaperSx } from "./commonStyles";

export const globalDatePickerSlotProps = {
  textField: {},
  toolbar: {
    hidden: true,
  },
  desktopPaper: {
    elevation: 0,
    sx: {
      ...glassPaperSx,
      "& *": {
        fontFamily: "inherit !important",
      },
      "& .MuiPickersLayout-root": {
        backgroundColor: "transparent",
      },
      "& .MuiDateCalendar-root": {
        height: "auto",
        padding: "8px 20px 16px 20px",
      },
      "& .MuiPickersCalendarHeader-root": {
        marginTop: "8px",
        paddingTop: "0px",
      },
      "& .MuiPickersSlideTransition-root": {
        minHeight: "unset",
        height: "auto",
        overflow: "visible",
      },
      "& .MuiDayCalendar-monthContainer": {
        position: "static",
      },
      "& .MuiPickersDay-root.Mui-selected": {
        backgroundColor: "var(--color-primary)",
        color: "var(--color-white)",
        fontWeight: "var(--font-bold)",
      },
      "& .MuiPickersDay-today": {
        border: "var(--border-thin) solid var(--color-primary)",
        backgroundColor: "rgba(0, 86, 179, 0.08)",
      },
      "& .MuiMenuItem-root.Mui-selected": {
        backgroundColor: "var(--color-primary)",
        color: "var(--color-white)",
      },
      "& .MuiMenuItem-root.Mui-selected:hover": {
        backgroundColor: "#004494",
      },
      "& .MuiPickersCalendarHeader-root .MuiIconButton-root svg": {
        fontSize: "1.1rem",
        color: "var(--color-primary)",
      },
      "& .MuiPickersToolbar-root": {
        backgroundColor: "var(--color-primary)",
        color: "var(--color-white)",
        padding: "24px",
      },
      "& .MuiPickersToolbarText-root, & .MuiDatePickerToolbar-title": {
        color: "var(--color-white)",
        fontWeight: "900",
        opacity: "1",
        fontSize: "2rem",
        lineHeight: "1.2",
      },
      "& .MuiPickersToolbar-root .MuiTypography-overline, & .MuiDatePickerToolbar-root .MuiTypography-overline": {
        display: "none",
      },
      "& .MuiYearCalendar-root": {
        padding: "0 0 16px 0",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "4px",
      },
      "& .MuiPickersYear-root": {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexBasis: "unset",
      },
      "& .MuiPickersYear-yearButton": {
        margin: 0,
        width: "100%",
        borderRadius: "var(--radius-md)",
      },
    },
  },
  popper: {
    sx: {
      "& *": {
      },
    },
  },
};
