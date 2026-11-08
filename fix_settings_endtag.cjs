const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsScreen.tsx', 'utf8');

code = code.replace(
  /<\/div>\n\s*\}\)\}\n\s*<\/div>/,
  '</motion.div>\n              ))}\n            </div>'
);

fs.writeFileSync('src/components/SettingsScreen.tsx', code);
