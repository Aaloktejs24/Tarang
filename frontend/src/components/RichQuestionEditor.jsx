import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, SpeedDial, SpeedDialIcon, SpeedDialAction, Button } from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import MathExtension from '@aarkue/tiptap-math-extension';
import ResizeImage from 'tiptap-extension-resize-image';
import Latex from 'react-latex-next';
import { Color } from '@tiptap/extension-color';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FunctionsIcon from '@mui/icons-material/Functions';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import TarangButton from './common/TarangButton';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import { GlassPopover } from './common/GlassPopover';

import 'katex/dist/katex.min.css';
import '../styles/tiptap.css';

export default function RichQuestionEditor({ label, value, type, image, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftValue, setDraftValue] = useState(value || '');
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      MathExtension.configure({ evaluation: false }),
      ResizeImage,
      Color,
      TextStyle,
      FontSize,
    ],
    content: draftValue,
    onUpdate: ({ editor }) => {
      setDraftValue(editor.getHTML());
    },
  });

  const [colorAnchorEl, setColorAnchorEl] = useState(null);
  const [sizeAnchorEl, setSizeAnchorEl] = useState(null);

  const handleColorClick = (event) => setColorAnchorEl(event.currentTarget);
  const handleColorClose = () => setColorAnchorEl(null);

  const handleColorSelect = (color) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
    }
    handleColorClose();
  };

  const handleSizeClick = (event) => setSizeAnchorEl(event.currentTarget);
  const handleSizeClose = () => setSizeAnchorEl(null);
  const handleSizeSelect = (size) => {
    if (editor) {
      editor.chain().focus().setFontSize(size).run();
    }
    handleSizeClose();
  };

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      let initialContent = value || '';
      
      // If there's a legacy image prop, append it as an image tag to the HTML
      // so it isn't lost in the transition to the new engine.
      if (image && !initialContent.includes(image)) {
        initialContent += `<p><img src="${image}" /></p>`;
      }
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftValue(initialContent);
      if (editor && initialContent !== editor.getHTML()) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [isOpen, value, image, editor]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleSave = () => {
    // Keep object structure same so AdmissionModal doesn't break
    onChange({ type: 'html', value: draftValue, image: '' });
    setIsOpen(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (editor) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    }
  };

  const insertMath = (latex) => {
    if (editor) {
      // Tiptap Math Extension uses $ ... $ for inline math
      editor.chain().focus().insertContent(`$${latex}$`).run();
    }
  };

  const renderPreview = () => {
    let previewContent = value || '';
    
    if (!previewContent && !image) {
      return <Typography sx={{ color: 'var(--color-slate-500)', fontStyle: 'italic' }}>{placeholder || "Click to add content..."}</Typography>;
    }

    if (type === 'latex') {
      return (
        <Box sx={{ overflowX: 'auto' }}>
          <Latex>{previewContent.includes('$$') || previewContent.includes('$') ? previewContent : `$$${previewContent}$$`}</Latex>
          {image && <img src={image} alt="Expression" style={{ maxWidth: 'var(--size-full)', maxHeight: '150px', objectFit: 'contain', borderRadius: 'var(--radius-md)', marginTop: '8px' }} />}
        </Box>
      );
    }

    if (type === 'text') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography sx={{ whiteSpace: 'pre-wrap', color: 'var(--color-slate-900)' }}>{previewContent}</Typography>
          {image && <img src={image} alt="Expression" style={{ maxWidth: 'var(--size-full)', maxHeight: '150px', objectFit: 'contain', borderRadius: 'var(--radius-md)' }} />}
        </Box>
      );
    }

    // New HTML type
    if (image && !previewContent.includes(image)) {
      previewContent += `<br/><img src="${image}" style="max-width: var(--size-full); max-height: 150px; object-fit: contain; border-radius: var(--radius-sm);" />`;
    }
    return (
      <Box 
        className="ProseMirror tiptap-preview"
        sx={{ 
          color: 'var(--color-slate-900)', 
          pointerEvents: 'none', 
          '& p': { m: 0, mb: '0.5em' },
          '& img': { maxWidth: 'var(--size-full)', maxHeight: '150px', objectFit: 'contain', borderRadius: 'var(--radius-md)' }
        }} 
        dangerouslySetInnerHTML={{ __html: previewContent }} 
      />
    );
  };

  return (
    <Box sx={{ width: 'var(--size-full)', mb: 2 }}>
      {label && <Typography variant="body2" sx={{ fontWeight: 'var(--font-semibold)', color: "var(--color-slate-500)", mb: 1 }}>{label}</Typography>}

      {/* Inline Clickable Preview Box */}
      <Box
        onClick={handleOpen}
        tabIndex={0}
        sx={{
          border: '1.5px solid var(--color-slate-300)',
          borderRadius: 'var(--radius-md)',
          p: 2,
          minHeight: '60px',
          bgcolor: 'var(--color-white)',
          cursor: 'text',
          position: 'relative',
          transition: 'all var(--transition-base)',
          display: 'flex',
          alignItems: 'center',
          outline: 'none',
          '&:hover, &:focus': {
            borderColor: 'var(--color-primary)',
            bgcolor: 'var(--color-white)',
            '& .edit-icon': { opacity: 1 }
          }
        }}
      >
        <Box sx={{ flexGrow: 1, overflowX: 'auto' }}>
          {renderPreview()}
        </Box>
        <IconButton
          className="edit-icon"
          size="small"
          sx={{
            opacity: 0,
            ml: 2,
            transition: 'opacity var(--transition-base), transform var(--transition-base)',
            bgcolor: 'var(--card-bg)', color: 'var(--color-primary)',
            boxShadow: 'var(--shadow-sm)',
            backdropFilter: 'var(--card-blur)',
            '&:hover': { bgcolor: 'var(--color-slate-50)', transform: 'scale(1.05)' }
          }}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Dialog
        open={isOpen}
        onClose={handleClose}
        fullScreen
        PaperProps={{ sx: { 
          background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.45) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.3) 0, transparent 50%), 
            radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.2) 0, transparent 50%),
            radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.15) 0, transparent 50%),
            #eef2f6
          `,
          overscrollBehavior: 'none' 
        } }}
      >
        <DialogTitle component="div" sx={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '72px',
          background: 'linear-gradient(135deg, rgba(0, 86, 179, 0.15) 0%, rgba(40, 167, 69, 0.15) 100%)',
          bgcolor: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)', color: 'var(--color-slate-900)', py: 0, px: { xs: 3, md: 6 }, 
          borderBottom: 'var(--border-thick) solid transparent', 
          borderImage: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-success) 50%, var(--color-warning) 100%) 1',
          borderBottom: 'var(--border-thin) solid var(--color-slate-200)', position: 'sticky', top: 0, zIndex: 'var(--z-sticky)'
        }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 800, letterSpacing: '-1px', fontSize: '22px' }}>
            {label ? `${label}` : 'Rich Editor'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TarangButton 
              onClick={handleClose} variant="outlined" 
              sx={{ px: 3, py: 1 }}
            >
              Cancel
            </TarangButton>
            <TarangButton 
              onClick={handleSave} 
              sx={{ px: 4, py: 1 }}
            >
              Save Changes
            </TarangButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ 
          p: 0, display: 'flex', flexDirection: 'column', 
          bgcolor: 'transparent', overflow: 'hidden' 
        }}>
          {/* Scrolling Container for Editor */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', pb: 2 }}>
            {/* Main Document Area */}
            <Box sx={{
              flexShrink: 0, display: 'flex', flexDirection: 'column', width: 'var(--size-full)', maxWidth: '850px',
              mx: 'auto', mt: { xs: 2, md: 5 }, mb: '120px', bgcolor: 'var(--color-white)',
              border: 'var(--border-thin) solid var(--color-slate-300)', borderRadius: { xs: 0, md: '4px' }, minHeight: '800px', overflow: 'hidden',
            }}>
              <Box sx={{ p: { xs: 3, md: 6 }, flexGrow: 1, cursor: 'text' }} onClick={() => editor?.commands.focus()}>
                <EditorContent editor={editor} style={{ minHeight: '700px', outline: 'none' }} />
              </Box>
            </Box>
          </Box>

          {/* Speed Dial Toolbar */}
          <SpeedDial
            ariaLabel="Editor Toolbar"
            sx={{ 
              position: 'fixed', bottom: { xs: 24, md: 40 }, right: { xs: 24, md: 40 }, zIndex: 'var(--z-sticky)',
              '& .MuiSpeedDialAction-fab': {
                bgcolor: 'var(--color-white)',
                border: '1.5px solid var(--color-slate-200)',
                color: 'var(--color-primary)',
                '&:hover, &:focus, &:active': { bgcolor: 'var(--color-slate-50)', }
              }
            }}
            FabProps={{
              sx: {
                width: { xs: 56, md: 64 }, 
                height: { xs: 56, md: 64 },
                bgcolor: 'var(--card-bg)', 
                color: 'var(--color-primary)',
                boxShadow: 'var(--shadow-sm)',
                backdropFilter: 'var(--card-blur)',
                '&:hover, &:focus, &:active': { bgcolor: 'var(--color-slate-50)', transform: 'scale(1.05)' }
              }
            }}
            icon={<EditOutlinedIcon />}
            direction="up"
          >
            <SpeedDialAction
              icon={<FormatColorTextIcon />}
              tooltipTitle="Text Color"
              onClick={handleColorClick}
            />
            <SpeedDialAction
              icon={<FormatSizeIcon />}
              tooltipTitle="Font Size"
              onClick={handleSizeClick}
            />
            <SpeedDialAction
              icon={<AddPhotoAlternateOutlinedIcon />}
              tooltipTitle="Insert Image"
              onClick={() => fileInputRef.current?.click()}
            />
            {editor && [
              <SpeedDialAction
                key="orderedList"
                icon={<FormatListNumberedIcon sx={{ color: editor.isActive('orderedList') ? 'var(--color-white)' : 'inherit' }} />}
                tooltipTitle="Numbered List"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                FabProps={editor.isActive('orderedList') ? { sx: { bgcolor: 'var(--color-success)', border: 'none', color: 'var(--color-white)', '&:hover, &:focus, &:active': { bgcolor: 'var(--color-success)', } } } : { sx: { '&:hover, &:focus, &:active': { } } }}
              />,
              <SpeedDialAction
                key="bulletList"
                icon={<FormatListBulletedIcon sx={{ color: editor.isActive('bulletList') ? 'var(--color-white)' : 'inherit' }} />}
                tooltipTitle="Bullet List"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                FabProps={editor.isActive('bulletList') ? { sx: { bgcolor: 'var(--color-success)', border: 'none', color: 'var(--color-white)', '&:hover, &:focus, &:active': { bgcolor: 'var(--color-success)', } } } : { sx: { '&:hover, &:focus, &:active': { } } }}
              />,
              <SpeedDialAction
                key="italic"
                icon={<FormatItalicIcon sx={{ color: editor.isActive('italic') ? 'var(--color-white)' : 'inherit' }} />}
                tooltipTitle="Italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                FabProps={editor.isActive('italic') ? { sx: { bgcolor: 'var(--color-success)', border: 'none', color: 'var(--color-white)', '&:hover, &:focus, &:active': { bgcolor: 'var(--color-success)', } } } : { sx: { '&:hover, &:focus, &:active': { } } }}
              />,
              <SpeedDialAction
                key="bold"
                icon={<FormatBoldIcon sx={{ color: editor.isActive('bold') ? 'var(--color-white)' : 'inherit' }} />}
                tooltipTitle="Bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
                FabProps={editor.isActive('bold') ? { sx: { bgcolor: 'var(--color-success)', border: 'none', color: 'var(--color-white)', '&:hover, &:focus, &:active': { bgcolor: 'var(--color-success)', } } } : { sx: { '&:hover, &:focus, &:active': { } } }}
              />
            ]}
          </SpeedDial>

          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleImageUpload}
          />

          <GlassPopover
            open={Boolean(colorAnchorEl)}
            anchorEl={colorAnchorEl}
            onClose={handleColorClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            sx={{ p: 1, display: 'flex', gap: 1, mb: 1, minWidth: 'auto', borderRadius: 'var(--radius-md)', border: 'var(--border-thin) solid var(--color-slate-200)' }}
          >
            {['var(--color-slate-900)', 'var(--color-error)', 'var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-slate-500)'].map(color => (
              <Box 
                key={color} 
                onClick={() => handleColorSelect(color)}
                sx={{ width: 28, height: 28, bgcolor: color, borderRadius: 'var(--radius-full)', cursor: 'pointer', border: '1.5px solid var(--color-slate-200)', '&:hover': { transform: 'scale(1.1)', transition: 'transform var(--transition-fast)' } }} 
              />
            ))}
          </GlassPopover>

          <GlassPopover
            open={Boolean(sizeAnchorEl)}
            anchorEl={sizeAnchorEl}
            onClose={handleSizeClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            sx={{ p: 1, mb: 1, display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-md)', border: 'var(--border-thin) solid var(--color-slate-200)', minWidth: '120px' }}
          >
            {[
              { label: 'Small', value: '12px' },
              { label: 'Normal', value: '16px' },
              { label: 'Large', value: '24px' },
              { label: 'Huge', value: '32px' }
            ].map(size => (
              <Button 
                key={size.value} 
                onClick={() => handleSizeSelect(size.value)}
                sx={{ textTransform: 'none', color: 'var(--color-slate-900)', justifyContent: 'flex-start', py: 0.5, px: 2, borderRadius: 'var(--radius-md)', '&:hover': { bgcolor: 'var(--color-slate-50)' } }}
              >
                {size.label}
              </Button>
            ))}
          </GlassPopover>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
