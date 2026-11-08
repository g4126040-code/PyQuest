const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /className="min-h-screen bg-surface-main mesh-bg text-content-primary selection:bg-brand-500\/30 font-sans transition-colors duration-300"/,
  'className="min-h-screen bg-surface-main mesh-bg text-content-primary selection:bg-brand-500/30 font-sans transition-colors duration-300 smooth-scroll"'
);

// We need to add an initial launch animation for the main wrapper.
code = code.replace(
  /<div className="min-h-screen bg-surface-main mesh-bg text-content-primary selection:bg-brand-500\/30 font-sans transition-colors duration-300 smooth-scroll">/g,
  `<motion.div 
      initial={{ opacity: 0, filter: 'blur(20px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-surface-main mesh-bg text-content-primary selection:bg-brand-500/30 font-sans transition-colors duration-300 smooth-scroll"
    >`
);

code = code.replace(
  /<\/div>\n  \);\n\}\n$/,
  `</motion.div>\n  );\n}\n`
);

fs.writeFileSync('src/App.tsx', code);
