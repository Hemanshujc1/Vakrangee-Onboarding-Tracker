const fs = require('fs');
const glob = require('glob'); // Not using glob, just fs.readdirSync

const files = fs.readdirSync('.').filter(f => f.startsWith('useForm') && f.endsWith('.js'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Remove standalone comments: lines that only contain whitespace followed by //
  content = content.replace(/^\s*\/\/.*$/gm, '');

  // Remove 'user,' from useOnboardingForm destructuring
  content = content.replace(/\s*user,\n?/g, '\n');

  // Remove 'useRef,' from react import if it is there
  // Not blindly replacing, let's just do user and common schemas
  content = content.replace(/\bcommonSchemas,\s*/g, '');

  // Remove multiple blank lines created by comment removal
  content = content.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Cleaned ${file}`);
});
