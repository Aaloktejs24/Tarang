"use client";
import React, { useState } from 'react';
import { Box, Typography, IconButton, Chip, Collapse, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import LinkIcon from '@mui/icons-material/Link';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AudioFileOutlinedIcon from '@mui/icons-material/AudioFileOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import InlineContentBuilder from './InlineContentBuilder';
import ContentModal from './ContentModal';
import { useAccessibility } from '../../../contexts/AccessibilityContext';
import { CustomAccordion, CustomAccordionSummary, CustomAccordionDetails } from '../../../components/common/CustomAccordion';
import EmptyState from '../../../components/ui/EmptyState';

const getItemIcon = (type) => {
  switch (type) {
    case 'video': return <OndemandVideoIcon sx={{ fontSize: 20, color: 'var(--theme-blue)' }} />;
    case 'audio': return <AudioFileOutlinedIcon sx={{ fontSize: 20, color: 'var(--theme-purple)' }} />;
    case 'document': return <PictureAsPdfIcon sx={{ fontSize: 20, color: 'var(--theme-green)' }} />;
    case 'article': return <ArticleOutlinedIcon sx={{ fontSize: 20, color: 'var(--color-slate-600)' }} />;
    case 'assignment': return <AssignmentOutlinedIcon sx={{ fontSize: 20, color: 'var(--theme-orange)' }} />;
    case 'quiz': return <QuizOutlinedIcon sx={{ fontSize: 20, color: 'var(--theme-red)' }} />;
    case 'lab': return <ScienceOutlinedIcon sx={{ fontSize: 20, color: 'var(--theme-teal)' }} />;
    case 'link': return <LinkIcon sx={{ fontSize: 20, color: 'var(--theme-purple)' }} />;
    default: return <DescriptionOutlinedIcon sx={{ fontSize: 20, color: 'var(--color-slate-500)' }} />;
  }
};

export default function CurriculumViewer({ modules, isManagement, onAddContent }) {
  const { language } = useAccessibility();
  // By default expand the first module if it exists
  const [expandedNodes, setExpandedNodes] = useState(
    modules && modules.length > 0 ? { [modules[0].id]: true } : {}
  );
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleSaveContent = (nodeId, newItem) => {
    if (onAddContent) {
      onAddContent(nodeId, newItem);
      // Ensure the node is expanded after adding content
      setExpandedNodes(prev => ({ ...prev, [nodeId]: true }));
    }
  };

  const renderItems = (items) => {
    if (!items || items.length === 0) return null;
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
        {items.map((item, idx) => (
          <Box 
            key={idx} 
            onClick={() => {
              setSelectedItem(item);
              setIsModalOpen(true);
            }}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: { xs: 1.5, sm: 2.25 },
              height: '64px',
              borderRadius: 'var(--radius-lg)',
              border: 'var(--border-thin) solid var(--card-border)',
              bgcolor: 'var(--card-bg)',
              backdropFilter: 'var(--card-blur)',
              transition: 'transform 0.2s ease-in-out',
              cursor: 'pointer',
              '&:hover': { 
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                {getItemIcon(item.type)}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-slate-900)' }}>
                  {item.title}
                </Typography>
                {item.duration && (
                  <Typography sx={{ fontSize: '12px', color: 'var(--color-slate-500)' }}>
                    {item.duration}
                  </Typography>
                )}
              </Box>
            </Box>
            {isManagement && (
              <Chip label={language === 'en' ? 'Manage' : 'प्रबंधित करें'} size="small" variant="outlined" sx={{ fontSize: '10px', height: 20 }} />
            )}
          </Box>
        ))}
      </Box>
    );
  };

  const renderNode = (node, depth = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const isModuleLevel = depth === 0;
    
    const hasItems = node.items && node.items.length > 0;
    const hasChildren = node.children && node.children.length > 0;
    // For viewers, if a node has content and no children, make it directly playable instead of expandable
    const isDirectlyPlayable = !isManagement && hasItems && !hasChildren;

    return (
      <Box key={node.id} sx={{ position: 'relative', mb: depth === 0 ? 1.5 : 0 }}>
        <CustomAccordion
          expanded={isDirectlyPlayable ? false : isExpanded}
          onChange={() => {
            if (isDirectlyPlayable) {
              setSelectedItem(node.items[0]);
              setIsModalOpen(true);
            } else {
              toggleNode(node.id);
            }
          }}
          sx={{
            margin: '0 !important',
            '&.Mui-expanded': { margin: '0 !important' },
            backgroundColor: depth > 0 ? 'transparent' : 'var(--card-bg)',
          }}
        >
          <CustomAccordionSummary
            expandIcon={isDirectlyPlayable ? getItemIcon(node.items[0].type) : <ExpandMoreIcon sx={{ color: 'var(--color-primary)' }} />}
            disableRipple
            sx={{
              px: { xs: 1.5, sm: 2.25 },
              py: 0,
              height: '64px',
              minHeight: '64px',
              borderBottom: 'none',
              '&&, &&:focus, &&:hover, &&:active, &&.Mui-expanded, &&.Mui-focusVisible': {
                background: depth > 0 ? 'transparent' : 'rgba(0, 86, 179, 0.04)',
                backgroundColor: depth > 0 ? 'transparent' : 'rgba(0, 86, 179, 0.04)',
              },
              '& .MuiAccordionSummary-content': {
                my: 0,
                minWidth: 0,
                '&.Mui-expanded': { m: 0 }
              }
            }}
          >
            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', fontSize: depth === 0 ? 'var(--font-base)' : 'var(--font-sm)' }}>
                  {node.title || (depth === 0 ? 'Untitled Module' : 'Untitled Topic')}
                </Typography>
              </Box>
              {(node.start_date || node.end_date) && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                  {node.start_date && (
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-slate-500)', fontWeight: 500 }}>
                      {new Date(node.start_date).toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Typography>
                  )}
                  {node.start_date && node.end_date && (
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-slate-400)', fontWeight: 400 }}>-</Typography>
                  )}
                  {node.end_date && (
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-slate-500)', fontWeight: 500 }}>
                      {new Date(node.end_date).toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </CustomAccordionSummary>

          <CustomAccordionDetails
            sx={{
              pt: 2, pb: 2,
              pl: { xs: 2, sm: '60px' },
              pr: { xs: 2, sm: 3 },
              display: 'flex', flexDirection: 'column', gap: 1,
              backgroundColor: 'transparent',
              borderBottomLeftRadius: 'var(--radius-lg)',
              borderBottomRightRadius: 'var(--radius-lg)'
            }}
          >
            {node.description && (
              <Typography sx={{ fontSize: '13px', color: 'var(--color-slate-600)' }}>
                {node.description}
              </Typography>
            )}

            {isManagement ? (
              <InlineContentBuilder
                initialData={node.items && node.items.length > 0 ? node.items[0] : null}
                onSave={(newItem) => handleSaveContent(node.id, newItem)}
                onCancel={() => { }}
              />
            ) : (
              renderItems(node.items)
            )}

            {node.children && node.children.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {node.children.map(child => renderNode(child, depth + 1))}
              </Box>
            )}
          </CustomAccordionDetails>
        </CustomAccordion>
      </Box>
    );
  };

  if (!modules || modules.length === 0) {
    return (
      <EmptyState
        title={language === 'en' ? "No Curriculum Created" : "कोई पाठ्यक्रम नहीं बनाया गया"}
        subtitle={language === 'en' ? "Modules and topics will appear here once they are added." : "एक बार जोड़े जाने के बाद मॉड्यूल और विषय यहां दिखाई देंगे।"}
      />
    );
  }

  return (
    <Box>
      {modules.map(module => renderNode(module, 0))}
      <ContentModal 
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        language={language}
      />
    </Box>
  );
}
