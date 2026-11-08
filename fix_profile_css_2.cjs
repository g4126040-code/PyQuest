const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf8');

code = code.replace(
  /className="premium-glass-panel p-4 flex flex-col items-center justify-center text-center gap-2"/g,
  'className="liquid-glass rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:scale-[1.02] transition-transform"'
);

code = code.replace(
  /className="premium-glass-panel p-4 h-64 w-full"/g,
  'className="liquid-glass rounded-3xl p-4 h-64 w-full"'
);

fs.writeFileSync('src/components/ProfileScreen.tsx', code);
