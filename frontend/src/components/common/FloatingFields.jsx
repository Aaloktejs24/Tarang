import React from 'react';
import { Box, Typography, InputAdornment, Tooltip, CircularProgress, Popover, IconButton } from '@mui/material';
import { uploadDocument } from '../../lib/uploadService';
import { FieldContext } from '../../contexts/FieldContext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// from '@mui/icons-material/CloudUpload';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { FieldCommentTooltip } from './FieldCommentTooltip';
import SelectDropdown from './SelectDropdown';
const CentralDropdown = SelectDropdown;
import { DropdownListPopup } from './DropdownListPopup';
import { glassPaperSx } from '../../styles/commonStyles';
import gazetteer from '../../data/formatted/gazetteer.json';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { sortLocationsByDistance } from '../../lib/geoNormalize';
import { useFormLoading } from '../../contexts/FormLoadingContext';
import { useToast } from '../../contexts/ToastContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import dayjs from 'dayjs';
import { globalDatePickerSlotProps } from '../../styles/datePickerConfig';
import { CustomTooltip } from './Tooltip';



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
        '& .comment-icon': { opacity: 0, transition: 'opacity var(--transition-base)', pointerEvents: 'none' },
        '&:hover .comment-icon': { opacity: 1, pointerEvents: 'auto' }
      }}
    >
      {content}
      <FieldCommentTooltip comment={comment} />
    </Box>
  );
});

