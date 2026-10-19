import React from 'react';
import ReactDOM from 'react-dom';
import { Box, Typography } from '@mui/material';
import CustomCheckbox from './CustomCheckbox';

export const DropdownListPopup = ({
  isOpen, setIsOpen, options, value, onChange, searchable, searchQuery, setSearchQuery, anchorRef, dropdownRef, freeSolo = false, multiple = false
}) => {
  // Auto-enable search if there are more than 10 options, unless explicitly set
  const isSearchable = searchable !== undefined ? searchable : options.length > 10;
  const [coords, setCoords] = React.useState(null);

  React.useLayoutEffect(() => {
    if (!isOpen || !anchorRef?.current) return;

    const updateCoords = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 16;
      const spaceAbove = rect.top - 16;
      const MAX_HEIGHT = 280;
      if (spaceBelow >= 160 || spaceBelow >= spaceAbove) {
        setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width, bottom: 'auto', maxHeight: Math.min(Math.max(spaceBelow, 100), MAX_HEIGHT) });
      } else {
        setCoords({ bottom: window.innerHeight - rect.top + 4, left: rect.left, width: rect.width, top: 'auto', maxHeight: Math.min(Math.max(spaceAbove, 100), MAX_HEIGHT) });
      }
    };

    updateCoords();
    
    // Listen to scroll events in the capture phase so it catches scrolling on any internal container
    window.addEventListener('scroll', updateCoords, true);
    window.addEventListener('resize', updateCoords);

    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen, anchorRef]);

  const filteredOptions = React.useMemo(() => {
    if (!isSearchable || !searchQuery) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(opt => {
      const searchableStr = opt.searchStr ? opt.searchStr : opt.label.toLowerCase();
      return searchableStr.includes(q);
    });
  }, [options, isSearchable, searchQuery]);

  if (!isOpen) return null;

  const posStyle = anchorRef && coords
    ? { position: 'fixed', top: coords.top, bottom: coords.bottom, left: coords.left, width: coords.width, zIndex: 99999, maxHeight: coords.maxHeight }
    : { position: 'fixed', top: 0, left: 0, zIndex: 99999 };

  const dropdownContent = (
    <Box ref={dropdownRef} sx={{
      ...posStyle,
      bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)',
      borderRadius: 'var(--radius-lg)',
      border: 'var(--border-thin) solid var(--color-slate-300)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {isSearchable && (
        <Box sx={{ px: 2, py: 1.5, borderBottom: 'var(--border-thin) solid var(--color-slate-300)' }} onClick={(e) => e.stopPropagation()}>
          <Box sx={{
            display: 'flex', alignItems: 'center', bgcolor: 'var(--color-slate-50)',
            borderRadius: 'var(--radius-md)', px: 1.5, py: 1
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-slate-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                width: 'var(--size-full)', marginLeft: '8px', fontSize: 'var(--font-sm)',
                color: 'var(--color-slate-900)', fontFamily: 'inherit'
              }}
            />
          </Box>
        </Box>
      )}

      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {filteredOptions.length === 0 && (!freeSolo || !searchQuery.trim()) ? (
          <Box sx={{ px: 2, py: 1.5, color: 'var(--color-slate-500)', fontSize: 'var(--font-base)' }}>No options found</Box>
        ) : (
          <>
            {filteredOptions.map((opt, i) => {
              const isSelected = multiple ? (Array.isArray(value) && value.includes(opt.value)) : value === opt.value;
              return (
                <Box
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (multiple) {
                      const currentValue = Array.isArray(value) ? value : [];
                      const newValue = currentValue.includes(opt.value) 
                        ? currentValue.filter(v => v !== opt.value)
                        : [...currentValue, opt.value];
                      onChange({ target: { value: newValue } });
                    } else {
                      onChange({ target: { value: opt.value } });
                      setIsOpen(false);
                      setSearchQuery('');
                    }
                  }}
                  sx={{
                    boxSizing: 'border-box',
                    borderRadius: 'var(--radius-sm)',
                    margin: '1px 8px',
                    width: 'calc(100% - 16px)',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    bgcolor: isSelected && opt.value !== "" ? 'rgba(0, 86, 179, 0.1)' : 'transparent',
                    color: 'var(--color-slate-900)',
                    fontWeight: isSelected && opt.value !== "" ? 500 : 400,
                    fontSize: 'var(--font-sm)',
                    lineHeight: 1.25,
                    transition: 'background-color var(--transition-base), color var(--transition-base)',
                    '&:hover': { bgcolor: opt.value !== "" ? 'rgba(0, 86, 179, 0.1)' : 'var(--color-slate-50)' },
                    '&:active': { bgcolor: opt.value !== "" ? 'rgba(0, 86, 179, 0.2)' : 'var(--color-slate-100)' }
                  }}
                >
                  {multiple && (
                    <Box sx={{ mr: 1, pointerEvents: 'none' }}>
                      <CustomCheckbox checked={isSelected} sx={{ p: 0 }} />
                    </Box>
                  )}
                  {opt.flagUrl && (
                    <img 
                      src={opt.flagUrl} 
                      alt="" 
                      style={{ width: '20px', height: '15px', objectFit: 'cover', marginRight: '8px' }} 
                      onError={(e) => {
                        if (!e.target.dataset.fallbackApplied) {
                          e.target.dataset.fallbackApplied = 'true';
                          const code = e.target.src.split('/').pop().split('.')[0].toUpperCase();
                          e.target.src = `https://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`;
                        } else {
                          e.target.style.display = 'none';
                        }
                      }}
                    />
                  )}
                  {opt.renderLabel ? opt.renderLabel(opt) : opt.label}
                </Box>
              );
            })}
            {freeSolo && searchQuery.trim() && !options.some(o => o.label.toLowerCase() === searchQuery.trim().toLowerCase()) && (
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  if (multiple) {
                    const currentValue = Array.isArray(value) ? value : [];
                    const newValue = currentValue.includes(searchQuery.trim()) 
                      ? currentValue.filter(v => v !== searchQuery.trim())
                      : [...currentValue, searchQuery.trim()];
                    onChange({ target: { value: newValue } });
                  } else {
                    onChange({ target: { value: searchQuery.trim() } });
                    setIsOpen(false);
                    setSearchQuery('');
                  }
                }}
                sx={{
                  boxSizing: 'border-box',
                  borderRadius: 'var(--radius-sm)',
                  margin: '1px 8px',
                  width: 'calc(100% - 16px)',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  bgcolor: 'transparent',
                  color: 'var(--color-slate-900)',
                  fontWeight: 500,
                  fontSize: 'var(--font-sm)',
                  lineHeight: 1.25,
                  transition: 'background-color var(--transition-base), color var(--transition-base)',
                  '&:hover': { bgcolor: 'rgba(0, 86, 179, 0.1)' }
                }}
              >
                Add "{searchQuery.trim()}"
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );

  return ReactDOM.createPortal(dropdownContent, document.body);
};
