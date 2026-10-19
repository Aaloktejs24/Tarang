import React from 'react';
import { Box, Typography } from '@mui/material';
import gazeteer from '../../data/formated/gazeteer.json';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { sortLocationsByDistance } from '../../lib/geoNormalize';

export const CustomFloatingInput = React.forwardRef(({ label, value, onChange, onClick, type = 'text', disabled = false, error = false, helperText = '', multiline = false, rows = 1, InputProps, inputProps, inputRef, ownerState, sx, className, ...rest }, ref) => {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [legendWidth, setLegendWidth] = React.useState(0);
  const legendRef = React.useRef(null);
  const hasPlaceholder = Boolean(inputProps?.placeholder || rest.placeholder);
  const isFloating = focused || (value !== undefined && value !== null && value.toString().length > 0) || type === 'date' || type === 'datetime-local' || type === 'time' || hasPlaceholder;

  const InputComponent = multiline ? 'textarea' : 'input';

  React.useLayoutEffect(() => {
    if (legendRef.current) {
      const span = legendRef.current.querySelector('span');
      if (span) setLegendWidth(span.scrollWidth);
    }
  }, [label]);

  let borderColor = '#cbd5e1'; // Slate 300 — theme border token
  if (error) borderColor = '#d32f2f';
  else if (focused) borderColor = '#0056b3';
  else if (hovered) borderColor = '#94a3b8';

  // Use legend's actual offsetWidth — this IS the border notch width, so bg cut = border cut exactly
  const nL = 11; // fieldset padding (12px) - fill offset (1px)
  const nT = 7;
  const nR = nL + legendWidth;
  const clipPath = isFloating && legendWidth > 0
    ? `polygon(0px 0px, ${nL}px 0px, ${nL}px ${nT}px, ${nR}px ${nT}px, ${nR}px 0px, 100% 0px, 100% 100%, 0px 100%)`
    : undefined;

  return (
    <Box
      ref={ref}
      sx={{ position: 'relative', width: '100%', mb: helperText ? 2.5 : 0, ...sx }}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <Box
        ref={InputProps?.ref}
        sx={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}
      >
        {/* White fill with clip-path notch at exactly label width */}
        <Box sx={{
          position: 'absolute', top: 0, left: '1px', right: '1px', bottom: '1px',
          backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
          borderRadius: '7px', zIndex: 0,
          clipPath: clipPath,
          transition: 'clip-path 0.05s ease-in-out',
        }} />

        <InputComponent
          ref={inputRef}
          onClick={onClick}
          type={multiline ? undefined : type}
          rows={multiline ? rows : undefined}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
          {...rest}
          placeholder={isFloating ? (inputProps?.placeholder || rest.placeholder || '') : ''}
          style={{
            width: '100%',
            paddingTop: '12px', paddingBottom: '12px',
            paddingLeft: '14px', paddingRight: InputProps?.endAdornment ? '48px' : '14px',
            fontSize: '15px',
            backgroundColor: 'transparent', border: 'none', outline: 'none',
            boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a',
            position: 'relative', zIndex: 2, resize: multiline ? 'vertical' : 'none',
            cursor: disabled ? 'default' : (onClick ? 'pointer' : 'text'), borderRadius: '8px',
            height: multiline ? 'auto' : '45px',
            ...(inputProps?.style || {})
          }}
        />

        {InputProps?.endAdornment && (
          <Box sx={{ position: 'absolute', right: '10px', zIndex: 3, display: 'flex' }}>
            {InputProps.endAdornment}
          </Box>
        )}

        <fieldset
          style={{
            position: 'absolute', top: '-5px', left: 0, right: 0, bottom: 0,
            margin: 0, padding: '0 12px', pointerEvents: 'none',
            borderRadius: '8px', borderStyle: 'solid',
            borderWidth: focused ? '1.5px' : '1px',
            borderColor: borderColor,
            background: 'none',
            transition: 'border-color 0.2s, border-width 0.2s',
            zIndex: 1, boxSizing: 'border-box',
          }}
        >
          <legend
            ref={legendRef}
            style={{
              width: 'auto', maxWidth: isFloating ? '100%' : '0.01px',
              padding: 0, margin: 0, float: 'none', display: 'block',
              height: '11px', fontSize: '12px', visibility: 'hidden',
              whiteSpace: 'nowrap', overflow: 'hidden',
              transition: 'max-width 50ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
            }}
          >
            <span style={{ padding: '0 4px', display: 'inline-block' }}>{label}</span>
          </legend>
        </fieldset>
      </Box>

      <label
        style={{
          position: 'absolute', left: '12px',
          top: isFloating ? '-7px' : (multiline ? '12px' : '50%'),
          transform: isFloating ? 'translateY(0)' : (multiline ? 'translateY(0)' : 'translateY(-50%)'),
          fontSize: isFloating ? '12px' : '15px',
          color: error ? '#d32f2f' : focused ? '#0056b3' : disabled ? '#94a3b8' : '#64748b',
          backgroundColor: 'transparent', padding: '0 4px',
          transition: 'all 0.2s ease-in-out', pointerEvents: 'none', zIndex: 3,
          lineHeight: '14px',
        }}
      >
        {label}
      </label>

      {error && helperText && (
        <Typography sx={{ position: 'absolute', bottom: '-20px', left: '14px', color: '#d32f2f', fontSize: '0.75rem' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
});

export const CustomFloatingPhoneInput = ({ label, countryCode, onCountryCodeChange, value, onChange, error = false, disabled = false, helperText = '', endAdornment }) => {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [legendWidth, setLegendWidth] = React.useState(0);
  const legendRef = React.useRef(null);
  const containerRef = React.useRef(null);

  const [searchQuery, setSearchQuery] = React.useState('');
  const { userLocation } = useAccessibility();

  const isFloating = focused || isOpen || (value !== undefined && value !== null && value.toString().length > 0);

  const sortedCountries = React.useMemo(() => {
    const lat = userLocation?.lat || 20.5937;
    const lon = userLocation?.lon || 78.9629;
    return sortLocationsByDistance(gazeteer.Countries, lat, lon, 'countries');
  }, [userLocation]);

  React.useLayoutEffect(() => {
    if (legendRef.current) {
      const span = legendRef.current.querySelector('span');
      if (span) setLegendWidth(span.scrollWidth);
    }
  }, [label]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocused(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let borderColor = '#cbd5e1'; // Slate 300 — theme border token
  if (error) borderColor = '#d32f2f';
  else if (focused || isOpen) borderColor = '#0056b3';
  else if (hovered) borderColor = '#94a3b8';

  const nL = 11;
  const nT = 7;
  const nR = nL + legendWidth;
  const clipPath = isFloating && legendWidth > 0
    ? `polygon(0px 0px, ${nL}px 0px, ${nL}px ${nT}px, ${nR}px ${nT}px, ${nR}px 0px, 100% 0px, 100% 100%, 0px 100%)`
    : undefined;

  const countryOptions = sortedCountries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phoneCode && c.phoneCode.includes(searchQuery))
  );

  // find selected country to show flag in input
  const selectedCountryObj = sortedCountries.find(c => c.phoneCode === (countryCode || '+91'));

  return (
    <Box
      ref={containerRef}
      sx={{ position: 'relative', width: '100%', mb: helperText ? 2.5 : 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Box sx={{
          position: 'absolute', top: 0, left: '1px', right: '1px', bottom: '1px',
          backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
          borderRadius: '7px', zIndex: 0,
          clipPath: clipPath,
          transition: 'clip-path 0.05s ease-in-out',
        }} />

        <Box sx={{ display: 'flex', width: '100%', position: 'relative', zIndex: 2 }}>
          <Box
            onClick={() => {
              if (!disabled) {
                setIsOpen(!isOpen);
                setFocused(true);
              }
            }}
            style={{
              width: '95px', padding: '12px 0 12px 14px', fontSize: '15px',
              backgroundColor: 'transparent', border: 'none', outline: 'none',
              boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a',
              cursor: disabled ? 'default' : 'pointer', borderRadius: '8px 0 0 8px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            {selectedCountryObj && <img src={selectedCountryObj.flagUrl} alt="" style={{ width: '20px', height: 'auto' }} />}
            <span style={{ fontWeight: 600 }}>{countryCode || '+91'}</span>
          </Box>

          <Box sx={{
            position: 'absolute', left: '75px', top: '12px', pointerEvents: 'none',
            color: (focused || isOpen) ? '#0056b3' : '#64748b', zIndex: 3,
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease, color 0.2s ease'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </Box>

          <Box sx={{ width: '1px', bgcolor: '#e2e8f0', my: 1.5 }} />

          <input
            type="tel"
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              flex: 1, padding: '12px 14px', fontSize: '15px',
              backgroundColor: 'transparent', border: 'none', outline: 'none',
              boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a',
              cursor: disabled ? 'default' : 'text', borderRadius: '0 8px 8px 0',
              paddingRight: endAdornment ? '80px' : '14px',
            }}
          />

          {endAdornment && (
            <Box sx={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 3, display: 'flex' }}>
              {endAdornment}
            </Box>
          )}
        </Box>

        <fieldset
          style={{
            position: 'absolute', top: '-5px', left: 0, right: 0, bottom: 0,
            margin: 0, padding: '0 12px', pointerEvents: 'none',
            borderRadius: '8px', borderStyle: 'solid',
            borderWidth: (focused || isOpen) ? '1.5px' : '1px',
            borderColor: borderColor,
            background: 'none',
            transition: 'border-color 0.2s, border-width 0.2s',
            zIndex: 1, boxSizing: 'border-box',
          }}
        >
          <legend
            ref={legendRef}
            style={{
              width: 'auto', maxWidth: isFloating ? '100%' : '0.01px',
              padding: 0, margin: 0, float: 'none', display: 'block',
              height: '11px', fontSize: '12px', visibility: 'hidden',
              whiteSpace: 'nowrap', overflow: 'hidden',
              transition: 'max-width 50ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
            }}
          >
            <span style={{ padding: '0 4px', display: 'inline-block' }}>{label}</span>
          </legend>
        </fieldset>
      </Box>

      <label
        style={{
          position: 'absolute', left: isFloating ? '12px' : '110px',
          top: isFloating ? '-7px' : '50%',
          transform: isFloating ? 'translateY(0)' : 'translateY(-50%)',
          fontSize: isFloating ? '12px' : '15px',
          color: error ? '#d32f2f' : (focused || isOpen) ? '#0056b3' : disabled ? '#94a3b8' : '#64748b',
          backgroundColor: 'transparent', padding: '0 4px',
          transition: 'all 0.2s ease-in-out', pointerEvents: 'none', zIndex: 3,
          lineHeight: '14px',
        }}
      >
        {label}
      </label>

      {/* Custom Dropdown Menu for Country Code */}
      {isOpen && (
        <Box sx={{
          position: 'absolute', top: '100%', left: 0, width: '260px', mt: '8px',
          bgcolor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid #cbd5e1',
          boxShadow: 'none',
          zIndex: 9999, maxHeight: '300px', overflowY: 'auto', py: 1,
          display: 'flex', flexDirection: 'column'
        }}>
          <Box sx={{ px: 2, py: 1.5, position: 'sticky', top: 0, bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', zIndex: 2, borderBottom: '1px solid #cbd5e1' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9', borderRadius: '8px', px: 1.5, py: 1 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                autoFocus
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  border: 'none', background: 'transparent', outline: 'none',
                  width: '100%', marginLeft: '8px', fontSize: '14px',
                  color: '#0f172a', fontFamily: 'inherit'
                }}
              />
            </Box>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', pt: 1 }}>
            {countryOptions.length === 0 ? (
              <Box sx={{ px: 2, py: 1.5, color: '#94a3b8', fontSize: '14px' }}>No results found</Box>
            ) : (
              countryOptions.map((opt, i) => {
                const isSelected = (countryCode || '+91') === opt.phoneCode;
                return (
                  <Box
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCountryCodeChange({ target: { value: opt.phoneCode } });
                      setIsOpen(false);
                      setFocused(false);
                      setSearchQuery('');
                    }}
                    sx={{
                      boxSizing: 'border-box',
                      borderRadius: '6px',
                      margin: '2px 8px',
                      width: 'calc(100% - 16px)',
                      minHeight: '38px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      bgcolor: isSelected ? '#f1f5f9' : 'transparent',
                      color: isSelected ? '#0056b3' : '#334155',
                      fontWeight: isSelected ? 500 : 400,
                      fontSize: '14px',
                      lineHeight: 1.25,
                      transition: 'background-color 0.2s ease, color 0.2s ease',
                      '&:hover': { bgcolor: '#f1f5f9', color: '#0056b3' },
                      '&:active': { bgcolor: '#e2e8f0' }
                    }}
                  >
                    <img src={opt.flagUrl} alt="" style={{ width: '20px', height: 'auto', objectFit: 'cover' }} />
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.name}</span>
                    <span style={{ fontWeight: 500, color: isSelected ? '#0056b3' : '#64748b' }}>{opt.phoneCode}</span>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      )}

      {error && helperText && (
        <Typography sx={{ position: 'absolute', bottom: '-20px', left: '14px', color: '#d32f2f', fontSize: '0.75rem' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export const CustomFloatingSelect = ({ label, value, onChange, options = [], error = false, disabled = false, searchable = undefined }) => {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [legendWidth, setLegendWidth] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const legendRef = React.useRef(null);
  const containerRef = React.useRef(null);

  // Auto-enable search if there are more than 10 options, unless explicitly set
  const isSearchable = searchable !== undefined ? searchable : options.length > 10;

  const isFloating = focused || isOpen || (value !== undefined && value !== null && value.toString().length > 0);

  React.useLayoutEffect(() => {
    if (legendRef.current) {
      const span = legendRef.current.querySelector('span');
      if (span) setLegendWidth(span.scrollWidth);
    }
  }, [label]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let borderColor = '#cbd5e1'; // Slate 300 — theme border token
  if (error) borderColor = '#d32f2f';
  else if (focused || isOpen) borderColor = '#0056b3';
  else if (hovered) borderColor = '#94a3b8';

  const nL = 11;
  const nT = 7;
  const nR = nL + legendWidth;
  const clipPath = isFloating && legendWidth > 0
    ? `polygon(0px 0px, ${nL}px 0px, ${nL}px ${nT}px, ${nR}px ${nT}px, ${nR}px 0px, 100% 0px, 100% 100%, 0px 100%)`
    : undefined;

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!isSearchable || !searchQuery) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(opt => {
      const searchableStr = opt.searchStr ? opt.searchStr : opt.label.toLowerCase();
      return searchableStr.includes(q);
    });
  }, [options, isSearchable, searchQuery]);

  return (
    <Box
      ref={containerRef}
      sx={{ position: 'relative', width: '100%' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box
        sx={{ position: 'relative', width: '100%', cursor: disabled ? 'default' : 'pointer' }}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setFocused(true);
          }
        }}
      >
        {/* White fill with clip-path notch at exactly label width */}
        <Box sx={{
          position: 'absolute', top: 0, left: '1px', right: '1px', bottom: '1px',
          backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
          borderRadius: '7px', zIndex: 0,
          clipPath: clipPath,
          transition: 'clip-path 0.05s ease-in-out',
        }} />

        <Box
          style={{
            width: '100%', padding: '0 14px', fontSize: '15px',
            backgroundColor: 'transparent', border: 'none', outline: 'none',
            boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a',
            position: 'relative', zIndex: 2, height: '45px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          {selectedOption && selectedOption.flagUrl && (
            <img src={selectedOption.flagUrl} alt="" style={{ width: '20px', height: '15px', objectFit: 'cover' }} />
          )}
          {selectedOption ? selectedOption.label : ''}
        </Box>

        <fieldset
          style={{
            position: 'absolute', top: '-5px', left: 0, right: 0, bottom: 0,
            margin: 0, padding: '0 12px', pointerEvents: 'none',
            borderRadius: '8px', borderStyle: 'solid',
            borderWidth: (focused || isOpen) ? '1.5px' : '1px',
            borderColor: borderColor,
            background: 'none',
            transition: 'border-color 0.2s, border-width 0.2s',
            zIndex: 1, boxSizing: 'border-box',
          }}
        >
          <legend
            ref={legendRef}
            style={{
              width: 'auto', maxWidth: isFloating ? '100%' : '0.01px',
              padding: 0, margin: 0, float: 'none', display: 'block',
              height: '11px', fontSize: '12px', visibility: 'hidden',
              whiteSpace: 'nowrap', overflow: 'hidden',
              transition: 'max-width 50ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
            }}
          >
            <span style={{ padding: '0 4px', display: 'inline-block' }}>{label}</span>
          </legend>
        </fieldset>
      </Box>

      <label
        style={{
          position: 'absolute', left: '12px',
          top: isFloating ? '-7px' : '50%',
          transform: isFloating ? 'translateY(0)' : 'translateY(-50%)',
          fontSize: isFloating ? '12px' : '15px',
          color: error ? '#d32f2f' : (focused || isOpen) ? '#0056b3' : disabled ? '#94a3b8' : '#64748b',
          backgroundColor: 'transparent', padding: '0 4px',
          transition: 'all 0.2s ease-in-out', pointerEvents: 'none', zIndex: 3,
          lineHeight: '14px',
        }}
      >
        {label}
      </label>

      <Box sx={{
        position: 'absolute', right: '14px', top: '12px',
        pointerEvents: 'none',
        color: (focused || isOpen) ? '#0056b3' : '#64748b',
        zIndex: 4,
        transform: isOpen ? 'rotate(180deg)' : 'none',
        transition: 'transform 0.2s ease, color 0.2s ease'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </Box>

      {/* Custom Dropdown Menu aligned with global theme */}
      {isOpen && (
        <Box sx={{
          position: 'absolute', top: '100%', left: 0, right: 0, mt: '8px',
          bgcolor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid #cbd5e1',
          boxShadow: 'none',
          zIndex: 9999, display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {isSearchable && (
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #cbd5e1' }} onClick={(e) => e.stopPropagation()}>
              <Box sx={{
                display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9',
                borderRadius: '8px', px: 1.5, py: 1
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none', background: 'transparent', outline: 'none',
                    width: '100%', marginLeft: '8px', fontSize: '14px',
                    color: '#0f172a', fontFamily: 'inherit'
                  }}
                />
              </Box>
            </Box>
          )}

          <Box sx={{ maxHeight: '250px', overflowY: 'auto', py: 1 }}>
            {filteredOptions.length === 0 ? (
              <Box sx={{ px: 2, py: 1.5, color: '#94a3b8', fontSize: '15px' }}>No options found</Box>
            ) : (
              filteredOptions.map((opt, i) => {
                const isSelected = value === opt.value;
                return (
                  <Box
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ target: { value: opt.value } });
                      setIsOpen(false);
                      setFocused(false);
                      setSearchQuery('');
                    }}
                    sx={{
                      boxSizing: 'border-box',
                      borderRadius: '6px',
                      margin: '2px 8px',
                      width: 'calc(100% - 16px)',
                      minHeight: '38px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      bgcolor: isSelected ? '#f1f5f9' : 'transparent',
                      color: isSelected ? '#0056b3' : '#334155',
                      fontWeight: isSelected ? 500 : 400,
                      fontSize: '14px',
                      lineHeight: 1.25,
                      transition: 'background-color 0.2s ease, color 0.2s ease',
                      '&:hover': { bgcolor: '#f1f5f9', color: '#0056b3' },
                      '&:active': { bgcolor: '#e2e8f0' }
                    }}
                  >
                    {opt.flagUrl && (
                      <img src={opt.flagUrl} alt="" style={{ width: '20px', height: '15px', objectFit: 'cover', marginRight: '8px' }} />
                    )}
                    {opt.label}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export const CustomFloatingDatePicker = ({ label, value, onChange, error, helperText, disabled, disableFuture = false }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showMonthSelect, setShowMonthSelect] = React.useState(false);
  const [showYearSelect, setShowYearSelect] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(value ? new Date(value) : new Date());
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowMonthSelect(false);
        setShowYearSelect(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (disableFuture && nextMonth > new Date()) return;
    setCurrentMonth(nextMonth);
  };

  const handleDateSelect = (day) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (disableFuture && selected > new Date()) return;
    const yyyy = selected.getFullYear();
    const mm = String(selected.getMonth() + 1).padStart(2, '0');
    const dd = String(selected.getDate()).padStart(2, '0');
    onChange({ target: { value: `${yyyy}-${mm}-${dd}` } });
    setIsOpen(false);
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const selectedDate = value ? new Date(value) : null;

  let displayValue = '';
  if (value) {
    const [y, m, d] = value.split('-');
    if (y && m && d) displayValue = `${d}/${m}/${y}`;
  }

  const currentYearNum = new Date().getFullYear();
  const maxYearNum = disableFuture ? currentYearNum : currentYearNum + 19;
  const yearsArray = Array.from({length: maxYearNum - (currentYearNum - 100) + 1}, (_, i) => (currentYearNum - 100) + i).reverse();

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%' }}>
      <CustomFloatingInput
        label={label}
        value={displayValue}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        error={error}
        helperText={helperText}
        disabled={disabled}
        inputProps={{ readOnly: true, style: { cursor: disabled ? 'default' : 'pointer' } }}
        InputProps={{
          endAdornment: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0056b3' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          )
        }}
      />

      {isOpen && (
        <Box sx={{
          position: 'absolute', top: '100%', left: 0, mt: '8px', zIndex: 9999,
          bgcolor: '#ffffff', borderRadius: '12px', p: '28px',
          boxShadow: 'none',
          border: '1px solid #cbd5e1', width: '300px',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, position: 'relative' }}>
              <Box 
                onClick={(e) => { e.stopPropagation(); setShowMonthSelect(!showMonthSelect); setShowYearSelect(false); }}
                sx={{ cursor: 'pointer', p: 0.5, borderRadius: 1, '&:hover': { bgcolor: '#f1f5f9' }, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}
              >
                {monthNames[month]}
              </Box>
              <Box 
                onClick={(e) => { e.stopPropagation(); setShowYearSelect(!showYearSelect); setShowMonthSelect(false); }}
                sx={{ cursor: 'pointer', p: 0.5, borderRadius: 1, '&:hover': { bgcolor: '#f1f5f9' }, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}
              >
                {year}
              </Box>
              <svg onClick={(e) => { e.stopPropagation(); setShowYearSelect(!showYearSelect); setShowMonthSelect(false); }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0056b3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px', cursor: 'pointer' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>

              {/* Month Dropdown */}
              {showMonthSelect && (
                <Box sx={{
                  position: 'absolute', top: '100%', left: 0, mt: '2px',
                  width: '130px', maxHeight: '220px', overflowY: 'auto',
                  bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)',
                  borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: 'none',
                  zIndex: 10001, py: '4px'
                }}>
                  {monthNames.map((m, i) => {
                    const isDisabledMonth = disableFuture && year === currentYearNum && i > new Date().getMonth();
                    const isSelected = month === i;
                    return (
                      <Box 
                        key={i} 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (isDisabledMonth) return;
                          setCurrentMonth(new Date(year, i, 1)); 
                          setShowMonthSelect(false); 
                        }}
                        sx={{ 
                          boxSizing: 'border-box',
                          borderRadius: '8px',
                          margin: '2px 6px',
                          width: 'calc(100% - 12px)',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isDisabledMonth ? 'not-allowed' : 'pointer', 
                          opacity: isDisabledMonth ? 0.4 : 1,
                          bgcolor: isSelected ? '#eff6ff' : 'transparent',
                          color: isSelected ? '#0056b3' : '#334155', 
                          fontWeight: isSelected ? 600 : 400, 
                          fontSize: '14px',
                          transition: 'all 0.15s ease',
                          '&:hover': { 
                            bgcolor: isDisabledMonth ? 'transparent' : '#f8fafc', 
                            color: isDisabledMonth ? 'inherit' : '#0f172a' 
                          }, 
                        }}
                      >
                        {m}
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Year Dropdown */}
              {showYearSelect && (
                <Box sx={{
                  position: 'absolute', top: '100%', left: '40%', mt: '2px',
                  width: '100px', maxHeight: '220px', overflowY: 'auto',
                  bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)',
                  borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: 'none',
                  zIndex: 10001, py: '4px'
                }}>
                  {yearsArray.map(y => {
                    const isSelected = year === y;
                    return (
                      <Box 
                        key={y} 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const newMonth = (disableFuture && y === currentYearNum && month > new Date().getMonth()) ? new Date().getMonth() : month;
                          setCurrentMonth(new Date(y, newMonth, 1)); 
                          setShowYearSelect(false); 
                        }}
                        sx={{ 
                          boxSizing: 'border-box',
                          borderRadius: '8px',
                          margin: '2px 6px',
                          width: 'calc(100% - 12px)',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          bgcolor: isSelected ? '#eff6ff' : 'transparent',
                          color: isSelected ? '#0056b3' : '#334155', 
                          fontWeight: isSelected ? 600 : 400, 
                          fontSize: '14px',
                          transition: 'all 0.15s ease',
                          '&:hover': { 
                            bgcolor: '#f8fafc', 
                            color: '#0f172a' 
                          }, 
                        }}
                      >
                        {y}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Box onClick={handlePrevMonth} sx={{ cursor: 'pointer', color: '#0056b3', display: 'flex', p: 0.5 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </Box>
              <Box onClick={handleNextMonth} sx={{ cursor: (disableFuture && new Date(year, month + 1, 1) > new Date()) ? 'not-allowed' : 'pointer', opacity: (disableFuture && new Date(year, month + 1, 1) > new Date()) ? 0.3 : 1, color: '#0056b3', display: 'flex', p: 0.5 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1.5, textAlign: 'center' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <Box key={i} sx={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{d}</Box>
            ))}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 1.2, textAlign: 'center' }}>
            {days.map((d, i) => {
              if (!d) return <Box key={i} />;

              const isSelected = selectedDate && selectedDate.getDate() === d && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
              const today = new Date();
              const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

              return (
                <Box
                  key={i}
                  onClick={(e) => { e.stopPropagation(); handleDateSelect(d); }}
                  sx={{
                    width: '32px', height: '32px', mx: 'auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '15px', fontWeight: (isSelected || isToday) ? 700 : 500,
                    color: isSelected ? '#0f172a' : isToday ? '#0056b3' : '#0f172a',
                    bgcolor: isSelected ? '#f0f9ff' : 'transparent',
                    border: isSelected ? '1px solid #0056b3' : isToday ? '1px dashed #94a3b8' : '1px solid transparent',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isSelected ? '#f0f9ff' : '#f1f5f9'
                    }
                  }}
                >
                  {d}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export const CustomFloatingCountrySelect = ({ label, value, onChange, error, helperText, disabled }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [legendWidth, setLegendWidth] = React.useState(0);
  const legendRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const { userLocation } = useAccessibility();

  const isFloating = focused || isOpen || (value !== undefined && value !== null && value.toString().length > 0);

  const sortedCountries = React.useMemo(() => {
    const lat = userLocation?.lat || 20.5937;
    const lon = userLocation?.lon || 78.9629;
    return sortLocationsByDistance(gazeteer.Countries, lat, lon, 'countries');
  }, [userLocation]);

  React.useLayoutEffect(() => {
    if (legendRef.current) {
      const span = legendRef.current.querySelector('span');
      if (span) setLegendWidth(span.scrollWidth);
    }
  }, [label, isFloating]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocused(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let borderColor = '#cbd5e1'; // Slate 300 — theme border token
  if (error) borderColor = '#d32f2f';
  else if (focused || isOpen) borderColor = '#0056b3';
  else if (hovered) borderColor = '#94a3b8';

  const nL = 11;
  const nT = 7;
  const nR = nL + legendWidth;
  const clipPath = isFloating && legendWidth > 0
    ? `polygon(0px 0px, ${nL}px 0px, ${nL}px ${nT}px, ${nR}px ${nT}px, ${nR}px 0px, 100% 0px, 100% 100%, 0px 100%)`
    : undefined;

  const filteredCountries = sortedCountries.filter(c =>
    (c.nationality || c.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phoneCode && c.phoneCode.includes(searchQuery))
  );

  // When value is provided (like "Indian"), match it against nationality or name.
  const selectedCountryObj = gazeteer.Countries.find(c => (c.nationality || c.name) === value || c.name === value);

  return (
    <Box
      ref={containerRef}
      sx={{ position: 'relative', width: '100%', mb: helperText ? 2.5 : 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (!disabled) {
          setIsOpen(!isOpen);
          setFocused(true);
        }
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        <Box sx={{
          position: 'absolute', top: 0, left: '1px', right: '1px', bottom: '1px',
          backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
          borderRadius: '7px', zIndex: 0,
          clipPath: clipPath,
          transition: 'clip-path 0.05s ease-in-out',
        }} />

        <Box sx={{
          width: '100%', padding: '0 48px 0 14px', fontSize: '15px',
          backgroundColor: 'transparent', border: 'none', outline: 'none',
          boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a',
          position: 'relative', zIndex: 2, cursor: disabled ? 'default' : 'pointer',
          borderRadius: '8px', height: '45px', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          {selectedCountryObj && <img src={selectedCountryObj.flagUrl} alt="" style={{ width: '20px', height: 'auto' }} />}
          {value || ''}
        </Box>

        <fieldset
          style={{
            position: 'absolute', top: '-5px', left: 0, right: 0, bottom: 0,
            margin: 0, padding: '0 12px', pointerEvents: 'none',
            borderRadius: '8px', borderStyle: 'solid',
            borderWidth: (focused || isOpen) ? '1.5px' : '1px',
            borderColor: borderColor,
            background: 'none',
            transition: 'border-color 0.2s, border-width 0.2s',
            zIndex: 1, boxSizing: 'border-box',
          }}
        >
          <legend
            ref={legendRef}
            style={{
              float: 'unset', width: 'auto', overflow: 'hidden', display: 'block',
              padding: 0, height: '11px', fontSize: '12px', visibility: 'hidden',
              maxWidth: isFloating ? '100%' : '0.01px', whiteSpace: 'nowrap',
              transition: 'max-width 50ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
            }}
          >
            <span style={{ paddingLeft: '5px', paddingRight: '5px', display: 'inline-block', opacity: 0, visibility: 'visible' }}>
              {label}
            </span>
          </legend>
        </fieldset>

        <label
          style={{
            position: 'absolute', left: '12px',
            top: isFloating ? '-7px' : '50%',
            transform: isFloating ? 'translateY(0)' : 'translateY(-50%)',
            fontSize: isFloating ? '12px' : '15px',
            color: error ? '#d32f2f' : (focused || isOpen) ? '#0056b3' : disabled ? '#94a3b8' : '#64748b',
            backgroundColor: 'transparent', padding: '0 4px',
            transition: 'all 0.2s ease-in-out', pointerEvents: 'none', zIndex: 3,
            lineHeight: '14px',
          }}
        >
          {label}
        </label>

        <Box sx={{
          position: 'absolute', right: '14px', top: '12px',
          pointerEvents: 'none',
          color: (focused || isOpen) ? '#0056b3' : '#64748b',
          zIndex: 4,
          transform: isOpen ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s ease, color 0.2s ease'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </Box>
      </Box>

      {error && helperText && (
        <Typography sx={{ color: '#d32f2f', fontSize: '12px', mt: '4px', ml: '14px' }}>
          {helperText}
        </Typography>
      )}

      {isOpen && (
        <Box sx={{
          position: 'absolute', top: '100%', left: 0, right: 0, mt: '8px',
          bgcolor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)',
          borderRadius: '16px', border: '1px solid #cbd5e1',
          boxShadow: 'none',
          zIndex: 9999, display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #cbd5e1' }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9',
              borderRadius: '8px', px: 1.5, py: 1
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                autoFocus
                type="text"
                placeholder="Search nationality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none', background: 'transparent', outline: 'none',
                  width: '100%', marginLeft: '8px', fontSize: '14px',
                  color: '#0f172a', fontFamily: 'inherit'
                }}
              />
            </Box>
          </Box>
          <Box sx={{ maxHeight: '250px', overflowY: 'auto', py: 1 }}>
            {filteredCountries.length === 0 ? (
              <Box sx={{ px: 2, py: 1.5, color: '#94a3b8', fontSize: '15px' }}>No countries found</Box>
            ) : (
              filteredCountries.map((c, i) => {
                const natValue = c.nationality || c.name;
                const isSelected = value === natValue;
                return (
                  <Box
                    key={c.code || i}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ target: { value: natValue } });
                      setIsOpen(false);
                      setFocused(false);
                      setSearchQuery('');
                    }}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      px: 2, py: 0.75, cursor: 'pointer',
                      bgcolor: isSelected ? '#f1f5f9' : 'transparent',
                      '&:hover': { bgcolor: '#f8fafc' },
                      transition: 'background-color 0.2s ease',
                      mx: 1, borderRadius: '8px', mb: 0
                    }}
                  >
                    <img src={c.flagUrl} alt={c.name} style={{ width: '20px', height: 'auto', boxShadow: 'none' }} />
                    <Typography sx={{ fontSize: '14px', color: isSelected ? '#0056b3' : '#334155', fontWeight: isSelected ? 500 : 400 }}>
                      {natValue}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export const CustomFloatingFileInput = React.forwardRef(({ label, error = false, helperText = '', disabled = false, onChange, ...rest }, ref) => {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [legendWidth, setLegendWidth] = React.useState(0);
  const legendRef = React.useRef(null);

  // File input always has content ("Choose File")
  const isFloating = true;

  React.useLayoutEffect(() => {
    if (legendRef.current) {
      const span = legendRef.current.querySelector('span');
      if (span) setLegendWidth(span.scrollWidth);
    }
  }, [label]);

  let borderColor = '#cbd5e1'; // Slate 300 — theme border token
  if (error) borderColor = '#d32f2f';
  else if (focused) borderColor = '#0056b3';
  else if (hovered) borderColor = '#94a3b8';

  const nL = 11;
  const nT = 7;
  const nR = nL + legendWidth;
  const clipPath = isFloating && legendWidth > 0
    ? `polygon(0px 0px, ${nL}px 0px, ${nL}px ${nT}px, ${nR}px ${nT}px, ${nR}px 0px, 100% 0px, 100% 100%, 0px 100%)`
    : undefined;

  return (
    <Box
      ref={ref}
      sx={{ position: 'relative', width: '100%', mb: helperText ? 2.5 : 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box sx={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        <Box sx={{
          position: 'absolute', top: 0, left: '1px', right: '1px', bottom: '1px',
          backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
          borderRadius: '7px', zIndex: 0,
          clipPath: clipPath,
        }} />

        <input
          type="file"
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
          style={{
            width: '100%',
            paddingTop: '10px', paddingBottom: '10px',
            paddingLeft: '14px', paddingRight: '14px',
            fontSize: '14px',
            backgroundColor: 'transparent', border: 'none', outline: 'none',
            boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a',
            position: 'relative', zIndex: 2,
            cursor: disabled ? 'default' : 'pointer', borderRadius: '8px',
            height: '45px',
            ...(rest.style || {})
          }}
        />

        {/* Inject CSS for file-selector-button just for this component instance */}
        <style>{`
          input[type=file]::file-selector-button {
            border: 1px solid #cbd5e1;
            padding: 4px 10px;
            border-radius: 6px;
            background-color: #f8fafc;
            color: #475569;
            cursor: ${disabled ? 'default' : 'pointer'};
            margin-right: 12px;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s ease;
          }
          input[type=file]::file-selector-button:hover {
            background-color: ${disabled ? '#f8fafc' : '#f1f5f9'};
          }
        `}</style>

        <fieldset
          style={{
            position: 'absolute', top: '-5px', left: 0, right: 0, bottom: 0,
            margin: 0, padding: '0 12px', pointerEvents: 'none',
            borderRadius: '8px', borderStyle: 'solid',
            borderWidth: focused ? '1.5px' : '1px',
            borderColor: borderColor,
            background: 'none',
            transition: 'border-color 0.2s, border-width 0.2s',
            zIndex: 1, boxSizing: 'border-box',
          }}
        >
          <legend
            ref={legendRef}
            style={{
              width: 'auto', maxWidth: isFloating ? '100%' : '0.01px',
              padding: 0, margin: 0, float: 'none', display: 'block',
              height: '11px', fontSize: '12px', visibility: 'hidden',
              whiteSpace: 'nowrap', overflow: 'hidden',
              transition: 'max-width 50ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
            }}
          >
            <span style={{ padding: '0 4px', display: 'inline-block' }}>{label}</span>
          </legend>
        </fieldset>
      </Box>

      <label
        style={{
          position: 'absolute', left: '12px',
          top: isFloating ? '-7px' : '50%',
          transform: isFloating ? 'translateY(0)' : 'translateY(-50%)',
          fontSize: isFloating ? '12px' : '15px',
          color: error ? '#d32f2f' : focused ? '#0056b3' : disabled ? '#94a3b8' : '#64748b',
          backgroundColor: 'transparent', padding: '0 4px',
          transition: 'all 0.2s ease-in-out', pointerEvents: 'none', zIndex: 3,
          lineHeight: '14px',
        }}
      >
        {label}
      </label>

      {helperText && (
        <Typography sx={{ position: 'absolute', bottom: '-20px', left: '14px', fontSize: '11px', color: error ? '#d32f2f' : '#64748b' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
});

export const CustomFloatingSearchableSelect = ({ label, value, onChange, options = [], error, helperText, disabled }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [legendWidth, setLegendWidth] = React.useState(0);
  const legendRef = React.useRef(null);
  const containerRef = React.useRef(null);

  const isFloating = focused || isOpen || (value !== undefined && value !== null && value.toString().length > 0);

  React.useLayoutEffect(() => {
    if (legendRef.current) {
      const span = legendRef.current.querySelector('span');
      if (span) setLegendWidth(span.scrollWidth);
    }
  }, [label, isFloating]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocused(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let borderColor = '#cbd5e1'; // Slate 300 — theme border token
  if (error) borderColor = '#d32f2f';
  else if (focused || isOpen) borderColor = '#0056b3';
  else if (hovered) borderColor = '#94a3b8';

  const nL = 11;
  const nT = 7;
  const nR = nL + legendWidth;
  const clipPath = isFloating && legendWidth > 0
    ? `polygon(0px 0px, ${nL}px 0px, ${nL}px ${nT}px, ${nR}px ${nT}px, ${nR}px 0px, 100% 0px, 100% 100%, 0px 100%)`
    : undefined;

  const filteredOptions = options.filter(opt => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    // Use searchStr (code + nativeName + script) if available, else fall back to label
    const searchable = typeof opt === 'string' ? opt.toLowerCase() : (opt.searchStr || opt.label.toLowerCase());
    return searchable.includes(q);
  });

  return (
    <Box
      ref={containerRef}
      sx={{ position: 'relative', width: '100%', mb: helperText ? 2.5 : 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (!disabled) {
          setIsOpen(!isOpen);
          setFocused(true);
        }
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        <Box sx={{
          position: 'absolute', top: 0, left: '1px', right: '1px', bottom: '1px',
          backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
          borderRadius: '7px', zIndex: 0,
          clipPath: clipPath,
          transition: 'clip-path 0.05s ease-in-out',
        }} />

        <Box sx={{
          width: '100%', padding: '0 48px 0 14px', fontSize: '15px',
          backgroundColor: 'transparent', border: 'none', outline: 'none',
          boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a',
          position: 'relative', zIndex: 2, cursor: disabled ? 'default' : 'pointer',
          borderRadius: '8px', height: '45px', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          {(() => {
            const selectedOpt = options.find(opt => (typeof opt === 'string' ? opt : opt.value) === value);
            return selectedOpt ? (typeof selectedOpt === 'string' ? selectedOpt : selectedOpt.label) : (value || '');
          })()}
        </Box>

        <fieldset
          style={{
            position: 'absolute', top: '-5px', left: 0, right: 0, bottom: 0,
            margin: 0, padding: '0 12px', pointerEvents: 'none',
            borderRadius: '8px', borderStyle: 'solid',
            borderWidth: (focused || isOpen) ? '1.5px' : '1px',
            borderColor: borderColor,
            background: 'none',
            transition: 'border-color 0.2s, border-width 0.2s',
            zIndex: 1, boxSizing: 'border-box',
          }}
        >
          <legend
            ref={legendRef}
            style={{
              float: 'unset', width: 'auto', overflow: 'hidden', display: 'block',
              padding: 0, height: '11px', fontSize: '12px', visibility: 'hidden',
              maxWidth: isFloating ? '100%' : '0.01px', whiteSpace: 'nowrap',
              transition: 'max-width 50ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
            }}
          >
            <span style={{ paddingLeft: '5px', paddingRight: '5px', display: 'inline-block', opacity: 0, visibility: 'visible' }}>
              {label}
            </span>
          </legend>
        </fieldset>

        <label
          style={{
            position: 'absolute', left: '12px',
            top: isFloating ? '-7px' : '50%',
            transform: isFloating ? 'translateY(0)' : 'translateY(-50%)',
            fontSize: isFloating ? '12px' : '15px',
            color: error ? '#d32f2f' : (focused || isOpen) ? '#0056b3' : disabled ? '#94a3b8' : '#64748b',
            backgroundColor: 'transparent', padding: '0 4px',
            transition: 'all 0.2s ease-in-out', pointerEvents: 'none', zIndex: 3,
            lineHeight: '14px',
          }}
        >
          {label}
        </label>

        <Box sx={{
          position: 'absolute', right: '14px', top: '12px',
          pointerEvents: 'none',
          color: (focused || isOpen) ? '#0056b3' : '#64748b',
          zIndex: 4,
          transform: isOpen ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s ease, color 0.2s ease'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </Box>
      </Box>

      {error && helperText && (
        <Typography sx={{ color: '#d32f2f', fontSize: '12px', mt: '4px', ml: '14px' }}>
          {helperText}
        </Typography>
      )}

      {isOpen && (
        <Box sx={{
          position: 'absolute', top: '100%', left: 0, right: 0, mt: '8px',
          bgcolor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)',
          borderRadius: '16px', border: '1px solid #cbd5e1',
          boxShadow: 'none',
          zIndex: 9999, display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #cbd5e1' }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9',
              borderRadius: '8px', px: 1.5, py: 1
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none', background: 'transparent', outline: 'none',
                  width: '100%', marginLeft: '8px', fontSize: '14px',
                  color: '#0f172a', fontFamily: 'inherit'
                }}
              />
            </Box>
          </Box>
          <Box sx={{ maxHeight: '250px', overflowY: 'auto', py: 1 }}>
            {filteredOptions.length === 0 ? (
              <Box sx={{ px: 2, py: 1.5, color: '#94a3b8', fontSize: '15px' }}>No options found</Box>
            ) : (
              filteredOptions.map((opt, i) => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const isSelected = value === optValue;
                return (
                  <Box
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ target: { value: optValue } });
                      setIsOpen(false);
                      setFocused(false);
                      setSearchQuery('');
                    }}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      px: 2, py: 0.75, cursor: 'pointer',
                      bgcolor: isSelected ? '#f1f5f9' : 'transparent',
                      '&:hover': { bgcolor: '#f8fafc' },
                      transition: 'background-color 0.2s ease',
                      mx: 1, borderRadius: '8px', mb: 0
                    }}
                  >
                    <Typography sx={{ fontSize: '14px', color: isSelected ? '#0056b3' : '#334155', fontWeight: isSelected ? 500 : 400 }}>
                      {optLabel}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
