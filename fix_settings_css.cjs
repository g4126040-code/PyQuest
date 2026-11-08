const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsScreen.tsx', 'utf8');

code = code.replace(
  /className="bg-surface-card border border-outline rounded-3xl overflow-hidden shadow-soft"/g,
  'className="liquid-glass rounded-3xl overflow-hidden shadow-xl"'
);

// Add motion to list items
code = code.replace(
  /<div \n\s*key=\{item\.id\}/g,
  '<motion.div whileTap={item.type === "link" || item.onClick ? { scale: 0.98 } : {}} \n                        key={item.id}'
);
code = code.replace(
  /<\/div>\n\s*\}\)\}\n\s*<\/div>/g,
  '</motion.div>\n                      ))}\n                    </div>'
);

fs.writeFileSync('src/components/SettingsScreen.tsx', code);
