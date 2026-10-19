import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import "../../styles/navbar.css";

function notificationsLabel(count) {
  if (count === 0) {
    return "no notifications";
  }
  if (count > 99) {
    return "more than 99 notifications";
  }
  return `${count} notifications`;
}

export default function AccessibleBadges({ count = 0, onClick }) {
  return (
    <IconButton aria-label={notificationsLabel(count)} onClick={onClick}>
      <Badge
        badgeContent={count}
        sx={{
          "& .MuiBadge-badge": {
            backgroundColor: "#28a745",
            color: "white",
          },
        }}
      >
        <div className="notification_icon">
          <NotificationsIcon sx={{ color: "#0056b3", fontSize: 30 }} />
        </div>
      </Badge>
    </IconButton>
  );
}
