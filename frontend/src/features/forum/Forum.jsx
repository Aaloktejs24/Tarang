import React from "react";
import { Box, Typography, Paper, Avatar, Chip, Divider } from "@mui/material";
import ForumIcon from "@mui/icons-material/Forum";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import mockData from '../../data/dashboardMockData.json';
const { dashboardMockData: dashboardMockData } = mockData;
const { discussions } = dashboardMockData;

const topicColors = { "भौतिकी": "#0056b3", "गणित": "#28a745", "रसायन": "#f39c12", "जीव विज्ञान": "#e74c3c" };

export default function Forum() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <ForumIcon sx={{ fontSize: 32, color: "#0056b3" }} />
        <Typography variant="h5" fontWeight="bold" color="#0056b3">वार्तालाप मंच</Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {discussions.map((d) => (
          <Paper key={d.id} elevation={0} sx={{ p: 3, borderRadius: "8px", border: "1px solid #e0e0e0", "&:hover": { borderColor: "#0056b3" }, transition: "all 0.2s ease", cursor: "pointer" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: topicColors[d.topic] || "#666", fontSize: 14 }}>{d.user[0]}</Avatar>
              <Box>
                <Typography fontWeight="bold" fontSize={13}>{d.user}</Typography>
                <Typography fontSize={11} color="text.secondary">{d.time}</Typography>
              </Box>
              <Chip label={d.topic} size="small" sx={{ ml: "auto", bgcolor: `${topicColors[d.topic]}15`, color: topicColors[d.topic], fontWeight: "bold", border: `1px solid ${topicColors[d.topic]}40` }} />
            </Box>
            <Typography fontWeight="bold" fontSize={15} mb={0.5}>{d.title}</Typography>
            <Typography fontSize={13} color="text.secondary" mb={2}>{d.body}</Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Box sx={{ display: "flex", gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#666" }}>
                <ThumbUpAltOutlinedIcon fontSize="small" />
                <Typography fontSize={12}>{d.likes}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#666" }}>
                <ChatBubbleOutlineIcon fontSize="small" />
                <Typography fontSize={12}>{d.replies} उत्तर</Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
