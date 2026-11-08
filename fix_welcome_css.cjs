const fs = require('fs');
let code = fs.readFileSync('src/components/WelcomeScreen.tsx', 'utf8');

code = code.replace(
  /className="max-w-md w-full premium-glass-panel p-8 text-center relative overflow-hidden transform-gpu"/g,
  'className="max-w-md w-full liquid-glass rounded-3xl p-8 text-center relative overflow-hidden transform-gpu shadow-2xl"'
);

fs.writeFileSync('src/components/WelcomeScreen.tsx', code);
