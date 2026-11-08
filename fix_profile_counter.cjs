const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf8');

// Add import
code = code.replace(
  /import \{ useLanguage \} from '\.\.\/contexts\/LanguageContext';/,
  "import { useLanguage } from '../contexts/LanguageContext';\nimport AnimatedCounter from './AnimatedCounter';"
);

// Replace displays
code = code.replace(
  /<div className="text-xl font-black">\{displayXp\}<\/div>/,
  '<AnimatedCounter value={displayXp} className="text-xl font-black" />'
);

code = code.replace(
  /<div className="text-xl font-black">\{displayCoins\}<\/div>/,
  '<AnimatedCounter value={displayCoins} className="text-xl font-black" />'
);

code = code.replace(
  /<div className="text-xl font-black">\{displayStreak\}<\/div>/,
  '<AnimatedCounter value={displayStreak} className="text-xl font-black" />'
);

code = code.replace(
  /<div className="text-xl font-black">\{completedIds.length\}<\/div>/,
  '<AnimatedCounter value={completedIds.length} className="text-xl font-black" />'
);

fs.writeFileSync('src/components/ProfileScreen.tsx', code);
