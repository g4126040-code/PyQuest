const fs = require('fs');
let code = fs.readFileSync('src/data/generators.ts', 'utf8');

code = code.replace(
  /let targetCode = "";\n  let expectedLogic = "";\n  let initialCode = "";/,
  'let title = "";\n  let instruction = "";\n  let targetCode = "";\n  let expectedLogic = "";\n  let initialCode = "";'
);

fs.writeFileSync('src/data/generators.ts', code);
