const fs = require('fs');
let code = fs.readFileSync('src/components/ChallengeView.tsx', 'utf8');

code = code.replace(
  /<button\n\s*onClick=\{onComplete\}\n\s*className="w-full flex justify-center items-center gap-3 py-5 bg-brand-500\/90 hover:bg-brand-400 text-white font-black rounded-2xl transition-all text-lg btn-game"\n\s*>/g,
  '<motion.button whileTap={{ scale: 0.95 }}\n                  onClick={onComplete}\n                  className="w-full flex justify-center items-center gap-3 py-5 bg-brand-500/90 hover:bg-brand-400 text-white font-black rounded-2xl transition-all text-lg btn-game shadow-xl"\n                >'
);
code = code.replace(
  /<\/button>\n\s*<\/motion\.div>/g,
  '</motion.button>\n              </motion.div>'
);

fs.writeFileSync('src/components/ChallengeView.tsx', code);
