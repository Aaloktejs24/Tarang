import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, SpeedDial, SpeedDialIcon, SpeedDialAction, Popover } from '@mui/material';
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
import FormatSizeIcon from '@mui/icons-material/FormatSize';

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
      
      setDraftValue(initialContent);
      if (editor && initialContent !== editor.getHTML()) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [isOpen, value, image, editor]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleSave = () => {
    // Keep object structure same so AdmissionBuilder doesn't break
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
      return <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>{placeholder || "Click to add content..."}</Typography>;
    }

    if (type === 'latex') {
      return (
        <Box sx={{ overflowX: 'auto' }}>
          <Latex>{previewContent.includes('$$') || previewContent.includes('$') ? previewContent : `$$${previewContent}$$`}</Latex>
          {image && <img src={image} style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: "8px", marginTop: '8px' }} />}
        </Box>
      );
    }

    if (type === 'text') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography sx={{ whiteSpace: 'pre-wrap', color: '#1e293b' }}>{previewContent}</Typography>
          {image && <img src={image} style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: "8px" }} />}
        </Box>
      );
    }

    // New HTML type
    if (image && !previewContent.includes(image)) {
      previewContent += `<br/><img src="${image}" style="max-width: 100%; max-height: 150px; object-fit: contain; border-radius: 4px;" />`;
    }
    return (
      <Box 
        className="ProseMirror tiptap-preview"
        sx={{ 
          color: '#1e293b', 
          pointerEvents: 'none', 
          '& p': { m: 0, mb: '0.5em' },
          '& img': { maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: "8px" }
        }} 
        dangerouslySetInnerHTML={{ __html: previewContent }} 
      />
    );
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {label && <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", mb: 1 }}>{label}</Typography>}

      {/* Inline Clickable Preview Box */}
      <Box
        onClick={handleOpen}
        tabIndex={0}
        sx={{
          border: '1.5px solid #cbd5e1',
          borderRadius: '8px',
          p: 2,
          minHeight: '60px',
          bgcolor: '#fff',
          cursor: 'text',
          position: 'relative',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          outline: 'none',
          '&:hover, &:focus': {
            borderColor: '#0056b3',
            bgcolor: '#ffffff',
            boxShadow: 'none',
            '& .edit-icon': { opacity: 1 }
          }
        }}
      >
        <Box sx={{ flexGrow: 1, overflowX: 'auto' }}>
          {renderPreview()}
        </Box>
        <EditOutlinedIcon className="edit-icon" sx={{ opacity: 0, color: '#0056b3', transition: 'opacity 0.2s', ml: 2, fontSize: '20px' }} />
      </Box>

      <Dialog
        open={isOpen}
        onClose={handleClose}
        fullScreen
        PaperProps={{ sx: { 
          background: `
            radial-gradient(at 0% 0%, rgba(0, 86, 179, 0.15) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(40, 167, 69, 0.1) 0, transparent 50%), 
            radial-gradient(at 80% 90%, rgba(40, 167, 69, 0.08) 0, transparent 50%),
            radial-gradient(at 20% 80%, rgba(0, 86, 179, 0.1) 0, transparent 50%),
            #eef2f6
          `,
          overscrollBehavior: 'none' 
        } }}
      >
        <DialogTitle component="div" sx={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '72px',
          background: 'linear-gradient(135deg, rgba(0, 86, 179, 0.15) 0%, rgba(40, 167, 69, 0.15) 100%)',
          bgcolor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(16px)', color: '#0f172a', py: 0, px: { xs: 3, md: 6 }, 
          borderBottom: '2px solid transparent', 
          borderImage: 'linear-gradient(90deg, #0056b3 0%, #28a745 50%, #ffc107 100%) 1',
          borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 10
        }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 800, fontFamily: "'Inter', sans-serif", letterSpacing: '-1px', fontSize: '22px' }}>
            {label ? `${label}` : 'Rich Editor'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              onClick={handleClose} variant="outlined" 
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '15px', color: '#475569', borderColor: '#cbd5e1', px: 3, py: 1, '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' } }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} variant="contained" disableElevation
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '15px', color: 'white', px: 4, py: 1, background: 'linear-gradient(135deg, #0056b3 0%, #28a745 100%)', '&:hover': { background: 'linear-gradient(135deg, #004494 0%, #218838 100%)' } }}
            >
              Save Changes
            </Button>
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
              flexShrink: 0, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '850px',
              mx: 'auto', mt: { xs: 2, md: 5 }, mb: '120px', bgcolor: 'white',
              border: '1px solid #cbd5e1', borderRadius: { xs: 0, md: '4px' }, minHeight: '800px', overflow: 'hidden',
              boxShadow: 'none'
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
              position: 'fixed', bottom: { xs: 24, md: 40 }, right: { xs: 24, md: 40 }, zIndex: 100,
              '& .MuiSpeedDialAction-fab': {
                bgcolor: '#ffffff',
                border: '1.5px solid #e2e8f0',
                boxShadow: 'none',
                color: '#0056b3',
                '&:hover': { bgcolor: '#f8fafc' }
              }
            }}
            FabProps={{
              sx: {
                width: { xs: 56, md: 64 }, 
                height: { xs: 56, md: 64 },
                backgroundColor: '#0056b3 !important',
                color: '#ffffff !important',
                border: '1.5px solid #ffc107 !important',
                boxShadow: 'none !important',
                '&:hover': { backgroundColor: '#004494 !important' }
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
                icon={<FormatListNumberedIcon sx={{ color: editor.isActive('orderedList') ? '#ffffff' : 'inherit' }} />}
                tooltipTitle="Numbered List"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                FabProps={editor.isActive('orderedList') ? { sx: { bgcolor: '#28a745 !important', border: 'none !important', color: '#ffffff !important', '&:hover': { bgcolor: '#218838 !important' } } } : {}}
              />,
              <SpeedDialAction
                key="bulletList"
                icon={<FormatListBulletedIcon sx={{ color: editor.isActive('bulletList') ? '#ffffff' : 'inherit' }} />}
                tooltipTitle="Bullet List"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                FabProps={editor.isActive('bulletList') ? { sx: { bgcolor: '#28a745 !important', border: 'none !important', color: '#ffffff !important', '&:hover': { bgcolor: '#218838 !important' } } } : {}}
              />,
              <SpeedDialAction
                key="italic"
                icon={<FormatItalicIcon sx={{ color: editor.isActive('italic') ? '#ffffff' : 'inherit' }} />}
                tooltipTitle="Italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                FabProps={editor.isActive('italic') ? { sx: { bgcolor: '#28a745 !important', border: 'none !important', color: '#ffffff !important', '&:hover': { bgcolor: '#218838 !important' } } } : {}}
              />,
              <SpeedDialAction
                key="bold"
                icon={<FormatBoldIcon sx={{ color: editor.isActive('bold') ? '#ffffff' : 'inherit' }} />}
                tooltipTitle="Bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
                FabProps={editor.isActive('bold') ? { sx: { bgcolor: '#28a745 !important', border: 'none !important', color: '#ffffff !important', '&:hover': { bgcolor: '#218838 !important' } } } : {}}
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

          <Popover
            open={Boolean(colorAnchorEl)}
            anchorEl={colorAnchorEl}
            onClose={handleColorClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            sx={{ '& .MuiPopover-paper': { p: 1, display: 'flex', gap: 1, mb: 1, borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: 'none' } }}
          >
            {['#000000', '#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea'].map(color => (
              <Box 
                key={color} 
                onClick={() => handleColorSelect(color)}
                sx={{ width: 28, height: 28, bgcolor: color, borderRadius: '50%', cursor: 'pointer', border: '1.5px solid #e2e8f0', '&:hover': { transform: 'scale(1.1)', transition: 'transform 0.1s' } }} 
              />
            ))}
          </Popover>

          <Popover
            open={Boolean(sizeAnchorEl)}
            anchorEl={sizeAnchorEl}
            onClose={handleSizeClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            sx={{ '& .MuiPopover-paper': { p: 1, mb: 1, display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: 'none', minWidth: '120px' } }}
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
                sx={{ textTransform: 'none', color: '#0f172a', justifyContent: 'flex-start', py: 0.5, px: 2, borderRadius: "8px", '&:hover': { bgcolor: '#f1f5f9' } }}
              >
                {size.label}
              </Button>
            ))}
          </Popover>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
