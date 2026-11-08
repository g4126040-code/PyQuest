const fs = require('fs');
let code = fs.readFileSync('src/components/ChallengeView.tsx', 'utf8');

code = code.replace(
  /<div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950\/50 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold border border-emerald-200 dark:border-emerald-800">\n\s*<span>\+50 XP<\/span>\n\s*<\/div>/,
  '<motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.4 }} className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold border border-emerald-200 dark:border-emerald-800 shadow-sm">\n                      <span>+50 XP</span>\n                    </motion.div>'
);

code = code.replace(
  /<div className="flex items-center gap-2 bg-sky-100 dark:bg-sky-950\/50 text-sky-700 dark:text-sky-400 px-4 py-2 rounded-xl font-bold border border-sky-200 dark:border-sky-800">\n\s*<span>\+20 Coins 🪙<\/span>\n\s*<\/div>/,
  '<motion.div initial={{ scale: 0, rotate: 10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.5 }} className="flex items-center gap-2 bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 px-4 py-2 rounded-xl font-bold border border-sky-200 dark:border-sky-800 shadow-sm">\n                      <span>+20 Coins 🪙</span>\n                    </motion.div>'
);

fs.writeFileSync('src/components/ChallengeView.tsx', code);
