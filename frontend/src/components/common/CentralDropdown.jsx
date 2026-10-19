import React from 'react';
import { Box } from '@mui/material';
import { DropdownListPopup } from './DropdownListPopup';

const CentralDropdown = ({ defaultBorderWidth = '1px', focusedBorderWidth = '1px', label, value, onChange, options = [], error = false, disabled = false, updateRequested = false, searchable = undefined, freeSolo = false, multiple = false, sx }) => {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [legendWidth, setLegendWidth] = React.useState(0);
  const [notchL, setNotchL] = React.useState(11);
  const [notchT, setNotchT] = React.useState(7);
  const [searchQuery, setSearchQuery] = React.useState('');
  const legendRef = React.useRef(null);
  const fieldsetRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const dropdownRef = React.useRef(null);

  const finalOptions = React.useMemo(() => {
    let newOptions = [...options];
    if (!multiple && !options.some(opt => opt.value === "" || opt.value === "none")) {
      newOptions = [{ value: "", label: "-- चुनें --" }, ...newOptions];
    }

    if (multiple && Array.isArray(value)) {
      value.forEach(val => {
        if (val && !newOptions.find(o => o.value === val)) {
          newOptions.push({ value: val, label: val });
        }
      });
    } else if (!multiple && value && !newOptions.find(o => o.value === value)) {
      newOptions.push({ value: value, label: value });
    }
    return newOptions;
  }, [options, value, multiple]);

  // Auto-enable search if there are more than 10 options, unless explicitly set
  const isSearchable = searchable !== undefined ? searchable : finalOptions.length > 10;

  const isFloating = focused || isOpen || (multiple ? (Array.isArray(value) && value.length > 0) : (value !== undefined && value !== null && value.toString().length > 0));

  React.useLayoutEffect(() => {
    if (legendRef.current && fieldsetRef.current) {
      const bw = parseFloat(getComputedStyle(fieldsetRef.current).borderLeftWidth) || 1;
      const pl = parseFloat(getComputedStyle(fieldsetRef.current).paddingLeft) || 12;
      setNotchL(pl - bw);
      setNotchT(Math.ceil(legendRef.current.offsetHeight / 2));
      setLegendWidth(legendRef.current.scrollWidth);
    }
  }, [label]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      const inContainer = containerRef.current && containerRef.current.contains(event.target);
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
      if (!inContainer && !inDropdown) {
        setIsOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let borderColor = 'rgba(30, 79, 163, 0.2)';
  if (error) borderColor = 'var(--color-error)';
  else if (updateRequested) borderColor = 'var(--color-warning)';
  else if (focused || isOpen) borderColor = 'var(--color-primary)';
  else if (hovered) borderColor = 'rgba(30, 79, 163, 0.4)';

  const nL = notchL;
  const nT = notchT;
  const nR = nL + legendWidth;
  const clipPath = isFloating && legendWidth > 0
    ? `polygon(0px 0px, ${nL}px 0px, ${nL}px ${nT}px, ${nR}px ${nT}px, ${nR}px 0px, 100% 0px, 100% 100%, 0px 100%)`
    : undefined;

  let displayText = '';
  let displayFlag = null;

  if (multiple && Array.isArray(value)) {
    if (value.length > 0) {
      displayText = value.map(v => {
        const opt = finalOptions.find(o => o.value === v);
        return opt ? opt.label : v;
      }).join(', ');
    }
  } else {
    const selectedOption = finalOptions.find(opt => opt.value === value);
    displayText = (isFloating || (value !== undefined && value !== null && value !== "")) && selectedOption ? selectedOption.label : '';
    displayFlag = (isFloating || (value !== undefined && value !== null && value !== "")) && selectedOption ? selectedOption.flagUrl : null;
  }

  const filteredOptions = React.useMemo(() => {
    if (!isSearchable || !searchQuery) return finalOptions;
    const q = searchQuery.toLowerCase();
    return finalOptions.filter(opt => {
      const searchableStr = opt.searchStr ? opt.searchStr : opt.label.toLowerCase();
      return searchableStr.includes(q);
    });
  }, [finalOptions, isSearchable, searchQuery]);

  return (
    <Box
      ref={containerRef}
      sx={{ position: 'relative', width: 'var(--size-full)', ...sx }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box
        sx={{ position: 'relative', width: 'var(--size-full)', cursor: disabled ? 'default' : 'pointer' }}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setFocused(true);
          }
        }}
      >
        {/* White fill with clip-path notch at exactly label width */}
        <Box sx={{
          position: 'absolute', top: (focused ? focusedBorderWidth : defaultBorderWidth), left: (focused ? focusedBorderWidth : defaultBorderWidth), right: (focused ? focusedBorderWidth : defaultBorderWidth), bottom: (focused ? focusedBorderWidth : defaultBorderWidth),
          backgroundColor: disabled ? 'rgba(241, 245, 249, 0.5)' : 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: 'var(--radius-md)', zIndex: 0,
          clipPath: clipPath,
          transition: 'clip-path 0.05s ease-in-out',
        }} />

        <Box
          style={{
            width: 'var(--size-full)', padding: '0 14px', fontSize: 'var(--font-base)',
            backgroundColor: 'transparent', border: 'none', outline: 'none',
            boxSizing: 'border-box', fontFamily: 'inherit', color: 'var(--color-slate-900)',
            position: 'relative', zIndex: 2, height: 'var(--box-height)',
            display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}
        >
          {displayFlag && (
            <img src={displayFlag} alt="" style={{ width: '20px', height: '15px', objectFit: 'cover' }} />
          )}
          {displayText}
        </Box>

        <fieldset
          ref={fieldsetRef}
          style={{
            position: 'absolute', top: label ? '-5px' : 0, left: 0, right: 0, bottom: 0,
            margin: 0, padding: '0 12px', pointerEvents: 'none',
            borderRadius: 'var(--radius-md)', borderStyle: 'solid',
            borderWidth: (focused || isOpen) ? '1.5px' : '1px',
            borderColor: borderColor,
            background: 'none',
            transition: 'border-color 0.2s, border-width 0.2s',
            zIndex: 1, boxSizing: 'border-box',
          }}>
          <legend
            ref={legendRef}
            style={{
              width: 'auto', maxWidth: isFloating ? 'var(--size-full)' : '0.01px',
              padding: 0, margin: 0, float: 'none', display: 'block',
              height: '11px', fontSize: 'var(--font-xs)', visibility: 'hidden',
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
          color: error ? 'var(--color-error)' : (focused || isOpen) ? 'var(--color-primary)' : disabled ? 'var(--color-slate-500)' : 'var(--color-slate-500)',
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
        color: (focused || isOpen) ? 'var(--color-primary)' : 'var(--color-slate-500)',
        zIndex: 4,
        transform: isOpen ? 'rotate(180deg)' : 'none',
        transition: 'transform 0.2s ease, color 0.2s ease'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </Box>

      {/* Custom Dropdown Menu aligned with global theme */}
      <DropdownListPopup
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        options={filteredOptions}
        value={value}
        onChange={onChange}
        searchable={isSearchable}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        anchorRef={containerRef}
        dropdownRef={dropdownRef}
        freeSolo={freeSolo}
        multiple={multiple}
      />
    </Box>
  );
};

export default CentralDropdown;