const BaseCustomFloatingInput = React.forwardRef(({ defaultBorderWidth = '1px', focusedBorderWidth = '1px', transparentBackground = false, label, value, onChange, onClick, onFocus, onBlur, type = 'text', disabled = false, error = false, updateRequested = false, helperText = '', multiline = false, rows = 1, required = false, InputProps, inputProps, inputRef, ownerState, sx, className, fullWidth = false, ...rest }, ref) => {
  const isFormLoading = useFormLoading();
  const finalDisabled = disabled || isFormLoading;

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

  let borderColor = 'var(--card-border)';
  if (error) borderColor = 'var(--color-error)';
  else if (updateRequested) borderColor = 'var(--color-warning)';
  else if (focused) borderColor = 'var(--color-primary)';

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

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative', width: 'var(--size-full)', ...sx, '--bw': focused ? focusedBorderWidth : defaultBorderWidth,
        opacity: finalDisabled ? 0.6 : 1, pointerEvents: finalDisabled ? 'none' : 'auto',
        '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
        '& input[type=number]': { MozAppearance: 'textfield' },
        '& input::placeholder': { color: 'var(--color-slate-500)', opacity: 1 },
        '& .MuiIconButton-root': {
          color: 'var(--color-primary)',
          backgroundColor: 'transparent !important',
          padding: 0,
          margin: 0,
          width: '20px',
          height: '20px',
          minWidth: '20px',
          minHeight: '20px',
          '&:hover': { backgroundColor: 'transparent !important' },
          '& svg': { fontSize: '20px', width: '20px', height: '20px', display: 'block' }
        }
      }}
      className={className}
      onClick={onClick}
    >
      <Box
        ref={InputProps?.ref}
        sx={{ position: 'relative', width: 'var(--size-full)', display: 'flex', alignItems: 'center' }}
      >
        {/* White fill with clip-path notch at exactly label width */}
        <Box sx={{
          position: 'absolute', top: (focused ? focusedBorderWidth : defaultBorderWidth), left: (focused ? focusedBorderWidth : defaultBorderWidth), right: (focused ? focusedBorderWidth : defaultBorderWidth), bottom: (focused ? focusedBorderWidth : defaultBorderWidth),
          backgroundColor: transparentBackground ? 'transparent' : (finalDisabled ? 'var(--input-disabled-bg)' : 'var(--input-bg)'),
          backdropFilter: transparentBackground ? 'none' : 'blur(30px)',
          WebkitBackdropFilter: transparentBackground ? 'none' : 'blur(30px)',
          borderRadius: 'var(--radius-md)', zIndex: 0,
          ...maskStyles,
          transition: 'mask-size 0.05s ease-in-out',
        }} />

        <InputComponent
          ref={inputRef}
          onClick={onClick}
          type={multiline ? undefined : type}
          rows={multiline ? rows : undefined}
          value={value || ''}
          onChange={onChange}
          disabled={finalDisabled}
          {...inputProps}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            if (onFocus) onFocus(e);
            if (inputProps?.onFocus) inputProps.onFocus(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            if (onBlur) onBlur(e);
            if (inputProps?.onBlur) inputProps.onBlur(e);
          }}
          placeholder={isFloating ? (inputProps?.placeholder || rest.placeholder || '') : ''}
          style={{
            width: 'var(--size-full)',
            paddingTop: '12px', paddingBottom: '12px',
            paddingLeft: '14px', paddingRight: InputProps?.endAdornment ? '48px' : '14px',
            fontSize: 'var(--font-base)',
            fontFamily: 'inherit',
            backgroundColor: 'transparent', border: 'none', outline: 'none',
            boxSizing: 'border-box', color: 'var(--input-text)',
            position: 'relative', zIndex: 2, resize: multiline ? 'vertical' : 'none',
            cursor: finalDisabled ? 'default' : (onClick ? 'pointer' : 'text'), borderRadius: 'var(--radius-md)',
            height: multiline ? 'auto' : 'var(--box-height)',
            ...(inputProps?.style || {})
          }}
        />

        <Box sx={{ position: 'absolute', right: '14px', zIndex: 3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {error && typeof helperText === 'string' && helperText.length > 0 && (
            <CustomTooltip title={helperText} placement="top" arrow PopperProps={{ sx: { zIndex: 9999 } }}>
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', pointerEvents: 'auto' }}>
                <ErrorOutlineIcon sx={{ color: 'var(--color-error)', fontSize: 20 }} />
              </Box>
            </CustomTooltip>
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
            transition: 'border-color var(--transition-base), border-width var(--transition-base)',
            zIndex: 1, boxSizing: 'border-box',
            ...maskStyles,
          }}
        >
          <legend
            ref={legendRef}
            style={{
              width: 'auto', maxWidth: (isFloating && label) ? '100%' : '0.01px',
              padding: 0, margin: 0, float: 'none', display: 'block',
              height: '11px', fontSize: 'var(--font-xs)', opacity: 0,
              whiteSpace: 'nowrap', overflow: 'hidden',
              transition: 'max-width 50ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
            }}
          >
            <span style={{ padding: label ? '0 4px' : 0, display: 'inline-block' }}>{label}{required && <span className="required-asterisk"> *</span>}</span>
          </legend>
        </fieldset>
      </Box>

      <label
        style={{
          position: 'absolute', left: '12px',
          top: isFloating ? '-9px' : (multiline ? '12px' : '50%'),
          transform: isFloating ? 'translateY(0)' : (multiline ? 'translateY(0)' : 'translateY(-50%)'),
          fontSize: isFloating ? '12px' : '15px',
          color: error ? 'var(--color-error)' : focused ? 'var(--color-primary)' : finalDisabled ? 'var(--input-label)' : 'var(--input-label)',
          backgroundColor: 'transparent', padding: '2px 4px',
          transition: 'all var(--transition-base)', pointerEvents: 'none', zIndex: 3,
          lineHeight: isFloating ? '14px' : 'var(--line-height-base)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 'calc(100% - 24px)',
        }}
      >
        {label}{required && <span className="required-asterisk"> *</span>}
      </label>

    </Box>
  );
});

