"use client";

import mockData from '../../data/dashboardMockData.json';
const { dashboardMockData: dashboardMockData } = mockData;
import React, { useState } from "react";
import { Box, Typography, Paper, Chip, LinearProgress, Checkbox } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";

const { initialTasks } = dashboardMockData;

const priorityConfig = { high: { label: "उच्च", color: "#e74c3c" }, medium: { label: "मध्यम", color: "#f39c12" }, low: { label: "निम्न", color: "#28a745" } };

export default function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);

  const toggle = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <AssignmentIcon sx={{ fontSize: 32, color: "#8e44ad" }} />
        <Typography variant="h5" fontWeight="bold" color="#8e44ad">आपके टास्क</Typography>
        <Chip label={`${tasks.filter(t => !t.done).length} शेष`} sx={{ ml: "auto", bgcolor: "#e74c3c", color: "white", fontWeight: "bold" }} />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {tasks.map(task => (
          <Paper key={task.id} elevation={0} sx={{ p: 2.5, borderRadius: "8px", border: `1px solid ${task.done ? "#e0e0e0" : "#f0f0f0"}`, opacity: task.done ? 0.6 : 1, transition: "all 0.2s" }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <Checkbox checked={task.done} onChange={() => toggle(task.id)} sx={{ p: 0, mt: 0.3, color: "#0056b3", "&.Mui-checked": { color: "#0056b3" } }} />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography fontWeight="bold" fontSize={14} sx={{ textDecoration: task.done ? "line-through" : "none" }}>{task.title}</Typography>
                  <Chip label={priorityConfig[task.priority].label} size="small" sx={{ ml: "auto", bgcolor: `${priorityConfig[task.priority].color}20`, color: priorityConfig[task.priority].color, fontSize: 11, fontWeight: "bold" }} />
                </Box>
                <Box sx={{ display: "flex", gap: 2, mb: 1.5 }}>
                  <Typography fontSize={12} color="text.secondary">📚 {task.subject}</Typography>
                  <Typography fontSize={12} color="text.secondary">⏰ {task.deadline}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LinearProgress variant="determinate" value={task.progress} sx={{ flex: 1, height: 6, borderRadius: "8px", bgcolor: "#f0f0f0", "& .MuiLinearProgress-bar": { bgcolor: task.done ? "#28a745" : "#0056b3", borderRadius: "8px" } }} />
                  <Typography fontSize={11} color="text.secondary">{task.progress}%</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
