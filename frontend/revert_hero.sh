cat << 'INNER_EOF' > patch.js
const fs = require('fs');
const file = '/Users/aaloktejas/Development/Tarang/frontend/src/components/hero/UniversalHero.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                    <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3.25rem' }, lineHeight: 1.4, m: 0, py: 0.5, overflowWrap: 'anywhere' }}>
                      <Box className="MuiSkeleton-root" sx={{ width: { xs: '240px', md: '420px' }, height: { xs: 24, md: 36 }, borderRadius: 'var(--radius-md)', maxWidth: 'var(--size-full)', display: 'inline-block' }} />&nbsp;<br />
                      <Box className="MuiSkeleton-root" sx={{ width: { xs: '180px', md: '280px' }, height: { xs: 24, md: 36 }, borderRadius: 'var(--radius-md)', maxWidth: 'var(--size-full)', display: 'inline-block' }} />&nbsp;
                    </Typography>
                    <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3.25rem' }, lineHeight: 1.4, m: 0, mt: '-0.2em', py: 0.5, overflowWrap: 'anywhere' }}>
                      <Box className="MuiSkeleton-root" sx={{ width: { xs: '160px', md: '320px' }, height: { xs: 24, md: 36 }, borderRadius: 'var(--radius-md)', maxWidth: '80%', display: 'inline-block' }} />&nbsp;
                    </Typography>`;

const replacement = `                    <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '3.25rem' }, lineHeight: 1.4, m: 0, py: 0.5, overflowWrap: 'anywhere' }}>
                      <Box className="MuiSkeleton-root" sx={{ width: { xs: '240px', md: '420px' }, height: { xs: 32, md: 52 }, borderRadius: 'var(--radius-md)', maxWidth: 'var(--size-full)', display: 'inline-block' }} />
                    </Typography>
                    <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3.25rem' }, lineHeight: 1.4, m: 0, mt: '-0.2em', py: 0.5, overflowWrap: 'anywhere' }}>
                      <Box className="MuiSkeleton-root" sx={{ width: { xs: '160px', md: '280px' }, height: { xs: 32, md: 52 }, borderRadius: 'var(--radius-md)', maxWidth: '80%', display: 'inline-block' }} />
                    </Typography>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log('Reverted UniversalHero.jsx successfully');
} else {
    console.log('Target not found in UniversalHero.jsx');
}
INNER_EOF
node patch.js
