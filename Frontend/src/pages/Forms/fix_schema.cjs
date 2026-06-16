const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.startsWith('useForm') && f.endsWith('.js'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace `(schema) =>` with `() =>`
  content = content.replace(/\(schema\)\s*=>/g, '() =>');

  // Replace unused `useRef` import 
  content = content.replace(/\buseRef,\s*/g, '');
  
  // Replace unused `useState` import
  content = content.replace(/\buseState,\s*/g, '');

  // Replace unused `setIsPreviewMode` assignment
  content = content.replace(/\bsetIsPreviewMode,\s*\n?/g, '');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Cleaned ${file}`);
});
