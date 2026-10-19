"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, CircularProgress, IconButton, Paper, Divider, Chip, Skeleton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TarangVideoPlayer from '../../components/viewer/TarangVideoPlayer';
import { CustomAccordion, CustomAccordionSummary, CustomAccordionDetails } from '../../components/common/Accordion';
import EmptyMediaState from '../../components/ui/EmptyMediaState';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AudioFileOutlinedIcon from '@mui/icons-material/AudioFileOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import LinkIcon from '@mui/icons-material/Link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import GroupIcon from '@mui/icons-material/Group';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { lmsService } from './lmsService';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppRouter as useRouter } from '../../hooks/useAppRouter';
import { apiClient } from '../../lib/apiClient';
import PremiumCard from '../../components/ui/GlassCard';
import TarangButton from '../../components/common/TarangButton';
import { useBreadcrumbs } from '../../contexts/BreadcrumbContext';
import Loader from '../../components/common/Loader';
import ShakaPlayer from '../../components/viewer/ShakaPlayer';
import TopicResources from './components/TopicResources';
import TopicComments from './components/TopicComments';
import { noOverscrollSx, containedScrollSx, fixedViewportLayoutSx } from '../../styles/commonStyles';

const getItemIcon = (type) => {
  switch (type) {
    case 'video': return <PlayCircleOutlineIcon sx={{ fontSize: 20, color: 'var(--theme-blue)' }} />;
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

export default function CourseAccessDashboard({ courseId }) {
  const { language } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [signedUrl, setSignedUrl] = useState('');
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  useBreadcrumbs([
    { labelEn: 'Courses', labelHi: 'पाठ्यक्रम', onClick: () => router.back() },
    { labelEn: course?.title || 'Course Player', labelHi: course?.title || 'पाठ्यक्रम प्लेयर' }
  ]);

  useEffect(() => {
    let isMounted = true;
    const fetchCourse = async () => {
      try {
        const data = await lmsService.getCourse(courseId);

        // Asynchronously hydrate and filter the tree
        const hydrateTree = async (nodes) => {
          if (!nodes) return [];
          const hydrated = [];

          for (const node of nodes) {
            let items = node.items || [];

            // Legacy conversion
            if (items.length === 0 && (node.video_url || node.document_url)) {
              let parsedMeta = null;
              if (node.video_url && node.video_url.startsWith("JSON:")) {
                try { parsedMeta = JSON.parse(node.video_url.slice(5)); } catch (e) { }
              }
              items = [{
                id: `${node.id}_media`,
                title: parsedMeta?.title || node.title,
                description: parsedMeta?.description || node.description,
                type: parsedMeta?.type || (node.video_url ? 'video' : 'document'),
                url: parsedMeta?.url || node.video_url || node.document_url,
                thumbnail: parsedMeta?.thumbnail
              }];
            }

            const validItems = items;
            let validChildren = [];
            if (node.children && node.children.length > 0) {
              validChildren = await hydrateTree(node.children);
            }

            hydrated.push({
              ...node,
              items: validItems,
              children: validChildren
            });
          }
          return hydrated;
        };

        if (data?.modules) {
          data.modules = await hydrateTree(data.modules);
        }

        if (!isMounted) return;
        setCourse(data);

        // Auto-select previously active topic from URL query params
        if (data?.modules?.length > 0) {
          const urlParams = new URLSearchParams(window.location.search);
          const savedTopicId = urlParams.get('topic');

          let foundTopic = null;
          let expandedState = {};

          const findTopic = (nodes, parentIds = []) => {
            for (const node of nodes) {
              const currentPath = [...parentIds, node.id];
              if (node.items) {
                const item = node.items.find(i => i.id === savedTopicId);
                if (item) {
                  foundTopic = item;
                  currentPath.forEach(id => { expandedState[id] = true; });
                  return true;
                }
              }
              if (node.children && findTopic(node.children, currentPath)) return true;
            }
            return false;
          };

          if (savedTopicId) {
            findTopic(data.modules);
          }

          setActiveTopic(foundTopic);
          setExpandedNodes(expandedState);
        }
      } catch (error) {
        console.error('Failed to fetch course details:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (courseId) fetchCourse();
    return () => { isMounted = false; };
  }, [courseId]);

  useEffect(() => {
    let isMounted = true;
    const fetchSignedUrl = async () => {
      if (!activeTopic) {
        setSignedUrl('');
        return;
      }

      let rawUrl = '';
      const isVid = activeTopic.type === 'video' || (!activeTopic.type && activeTopic.video_url);
      const isDoc = activeTopic.type === 'document' || (!activeTopic.type && activeTopic.document_url);

      if (isVid && activeTopic.video_url) rawUrl = activeTopic.video_url;
      else if (isDoc && activeTopic.document_url) rawUrl = activeTopic.document_url;
      else rawUrl = activeTopic.url || activeTopic.video_url || activeTopic.document_url;
      if (!rawUrl) {
        setSignedUrl('');
        return;
      }

      // Processed media (HLS/DASH streams, processed docs) are in public buckets and should not be signed
      const isPublicStream = rawUrl.includes('tarang-media-processed') ||
        rawUrl.includes('tarang-docs-processed') ||
        rawUrl.includes('.mpd') ||
        rawUrl.includes('.m3u8');

      if (['link', 'article'].includes(activeTopic.type) || !rawUrl.includes('tarang-') || isPublicStream) {
        setSignedUrl(rawUrl);
        return;
      }

      try {
        const baseUrl = rawUrl.split('?')[0];
        const response = await apiClient.get('/s3/get', { params: { url: baseUrl } });
        if (isMounted && response.data?.signed_url) {
          setSignedUrl(response.data.signed_url);
        } else {
          if (isMounted) setSignedUrl(rawUrl);
        }
      } catch (err) {
        console.error("Error signing URL:", err);
        if (isMounted) setSignedUrl(rawUrl);
      }
    };
    fetchSignedUrl();
    return () => { isMounted = false; };
  }, [activeTopic]);

  const handleTopicClick = (topic) => {
    setActiveTopic(topic);
    if (topic && topic.id && !String(topic.id).startsWith('dummy_')) {
      router.replace(window.location.pathname + `?topic=${topic.id}`, { scroll: false });
    }
  };

  const matchedNode = React.useMemo(() => {
    if (!course?.modules || !activeTopic) return null;
    const findNode = (nodes) => {
      for (const node of nodes) {
        if (node.id === activeTopic.id) return node;
        if (node.items && node.items.some((item) => item.id === activeTopic.id)) return node;
        if (node.children) {
          const res = findNode(node.children);
          if (res) return res;
        }
      }
      return null;
    };
    return findNode(course.modules);
  }, [course, activeTopic]);

  const [lastActiveNode, setLastActiveNode] = useState(null);

  useEffect(() => {
    if (matchedNode) {
      setLastActiveNode(matchedNode);
    }
  }, [matchedNode]);

  const activeNode = matchedNode || lastActiveNode;

  if (loading) {
    return (
      <Box sx={{
        ...fixedViewportLayoutSx,
        pt: { xs: 2, md: 2 },
        pb: { xs: 2, md: 2 },
        zIndex: 1,
      }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 10 }, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch', gap: 2, flex: 1, height: '100%', minHeight: 0 }}>

            {/* Left Sidebar Skeleton */}
            <PremiumCard sx={{ width: { xs: '100%', md: 320, lg: 360 }, height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, p: 0, ...noOverscrollSx }}>
              <Box sx={{ p: 2.5, borderBottom: 'var(--border-thin) solid var(--card-border)' }}>
                <Skeleton variant="text" width="80%" height={32} />
              </Box>
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} variant="rectangular" width="100%" height={64} sx={{ borderRadius: 'var(--radius-md)' }} />
                ))}
              </Box>
            </PremiumCard>

            {/* Right Content Area Skeleton */}
            <PremiumCard sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 0, height: '100%', minHeight: 0, ...noOverscrollSx }}>
              {/* Video Player Skeleton (Black Box with White Spinner) */}
              <Box sx={{ width: '100%', aspectRatio: '16/9', bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: '#ffffff' }} size={48} thickness={4} />
              </Box>

              {/* Title & Description Skeleton */}
              <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                <Skeleton variant="text" width="50%" height={48} sx={{ mb: 1, borderRadius: 2 }} />
                <Box sx={{ mt: 2 }}>
                  <Skeleton variant="text" width="90%" height={20} />
                  <Skeleton variant="text" width="85%" height={20} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Box>
              </Box>
            </PremiumCard>

          </Box>
        </Container>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {language === 'en' ? 'Course not found or you do not have access.' : 'पाठ्यक्रम नहीं मिला या आपके पास पहुँच नहीं है।'}
        </Typography>
      </Box>
    );
  }

  const renderItems = (items) => {
    // Legacy: no longer used since items are rendered directly as nodes
    return null;
  };

  const renderNode = (node, depth = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasItems = node.items && node.items.length > 0;
    const hasChildren = node.children && node.children.length > 0;

    const hasContentToExpand = hasChildren; // We only expand to show children now
    const isLegacyLeaf = !hasChildren && !hasItems && (node.video_url || node.document_url);

    // Determine if this node is currently active in the viewer
    let isActive = false;
    if (activeTopic) {
      if (hasItems && activeTopic.id === node.items[0].id) isActive = true;
      else if (activeTopic.id === node.id) isActive = true;
    }

    return (
      <Box key={node.id} sx={{ position: 'relative', mb: depth === 0 ? 1.5 : 0 }}>
        <CustomAccordion
          expanded={isExpanded && hasContentToExpand}
          onChange={() => {
            // Do nothing natively, handled via IconButton
          }}
          sx={{
            margin: '0 !important',
            '&.Mui-expanded': { margin: '0 !important' },
            backgroundColor: depth > 0 ? 'transparent' : 'var(--card-bg)',
          }}
        >
          <CustomAccordionSummary
            onClick={() => {
              if (hasItems) handleTopicClick(node.items[0]);
              else handleTopicClick(node); // If no items, show overview
            }}
            disableRipple
            sx={{
              px: { xs: 1.5, sm: 2.25 },
              py: 1,
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
            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'flex-start', gap: 0.5 }}>
                <Box sx={{ width: '100%' }}>
                  <Typography sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', fontSize: depth === 0 ? 'var(--font-base)' : 'var(--font-sm)', lineHeight: 1.3 }}>
                    {hasItems ? (node.items[0].title || node.title) : (node.title || (depth === 0 ? 'Untitled Module' : 'Untitled Topic'))}
                  </Typography>
                </Box>
              </Box>

              {hasContentToExpand && (
                <Box
                  component="span"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the AccordionSummary onClick from triggering
                    toggleNode(node.id);
                  }}
                  sx={{
                    p: 0.5,
                    ml: 1,
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0, 86, 179, 0.08)' }
                  }}
                >
                  <ExpandMoreIcon sx={{ transform: isExpanded && hasContentToExpand ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
                </Box>
              )}
            </Box>
          </CustomAccordionSummary>

          {hasContentToExpand && (
            <CustomAccordionDetails
              sx={{
                pt: 0, pb: 1,
                pl: { xs: 1.5, sm: 2 },
                pr: { xs: 1.5, sm: 2 },
                display: 'flex', flexDirection: 'column', gap: 1,
                backgroundColor: 'transparent',
                borderBottomLeftRadius: 'var(--radius-lg)',
                borderBottomRightRadius: 'var(--radius-lg)'
              }}
            >
              {node.children.map(child => renderNode(child, depth + 1))}
            </CustomAccordionDetails>
          )}
        </CustomAccordion>
      </Box>
    );
  };

  return (
    <Box sx={{
      ...fixedViewportLayoutSx,
      pt: { xs: 2, md: 2 },
      pb: { xs: 2, md: 2 },
      zIndex: 1,
    }}>
      {/* Decorative Background Glows for Glassmorphism */}
      <Box sx={{
        position: 'absolute', top: '5%', right: '10%',
        width: { xs: '80vw', md: '40vw' }, height: { xs: '80vw', md: '40vw' },
        background: 'radial-gradient(circle, rgba(0, 86, 179, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', zIndex: -1, pointerEvents: 'none',
        borderRadius: '50%'
      }} />
      <Box sx={{
        position: 'absolute', bottom: '10%', left: '5%',
        width: { xs: '90vw', md: '45vw' }, height: { xs: '90vw', md: '45vw' },
        background: 'radial-gradient(circle, rgba(40, 167, 69, 0.12) 0%, transparent 70%)',
        filter: 'blur(60px)', zIndex: -1, pointerEvents: 'none',
        borderRadius: '50%'
      }} />

      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 10 }, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Main Layout */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch', gap: 2, flex: 1, height: '100%', minHeight: 0 }}>

          {/* Left Sidebar: Curriculum */}
          <PremiumCard sx={{
            width: { xs: '100%', md: 320, lg: 360 },
            height: '100%',
            minHeight: 0,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
            p: 0,
            ...noOverscrollSx,
          }}>
            <Box
              onClick={() => {
                setActiveTopic(null);
                router.replace(window.location.pathname, { scroll: false });
              }}
              sx={{
                p: 2.5,
                bgcolor: !activeTopic ? 'rgba(0, 86, 179, 0.08)' : 'rgba(0, 86, 179, 0.04)',
                borderBottom: 'var(--border-thin) solid var(--card-border)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                '&:hover': { bgcolor: 'rgba(0, 86, 179, 0.08)' }
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: !activeTopic ? 'var(--color-primary)' : 'var(--color-slate-800)' }}>
                {course.title}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, p: 2, ...containedScrollSx }}>
              {course.modules?.map(module => renderNode(module, 0))}
            </Box>
          </PremiumCard>

          {/* Right Content Area: Viewer */}
          <PremiumCard sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 0, height: '100%', minHeight: 0, ...noOverscrollSx }}>
            {activeTopic ? (
              <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>


                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ...containedScrollSx }}>
                  {(() => {
                    const type = activeTopic.type;
                    const url = signedUrl;

                    const isAudio = type === 'audio';
                    const hasMedia = activeTopic.url || activeTopic.video_url || activeTopic.document_url;

                    const isImage = type === 'image' || (hasMedia && url && (url.toLowerCase().includes('.png') || url.toLowerCase().includes('.jpg') || url.toLowerCase().includes('.jpeg') || url.toLowerCase().includes('.gif') || url.toLowerCase().includes('.webp')));
                    const isVideo = (type === 'video' || (!type && activeTopic.video_url)) && !isImage;
                    const isDocument = (type === 'document' || (!type && activeTopic.document_url)) && !isImage;
                    const isLinkBased = ['link', 'article', 'quiz', 'lab', 'assignment'].includes(type);

                    if (hasMedia && !url) {
                      return (
                        <Box sx={{ width: '100%', aspectRatio: '16/9', bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CircularProgress sx={{ color: '#ffffff' }} size={48} thickness={4} />
                        </Box>
                      );
                    }

                    if (isImage && url) {
                      return (
                        <Box sx={{ width: '100%', aspectRatio: '16/9', bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                          <img
                            src={url}
                            alt={activeTopic.title}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        </Box>
                      );
                    }

                    if (isVideo && url) {
                      return (
                        <Box sx={{
                          width: '100%',
                          aspectRatio: '16/9',
                          position: 'relative',
                          borderRadius: 0,
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          <TarangVideoPlayer
                            url={url}
                            jobId={
                              activeTopic.video_job_id ||
                              activeTopic.url?.match(/tarang-media-processed\/([^/]+)\//)?.[1] ||
                              (activeTopic.url?.includes('/streaming/') ? activeTopic.url.split('/streaming/')[1]?.split('/')[0] : '')
                            }
                            poster={activeTopic.thumbnail}
                          />
                        </Box>
                      );
                    }

                    if (isDocument && url) {
                      return (
                        <Box sx={{ width: '100%', aspectRatio: '16/9', bgcolor: 'var(--color-slate-100)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                          <iframe
                            src={`${url}#toolbar=0`}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title={activeTopic.title}
                          />
                        </Box>
                      );
                    }

                    if (isAudio && url) {
                      return (
                        <Box
                          sx={{
                            width: '100%',
                            aspectRatio: '16/9',
                            position: 'relative',
                            overflow: 'hidden',
                            flexShrink: 0,
                            bgcolor: '#0f172a',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3,
                            background: 'radial-gradient(circle at center, rgba(30, 79, 163, 0.45) 0%, #070b16 100%)',
                          }}
                        >
                          <Box
                            sx={{
                              width: { xs: 60, sm: 80 },
                              height: { xs: 60, sm: 80 },
                              borderRadius: '50%',
                              bgcolor: 'rgba(255, 255, 255, 0.08)',
                              border: '2px solid rgba(255, 255, 255, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 2,
                              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            }}
                          >
                            <AudioFileOutlinedIcon sx={{ fontSize: { xs: 30, sm: 42 }, color: '#a78bfa' }} />
                          </Box>

                          <Typography
                            sx={{
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: { xs: '15px', sm: '18px' },
                              mb: 0.5,
                              textAlign: 'center',
                              maxWidth: '85%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {activeTopic.title}
                          </Typography>
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '12px', mb: 2 }}>
                            {activeTopic.description || (language === 'en' ? 'Audio Track' : 'ऑडियो ट्रैक')}
                          </Typography>

                          <audio
                            controls
                            autoPlay
                            src={url}
                            style={{
                              width: '100%',
                              maxWidth: '460px',
                              borderRadius: '24px',
                              filter: 'invert(0.9) hue-rotate(180deg)',
                            }}
                          >
                            Your browser does not support the audio element.
                          </audio>
                        </Box>
                      );
                    }

                    if (type === 'article' || isLinkBased) {
                      return (
                        <Box
                          sx={{
                            width: '100%',
                            aspectRatio: '16/9',
                            position: 'relative',
                            borderRadius: 0,
                            overflowY: 'auto',
                            bgcolor: '#ffffff',
                            p: { xs: 2.5, sm: 4 },
                            flexShrink: 0,
                          }}
                        >
                          <Box sx={{ maxWidth: '720px', mx: 'auto' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                              <Chip label="DOC" size="small" sx={{ bgcolor: 'rgba(32, 201, 151, 0.12)', color: '#20c997', fontWeight: 700, borderRadius: '4px', height: 20 }} />
                              <Typography variant="caption" sx={{ color: 'var(--color-slate-500)', fontWeight: 600 }}>
                                {language === 'en' ? 'Study & Practice Material' : 'अभ्यास सामग्री व नोट्स'}
                              </Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--color-slate-900)', mb: 1.5, fontSize: { xs: '18px', sm: '22px' } }}>
                              {activeTopic.title}
                            </Typography>
                            <Typography sx={{ color: 'var(--color-slate-700)', lineHeight: 1.7, mb: 2.5, fontSize: '13.5px' }}>
                              {activeTopic.description || (language === 'en'
                                ? 'Key practice problems, summary notes, and reflection questions for this topic.'
                                : 'इस विषय से जुड़े प्रमुख अभ्यास प्रश्न, सारांश नोट्स और विचारणीय प्रश्न।')}
                            </Typography>

                            <Box sx={{ p: 2, bgcolor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
                              <Typography sx={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-slate-800)', mb: 0.75 }}>
                                {language === 'en' ? 'Practice Exercise #1' : 'अभ्यास प्रश्न #1'}
                              </Typography>
                              <Typography sx={{ fontSize: '12.5px', color: 'var(--color-slate-600)', lineHeight: 1.6 }}>
                                {language === 'en'
                                  ? 'Review the lecture concepts and summarize the core steps discussed in this section.'
                                  : 'व्याख्यान की मुख्य अवधारणाओं की समीक्षा करें और इस भाग में चर्चा किए गए चरणों का सारांश लिखें।'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      );
                    }

                    return (
                      <EmptyMediaState
                        message={language === 'en' ? 'No content uploaded for this topic.' : 'इस विषय के लिए कोई सामग्री अपलोड नहीं की गई है।'}
                        maxWidth={540}
                      />
                    );
                  })()}

                  {activeTopic && (
                    <Box sx={{ px: { xs: 2, sm: 2.5, md: 3 }, pt: { xs: 1.5, sm: 2, md: 2.5 }, pb: 0, flexShrink: 0 }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 0.5, fontSize: { xs: '20px', md: '24px' } }}>
                        {activeTopic.title}
                      </Typography>

                      <Typography sx={{ color: 'var(--color-slate-700)', fontSize: '14.5px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                        {activeTopic.description || (language === 'en' ? 'No description available.' : 'कोई विवरण उपलब्ध नहीं है।')}
                      </Typography>
                    </Box>
                  )}

                  {activeTopic && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', lg: 'row' },
                        gap: 2.5,
                        px: { xs: 2, sm: 2.5, md: 3 },
                        pt: 1.5,
                        pb: 3,
                        alignItems: 'stretch',
                        flexShrink: 0,
                      }}
                    >
                      {/* Left Column: Comments & Discussions */}
                      <Box
                        sx={{
                          flex: { xs: '1 1 auto', lg: '1 1 58%', xl: '1 1 60%' },
                          display: 'flex',
                          flexDirection: 'column',
                          minHeight: { xs: '280px', sm: '320px', lg: '360px' },
                          maxHeight: { xs: '380px', sm: '420px', lg: '420px' },
                        }}
                      >
                        <TopicComments
                          key={activeNode?.id || activeTopic?.id || 'default'}
                          courseId={courseId}
                          topicId={activeNode?.id || activeTopic?.id}
                          topicTitle={activeNode?.title || activeTopic?.title}
                          language={language}
                        />
                      </Box>

                      {/* Right Column: Resources */}
                      <Box
                        sx={{
                          flex: { xs: '1 1 auto', lg: '0 0 42%', xl: '0 0 40%' },
                          display: 'flex',
                          flexDirection: 'column',
                          minHeight: { xs: '280px', sm: '320px', lg: '360px' },
                          maxHeight: { xs: '380px', sm: '420px', lg: '420px' },
                        }}
                      >
                        <TopicResources
                          activeTopic={activeTopic}
                          activeNode={activeNode}
                          onSelectContent={(item) => handleTopicClick(item)}
                          language={language}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 3, md: 5 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, ...containedScrollSx }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--color-slate-900)', mb: 3 }}>
                    {course.title}
                  </Typography>

                  {course.thumbnail && (
                    <Box sx={{ width: '100%', maxWidth: '600px', mb: 4, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                      <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </Box>
                  )}

                  {course.desc || course.description ? (
                    <Typography variant="body1" sx={{ color: 'var(--color-slate-600)', whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '15px' }}>
                      {course.desc || course.description}
                    </Typography>
                  ) : (
                    <Typography variant="body1" sx={{ color: 'var(--color-slate-500)', fontStyle: 'italic' }}>
                      {language === 'en' ? 'No description provided for this course.' : 'इस पाठ्यक्रम के लिए कोई विवरण नहीं दिया गया है।'}
                    </Typography>
                  )}

                  <Box sx={{ mt: 3, pt: 3, borderTop: 'var(--border-thin) dashed var(--color-slate-300)', display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: { xs: 4, lg: 6 } }}>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5, order: { xs: 1, lg: 2 } }}>
                      {(course.category || (course.tags && course.tags.length > 0)) && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                          <Box sx={{ width: 24, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                            <AttachFileIcon sx={{ fontSize: 20, color: 'var(--theme-blue)' }} />
                          </Box>
                          {course.category && (
                            <Chip
                              label={course.category}
                              size="small"
                              sx={{
                                bgcolor: 'transparent',
                                color: 'var(--theme-blue)',
                                fontWeight: 600,
                                border: 'var(--border-thin) solid rgba(0, 86, 179, 0.2)',
                                borderRadius: 'var(--radius-sm)',
                                px: 0.5,
                                height: 24,
                              }}
                            />
                          )}
                          {course.tags && course.tags.map((tag, idx) => (
                            <Chip
                              key={idx}
                              label={tag}
                              size="small"
                              sx={{
                                bgcolor: 'transparent',
                                color: 'var(--theme-blue)',
                                fontWeight: 600,
                                border: 'var(--border-thin) solid rgba(0, 86, 179, 0.2)',
                                borderRadius: 'var(--radius-sm)',
                                px: 0.5,
                                height: 24,
                              }}
                            />
                          ))}
                        </Box>
                      )}

                      {(course.audience || course.level) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--theme-blue)', fontSize: '0.9rem', fontWeight: 600, minWidth: 0, overflow: 'hidden' }}>
                          <Box sx={{ width: 24, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                            <GroupIcon sx={{ fontSize: 22, color: 'var(--theme-green)' }} />
                          </Box>
                          {(() => {
                            const levelSource = course.audience || course.level;
                            const audList = Array.isArray(levelSource)
                              ? levelSource
                              : (typeof levelSource === 'string' ? levelSource.split(',').map(a => a.trim()) : [levelSource]);
                            if (!audList || audList.length === 0) return null;
                            return <span style={{ marginLeft: '4px', lineHeight: 1.4 }}>{audList.join(', ')}</span>;
                          })()}
                        </Box>
                      )}
                    </Box>

                    {course.modules && course.modules.length > 0 && (
                      <Box sx={{ flex: 1, borderRight: { lg: 'var(--border-thin) dashed var(--color-slate-300)' }, pr: { lg: 6 }, mt: { xs: 2, lg: 0 }, order: { xs: 2, lg: 1 } }}>
                        <Box sx={{ p: 0 }}>
                          {(() => {
                            const renderSimpleTree = (nodes, depth = 0) => {
                              if (!nodes || nodes.length === 0) return null;
                              return (
                                <Box sx={{ pl: depth === 0 ? 0 : 3, mt: depth === 0 ? 0 : 0.5 }}>
                                  {nodes.map((node, idx) => (
                                    <Box key={node.id || idx} sx={{ mb: depth === 0 ? 1.5 : 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                        <Box sx={{ mt: 0.6, width: depth === 0 ? 8 : 6, height: depth === 0 ? 8 : 6, borderRadius: '50%', bgcolor: depth === 0 ? 'var(--theme-blue)' : (depth === 1 ? 'var(--color-slate-500)' : 'var(--color-slate-400)'), flexShrink: 0 }} />
                                        <Typography sx={{
                                          fontWeight: depth === 0 ? 700 : (depth === 1 ? 600 : 500),
                                          color: depth === 0 ? 'var(--color-slate-900)' : (depth === 1 ? 'var(--color-slate-800)' : 'var(--color-slate-700)'),
                                          fontSize: depth === 0 ? '1.05rem' : (depth === 1 ? '0.95rem' : '0.9rem'),
                                          lineHeight: 1.4
                                        }}>
                                          {node.title}
                                        </Typography>
                                      </Box>

                                      {node.children && node.children.length > 0 && (
                                        <Box sx={{ mt: 0.5 }}>
                                          {renderSimpleTree(node.children, depth + 1)}
                                        </Box>
                                      )}

                                      {node.items && node.items.length > 0 && (
                                        <Box sx={{ pl: 3.5, mt: 0.5, display: 'flex', flexDirection: 'column' }}>
                                          {node.items.map((item, iIdx) => (
                                            <Box
                                              key={item.id || iIdx}
                                              onClick={() => handleTopicClick(item)}
                                              sx={{
                                                display: 'flex', alignItems: 'center', gap: 1.5,
                                                cursor: 'pointer',
                                                p: 0.75, my: 0.25, borderRadius: 'var(--radius-sm)',
                                                transition: 'var(--transition-fast)',
                                                border: '1px solid transparent',
                                                '&:hover': { bgcolor: 'rgba(0, 86, 179, 0.04)', borderColor: 'rgba(0, 86, 179, 0.1)' }
                                              }}
                                            >
                                              {getItemIcon(item.type)}
                                              <Typography sx={{ fontSize: '0.9rem', color: 'var(--color-slate-700)', fontWeight: 500 }}>
                                                {item.title}
                                              </Typography>
                                            </Box>
                                          ))}
                                        </Box>
                                      )}
                                    </Box>
                                  ))}
                                </Box>
                              );
                            };
                            return renderSimpleTree(course.modules);
                          })()}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </PremiumCard>
        </Box>
      </Container>
    </Box>
  );
}
