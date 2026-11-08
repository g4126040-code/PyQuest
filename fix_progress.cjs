const fs = require('fs');
let code = fs.readFileSync('src/contexts/ProgressContext.tsx', 'utf8');
code = code.replace(
  /newState\.currentLanguage = nextTrackId;/g,
  '// newState.currentLanguage = nextTrackId; // Removed to keep user pinned to active track'
);
fs.writeFileSync('src/contexts/ProgressContext.tsx', code);
