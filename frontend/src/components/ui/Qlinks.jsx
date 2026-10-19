"use client";
import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser } from "../../features/auth/authService";

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(() => ({
  "& .MuiPaper-root": {
    minWidth: 260,
  },
}));

export default function CustomizedMenus() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/");
    }
  };

  return (
    <div>
      <Button
        id="demo-customized-button"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="text"
        disableElevation
        onClick={handleClick}
        sx={{
          minWidth: "auto",
          padding: "8px",
          color: "#0056b3",
          borderRadius: "8px",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "rgba(0, 86, 179, 0.08)",
            transform: "translateY(-1px)",
          }
        }}
      >
        <WidgetsOutlinedIcon sx={{ fontSize: 30 }} />
      </Button>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <Link href="/dashboard/settings" style={{ textDecoration: "none", color: "inherit" }}>
          <MenuItem onClick={handleClose}>
            <SettingsOutlinedIcon sx={{ color: "#64748b" }} />
            समायोजन
          </MenuItem>
        </Link>
        
        <MenuItem
          onClick={handleLogout}
          disableRipple
          sx={{
            color: "#ef4444 !important",
            mt: 0.5,
            "&:hover": {
              color: "#dc2626 !important"
            }
          }}
        >
          <LogoutOutlinedIcon sx={{ color: "inherit" }} />
          लॉगआउट
        </MenuItem>
      </StyledMenu>
    </div>
  );
}
