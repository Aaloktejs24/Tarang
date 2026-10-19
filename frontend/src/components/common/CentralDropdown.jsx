import React from 'react';
import { Box } from '@mui/material';
import { DropdownListPopup } from './DropdownListPopup';
import { useFormLoading } from '../../contexts/FormLoadingContext';

const CentralDropdown = ({ defaultBorderWidth = '1px', focusedBorderWidth = '1px', label, value, onChange, options = [], error = false, disabled = false, updateRequested = false, searchable = undefined, freeSolo = false, multiple = false, required = false, sx }) => {
  const isFormLoading = useFormLoading();
  const finalDisabled = disabled || isFormLoading;
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

  // Enable search by default for all dropdowns, unless explicitly set to false
  const isSearchable = searchable !== undefined ? searchable : true;

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

  const nL = notchL;
  const nT = notchT;
  const nR = nL + legendWidth;
  const maskStyles = isFloating && legendWidth > 0 ? {
    WebkitMaskImage: 'linear-gradient(black, black), linear-gradient(black, black), linear-gradient(black, black)',
    WebkitMaskPosition: `0 0, 100% 0, ${nL}px ${nT}px`,
    WebkitMaskSize: `${nL}px 100%, calc(100% - ${nR}px) 100%, ${legendWidth}px calc(100% - ${nT}px)`,
    WebkitMaskRepeat: 'no-repeat',
    maskImage: 'linear-gradient(black, black), linear-gradient(black, black), linear-gradient(black, black)',
    maskPosition: `0 0, 100% 0, ${nL}px ${nT}px`,
    maskSize: `${nL}px 100%, calc(100% - ${nR}px) 100%, ${legendWidth}px calc(100% - ${nT}px)`,
    maskRepeat: 'no-repeat',
  } : {
    WebkitMaskImage: 'none',
    maskImage: 'none'
  };

  let displayText = '';
  let displayFlag = null;

  if (multiple && Array.isArray(value)) {
    if (value.length > 0) {
      displayText = value.map(v => {
        const opt = finalOptions.find(o => o.value === v);
        return opt ? (opt.displayLabel || opt.label) : v;
      }).join(', ');
    }
  } else {
    const selectedOption = finalOptions.find(opt => opt.value === value);
    displayText = (isFloating || (value !== undefined && value !== null && value !== "")) && selectedOption ? (selectedOption.displayLabel || selectedOption.label) : '';
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
      sx={{ position: 'relative', width: 'var(--size-full)', opacity: finalDisabled ? 0.6 : 1, pointerEvents: finalDisabled ? 'none' : 'auto', ...sx }}
    >
      <Box
        sx={{ position: 'relative', width: 'var(--size-full)', cursor: finalDisabled ? 'default' : 'pointer' }}
        onClick={() => {
          if (!finalDisabled) {
            setIsOpen(!isOpen);
            setFocused(true);
          }
        }}
      >
        {/* White fill with clip-path notch at exactly label width */}
        <Box sx={{
          position: 'absolute', top: (focused ? focusedBorderWidth : defaultBorderWidth), left: (focused ? focusedBorderWidth : defaultBorderWidth), right: (focused ? focusedBorderWidth : defaultBorderWidth), bottom: (focused ? focusedBorderWidth : defaultBorderWidth),
          backgroundColor: finalDisabled ? 'rgba(241, 245, 249, 0.5)' : 'var(--glass-bg)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: 'var(--radius-md)', zIndex: 0,
          ...maskStyles,
          transition: 'mask-size 0.05s ease-in-out',
        }} />

        <Box
          style={{
            width: 'var(--size-full)', padding: '0 14px', fontSize: 'var(--font-base)',
            backgroundColor: 'transparent', border: 'none', outline: 'none',
            boxSizing: 'border-box', color: 'var(--color-slate-900)',
            position: 'relative', zIndex: 2, height: 'var(--box-height)',
            display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}
        >
          {displayFlag && (
            <img
              src={displayFlag}
              alt=""
              style={{ width: '20px', height: '15px', objectFit: 'cover' }}
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
          {displayText}
        </Box>

        <fieldset
          ref={fieldsetRef}
          style={{
            position: 'absolute', top: '-5px', left: 0, right: 0, bottom: 0,
            margin: 0, padding: '0 12px', pointerEvents: 'none',
            borderRadius: 'var(--radius-md)', borderStyle: 'solid',
            borderWidth: (focused || isOpen) ? '1.5px' : '1px',
            borderColor: borderColor,
            background: 'none',
            transition: 'border-color var(--transition-base), border-width var(--transition-base)',
            zIndex: 1, boxSizing: 'border-box',
            ...maskStyles,
          }}>
          <legend
            ref={legendRef}
            style={{
              width: 'auto', maxWidth: (isFloating && label) ? 'var(--size-full)' : '0.01px',
              padding: 0, margin: 0, float: 'none', display: 'block',
              height: '11px', fontSize: 'var(--font-xs)', visibility: 'hidden',
              whiteSpace: 'nowrap', overflow: 'hidden',
              transition: 'max-width 50ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
            }}
          >
            <span style={{ padding: label ? '0 4px' : 0, display: 'inline-block' }}>{label}{required && <span style={{ color: 'var(--color-error)' }}> *</span>}</span>
          </legend>
        </fieldset>
      </Box>

      <label
        style={{
          position: 'absolute', left: '12px',
          top: isFloating ? '-9px' : '50%',
          transform: isFloating ? 'translateY(0)' : 'translateY(-50%)',
          fontSize: isFloating ? '12px' : '15px',
          color: error ? 'var(--color-error)' : (focused || isOpen) ? 'var(--color-primary)' : disabled ? 'var(--color-slate-500)' : 'var(--color-slate-500)',
          backgroundColor: 'transparent', padding: '2px 4px',
          transition: 'all var(--transition-base)', pointerEvents: 'none', zIndex: 3,
          lineHeight: isFloating ? '14px' : 'var(--line-height-base)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: isFloating ? 'calc(100% - 24px)' : 'calc(100% - 44px)',
        }}
      >
        {label}{required && <span style={{ color: 'var(--color-error)' }}> *</span>}
      </label>

      <Box sx={{
        position: 'absolute', right: '14px', top: '12px',
        pointerEvents: 'none',
        color: (focused || isOpen) ? 'var(--color-primary)' : 'var(--color-slate-500)',
        zIndex: 4,
        transform: isOpen ? 'rotate(180deg)' : 'none',
        transition: 'transform var(--transition-base), color var(--transition-base)'
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
