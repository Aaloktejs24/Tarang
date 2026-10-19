const fs = require('fs');
const path = require('path');

const srcDir = '/Users/aaloktejas/Development/Tarang/frontend/src/features/auth';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace imports
  if (content.includes('from "./utils/authErrors"')) {
    content = content.replace(/import\s+{\s*translateError\s*}\s+from\s+"(?:.\/)?utils\/authErrors";/, 'import { translateAuthError, AUTH_ERRORS } from "../../constants/errors";');
    changed = true;
  }
  if (content.includes('from "../utils/authErrors"')) {
    content = content.replace(/import\s+{\s*translateError\s*}\s+from\s+"\.\.\/utils\/authErrors";/, 'import { translateAuthError, AUTH_ERRORS } from "../../../constants/errors";');
    changed = true;
  }

  // Replace function calls
  if (content.includes('translateError(')) {
    content = content.replaceAll('translateError(', 'translateAuthError(');
    changed = true;
  }

  // Replace hardcoded strings
  const replacements = {
    '"लॉगिन विफल रहा"': 'AUTH_ERRORS.GENERIC.LOGIN_FAILED',
    '"OTP भेजने में विफल"': 'AUTH_ERRORS.GENERIC.OTP_SEND_FAILED',
    '"पंजीकरण सत्र समाप्त हो गया है। कृपया पुनः लॉगिन करें।"': 'AUTH_ERRORS.GENERIC.SESSION_EXPIRED',
    '"अमान्य OTP"': 'AUTH_ERRORS.GENERIC.INVALID_OTP',
    '"2FA सेटअप शुरू करने में विफल"': 'AUTH_ERRORS.GENERIC.TFA_SETUP_FAILED',
    '"ईमेल OTP सक्षम करने में विफल"': 'AUTH_ERRORS.GENERIC.EMAIL_OTP_ENABLE_FAILED',
    '"अमान्य वेरिफिकेशन कोड"': 'AUTH_ERRORS.GENERIC.INVALID_VERIFICATION_CODE',
    '"रजिस्ट्रेशन पूरा करने में विफल"': 'AUTH_ERRORS.GENERIC.REGISTRATION_FAILED',
    "'An error occurred during biometric verification'": 'AUTH_ERRORS.GENERIC.BIOMETRIC_FAILED'
  };

  for (const [search, replace] of Object.entries(replacements)) {
    if (content.includes(search)) {
      content = content.replaceAll(search, replace);
      changed = true;
      
      // Ensure AUTH_ERRORS is imported if not already
      if (!content.includes('AUTH_ERRORS')) {
        const importPath = filePath.includes('/components/') ? '"../../../constants/errors"' : '"../../constants/errors"';
        content = `import { AUTH_ERRORS } from ${importPath};\n` + content;
      }
    }
  }

  // Validation strings
  if (content.includes('"ईमेल आवश्यक है"') || content.includes('"कृपया एक मान्य ईमेल पता डालें"')) {
    content = content.replaceAll('"ईमेल आवश्यक है"', 'VALIDATION_ERRORS.EMAIL_REQUIRED');
    content = content.replaceAll('"कृपया एक मान्य ईमेल पता डालें"', 'VALIDATION_ERRORS.INVALID_EMAIL');
    changed = true;
    
    if (!content.includes('VALIDATION_ERRORS')) {
       const importPath = filePath.includes('/components/') ? '"../../../constants/errors"' : '"../../constants/errors"';
       content = `import { VALIDATION_ERRORS } from ${importPath};\n` + content;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Updated:', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walk(srcDir);
