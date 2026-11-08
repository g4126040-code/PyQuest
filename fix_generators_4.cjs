const fs = require('fs');
let code = fs.readFileSync('src/data/generators.ts', 'utf8');

const replacement = `
  let title = \`Level \${level}: \${concept}\`;
  let instruction = \`Welcome to Level \${level}!\\n\\nIn this level, we are focusing on **\${concept}**.\\n\\n### Task\\nComplete the task for \${concept}.\`;
  let targetCode = "";
  let expectedLogic = "";
  let initialCode = "";
  
  let commentChar = trackId === 'html' ? '<!--' : (['css', 'sql'].includes(trackId) ? '/*' : '#');
  if (['js', 'c', 'cpp', 'java', 'dart', 'flutter', 'firebase', 'rest', 'gemini', 'fullstack'].includes(trackId)) commentChar = '//';
  let commentEnd = ['html'].includes(trackId) ? ' -->' : (['css', 'sql'].includes(trackId) ? ' */' : '');
  
  if (level <= 50) {
    targetCode = getFoundationTargetCode(trackId, level);
    expectedLogic = "The user must implement the correct foundation concept.";
    initialCode = \`\${commentChar} \${concept}\${commentEnd}\\n\`;
  } else {
    let langMarkdown = trackId === 'html' ? 'html' : trackId === 'css' ? 'css' : trackId === 'js' ? 'javascript' : trackId === 'sql' ? 'sql' : trackId === 'c' || trackId === 'cpp' ? 'cpp' : trackId === 'java' ? 'java' : trackId === 'dart' || trackId === 'flutter' ? 'dart' : 'python';
    instruction = \`Welcome to Chapter \${Math.ceil(level/5)} of \${trackName}!\\n\\nIn this level, we are focusing on **\${concept}**.\\n\\n### Explanation\\n\${concept} is a more advanced part of \${trackName}. From here on out, you will be writing the actual code yourself without blocks.\\n\\n### Example\\n\`\`\`\${langMarkdown}\\n\${commentChar} Example of \${concept}\${commentEnd}\\n\`\`\`\\n\\n### Task\\nWrite a complete and correct implementation using \${concept}. Use the code editor below to complete the task.\`;
    
    targetCode = \`\${commentChar} Target code for \${concept} in \${trackName}\${commentEnd}\\n\${commentChar} Advanced implementation\${commentEnd}\`;
    expectedLogic = \`The user must implement advanced logic for \${concept} in \${trackName}.\`;
    initialCode = \`\${commentChar} Type your code here for \${concept}\${commentEnd}\\n\`;
  }
`;

code = code.replace(
  /let title = `Level \${level}: \${concept}`;[\s\S]*?initialCode = "\/\/ " \+ concept \+ "\\n";\n  }/,
  replacement
);

fs.writeFileSync('src/data/generators.ts', code);
