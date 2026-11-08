const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf8');

code = code.replace(
  /className="premium-glass-panel p-8 flex flex-col items-center relative overflow-hidden"/g,
  'className="liquid-glass p-8 flex flex-col items-center relative overflow-hidden rounded-[2.5rem] shadow-xl"'
);

code = code.replace(
  /className=\{`relative overflow-hidden premium-glass-panel p-4 flex flex-col gap-3 transition-all duration-300 \$\{/g,
  'className={`relative overflow-hidden liquid-glass rounded-3xl p-4 flex flex-col gap-3 transition-all duration-300 ${'
);

code = code.replace(
  /className="grid grid-cols-2 gap-4"/,
  'className="grid grid-cols-2 gap-4"'
);

fs.writeFileSync('src/components/ProfileScreen.tsx', code);
