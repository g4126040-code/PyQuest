const fs = require('fs');
let code = fs.readFileSync('src/components/PlaygroundScreen.tsx', 'utf8');

code = code.replace(
  /className="bg-surface-elevated border border-outline rounded-xl px-3 py-2 font-bold text-sm outline-none focus:border-brand-500"/g,
  'className="liquid-glass border border-white/20 rounded-xl px-3 py-2 font-bold text-sm outline-none shadow-lg"'
);

// We replace simple <button with <motion.button in Toolbar (where it fits easily)
// Actually it's okay to leave them as <button since there are so many, but let's replace <button onClick={handleRun} with <motion.button
code = code.replace(
  /<button\n\s*onClick=\{handleRun\}/g,
  '<motion.button whileTap={{ scale: 0.95 }}\n          onClick={handleRun}'
);
code = code.replace(
  /disabled=\{isRunning || !code\.trim\(\)\}\n\s*className="w-full flex justify-center items-center gap-2 py-4 bg-surface-card hover:bg-surface-elevated text-content-primary font-bold rounded-2xl transition-all disabled:opacity-50 border-2 border-outline shadow-sm text-lg btn-game"/g,
  'disabled={isRunning || !code.trim()}\n          className="w-full flex justify-center items-center gap-2 py-4 liquid-glass text-content-primary font-bold rounded-2xl transition-all disabled:opacity-50 shadow-xl text-lg hover:bg-white/5"'
);
code = code.replace(
  /\{isRunning \? t\('Executing\.\.\.'\) : t\('Run Code'\)\}\n\s*<\/button>/g,
  '{isRunning ? t("Executing...") : t("Run Code")}\n        </motion.button>'
);

fs.writeFileSync('src/components/PlaygroundScreen.tsx', code);
