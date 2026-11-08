const fs = require('fs');
let code = fs.readFileSync('src/components/BottomNav.tsx', 'utf8');

code = code.replace(
  /className="fixed bottom-0 left-0 right-0 z-40 bg-surface-card\/80 backdrop-blur-xl border-t border-outline pb-safe transform-gpu overflow-x-auto no-scrollbar scroll-smooth"/,
  'className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:min-w-[500px] sm:max-w-2xl sm:mx-auto z-40 liquid-glass rounded-3xl pb-safe transform-gpu overflow-x-auto no-scrollbar scroll-smooth shadow-2xl"'
);

// Enhance active state styling slightly
code = code.replace(
  /className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative \${isActive \? 'text-brand-500 scale-105' : 'text-content-muted hover:text-content-primary hover:scale-105'}`}/,
  'className={`flex flex-col items-center gap-1 p-2 px-3 sm:px-4 rounded-xl transition-colors relative ${isActive ? "text-brand-500" : "text-content-muted hover:text-content-primary"}`}\n              whileTap={{ scale: 0.92 }}'
);

// Replace button with motion.button
code = code.replace(/<button/g, '<motion.button');
code = code.replace(/<\/button>/g, '</motion.button>');

code = code.replace(
  /className="absolute inset-0 bg-brand-500\/10 rounded-xl"/,
  'className="absolute inset-0 bg-brand-500/15 rounded-2xl"'
);

fs.writeFileSync('src/components/BottomNav.tsx', code);
