import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { FieldContext } from '../../contexts/FieldContext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { FieldCommentTooltip } from './FieldCommentTooltip';
import CentralDropdown from './CentralDropdown';
import { DropdownListPopup } from './DropdownListPopup';

import gazeteer from '../../data/formated/gazeteer.json';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { sortLocationsByDistance } from '../../lib/geoNormalize';


const withFieldState = (WrappedComponent) => React.forwardRef(function WithFieldState(props, ref) {
  const fieldContext = React.useContext(FieldContext);
  let finalDisabled = props.disabled;
  let comment = null;

  if (fieldContext && fieldContext.isRejected && fieldContext.enabledLabels) {
    finalDisabled = !fieldContext.enabledLabels.includes(props.label);
    if (!finalDisabled && fieldContext.commentsByLabel) {
      comment = fieldContext.commentsByLabel[props.label];
    }
  }

  const content = <WrappedComponent {...props} disabled={finalDisabled} updateRequested={!!comment} ref={ref} />;

  if (!comment) return content;

  return (
    <Box
      sx={{
        position: 'relative',
        width: 'var(--size-full)',
        '& .comment-icon': { opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' },
        '&:hover .comment-icon': { opacity: 1, pointerEvents: 'auto' }
      }}
    >
      {content}
      <FieldCommentTooltip comment={comment} />
    </Box>
  );
});

const BaseCustomFloatingInput = React.forwardRef(({ defaultBorderWidth = '1px', focusedBorderWidth = '1px', label, value, onChange, onClick, type = 'text', disabled = false, error = false, updateRequested = false, helperText = '', multiline = false, rows = 1, InputProps, inputProps, inputRef, ownerState, sx, className, ...rest }, ref) => {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [legendWidth, setLegendWidth] = React.useState(0);
  const [notchL, setNotchL] = React.useState(11);
  const [notchT, setNotchT] = React.useState(7);
  const legendRef = React.useRef(null);
  const fieldsetRef = React.useRef(null);
  const hasPlaceholder = Boolean(inputProps?.placeholder || rest.placeholder);
  const isFloating = focused || (value !== undefined && value !== null && value.toString().length > 0) || type === 'date' || type === 'datetime-local' || type === 'time' || hasPlaceholder;

  const InputComponent = multiline ? 'textarea' : 'input';

  React.useLayoutEffect(() => {
    if (legendRef.current && fieldsetRef.current) {
      const bw = parseFloat(getComputedStyle(fieldsetRef.current).borderLeftWidth) || 1;
      const pl = parseFloat(getComputedStyle(fieldsetRef.current).paddingLeft) || 12;
      setNotchL(pl - bw);
      setNotchT(Math.ceil(legendRef.current.offsetHeight / 2));
      setLegendWidth(legendRef.current.scrollWidth);
    }
  }, [label]);

  let borderColor = 'rgba(30, 79, 163, 0.2)';
  if (error) borderColor = 'var(--color-error)';
  else if (updateRequested) borderColor = 'var(--color-warning)';
  else if (focused) borderColor = 'var(--color-primary)';
  else if (hovered) borderColor = 'rgba(30, 79, 163, 0.4)';

  const nL = notchL;
  const nT = notchT;
  const nR = nL + legendWidth;
  const clipPath = isFloating && legendWidth > 0
    ? `polygon(0px 0px, ${nL}px 0px, ${nL}px ${nT}px, ${nR}px ${nT}px, ${nR}px 0px, 100% 0px, 100% 100%, 0px 100%)`
    : undefined;

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative', width: 'var(--size-full)', ...sx, '--bw': focused ? focusedBorderWidth : defaultBorderWidth,
        '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
        '& input[type=number]': { MozAppearance: 'textfield' }
      }}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <Box
        ref={InputProps?.ref}
        sx={{ position: 'relative', width: 'var(--size-full)', display: 'flex', alignItems: 'center' }}
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
            width: 'var(--size-full)',
            paddingTop: '12px', paddingBottom: '12px',
            paddingLeft: '14px', paddingRight: InputProps?.endAdornment ? '48px' : '14px',
            fontSize: 'var(--font-base)',
            backgroundColor: 'transparent', border: 'none', outline: 'none',
            boxSizing: 'border-box', fontFamily: 'inherit', color: 'var(--color-slate-900)',
            position: 'relative', zIndex: 2, resize: multiline ? 'vertical' : 'none',
            cursor: disabled ? 'default' : (onClick ? 'pointer' : 'text'), borderRadius: 'var(--radius-md)',
            height: multiline ? 'auto' : 'var(--box-height)',
            ...(inputProps?.style || {})
          }}
        />

        <Box sx={{ position: 'absolute', right: '10px', zIndex: 3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {error && typeof helperText === 'string' && helperText.length > 0 && (
            <Tooltip title={helperText} placement="top" arrow PopperProps={{ sx: { zIndex: 9999 } }}>
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', pointerEvents: 'auto' }}>
                <ErrorOutlineIcon sx={{ color: 'var(--color-error)', fontSize: 20 }} />
              </Box>
            </Tooltip>
          )}
          {InputProps?.endAdornment}
        </Box>

        <fieldset
          ref={fieldsetRef}
          style={{
            position: 'absolute', top: '-5px', left: 0, right: 0, bottom: 0,
            margin: 0, padding: '0 12px', pointerEvents: 'none',
            borderRadius: 'var(--radius-md)', borderStyle: 'solid',
            borderWidth: (focused ? focusedBorderWidth : defaultBorderWidth),
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
              height: '11px', fontSize: 'var(--font-xs)', opacity: 0,
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
          color: error ? 'var(--color-error)' : focused ? 'var(--color-primary)' : disabled ? 'var(--color-slate-500)' : 'var(--color-slate-500)',
          backgroundColor: 'transparent', padding: '0 4px',
          transition: 'all 0.2s ease-in-out', pointerEvents: 'none', zIndex: 3,
          lineHeight: '14px',
        }}
      >
        {label}
      </label>

    </Box>
  );
});

