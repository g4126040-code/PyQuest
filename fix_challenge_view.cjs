const fs = require('fs');
let code = fs.readFileSync('src/components/ChallengeView.tsx', 'utf8');

code = code.replace(
  /<div className="flex flex-col lg:flex-row w-full flex-grow bg-surface-main overflow-hidden">/,
  '<motion.div layoutId={`challenge-${challenge.id}`} className="flex flex-col lg:flex-row w-full flex-grow liquid-glass overflow-hidden rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl">'
);

code = code.replace(
  /<\/div>\n      <CodeViewerModal/g,
  '</motion.div>\n      <CodeViewerModal'
);

// We should also replace the inner left panel to have no background to inherit the glass
code = code.replace(
  /className="w-full lg:w-5\/12 flex flex-col border-b lg:border-b-0 lg:border-r border-outline bg-surface-elevated overflow-y-auto"/,
  'className="w-full lg:w-5/12 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto"'
);

// And the right panel
code = code.replace(
  /className="w-full lg:w-7\/12 flex flex-col p-4 md:p-6 bg-surface-main gap-4 md:gap-6 lg:h-\[calc\(100vh-64px\)\] overflow-hidden"/,
  'className="w-full lg:w-7/12 flex flex-col p-4 md:p-6 gap-4 md:gap-6 lg:h-[calc(100vh-64px)] overflow-hidden"'
);

fs.writeFileSync('src/components/ChallengeView.tsx', code);
