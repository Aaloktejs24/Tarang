"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SendIcon from '@mui/icons-material/Send';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useProfile } from '../../../hooks/useProfile';
import TarangButton from '../../../components/common/TarangButton';

const formatTimeAgo = (timestamp, language = 'en') => {
  if (!timestamp) return language === 'en' ? 'Just now' : 'अभी';
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return language === 'en' ? 'Just now' : 'अभी';
  if (diffMin < 60) return language === 'en' ? `${diffMin}m ago` : `${diffMin} मिनट पहले`;
  if (diffHours < 24) return language === 'en' ? `${diffHours}h ago` : `${diffHours} घंटे पहले`;
  if (diffDays === 1) return language === 'en' ? 'Yesterday' : 'कल';
  return language === 'en' ? `${diffDays}d ago` : `${diffDays} दिन पहले`;
};

const getSeedComments = (topicTitle, language = 'en') => [
  {
    id: 'seed-c1',
    userName: language === 'en' ? 'Rahul Sharma' : 'राहुल शर्मा',
    userRole: 'student',
    userAvatar: '',
    text: language === 'en'
      ? `The explanation for ${topicTitle || 'this topic'} was very clear! Could you also share some extra practice questions on this?`
      : `${topicTitle || 'इस विषय'} का स्पष्टीकरण बहुत बढ़िया था! क्या आप इसके कुछ अतिरिक्त अभ्यास प्रश्न भी साझा कर सकते हैं?`,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    likes: 4,
    hasLiked: false,
    isCurrentUser: false,
    replies: [
      {
        id: 'seed-r1',
        userName: language === 'en' ? 'Prof. A. K. Verma' : 'प्रो. ए. के. वर्मा',
        userRole: 'instructor',
        userAvatar: '',
        text: language === 'en'
          ? 'Great question Rahul! I will be uploading practice problems in the resources tab shortly.'
          : 'बहुत अच्छा सवाल राहुल! मैं जल्द ही संसाधन टैब में अभ्यास समस्याएं जोड़ दूंगा।',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        likes: 2,
        hasLiked: false,
        isCurrentUser: false,
      },
    ],
  },
  {
    id: 'seed-c2',
    userName: language === 'en' ? 'Priya Mehta' : 'प्रिया मेहता',
    userRole: 'student',
    userAvatar: '',
    text: language === 'en'
      ? 'The real-world examples really helped in grasping the key intuition. Thank you!'
      : 'वास्तविक जीवन के उदाहरणों ने मूल अवधारणा को समझने में बहुत मदद की। धन्यवाद!',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    likes: 6,
    hasLiked: false,
    isCurrentUser: false,
    replies: [],
  },
];

