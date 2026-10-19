"use client";
import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, CircularProgress, IconButton, Paper, Divider, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CustomAccordion, CustomAccordionSummary, CustomAccordionDetails } from '../../components/common/CustomAccordion';
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
import PremiumCard from '../../components/ui/PremiumCard';
import { useBreadcrumbs } from '../../contexts/BreadcrumbContext';
import Loader from '../../components/common/Loader';
import ShakaPlayerComponent from '../../components/viewer/ShakaPlayerComponent';

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
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  useBreadcrumbs([
    { labelEn: 'Courses', labelHi: 'पाठ्यक्रम', onClick: () => router.back() },
    { labelEn: course?.title || 'Course Player', labelHi: course?.title || 'पाठ्यक्रम प्लेयर' }
  ]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await lmsService.getCourse(courseId);
        setCourse(data);

        // Initialize with course overview state and all modules collapsed
        if (data?.modules?.length > 0) {
          setActiveTopic(null);
          setExpandedNodes({});
        }
      } catch (error) {
        console.error('Failed to fetch course details:', error);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  const handleTopicClick = (topic) => {
    setActiveTopic(topic);
  };

  if (loading) {
    return <Loader />;
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
    if (!items || items.length === 0) return null;
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
        {items.map((item, idx) => {
          const isActive = activeTopic?.id === item.id;
          return (
            <Box key={idx}
              onClick={() => handleTopicClick(item)}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: { xs: 1.5, sm: 2.25 },
                height: '64px',
                borderRadius: 'var(--radius-lg)',
                border: 'var(--border-thin) solid',
                borderColor: isActive ? 'var(--color-primary)' : 'var(--card-border)',
                bgcolor: 'var(--card-bg)',
                backdropFilter: 'var(--card-blur)',
                transition: 'transform 0.2s ease-in-out', 
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-2px)' }
              }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  {getItemIcon(item.type)}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '14px', color: isActive ? 'var(--color-primary)' : 'var(--color-slate-900)' }}>
                    {item.title}
                  </Typography>
                  {item.duration && (
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-slate-500)' }}>
                      {item.duration}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderNode = (node, depth = 0) => {
    const isExpanded = !!expandedNodes[node.id];

    // A node has content to expand if it has items or sub-children
    const hasContent = (node.items && node.items.length > 0) || (node.children && node.children.length > 0);
    // Check if node is clickable as a topic itself (legacy structure)
    const isLegacyLeaf = !node.children?.length && !node.items?.length && (node.video_url || node.document_url);

    return (
      <Box key={node.id} sx={{ position: 'relative', mb: depth === 0 ? 1.5 : 0 }}>
        <CustomAccordion
          expanded={isExpanded && hasContent}
          onChange={() => {
            if (hasContent) {
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
            onClick={() => {
              if (isLegacyLeaf) {
                handleTopicClick(node);
              }
            }}
            expandIcon={hasContent ? <ExpandMoreIcon sx={{ color: 'var(--color-primary)' }} /> : null}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start', gap: 0.5 }}>
              <Box sx={{ width: '100%' }}>
                <Typography sx={{ fontWeight: 'var(--font-bold)', color: 'var(--color-slate-900)', fontSize: depth === 0 ? 'var(--font-base)' : 'var(--font-sm)', lineHeight: 1.3 }}>
                  {node.title || (depth === 0 ? 'Untitled Module' : 'Untitled Topic')}
                </Typography>
              </Box>
            </Box>
          </CustomAccordionSummary>

          <CustomAccordionDetails
            sx={{
              pt: 1, pb: 1,
              pl: { xs: 1.5, sm: 2 },
              pr: { xs: 1.5, sm: 2 },
              display: 'flex', flexDirection: 'column', gap: 1,
              backgroundColor: 'transparent',
              borderBottomLeftRadius: 'var(--radius-lg)',
              borderBottomRightRadius: 'var(--radius-lg)'
            }}
          >
            {renderItems(node.items)}
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

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", pt: { xs: 3, md: 3 }, pb: 6, position: "relative", zIndex: 1 }}>
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

      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 10 } }}>

        {/* Main Layout */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch', gap: 2, height: { xs: 'auto', md: 'calc(100vh - 120px)' }, minHeight: 600 }}>

          {/* Left Sidebar: Curriculum */}
          <PremiumCard sx={{
            width: { xs: '100%', md: 320, lg: 360 },
            height: '100%',
            minHeight: 0,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
            p: 0
          }}>
            <Box
              onClick={() => setActiveTopic(null)}
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

            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              {course.modules?.map(module => renderNode(module, 0))}
            </Box>
          </PremiumCard>

          {/* Right Content Area: Viewer */}
          <PremiumCard sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 0, height: '100%', minHeight: 0 }}>
            {activeTopic ? (
              <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 3, bgcolor: 'rgba(0, 86, 179, 0.04)', borderBottom: 'var(--border-thin) solid var(--card-border)', flexShrink: 0 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--color-slate-900)' }}>
                    {activeTopic.title}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  {(() => {
                    const type = activeTopic.type;
                    const url = activeTopic.url || activeTopic.video_url || activeTopic.document_url;

                    const isVideo = type === 'video' || (!type && activeTopic.video_url);
                    const isDocument = type === 'document' || (!type && activeTopic.document_url);
                    const isAudio = type === 'audio';
                    const isLinkBased = ['link', 'article', 'quiz', 'lab', 'assignment'].includes(type);

                    if (isVideo && url) {
                      return (
                        <Box sx={{ width: '100%', aspectRatio: '16/9', bgcolor: '#000', flexShrink: 0 }}>
                          <ShakaPlayerComponent 
                            manifestUrl={url} 
                            jobId={activeTopic.video_job_id} 
                          />
                        </Box>
                      );
                    }

                    if (isDocument && url) {
                      return (
                        <Box sx={{ width: '100%', height: '70vh', bgcolor: 'var(--color-slate-100)', flexShrink: 0 }}>
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
                        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', bgcolor: 'var(--color-slate-50)', flexShrink: 0, borderBottom: 'var(--border-thin) solid var(--card-border)' }}>
                          <audio controls src={url} style={{ width: '100%', maxWidth: '400px' }}>
                            Your browser does not support the audio element.
                          </audio>
                        </Box>
                      );
                    }

                    if (isLinkBased && url) {
                      return (
                        <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                          <Typography variant="h6" sx={{ color: 'var(--color-slate-700)', mb: 2 }}>
                            {language === 'en' ? 'External Content' : 'बाहरी सामग्री'}
                          </Typography>
                          <TarangButton
                            variant="contained"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {language === 'en' ? 'Open in new tab' : 'नए टैब में खोलें'}
                          </TarangButton>
                        </Box>
                      );
                    }

                    return (
                      <Box sx={{ p: 6, textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" sx={{ color: 'var(--color-slate-500)' }}>
                          {language === 'en' ? 'No media content uploaded for this topic.' : 'इस विषय के लिए कोई मीडिया सामग्री अपलोड नहीं की गई है।'}
                        </Typography>
                      </Box>
                    );
                  })()}

                  {activeTopic.description && (
                    <Box sx={{ p: 4, borderTop: 'var(--border-thin) solid var(--card-border)', flexShrink: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-slate-800)', mb: 1 }}>
                        {language === 'en' ? 'Description' : 'विवरण'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--color-slate-600)', whiteSpace: 'pre-wrap' }}>
                        {activeTopic.description}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 3, md: 5 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
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
                                              onClick={() => setActiveTopic(item)}
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
