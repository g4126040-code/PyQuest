const fs = require('fs');
let code = fs.readFileSync('src/components/TapToBuildExercise.tsx', 'utf8');

// Undo button
code = code.replace(
  /<button\n\s*onClick=\{handleUndo\}\n\s*disabled=\{answerItems\.length === 0\}\n\s*className="flex items-center gap-1\.5 px-3 py-1\.5 text-xs font-bold bg-surface-card hover:bg-surface-main disabled:opacity-50 border border-outline rounded-lg transition-colors text-content-secondary"\n\s*>/g,
  '<motion.button\n                whileTap={{ scale: 0.9 }}\n                onClick={handleUndo}\n                disabled={answerItems.length === 0}\n                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold liquid-glass hover:bg-white/10 disabled:opacity-50 rounded-lg transition-colors text-content-secondary shadow-sm"\n              >'
);
code = code.replace(
  /<\/button>\n\s*<button\n\s*onClick=\{handleClear\}/,
  '</motion.button>\n              <motion.button\n                whileTap={{ scale: 0.9 }}\n                onClick={handleClear}'
);
code = code.replace(
  /disabled=\{answerItems\.length === 0\}\n\s*className="flex items-center gap-1\.5 px-3 py-1\.5 text-xs font-bold bg-surface-card hover:bg-surface-main disabled:opacity-50 border border-outline rounded-lg transition-colors text-content-secondary"\n\s*>\n\s*<RotateCcw className="w-3\.5 h-3\.5" \/> Clear\n\s*<\/button>/,
  'disabled={answerItems.length === 0}\n                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold liquid-glass hover:bg-white/10 disabled:opacity-50 rounded-lg transition-colors text-content-secondary shadow-sm"\n              >\n                <RotateCcw className="w-3.5 h-3.5" /> Clear\n              </motion.button>'
);

// Answer area
code = code.replace(
  /className="min-h-\[140px\] w-full bg-surface-main\/50 border-2 border-dashed border-outline rounded-3xl p-6 flex flex-wrap gap-y-3 items-start content-start"/,
  'className="min-h-[140px] w-full bg-surface-main/30 border-2 border-dashed border-white/20 rounded-3xl p-6 flex flex-wrap gap-y-3 items-start content-start shadow-inner"'
);

// Pool area
code = code.replace(
  /className="min-h-\[140px\] w-full bg-surface-elevated border-2 border-outline rounded-3xl p-6 flex flex-wrap gap-3 items-start content-start"/,
  'className="min-h-[140px] w-full liquid-glass rounded-3xl p-6 flex flex-wrap gap-3 items-start content-start shadow-xl"'
);

// Add whileTap to Pool blocks
code = code.replace(
  /whileHover=\{\{ scale: item\.id === errorId \? 1 : 1\.05 \}\}/g,
  'whileHover={{ scale: item.id === errorId ? 1 : 1.05 }}\n                  whileTap={{ scale: 0.95 }}'
);

// Add whileTap to Answer blocks
code = code.replace(
  /animate=\{\{ \n\s*scale: 1, \n\s*opacity: 1,\n\s*x: item\.id === errorId \? \[0, -5, 5, -5, 5, 0\] : 0 \n\s*\}\}/g,
  'animate={{ \n                          scale: 1, \n                          opacity: 1,\n                          x: item.id === errorId ? [0, -5, 5, -5, 5, 0] : 0 \n                        }}\n                        whileTap={{ scale: 0.95 }}'
);

fs.writeFileSync('src/components/TapToBuildExercise.tsx', code);
