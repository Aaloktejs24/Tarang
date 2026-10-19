"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import ScienceIcon from '@mui/icons-material/Science';
import LinkIcon from '@mui/icons-material/Link';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FolderSpecialOutlinedIcon from '@mui/icons-material/FolderSpecialOutlined';
import { containedScrollSx, noOverscrollSx } from '../../../styles/commonStyles';

const formatFolderTitle = (title) => {
  if (!title) return '';
  return title.replace(/^(?:प्रकरण|मॉड्यूल|उप-प्रकरण|Topic|Module|Sub-topic)\s*[\d.]*[:\s-]*/i, '').trim() || title;
};

const getFileMeta = (type) => {
  const iconColor = 'var(--theme-blue)';
  switch (type) {
    case 'video':
      return {
        icon: <PlayCircleIcon sx={{ fontSize: 24, color: iconColor, flexShrink: 0 }} />,
        badgeText: 'MP4',
        labelEn: 'Video Lecture',
        labelHi: 'वीडियो व्याख्यान',
      };
    case 'audio':
      return {
        icon: <AudioFileIcon sx={{ fontSize: 24, color: iconColor, flexShrink: 0 }} />,
        badgeText: 'MP3',
        labelEn: 'Audio Track',
        labelHi: 'ऑडियो',
      };
    case 'document':
      return {
        icon: <PictureAsPdfIcon sx={{ fontSize: 24, color: iconColor, flexShrink: 0 }} />,
        badgeText: 'PDF',
        labelEn: 'Document',
        labelHi: 'दस्तावेज़',
      };
    case 'article':
      return {
        icon: <ArticleIcon sx={{ fontSize: 24, color: iconColor, flexShrink: 0 }} />,
        badgeText: 'DOC',
        labelEn: 'Notes / Article',
        labelHi: 'नोट्स',
      };
    case 'assignment':
      return {
        icon: <AssignmentIcon sx={{ fontSize: 24, color: iconColor, flexShrink: 0 }} />,
        badgeText: 'TASK',
        labelEn: 'Assignment',
        labelHi: 'असाइनमेंट',
      };
    case 'quiz':
      return {
        icon: <QuizIcon sx={{ fontSize: 24, color: iconColor, flexShrink: 0 }} />,
        badgeText: 'QUIZ',
        labelEn: 'Quiz',
        labelHi: 'प्रश्नोत्तरी',
      };
    case 'lab':
      return {
        icon: <ScienceIcon sx={{ fontSize: 24, color: iconColor, flexShrink: 0 }} />,
        badgeText: 'LAB',
        labelEn: 'Lab',
        labelHi: 'लैब',
      };
    case 'link':
      return {
        icon: <LinkIcon sx={{ fontSize: 24, color: iconColor, flexShrink: 0 }} />,
        badgeText: 'URL',
        labelEn: 'Link',
        labelHi: 'लिंक',
      };
    default:
      return {
        icon: <DescriptionIcon sx={{ fontSize: 24, color: iconColor, flexShrink: 0 }} />,
        badgeText: 'FILE',
        labelEn: 'File',
        labelHi: 'फ़ाइल',
      };
  }
};

