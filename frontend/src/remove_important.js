const fs = require('fs');
const { execSync } = require('child_process');

function processFile(filePath, limitLines = false) {
    let content = fs.readFileSync(filePath, 'utf-8');
    if (limitLines) {
        let lines = content.split('\n');
        for (let i = 0; i < Math.min(600, lines.length); i++) {
            lines[i] = lines[i].replace(/\s*/gi, '');
        }
        content = lines.join('\n');
    } else {
        content = content.replace(/\s*/gi, '');
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Processed: ${filePath}`);
}

try {
    const result = execSync('grep -rl -i "" . --include="*.js" --include="*.jsx" --include="*.css"', { encoding: 'utf-8' });
    const files = result.trim().split('\n').filter(f => !f.includes('node_modules') && !f.includes('.next'));
    
    files.forEach(file => {
        if (file.endsWith('globals.css')) {
            processFile(file, true);
        } else {
            processFile(file, false);
        }
    });
    console.log("Done!");
} catch (e) {
    console.error("Error:", e.message);
}
