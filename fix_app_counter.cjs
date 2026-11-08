const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<span className="text-sm">\{completedIds\.length \* 50\}<\/span>/,
  '<AnimatedCounter value={completedIds.length * 50} className="text-sm" />'
);

fs.writeFileSync('src/App.tsx', code);
