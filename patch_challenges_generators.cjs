const fs = require('fs');
let code = fs.readFileSync('src/data/challenges.ts', 'utf8');

// We need to import the generator at the top:
code = `import { generateTrackContent } from './generators';\n` + code;

// Now we replace the big instruction and target code generation for tracks that aren't python or python_practice
code = code.replace(
  /let langMarkdown = track\.id === 'html' \?[\s\S]*?if \(level === 1 && track\.id !== 'python'\) \{[\s\S]*?expectedLogic = "The user must write the absolute basics for the language\.";\n    \}/,
  `
    let langMarkdown = track.id === 'html' ? 'html' : track.id === 'css' ? 'css' : track.id === 'js' ? 'javascript' : track.id === 'sql' ? 'sql' : track.id === 'c' || track.id === 'cpp' ? 'cpp' : track.id === 'java' ? 'java' : track.id === 'dart' || track.id === 'flutter' ? 'dart' : 'python';
    
    let instruction = "";
    let expectedLogic = "";
    let targetCode = "";
    let initialCode = "";
    
    if (['html', 'css', 'js', 'sql'].includes(track.id)) {
      const generated = generateTrackContent(track.id, level, concept, track.name);
      title = generated.title;
      instruction = generated.instruction;
      expectedLogic = generated.expectedLogic;
      targetCode = generated.targetCode;
      initialCode = generated.initialCode;
      
      // We still override if there's a specific project in languageProjects
      if (level % 5 === 0 && languageProjects[track.id as keyof typeof languageProjects]?.[level.toString() as keyof (typeof languageProjects)[keyof typeof languageProjects]]) {
        const proj = languageProjects[track.id as keyof typeof languageProjects][level.toString() as keyof (typeof languageProjects)[keyof typeof languageProjects]];
        title = proj.title;
        instruction = \`Time for a project!\\n\\n\${proj.desc}\\n\\n### Task\\nApply everything you've learned to complete this project.\`;
      }
    } else {
      // Fallback for others (C, C++, Java, etc.)
      instruction = track.id === 'python_practice' && pythonPractice[level + 20] 
        ? pythonPractice[level + 20].instruction 
        : \`Welcome to Level \${level} of \${track.name}!\\n\\nIn this level, we are focusing on **\${concept}**.\\n\\n### Explanation\\n\${concept} is a fundamental part of \${track.name}. By mastering this, you will get one step closer to building your Final Project!\\n\\n### Example\\n\\\`\\\`\\\`\${langMarkdown}\\n// Example of \${concept}\\n\\\`\\\`\\\`\\n\\n### Task\\nWrite a complete and correct implementation using \${concept}. Use the code editor below to complete the task.\`;
        
      if (level % 5 === 0 && (!projects[level] || track.id !== 'python')) {
        title = \`Challenge Level: \${concept}\`;
        instruction = \`Time for a challenge!\\n\\nApply what you've learned about **\${concept}**.\\n\\n### Task\\nWrite a complete program using \${concept}.\`;
      }

      let commentChar = track.id === 'html' ? '<!--' : (['css', 'sql'].includes(track.id) ? '/*' : '#');
      if (['js', 'c', 'cpp', 'java', 'dart', 'flutter'].includes(track.id)) commentChar = '//';
      let commentEnd = ['html'].includes(track.id) ? ' -->' : (['css', 'sql'].includes(track.id) ? ' */' : '');
      
      targetCode = track.id === 'python' ? generatePythonTargetCode(level) : \`\${commentChar} Target code for \${concept} in \${track.name}\${commentEnd}\`;
      expectedLogic = track.id === 'python_practice' && pythonPractice[level + 20] ? pythonPractice[level + 20].expectedLogic 
        : track.id === 'python' ? targetCode : \`The user should write code related to \${concept} in \${track.name}.\`;
      initialCode = track.id === 'python_practice' && pythonPractice[level + 20]
        ? \`# Type your code here\\n\`
        : \`\${commentChar} Type your code here for \${concept}\${commentEnd}\\n\`;

      if (level === 1 && track.id !== 'python') {
          title = "Say Hello!";
          instruction = \`Welcome to CodeQuest! Let's write your first \${track.name} code.\\n\\n### Task\\nFollow the comments to complete your first task!\`;
          expectedLogic = "The user must write the absolute basics for the language.";
      }
    }
  `
);

fs.writeFileSync('src/data/challenges.ts', code);
