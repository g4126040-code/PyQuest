const fs = require('fs');

function replaceInFile(filepath, target, replacement) {
  let code = fs.readFileSync(filepath, 'utf8');
  code = code.replace(target, replacement);
  fs.writeFileSync(filepath, code);
}

replaceInFile(
  'src/components/SettingsScreen.tsx',
  /className="premium-glass-panel flex flex-col overflow-hidden"/g,
  'className="liquid-glass rounded-3xl flex flex-col overflow-hidden shadow-xl"'
);

replaceInFile(
  'src/components/SettingsScreen.tsx',
  /className="premium-glass-panel flex flex-col overflow-hidden border-rose-500\/30 bg-rose-500\/5"/g,
  'className="liquid-glass rounded-3xl flex flex-col overflow-hidden border border-rose-500/30 bg-rose-500/10 shadow-xl"'
);

replaceInFile(
  'src/components/Dashboard.tsx',
  /className="w-full flex flex-col items-center premium-glass-panel p-3 sm:p-4 mb-8 sticky top-4 z-50 transition-all transform-gpu"/g,
  'className="w-full flex flex-col items-center liquid-glass rounded-3xl p-3 sm:p-4 mb-8 sticky top-4 z-50 transition-all transform-gpu shadow-xl"'
);

replaceInFile(
  'src/components/Dashboard.tsx',
  /className="absolute -bottom-10 sm:-bottom-12 right-0 opacity-0 group-hover:opacity-100 transition-opacity premium-glass-panel !rounded-xl text-content-primary px-3 sm:px-4 py-1\.5 sm:py-2 text-xs sm:text-sm font-bold whitespace-nowrap pointer-events-none z-20"/g,
  'className="absolute -bottom-10 sm:-bottom-12 right-0 opacity-0 group-hover:opacity-100 transition-opacity liquid-glass !rounded-xl text-content-primary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold whitespace-nowrap pointer-events-none z-20 shadow-lg"'
);

replaceInFile(
  'src/components/Dashboard.tsx',
  /className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity premium-glass-panel !rounded-2xl text-content-primary px-5 py-3 text-sm font-bold whitespace-nowrap pointer-events-none z-20"/g,
  'className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity liquid-glass !rounded-2xl text-content-primary px-5 py-3 text-sm font-bold whitespace-nowrap pointer-events-none z-20 shadow-lg"'
);

replaceInFile(
  'src/components/Dashboard.tsx',
  /className="premium-glass-panel !rounded-\[1\.4rem\] p-10 text-center relative overflow-hidden"/g,
  'className="liquid-glass !rounded-[2.5rem] p-10 text-center relative overflow-hidden shadow-xl"'
);

replaceInFile(
  'src/components/TapToBuildExercise.tsx',
  /className="flex flex-col h-full premium-glass-panel p-6 shadow-sm relative"/g,
  'className="flex flex-col h-full liquid-glass rounded-3xl p-6 shadow-xl relative"'
);

