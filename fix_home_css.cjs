const fs = require('fs');
let code = fs.readFileSync('src/components/HomeScreen.tsx', 'utf8');

code = code.replace(
  /className="premium-glass-panel p-8 text-center relative overflow-hidden"/g,
  'className="liquid-glass rounded-3xl p-8 text-center relative overflow-hidden shadow-xl"'
);

code = code.replace(
  /className="text-center p-8 text-content-muted font-bold premium-glass-panel"/g,
  'className="text-center p-8 text-content-muted font-bold liquid-glass rounded-3xl"'
);

code = code.replace(
  /className=\{`premium-glass-panel p-4 flex items-center gap-4 \$\{isCurrentUser \? 'ring-2 ring-brand-500 bg-brand-500\/5' : ''\}`\}/g,
  'className={`liquid-glass rounded-3xl p-4 flex items-center gap-4 transition-transform hover:scale-[1.01] ${isCurrentUser ? "ring-2 ring-brand-500 bg-brand-500/10 shadow-lg" : ""}`}'
);

fs.writeFileSync('src/components/HomeScreen.tsx', code);
