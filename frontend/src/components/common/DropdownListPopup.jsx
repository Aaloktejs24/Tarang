import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import CustomCheckbox from './Checkbox';
import { CustomTooltip } from './Tooltip';
import { GlassPopover } from './GlassPopover';

export const DropdownListPopup = ({
  isOpen, setIsOpen, options, value, onChange, searchable, searchQuery, setSearchQuery, anchorRef, freeSolo = false, multiple = false, headerContent, minWidth
}) => {
  // Enable search by default for all popups, unless explicitly set to false
  const isSearchable = searchable !== undefined ? searchable : true;

  const filteredOptions = React.useMemo(() => {
    if (!isSearchable || !searchQuery) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(opt => {
      const searchableStr = opt.searchStr ? opt.searchStr : opt.label.toLowerCase();
      return searchableStr.includes(q);
    });
  }, [options, isSearchable, searchQuery]);

  return (
    <GlassPopover
      open={isOpen}
      anchorEl={anchorRef?.current}
      onClose={() => setIsOpen(false)}
      width="match-anchor"
      minWidth={minWidth}
      sx={{ maxHeight: 280 }}
    >
      {isSearchable && (
        <Box sx={{ px: 2, py: 1.5, borderBottom: 'var(--border-thin) solid var(--card-border)' }} onClick={(e) => e.stopPropagation()}>
          <Box sx={{
            display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.04)',
            borderRadius: 'var(--radius-md)', px: 1.5, py: 1
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-slate-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                width: 'var(--size-full)', marginLeft: '8px', fontSize: 'var(--font-sm)',
                color: 'var(--color-slate-900)'
              }}
            />
          </Box>
        </Box>
      )}

      {headerContent}

      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {filteredOptions.length === 0 && (!freeSolo || !searchQuery.trim()) ? (
          <Box sx={{ px: 2, py: 1.5, color: 'var(--color-slate-500)', fontSize: 'var(--font-base)' }}>No options found</Box>
        ) : (
          <>
            {filteredOptions.map((opt, i) => {
              if (opt.isHeading) {
                return (
                  <Typography key={i} sx={{ px: 2, py: 1, fontSize: 'var(--font-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-900)', mt: i === 0 ? 0 : 1 }}>
                    {opt.label}
                  </Typography>
                );
              }
              const isSelected = multiple ? (Array.isArray(value) && value.includes(opt.value)) : value === opt.value;
              const itemContent = (
                <Box
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (opt.disabled) return;
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
                    cursor: opt.disabled ? 'not-allowed' : 'pointer',
                    opacity: opt.disabled ? 0.5 : 1,
                    bgcolor: isSelected && opt.value !== "" ? 'rgba(0, 86, 179, 0.1)' : 'transparent',
                    color: 'var(--color-slate-900)',
                    fontWeight: isSelected && opt.value !== "" ? 'var(--font-medium)' : 'var(--font-regular)',
                    fontSize: 'var(--font-sm)',
                    lineHeight: 1.25,
                    transition: 'background-color var(--transition-base), color var(--transition-base)',
                    '&:hover': { bgcolor: opt.disabled ? 'transparent' : (opt.value !== "" ? 'rgba(0, 86, 179, 0.1)' : 'var(--color-slate-50)') },
                    '&:active': { bgcolor: opt.disabled ? 'transparent' : (opt.value !== "" ? 'rgba(0, 86, 179, 0.2)' : 'var(--color-slate-100)') }
                  }}
                >
                  {multiple && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5, ml: -0.5, pointerEvents: 'none' }}>
                      <CustomCheckbox checked={isSelected} readOnly />
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
                  {opt.renderLabel ? opt.renderLabel(opt) : (
                    <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 'inherit', color: 'inherit' }}>
                      {opt.label}
                    </Typography>
                  )}
                  {opt.icon && (
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                      {opt.icon}
                    </Box>
                  )}
                </Box>
              );

              return opt.tooltip ? (
                <CustomTooltip key={i} title={opt.tooltip} arrow placement="right">
                  <span>{itemContent}</span>
                </CustomTooltip>
              ) : itemContent;
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
    </GlassPopover>
  );
};
