const fs = require('fs');
let code = fs.readFileSync('src/data/generators.ts', 'utf8');

const replacement = `
  let title = \`Level \${level}: \${concept}\`;
  let instruction = \`Welcome to Level \${level}!\\n\\nIn this level, we are focusing on **\${concept}**.\\n\\n### Task\\nComplete the task for \${concept}.\`;
`;

code = code.replace(
  /let title = "";\n  let instruction = "";/,
  replacement
);

fs.writeFileSync('src/data/generators.ts', code);
