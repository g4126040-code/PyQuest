const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /className="h-16 sticky top-0 z-50 flex items-center px-4 bg-surface-card\/70 backdrop-blur-xl border-b border-white\/20 dark:border-white\/10 shadow-sm"/,
  'className="h-16 sticky top-0 z-50 flex items-center px-4 liquid-glass shadow-sm"'
);

fs.writeFileSync('src/App.tsx', code);
