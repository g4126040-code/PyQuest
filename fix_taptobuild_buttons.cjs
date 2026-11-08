const fs = require('fs');
let code = fs.readFileSync('src/components/TapToBuildExercise.tsx', 'utf8');

const oldSection = `<div className="flex items-center justify-between">
            <h3 className="font-bold text-content-secondary uppercase tracking-wider text-sm">Your Code</h3>
            <div className="flex gap-2">
              <button 
                onClick={handleUndo} 
                disabled={answerItems.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-surface-card hover:bg-surface-main disabled:opacity-50 border border-outline rounded-lg transition-colors text-content-secondary"
              >
                <Undo2 className="w-3.5 h-3.5" /> Undo
              </button>
              <button 
                onClick={handleClear}
                disabled={answerItems.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold liquid-glass hover:bg-white/10 disabled:opacity-50 rounded-lg transition-colors text-content-secondary shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </motion.button>
            </div>
          </div>`;

const newSection = `<div className="flex items-center justify-between">
            <h3 className="font-bold text-content-secondary uppercase tracking-wider text-sm">Your Code</h3>
            <div className="flex gap-2">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleUndo} 
                disabled={answerItems.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold liquid-glass hover:bg-white/10 disabled:opacity-50 rounded-lg transition-colors text-content-secondary shadow-sm"
              >
                <Undo2 className="w-3.5 h-3.5" /> Undo
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                disabled={answerItems.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold liquid-glass hover:bg-white/10 disabled:opacity-50 rounded-lg transition-colors text-content-secondary shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </motion.button>
            </div>
          </div>`;

code = code.replace(oldSection, newSection);
fs.writeFileSync('src/components/TapToBuildExercise.tsx', code);
