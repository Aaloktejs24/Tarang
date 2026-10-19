import React from 'react';
import { Box } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { CustomTooltip } from './CustomTooltip';

export const FieldCommentTooltip = ({ comment }) => {
  if (!comment) return null;

  return (
    <CustomTooltip title={comment} placement="top" arrow>
      <Box 
        className="comment-icon"
        sx={{
          position: 'absolute',
          top: '-10px',
          right: '10px',
          bgcolor: 'var(--color-warning)',
          color: 'var(--color-slate-900)',
          borderRadius: 'var(--radius-full)',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          
          cursor: 'help',
          zIndex: 'var(--z-sticky)'
        }}
      >
        <ChatBubbleOutlineIcon sx={{ fontSize: 'var(--font-sm)' }} />
      </Box>
    </CustomTooltip>
  );
};
