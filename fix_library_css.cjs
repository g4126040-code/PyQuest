const fs = require('fs');
let code = fs.readFileSync('src/components/LibraryScreen.tsx', 'utf8');

code = code.replace(
  /className="premium-glass-panel overflow-hidden border border-outline"/g,
  'className="liquid-glass overflow-hidden rounded-3xl"'
);

code = code.replace(
  /className="w-full flex items-center justify-between p-4 bg-surface-elevated\/50 hover:bg-surface-elevated transition-colors"/g,
  'className="w-full flex items-center justify-between p-5 hover:bg-white/5 dark:hover:bg-white/5 transition-colors"'
);

fs.writeFileSync('src/components/LibraryScreen.tsx', code);
