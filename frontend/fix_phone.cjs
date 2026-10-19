const fs = require('fs');

const file = '/Users/aaloktejas/Development/Tarang/frontend/src/components/common/CustomFloatingFields.jsx';
let content = fs.readFileSync(file, 'utf8');

// We will replace the entire inner flex container of BaseCustomFloatingPhoneInput
const startTag = "<Box sx={{ display: 'flex', width: 'var(--size-full)', position: 'relative', zIndex: 2, height: 'var(--box-height)' }}>";
const endTag = "          {endAdornment && (";

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = `
        <Box sx={{ display: 'flex', width: 'var(--size-full)', position: 'relative', zIndex: 2, height: 'var(--box-height)', alignItems: 'center' }}>
          <Box
            onClick={() => {
              if (!disabled) {
                setIsOpen(!isOpen);
                setFocused(true);
              }
            }}
            style={{
              padding: '0 10px 0 14px',
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
            <span style={{ fontWeight: 'var(--font-semibold)', whiteSpace: 'nowrap' }}>{countryCode || '+91'}</span>
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
              padding: '0 14px', 
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

`;

  const finalStr = content.substring(0, startIndex) + newContent + content.substring(endIndex);
  fs.writeFileSync(file, finalStr);
  console.log('Successfully replaced inner structure');
} else {
  console.log('Could not find start or end tags');
}
