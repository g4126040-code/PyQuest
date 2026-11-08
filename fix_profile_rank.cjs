const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf8');

code = code.replace(
  /<div className="inline-flex items-center gap-1\.5 px-3 py-1 bg-surface-elevated border border-outline rounded-lg text-sm font-bold text-content-secondary z-10">\n\s*<Trophy className="w-4 h-4 text-amber-500" \/>\n\s*\{t\(rankName\)\} \{t\('Rank'\)\}\n\s*<\/div>/,
  `<AnimatePresence mode="wait">
          <motion.div 
            key={rankName}
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 liquid-glass border border-amber-500/30 rounded-xl text-sm font-black text-amber-500 z-10 shadow-lg"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            {t(rankName)} {t('Rank')}
          </motion.div>
        </AnimatePresence>`
);

fs.writeFileSync('src/components/ProfileScreen.tsx', code);
