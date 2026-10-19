import React from 'react';
import { Box } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { AmberTooltip } from './CustomTooltip';

export const FieldCommentTooltip = ({ comment }) => {
  if (!comment) return null;

  return (
    <AmberTooltip title={comment} placement="top" arrow>
      <Box 
        className="comment-icon"
        sx={{
          position: 'absolute',
          top: '-10px',
          right: '10px',
          bgcolor: '#ffc107',
          color: '#000000',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          
          cursor: 'help',
          zIndex: 10
        }}
      >
        <ChatBubbleOutlineIcon sx={{ fontSize: '14px' }} />
      </Box>
    </AmberTooltip>
  );
};