export default function TopicComments({
  courseId,
  topicId,
  topicTitle,
  language = 'en',
}) {
  const { profile } = useProfile();
  const storageKey = `tarang_comments_${courseId || 'general'}_${topicId || 'default'}`;

  const [comments, setComments] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading comments from localStorage:', e);
    }
    return getSeedComments(topicTitle, language);
  });
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Save to localStorage whenever comments change
  const persistComments = (updatedComments) => {
    setComments(updatedComments);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedComments));
    } catch (e) {
      console.error('Error saving comments to localStorage:', e);
    }
  };

  const handleAddComment = () => {
    const trimmed = newCommentText.trim();
    if (!trimmed) return;

    const newComment = {
      id: `comm_${Date.now()}`,
      userName: profile?.name || (language === 'en' ? 'You' : 'आप'),
      userRole: profile?.role || 'student',
      userAvatar: profile?.profile_pic || '',
      userId: profile?.id,
      text: trimmed,
      createdAt: new Date().toISOString(),
      likes: 0,
      hasLiked: false,
      isCurrentUser: true,
      replies: [],
    };

    persistComments([newComment, ...comments]);
    setNewCommentText('');
  };

  const handleToggleLike = (commentId, isReply = false, parentId = null) => {
    const updated = comments.map((comm) => {
      if (!isReply && comm.id === commentId) {
        const nextLiked = !comm.hasLiked;
        return {
          ...comm,
          hasLiked: nextLiked,
          likes: nextLiked ? (comm.likes || 0) + 1 : Math.max(0, (comm.likes || 0) - 1),
        };
      }
      if (isReply && comm.id === parentId && comm.replies) {
        return {
          ...comm,
          replies: comm.replies.map((rep) => {
            if (rep.id === commentId) {
              const nextLiked = !rep.hasLiked;
              return {
                ...rep,
                hasLiked: nextLiked,
                likes: nextLiked ? (rep.likes || 0) + 1 : Math.max(0, (rep.likes || 0) - 1),
              };
            }
            return rep;
          }),
        };
      }
      return comm;
    });

    persistComments(updated);
  };

  const handleAddReply = (parentId) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    const newReply = {
      id: `rep_${Date.now()}`,
      userName: profile?.name || (language === 'en' ? 'You' : 'आप'),
      userRole: profile?.role || 'student',
      userAvatar: profile?.profile_pic || '',
      userId: profile?.id,
      text: trimmed,
      createdAt: new Date().toISOString(),
      likes: 0,
      hasLiked: false,
      isCurrentUser: true,
    };

    const updated = comments.map((comm) => {
      if (comm.id === parentId) {
        return {
          ...comm,
          replies: [...(comm.replies || []), newReply],
        };
      }
      return comm;
    });

    persistComments(updated);
    setReplyText('');
    setReplyingToId(null);
  };

  const handleDeleteComment = (commentId, isReply = false, parentId = null) => {
    let updated;
    if (!isReply) {
      updated = comments.filter((c) => c.id !== commentId);
    } else {
      updated = comments.map((comm) => {
        if (comm.id === parentId && comm.replies) {
          return {
            ...comm,
            replies: comm.replies.filter((r) => r.id !== commentId),
          };
        }
        return comm;
      });
    }
    persistComments(updated);
  };

  const totalCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies ? c.replies.length : 0),
    0
  );

  return (
    <Box
      sx={{
        bgcolor: 'var(--card-bg)',
        backdropFilter: 'var(--card-blur)',
        WebkitBackdropFilter: 'var(--card-blur)',
        borderRadius: 'var(--radius-lg)',
        border: 'var(--border-thin) solid var(--card-border)',
        boxShadow: 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: { xs: '280px', sm: '320px', lg: '360px' },
        maxHeight: { xs: '380px', sm: '420px', lg: '420px' },
        transition: 'var(--transition-base, all 0.2s ease)',
      }}
    >
      {/* Header styled exactly like CustomAccordionSummary */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          minHeight: '52px',
          background: 'rgba(0, 86, 179, 0.04)',
          backgroundColor: 'rgba(0, 86, 179, 0.04)',
          borderBottom: 'var(--border-thin) solid var(--card-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ForumOutlinedIcon sx={{ fontSize: 22, color: 'var(--theme-blue)' }} />
          <Typography
            sx={{
              fontSize: { xs: '15px', sm: '16px' },
              fontWeight: 700,
              color: 'var(--color-slate-900)',
              lineHeight: 1.3,
            }}
          >
            {language === 'en' ? 'Comments & Discussion' : 'टिप्पणियाँ एवं चर्चा'}
          </Typography>
        </Box>

        <Chip
          label={`${totalCount} ${language === 'en' ? (totalCount === 1 ? 'comment' : 'comments') : 'टिप्पणियाँ'}`}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '11.5px',
            bgcolor: 'rgba(0, 86, 179, 0.08)',
            color: 'var(--theme-blue)',
            border: 'var(--border-thin) solid rgba(0, 86, 179, 0.2)',
          }}
        />
      </Box>

      {/* Details Area */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >

      {/* Input Box for New Comment */}
      <Box sx={{ mb: 0, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Avatar
            src={profile?.profile_pic || ''}
            alt={profile?.name || 'User'}
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'var(--color-primary)',
              fontSize: 'var(--font-base)',
              fontWeight: 'var(--font-semibold)',
              boxShadow: 'none',
            }}
          >
            {(profile?.name || 'U').charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              placeholder={
                language === 'en'
                  ? 'Ask a question or share your thoughts on this topic...'
                  : 'इस विषय पर सवाल पूछें या अपने विचार साझा करें...'
              }
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--glass-bg)',
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
                  fontSize: 'var(--font-sm)',
                  color: 'var(--input-text)',
                  fontFamily: 'inherit',
                  boxShadow: 'none !important',
                  transition: 'border-color var(--transition-base)',
                  '& fieldset': {
                    borderColor: 'var(--card-border)',
                    borderWidth: 'var(--border-thin)',
                    boxShadow: 'none !important',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(30, 79, 163, 0.4)',
                    boxShadow: 'none !important',
                  },
                  '&.Mui-focused': {
                    boxShadow: 'none !important',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--color-primary)',
                    borderWidth: 'var(--border-thin)',
                    boxShadow: 'none !important',
                  },
                },
                '& .MuiInputBase-input': {
                  p: 0,
                  m: 0,
                  color: 'var(--input-text)',
                  fontSize: 'var(--font-sm)',
                  lineHeight: 'var(--line-height-base, 1.5)',
                  fontFamily: 'inherit',
                  '&::placeholder': {
                    color: 'var(--input-placeholder)',
                    opacity: 1,
                  },
                },
              }}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 1.25,
                mt: 1.25,
              }}
            >
              {newCommentText.trim() && (
                <TarangButton
                  variant="outlined"
                  size="sm"
                  onClick={() => setNewCommentText('')}
                  sx={{
                    borderRadius: 'var(--radius-sm)',
                    minHeight: '34px',
                    fontSize: 'var(--font-sm)',
                    fontWeight: 'var(--font-medium)',
                    px: 2,
                  }}
                >
                  {language === 'en' ? 'Cancel' : 'रद्द करें'}
                </TarangButton>
              )}
              <TarangButton
                variant="primary"
                size="sm"
                disabled={!newCommentText.trim()}
                onClick={handleAddComment}
                endIcon={<SendIcon sx={{ fontSize: '15px !important' }} />}
                sx={{
                  borderRadius: 'var(--radius-sm)',
                  minHeight: '34px',
                  px: 2,
                  fontSize: 'var(--font-sm)',
                  fontWeight: 'var(--font-semibold)',
                }}
              >
                {language === 'en' ? 'Comment' : 'टिप्पणी भेजें'}
              </TarangButton>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Comments List */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {comments.length === 0 ? (
          <Box
            sx={{
              py: 3,
              textAlign: 'center',
              bgcolor: 'rgba(248, 250, 252, 0.5)',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px dashed var(--color-slate-300)',
            }}
          >
            <Typography sx={{ fontSize: '13px', color: 'var(--color-slate-500)' }}>
              {language === 'en'
                ? 'No comments yet. Be the first to start the discussion!'
                : 'अभी कोई टिप्पणी नहीं है। चर्चा शुरू करने वाले पहले व्यक्ति बनें!'}
            </Typography>
          </Box>
        ) : (
          comments.map((comment) => {
            const isReplying = replyingToId === comment.id;

            return (
              <Box
                key={comment.id}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start',
                }}
              >
                <Avatar
                  src={comment.userAvatar || ''}
                  alt={comment.userName}
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor:
                      comment.userRole === 'instructor'
                        ? 'var(--color-success)'
                        : 'var(--color-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {(comment.userName || 'U').charAt(0).toUpperCase()}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {/* Author Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      mb: 0.5,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: 'var(--color-slate-900)',
                        }}
                      >
                        {comment.userName}
                      </Typography>

                      {comment.userRole === 'instructor' && (
                        <Chip
                          label={language === 'en' ? 'Instructor' : 'प्रशिक्षक'}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '10px',
                            fontWeight: 700,
                            bgcolor: 'rgba(40, 167, 69, 0.1)',
                            color: 'var(--theme-green, #28a745)',
                          }}
                        />
                      )}

                      {comment.isCurrentUser && (
                        <Chip
                          label={language === 'en' ? 'You' : 'आप'}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '10px',
                            fontWeight: 600,
                            bgcolor: 'rgba(0, 86, 179, 0.08)',
                            color: 'var(--theme-blue)',
                          }}
                        />
                      )}

                      <Typography sx={{ fontSize: '11px', color: 'var(--color-slate-400)' }}>
                        • {formatTimeAgo(comment.createdAt, language)}
                      </Typography>
                    </Box>

                    {comment.isCurrentUser && (
                      <Tooltip title={language === 'en' ? 'Delete comment' : 'टिप्पणी हटाएं'}>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteComment(comment.id)}
                          sx={{
                            color: 'var(--color-slate-400)',
                            p: 0.5,
                            '&:hover': { color: 'var(--color-error)', bgcolor: 'rgba(239, 68, 68, 0.08)' },
                          }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  {/* Comment Body */}
                  <Typography
                    sx={{
                      fontSize: '13.5px',
                      color: 'var(--color-slate-700)',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      mb: 1,
                    }}
                  >
                    {comment.text}
                  </Typography>

                  {/* Action Bar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Button
                      size="small"
                      startIcon={
                        comment.hasLiked ? (
                          <ThumbUpIcon sx={{ fontSize: '14px !important', color: 'var(--color-primary)' }} />
                        ) : (
                          <ThumbUpOutlinedIcon sx={{ fontSize: '14px !important' }} />
                        )
                      }
                      onClick={() => handleToggleLike(comment.id)}
                      sx={{
                        textTransform: 'none',
                        fontSize: 'var(--font-xs)',
                        fontWeight: 'var(--font-semibold)',
                        py: 0.25,
                        px: 1,
                        borderRadius: 'var(--radius-sm)',
                        minWidth: 'auto',
                        color: comment.hasLiked ? 'var(--color-primary)' : 'var(--color-slate-600)',
                        '&:hover': { bgcolor: 'rgba(0, 86, 179, 0.06)' },
                      }}
                    >
                      {comment.likes > 0 ? comment.likes : language === 'en' ? 'Like' : 'पसंद'}
                    </Button>

                    <Button
                      size="small"
                      startIcon={<ReplyOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                      onClick={() => {
                        setReplyingToId(isReplying ? null : comment.id);
                        setReplyText('');
                      }}
                      sx={{
                        textTransform: 'none',
                        fontSize: 'var(--font-xs)',
                        fontWeight: 'var(--font-semibold)',
                        py: 0.25,
                        px: 1,
                        borderRadius: 'var(--radius-sm)',
                        minWidth: 'auto',
                        color: 'var(--color-slate-600)',
                        '&:hover': { color: 'var(--color-primary)', bgcolor: 'rgba(0, 86, 179, 0.06)' },
                      }}
                    >
                      {language === 'en' ? 'Reply' : 'उत्तर दें'}
                    </Button>
                  </Box>

                  {/* Inline Reply Form */}
                  {isReplying && (
                    <Box sx={{ mt: 1.5, pl: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={1}
                        maxRows={4}
                        placeholder={
                          language === 'en' ? `Reply to ${comment.userName}...` : `${comment.userName} को उत्तर दें...`
                        }
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--glass-bg)',
                            backdropFilter: 'blur(30px)',
                            WebkitBackdropFilter: 'blur(30px)',
                            fontSize: 'var(--font-sm)',
                            color: 'var(--input-text)',
                            fontFamily: 'inherit',
                            boxShadow: 'none !important',
                            transition: 'border-color var(--transition-base)',
                            '& fieldset': {
                              borderColor: 'var(--card-border)',
                              borderWidth: 'var(--border-thin)',
                              boxShadow: 'none !important',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(30, 79, 163, 0.4)',
                              boxShadow: 'none !important',
                            },
                            '&.Mui-focused': {
                              boxShadow: 'none !important',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'var(--color-primary)',
                              borderWidth: 'var(--border-thin)',
                              boxShadow: 'none !important',
                            },
                          },
                          '& .MuiInputBase-input': {
                            p: 0,
                            m: 0,
                            color: 'var(--input-text)',
                            fontSize: 'var(--font-sm)',
                            lineHeight: 'var(--line-height-base, 1.5)',
                            fontFamily: 'inherit',
                            '&::placeholder': {
                              color: 'var(--input-placeholder)',
                              opacity: 1,
                            },
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                        <TarangButton
                          variant="outlined"
                          size="sm"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyText('');
                          }}
                          sx={{
                            borderRadius: 'var(--radius-sm)',
                            minHeight: '30px',
                            fontSize: 'var(--font-xs)',
                            fontWeight: 'var(--font-medium)',
                            px: 1.5,
                          }}
                        >
                          {language === 'en' ? 'Cancel' : 'रद्द करें'}
                        </TarangButton>
                        <TarangButton
                          variant="primary"
                          size="sm"
                          disabled={!replyText.trim()}
                          onClick={() => handleAddReply(comment.id)}
                          sx={{
                            borderRadius: 'var(--radius-sm)',
                            minHeight: '30px',
                            px: 1.5,
                            fontSize: 'var(--font-xs)',
                            fontWeight: 'var(--font-semibold)',
                          }}
                        >
                          {language === 'en' ? 'Post Reply' : 'उत्तर पोस्ट करें'}
                        </TarangButton>
                      </Box>
                    </Box>
                  )}

                  {/* Nested Replies List */}
                  {comment.replies && comment.replies.length > 0 && (
                    <Box
                      sx={{
                        mt: 1.5,
                        pl: 2,
                        borderLeft: 'var(--border-thin) solid var(--card-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.25,
                      }}
                    >
                      {comment.replies.map((reply) => (
                        <Box key={reply.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                          <Avatar
                            src={reply.userAvatar || ''}
                            alt={reply.userName}
                            sx={{
                              width: 26,
                              height: 26,
                              bgcolor:
                                reply.userRole === 'instructor'
                                  ? 'var(--color-success)'
                                  : 'var(--color-primary)',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            {(reply.userName || 'U').charAt(0).toUpperCase()}
                          </Avatar>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                              <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                                {reply.userName}
                              </Typography>
                              {reply.userRole === 'instructor' && (
                                <Chip
                                  label={language === 'en' ? 'Instructor' : 'प्रशिक्षक'}
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    bgcolor: 'rgba(40, 167, 69, 0.1)',
                                    color: 'var(--color-success)',
                                  }}
                                />
                              )}
                              <Typography sx={{ fontSize: '10.5px', color: 'var(--color-slate-400)' }}>
                                • {formatTimeAgo(reply.createdAt, language)}
                              </Typography>

                              {reply.isCurrentUser && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                  sx={{
                                    ml: 'auto',
                                    p: 0.25,
                                    color: 'var(--color-slate-400)',
                                    '&:hover': { color: 'var(--color-error)' },
                                  }}
                                >
                                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              )}
                            </Box>

                            <Typography
                              sx={{
                                fontSize: '12.5px',
                                color: 'var(--color-slate-700)',
                                lineHeight: 1.4,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                              }}
                            >
                              {reply.text}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Button
                                size="small"
                                startIcon={
                                  reply.hasLiked ? (
                                    <ThumbUpIcon sx={{ fontSize: '12px !important', color: 'var(--color-primary)' }} />
                                  ) : (
                                    <ThumbUpOutlinedIcon sx={{ fontSize: '12px !important' }} />
                                  )
                                }
                                onClick={() => handleToggleLike(reply.id, true, comment.id)}
                                sx={{
                                  textTransform: 'none',
                                  fontSize: 'var(--font-xs)',
                                  py: 0.1,
                                  px: 0.75,
                                  borderRadius: 'var(--radius-sm)',
                                  minWidth: 'auto',
                                  color: reply.hasLiked ? 'var(--color-primary)' : 'var(--color-slate-600)',
                                  '&:hover': { bgcolor: 'rgba(0, 86, 179, 0.06)' },
                                }}
                              >
                                {reply.likes > 0 ? reply.likes : language === 'en' ? 'Like' : 'पसंद'}
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  </Box>
);
}
