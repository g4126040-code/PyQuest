const fs = require('fs');
let code = fs.readFileSync('src/contexts/ProgressContext.tsx', 'utf8');

code = code.replace(
  /return newState;\n    \}\);\n  \};\n\n  const resetTestMode/g,
  `localStorage.setItem('codequest_app_progress', JSON.stringify(newState));
      return newState;
    });
  };

  const resetTestMode`
);

fs.writeFileSync('src/contexts/ProgressContext.tsx', code);