const BaseCustomFloatingPhoneInput = ({ defaultBorderWidth = '1px', focusedBorderWidth = '1px', label, countryCode, onCountryCodeChange, value, onChange, error = false, disabled = false, updateRequested = false, helperText = '', endAdornment }) => {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [legendWidth, setLegendWidth] = React.useState(0);
  const [notchL, setNotchL] = React.useState(11);
  const [notchT, setNotchT] = React.useState(7);
  const legendRef = React.useRef(null);
  const fieldsetRef = React.useRef(null);
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
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocused(false);
        setSearchQuery('');
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

  const countryOptions = sortedCountries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phoneCode && c.phoneCode.includes(searchQuery))
  );

  // find selected country to show flag in input
  const selectedCountryObj = sortedCountries.find(c => c.phoneCode === (countryCode || '+91'));

  return (
    <Box
      ref={containerRef}
      sx={{ position: 'relative', width: 'var(--size-full)', '--bw': focused ? focusedBorderWidth : defaultBorderWidth }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box sx={{ position: 'relative', width: 'var(--size-full)', '--bw': focused ? focusedBorderWidth : defaultBorderWidth }}>
        <Box sx={{
          position: 'absolute', top: (focused ? focusedBorderWidth : defaultBorderWidth), left: (focused ? focusedBorderWidth : defaultBorderWidth), right: (focused ? focusedBorderWidth : defaultBorderWidth), bottom: (focused ? focusedBorderWidth : defaultBorderWidth),
          backgroundColor: disabled ? 'rgba(241, 245, 249, 0.5)' : 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: 'var(--radius-md)', zIndex: 0,
          clipPath: clipPath,
          transition: 'clip-path 0.05s ease-in-out',
        }} />


        <Box sx={{ display: 'flex', width: 'var(--size-full)', position: 'relative', zIndex: 2, height: 'var(--box-height)', alignItems: 'center' }}>
          <Box
            onClick={() => {
              if (!disabled) {
                setIsOpen(!isOpen);
                setFocused(true);
              }
            }}
            style={{
              padding: '0 12px 0 14px',
              height: '100%',
              fontSize: 'var(--font-base)',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-slate-900)',
              cursor: disabled ? 'default' : 'pointer',
              borderRadius: '8px 0 0 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {selectedCountryObj && <img src={selectedCountryObj.flagUrl} alt="" style={{ width: '20px', height: 'auto', flexShrink: 0 }} />}
            <div style={{ whiteSpace: 'nowrap', color: 'var(--color-slate-900)' }}>{countryCode || '+91'}</div>
            <svg
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease, color 0.2s ease',
                color: (focused || isOpen) ? 'var(--color-primary)' : 'var(--color-slate-500)',
                flexShrink: 0
              }}
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </Box>

          <Box sx={{ width: '1px', height: '50%', bgcolor: 'rgba(30, 79, 163, 0.3)' }} />

          <input
            type="tel"
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              flex: 1,
              padding: '0 14px 0 12px',
              height: '100%',
              fontSize: 'var(--font-base)',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              color: 'var(--color-slate-900)',
              cursor: disabled ? 'default' : 'text',
              borderRadius: '0 8px 8px 0',
              paddingRight: endAdornment ? '80px' : '14px',
              minWidth: 0
            }}
          />

          <Box sx={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {error && typeof helperText === 'string' && helperText.length > 0 && (
              <Tooltip title={helperText} placement="top" arrow PopperProps={{ sx: { zIndex: 9999 } }}>
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', pointerEvents: 'auto' }}>
                  <ErrorOutlineIcon sx={{ color: 'var(--color-error)', fontSize: 20 }} />
                </Box>
              </Tooltip>
            )}
            {endAdornment}
          </Box>
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
            transition: 'border-color 0.2s, border-width 0.2s',
            zIndex: 1, boxSizing: 'border-box',
          }}
        >
          <legend
            ref={legendRef}
            style={{
              width: 'auto', maxWidth: isFloating ? '100%' : '0.01px',
              padding: 0, margin: 0, float: 'none', display: 'block',
              height: '11px', fontSize: 'var(--font-xs)', opacity: 0,
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
          color: error ? 'var(--color-error)' : (focused || isOpen) ? 'var(--color-primary)' : disabled ? 'var(--color-slate-500)' : 'var(--color-slate-500)',
          backgroundColor: 'transparent', padding: '0 4px',
          transition: 'all 0.2s ease-in-out', pointerEvents: 'none', zIndex: 3,
          lineHeight: '14px',
        }}
      >
        {label}
      </label>

      <DropdownListPopup
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        options={countryOptions.map(opt => ({
          ...opt,
          value: opt.phoneCode,
          label: opt.name,
          renderLabel: (o) => (
            <>
              <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-slate-900)' }}>{o.label}</div>
              <div style={{ fontWeight: '500', color: 'var(--color-slate-500)' }}>{o.phoneCode}</div>
            </>
          )
        }))}
        value={countryCode || '+91'}
        onChange={onCountryCodeChange}
        searchable={true}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

    </Box>
  );
};

