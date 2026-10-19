const fs = require('fs');
const file = 'frontend/src/features/profile/Profile.jsx';
let content = fs.readFileSync(file, 'utf8');

const sidebarStart = content.indexOf('{/* Profile Card */}');
const sidebarEnd = content.indexOf('{/* Navigation Tabs */}');

const sidebarCode = content.substring(sidebarStart, sidebarEnd - 30); // Grab the cards

const functionCode = `
  const renderSidebarCards = () => (
    <>
      ${sidebarCode.trim().split('\n').join('\n      ')}
    </>
  );
`;

const insertPos = content.indexOf('if (loading || !profile) {');
content = content.substring(0, insertPos) + functionCode + '\n  ' + content.substring(insertPos);

const newSidebarCode = `
      {/* LEFT SIDEBAR — independently scrollable */}
      <Box sx={{
        width: { xs: '100%', sm: 360, md: 400 },
        flexShrink: 0,
        overflowY: "auto",
        height: "100%",
        display: { xs: 'none', sm: 'block' },
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        pt: { xs: 4, md: 6 }, // Match other pages responsive padding
        pr: { sm: 2, md: 3 }, // Right padding only, outer container handles px
      }}>
        <Box ref={sidebarRef} sx={{ width: "var(--size-full)", pb: 4 }}>
          {renderSidebarCards()}
        </Box>
      </Box>
`;

const leftSidebarStart = content.indexOf('{/* LEFT SIDEBAR — independently scrollable */}');
const leftSidebarEnd = content.indexOf('{/* RIGHT MAIN CONTENT — independently scrollable */}');
content = content.substring(0, leftSidebarStart) + newSidebarCode.trim() + '\n\n      ' + content.substring(leftSidebarEnd);

const mobileStart = content.indexOf('{/* Mobile: show sidebar cards inline */}');
const mobileEnd = content.indexOf('<Grid container spacing={4} sx={{ mt: 1 }}>');

const newMobileCode = `
          {/* Mobile: show sidebar cards inline */}
          <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 3 }}>
            {renderSidebarCards()}
          </Box>
`;

content = content.substring(0, mobileStart) + newMobileCode.trim() + '\n\n          ' + content.substring(mobileEnd);

fs.writeFileSync(file, content);
