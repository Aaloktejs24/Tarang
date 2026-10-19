export const DASHBOARD_PAGE_WRAPPER_SX = {
  position: "relative",
  minHeight: "calc(100vh - 72px)",
  bgcolor: "transparent",
  mt: "-1px"
};

export const DASHBOARD_PAGE_WRAPPER_NO_HERO_SX = {
  ...DASHBOARD_PAGE_WRAPPER_SX,
  pt: { xs: 3, md: 4 }
};

export const DASHBOARD_CONTAINER_SX = {
  position: "relative",
  zIndex: 1,
  pb: 10,
  px: { xs: 2, sm: 3, md: 4, lg: 6 }
};
