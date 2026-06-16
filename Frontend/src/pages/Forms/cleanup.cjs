const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.startsWith('useForm') && f.endsWith('.js'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Remove standalone comments (lines that start with optional whitespace and //)
  // We'll preserve things like // eslint-disable... just in case
  content = content.replace(/^\s*\/\/(?!\s*eslint).*$/gm, '');

  // Remove 'user' destructured var
  content = content.replace(/\buser,\s*\n?/g, '');

  // Remove 'commonSchemas' destructured var
  content = content.replace(/\bcommonSchemas,\s*\n?/g, '');

  // Remove 'useRef' from imports if unused. Actually, let's let eslint fix do it.

  // Remove multiple blank lines created by comment removal
  content = content.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Cleaned ${file}`);
});