const BaseCustomFloatingSelect = CentralDropdown;

const BaseCustomFloatingDatePicker = ({ defaultBorderWidth = '1px', focusedBorderWidth = '1px', label, value, onChange, error, helperText, disabled, updateRequested = false, disableFuture = false }) => {
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
  const yearsArray = Array.from({ length: maxYearNum - (currentYearNum - 100) + 1 }, (_, i) => (currentYearNum - 100) + i).reverse();

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: 'var(--size-full)', '--bw': isOpen ? focusedBorderWidth : defaultBorderWidth }}>
      <BaseCustomFloatingInput
        label={label}
        value={displayValue}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        error={error}
        helperText={helperText}
        disabled={disabled}
        updateRequested={updateRequested}
        inputProps={{ readOnly: true, style: { cursor: disabled ? 'default' : 'pointer' } }}
        InputProps={{
          endAdornment: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
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
          position: 'absolute', top: 'var(--size-full)', left: 0, mt: '8px', zIndex: 'var(--z-modal)',
          bgcolor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', p: '28px',
          border: 'var(--border-thin) solid #cbd5e1', width: '300px',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, position: 'relative' }}>
              <Box
                onClick={(e) => { e.stopPropagation(); setShowMonthSelect(!showMonthSelect); setShowYearSelect(false); }}
                sx={{ cursor: 'pointer', p: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'var(--color-slate-50)' }, fontSize: 'var(--font-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-900)' }}
              >
                {monthNames[month]}
              </Box>
              <Box
                onClick={(e) => { e.stopPropagation(); setShowYearSelect(!showYearSelect); setShowMonthSelect(false); }}
                sx={{ cursor: 'pointer', p: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'var(--color-slate-50)' }, fontSize: 'var(--font-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-slate-900)' }}
              >
                {year}
              </Box>
              <svg onClick={(e) => { e.stopPropagation(); setShowYearSelect(!showYearSelect); setShowMonthSelect(false); }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px', cursor: 'pointer' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>

              {/* Month Dropdown */}
              {showMonthSelect && (
                <Box sx={{
                  position: 'absolute', top: 'var(--size-full)', left: 0, mt: '2px',
                  width: '130px', maxHeight: '220px', overflowY: 'auto',
                  bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)',
                  borderRadius: 'var(--radius-lg)', border: 'var(--border-thin) solid #cbd5e1',
                  zIndex: 'var(--z-popover)', py: '4px'
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
                          borderRadius: 'var(--radius-md)',
                          margin: '2px 6px',
                          width: 'calc(100% - 12px)',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isDisabledMonth ? 'not-allowed' : 'pointer',
                          opacity: isDisabledMonth ? 0.4 : 1,
                          bgcolor: isSelected ? 'var(--color-slate-50)' : 'transparent',
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-slate-700)',
                          fontWeight: isSelected ? 600 : 400,
                          fontSize: 'var(--font-sm)',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            bgcolor: isDisabledMonth ? 'transparent' : 'var(--color-slate-50)',
                            color: isDisabledMonth ? 'inherit' : 'var(--color-slate-900)'
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
                  position: 'absolute', top: 'var(--size-full)', left: '40%', mt: '2px',
                  width: '100px', maxHeight: '220px', overflowY: 'auto',
                  bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)',
                  borderRadius: 'var(--radius-lg)', border: 'var(--border-thin) solid #cbd5e1',
                  zIndex: 'var(--z-popover)', py: '4px'
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
                          borderRadius: 'var(--radius-md)',
                          margin: '2px 6px',
                          width: 'calc(100% - 12px)',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          bgcolor: isSelected ? 'var(--color-slate-50)' : 'transparent',
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-slate-700)',
                          fontWeight: isSelected ? 600 : 400,
                          fontSize: 'var(--font-sm)',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            bgcolor: 'var(--color-slate-50)',
                            color: 'var(--color-slate-900)'
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
              <Box onClick={handlePrevMonth} sx={{ cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', p: 0.5 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </Box>
              <Box onClick={handleNextMonth} sx={{ cursor: (disableFuture && new Date(year, month + 1, 1) > new Date()) ? 'not-allowed' : 'pointer', opacity: (disableFuture && new Date(year, month + 1, 1) > new Date()) ? 0.3 : 1, color: 'var(--color-primary)', display: 'flex', p: 0.5 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1.5, textAlign: 'center' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <Box key={i} sx={{ fontSize: 'var(--font-sm)', color: 'var(--color-slate-500)', fontWeight: 'var(--font-medium)' }}>{d}</Box>
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
                    fontSize: 'var(--font-base)', fontWeight: (isSelected || isToday) ? 700 : 500,
                    color: isSelected ? 'var(--color-slate-900)' : isToday ? 'var(--color-primary)' : 'var(--color-slate-900)',
                    bgcolor: isSelected ? 'var(--color-slate-50)' : 'transparent',
                    border: isSelected ? 'var(--border-thin) solid #0056b3' : isToday ? '1px dashed #94a3b8' : 'var(--border-thin) solid transparent',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isSelected ? 'var(--color-slate-50)' : 'var(--color-slate-50)'
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

const BaseCustomFloatingCountrySelect = ({ defaultBorderWidth = '1px', focusedBorderWidth = '1px', label, value, onChange, error, helperText, disabled, updateRequested = false }) => {
  const { userLocation } = useAccessibility();

  const sortedCountries = React.useMemo(() => {
    const lat = userLocation?.lat || 20.5937;
    const lon = userLocation?.lon || 78.9629;
    return sortLocationsByDistance(gazeteer.Countries, lat, lon, 'countries');
  }, [userLocation]);

  const options = React.useMemo(() => {
    return sortedCountries.map(c => ({
      value: c.nationality || c.name,
      label: c.nationality || c.name,
      flagUrl: c.flagUrl,
      searchStr: (c.nationality || c.name).toLowerCase() + ' ' + c.name.toLowerCase() + ' ' + (c.phoneCode || '')
    }));
  }, [sortedCountries]);

  return (
    <CentralDropdown
      defaultBorderWidth={defaultBorderWidth}
      focusedBorderWidth={focusedBorderWidth}
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      error={error}
      helperText={helperText}
      disabled={disabled}
      updateRequested={updateRequested}
      searchable={true}
    />
  );
};

const BaseCustomFloatingFileInput = React.forwardRef(({ defaultBorderWidth = '1px', focusedBorderWidth = '1px', label, error = false, helperText = '', disabled = false, updateRequested = false, onChange, ...rest }, ref) => {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [legendWidth, setLegendWidth] = React.useState(0);
  const [notchL, setNotchL] = React.useState(11);
  const [notchT, setNotchT] = React.useState(7);
  const legendRef = React.useRef(null);
  const fieldsetRef = React.useRef(null);

  // File input always has content ("Choose File")
  const isFloating = true;

  React.useLayoutEffect(() => {
    if (legendRef.current && fieldsetRef.current) {
      const bw = parseFloat(getComputedStyle(fieldsetRef.current).borderLeftWidth) || 1;
      const pl = parseFloat(getComputedStyle(fieldsetRef.current).paddingLeft) || 12;
      setNotchL(pl - bw);
      setNotchT(Math.ceil(legendRef.current.offsetHeight / 2));
      setLegendWidth(legendRef.current.scrollWidth);
    }
  }, [label]);

  let borderColor = 'rgba(30, 79, 163, 0.2)';
  if (error) borderColor = 'var(--color-error)';
  else if (updateRequested) borderColor = 'var(--color-warning)';
  else if (focused) borderColor = 'var(--color-primary)';
  else if (hovered) borderColor = 'rgba(30, 79, 163, 0.4)';

  const nL = notchL;
  const nT = notchT;
  const nR = nL + legendWidth;
  const clipPath = isFloating && legendWidth > 0
    ? `polygon(0px 0px, ${nL}px 0px, ${nL}px ${nT}px, ${nR}px ${nT}px, ${nR}px 0px, 100% 0px, 100% 100%, 0px 100%)`
    : undefined;

  return (
    <Box
      ref={ref}
      sx={{ position: 'relative', width: 'var(--size-full)', '--bw': focused ? focusedBorderWidth : defaultBorderWidth }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box sx={{ position: 'relative', width: 'var(--size-full)', display: 'flex', alignItems: 'center' }}>
        <Box sx={{
          position: 'absolute', top: (focused ? focusedBorderWidth : defaultBorderWidth), left: (focused ? focusedBorderWidth : defaultBorderWidth), right: (focused ? focusedBorderWidth : defaultBorderWidth), bottom: (focused ? focusedBorderWidth : defaultBorderWidth),
          backgroundColor: disabled ? 'rgba(241, 245, 249, 0.5)' : 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: 'var(--radius-md)', zIndex: 0,
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
            width: 'var(--size-full)',
            paddingTop: '10px', paddingBottom: '10px',
            paddingLeft: '14px', paddingRight: '14px',
            fontSize: 'var(--font-sm)',
            backgroundColor: 'transparent', border: 'none', outline: 'none',
            boxSizing: 'border-box', fontFamily: 'inherit', color: 'var(--color-slate-900)',
            position: 'relative', zIndex: 2,
            cursor: disabled ? 'default' : 'pointer', borderRadius: 'var(--radius-md)',
            height: 'var(--box-height)',
            ...(rest.style || {})
          }}
        />

        {/* Inject CSS for file-selector-button just for this component instance */}
        <style>{`
          input[type=file]::file-selector-button {
            border: var(--border-thin) solid #cbd5e1;
            padding: 4px 10px;
            border-radius: 6px;
            background-color: #f8fafc;
            color: #475569;
            cursor: ${disabled ? 'default' : 'pointer'};
            margin-right: 12px;
            font-size: 12px;
            font-weight: var(--font-medium);
            transition: var(--transition-base);
          }
          input[type=file]::file-selector-button:hover {
            background-color: ${disabled ? 'var(--color-slate-50)' : 'var(--color-slate-50)'};
          }
        `}</style>

        <fieldset
          ref={fieldsetRef}
          style={{
            position: 'absolute', top: '-5px', left: 0, right: 0, bottom: 0,
            margin: 0, padding: '0 12px', pointerEvents: 'none',
            borderRadius: 'var(--radius-md)', borderStyle: 'solid',
            borderWidth: (focused ? focusedBorderWidth : defaultBorderWidth),
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
              height: '11px', fontSize: 'var(--font-xs)', opacity: 0,
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
          color: error ? 'var(--color-error)' : focused ? 'var(--color-primary)' : disabled ? 'var(--color-slate-500)' : 'var(--color-slate-500)',
          backgroundColor: 'transparent', padding: '0 4px',
          transition: 'all 0.2s ease-in-out', pointerEvents: 'none', zIndex: 3,
          lineHeight: '14px',
        }}
      >
        {label}
      </label>

      {helperText && (
        <Tooltip title={helperText} placement="top" arrow PopperProps={{ sx: { zIndex: 9999 } }}>
          <Box component="span" sx={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 3
          }}>
            <ErrorOutlineIcon sx={{ fontSize: '18px', color: error ? 'var(--color-error)' : 'var(--color-slate-400)' }} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
});

export const CustomFloatingSearchableSelect = ({ defaultBorderWidth = '1px', focusedBorderWidth = '1px', label, value, onChange, options = [], error, helperText, disabled, freeSolo = false, multiple = false }) => {
  const formattedOptions = React.useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  return (
    <CentralDropdown
      defaultBorderWidth={defaultBorderWidth}
      focusedBorderWidth={focusedBorderWidth}
      label={label}
      value={value}
      onChange={onChange}
      options={formattedOptions}
      error={error}
      helperText={helperText}
      disabled={disabled}
      searchable={true}
      freeSolo={freeSolo}
      multiple={multiple}
    />
  );
};

const WrappedCustomFloatingInput = withFieldState(BaseCustomFloatingInput);
const WrappedCustomFloatingSelect = withFieldState(BaseCustomFloatingSelect);
const WrappedCustomFloatingPhoneInput = withFieldState(BaseCustomFloatingPhoneInput);
const WrappedCustomFloatingDatePicker = withFieldState(BaseCustomFloatingDatePicker);
const WrappedCustomFloatingCountrySelect = withFieldState(BaseCustomFloatingCountrySelect);
const WrappedCustomFloatingFileInput = withFieldState(BaseCustomFloatingFileInput);

WrappedCustomFloatingInput.displayName = "CustomFloatingInput";
WrappedCustomFloatingFileInput.displayName = "CustomFloatingFileInput";

BaseCustomFloatingInput.displayName = "BaseCustomFloatingInput";
BaseCustomFloatingFileInput.displayName = "BaseCustomFloatingFileInput";

export { WrappedCustomFloatingInput as CustomFloatingInput };
export { WrappedCustomFloatingSelect as CustomFloatingSelect };
export { WrappedCustomFloatingPhoneInput as CustomFloatingPhoneInput };
export { WrappedCustomFloatingDatePicker as CustomFloatingDatePicker };
export { WrappedCustomFloatingCountrySelect as CustomFloatingCountrySelect };
export { WrappedCustomFloatingFileInput as CustomFloatingFileInput };
