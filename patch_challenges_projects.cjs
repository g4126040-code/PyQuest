const fs = require('fs');
let code = fs.readFileSync('src/data/challenges.ts', 'utf8');

// Replace the duplicate project override we accidentally added inside challenges.ts:
code = code.replace(
  /\/\/ We still override if there's a specific project in languageProjects[\s\S]*?\}\n    \} else \{/g,
  `} else {`
);

fs.writeFileSync('src/data/challenges.ts', code);
