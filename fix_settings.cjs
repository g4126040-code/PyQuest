const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsScreen.tsx', 'utf8');
code = code.replace(
  /contextActivateTestMode\(\);\n\s*window\.location\.reload\(\);/g,
  'contextActivateTestMode();\n    setTimeout(() => window.location.reload(), 100);'
);
code = code.replace(
  /contextResetTestMode\(\);\n\s*window\.location\.reload\(\);/g,
  'contextResetTestMode();\n    setTimeout(() => window.location.reload(), 100);'
);
fs.writeFileSync('src/components/SettingsScreen.tsx', code);
