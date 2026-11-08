const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  /<\/button>\n\s*<\/motion\.div>/g,
  '</motion.button>\n                    </motion.div>'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
