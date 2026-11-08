const fs = require('fs');
let code = fs.readFileSync('src/components/TapToBuildExercise.tsx', 'utf8');

code = code.replace(
  /whileTap=\{\{ scale: 0\.95 \}\}\n\s*whileTap=\{\{ scale: item\.id === errorId \? 1 : 0\.95 \}\}/g,
  'whileTap={{ scale: item.id === errorId ? 1 : 0.95 }}'
);

fs.writeFileSync('src/components/TapToBuildExercise.tsx', code);