export default function TopicResources({
  activeTopic,
  activeNode,
  onSelectContent,
  language = 'en',
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const activeItemRef = useRef(null);

  // Check if activeTopic actually has playable/viewable media
  const hasActiveMedia = Boolean(activeTopic?.url || activeTopic?.video_url || activeTopic?.document_url);
  const activeMediaId = hasActiveMedia ? (activeTopic?.id || 'current_active_topic') : null;

  // Manage focused item state (can be cleared by user click or when empty)
  const [focusedId, setFocusedId] = useState(activeMediaId);

  // When active topic changes, update focusedId (or clear it if topic has no media)
  useEffect(() => {
    setFocusedId(activeMediaId);
  }, [activeMediaId]);

  // Extract all content: files, docs, audio, videos, and folders in fixed, stable order
  const allContentItems = useMemo(() => {
    const baseNode = activeNode || activeTopic;
    if (!baseNode) return [];

    const items = [];
    const seenIds = new Set();
    const seenUrls = new Set();

    const pushItem = (itemData) => {
      if (!itemData) return;
      const keyId = itemData.id;
      const keyUrl = itemData.url || itemData.video_url || itemData.document_url;
      if (keyId && seenIds.has(keyId)) return;
      if (keyUrl && seenUrls.has(keyUrl)) return;

      if (keyId) seenIds.add(keyId);
      if (keyUrl) seenUrls.add(keyUrl);

      items.push(itemData);
    };

    // 1. Primary Video/Media of this topic (from baseNode)
    const videoUrl = baseNode.video_url || (baseNode.type === 'video' ? (baseNode.url || '') : '');
    const isJsonMeta = videoUrl && videoUrl.startsWith('JSON:');
    if (videoUrl && !isJsonMeta) {
      pushItem({
        id: baseNode.id,
        title: formatFolderTitle(baseNode.title) || (language === 'en' ? 'Lecture Video.mp4' : 'व्याख्यान वीडियो.mp4'),
        description: baseNode.description || (language === 'en' ? 'Video Lecture' : 'वीडियो व्याख्यान'),
        type: 'video',
        url: videoUrl,
        thumbnail: baseNode.thumbnail,
        rawItem: baseNode,
        isFolder: false,
      });
    }

    // 2. Subtopics / Folders (children under baseNode)
    if (baseNode?.children && Array.isArray(baseNode.children)) {
      baseNode.children.forEach((child) => {
        const count = (child.items ? child.items.length : 0) + (child.children ? child.children.length : 0);
        pushItem({
          id: child.id,
          title: formatFolderTitle(child.title) || (language === 'en' ? 'Subtopic' : 'उप-प्रकरण'),
          description: child.description || (count > 0 ? `${count} ${language === 'en' ? (count === 1 ? 'item' : 'items') : 'आइटम'}` : (language === 'en' ? 'Folder' : 'फ़ोल्डर')),
          type: 'folder',
          itemCount: count,
          rawItem: (child.items && child.items.length > 0) ? child.items[0] : child,
          isFolder: true,
        });
      });
    }

    // 3. Items from baseNode.items (other videos, docs, audios, tasks)
    if (baseNode?.items && Array.isArray(baseNode.items)) {
      baseNode.items.forEach((item) => {
        const itemType = item.type || (item.video_url ? 'video' : (item.document_url ? 'document' : 'document'));
        pushItem({
          id: item.id,
          title: formatFolderTitle(item.title) || (language === 'en' ? 'Resource' : 'सामग्री'),
          description: item.description || '',
          type: itemType,
          url: item.url || item.video_url || item.document_url || '',
          thumbnail: item.thumbnail,
          rawItem: item,
          isFolder: false,
        });
      });
    }

    // 4. Direct document_url attached on baseNode
    if (baseNode?.document_url) {
      pushItem({
        id: `${baseNode.id}_node_doc`,
        title: language === 'en' ? 'Lecture Notes & Material.pdf' : 'विषय अध्ययन सामग्री व नोट्स.pdf',
        description: language === 'en' ? 'Reference PDF document' : 'संदर्भ पीडीएफ दस्तावेज़',
        type: 'document',
        url: baseNode.document_url,
        rawItem: {
          id: `${baseNode.id}_node_doc`,
          title: language === 'en' ? 'Lecture Notes & Material.pdf' : 'विषय अध्ययन सामग्री व नोट्स.pdf',
          type: 'document',
          url: baseNode.document_url,
        },
        isFolder: false,
      });
    }

    // 5. Extra resources array on baseNode
    if (baseNode?.resources && Array.isArray(baseNode.resources)) {
      baseNode.resources.forEach((res, idx) => {
        pushItem({
          id: res.id || `res_${idx}`,
          title: formatFolderTitle(res.title) || (language === 'en' ? 'Attachment' : 'संलग्नक'),
          description: res.description || '',
          type: res.type || 'document',
          url: res.url || '',
          rawItem: res,
          isFolder: false,
        });
      });
    }

    // 6. Dummy files and audio if not already provided
    const hasAudio = items.some((it) => it.type === 'audio');
    const hasDoc = items.some((it) => it.type === 'document');
    const hasArticle = items.some((it) => it.type === 'article');

    if (!hasAudio) {
      pushItem({
        id: `dummy_audio_${baseNode.id || 'default'}`,
        title: language === 'en' ? 'Lecture Audio Summary.mp3' : 'व्याख्यान ऑडियो सारांश.mp3',
        description: language === 'en' ? 'Audio Overview' : 'ऑडियो सारांश',
        type: 'audio',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        rawItem: {
          id: `dummy_audio_${baseNode.id || 'default'}`,
          title: language === 'en' ? 'Lecture Audio Summary.mp3' : 'व्याख्यान ऑडियो सारांश.mp3',
          description: language === 'en' ? 'Audio Overview' : 'ऑडियो सारांश',
          type: 'audio',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        },
        isFolder: false,
      });
    }

    if (!hasDoc) {
      pushItem({
        id: `dummy_doc_${baseNode.id || 'default'}`,
        title: language === 'en' ? 'Lecture Notes & Material.pdf' : 'विषय अध्ययन नोट्स.pdf',
        description: language === 'en' ? 'Reference PDF Document' : 'संदर्भ पीडीएफ दस्तावेज़',
        type: 'document',
        url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
        rawItem: {
          id: `dummy_doc_${baseNode.id || 'default'}`,
          title: language === 'en' ? 'Lecture Notes & Material.pdf' : 'विषय अध्ययन नोट्स.pdf',
          description: language === 'en' ? 'Reference PDF Document' : 'संदर्भ पीडीएफ दस्तावेज़',
          type: 'document',
          url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
        },
        isFolder: false,
      });
    }

    if (!hasArticle) {
      pushItem({
        id: `dummy_article_${baseNode.id || 'default'}`,
        title: language === 'en' ? 'Practice Questions & Solutions.docx' : 'अभ्यास प्रश्न व समाधान.docx',
        description: language === 'en' ? 'Study Guide' : 'अध्ययन गाइड',
        type: 'article',
        url: '',
        rawItem: {
          id: `dummy_article_${baseNode.id || 'default'}`,
          title: language === 'en' ? 'Practice Questions & Solutions.docx' : 'अभ्यास प्रश्न व समाधान.docx',
          description: language === 'en' ? 'Study Guide' : 'अध्ययन गाइड',
          type: 'article',
          url: '',
        },
        isFolder: false,
      });
    }

    return items;
    // Base items belong to the topic node and remain fixed when selecting different media
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNode?.id, language]);

  const handleCardClick = (item) => {
    if (focusedId === item.id) {
      // Toggle focus off when clicking an already focused card
      setFocusedId(null);
    } else {
      setFocusedId(item.id);
      // If clicking a folder, keep playing whatever content is currently playing (no change)
      if (item.isFolder || item.type === 'folder') {
        return;
      }
      if (onSelectContent) {
        onSelectContent(item.rawItem || item);
      }
    }
  };

  const totalItems = allContentItems.length;

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
        ...noOverscrollSx,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <FolderSpecialOutlinedIcon sx={{ fontSize: 22, color: 'var(--theme-blue)', flexShrink: 0 }} />
          <Typography
            sx={{
              fontSize: { xs: '15px', sm: '16px' },
              fontWeight: 700,
              color: 'var(--color-slate-900)',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {language === 'en' ? 'Resources' : 'संसाधन'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Chip
            label={`${totalItems} ${language === 'en' ? (totalItems === 1 ? 'item' : 'items') : 'आइटम'}`}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '11.5px',
              bgcolor: totalItems > 0 ? 'rgba(0, 86, 179, 0.08)' : 'var(--color-slate-100)',
              color: totalItems > 0 ? 'var(--theme-blue)' : 'var(--color-slate-500)',
              border: 'var(--border-thin) solid',
              borderColor: totalItems > 0 ? 'rgba(0, 86, 179, 0.2)' : 'var(--color-slate-200)',
            }}
          />

          {totalItems > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: 'var(--border-thin) solid var(--card-border)',
                borderRadius: 'var(--radius-sm, 4px)',
                bgcolor: 'transparent',
                p: '1px',
              }}
            >
              <IconButton
                size="small"
                disableRipple
                onClick={() => setViewMode('grid')}
                title={language === 'en' ? 'Grid view' : 'ग्रिड दृश्य'}
                sx={{
                  p: '3px',
                  borderRadius: 'var(--radius-sm, 4px)',
                  bgcolor: 'transparent',
                  color: viewMode === 'grid' ? 'var(--theme-blue)' : 'var(--color-slate-400)',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'transparent',
                  },
                }}
              >
                <GridViewIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                size="small"
                disableRipple
                onClick={() => setViewMode('list')}
                title={language === 'en' ? 'List view' : 'सूची दृश्य'}
                sx={{
                  p: '3px',
                  borderRadius: 'var(--radius-sm, 4px)',
                  bgcolor: 'transparent',
                  color: viewMode === 'list' ? 'var(--theme-blue)' : 'var(--color-slate-400)',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'transparent',
                  },
                }}
              >
                <ViewListIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>

      {/* Details Area */}
      <Box
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setFocusedId(null);
          }
        }}
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          flex: 1,
          minHeight: 0,
          ...containedScrollSx,
        }}
      >
        {totalItems === 0 ? (
          /* Compact Empty State */
          <Box
            sx={{
              py: 2.5,
              px: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              bgcolor: 'rgba(248, 250, 252, 0.5)',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px dashed var(--color-slate-300)',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                bgcolor: 'rgba(0, 86, 179, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <FolderOpenIcon sx={{ fontSize: 24, color: 'var(--theme-blue)' }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-slate-800)', mb: 0.25 }}>
              {language === 'en' ? 'No items available' : 'कोई सामग्री उपलब्ध नहीं है'}
            </Typography>
            <Typography sx={{ fontSize: '11.5px', color: 'var(--color-slate-500)', maxWidth: 260, lineHeight: 1.3 }}>
              {language === 'en'
                ? 'No additional files, media, or subfolders for this topic.'
                : 'इस विषय के लिए कोई अतिरिक्त फ़ाइल, मीडिया या उप-फ़ोल्डर नहीं है।'}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(140px, 1fr))' : '1fr',
              gap: 1,
            }}
          >
            {allContentItems.map((item) => {
              const isItemFocused = Boolean(focusedId && focusedId === item.id);
              const meta = item.isFolder
                ? {
                    icon: (
                      <FolderIcon
                        sx={{
                          fontSize: 24,
                          color: 'var(--theme-blue)',
                          flexShrink: 0,
                        }}
                      />
                    ),
                    labelEn: 'Folder',
                    labelHi: 'फ़ोल्डर',
                  }
                : getFileMeta(item.type);

              return (
                <Box
                  key={item.id}
                  ref={isItemFocused ? activeItemRef : null}
                  onClick={() => handleCardClick(item)}
                  sx={{
                    p: 1.25,
                    borderRadius: 'var(--radius-md, 8px)',
                    border: 'var(--border-thin) solid',
                    borderColor: isItemFocused ? 'var(--theme-blue)' : 'var(--card-border)',
                    borderWidth: 'var(--border-thin)',
                    bgcolor: isItemFocused ? 'rgba(0, 86, 179, 0.06)' : 'var(--color-slate-50, #f8fafc)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    boxShadow: 'none',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, background-color 0.15s ease',
                    '&:hover': {
                      borderColor: isItemFocused ? 'var(--theme-blue)' : 'rgba(0, 86, 179, 0.45)',
                      borderWidth: 'var(--border-thin)',
                      outline: 'none',
                      boxShadow: 'none',
                    },
                  }}
                >
                  <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {meta.icon}
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography
                        sx={{
                          fontSize: '12px',
                          fontWeight: isItemFocused ? 700 : 600,
                          color: isItemFocused ? 'var(--theme-blue)' : 'var(--color-slate-900)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                        title={item.title}
                      >
                        {item.title}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5, mt: 0.25 }}>
                      <Typography
                        sx={{
                          fontSize: '10px',
                          color: isItemFocused ? 'var(--theme-blue)' : 'var(--color-slate-500)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {item.description || (language === 'en' ? meta.labelEn : meta.labelHi)}
                      </Typography>
                    </Box>
                  </Box>

                  {item.url && item.url.startsWith('http') && !isItemFocused && (
                    <Tooltip title={language === 'en' ? 'Open in new tab' : 'नए टैब में खोलें'}>
                      <IconButton
                        size="small"
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        sx={{ p: 0.5, color: 'var(--color-slate-400)', '&:hover': { color: 'var(--theme-blue)' } }}
                      >
                        <OpenInNewIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