const BaseCustomFloatingPhoneInput = ({ defaultBorderWidth = '1px', focusedBorderWidth = '1px', label, countryCode, onCountryCodeChange, value, onChange, error = false, disabled = false, updateRequested = false, helperText = '', required = false, endAdornment }) => {
  const isFormLoading = useFormLoading();
  const finalDisabled = disabled || isFormLoading;

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
    return sortLocationsByDistance(gazetteer.Countries, lat, lon, 'countries');
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

  let borderColor = 'var(--card-border)';
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

  const countryOptions = sortedCountries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phoneCode && c.phoneCode.includes(searchQuery))
  );

  // find selected country to show flag in input
  const selectedCountryObj = sortedCountries.find(c => c.phoneCode === (countryCode || '+91'));

  return (
    <Box
      ref={containerRef}
      sx={{ position: 'relative', width: 'var(--size-full)', opacity: finalDisabled ? 0.6 : 1, pointerEvents: finalDisabled ? 'none' : 'auto' }}
    >
      <Box sx={{ position: 'relative', width: 'var(--size-full)', '--bw': focused ? focusedBorderWidth : defaultBorderWidth }}>
        <Box sx={{
          position: 'absolute', top: (focused ? focusedBorderWidth : defaultBorderWidth), left: (focused ? focusedBorderWidth : defaultBorderWidth), right: (focused ? focusedBorderWidth : defaultBorderWidth), bottom: (focused ? focusedBorderWidth : defaultBorderWidth),
          backgroundColor: finalDisabled ? 'var(--input-disabled-bg)' : 'var(--input-bg)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: 'var(--radius-md)', zIndex: 0,
          ...maskStyles,
          transition: 'mask-size 0.05s ease-in-out',
        }} />


        <Box sx={{ display: 'flex', width: 'var(--size-full)', position: 'relative', zIndex: 2, height: 'var(--box-height)', alignItems: 'center' }}>
          <Box
            onClick={() => {
              if (!finalDisabled) {
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
              color: 'var(--input-text)',
              cursor: finalDisabled ? 'default' : 'pointer',
              borderRadius: '8px 0 0 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {selectedCountryObj && <img src={selectedCountryObj.flagUrl || `https://flagcdn.com/${selectedCountryObj.code?.toLowerCase() || 'in'}.svg`} alt="" style={{ width: '20px', height: '15px', objectFit: 'cover', flexShrink: 0 }} />}
            <div style={{ whiteSpace: 'nowrap', color: 'var(--input-text)' }}>{countryCode || '+91'}</div>
            <svg
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform var(--transition-base), color var(--transition-base)',
                color: (focused || isOpen) ? 'var(--color-primary)' : 'var(--input-label)',
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
            disabled={finalDisabled}
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
              color: 'var(--input-text)',
              cursor: finalDisabled ? 'default' : 'text',
              borderRadius: '0 8px 8px 0',
              paddingRight: endAdornment ? '80px' : '14px',
              minWidth: 0
            }}
          />

          <Box sx={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {error && typeof helperText === 'string' && helperText.length > 0 && (
              <CustomTooltip title={helperText} placement="top" arrow PopperProps={{ sx: { zIndex: 9999 } }}>
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', pointerEvents: 'auto' }}>
                  <ErrorOutlineIcon sx={{ color: 'var(--color-error)', fontSize: 20 }} />
                </Box>
              </CustomTooltip>
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
            transition: 'border-color var(--transition-base), border-width var(--transition-base)',
            zIndex: 1, boxSizing: 'border-box',
            ...maskStyles,
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
            <span style={{ padding: '0 4px', display: 'inline-block' }}>{label}{required && <span className="required-asterisk"> *</span>}</span>
          </legend>
        </fieldset>
      </Box>

      <label
        style={{
          position: 'absolute', left: isFloating ? '12px' : '110px',
          top: isFloating ? '-9px' : '50%',
          transform: isFloating ? 'translateY(0)' : 'translateY(-50%)',
          fontSize: isFloating ? '12px' : '15px',
          color: error ? 'var(--color-error)' : (focused || isOpen) ? 'var(--color-primary)' : finalDisabled ? 'var(--input-label)' : 'var(--input-label)',
          backgroundColor: 'transparent', padding: '2px 4px',
          transition: 'all var(--transition-base)', pointerEvents: 'none', zIndex: 3,
          lineHeight: isFloating ? '14px' : 'var(--line-height-base)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: isFloating ? 'calc(100% - 24px)' : 'calc(100% - 124px)',
        }}
      >
        {label}{required && <span className="required-asterisk"> *</span>}
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

const BaseCustomFloatingDatePicker = ({ defaultBorderWidth = '1px', focusedBorderWidth = '1px', label, value, onChange, error, helperText, disabled, updateRequested = false, disableFuture = false, minYear, maxYear, required = false, placement = 'bottom' }) => {
  const isFormLoading = useFormLoading();
  const finalDisabled = disabled || isFormLoading;

  const dateValue = value ? dayjs(value) : null;
  const currentYearNum = new Date().getFullYear();
  const maxYearNum = maxYear !== undefined ? maxYear : (disableFuture ? currentYearNum : currentYearNum + 19);
  const minYearNum = minYear !== undefined ? minYear : currentYearNum - 100;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DesktopDatePicker
        label={label}
        showToolbar
        toolbarFormat="DD MMMM YYYY"
        format="DD/MM/YYYY"
        value={dateValue}
        disabled={finalDisabled}
        disableFuture={disableFuture}
        minDate={dayjs(`${minYearNum}-01-01`)}
        maxDate={dayjs(`${maxYearNum}-12-31`)}
        slots={{ textField: BaseCustomFloatingInput }}
        slotProps={{
          ...globalDatePickerSlotProps,
          textField: {
            defaultBorderWidth,
            focusedBorderWidth,
            error,
            helperText,
            updateRequested,
            disabled: finalDisabled,
            required,
          }
        }}
        sx={{ width: 'var(--size-full)' }}
        onChange={(newDate) => {
          if (!newDate || !newDate.isValid()) {
            onChange({ target: { value: '' } });
            return;
          }
          const formattedDate = newDate.format('YYYY-MM-DD');
          onChange({ target: { value: formattedDate } });
        }}
      />
    </LocalizationProvider>
  );
};

const BaseCustomFloatingCountrySelect = ({ returnNationality = false, defaultBorderWidth = '1px', focusedBorderWidth = '1px', label, value, onChange, error, helperText, disabled, required = false, updateRequested = false }) => {
  const { userLocation } = useAccessibility();

  const sortedCountries = React.useMemo(() => {
    const lat = userLocation?.lat || 20.5937;
    const lon = userLocation?.lon || 78.9629;
    return sortLocationsByDistance(gazetteer.Countries, lat, lon, 'countries');
  }, [userLocation]);

  const options = React.useMemo(() => {
    return sortedCountries.map(c => ({
      value: returnNationality ? (c.nationality || c.name) : c.name,
      label: returnNationality ? (c.nationality || c.name) : c.name,
      flagUrl: c.flagUrl,
      searchStr: (c.nationality || c.name).toLowerCase() + ' ' + c.name.toLowerCase() + ' ' + (c.phoneCode || '')
    }));
  }, [sortedCountries, returnNationality]);

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
      required={required}
    />
  );
};

const BaseCustomFloatingFileInput = React.forwardRef(({ defaultBorderWidth = '1px', focusedBorderWidth = '1px', label, error = false, helperText = '', disabled = false, updateRequested = false, required = false, onChange, customDisplayText, savedValue, fullWidth = false, uploading = false, success = false, ...rest }, ref) => {
  const isFormLoading = useFormLoading();
  const finalDisabled = disabled || isFormLoading;

  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [legendWidth, setLegendWidth] = React.useState(0);
  const [notchL, setNotchL] = React.useState(11);
  const [notchT, setNotchT] = React.useState(7);
  const legendRef = React.useRef(null);
  const fieldsetRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  const getDisplayFilename = () => {
    if (customDisplayText) return customDisplayText;
    if (savedValue) {
      if (typeof savedValue === 'string') {
        if (savedValue.includes('/')) {
          try {
            return decodeURIComponent(savedValue.split('/').pop().split('?')[0]) || "दस्तावेज़ संलग्न है";
          } catch (e) {
            return "दस्तावेज़ संलग्न है";
          }
        }
        // If it's a UUID (from Viewer service) and metadata hasn't loaded yet, hide it
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(savedValue)) {
          return "दस्तावेज़ संलग्न है";
        }
        return savedValue;
      } else if (typeof savedValue === 'object' && savedValue.name) {
        return savedValue.name;
      }
      return "दस्तावेज़ संलग्न है";
    }
    return "";
  };

  const displayText = getDisplayFilename();
  // Float if focused or if a file is selected
  const isFloating = focused || Boolean(displayText);

  React.useLayoutEffect(() => {
    if (legendRef.current && fieldsetRef.current) {
      const bw = parseFloat(getComputedStyle(fieldsetRef.current).borderLeftWidth) || 1;
      const pl = parseFloat(getComputedStyle(fieldsetRef.current).paddingLeft) || 12;
      setNotchL(pl - bw);
      setNotchT(Math.ceil(legendRef.current.offsetHeight / 2));
      setLegendWidth(legendRef.current.scrollWidth);
    }
  }, [label]);

  let borderColor = 'var(--card-border)';
  if (error) borderColor = 'var(--color-error)';
  else if (updateRequested) borderColor = 'var(--color-warning)';
  else if (focused) borderColor = 'var(--color-primary)';
  else if (hovered) borderColor = 'rgba(30, 79, 163, 0.4)';

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

  return (
    <Box
      ref={ref}
      sx={{ position: 'relative', width: 'var(--size-full)', minWidth: 0, '--bw': focused ? focusedBorderWidth : defaultBorderWidth, opacity: finalDisabled ? 0.6 : 1, pointerEvents: finalDisabled ? 'none' : 'auto' }}
    >
      <Box
        sx={{ position: 'relative', width: 'var(--size-full)', minWidth: 0, display: 'flex', alignItems: 'center', cursor: finalDisabled ? 'default' : 'pointer' }}
        onClick={() => {
          if (!finalDisabled && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
      >
        <Box sx={{
          position: 'absolute', top: (focused ? focusedBorderWidth : defaultBorderWidth), left: (focused ? focusedBorderWidth : defaultBorderWidth), right: (focused ? focusedBorderWidth : defaultBorderWidth), bottom: (focused ? focusedBorderWidth : defaultBorderWidth),
          backgroundColor: finalDisabled ? 'var(--input-disabled-bg)' : 'var(--input-bg)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: 'var(--radius-md)', zIndex: 0,
          ...maskStyles,
        }} />

        <input
          type="file"
          ref={fileInputRef}
          onChange={onChange}
          disabled={finalDisabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
            ...(rest.style || {})
          }}
        />

        <Box sx={{
          width: 'var(--size-full)',
          paddingTop: '10px', paddingBottom: '10px',
          paddingLeft: '14px', paddingRight: '14px',
          fontSize: 'var(--font-sm)',
          display: 'flex',
          alignItems: 'center',
          height: 'var(--box-height)',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
          minWidth: 0,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', minWidth: 0 }}>
            <Box sx={{
              fontSize: 'var(--font-sm)',
              color: displayText ? 'var(--color-slate-900)' : 'var(--color-slate-500)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
              mr: 1,
              minWidth: 0,
            }}>
              {displayText}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 12 }}>
              {displayText && !finalDisabled && !uploading && (
                <CloseIcon
                  sx={{ color: 'var(--color-slate-500)', fontSize: 18, mr: 1, cursor: 'pointer', '&:hover': { color: 'var(--color-danger)' } }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    if (onChange) onChange({ target: { files: [] } });
                  }}
                />
              )}
              {uploading ? (
                <CircularProgress size={16} thickness={5} sx={{ color: 'var(--color-primary)' }} />
              ) : success ? (
                <CheckCircleIcon sx={{ color: 'var(--color-success)', fontSize: 20 }} />
              ) : (
                <CloudUploadIcon sx={{ color: 'var(--color-primary)', fontSize: 20 }} />
              )}
            </Box>
          </Box>
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
            transition: 'border-color var(--transition-base), border-width var(--transition-base)',
            zIndex: 1, boxSizing: 'border-box',
            ...maskStyles,
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
            <span style={{ padding: '0 4px', display: 'inline-block' }}>{label}{required && <span className="required-asterisk"> *</span>}</span>
          </legend>
        </fieldset>
      </Box>

      <label
        style={{
          position: 'absolute', left: '12px',
          top: isFloating ? '-9px' : '50%',
          transform: isFloating ? 'translateY(0)' : 'translateY(-50%)',
          fontSize: isFloating ? '12px' : '15px',
          color: error ? 'var(--color-error)' : focused ? 'var(--color-primary)' : disabled ? 'var(--input-label)' : 'var(--input-label)',
          backgroundColor: 'transparent', padding: '2px 4px',
          transition: 'all var(--transition-base)', pointerEvents: 'none', zIndex: 3,
          lineHeight: isFloating ? '14px' : 'var(--line-height-base)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: isFloating ? 'calc(100% - 24px)' : 'calc(100% - 44px)',
        }}
      >
        {label}{required && <span className="required-asterisk"> *</span>}
      </label>

      {helperText && (
        <CustomTooltip title={helperText} placement="top" arrow PopperProps={{ sx: { zIndex: 9999 } }}>
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
            <ErrorOutlineIcon sx={{ fontSize: '18px', color: error ? 'var(--color-error)' : 'var(--color-slate-500)' }} />
          </Box>
        </CustomTooltip>
      )}
    </Box>
  );
});

export const CustomFloatingSearchableSelect = ({ defaultBorderWidth = '1px', focusedBorderWidth = '1px', label, value, onChange, options = [], error, helperText, disabled, freeSolo = false, multiple = false, required = false }) => {
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
      required={required}
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

export { 
  WrappedCustomFloatingInput as CustomFloatingInput,
  WrappedCustomFloatingInput as FloatingInput,
  WrappedCustomFloatingSelect as CustomFloatingSelect,
  WrappedCustomFloatingSelect as FloatingSelect,
  WrappedCustomFloatingPhoneInput as CustomFloatingPhoneInput,
  WrappedCustomFloatingPhoneInput as FloatingPhoneInput,
  WrappedCustomFloatingDatePicker as CustomFloatingDatePicker,
  WrappedCustomFloatingDatePicker as FloatingDatePicker,
  WrappedCustomFloatingCountrySelect as CustomFloatingCountrySelect,
  WrappedCustomFloatingCountrySelect as FloatingCountrySelect,
  WrappedCustomFloatingFileInput as CustomFloatingFileInput,
  WrappedCustomFloatingFileInput as FloatingFileInput,
};

export const FloatingSearchableSelect = CustomFloatingSearchableSelect;

export const CustomFloatingViewerUpload = React.forwardRef(({ onUploadStart, onUploadComplete, onUploadError, onChange, savedValue, uploadFunction, ...props }, ref) => {
  const { showToast } = useToast();
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [localFileName, setLocalFileName] = React.useState("");

  React.useEffect(() => {
    if (savedValue && !localFileName && typeof savedValue === 'string' && !savedValue.includes('/')) {
      const fetchFileName = async () => {
        try {
          const { apiClient } = await import('../../lib/apiClient');
          const res = await apiClient.get(`/viewer/${savedValue}/metadata`);
          if (res.data) {
            const data = res.data;
            if (data.metadata && data.metadata.original_filename) {
              setLocalFileName(data.metadata.original_filename);
            }
          }
        } catch (e) {
          // Silent fallback
        }
      };
      fetchFileName();
    }
  }, [savedValue, localFileName]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLocalFileName(file.name);
    } else {
      setLocalFileName("");
    }
    if (onChange) onChange(e);

    if (!file) {
      if (onUploadComplete) onUploadComplete("");
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      if (onUploadStart) onUploadStart(file);

      const result = uploadFunction
        ? await uploadFunction(file, (pct) => setProgress(pct))
        : await uploadDocument(file, (pct) => setProgress(pct));

      if (onUploadComplete) onUploadComplete(result, file);
    } catch (error) {
      console.error("DEBUG UPLOAD ERROR:", error);
      if (onUploadError) onUploadError(error);
      else showToast(`Failed to upload document: ${error.message || error}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', minWidth: 0 }}>
      <WrappedCustomFloatingFileInput
        {...props}
        error={props.error}
        helperText={props.helperText}
        onChange={handleFileChange}
        disabled={props.disabled || uploading}
        ref={ref}
        savedValue={savedValue}
        customDisplayText={localFileName || undefined}
        uploading={uploading}
        success={!uploading && Boolean(savedValue)}
      />
    </Box>
  );
});
CustomFloatingViewerUpload.displayName = "CustomFloatingViewerUpload";

export const CustomFloatingMinIOUpload = React.forwardRef(({ onUploadStart, onUploadComplete, onUploadError, onChange, savedValue, profile, type = 'document', fieldName, ...props }, ref) => {
  const { showToast } = useToast();
  const [uploading, setUploading] = React.useState(false);
  const [localFileName, setLocalFileName] = React.useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      setLocalFileName(file.name);
    } else {
      setLocalFileName("");
    }

    if (onChange) onChange(e);

    if (!file) {
      if (onUploadComplete) onUploadComplete("");
      return;
    }

    try {
      setUploading(true);
      if (onUploadStart) onUploadStart(file);

      const { uploadToMinIO } = await import('../../utils/uploadUtils');
      const oldURL = savedValue;
      const url = await uploadToMinIO(
        file,
        profile,
        type,
        fieldName || props.name || 'document',
        typeof oldURL === 'string' && oldURL.startsWith('http') ? oldURL : null
      );

      // Append a timestamp query param to force React to see a "new" URL if the base URL is identical
      const uniqueUrl = url.includes('?') ? `${url}&_t=${Date.now()}` : `${url}?_t=${Date.now()}`;
      setLocalFileName(""); // Clear so the URL-extracted backend name (aalok_field_timestamp) is shown
      if (onUploadComplete) onUploadComplete(uniqueUrl, file);
    } catch (error) {
      console.error("MinIO Upload Error:", error);
      if (onUploadError) onUploadError(error);
      else showToast(`Upload failed: ${error.message || error}`);
    } finally {
      setUploading(false);
    }
  };

  if (props.variant === 'box') {
    return (
      <Box sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        border: props.error ? '2px solid var(--color-error)' : (savedValue ? 'none' : '2px dashed rgba(30, 79, 163, 0.3)'),
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: savedValue ? 'transparent' : 'var(--glass-bg)',
        backdropFilter: savedValue ? 'none' : 'blur(30px)',
        cursor: (props.disabled || uploading) ? 'default' : 'pointer',
        overflow: 'hidden',
        transition: savedValue ? 'none' : 'border-color 0.2s, background-color 0.2s',
        '&:hover': {
          borderColor: (!props.disabled && !uploading && !savedValue) ? 'var(--color-primary)' : undefined,
          bgcolor: (!props.disabled && !uploading && !savedValue) ? 'rgba(30, 79, 163, 0.02)' : undefined,
        }
      }}
        onClick={() => {
          if (!props.disabled && !uploading && ref?.current) {
            ref.current.click();
          } else if (!props.disabled && !uploading && document.getElementById(props.id || fieldName)) {
            document.getElementById(props.id || fieldName).click();
          }
        }}>
        {uploading ? (
          <>
            <CircularProgress size={32} sx={{ color: 'var(--color-primary)', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">Uploading...</Typography>
          </>
        ) : savedValue ? (
          <>
            {type === 'video' ? (
              <Box
                component="video"
                src={savedValue}
                controls
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  '&::-webkit-media-controls-enclosure': {
                    backgroundColor: 'transparent !important',
                    background: 'transparent !important',
                  },
                  '&::-webkit-media-controls-panel': {
                    backgroundColor: 'transparent !important',
                    background: 'transparent !important',
                    backgroundImage: 'none !important',
                    boxShadow: 'none !important'
                  },
                  '&::-webkit-media-controls-overlay-play-button': {
                    backgroundColor: 'transparent !important',
                    background: 'transparent !important',
                  }
                }}
              />
            ) : ['profile', 'banner', 'thumbnail', 'image'].includes(type) ? (
              <Box
                component="img"
                src={savedValue}
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'var(--color-success)', mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', px: 2, wordBreak: 'break-all' }}>
                  {localFileName || 'File uploaded successfully'}
                </Typography>
              </Box>
            )}

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (!props.disabled && !uploading && ref?.current) {
                  ref.current.click();
                } else if (!props.disabled && !uploading && document.getElementById(props.id || fieldName)) {
                  document.getElementById(props.id || fieldName).click();
                }
              }}
              sx={{
                position: 'absolute', top: 8, right: 8, zIndex: 45,
                bgcolor: 'var(--glass-bg)', color: 'var(--color-primary)',
                boxShadow: 'var(--shadow-sm)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                '&:hover': { bgcolor: 'var(--glass-bg)', transform: 'scale(1.05)' }
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 40, color: 'var(--color-slate-400)', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {props.label || 'Click to Upload'}
            </Typography>
            {props.helperText && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {props.helperText}
              </Typography>
            )}
          </>
        )}
        <input
          id={props.id || fieldName}
          type="file"
          hidden
          ref={ref}
          accept={props.accept}
          onChange={handleFileChange}
          disabled={props.disabled || uploading}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', minWidth: 0 }}>
      <WrappedCustomFloatingFileInput
        {...props}
        error={props.error}
        helperText={props.helperText}
        onChange={handleFileChange}
        disabled={props.disabled || uploading}
        ref={ref}
        savedValue={savedValue}
        uploading={uploading}
        success={!uploading && Boolean(savedValue)}
        customDisplayText={localFileName || undefined}
      />
    </Box>
  );
});
CustomFloatingMinIOUpload.displayName = "CustomFloatingMinIOUpload";

export const FloatingViewerUpload = CustomFloatingViewerUpload;
export const FloatingMinIOUpload = CustomFloatingMinIOUpload;
