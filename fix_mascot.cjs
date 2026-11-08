const fs = require('fs');
let code = fs.readFileSync('src/components/Mascot.tsx', 'utf8');

code = code.replace(
  /className="bg-brand-500 text-white px-4 py-3 rounded-2xl rounded-br-none shadow-xl max-w-\[200px\]"/,
  'className="bg-brand-500/90 backdrop-blur-xl border border-white/20 text-white px-5 py-3.5 rounded-3xl rounded-br-none shadow-2xl max-w-[200px] text-center"'
);

code = code.replace(
  /className="w-14 h-14 bg-surface-card border-\[3px\] border-brand-500 rounded-full flex items-center justify-center text-3xl shadow-xl overflow-hidden relative"/,
  'className="w-16 h-16 liquid-glass border-[3px] border-brand-400 rounded-full flex items-center justify-center text-3xl shadow-2xl overflow-hidden relative"'
);

fs.writeFileSync('src/components/Mascot.tsx', code);
